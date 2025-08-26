import React, { useEffect, useState } from 'react';
import { User } from '../../../backend/src/modules/user/schemas/user.schema';
import { UserListApi } from '../API/User/UserList.api';const UserList: React.FC = () => {
const [users, setUsers] = useState<User[]>([]);
const [q, setQ] = useState('');
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null); const handleSearch = async () => {
setLoading(true);
setError(null);
try {
const userData = await UserListApi.fetchUsersInfo(q ? { q } as any : {});
setUsers(userData);
} catch (err) {
setError('Ошибка загрузки пользователей');
} finally {
setLoading(false);
}
}; useEffect(() => {
handleSearch();
}, []); return (
<div>
<input type="text" placeholder="Поиск по имени, email или телефону" value={q} onChange={(e) => setQ(e.target.value)}
/>
<button onClick={handleSearch}>Искать</button>

{loading ? <p>Загрузка...</p> : error ? <p>{error}</p> : (
<table>
<thead>
<tr>
<th>#</th>
<th>Имя</th>
<th>Email</th>
<th>Телефон</th>
</tr>
</thead>
<tbody>
{users && users.length > 0 ? (
users.map((user, index) => (
<tr key="{user._id.toString()}">
<td>{index + 1}</td>
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
};export default UserList;