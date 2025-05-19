import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { VITALS_API_URL } from "../../config";

function EditVitals() {
    const { id: patientId } = useParams();
    const [form, setForm] = useState({
        heart_rate: "",
        spo2: "",
        respiratory_rate: "",
        mean_bp: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`${VITALS_API_URL}/vitals/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const vital = res.data[0];
                if (vital) {
                    setForm({
                        heart_rate: vital.heart_rate,
                        spo2: vital.spo2,
                        respiratory_rate: vital.respiratory_rate,
                        mean_bp: vital.mean_bp,
                    });
                } else {
                    alert("No vitals found for this patient");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to load vitals");
            });
    }, [patientId]);

    const updateVitals = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(`${VITALS_API_URL}/vitals/${patientId}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate("/view-vitals");
        } catch (err) {
            console.error(err);
            alert("Failed to update vitals");
        }
    };

    return (
        <div>
            <h2>Edit Vitals for Patient #{patientId}</h2>
            <input
                value={form.heart_rate}
                onChange={(e) => setForm({ ...form, heart_rate: e.target.value })}
                placeholder="Heart Rate"
            />
            <input
                value={form.spo2}
                onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                placeholder="SpO2"
            />
            <input
                value={form.respiratory_rate}
                onChange={(e) => setForm({ ...form, respiratory_rate: e.target.value })}
                placeholder="Respiratory Rate"
            />
            <input
                value={form.mean_bp}
                onChange={(e) => setForm({ ...form, mean_bp: e.target.value })}
                placeholder="Mean BP"
            />
            <button onClick={updateVitals}>Update Vitals</button>
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default EditVitals;