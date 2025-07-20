//UserList.api.ts
import { UserInfo } from '../../../backend/src/modules/user/interfaces/UserInfo';
import { User } from '../../../backend/src/modules/user/schemas/user.schema'; // Проверьте правильность пути
import { SearchUserParams } from '../../../backend/src/modules/user/dto/search-user-params.dto';

export const UserListApi = {
    fetchUsersInfo: async (params?: SearchUserParams): Promise<User[]> => {
        const query = new URLSearchParams(params as any).toString(); // Преобразуем параметры в строку запроса
        const response = await fetch(`http://localhost:3000/api/users?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить данные пользователя.');
        }

        return await response.json();
    },

}
