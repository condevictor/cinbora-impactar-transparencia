import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime';

class S3Storage {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async saveFile(fileBuffer: Buffer, filename: string): Promise<void> {
    const ContentType = mime.getType(filename);

    if (!ContentType) {
      throw new Error('File not found');
    }

    console.log('File buffer size:', fileBuffer.length);
    console.log('File content type:', ContentType);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: filename,
      Body: fileBuffer,
      ContentType,
    };

    const command = new PutObjectCommand(params);
    try {
      console.log('Uploading file to S3:', params);
      await this.client.send(command);
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: filename,
    };

    const command = new DeleteObjectCommand(params);
    try {
      console.log('Deleting file from S3:', params);
      await this.client.send(command);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: filename,
    });

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      console.log('Generated signed URL:', url);
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
}

export default S3Storage;