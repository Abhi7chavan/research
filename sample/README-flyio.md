# Fly.io Deployment Guide for Simple Ecommerce App

This guide will help you deploy your ecommerce application to Fly.io with PostgreSQL database.

## Prerequisites

1. **Install Fly CLI**
   ```bash
   # For Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Or download from: https://github.com/superfly/flyctl/releases
   ```

2. **Sign up for Fly.io account**
   ```bash
   flyctl auth signup
   # or if you already have an account
   flyctl auth login
   ```

## Database Setup

### Option 1: Create PostgreSQL Database on Fly.io

1. **Create a PostgreSQL cluster**
   ```bash
   flyctl postgres create --name simple-ecommerce-db --region ord
   ```

2. **Get connection details**
   ```bash
   flyctl postgres connect -a simple-ecommerce-db
   ```

3. **Set database URL as secret**
   ```bash
   flyctl secrets set DATABASE_URL="postgresql://username:password@hostname:port/database" -a simple-ecommerce-app
   ```

### Option 2: Use External Database (Railway, Supabase, etc.)

If you prefer to use your existing Railway database:

```bash
flyctl secrets set DATABASE_URL="postgresql://postgres:TMuFIuceyoohszjypofLlbMSYzSXNHfn@centerbeam.proxy.rlwy.net:34267/railway" -a simple-ecommerce-app
```

## Application Deployment

1. **Initialize Fly app**
   ```bash
   flyctl launch
   ```
   - Choose your app name (or use: simple-ecommerce-app)
   - Select region (ord = Chicago is recommended)
   - Don't overwrite existing fly.toml
   - Choose "No" for PostgreSQL database if you already created one

2. **Deploy the application**
   ```bash
   flyctl deploy
   ```

3. **Open your app**
   ```bash
   flyctl open
   ```

## Environment Variables

Set required environment variables:

```bash
# Database connection (already set above)
flyctl secrets set DATABASE_URL="your_database_url_here" -a simple-ecommerce-app

# Node environment
flyctl secrets set NODE_ENV="production" -a simple-ecommerce-app
```

## Monitoring and Logs

- **View logs**: `flyctl logs -a simple-ecommerce-app`
- **Check status**: `flyctl status -a simple-ecommerce-app`
- **SSH into machine**: `flyctl ssh console -a simple-ecommerce-app`

## Scaling

- **Scale up**: `flyctl scale count 2 -a simple-ecommerce-app`
- **Scale down**: `flyctl scale count 1 -a simple-ecommerce-app`
- **Change machine size**: `flyctl scale memory 2048 -a simple-ecommerce-app`

## Custom Domain (Optional)

1. **Add domain**
   ```bash
   flyctl certs create yourdomain.com -a simple-ecommerce-app
   ```

2. **Add CNAME record** in your DNS:
   ```
   CNAME www yourdomain.fly.dev
   ```

## Database Backup (If using Fly PostgreSQL)

```bash
# Create backup
flyctl postgres db backup create -a simple-ecommerce-db

# List backups
flyctl postgres db backup list -a simple-ecommerce-db
```

## Troubleshooting

### Common Issues:

1. **Database connection errors**
   - Verify DATABASE_URL is set correctly
   - Check if database allows external connections

2. **Build failures**
   - Ensure all dependencies are in package.json
   - Check Dockerfile for any missing steps

3. **Health check failures**
   - Verify your app responds to GET / requests
   - Check if PORT environment variable is used correctly

### Debug Commands:

```bash
# Check environment variables
flyctl ssh console -a simple-ecommerce-app
echo $DATABASE_URL

# Test database connection
flyctl ssh console -a simple-ecommerce-app
node -e "console.log(require('pg')); process.exit()"
```

## Cost Optimization

- Apps sleep when not in use (auto_stop_machines = true)
- Free tier includes: 3 shared-cpu-1x machines with 256MB RAM
- Database costs extra but you can use external free databases

## Security Notes

- SSL is enforced in production
- Database connections use SSL/TLS
- Secrets are encrypted and not visible in logs
- Non-root user runs the application in Docker

## Files Created for Fly.io

- `Dockerfile`: Container configuration
- `fly.toml`: Fly.io application configuration  
- `.dockerignore`: Files to exclude from Docker build
- This README guide

Your ecommerce app is now ready for Fly.io deployment! 🚀
