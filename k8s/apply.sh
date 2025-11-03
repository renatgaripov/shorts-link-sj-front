#!/bin/bash

# Скрипт для применения всех Kubernetes манифестов
# Использование: ./k8s/apply.sh

set -e

echo "🚀 Применение манифестов Kubernetes..."

# Проверка наличия kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl не найден. Установите kubectl."
    exit 1
fi

# Применение манифестов в правильном порядке
echo "📦 Создание namespace..."
kubectl apply -f k8s/namespace.yaml

echo "💾 Создание PVC для MongoDB..."
kubectl apply -f k8s/mongo-pvc.yaml

echo "🔐 Создание secrets для MongoDB..."
kubectl apply -f k8s/mongo-secret.yaml

echo "🗄️  Развертывание MongoDB..."
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/mongo-deployment.yaml

echo "⚙️  Создание ConfigMap..."
kubectl apply -f k8s/configmap.yaml

echo "📱 Развертывание приложения..."
kubectl apply -f k8s/app-service.yaml
kubectl apply -f k8s/app-deployment.yaml

echo "🔒 Настройка SSL сертификатов..."
read -p "Применить cert-manager ClusterIssuer? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Убедитесь, что cert-manager установлен в кластере!"
    echo "⚠️  Проверьте email в k8s/cert-manager-issuer.yaml!"
    kubectl apply -f k8s/cert-manager-issuer.yaml
fi

echo "🌐 Создание Ingress с SSL..."
read -p "Применить Ingress? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Убедитесь, что домен настроен в k8s/ingress.yaml!"
    kubectl apply -f k8s/ingress.yaml
    echo "⏳ Ожидание создания SSL сертификата (может занять несколько минут)..."
    kubectl wait --for=condition=Ready certificate clicker-tls -n clicker --timeout=5m || echo "⚠️  Сертификат еще создается. Проверьте: kubectl get certificate -n clicker"
fi

echo "📈 Создание HPA (опционально)..."
read -p "Применить HPA? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl apply -f k8s/hpa.yaml
fi

echo "✅ Готово! Проверка статуса:"
kubectl get all -n clicker

