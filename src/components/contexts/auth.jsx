import { createContext, useState, useContext } from 'react';
import { apiLogin, apiRegister } from '../../lib/api';
import { useNotification } from './notification';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { showNotification } = useNotification();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (username, password) => {
        try {
            const userData = await apiLogin(username, password);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (e) {
            console.error('Login error:', e);
            showNotification(e.message || 'Error al iniciar sesión', 'error');
            return false;
        }
    };

    const register = async (username, password) => {
        try {
            const userData = await apiRegister(username, password);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (e) {
            console.error('Registration error:', e);
            showNotification(e.message || 'Error al registrarse', 'error');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
