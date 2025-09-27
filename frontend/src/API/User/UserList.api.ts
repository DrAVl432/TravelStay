//UserList.api.ts
import { UserInfo } from '../../../../backend/src/modules/user/interfaces/UserInfo';
// import { User } from '../../../../backend/src/modules/user/schemas/user.schema'; 
import { SearchUserParams } from '../../../../backend/src/modules/user/dto/search-user-params.dto';

import { UserRole } from '../../../../backend/src/modules/user/enums/user-role.enum'; // Убедитесь, что путь правильный

// Интерфейс для пользователей на фронтенде
export interface User {
  _id: string; // _id теперь всегда строка на фронтенде
  email: string;
  passwordHash: string;
  name: string;
  contactPhone?: string;
  role?: UserRole;
}

export const UserListApi = {
  fetchUsersInfo: async (params?: Record<string, string>): Promise<User[]> => {
    const query = new URLSearchParams(params as any).toString(); // Преобразуем параметры в строку запроса
    const response = await fetch(`http://localhost:3000/api/users?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить данные пользователей.');
    }

    const users: any[] = await response.json();

    return users.map((user) => ({
      ...user,
      _id: user._id.toString(), // Преобразуем _id в строку
    }));
  },

  fetchUserById: async (userId: string): Promise<User> => {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить данные пользователя.');
    }

    const user: any = await response.json();

    return {
      ...user,
      _id: user._id.toString(), // Преобразуем _id в строку
    };
  },
};
