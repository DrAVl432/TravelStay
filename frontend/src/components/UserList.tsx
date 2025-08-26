import React, { useEffect, useState } from 'react';
import { User } from '../../../backend/src/modules/user/schemas/user.schema';
import { UserListApi } from '../API/User/UserList.api';
import useAuth from '../hooks/useAuth'; 
import { ProfileListApi } from '../API/User/ProfileList.api'; 

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { userRole } = useAuth(); // получаем роль текущего пользователя

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await UserListApi.fetchUsersInfo(q ? ({ q } as any) : {});
      setUsers(userData);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleChangeRole = async (userId: string, newRole: 'client' | 'manager' | 'admin') => {
    try {
      // обновляем на сервере
      const updated = await ProfileListApi.updateUserInfo(userId, { role: newRole } as Partial<User>);
      // синхронизируем локальный стейт
      setUsers((prev) =>
        prev.map((u) => (String(u._id) === String(userId) ? { ...u, role: updated.role } : u))
      );
    } catch (e) {
      alert('Не удалось изменить роль пользователя');
    }
  };

  // Опционально: набор ролей для выпадающего списка
  const roles: Array<'client' | 'manager' | 'admin'> = ['client', 'manager', 'admin'];

  return (
    <div>
      <input
        type="text"
        placeholder="Поиск по имени, email или телефону"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button onClick={handleSearch}>Искать</button>

      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              {userRole === 'admin' && <th>Роль</th>}
              {userRole === 'admin' && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={String(user._id)}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.contactPhone}</td>

                  {userRole === 'admin' && <td>{user.role}</td>}

                  {userRole === 'admin' && (
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(String(user._id), e.target.value as 'client' | 'manager' | 'admin')
                        }
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={userRole === 'admin' ? 6 : 4}>Пользователи не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;