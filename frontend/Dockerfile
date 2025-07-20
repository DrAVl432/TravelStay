# Dockerfile for React Frontend

# Используем Node.js как базовый образ
FROM node:18 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы
COPY . .

# Собираем проект
RUN npm run build

# Используем Nginx для раздачи статики
FROM nginx:alpine

# Копируем собранные файлы из предыдущего образа
COPY --from=build /app/build /usr/share/nginx/html

# Экспонируем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]