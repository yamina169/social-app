// src/minio/minio.module.ts
import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MinioService],
  exports: [MinioService], // <-- important: export it
})
export class MinioModule {}
