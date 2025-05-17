import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (role && payload.role !== role) {
            return <Navigate to="/dashboard" replace />;
        }
        
        return children;
    } catch (e) {
        return <Navigate to="/" replace />;
    }
};

export default PrivateRoute;