/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioStorageService } from './storage.service';
import { TenantGuard } from 'src/tenant/tenant/tenant.guard';
import { AccessTokenGuard } from 'src/common/access-token/access-token.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly minioStorageService: MinioStorageService) {}

  @UseGuards(TenantGuard)
  @UseGuards(AccessTokenGuard)
  @Post(':accountId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('accountId') accountId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = await this.minioStorageService.uploadFile(
      String(accountId),
      file,
    );
    return { url: fileUrl };
  }

//   @Get(':clienteId')
//   async getImages(@Param('clienteId') clienteId: string) {
//     const urls = await this.minioStorageService.getImagesByCliente(
//       Number(clienteId),
//     );
//     return { images: urls };
//   }
}
