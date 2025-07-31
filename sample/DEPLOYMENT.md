# Universal Deployment Configuration

This project is configured to work with both **Render** and **Railway** platforms.

## 🚀 Deployment Options

### **Option 1: Render.com (Current Working Setup)**
1. Connect your GitHub repository
2. **Environment**: Static Site
3. **Root Directory**: `sample`
4. **Build Command**: `echo "Static site ready"` (or leave empty)
5. **Publish Directory**: `./`
6. **Routes**: Rewrite all to `/index.html`

### **Option 2: Railway.app (New Option)**  
1. Connect your GitHub repository
2. **Root Directory**: `sample`
3. Auto-detects Node.js and runs:
   - Build: `npm install`
   - Start: `npm run railway-start`

## 📁 Project Structure
```
research/
├── sample/          ← Your app files (set as root directory)
│   ├── index.html
│   ├── package.json
│   ├── render.yaml  ← Render config (static site)
│   ├── railway.json ← Railway config (Node.js service)
│   └── ...
└── README.md
```

## ⚙️ Platform-Specific Settings

### **Render Configuration (Existing - Don't Change):**
- **Static Site**: Serves files directly
- **Build Command**: `echo "Static site ready"`
- **Publish Directory**: `./`
- **Routes**: Rewrite to `/index.html`
- **Config file**: `render.yaml`

### **Railway Configuration (New):**
- **Node.js Service**: Uses `serve` package
- **Start Command**: `npm run railway-start`
- **Port**: Uses `${PORT:-3000}` with fallback
- **Config file**: `railway.json`

## 🔧 Key Differences
- **Render**: Static site deployment (existing working setup)
- **Railway**: Node.js service with serve package (new option)
- Same website, different deployment methods

## 🌐 Access Your Site
- **Render**: `https://your-app-name.onrender.com` (current)
- **Railway**: `https://your-app-name.up.railway.app` (new option)

Your existing Render deployment remains unchanged and working!
