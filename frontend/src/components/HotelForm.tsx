import React, { useState } from 'react';
import { HotelApi } from '../API/Hotel/Hotel.api';
import '../styles.css';

interface HotelFormProps {
  existingHotel?: {
    id: string;
    title: string;
    description: string;
    images: string[];
  };
  onClose: () => void;
}

const HotelForm: React.FC<HotelFormProps> = ({ existingHotel, onClose }) => {
  const [title, setTitle] = useState(existingHotel?.title || '');
  const [description, setDescription] = useState(existingHotel?.description || '');
  const [images, setImages] = useState<string[]>(existingHotel?.images || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file); // Ожидаем, что поле "files" будет обработано сервером.
    });

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображений');
      }

      const result = await response.json();
      // Логируем ответ сервера для диагностики
        console.log('Server response:', result);

      // Проверка, что результат содержит массив URL-ов
      if (result.images) {
        setImages((prevImages) => [...prevImages, ...result.images]);
      } else {
        throw new Error('Ошибка: сервер не вернул корректные ссылки');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      alert('Ошибка: изображения не были загружены корректно');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleSave = async () => {
    if (title.length < 5 || description.length < 100 || images.length === 0) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const hotelData = {
      title,
      description,
      images, // Теперь отправляются URL вместо Base64
    };

    setIsSaving(true);
    try {
      if (existingHotel) {
        await HotelApi.updateHotel(existingHotel.id, hotelData);
      } else {
        await HotelApi.createHotel(hotelData);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении гостиницы:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="hotel-form">
      <div className="form-header">
        <h2>{existingHotel ? 'Редактировать гостиницу' : 'Добавить гостиницу'}</h2>
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
        <button onClick={handleSave} disabled={isSaving || isUploading || title.length < 5 || description.length < 100 || images.length === 0}>
          {existingHotel ? 'Сохранить изменения' : 'Добавить гостиницу'}
        </button>
        <button onClick={onClose}>Отменить</button>
      </div>
    </div>
  );
};

export default HotelForm;