import { Router, Request, Response } from 'express';
import { checkDBHealth } from '../db';

const router = Router();

// GET /api/health - Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDBHealth();
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        external: process.memoryUsage().external / 1024 / 1024
      },
      database: {
        connected: dbHealthy,
        status: dbHealthy ? 'healthy' : 'unhealthy'
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    // Return 503 if database is unhealthy
    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/health/db - Database-specific health check
router.get('/db', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDBHealth();
    
    if (dbHealthy) {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Database connection is healthy'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: 'Database connection failed'
      });
    }
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as healthRouter };
export default router;
