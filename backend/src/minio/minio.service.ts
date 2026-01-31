import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private client: Minio.Client;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    this.defaultBucket =
      this.configService.get<string>('MINIO_BUCKET') || 'articles';

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error(
        'MINIO_ENDPOINT, MINIO_ACCESS_KEY or MINIO_SECRET_KEY not defined in .env',
      );
    }

    const url = new URL(endpoint);

    this.client = new Minio.Client({
      endPoint: url.hostname,
      port: Number(url.port) || 9000,
      useSSL: url.protocol === 'https:',
      accessKey,
      secretKey,
    });
  }

  // Vérifie si le bucket existe, sinon le crée et rend public
  async ensureBucketExists(bucketName?: string): Promise<void> {
    const name = bucketName || this.defaultBucket;
    const exists = await this.client.bucketExists(name);
    if (!exists) {
      await this.client.makeBucket(
        name,
        this.configService.get<string>('MINIO_REGION') || 'us-east-1',
      );
    }

    // Set bucket policy to public read
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${name}/*`],
        },
      ],
    };

    await this.client.setBucketPolicy(name, JSON.stringify(policy));
  }

  // Upload buffer (pour multer)
  async uploadBuffer(params: {
    bucket?: string;
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<void> {
    const bucket = params.bucket || this.defaultBucket;
    await this.ensureBucketExists(bucket);
    await this.client.putObject(
      bucket,
      params.key,
      params.buffer,
      params.buffer.length,
      { 'Content-Type': params.contentType } as any,
    );
  }

  // Génère un presigned URL pour accéder au fichier
  async getPresignedUrl(
    objectName: string,
    bucketName?: string,
    expires: number = 24 * 60 * 60,
  ): Promise<string> {
    const bucket = bucketName || this.defaultBucket;
    await this.ensureBucketExists(bucket);
    return this.client.presignedUrl('GET', bucket, objectName, expires);
  }

  // Supprime un objet du bucket
  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    const bucket = bucketName || this.defaultBucket;
    await this.ensureBucketExists(bucket);
    await this.client.removeObject(bucket, objectName);
  }
}
