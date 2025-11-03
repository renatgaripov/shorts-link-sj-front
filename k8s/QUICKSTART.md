# Быстрый старт для админа

## ⚡ Быстрая команда деплоя

```bash
# 1. Соберите и загрузите Docker образ
docker build -t your-registry/clicker-app:latest .
docker push your-registry/clicker-app:latest

# 2. Обновите IMAGE в k8s/app-deployment.yaml (замените your-registry/clicker-app:latest)

# 3. Примените манифесты
./k8s/apply.sh

# ИЛИ вручную:
kubectl apply -f k8s/
```

## 📝 Обязательно перед деплоем:

1. **Измените IMAGE в `k8s/app-deployment.yaml`:**
   ```yaml
   image: your-registry/clicker-app:latest  # ← Ваш registry путь
   ```

2. **Обновите домен и email в `k8s/ingress.yaml` и `k8s/cert-manager-issuer.yaml`:**
   ```yaml
   # ingress.yaml
   host: 4clk.me  # ← Ваш домен
   
   # cert-manager-issuer.yaml
   email: admin@4clk.me  # ← Ваш email для Let's Encrypt
   ```

3. **Установите cert-manager (если еще не установлен):**
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   # Дождитесь готовности
   kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
   ```

4. **Примените ClusterIssuer для SSL сертификатов:**
   ```bash
   kubectl apply -f k8s/cert-manager-issuer.yaml
   ```

5. **Проверьте StorageClass в `k8s/mongo-pvc.yaml`:**
   ```bash
   kubectl get storageclass
   # Если нужен другой, раскомментируйте и укажите storageClassName
   ```

6. **Настройте Ingress Class:**
   ```yaml
   ingressClassName: nginx  # ← Измените на ваш ingress controller
   ```

7. **Настройте CORS (если нужны другие домены):**
   - В `k8s/ingress.yaml` - для nginx ingress
   - В `server/middleware/cors.ts` - для серверного CORS (добавьте ваши домены в `allowedOrigins`)

## 🔧 После деплоя:

```bash
# Проверка статуса
kubectl get pods -n clicker

# Создание первого пользователя
kubectl exec -it deployment/clicker-app -n clicker -- yarn create-user admin yourpassword

# Логи
kubectl logs -f deployment/clicker-app -n clicker
```

## 📋 Чек-лист для production:

- [ ] Изменен IMAGE в app-deployment.yaml
- [ ] Изменен домен в ingress.yaml
- [ ] Изменен email в cert-manager-issuer.yaml
- [ ] Установлен cert-manager в кластер
- [ ] Применен cert-manager-issuer.yaml
- [ ] Настроен StorageClass для MongoDB
- [ ] Настроен Ingress Controller (nginx/traefik)
- [ ] Настроены CORS домены (если нужны)
- [ ] Проверен SSL сертификат (должен создаться автоматически)
- [ ] Настроены resource limits под нагрузку
- [ ] Настроен HPA (опционально)
- [ ] Настроены бэкапы MongoDB
- [ ] Настроен мониторинг

## 🆘 Проблемы?

```bash
# Проверка событий
kubectl get events -n clicker --sort-by='.lastTimestamp'

# Описание подов
kubectl describe pods -n clicker

# Проверка подключения к MongoDB
kubectl exec -it deployment/clicker-app -n clicker -- nslookup mongo-service
```

Полная документация: `README.k8s.md`

