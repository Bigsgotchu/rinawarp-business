#!/bin/bash

echo "Verifying stack..."

# Check health
if curl -sf http://127.0.0.1:3333/health > /dev/null; then
  echo "✅ Health OK"
else
  echo "❌ Health FAIL"
fi

# Check models
if curl -sf http://127.0.0.1:3333/v1/models > /dev/null; then
  echo "✅ Models OK"
else
  echo "❌ Models FAIL"
fi
