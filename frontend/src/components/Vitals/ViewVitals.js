import React, { useState } from "react";
import axios from "axios";
import { VITALS_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

function ViewVitals() {
    const [patientId, setPatientId] = useState("");
    const [vitals, setVitals] = useState([]);
    const navigate = useNavigate();

    const fetchVitals = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${VITALS_API_URL}/vitals/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVitals(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load vitals");
        }
    };

    return (
        <div>
            <h3>View Vitals</h3>
            <input
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
            />
            <button onClick={fetchVitals}>Load Vitals</button>

            {vitals.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Heart Rate</th>
                            <th>SpO2</th>
                            <th>Resp Rate</th>
                            <th>Mean BP</th>
                            <th>Risk Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vitals.map((vital) => (
                            <tr key={vital.id}>
                                <td>{vital.heart_rate}</td>
                                <td>{vital.spo2}</td>
                                <td>{vital.respiratory_rate}</td>
                                <td>{vital.mean_bp}</td>
                                <td>{vital.risk_level}</td>
                                <td>
                                    <button onClick={() => navigate(`/edit-vitals/patient/${patientId}`)}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default ViewVitals;