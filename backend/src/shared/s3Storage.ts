import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime';
import { config } from '@config/dotenv';
import { v4 as uuidv4 } from 'uuid'; 

class S3Storage {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId!,
        secretAccessKey: config.awsSecretAccessKey!,
      },
    });
  }

  async saveFile(fileBuffer: Buffer, filename: string): Promise<string> {
    const ContentType = mime.getType(filename);

    if (!ContentType) {
      throw new Error('File not found');
    }

    console.log('File buffer size:', fileBuffer.length);
    console.log('File content type:', ContentType);

    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}-${filename}`;

    const params = {
      Bucket: config.awsS3BucketName!,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType,
    };

    const command = new PutObjectCommand(params);
    try {
      console.log('Uploading file to S3:', params);
      await this.client.send(command);
      console.log('File uploaded successfully');
      return `https://${config.awsS3BucketName}.s3.${config.awsRegion}.amazonaws.com/${uniqueFilename}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const params = {
      Bucket: config.awsS3BucketName!,
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
}

export default S3Storage;