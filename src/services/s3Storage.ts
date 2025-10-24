/**
 * AWS S3 Storage Service
 * Handles file uploads to S3 for production environment
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'houdaproject-uploads';
const USE_S3 = process.env.USE_S3_STORAGE === 'true';

export class S3StorageService {
  /**
   * Upload file to S3
   */
  static async uploadFile(
    filePath: string,
    fileName: string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      // Read file from local disk
      const fileContent = fs.readFileSync(filePath);
      
      // Generate S3 key (path in bucket)
      const s3Key = `uploads/${Date.now()}-${fileName}`;
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        ServerSideEncryption: 'AES256'
      });
      
      await s3Client.send(command);
      
      // Delete local file after successful upload
      fs.unlinkSync(filePath);
      
      return s3Key;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get signed URL for file download
   */
  static async getSignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });
      
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate download URL: ${(error as Error).message}`);
    }
  }
  
  /**
   * Delete file from S3
   */
  static async deleteFile(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });
      
      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Download file from S3 to local temp directory
   */
  static async downloadToTemp(s3Key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key
      });
      
      const response = await s3Client.send(command);
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate temp file path
      const tempFilePath = path.join(tempDir, path.basename(s3Key));
      
      // Write to temp file
      const chunks: any[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      return tempFilePath;
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw new Error(`Failed to download file: ${(error as Error).message}`);
    }
  }
  
  /**
   * Check if S3 is configured and available
   */
  static isConfigured(): boolean {
    return USE_S3 && 
           !!process.env.AWS_ACCESS_KEY_ID && 
           !!process.env.AWS_SECRET_ACCESS_KEY && 
           !!process.env.AWS_S3_BUCKET;
  }
}

export default S3StorageService;
