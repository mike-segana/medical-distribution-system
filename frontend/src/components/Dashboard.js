import React, { useEffect, useState } from "react";
import axios from "axios";
import { DASHBOARD_API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import MyPatientsPanel from "../components/DashboardPanels/MyPatientsPanel";
import FlaggedPatientsPanel from "../components/DashboardPanels/FlaggedPatientsPanel";
import HighRiskVitalsPanel from "../components/DashboardPanels/HighRiskVitalsPanel";

function Dashboard() {
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);

        axios.get(`${DASHBOARD_API_URL}/dashboard/${payload.role}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setMessage(res.data.message);
        }).catch(() => {
            setMessage("Access denied");
        });
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <p>{message}</p>
            {role === "admin" && (
                <>
                
                </>
            )}
            {role === "user" && (
                <>
                    
                    <button onClick={() => navigate("/add-patient")}>Add Patient</button>
                    

                    <MyPatientsPanel />
                    <FlaggedPatientsPanel />
                    <HighRiskVitalsPanel />
                </>
            )}
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Dashboard;
//<button onClick={() => navigate("/requests")}>Requests</button>
//<button onClick={() => navigate("/my-patients")}>My Patients</button>
//<button onClick={() => navigate("/view-vitals")}>View Vitals</button>
//<button onClick={() => navigate("/manage-prescriptions")}>Manage Symptoms & Prescriptions</button>
//<button onClick={() => navigate("/update-symptoms-and-prescriptions")}>Update Symptoms & Prescriptions</button>