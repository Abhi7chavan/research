const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection with Railway URL
const pool = new Pool({
  connectionString: 'postgresql://postgres:cjleOhsDvHzCJifPQPfPbJtxIOrcaoYK@shinkansen.proxy.rlwy.net:59114/railway',
  ssl: { rejectUnauthorized: false }
});

// Auto-create database tables
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Cart items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample products if none exist
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      console.log('📦 Adding sample products...');
      await pool.query(`
        INSERT INTO products (name, price, description, image_url, stock) VALUES
        ('iPhone 15', 999.99, 'Latest iPhone with advanced features', 'https://images.unsplash.com/photo-1592286927505-1def25115558?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 50),
        ('MacBook Pro', 1999.99, 'Powerful laptop for professionals', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1289&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 25),
        ('AirPods Pro', 249.99, 'Wireless earbuds with noise cancellation', 'https://images.unsplash.com/photo-1606061587005-c1c57d134082?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aSUyMHBob25lJTIwY2FzZXxlbnwwfHwwfHx8MA%3D%3D', 100),
        ('iPad Air', 599.99, 'Versatile tablet for work and play', 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D', 75),
        ('Apple Watch', 399.99, 'Smart watch with health monitoring', 'https://images.unsplash.com/photo-1649194270405-0dfaf13cda14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aSUyMHBhZCUyMGFpcnxlbnwwfHwwfHx8MA%3D%3D', 60),
        ('iPhone Case', 29.99, 'Protective case for your iPhone', 'https://plus.unsplash.com/premium_photo-1671247953201-2fdc17af6692?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFjJTIwYm9vayUyMHByb3xlbnwwfHwwfHx8MA%3D%3D', 200)
      `);
    }
    
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Add item to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { sessionId, name, productId, quantity = 1 } = req.body;
    
    // Check if item already exists in cart
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE session_id = $1 AND product_id = $2',
      [sessionId, productId]
    );
    
    if (existing.rows.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1 WHERE session_id = $2 AND product_id = $3',
        [quantity, sessionId, productId]
      );
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (session_id, name, product_id, quantity) VALUES ($1, $2, $3, $4)',
        [sessionId, name, productId, quantity]
      );
    }
    
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Failed to add item to cart' });
  }
});

// Get cart items
app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await pool.query(`
      SELECT c.*, p.name, p.price, p.image_url, (c.quantity * p.price) as total_price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = $1
      ORDER BY c.added_at DESC
    `, [sessionId]);
    
    const totalAmount = result.rows.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    
    res.json({ 
      success: true, 
      cartItems: result.rows,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/remove/:sessionId/:productId', async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    
    await pool.query(
      'DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2',
      [sessionId, productId]
    );
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
});

// Clear cart
app.delete('/api/cart/clear/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Get cart total
    const cartResult = await pool.query(`
      SELECT SUM(c.quantity * p.price) as total
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = $1
    `, [sessionId]);
    
    const totalAmount = cartResult.rows[0].total || 0;
    
    if (totalAmount > 0) {
      // Create order
      const orderResult = await pool.query(
        'INSERT INTO orders (session_id, total_amount) VALUES ($1, $2) RETURNING *',
        [sessionId, totalAmount]
      );
      
      // Clear cart after order
      await pool.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);
      
      res.json({ 
        success: true, 
        message: 'Order created successfully',
        order: orderResult.rows[0]
      });
    } else {
      res.status(400).json({ success: false, error: 'Cart is empty' });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simple Ecommerce Server running on port ${port}`);
  console.log(`�️  Shop available at http://localhost:${port}`);
  console.log('✅ Database connection configured for Railway PostgreSQL');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
