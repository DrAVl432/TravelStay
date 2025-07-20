// ProfileList.api.ts
import { User } from '../../../backend/src/modules/user/schemas/user.schema'

export const ProfileListApi = {
    fetchUserInfo: async (userId: string) => {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
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

    updateUserInfo: async (userId: string, updateData: Partial<User>) => {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            throw new Error('Не удалось сохранить изменения.');
        }

        return await response.json();
    },
};