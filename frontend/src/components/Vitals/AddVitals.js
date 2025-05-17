import React, { useState, useEffect } from "react";
import axios from "axios";
import { VITALS_API_URL } from "../../config";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function AddVitals() {
    const { patientId } = useParams();
    const [formData, setFormData] = useState({
        patient_id: patientId || "",
        heart_rate: "",
        spo2: "",
        respiratory_rate: "",
        mean_bp: ""
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (patientId) {
            setFormData((prev) => ({ ...prev, patient_id: patientId }));
        }
    }, [patientId]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.post(`${VITALS_API_URL}/vitals`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Vitals added. Risk level: ${res.data.risk_level}`);
        } catch (err) {
            alert("Failed to add vitals");
        }
    };

    return (
        <div>
            <h3>Add Vitals</h3>
            <input name="heart_rate" placeholder="Heart Rate" onChange={handleChange} />
            <input name="spo2" placeholder="SpO2" onChange={handleChange} />
            <input name="respiratory_rate" placeholder="Respiratory Rate" onChange={handleChange} />
            <input name="mean_bp" placeholder="Mean BP" onChange={handleChange} />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default AddVitals;
