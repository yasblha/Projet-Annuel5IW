# Checklist de Déploiement AquaERP

## Prérequis DigitalOcean

### ✅ Infrastructure
- [ ] Projet DigitalOcean créé (factu-2025)
- [ ] Équipe invitée avec rôles appropriés
- [ ] Registre DOCR créé (factu-reg)
- [ ] Cluster DOKS créé (3 nœuds, région fra1)
- [ ] Add-ons activés : Nginx Ingress + cert-manager
- [ ] Base de données PostgreSQL managée créée
- [ ] Domaine aquaerp.cloud configuré (A/AAAA vers LB)

### ✅ Sécurité
- [ ] Pare-feu configuré (ports 22, 80, 443)
- [ ] Certificats TLS automatiques (Let's Encrypt)
- [ ] Secrets Kubernetes créés (DB, JWT, etc.)
- [ ] Network Policies configurées

## Déploiement

### ✅ Images Docker
- [ ] Build de tous les services
- [ ] Push vers DOCR
- [ ] Images taggées correctement

### ✅ Kubernetes
- [ ] Manifests appliqués (`kubectl apply -f k8s/`)
- [ ] Namespace monitoring créé
- [ ] Prometheus/Grafana déployés
- [ ] Job d'init DB exécuté
- [ ] Tous les pods en état Running

### ✅ Services
- [ ] Services exposés correctement
- [ ] Ingress configuré (aquaerp.cloud)
- [ ] Health checks passent
- [ ] Certificats TLS valides

## CI/CD

### ✅ GitHub Actions
- [ ] Secrets configurés (DOCKER_USERNAME, DOCKER_PASSWORD, DIGITALOCEAN_ACCESS_TOKEN)
- [ ] Workflow testé
- [ ] Déploiement automatique fonctionnel

## Monitoring & Observabilité

### ✅ Métriques
- [ ] Prometheus collecte les métriques
- [ ] Grafana accessible
- [ ] Dashboards configurés
- [ ] Alertes configurées

### ✅ Logs
- [ ] Logs centralisés
- [ ] Retention configurée
- [ ] Logs accessibles

## Tests

### ✅ Fonctionnels
- [ ] Frontend accessible (https://aquaerp.cloud)
- [ ] API Gateway répond (/api/health)
- [ ] Authentification fonctionnelle
- [ ] Base de données connectée
- [ ] Emails envoyés (mailer service)

### ✅ Performance
- [ ] Temps de réponse < 2s
- [ ] Load testing effectué
- [ ] Auto-scaling testé

### ✅ Sécurité
- [ ] Scan de vulnérabilités
- [ ] Rate limiting actif
- [ ] Headers de sécurité configurés
- [ ] Secrets non exposés

## Sauvegarde

### ✅ Stratégie 3-2-1
- [ ] Snapshots PostgreSQL quotidiens
- [ ] Velero → DigitalOcean Spaces
- [ ] Réplication vers ams3
- [ ] Test de restauration effectué

## Documentation

### ✅ Documentation
- [ ] README.md à jour
- [ ] Architecture documentée
- [ ] Procédures de maintenance
- [ ] Contacts d'urgence

## Validation Finale

### ✅ Checklist finale
- [ ] Tous les services opérationnels
- [ ] Monitoring actif
- [ ] Sauvegardes fonctionnelles
- [ ] Équipe formée
- [ ] Tag v1.0.0 créé

---

## Commandes de vérification

```bash
# Vérifier l'état du cluster
kubectl get nodes
kubectl get pods -A

# Vérifier les services
kubectl get services
kubectl get ingress

# Vérifier les logs
kubectl logs -l app=auth-service

# Tester l'endpoint
curl -k https://aquaerp.cloud/api/health

# Vérifier les certificats
kubectl get certificates
```

## Contacts d'urgence

- **DevOps Lead** : [email]
- **DBA** : [email]
- **Lead Developer** : [email]
- **PO** : [email]

---

*Checklist générée automatiquement - À compléter avant chaque déploiement* 