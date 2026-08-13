# Simple App - Deploy & Rollback Guide

## Quick Start

### 1. Deploy (Automatic via Git Push)
```bash
# Merge to main - triggers auto-deploy
git push origin main

# Or tag a release (creates versioned deployment)
git tag v1.0.0
git push origin v1.0.0
```

### 2. Manual Deploy via Workflow Dispatch
```bash
# Go to: GitHub Actions → Deploy to EKS with Rollback
# Click "Run workflow" → action: "deploy"
```

### 3. Rollback to Previous Version
```bash
# Via GitHub Actions UI:
# Actions → Deploy to EKS with Rollback → Run workflow
# Select action: "rollback"
```

### 4. Check Status
```bash
# Via GitHub Actions UI:
# Actions → Deploy to EKS with Rollback → Run workflow
# Select action: "status"

# Or manually from terminal:
kubectl get deployment simple-app -n default
kubectl rollout history deployment/simple-app -n default
```

---

## How It Works

### Versioning Strategy
- **Main branch**: Auto-versions as `<run-number>.<timestamp>`
- **Git tags**: Uses semantic versioning (v1.0.0 → 1.0.0)
- Example: `v2.3.1` → image tag `2.3.1`

### Deployment Flow
1. **Version** job generates version tag
2. **Build** job creates Docker image & pushes to GHCR
3. **Deploy** job creates Helm chart dynamically & deploys via Smurf
4. **Smoke tests** verify health endpoints
5. **Auto-rollback** if tests fail

### Rollback Mechanism
- Uses `kubectl rollout undo` (keeps history)
- Kubernetes preserves last 10 revisions by default
- View history: `kubectl rollout history deployment/simple-app -n default`

---

## Example Scenarios

### Scenario 1: Deploy New Version
```bash
git add .
git commit -m "fix: update app logic"
git push origin main
# → Workflow auto-triggers, builds image v1234.5678, deploys
```

### Scenario 2: Version Tag Release
```bash
git tag v1.2.0
git push origin v1.2.0
# → Builds as v1.2.0, cleaner versioning
```

### Scenario 3: Emergency Rollback
1. Go to GitHub Actions tab
2. Select "Deploy to EKS with Rollback"
3. Click "Run workflow"
4. Change action to "rollback"
5. Click "Run"
6. Reverts to previous working version instantly

### Scenario 4: Failed Deployment Auto-Rollback
- If health checks fail during smoke tests
- Workflow automatically runs `kubectl rollout undo`
- Previous version restored within seconds

---

## Testing Locally

### Build image locally
```bash
docker build -t simple-app:test --build-arg APP_VERSION=test .
docker run -p 8080:8080 simple-app:test
```

### Test endpoints
```bash
# Health check
curl http://localhost:8080/health

# Ready check
curl http://localhost:8080/ready

# App endpoint
curl http://localhost:8080/

# Version
curl http://localhost:8080/version
```

### Intentional failure test
```bash
curl http://localhost:8080/fail
# → Kills pod, triggers readiness probe failure
# → Pod restarts, triggers rollback in workflow
```

---

## Environment Variables

Update in GitHub Actions secrets:
- `AWS_ACCESS_KEY_ID` — AWS credentials
- `AWS_SECRET_ACCESS_KEY` — AWS credentials

Update in workflow file:
- `AWS_REGION` — e.g., `us-east-1`
- `EKS_CLUSTER` — your EKS cluster name
- `NAMESPACE` — Kubernetes namespace (default: `default`)

---

## Troubleshooting

### Check deployment status
```bash
kubectl get deployment simple-app -n default
kubectl get pods -n default -l app=simple-app
kubectl logs -n default -l app=simple-app --tail=50
```

### View rollout history
```bash
kubectl rollout history deployment/simple-app -n default
```

### Manual rollback
```bash
kubectl rollout undo deployment/simple-app -n default
kubectl rollout status deployment/simple-app -n default --timeout=5m
```

### See events
```bash
kubectl get events -n default --sort-by='.lastTimestamp' | tail -10
```

---

## File Structure
```
.
├── app.js                      # Node.js app
├── Dockerfile                  # Container image
├── package.json               # Dependencies
├── deploy-with-rollback.yml   # GitHub Actions workflow
└── DEPLOY_GUIDE.md           # This file
```

---

## Key Features

✅ **Automatic Versioning** — Every push gets unique tag  
✅ **Health Checks** — Validates endpoints before considering success  
✅ **Auto-Rollback** — Reverts on test failure  
✅ **Manual Rollback** — Revert to any previous version via GitHub Actions  
✅ **Deployment History** — View all revisions  
✅ **Smoke Tests** — Validates 4 endpoints  
✅ **Clean Deploy** — Helm chart generated dynamically  
✅ **Simple App** — Minimal dependencies, easy to iterate  
