/**
 * MongoDB GridFS File Storage Service
 * Store files directly in MongoDB - No S3 needed!
 */

import { Readable } from 'stream';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import fs from 'fs';

let gridFSBucket: GridFSBucket | null = null;
let mongoClient: MongoClient | null = null;

/**
 * Initialize GridFS connection
 */
async function initGridFS(): Promise<GridFSBucket> {
  if (gridFSBucket) {
    return gridFSBucket;
  }

  try {
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Extract database name from connection string
    const dbName = mongoUrl.split('/').pop()?.split('?')[0] || 'houdaproject';

    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    
    const db = mongoClient.db(dbName);
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    console.log('✅ GridFS initialized successfully');
    return gridFSBucket;
  } catch (error) {
    console.error('❌ GridFS initialization failed:', error);
    throw error;
  }
}

export class MongoFileStorage {
  /**
   * Upload file to MongoDB GridFS
   */
  static async uploadFile(
    filePath: string,
    fileName: string,
    metadata?: any
  ): Promise<string> {
    try {
      const bucket = await initGridFS();
      
      return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath);
        const uploadStream = bucket.openUploadStream(fileName, {
          metadata: {
            ...metadata,
            uploadedAt: new Date(),
            originalPath: filePath
          }
        });

        readStream
          .pipe(uploadStream)
          .on('error', (error) => {
            console.error('Upload error:', error);
            reject(error);
          })
          .on('finish', () => {
            // Delete local file after successful upload
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.warn('Could not delete local file:', err);
            }
            
            console.log(`✅ File uploaded to MongoDB: ${uploadStream.id}`);
            resolve(uploadStream.id.toString());
          });
      });
    } catch (error) {
      console.error('MongoDB upload error:', error);
      throw new Error(`Failed to upload file to MongoDB: ${(error as Error).message}`);
    }
  }

  /**
   * Download file from MongoDB GridFS to local temp
   */
  static async downloadFile(fileId: string, destPath: string): Promise<string> {
    try {
      const bucket = await initGridFS();
      
      return new Promise((resolve, reject) => {
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
        const writeStream = fs.createWriteStream(destPath);

        downloadStream
          .pipe(writeStream)
          .on('error', (error) => {
            console.error('Download error:', error);
            reject(error);
          })
          .on('finish', () => {
            console.log(`✅ File downloaded from MongoDB: ${fileId}`);
            resolve(destPath);
          });
      });
    } catch (error) {
      console.error('MongoDB download error:', error);
      throw new Error(`Failed to download file: ${(error as Error).message}`);
    }
  }

  /**
   * Get file as stream
   */
  static async getFileStream(fileId: string): Promise<Readable> {
    try {
      const bucket = await initGridFS();
      return bucket.openDownloadStream(new ObjectId(fileId));
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw new Error(`Failed to get file stream: ${(error as Error).message}`);
    }
  }

  /**
   * Delete file from MongoDB GridFS
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      const bucket = await initGridFS();
      await bucket.delete(new ObjectId(fileId));
      console.log(`✅ File deleted from MongoDB: ${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(fileId: string): Promise<any> {
    try {
      const bucket = await initGridFS();
      const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
      return files[0] || null;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error(`Failed to get file info: ${(error as Error).message}`);
    }
  }

  /**
   * Check if MongoDB storage is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await initGridFS();
      return true;
    } catch (error) {
      console.error('MongoDB storage not available:', error);
      return false;
    }
  }

  /**
   * Close MongoDB connection
   */
  static async close(): Promise<void> {
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
      gridFSBucket = null;
      console.log('MongoDB connection closed');
    }
  }
}

export default MongoFileStorage;
