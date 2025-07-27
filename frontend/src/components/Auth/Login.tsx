import React, { useState } from 'react';
import { Loginapi } from '../../API/AUT/Login.api';
import { useAuth } from '../../context/AuthContext'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { login } = useAuth();

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
               try {
                   const response = await Loginapi.register(email, password);
                   setSuccess('Registration successful!');
                   login(response); // Сохраняем пользователя в AuthContext
                   console.log(response);
               } catch (error: any) {
                   setError('Registration failed: ' + error.message);
                   console.error(error);
               }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={handleEmailChange} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} required />
            </div>
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;