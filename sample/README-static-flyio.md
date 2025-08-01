# Fly.io Static Site Deployment Guide

This guide will help you deploy your simple static ecommerce website to Fly.io using nginx.

## 🚀 Quick Start

### Prerequisites
1. **Install Fly CLI**
   ```cmd
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login to Fly.io**
   ```cmd
   flyctl auth login
   ```

### Deploy Your Site

1. **Launch the app** (from your project directory):
   ```cmd
   flyctl launch
   ```
   - Choose app name: `simple-ecommerce-static` (or your preference)
   - Choose region: `ord` (Chicago) or any preferred region
   - Don't add PostgreSQL database (we don't need it for static site)
   - Don't deploy immediately - we'll do it manually

2. **Deploy**:
   ```cmd
   flyctl deploy
   ```

3. **Open your site**:
   ```cmd
   flyctl open
   ```

## 📁 Project Structure

```
sample/
├── index.html          # Main HTML page
├── style.css           # CSS styles
├── script.js           # JavaScript functionality
├── Dockerfile          # nginx container config
├── fly.toml           # Fly.io configuration
└── .dockerignore      # Files to exclude from build
```

## 🔧 Configuration Files

### Dockerfile
- Uses nginx:alpine for lightweight static file serving
- Copies HTML, CSS, and JS files to nginx directory
- Exposes port 80

### fly.toml
- Configured for static site deployment
- Uses nginx on port 80
- Auto-scaling enabled
- Health checks configured

## ✨ Features

- **Responsive Design**: Works on desktop and mobile
- **Shopping Cart**: Add/remove items, quantity management
- **Local Storage**: Cart persists in browser
- **Smooth Animations**: CSS transitions and hover effects
- **Modern UI**: Clean, professional design

## 🛠️ Customization

### Adding Products
Edit `script.js` and modify the `products` array:

```javascript
const products = [
    {
        id: 1,
        name: "Your Product",
        price: 99.99,
        description: "Product description"
    }
    // Add more products...
];
```

### Styling
Modify `style.css` to change:
- Colors
- Fonts
- Layout
- Animations

### Content
Update `index.html` to change:
- Site name and branding
- Hero section content
- About section
- Footer information

## 🌐 Custom Domain (Optional)

1. **Add your domain**:
   ```cmd
   flyctl certs create yourdomain.com
   ```

2. **Update DNS**:
   Add CNAME record: `yourdomain.com` → `your-app-name.fly.dev`

## 📊 Monitoring

- **View logs**: `flyctl logs`
- **Check status**: `flyctl status`
- **Scale up/down**: `flyctl scale count 2`

## 💰 Cost

- **Free tier**: Up to 3 shared machines
- **Auto-scaling**: Machines sleep when not in use
- **No database costs**: Pure static site

## 🔍 Troubleshooting

### Build Issues
- Ensure all files (index.html, style.css, script.js) exist
- Check Dockerfile syntax
- Verify .dockerignore doesn't exclude required files

### Site Not Loading
- Check `flyctl logs` for errors
- Verify nginx is serving files correctly
- Test locally with `docker build .`

### Performance
- Images should be optimized
- CSS/JS can be minified for production
- Consider CDN for assets

## 🚀 Next Steps

1. **Add Analytics**: Google Analytics or similar
2. **Optimize Images**: Use WebP format
3. **Add Contact Form**: Using form services like Formspree
4. **SEO**: Add meta tags and structured data
5. **PWA**: Make it a Progressive Web App

## 📝 Commands Summary

```cmd
# Initial setup
flyctl auth login
flyctl launch

# Deploy changes
flyctl deploy

# Management
flyctl open          # Open site in browser
flyctl status        # Check app status  
flyctl logs          # View logs
flyctl scale count 1 # Scale to 1 machine
```

Your static ecommerce site is now ready for Fly.io! 🎉

## Support

- Fly.io Docs: https://fly.io/docs/
- Community: https://community.fly.io/
