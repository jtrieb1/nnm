import { useState } from 'react';
import React from 'react';

const Login: React.FC<{tokenSetter: (token: string) => void }> = (tokenSetter) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    

    return (
        <div>
            <h1>Login</h1>
            <form>
                <label>Username</label>
                <input type='text' value={username} onChange={e => setUsername(e.target.value)} />
                <label>Password</label>
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
                <button type='submit'>Login</button>
            </form>
        </div>
    );
}

export default Login;