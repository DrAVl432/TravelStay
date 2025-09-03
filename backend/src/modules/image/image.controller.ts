import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import Busboy from 'busboy';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  async uploadImages(@Req() req: Request, @Res() res: Response) {
    console.log('Upload started');
    try {
      const uploadDirFromEnv = process.env.UPLOAD_DIR || 'static/uploads';
      const uploadsDir = join(process.cwd(), uploadDirFromEnv);
      if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ message: 'Ожидается multipart/form-data' });
      }

      const busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: 10 * 1024 * 1024,
          files: 10,
        },
      });

      const savedFiles: { filename: string; mimetype: string }[] = [];
      const errors: string[] = [];
      const fileWritePromises: Promise<void>[] = []; // Массив обещаний записи файлов

      busboy.on(
        'file',
        (
          fielname: string,
          file: NodeJS.ReadableStream,
          info: { filename: string; mimeType: string; encoding: string },
        ) => {
          const { filename: originalName, mimeType } = info;

          const allowed = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowed.includes(mimeType)) {
            errors.push(`Недопустимый формат файла: ${originalName}`);
            // @ts-ignore
            file.resume?.();
            return;
          }

          const uniqueFilename = `${Date.now()}-${randomBytes(6).toString('hex')}-${originalName}`;
          const savePath = join(uploadsDir, uniqueFilename);
          console.log('File successfully saved:', { path: savePath, name: uniqueFilename });
          const ws = createWriteStream(savePath);

          // @ts-ignore
          file.pipe(ws);

          const filePromise = new Promise<void>((resolve, reject) => {
            ws.on('finish', () => {
              savedFiles.push({ filename: uniqueFilename, mimetype: mimeType });
              console.log('Файл сохранен:', uniqueFilename); // Лог успешного сохранения
              resolve();
            });

            ws.on('error', (err: unknown) => {
              const msg = (err as Error)?.message || 'Неизвестная ошибка';
              errors.push(`Ошибка записи файла ${originalName}: ${msg}`);
              reject(err);
            });

            // @ts-ignore
            file.on?.('limit', () => {
              errors.push(`Файл слишком большой: ${originalName}`);
              try {
                ws.destroy();
              } catch {}
            });
          });

          fileWritePromises.push(filePromise); // Добавляем обещание в массив
        },
      );

      busboy.on('error', (err: unknown) => {
        const msg = (err as Error)?.message || 'Неизвестная ошибка';
        errors.push(`Ошибка Busboy: ${msg}`);
      });

      busboy.on('finish', async () => {
        try {
          await Promise.all(fileWritePromises); // Ждем завершения всех операций записи
          console.log('Saved files:', savedFiles); // Проверяем, содержатся ли файлы в массиве savedFiles
          console.log('Errors:', errors); // Следим за ошибками при записи

          if (savedFiles.length === 0 && errors.length) {
            return res.status(400).json({ message: 'Загрузка не выполнена', errors });
          }

          const images = this.imageService.generateImageUrls(
            savedFiles.map((f) => ({ filename: f.filename })),
            req,
          );
          console.log('Generated URLs:', images); // Проверяем, создаются ли ссылки
          res.status(201).json({ images, errors: errors.length ? errors : undefined });
        } catch (err) {
          const msg = (err as Error)?.message || 'Ошибка завершения загрузки';
          res.status(500).json({ message: 'Ошибка загрузки файлов', error: msg });
        }
      });

      req.pipe(busboy);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Неизвестная ошибка';
      res.status(500).json({ message: 'Внутренняя ошибка сервера', error: msg });
    }
  }
}