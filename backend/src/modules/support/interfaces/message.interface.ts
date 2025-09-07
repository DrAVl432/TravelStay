export interface Message {
  id: string; // ID сообщения
  author: string; // ID автора сообщения
  sentAt: Date; // Дата и время отправки
  text: string; // Текст сообщения
  readAt?: Date; // Дата, когда сообщение было прочитано
}