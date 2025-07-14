# 🚀 Guide de Déploiement AquaERP sur Kubernetes

## 📋 Prérequis

### 1. Installation de k3s
```bash
# Sur le master
curl -sfL https://get.k3s.io | sh -

# Récupérer le token
sudo cat /var/lib/rancher/k3s/server/node-token

# Sur chaque worker
curl -sfL https://get.k3s.io | K3S_URL=https://master:6443 K3S_TOKEN=xxx sh -
```

### 2. Installation de kubectl
```bash
# Sur votre machine locale
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### 3. Configuration DNS
Ajouter dans `/etc/hosts` :
```
192.168.1.100 api.aquaerp.local
192.168.1.100 app.aquaerp.local
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (3 replicas)  │◄──►│   (2 replicas)  │◄──►│   (2 replicas)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   (1 replica)   │
                       └─────────────────┘
```

## 📦 Déploiement

### 1. Build des images Docker
```bash
# Build des services backend
docker build -t aquaerp/auth-service:latest services/auth-service/
docker build -t aquaerp/api-gateway:latest services/api-gateway/
docker build -t aquaerp/contract-service:latest services/contract-service/
docker build -t aquaerp/client-service:latest services/client-service/

# Build du frontend
docker build -t aquaerp/frontend:latest frontend/
```

### 2. Déploiement automatique
```bash
# Rendre le script exécutable
chmod +x scripts/deploy.sh

# Déployer
./scripts/deploy.sh
```

### 3. Déploiement manuel
```bash
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# Créer les secrets
kubectl apply -f k8s/secrets.yaml

# Déployer PostgreSQL
kubectl apply -f k8s/postgresql/

# Déployer les services
kubectl apply -f k8s/services/

# Déployer le frontend
kubectl apply -f k8s/frontend/

# Déployer l'ingress
kubectl apply -f k8s/ingress.yaml

# Déployer les bonus (optionnel)
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/hpa.yaml
```

## 🔍 Vérification

### 1. Statut des pods
```bash
kubectl get pods -n aquaerp
```

### 2. Statut des services
```bash
kubectl get services -n aquaerp
```

### 3. Statut de l'ingress
```bash
kubectl get ingress -n aquaerp
```

## 🧪 Tests de Haute Disponibilité

### 1. Test de scaling
```bash
# Scale up le frontend
kubectl scale deployment frontend --replicas=5 -n aquaerp

# Scale down
kubectl scale deployment frontend --replicas=3 -n aquaerp
```

### 2. Test de kill de pod
```bash
# Lister les pods
kubectl get pods -n aquaerp

# Tuer un pod (il sera recréé automatiquement)
kubectl delete pod <pod-name> -n aquaerp
```

### 3. Test de persistance
```bash
# Supprimer le pod PostgreSQL
kubectl delete pod -l app=postgres -n aquaerp

# Vérifier que les données sont conservées
kubectl exec -it <new-postgres-pod> -n aquaerp -- psql -U aquaerp -d aquaerp
```

## 🔒 Sécurité

### 1. Secrets
- Mots de passe PostgreSQL
- Clé JWT
- Certificats TLS

### 2. NetworkPolicies
- Restriction des communications entre services
- Isolation de la base de données

### 3. HTTPS
- Certificats Let's Encrypt
- Redirection automatique HTTP → HTTPS

## 📈 Monitoring

### 1. Métriques HPA
```bash
# Vérifier les HPA
kubectl get hpa -n aquaerp

# Détails d'un HPA
kubectl describe hpa api-gateway-hpa -n aquaerp
```

### 2. Logs
```bash
# Logs du frontend
kubectl logs -f deployment/frontend -n aquaerp

# Logs de l'API Gateway
kubectl logs -f deployment/api-gateway -n aquaerp
```

## 🛠️ Maintenance

### 1. Mise à jour d'un service
```bash
# Mettre à jour l'image
kubectl set image deployment/auth-service auth-service=aquaerp/auth-service:v2.0.0 -n aquaerp

# Vérifier le rollout
kubectl rollout status deployment/auth-service -n aquaerp
```

### 2. Rollback
```bash
# Rollback en cas de problème
kubectl rollout undo deployment/auth-service -n aquaerp
```

### 3. Sauvegarde
```bash
# Sauvegarde de la base de données
kubectl exec -it <postgres-pod> -n aquaerp -- pg_dump -U aquaerp aquaerp > backup.sql
```

## 🎯 Bonus Implémentés

### ✅ NetworkPolicy
- Restriction des communications réseau
- Isolation de la base de données

### ✅ HPA (Horizontal Pod Autoscaler)
- Autoscaling basé sur CPU et mémoire
- Scaling automatique selon la charge

### ✅ Resource Requests & Limits
- Limitation des ressources par pod
- QoS (Quality of Service) garantie

### ✅ Rolling Updates
- Déploiements progressifs
- Rollback automatique en cas d'échec

### ✅ Secrets & ConfigMaps
- Gestion sécurisée des secrets
- Configuration externalisée

## 📊 Métriques de Performance

- **Frontend** : 3 replicas minimum, jusqu'à 15
- **API Gateway** : 2 replicas minimum, jusqu'à 10
- **Services Backend** : 2 replicas minimum
- **PostgreSQL** : 1 replica (stateful)

## 🔗 URLs d'accès

- **Frontend** : https://app.aquaerp.local
- **API** : https://api.aquaerp.local
- **Documentation** : https://app.aquaerp.local/docs

## 📞 Support

En cas de problème :
1. Vérifier les logs : `kubectl logs -n aquaerp`
2. Vérifier les événements : `kubectl get events -n aquaerp`
3. Redémarrer un service : `kubectl rollout restart deployment/<service> -n aquaerp` 