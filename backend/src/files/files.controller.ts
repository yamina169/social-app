import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { Response } from 'express';
import { Readable } from 'stream';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    return this.filesService.uploadFile(file, dto);
  }

  // GET file + metadata
  @Get(':key')
  async getFile(
    @Param('key') key: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.filesService.getFileAndMetadata(key);
      const file = result.file as Readable;
      const metadata = result.metadata ?? {};
      const contentType = result.contentType ?? 'application/octet-stream';

      // Set metadata headers (optional)
      if (metadata.title) res.setHeader('X-File-Title', metadata.title);
      if (metadata.uploadedby)
        res.setHeader('X-File-UploadedBy', metadata.uploadedby);

      // Force download if query param
      if (download === 'true') {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
      } else {
        // inline display for browser
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${key}"`);
      }

      // Stream the file
      file.pipe(res);
    } catch (error) {
      throw new HttpException(
        `File not found or error retrieving: ${error.message}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
