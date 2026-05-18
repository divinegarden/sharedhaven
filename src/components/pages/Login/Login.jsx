import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/auth';
import "./Login.css";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/home');
        }
    };

    return (
        <main className="login">
            <form onSubmit={handleSubmit}>
                <h1>Iniciar sesión</h1>

                <div className="info">
                    <input 
                        type="text" 
                        placeholder="Usuario" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit"><i className="fa-solid fa-check"></i></button>
            </form>
        </main>
    );
}

export default Login;
