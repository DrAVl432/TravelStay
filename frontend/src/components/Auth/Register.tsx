import React, { useState } from 'react';
import { RegisterApi } from '../../API/Register.api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { login } = useAuth();

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleContactPhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContactPhone(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await RegisterApi.register(email, password, name, contactPhone);
            setSuccess('Registration successful!');
            login(response);
            console.log(response);
        } catch (error: any) {
            setError('Registration failed: ' + error.message);
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={handleNameChange} required />
            </div>
            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={handleEmailChange} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} required />
            </div>
            <div>
                <label>Contact Phone:</label>
                <input type="text" value={contactPhone} onChange={handleContactPhoneChange} required />
            </div>
            <button type="submit">Register</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>
    );
};

export default Register;