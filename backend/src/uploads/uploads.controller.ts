// import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UploadsService } from './uploads.service';
// import * as multer from 'multer';

// @Controller('uploads')
// export class UploadsController {
//   constructor(private readonly uploadsService: UploadsService) {}

//   @Post('profile')
//   @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
//   async uploadProfile(@UploadedFile() file: Express.Multer.File) {
//     if (!file) throw new Error('No file uploaded');
//     const url = await this.uploadsService.uploadFile(file, 'profile');
//     return { url };
//   }
// }
