import React, { useEffect, useState } from 'react';
import { User } from '../../../backend/src/modules/user/schemas/user.schema'; 
import { UserListApi } from '../API/User/UserList.api'; // Импортируем API

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchParams, setSearchParams] = useState({ name: '', email: '', contactPhone: '' });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const userData = await UserListApi.fetchUsersInfo(searchParams);
            setUsers(userData);
        } catch (err) {
            setError('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch(); // Загружаем пользователей при первом монтировании
    }, []);

    return (
        <div>
            <input type="text" placeholder="Поиск по имени" onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} />
            <button onClick={handleSearch}>Искать</button>
            {loading ? <p>Загрузка...</p> : error ? <p>{error}</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Телефон</th>
                        </tr>
                    </thead>
<tbody>
    {users && users.length > 0 ? (
        users.map((user, index) => (
            <tr key={user._id.toString()}>
                <td>{index}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.contactPhone}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan={4}>Пользователи не найдены</td>
        </tr>
    )}
</tbody>
                    
                </table>
            )}
        </div>
    );
};

export default UserList;