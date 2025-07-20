import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileListApi } from '../API/ProfileList.api'; 
import { User } from '../../../backend/src/modules/user/schemas/user.schema';

const ProfileList: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User >>({});
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [editingField, setEditingField] = useState<keyof User  | 'password' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    const data = await ProfileListApi.fetchUserInfo(user.id);
                    setUserInfo(data);
                    setFormData(data);
                    setError(null);
                } catch (error) {
                    console.error(error);
                    setError('Не удалось загрузить данные пользователя.');
                }
            } else if (!isAuthenticated) {
                setError('Вы не авторизованы, пожалуйста, войдите в систему.');
            }
        };
        fetchUserInfo();
    }, [isAuthenticated, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as keyof User ]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'currentPassword') {
            setCurrentPassword(value);
        } else {
            setNewPassword(value);
        }
    };

    const handleEdit = (field: keyof User  | 'password') => {
        if (field !== 'password' && userInfo) {
            setFormData(prev => ({ ...prev, [field]: userInfo[field] }));
        }
        setEditingField(field);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const updateData: Partial<User > = {};

        if (editingField === 'name' && formData.name) {
            updateData.name = formData.name;
        }

        if (editingField === 'contactPhone' && formData.contactPhone) {
            updateData.contactPhone = formData.contactPhone;
        }

        if (editingField === 'email' && formData.email) {
            updateData.email = formData.email;
        }

        if (editingField === 'password' && currentPassword && newPassword) {
           // updateData.password = newPassword; 
        }

        const filteredData = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== undefined && v !== '')
        );

        try {
            const data = await ProfileListApi.updateUserInfo(user.id, filteredData);
            setUserInfo(prevUserInfo => (prevUserInfo ? { ...prevUserInfo, ...data } : null));
            setCurrentPassword('');
            setNewPassword('');
            setEditingField(null);
            setError(null);
            setFormData({}); // Сбрасываем formData
        } catch (error) {
            console.error(error);
            setError('Не удалось сохранить изменения.');
        }
    };

    return (
        <div>
            {userInfo ? (
                <div>
                    <h1>Профиль пользователя</h1>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <p>
                                Email: 
                                <input 
                                    type="text" 
                                    name="email" 
                                    value={editingField === 'email' ? formData.email || '' : userInfo.email} 
                                    onChange={handleChange} 
                                    disabled={editingField !== 'email'}
                                />
                                <button type="button" onClick={() => handleEdit('email')}>✏️</button>
                            </p>
                            <p>
                                Имя: 
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={editingField === 'name' ? formData.name || '' : userInfo.name} 
                                    onChange={handleChange} 
                                    disabled={editingField !== 'name'}
                                />
                                <button type="button" onClick={() => handleEdit('name')}>✏️</button>
                            </p>
                            <p>
                                Телефон: 
                                <input 
                                    type="text" 
                                    name="contactPhone" 
                                    value={editingField === 'contactPhone' ? formData.contactPhone || '' : userInfo.contactPhone} 
                                    onChange={handleChange} 
                                    disabled={editingField !== 'contactPhone'}
                                />
                                <button type="button" onClick={() => handleEdit('contactPhone')}>✏️</button>
                            </p>
                            <div>
                                Пароль: 
                                {editingField === 'password' ? (
                                    <div>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            placeholder="Текущий пароль"
                                            value={currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="Новый пароль"
                                            value={newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                ) : (
                                    '********'
                                )}
                                <button type="button" onClick={() => handleEdit('password')}>✏️</button>
                            </div>
                        </div>
                        {(editingField !== null) && <button type="submit">Сохранить изменения</button>}
                    </form>
                </div>
            ) : (
                <p>Загрузка...</p>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ProfileList;