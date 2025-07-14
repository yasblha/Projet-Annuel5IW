# Exemples de commandes pour les tests de haute disponibilité

Ce document fournit les commandes et leurs sorties attendues pour réaliser les captures d'écran démontrant la haute disponibilité de l'application AquaERP déployée sur Kubernetes.

## 1. Vérification des replicas

```bash
$ kubectl get deployments -n aquaerp
NAME                READY   UP-TO-DATE   AVAILABLE   AGE
api-gateway         2/2     2            2           3d5h
auth-service        2/2     2            2           3d5h
contrat-service     2/2     2            2           3d5h
facture-service     2/2     2            2           3d5h
frontend            3/3     3            3           3d5h
intervention-service 2/2    2            2           3d5h
mailer-service      2/2     2            2           3d5h
operation-service   2/2     2            2           3d5h
postgresql          1/1     1            1           3d5h
rabbitmq            1/1     1            1           3d5h
workflow-service    2/2     2            2           3d5h
```

## 2. Test de kill d'un pod (simulation de panne)

```bash
# Lister les pods
$ kubectl get pods -n aquaerp
NAME                                 READY   STATUS    RESTARTS   AGE
api-gateway-66f8d6b6c8-5thzn         1/1     Running   0          3h20m
api-gateway-66f8d6b6c8-qcpx7         1/1     Running   0          3h20m
auth-service-7cffc8bc4b-g5mwl        1/1     Running   0          3h20m
auth-service-7cffc8bc4b-xvj2s        1/1     Running   0          3h20m
contrat-service-5d857d9f96-2kxjg     1/1     Running   0          3h20m
contrat-service-5d857d9f96-m9xtp     1/1     Running   0          3h20m
facture-service-6d6b8c9f7-dnh5z      1/1     Running   0          3h20m
facture-service-6d6b8c9f7-w2f4q      1/1     Running   0          3h20m
frontend-75b5766867-6fghv            1/1     Running   0          3h20m
frontend-75b5766867-ddgsp            1/1     Running   0          3h20m
frontend-75b5766867-t6xm9            1/1     Running   0          3h20m
intervention-service-bc65d6f98-j87hm 1/1     Running   0          3h20m
intervention-service-bc65d6f98-r9k4f 1/1     Running   0          3h20m
mailer-service-5bd7f6b67d-gn8tp      1/1     Running   0          3h20m
mailer-service-5bd7f6b67d-hrpt5      1/1     Running   0          3h20m
operation-service-5679c9d655-2tdvc   1/1     Running   0          3h20m
operation-service-5679c9d655-zxcr9   1/1     Running   0          3h20m
postgresql-0                         1/1     Running   0          3h20m
rabbitmq-0                           1/1     Running   0          3h20m
workflow-service-66bc7c9d8c-npvkx    1/1     Running   0          3h20m
workflow-service-66bc7c9d8c-tn7gh    1/1     Running   0          3h20m

# Supprimer un pod auth-service
$ kubectl delete pod auth-service-7cffc8bc4b-g5mwl -n aquaerp
pod "auth-service-7cffc8bc4b-g5mwl" deleted

# Vérifier la recréation automatique
$ kubectl get pods -n aquaerp | grep auth-service
auth-service-7cffc8bc4b-xvj2s        1/1     Running   0          3h22m
auth-service-7cffc8bc4b-z8n3j        1/1     Running   0          14s
```

## 3. Test de scale up/down

```bash
# Scale up du service API Gateway de 2 à 5 replicas
$ kubectl scale deployment api-gateway --replicas=5 -n aquaerp
deployment.apps/api-gateway scaled

# Vérification
$ kubectl get pods -n aquaerp | grep api-gateway
api-gateway-66f8d6b6c8-5thzn         1/1     Running   0          3h25m
api-gateway-66f8d6b6c8-6xfp9         1/1     Running   0          15s
api-gateway-66f8d6b6c8-kp7vt         1/1     Running   0          15s
api-gateway-66f8d6b6c8-qcpx7         1/1     Running   0          3h25m
api-gateway-66f8d6b6c8-tf2zr         1/1     Running   0          15s

# Scale down du service API Gateway de 5 à 2 replicas
$ kubectl scale deployment api-gateway --replicas=2 -n aquaerp
deployment.apps/api-gateway scaled

# Vérification
$ kubectl get pods -n aquaerp | grep api-gateway
api-gateway-66f8d6b6c8-5thzn         1/1     Running   0          3h27m
api-gateway-66f8d6b6c8-qcpx7         1/1     Running   0          3h27m
```

## 4. Test de persistance des données

```bash
# Identifier le pod PostgreSQL
$ kubectl get pods -n aquaerp | grep postgresql
postgresql-0                         1/1     Running   0          3h30m

# Vérifier les données actuelles
$ kubectl exec -it postgresql-0 -n aquaerp -- psql -U postgres -d aquaerp -c "SELECT count(*) FROM users;"
 count 
-------
    12
(1 row)

# Supprimer le pod PostgreSQL
$ kubectl delete pod postgresql-0 -n aquaerp
pod "postgresql-0" deleted

# Vérifier que le pod est recréé
$ kubectl get pods -n aquaerp | grep postgresql
postgresql-0                         1/1     Running   0          35s

# Vérifier que les données ont persisté
$ kubectl exec -it postgresql-0 -n aquaerp -- psql -U postgres -d aquaerp -c "SELECT count(*) FROM users;"
 count 
-------
    12
(1 row)
```

## 5. Vérification du HPA (Autoscaling)

```bash
$ kubectl get hpa -n aquaerp
NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
api-gateway-hpa    Deployment/api-gateway        5%/80%    2         5         2          3d5h
frontend-hpa       Deployment/frontend           7%/80%    3         6         3          3d5h
```

## 6. Vérification des Network Policies

```bash
$ kubectl get networkpolicies -n aquaerp
NAME                        POD-SELECTOR           AGE
microservices-network-policy   app=api-gateway     3d5h
rabbitmq-network-policy        app=rabbitmq        3d5h
database-network-policy        app=postgresql      3d5h
```

## 7. Vérification de l'Ingress HTTPS

```bash
$ kubectl get ingress -n aquaerp
NAME            HOSTS               ADDRESS        PORTS     AGE
aquaerp-ingress aquaerp.cloud       192.168.1.10   80, 443   3d5h

$ curl -I https://aquaerp.cloud/api/health
HTTP/2 200 
date: Sat, 13 Jul 2025 14:30:45 GMT
content-type: application/json; charset=utf-8
content-length: 15
strict-transport-security: max-age=15724800; includeSubDomains
```

## 8. Vérification des Persistent Volumes

```bash
$ kubectl get pv,pvc -n aquaerp
NAME                                                        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                      STORAGECLASS   REASON   AGE
persistentvolume/pvc-e8dc5d7b-1518-413d-a4a9-b748c2a9c7f1   10Gi       RWO            Delete           Bound    aquaerp/postgresql-data   standard                3d5h

NAME                                  STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/postgresql-data   Bound    pvc-e8dc5d7b-1518-413d-a4a9-b748c2a9c7f1   10Gi       RWO            standard       3d5h
```
