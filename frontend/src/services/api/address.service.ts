import axios, { AxiosError, type AxiosResponse } from 'axios'

const BAN_BASE = 'https://api-adresse.data.gouv.fr'
const GEO_BASE = 'https://geo.api.gouv.fr'

// Axios instance with small timeout to fail fast
const http = axios.create({ timeout: 5000 })

type SearchResult = {
  features: Array<{
    geometry: { coordinates: [number, number] }
    properties: {
      label: string
      name: string
      city: string
      citycode: string
      postcode: string
      housenumber?: string
      id: string
    }
  }>
}

const normalize = (res: AxiosResponse<any>): SearchResult => res.data as SearchResult

export const addressApi = {
  /**
   * Auto-complétion BAN (fallback géoplateforme). Throttling doit être géré par appelant (debounce).
   */
  async search(query: string, limit = 8): Promise<SearchResult> {
    const params = { q: query, limit, autocomplete: 1, type: 'housenumber' }
    try {
      const res = await http.get(`${BAN_BASE}/search/`, { params })
      return normalize(res)
    } catch (err) {
      // Fallback : géoplateforme (structure équivalente)
      if (err instanceof AxiosError) {
        const res = await http.get('https://geocodage.geo.gouv.fr/search', { params })
        return normalize(res)
      }
      throw err
    }
  },

  /** Liste des communes pour un code postal (Geo API INSEE) */
  communesByCp(codePostal: string) {
    return http.get(`${GEO_BASE}/communes`, {
      params: {
        codePostal,
        fields: 'nom,code',
        format: 'json'
      }
    })
  }
}
