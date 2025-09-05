import React, { useState } from 'react';
import { HotelApi } from '../API/Hotel/Hotel.api';
import '../styles.css';
import { Hotel } from '../types/Hotel.types';

interface HotelFormProps {
hotel?: Hotel;
  onClose: () => void;
  onUpdate: () => void ;
}

const HotelForm: React.FC<HotelFormProps> = ({ hotel, onClose, onUpdate }) => {
  const [title, setTitle] = useState(hotel?.title || '');
  const [description, setDescription] = useState(hotel?.description || '');
  const [images, setImages] = useState<string[]>(hotel?.images || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

    const rid = Math.random().toString(36).slice(2, 8);
  const log = (...args: any[]) => console.log('[HotelForm]', `rid=${rid}`, ...args);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      log('imageUpload:skip:noFiles');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file); // Ожидаем, что поле "files" будет обработано сервером.
    });

    setIsUploading(true);
    log('imageUpload:start', { files: Array.from(files).map(f => ({ name: f.name, size: f.size })) });
    try {
      const response = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData,
      });
 log('imageUpload:response', { ok: response.ok, status: response.status });
      if (!response.ok) {
        throw new Error('Ошибка загрузки изображений');
      }

      const result = await response.json();
      // Логируем ответ сервера для диагностики
        log('imageUpload:result', result);

      // Проверка, что результат содержит массив URL-ов
      if (result.images) {
        setImages((prev) => {
          const next = [...prev, ...result.images];
          log('imageUpload:setImages', { prevCount: prev.length, nextCount: next.length });
          return next;
        });
      } else {
        throw new Error('Ошибка: сервер не вернул корректные ссылки');
      }
    } catch (error) {
      log('imageUpload:error', error);
      alert('Ошибка: изображения не были загружены корректно');
    } finally {
      setIsUploading(false);
      log('imageUpload:finish');
    }
  };

  const handleImageDelete = (index: number) => {
     log('imageDelete:click', { index });
    setImages((prev) => {
      const next = prev.slice();
      next.splice(index, 1);
      log('imageDelete:setImages', { prevCount: prev.length, nextCount: next.length });
      return next;
    });
  };

  //(title.length < 5 || description.length < 100 || images.length === 0) 

  const handleSave = async () => {
    log('save:click', { titleLen: title.length, imagesCount: images.length });
    if (title.length < 5 || images.length === 0) {
      log('save:validation:fail');
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const hotelData = {
      title: title.trim(),
      description: description.trim(),
      images,
    };

    setIsSaving(true);
    // log('save:start', { isEdit: !!hotel, id: hotel?.id, payload: hotelData });
    try {
      if (hotel) {
        await HotelApi.updateHotel(hotel._id, hotelData);
        log('save:update:success');
      } else {
        await HotelApi.createHotel(hotelData);
        log('save:create:success');
      }

      log('save:onUpdate:start');
      await onUpdate();
      log('save:onUpdate:done');

      log('save:onClose:start');
      onClose();
      log('save:onClose:done');
    } catch (error) {
      log('save:error', error);
      console.error('Ошибка при сохранении гостиницы:', error);
    } finally {
      setIsSaving(false);
      log('save:finish');
    }
  };

  //   log('render', {
  //   isEdit: !!hotel,
  //   initialId: hotel: hotel._id,
  //   titleLen: title.length,
  //   imagesCount: images.length,
  // });

  return (
    <div className="hotel-form">
      <div className="form-header">
        <h2>{hotel ? 'Редактировать гостиницу' : 'Добавить гостиницу'}</h2>
      </div>
      <div className="form-content">
        <input
          type="text"
          placeholder="Название отеля (минимум 5 символов)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Описание отеля (минимум 100 символов)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="image-preview">
          {images.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image} alt={`Превью ${index}`} />
              <button onClick={() => handleImageDelete(index)}>Удалить</button>
            </div>
          ))}
        </div>
        {images.length < 10 && (
          <input
            type="file"
            multiple
            accept="image/png, image/jpg, image/jpeg, image/webp"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        )}
        <button onClick={handleSave} disabled={isSaving || isUploading || title.length < 5 || images.length === 0}>
          {/* <button onClick={handleSave} disabled={isSaving || isUploading || title.length < 5 || description.length < 100 || images.length === 0}></button> */}
          {hotel ? 'Сохранить изменения' : 'Добавить гостиницу'}
        </button>
        <button onClick={onClose}>Отменить</button>
      </div>
    </div>
  );
};

export default HotelForm;