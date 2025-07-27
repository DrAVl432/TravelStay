export const RegisterApi = {
    register: async (email: string, password: string, name: string, contactPhone: string) => {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password, 
                name, 
                contactPhone, 
                role: 'client' // Устанавливаем роль по умолчанию
            }),
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        return await response.json();
    },
};