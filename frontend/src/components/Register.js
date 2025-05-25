import React, { useState } from "react";
import axios from "axios";
import { AUTH_API_URL } from "../config";
import { Link } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    const register = async () => {
        try {
            const res = await axios.post(`${AUTH_API_URL}/auth/`, { username, password, email, role  });
            alert("Registration successful");
        } catch (err) {
            alert("Registration failed");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input id="username" name="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input id="password" name="password" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
            <input id="email" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input id="email" name="role" placeholder="Role" onChange={(e) => setRole(e.target.value)} />
            <button onClick={register}>Register</button>
            <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
    );
}

export default Register;