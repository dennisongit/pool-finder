import { PrismaClient } from '@prisma/client';
import { config } from './env';

// Global variable to prevent multiple Prisma instances in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const createPrismaClient = () => {
  return new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: config.DATABASE_URL
      }
    }
  });
};

// Use global variable in development to avoid multiple instances
const prisma = globalThis.__prisma ?? createPrismaClient();

if (config.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Database connection function
export const connectDB = async () => {
  try {
    // Test the connection
    await prisma.$connect();
    console.log('🎯 Connected to PostgreSQL database');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query test successful');
    
    return prisma;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Disconnect function for graceful shutdown
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('👋 Disconnected from database');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

// Health check function
export const checkDBHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Export the prisma instance
export { prisma };
export default prisma;

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDB();
});

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
