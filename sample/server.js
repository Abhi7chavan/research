const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_logs (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        load_time INTEGER,
        ttfb INTEGER,
        is_cold_start BOOLEAN DEFAULT FALSE,
        memory_usage INTEGER,
        fps_average INTEGER,
        user_agent TEXT,
        ip_address INET,
        session_id VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_platform_timestamp ON performance_logs(platform, timestamp);
      CREATE INDEX IF NOT EXISTS idx_session_id ON performance_logs(session_id);
      CREATE INDEX IF NOT EXISTS idx_user_session ON user_interactions(session_id);
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Routes

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: Log performance data
app.post('/api/performance', async (req, res) => {
  try {
    const {
      platform,
      loadTime,
      ttfb,
      isColdStart,
      memoryUsage,
      fpsAverage,
      userAgent,
      sessionId
    } = req.body;
    
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    const result = await pool.query(`
      INSERT INTO performance_logs 
      (platform, load_time, ttfb, is_cold_start, memory_usage, fps_average, user_agent, ip_address, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [platform, loadTime, ttfb, isColdStart, memoryUsage, fpsAverage, userAgent, clientIP, sessionId]);
    
    res.json({ 
      success: true, 
      message: 'Performance data saved successfully',
      data: result.rows[0] 
    });
    
    console.log(`📊 Performance logged: ${platform} - TTFB: ${ttfb}ms - Cold Start: ${isColdStart}`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save performance data' 
    });
  }
});

// API: Log user interactions
app.post('/api/interaction', async (req, res) => {
  try {
    const { sessionId, action, data } = req.body;
    
    const result = await pool.query(`
      INSERT INTO user_interactions (session_id, action, data)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sessionId, action, JSON.stringify(data)]);
    
    res.json({ 
      success: true, 
      message: 'Interaction logged successfully',
      data: result.rows[0] 
    });
    
    console.log(`🔄 Interaction logged: ${action} for session ${sessionId}`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log interaction' 
    });
  }
});

// API: Get performance analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const platformStats = await pool.query(`
      SELECT 
        platform,
        COUNT(*) as total_requests,
        ROUND(AVG(load_time)) as avg_load_time,
        ROUND(AVG(ttfb)) as avg_ttfb,
        COUNT(CASE WHEN is_cold_start THEN 1 END) as cold_starts,
        ROUND(AVG(memory_usage)) as avg_memory,
        ROUND(AVG(fps_average)) as avg_fps,
        MIN(timestamp) as first_request,
        MAX(timestamp) as last_request
      FROM performance_logs 
      WHERE timestamp > NOW() - INTERVAL '7 days'
      GROUP BY platform
      ORDER BY platform
    `);
    
    const recentPerformance = await pool.query(`
      SELECT 
        platform,
        load_time,
        ttfb,
        is_cold_start,
        memory_usage,
        timestamp
      FROM performance_logs 
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY timestamp DESC
      LIMIT 50
    `);
    
    const topInteractions = await pool.query(`
      SELECT 
        action,
        COUNT(*) as count,
        MAX(timestamp) as last_used
      FROM user_interactions 
      WHERE timestamp > NOW() - INTERVAL '7 days'
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        platformStats: platformStats.rows,
        recentPerformance: recentPerformance.rows,
        topInteractions: topInteractions.rows
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
});

// API: Get user session data
app.get('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const performanceData = await pool.query(`
      SELECT * FROM performance_logs 
      WHERE session_id = $1 
      ORDER BY timestamp DESC
    `, [sessionId]);
    
    const interactions = await pool.query(`
      SELECT * FROM user_interactions 
      WHERE session_id = $1 
      ORDER BY timestamp DESC
    `, [sessionId]);
    
    res.json({
      success: true,
      data: {
        performance: performanceData.rows,
        interactions: interactions.rows
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch session data' 
    });
  }
});

// API: Platform comparison
app.get('/api/comparison', async (req, res) => {
  try {
    const comparison = await pool.query(`
      SELECT 
        platform,
        COUNT(*) as total_tests,
        ROUND(AVG(ttfb)) as avg_ttfb,
        ROUND(AVG(load_time)) as avg_load_time,
        COUNT(CASE WHEN is_cold_start THEN 1 END) as cold_start_count,
        ROUND(AVG(CASE WHEN is_cold_start THEN ttfb END)) as avg_cold_start_ttfb,
        ROUND(AVG(memory_usage)) as avg_memory,
        ROUND(AVG(fps_average)) as avg_fps
      FROM performance_logs 
      WHERE timestamp > NOW() - INTERVAL '7 days'
      GROUP BY platform
      ORDER BY avg_ttfb ASC
    `);
    
    res.json({
      success: true,
      data: comparison.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch comparison data' 
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Heavy Render Server running on port ${port}`);
  console.log(`📊 Performance API available at /api/analytics`);
  console.log(`🔍 Health check available at /health`);
  
  if (process.env.DATABASE_URL) {
    console.log('✅ Database connection configured');
  } else {
    console.log('⚠️  DATABASE_URL not found in environment variables');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
