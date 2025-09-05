import React, { useMemo, useState } from 'react';
import '../styles.css';
import { HotelRoomsApi } from '../API/Hotel/HotelRooms.api';
import { Hotel } from '../types/Hotel.types';



interface ExistingRoom {
  id?: string;
  hotel: Hotel;
  title?: string;
  description?: string;
  images: string[];
  isEnabled?: boolean;
}

interface RoomPayload {
  title: string;
  description: string;
  images: string[];
  isEnabled: boolean;
  hotel: string; // Строка, содержащая идентификатор отеля
}

interface RoomFormProps {
  hotel: Hotel;
  existingRoom?: ExistingRoom;
  onClose: () => void;
  onSaved: () => Promise<void> | void; // колбек для обновления списка снаружи
}

const RoomForm: React.FC<RoomFormProps> = ({ hotel, existingRoom, onClose, onSaved }) => {
  const rid = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const log = (...args: any[]) => console.log('[RoomForm]', `rid=${rid}`, ...args);

  const [title, setTitle] = useState(existingRoom?.title || '');
  const [description, setDescription] = useState(existingRoom?.description || '');
  const [images, setImages] = useState<string[]>(existingRoom?.images || []);
  const [isEnabled, setIsEnabled] = useState<boolean>(existingRoom?.isEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  log('render', {
    isEdit: !!existingRoom,
    hotel,
    roomId: existingRoom?.id,
    images: images.length,
    isEnabled,
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      log('imageUpload:skip:noFiles');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    setIsUploading(true);
    log('imageUpload:start', { files: Array.from(files).map(f => ({ name: f.name, size: f.size })) });
    try {
      const response = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      log('imageUpload:response', { ok: response.ok, status: response.status });

      if (!response.ok) throw new Error('Ошибка загрузки изображений');

      const result = await response.json();
      log('imageUpload:result', result);

      if (result.images && Array.isArray(result.images)) {
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

  const validate = () => {
    if (!hotel || !hotel._id) {
      alert('Отсутствует идентификатор отеля');
      return false;
    }
    if (!title.trim()) {
      alert('Введите название номера');
      return false;
    }
    if (images.length === 0) {
      alert('Добавьте хотя бы одно изображение номера');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    log('save:click', {
      isEdit: !!existingRoom,
      hotel,
      roomId: existingRoom?.id,
      images: images.length,
      isEnabled,
      title: title.length,
      description: description.length,
    });

    if (!validate()) {
      log('save:validation:fail');
      return;
    }

  const payload: RoomPayload = {
    hotel: hotel._id,
    title: title.trim(),
    description,
    images,
    isEnabled,
  };

  // if (!existingRoom?.id) {
  //   payload.hotel = hotel; // Добавляем hotelId только для создания нового номера
  // }

    setIsSaving(true);
    log('save:start', { payload });
    try {
      if (existingRoom?.id) {
        const result = await HotelRoomsApi.updateRoom(existingRoom.id, payload);
        log('save:update:success', { result });
      } else {
        const result = await HotelRoomsApi.createRoom(payload);
        log('save:create:success', { result });
      }

      log('save:onSaved:start');
      await onSaved?.();
      log('save:onSaved:done');

      log('save:onClose:start');
      onClose();
      log('save:onClose:done');
    } catch (error) {
      log('save:error', error);
      alert('Ошибка при сохранении номера');
    } finally {
      setIsSaving(false);
      log('save:finish');
    }
  };

  return (
    <div className="hotel-form">
      <div className="form-header">
        <h2>{existingRoom ? 'Редактировать номер' : 'Добавить номер'}</h2>
      </div>
      <div className="form-content">
        <input
          type="text"
          placeholder="Название номера"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Описание номера"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          Номер активен
        </label>

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

        <button onClick={handleSave} disabled={isSaving || isUploading || images.length === 0 || !title.trim()}>
          {existingRoom ? 'Сохранить изменения' : 'Добавить номер'}
        </button>
        <button onClick={onClose}>Отменить</button>
      </div>
    </div>
  );
};

export default RoomForm;