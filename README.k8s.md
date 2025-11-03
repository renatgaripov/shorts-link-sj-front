# Деплой в Kubernetes

## Предварительные требования

1. Kubernetes кластер (версия 1.24+)
2. kubectl настроен и подключен к кластеру
3. Docker registry для хранения образа приложения
4. Ingress Controller (nginx-ingress, traefik и т.д.)
5. StorageClass для PersistentVolumeClaims (для MongoDB)

## Порядок деплоя

### 1. Сборка Docker образа

```bash
# Сборка образа
docker build -t your-registry/clicker-app:latest .

# Push в registry
docker push your-registry/clicker-app:latest
```

### 2. Обновление манифестов

**Обязательно обновите:**
- `k8s/app-deployment.yaml` - измените `image` на ваш registry путь
- `k8s/ingress.yaml` - укажите ваш домен вместо `4clk.me`
- `k8s/mongo-pvc.yaml` - при необходимости измените `storageClassName` и размер storage
- `k8s/configmap.yaml` - при необходимости измените настройки

### 3. Применение манифестов

```bash
# Создание namespace
kubectl apply -f k8s/namespace.yaml

# MongoDB
kubectl apply -f k8s/mongo-pvc.yaml
kubectl apply -f k8s/mongo-secret.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/mongo-deployment.yaml

# Приложение
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/app-service.yaml
kubectl apply -f k8s/app-deployment.yaml

# Ingress (опционально)
kubectl apply -f k8s/ingress.yaml

# HPA (опционально, для автоматического масштабирования)
kubectl apply -f k8s/hpa.yaml
```

### 4. Проверка статуса

```bash
# Проверка подов
kubectl get pods -n clicker

# Проверка сервисов
kubectl get svc -n clicker

# Проверка PVC
kubectl get pvc -n clicker

# Логи приложения
kubectl logs -f deployment/clicker-app -n clicker

# Логи MongoDB
kubectl logs -f statefulset/mongo -n clicker
```

### 5. Создание первого пользователя

```bash
# Выполнение команды создания пользователя в поде
kubectl exec -it deployment/clicker-app -n clicker -- yarn create-user <login> <password>
```

## Настройки для production

### MongoDB

1. **Аутентификация MongoDB:**
   - Раскомментируйте и заполните `k8s/mongo-secret.yaml`
   - Обновите `mongo-deployment.yaml` для использования secret

2. **Бэкапы:**
   - Настройте регулярные бэкапы PVC с MongoDB данными
   - Используйте Velero или другой инструмент для бэкапов

3. **Репликация:**
   - Для production рекомендуется использовать MongoDB ReplicaSet
   - Обновите `mongo-deployment.yaml` для нескольких реплик

### Приложение

1. **Image Pull Secrets:**
   - Если используете private registry, создайте secret:
   ```bash
   kubectl create secret docker-registry registry-secret \
     --docker-server=your-registry.com \
     --docker-username=username \
     --docker-password=password \
     --namespace=clicker
   ```
   - Раскомментируйте `imagePullSecrets` в `app-deployment.yaml`

2. **Ресурсы:**
   - Настройте `resources` в `app-deployment.yaml` под вашу нагрузку
   - Увеличьте `replicas` для высокой доступности

3. **HPA (Horizontal Pod Autoscaler):**
   - Настройте пороги в `hpa.yaml` под вашу нагрузку
   - Убедитесь, что metrics-server установлен в кластере

### Ingress и TLS

1. **Установка cert-manager:**
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   # Дождитесь готовности всех подов
   kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
   ```

2. **SSL сертификаты:**
   - Обновите email в `cert-manager-issuer.yaml`
   - Примените ClusterIssuer: `kubectl apply -f k8s/cert-manager-issuer.yaml`
   - Cert-manager автоматически создаст сертификат через Let's Encrypt
   - Сертификат будет автоматически обновляться до истечения срока
   - Проверьте статус: `kubectl get certificate -n clicker`

3. **Проверка сертификата:**
   ```bash
   # Проверка Certificate ресурса
   kubectl describe certificate clicker-tls -n clicker
   
   # Проверка Secret с сертификатом
   kubectl get secret clicker-tls -n clicker
   ```

4. **CORS настройки:**
   - Настроены в `ingress.yaml` для nginx-ingress
   - Дополнительно настроены в `server/middleware/cors.ts` для серверной стороны
   - Для добавления новых доменов обновите `allowedOrigins` в `cors.ts`

2. **Rate limiting:**
   - Настройте rate limiting через аннотации ingress
   - Пример в `ingress.yaml` закомментирован

3. **Custom domains:**
   - Обновите `host` в `ingress.yaml` на ваш домен
   - Настройте DNS записи для домена

## Мониторинг и логи

```bash
# Просмотр событий namespace
kubectl get events -n clicker --sort-by='.lastTimestamp'

# Описание деплоймента для диагностики
kubectl describe deployment clicker-app -n clicker

# Подключение к MongoDB (для отладки)
kubectl exec -it statefulset/mongo -n clicker -- mongosh

# Масштабирование приложения
kubectl scale deployment clicker-app --replicas=3 -n clicker
```

## Troubleshooting

### Проблемы с подключением к MongoDB

```bash
# Проверка DNS
kubectl exec -it deployment/clicker-app -n clicker -- nslookup mongo-service

# Проверка подключения
kubectl exec -it deployment/clicker-app -n clicker -- ping mongo-service
```

### Проблемы с PVC

```bash
# Проверка статуса PVC
kubectl describe pvc mongo-data-pvc -n clicker

# Проверка StorageClass
kubectl get storageclass
```

### Откат деплоя

```bash
# Откат к предыдущей ревизии
kubectl rollout undo deployment/clicker-app -n clicker

# Просмотр истории ревизий
kubectl rollout history deployment/clicker-app -n clicker
```

## Удаление

```bash
# Удаление всех ресурсов namespace
kubectl delete namespace clicker

# Или удаление по отдельности
kubectl delete -f k8s/
```

**⚠️ ВНИМАНИЕ:** Удаление namespace удалит все данные MongoDB в PVC!

## Обновление образа

```bash
# Обновление образа с новым тегом
kubectl set image deployment/clicker-app app=your-registry/clicker-app:v1.1.0 -n clicker

# Или через редактирование deployment
kubectl edit deployment clicker-app -n clicker
```

## Переменные окружения

Все переменные окружения определены в `configmap.yaml`. Для изменения:

```bash
# Редактирование configmap
kubectl edit configmap clicker-config -n clicker

# Применение изменений (требует перезапуска подов)
kubectl rollout restart deployment/clicker-app -n clicker
```

## Важные замечания

1. **Storage для MongoDB:** Убедитесь, что StorageClass поддерживает ReadWriteOnce и достаточно места
2. **Сетевые политики:** При необходимости настройте NetworkPolicies для изоляции трафика
3. **Backup стратегия:** Настройте регулярные бэкапы MongoDB данных
4. **Мониторинг:** Установите Prometheus + Grafana для мониторинга приложения
5. **Логи:** Настройте централизованный сбор логов (ELK, Loki и т.д.)
6. **Resource Quotas:** Настройте ResourceQuota и LimitRange для namespace

