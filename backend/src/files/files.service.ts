import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { UploadFileDto } from './dto/upload-file.dto';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  private s3 = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:9000', // MinIO
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
    forcePathStyle: true, // required for MinIO
  });

  private bucket = 'files'; // default bucket

  async uploadFile(file: Express.Multer.File, dto: UploadFileDto) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        title: dto.title,
        uploadedBy: dto.uploadedBy,
      },
    });

    await this.s3.send(command);
    return {
      key: file.originalname,
      bucket: this.bucket,
      title: dto.title,
      uploadedBy: dto.uploadedBy,
    };
  }

  async getFileAndMetadata(key: string) {
    // Get metadata
    const headCommand = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const metaResponse = await this.s3.send(headCommand);

    // Get file
    const getCommand = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const fileResponse = await this.s3.send(getCommand);

    return {
      metadata: metaResponse.Metadata,
      file: fileResponse.Body, // stream
      contentType: fileResponse.ContentType,
    };
  }
}
