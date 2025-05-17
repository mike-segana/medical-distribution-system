import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AUTH_API_URL } from "../config";
import { Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            const form = new URLSearchParams();
            form.append("username", username);
            form.append("password", password);

            const res = await axios.post(`${AUTH_API_URL}/auth/token`, form);
            const token = res.data.access_token;

            localStorage.setItem("token", token);
            navigate("/Dashboard");
        } catch (err) {
            console.error(err); 
            if (err.response) {
                alert(`Login failed: ${err.response.data.message || 'An error occurred'}`);
            } else if (err.request) {
                alert("Login failed: No response from server");
            } else {
                alert(`Login failed: ${err.message}`);
            }
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input 
                id="username" 
                name="username" 
                placeholder="Username" 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                id="password" 
                name="password" 
                placeholder="Password" 
                type="password" 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={login}>Login</button>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    );
}

export default Login;
