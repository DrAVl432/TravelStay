import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ImageService {
  generateImageUrls(files: { filename: string }[], req: Request): string[] {
    const uploadPath = process.env.UPLOAD_DIR || 'static/uploads';
    const host = req.get('host') || `${process.env.HTTP_HOST || 'localhost'}:${process.env.HTTP_PORT || 3000}`;
    const protocol = req.protocol;
  // Логи для отображения значений host, protocol и uploadPath
    console.log('Host:', host);
    console.log('Protocol:', protocol);
    console.log('Upload Path:', uploadPath);
    return files.map((file) => {
      const fullPath = `${protocol}://${host}/${uploadPath}/${encodeURIComponent(file.filename)}`;
      console.log('Полный путь к файлу:', fullPath); // Логирование полного пути
      return fullPath;
    });
  }
}