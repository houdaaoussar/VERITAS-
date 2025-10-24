/**
 * Centralized Prisma Client Configuration
 * 
 * This module provides a singleton Prisma client instance with proper
 * connection handling and error management.
 */

import { PrismaClient } from '@prisma/client';

// Singleton instance
let prismaInstance: PrismaClient | null = null;

/**
 * Get or create Prisma client instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    });

    // Handle connection errors
    prismaInstance.$connect()
      .then(() => {
        console.log('✅ Database connected successfully');
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        console.error('⚠️  Continuing without database - some features may not work');
      });
  }

  return prismaInstance;
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
    console.log('✅ Database disconnected');
  }
}

/**
 * Check if database is connected
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    // Simple connection test - try to query a collection
    await client.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Execute database operation with error handling
 */
export async function withDatabase<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    const prisma = getPrismaClient();
    return await operation(prisma);
  } catch (error: any) {
    console.error('Database operation failed:', error.message);
    
    // If fallback is provided, return it
    if (fallback !== undefined) {
      return fallback;
    }
    
    // Otherwise, throw the error
    throw error;
  }
}

// Export singleton instance
export const prisma = getPrismaClient();

// Export default
export default prisma;
