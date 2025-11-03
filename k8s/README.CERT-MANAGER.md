# Настройка SSL сертификатов с cert-manager

## Установка cert-manager

### Метод 1: Через kubectl (рекомендуется)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Метод 2: Через Helm

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

## Проверка установки

```bash
# Проверка подов
kubectl get pods -n cert-manager

# Ожидание готовности
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
```

## Настройка ClusterIssuer

1. **Отредактируйте `k8s/cert-manager-issuer.yaml`:**
   - Замените `admin@4clk.me` на ваш email
   - Email будет использован Let's Encrypt для уведомлений

2. **Примените ClusterIssuer:**
   ```bash
   kubectl apply -f k8s/cert-manager-issuer.yaml
   ```

3. **Проверка:**
   ```bash
   kubectl get clusterissuer
   kubectl describe clusterissuer letsencrypt-prod
   ```

## Использование

После применения `ingress.yaml` с аннотацией `cert-manager.io/cluster-issuer: "letsencrypt-prod"`, cert-manager:

1. Автоматически создаст Certificate ресурс
2. Запросит сертификат у Let's Encrypt
3. Создаст Secret с сертификатом
4. Автоматически обновит сертификат до истечения срока

## Проверка статуса сертификата

```bash
# Проверка Certificate
kubectl get certificate -n clicker
kubectl describe certificate clicker-tls -n clicker

# Проверка CertificateRequest (временный ресурс)
kubectl get certificaterequest -n clicker

# Проверка Challenge (для HTTP-01 валидации)
kubectl get challenge -n clicker

# Логи cert-manager
kubectl logs -f -n cert-manager -l app.kubernetes.io/name=cert-manager
```

## Troubleshooting

### Сертификат не создается

1. **Проверьте ClusterIssuer:**
   ```bash
   kubectl describe clusterissuer letsencrypt-prod
   ```

2. **Проверьте Certificate:**
   ```bash
   kubectl describe certificate clicker-tls -n clicker
   ```

3. **Проверьте Ingress:**
   - Домен должен быть доступен из интернета
   - DNS должен указывать на ваш ingress
   - Ingress должен быть доступен по HTTP для валидации

4. **Проверьте лимиты Let's Encrypt:**
   - Rate limit: 50 сертификатов на домен в неделю
   - Для тестов используйте `letsencrypt-staging`

### Использование Staging окружения

Для тестирования используйте staging issuer:

```yaml
# В ingress.yaml измените:
cert-manager.io/cluster-issuer: "letsencrypt-staging"
```

**Важно:** Staging сертификаты не доверяются браузерами, но не имеют rate limits.

### Ошибки валидации

1. **Проверьте Challenge:**
   ```bash
   kubectl describe challenge -n clicker
   ```

2. **Проверьте доступность /.well-known/acme-challenge:**
   ```bash
   curl http://4clk.me/.well-known/acme-challenge/test
   ```

3. **Убедитесь, что домен доступен:**
   ```bash
   nslookup 4clk.me
   ```

## Обновление сертификатов

Cert-manager автоматически обновляет сертификаты за 30 дней до истечения. 

Для принудительного обновления:

```bash
kubectl delete certificate clicker-tls -n clicker
# Cert-manager автоматически создаст новый
```

## Мониторинг сертификатов

```bash
# Проверка срока действия
kubectl get certificate -n clicker -o jsonpath='{.items[*].status.notAfter}'

# CronJob для мониторинга (опционально)
# Настройте оповещения о приближающемся истечении
```

## Дополнительные ресурсы

- [Cert-manager документация](https://cert-manager.io/docs/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
- [Troubleshooting Issues](https://cert-manager.io/docs/troubleshooting/)

