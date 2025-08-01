# Simple Ecommerce - Render Deployment

A simple ecommerce website with cart functionality, optimized for deployment on Render.

## 🚀 Quick Deploy to Render

### Option 1: Using Render.yaml (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically read `render.yaml`
3. **Database & App auto-created** with proper connections
4. **Visit your app** at the provided Render URL

### Option 2: Manual Setup

#### Step 1: Create PostgreSQL Database
1. In Render Dashboard: "New +" → "PostgreSQL"
2. Name: `ecommerce-db`
3. Database: `ecommerce` 
4. Plan: **Starter ($7/mo)** for production

#### Step 2: Create Web Service
1. In Render Dashboard: "New +" → "Web Service"
2. Connect your GitHub repo
3. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/mo)

#### Step 3: Set Environment Variables
In your web service settings → "Environment":
```
DATABASE_URL = [Copy from your PostgreSQL service]
NODE_ENV = production
```

## 🛍️ Features

- **Product catalog** with 6 sample products
- **Shopping cart** with add/remove functionality  
- **Order management** with PostgreSQL persistence
- **Session-based** cart tracking
- **Responsive design** with Tailwind CSS
- **Auto-database setup** - tables create automatically

## 🔧 Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo>
   cd simple-ecommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up local database** (optional):
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your local PostgreSQL URL
   DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Visit**: http://localhost:3000

## 📊 Database Schema

Tables are created automatically on first run:

### Products
- `id` (Primary Key)
- `name` (Product name)
- `price` (Decimal)
- `description` (Text)
- `image_url` (Image URL)
- `stock` (Integer)

### Cart Items  
- `id` (Primary Key)
- `session_id` (User session)
- `name` (Product name)
- `product_id` (Foreign Key → products)
- `quantity` (Integer)

### Orders
- `id` (Primary Key) 
- `session_id` (User session)
- `total_amount` (Decimal)
- `status` (Default: 'pending')

## 🎯 API Endpoints

- `GET /` - Main ecommerce page
- `GET /api/products` - Get all products
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:sessionId` - Get cart items
- `DELETE /api/cart/remove/:sessionId/:productId` - Remove item
- `DELETE /api/cart/clear/:sessionId` - Clear cart
- `POST /api/orders` - Create order
- `GET /health` - Health check

## 💰 Render Costs

| Service | Plan | Cost | Specs |
|---------|------|------|-------|
| **Web Service** | Starter | $7/mo | 512MB RAM, Auto-scale |
| **PostgreSQL** | Starter | $7/mo | 1GB storage, 500 connections |
| **Total** | | **$14/mo** | Production-ready |

## ✅ Production Features

- **SSL certificates** - Automatic HTTPS
- **Custom domains** - Add your domain easily  
- **Auto-scaling** - Handles traffic spikes
- **Health checks** - Auto-restart on failures
- **Logs & metrics** - Monitor performance
- **Git auto-deploy** - Push to deploy
- **Rollback** - Previous version restore

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

## 🆘 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` environment variable
- Ensure PostgreSQL service is running
- Verify SSL settings match Render requirements

### Build Failures  
- Check `package.json` dependencies
- Review build logs in Render dashboard
- Ensure Node.js version compatibility

### App Not Loading
- Check start command: `npm start`
- Verify port binding: `process.env.PORT`
- Review application logs

## 📞 Support

- **Render Support**: 24/7 email support
- **Community**: Render Discord server
- **Documentation**: [render.com/docs](https://render.com/docs)

---

🎉 **Ready to scale your ecommerce app on Render!**
