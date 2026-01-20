# Force Update Guide for Production Server

## Problem
The production server (49.231.43.177:7077) is not updating even though:
- ✅ Code is fixed locally (localhost works)
- ✅ Code is pushed to GitHub
- ✅ GitHub Actions shows success

## Root Cause
Docker on the production server is caching the old image and not pulling the fresh one.

## Solution: Manual Force Update

### Step 1: SSH into your server
```bash
ssh root@49.231.43.177
# Or use your SSH client (PuTTY, etc.)
```

### Step 2: Run these commands one by one

```bash
# Stop and remove old container
docker stop me-prompt-tec-dashboard
docker rm me-prompt-tec-dashboard

# Force remove old image (THIS IS THE KEY!)
docker rmi chunwarayut/me-prompt-tec-dashboard:latest -f

# Pull fresh image
docker pull chunwarayut/me-prompt-tec-dashboard:latest

# Start new container (copy environment variables from .github/workflows/ci-cd.yml)
docker run --name me-prompt-tec-dashboard \
  --label io.portainer.accesscontrol.teams=discord \
  --restart=always -d -p 7077:3000 \
  -e DATABASE_URL="mongodb+srv://meprompttec_db_user:gdN5PvB8prcMxPC5@cluster0.js2dhmn.mongodb.net/ME0001DB" \
  -e JWT_SECRET="HJDFH3489HF3H483HF834HF" \
  -e NODE_ENV="production" \
  -e CLOUDFLARE_KEY="QZ6TuL-3r02W7wQjQrv5DA" \
  -e CLOUDFLARE_ACCOUNT_ID="39aa4ea3c7a7d766adc4428933324787" \
  -e CLOUDFLARE_API_TOKEN="HQZYfq40lbkXw2hB8Z4u_wR14ZpPl2x_uscraOf0" \
  -e MAIL_USER="siwakorn.pn@rmuti.ac.th" \
  -e MAIL_PASS="svds jjpc yirw aoyo" \
  -e NEXT_PUBLIC_BASE_URL="http://49.231.43.177:7077/" \
  --memory=512m --memory-swap=512m --cpus=1.5 \
  --log-opt max-size=10m --log-opt max-file=3 \
  chunwarayut/me-prompt-tec-dashboard:latest

# Clean up old images
docker image prune -a -f
```

### Step 3: Verify
Open http://49.231.43.177:7077/profile

You should see:
- 🔴 **RED BANNER** saying "SYSTEM UPDATED v0.1.5"
- ✅ **NO verification badge** (the "✖ ยังไม่ยืนยันอีเมล" should be gone)

## Alternative: Use the automated script
If you have the `force-update-server.sh` file on your server, just run:
```bash
bash force-update-server.sh
```

## Why GitHub Actions isn't working
The CI/CD pipeline might be succeeding but the `docker pull` command on the server is not actually downloading the new layers because Docker thinks it already has the "latest" tag cached.

The fix I added to `.github/workflows/ci-cd.yml` should prevent this in the future, but for now you need to manually force the update once.
