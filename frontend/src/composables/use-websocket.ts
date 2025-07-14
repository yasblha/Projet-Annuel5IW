import { ref, onUnmounted, readonly } from 'vue'

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

export function useWebSocket() {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messageHandlers = ref<Map<string, Function[]>>(new Map())

  const connect = () => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      return
    }

    const wsHost = window.location.hostname
    const wsPort = import.meta.env.VITE_WS_PORT || '8080'
    const wsUrl = `ws://${wsHost}:${wsPort}/contrats`
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('WebSocket connecté')
      isConnected.value = true
    }

    socket.value.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        handleMessage(message)
      } catch (error) {
        console.error('Erreur parsing message WebSocket:', error)
      }
    }

    socket.value.onclose = () => {
      console.log('WebSocket déconnecté')
      isConnected.value = false
    }

    socket.value.onerror = (error) => {
      console.error('Erreur WebSocket:', error)
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  const send = (type: string, data: any) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      }
      socket.value.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket non connecté')
    }
  }

  const onMessage = (type: string, handler: Function) => {
    if (!messageHandlers.value.has(type)) {
      messageHandlers.value.set(type, [])
    }
    messageHandlers.value.get(type)!.push(handler)
  }

  const offMessage = (type: string, handler: Function) => {
    const handlers = messageHandlers.value.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  const handleMessage = (message: WebSocketMessage) => {
    const handlers = messageHandlers.value.get(message.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data)
        } catch (error) {
          console.error('Erreur handler WebSocket:', error)
        }
      })
    }
  }

  // Auto-reconnect logic
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const setupAutoReconnect = () => {
    if (socket.value) {
      socket.value.onclose = () => {
        console.log('WebSocket déconnecté')
        isConnected.value = false
        
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            console.log(`Tentative de reconnexion ${reconnectAttempts + 1}/${maxReconnectAttempts}`)
            reconnectAttempts++
            connect()
          }, reconnectDelay * reconnectAttempts)
        }
      }
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    send,
    onMessage,
    offMessage,
    setupAutoReconnect
  }
} 