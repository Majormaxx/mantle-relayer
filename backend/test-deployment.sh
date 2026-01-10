#!/bin/bash
# Test your deployed backend on Railway
# Usage: ./test-deployment.sh YOUR_RAILWAY_URL

if [ -z "$1" ]; then
    echo "Usage: ./test-deployment.sh YOUR_RAILWAY_URL"
    echo "Example: ./test-deployment.sh https://mantle-relayer-production.up.railway.app"
    exit 1
fi

BACKEND_URL="$1"

echo "🧪 Testing Backend Deployment"
echo "================================"
echo "URL: $BACKEND_URL"
echo ""

# Test 1: Basic Health Check
echo "Test 1: Health Check..."
response=$(curl -s "$BACKEND_URL/health")
echo "Response: $response"
if echo "$response" | grep -q "ok"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed"
    exit 1
fi
echo ""

# Test 2: Readiness Check (with blockchain connection)
echo "Test 2: Readiness Check..."
response=$(curl -s "$BACKEND_URL/health/ready")
echo "Response: $response"
if echo "$response" | grep -q "ok"; then
    echo "✅ Readiness check passed!"
else
    echo "⚠️  Readiness check shows issues (check logs)"
fi
echo ""

# Test 3: Liveness Check
echo "Test 3: Liveness Check..."
response=$(curl -s "$BACKEND_URL/health/live")
echo "Response: $response"
if echo "$response" | grep -q "ok"; then
    echo "✅ Liveness check passed!"
else
    echo "❌ Liveness check failed"
fi
echo ""

echo "================================"
echo "🎉 Basic tests completed!"
echo ""
echo "Your backend is available at:"
echo "$BACKEND_URL"
echo ""
echo "API Endpoints:"
echo "- POST $BACKEND_URL/api/v1/relay"
echo "- POST $BACKEND_URL/api/v1/validate"
echo "- GET  $BACKEND_URL/api/v1/paymaster/:address"
echo "- GET  $BACKEND_URL/api/v1/paymaster/:address/nonce/:user"
