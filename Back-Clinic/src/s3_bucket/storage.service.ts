/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { Readable } from 'stream';

@Injectable()
export class MinioStorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.BUCKET_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
        secretAccessKey: process.env.BUCKET_SECRET_KEY,
      },
    });
  }

  async uploadFile(
    accountId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    console.log('BUCKET_ENDPOINT:----', process.env.BUCKET_ENDPOINT);
    console.log('BUCKET_NAME:-----', process.env.BUCKET_NAME);
    console.log('BUCKET_ACCESS_KEY_ID:----', process.env.BUCKET_ACCESS_KEY_ID);
    console.log('BUCKET_SECRET_KEY:----', process.env.BUCKET_SECRET_KEY);
    console.log('teste1');

    const fileStream = file.buffer
      ? file.buffer
      : fs.createReadStream(file.path);

    const sanitizedFileName = file.originalname.replace(/\s+/g, '_');

    const uniqueId = Date.now();
    const fileKey = `${accountId}/${uniqueId}_${sanitizedFileName}`;

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
      ACL: ObjectCannedACL.public_read,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `${process.env.BUCKET_ENDPOINT}/${process.env.BUCKET_NAME}/${fileKey}`;

    return fileUrl;
  }

  async uploadPDF(
    accountId: string,
    fileBuffer: Buffer,
    contentType: string,
    fileName: string,
  ): Promise<string> {
    if (!fileBuffer) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    const fileKey = `${accountId}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: Readable.from(fileBuffer),
      ContentType: contentType,
      ContentLength: fileBuffer.length,
      ACL: ObjectCannedACL.public_read,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    return `${process.env.BUCKET_ENDPOINT}/${process.env.BUCKET_NAME}/${fileKey}`;
  }

  async createAccountFolder(accountId: string): Promise<string> {
    const folderKey = `${process.env.BUCKET_NAME}/${accountId}/.keep`;

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: folderKey,
      Body: '',
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    return `${process.env.BUCKET_ENDPOINT}/${process.env.BUCKET_NAME}/${accountId}`;
  }

  async getAccountFiles(
    accountId: string,
  ): Promise<{ folders: string[]; files: string[] }> {
    const listParams = {
      Bucket: process.env.BUCKET_NAME,
      Prefix: `${process.env.BUCKET_NAME}/${accountId}/`,
      Delimiter: '/',
    };

    const data = await this.s3Client.send(new ListObjectsV2Command(listParams));

    const files =
      data.Contents?.map((obj) => obj.Key).filter(
        (key) => !key.endsWith('/'),
      ) || [];
    const folders = data.CommonPrefixes?.map((obj) => obj.Prefix) || [];

    return { folders, files };
  }

  async deleteFile(accountId: string, fileName: string): Promise<void> {
    const fileKey = `${accountId}/${fileName}`;

    const deleteParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`Arquivo ${fileKey} deletado com sucesso!`);
    } catch (error) {
      console.error('Erro ao deletar o arquivo:', error);
      throw new Error('Erro ao deletar o arquivo.');
    }
  }
}
