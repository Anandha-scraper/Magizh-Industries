# 🚀 Firebase App Hosting Migration Guide

## Migration Complete! ✅

Your project has been successfully configured for Firebase App Hosting (Cloud Run).

---

## 📋 MIGRATION CHECKLIST

### ✅ Phase 1: Files Updated
- [x] Created `package.json` in root
- [x] Created `apphosting.yaml` (App Hosting config)
- [x] Updated `firebase.json` (removed functions config)
- [x] Updated `backend/server.js` (serves static files, uses PORT env var)
- [x] Updated `backend/config/firebase.js` (uses applicationDefault())
- [x] Marked `backend/index.js` as LEGACY

---

## 🔧 Phase 2: Setup Cloud Secret Manager

Run these commands to create secrets in Google Cloud:

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=magizh-industries-d36e0

# 2. Create secrets (replace with your actual values)
echo -n "your-super-secret-jwt-key-min-32-chars" | gcloud secrets create JWT_SECRET --data-file=- --project=magizh-industries-d36e0

echo -n "gmail" | gcloud secrets create EMAIL_SERVICE --data-file=- --project=magizh-industries-d36e0

echo -n "your-email@gmail.com" | gcloud secrets create EMAIL_USER --data-file=- --project=magizh-industries-d36e0

echo -n "your-gmail-app-password" | gcloud secrets create EMAIL_PASSWORD --data-file=- --project=magizh-industries-d36e0

echo -n "admin@yourdomain.com" | gcloud secrets create ADMIN_EMAIL --data-file=- --project=magizh-industries-d36e0

# 3. Grant permissions (App Hosting service account needs access)
gcloud secrets add-iam-policy-binding JWT_SECRET \
  --member="serviceAccount:firebase-app-hosting@magizh-industries-d36e0.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=magizh-industries-d36e0

# Repeat for all secrets
gcloud secrets add-iam-policy-binding EMAIL_SERVICE --member="serviceAccount:firebase-app-hosting@magizh-industries-d36e0.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=magizh-industries-d36e0

gcloud secrets add-iam-policy-binding EMAIL_USER --member="serviceAccount:firebase-app-hosting@magizh-industries-d36e0.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=magizh-industries-d36e0

gcloud secrets add-iam-policy-binding EMAIL_PASSWORD --member="serviceAccount:firebase-app-hosting@magizh-industries-d36e0.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=magizh-industries-d36e0

gcloud secrets add-iam-policy-binding ADMIN_EMAIL --member="serviceAccount:firebase-app-hosting@magizh-industries-d36e0.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=magizh-industries-d36e0
```

---

## 🚀 Phase 3: Deploy to App Hosting

```bash
# 1. Install root dependencies
npm install

# 2. Build the project (frontend + copy to backend)
npm run build

# 3. Initialize App Hosting (first time only)
firebase apphosting:backends:create

# Follow prompts:
# - Backend ID: magizh-api (or your choice)
# - Region: us-central1 (recommended)
# - Repository: Link your GitHub repo

# 4. Deploy
firebase deploy --only apphosting

# Or use Firebase Console to connect GitHub and enable auto-deploy
```

---

## 🗑️ Phase 4: Decommission Classical Functions

```bash
# 1. List deployed functions
firebase functions:list

# 2. Delete the 'api' Cloud Function
firebase functions:delete api --force

# 3. Verify deletion
firebase functions:list

# 4. Optional: Delete backend/index.js after confirming everything works
# rm backend/index.js
```

---

## 🔍 Phase 5: Final Verification

### Test Local Development:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Test Production Build:
```bash
# Build and test
npm run build
cd backend
NODE_ENV=production node server.js

# Visit http://localhost:8080 (or PORT from env)
```

### Check Deployed App:
```bash
# Get your App Hosting URL
firebase apphosting:backends:list

# Test endpoints:
# https://your-backend-id-RANDOM.web.app/
# https://your-backend-id-RANDOM.web.app/api/health
```

---

## 📊 Key Differences: Functions vs App Hosting

| Feature | Classical Functions | App Hosting (New) |
|---------|-------------------|-------------------|
| **Platform** | Cloud Functions | Cloud Run |
| **Config File** | firebase.json | apphosting.yaml |
| **Entry Point** | index.js (exports.api) | server.js (app.listen) |
| **Static Files** | Separate Hosting | Served by Express |
| **Secrets** | GitHub Secrets | Cloud Secret Manager |
| **Cold Starts** | ~2-5 seconds | ~1-2 seconds |
| **Scaling** | Limited | Advanced (min/max instances) |
| **Cost** | Higher for HTTP apps | Lower (sustained use) |
| **PORT** | Fixed by Functions | Injected by Cloud Run |

---

## 🎯 Benefits You Now Have

✅ **Unified Deployment** - Frontend + Backend in one container  
✅ **Faster Cold Starts** - Cloud Run is optimized for HTTP workloads  
✅ **Better Scaling** - Configure min/max instances, concurrency  
✅ **Lower Costs** - Pay only for actual compute time  
✅ **Simpler Architecture** - No rewrites needed, Express serves everything  
✅ **Modern Stack** - Cloud Run is the future, Functions v1 is legacy  

---

## 🚨 Common Issues & Solutions

### Issue: "Secret not found"
**Solution:** Create secrets in Cloud Secret Manager first (Phase 2 above)

### Issue: "Permission denied accessing secret"
**Solution:** Grant secretAccessor role to App Hosting service account

### Issue: "Cannot find module 'dist/index.html'"
**Solution:** Run `npm run build` to create frontend/dist and copy to backend/dist

### Issue: "Port already in use"
**Solution:** App Hosting sets PORT automatically. Don't hardcode port 5000 in production.

---

## 📞 Need Help?

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Secret Manager Guide](https://cloud.google.com/secret-manager/docs)

---

**Your project is now ready for modern Firebase App Hosting! 🎉**
