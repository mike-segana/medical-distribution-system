import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { PRESCRIPTION_API_URL } from "../../config";

function ViewPrescriptionRecords() {
    const navigate = useNavigate();
    const { patientId } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/records`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setData(res.data))
        .catch(err => console.error("Error loading patient records", err));
    }, [patientId]);

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h2>Patient Records</h2>
            <h3>Symptoms</h3>
            <ul>
                {(data.symptoms || []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <h3>Prescriptions</h3>
            <ul>
                {(data.prescriptions?.names || []).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <p><strong>Flagged:</strong> {data.prescriptions?.flagged ? "Yes (⚠️ Check)" : "No ✅"}</p>
            <button onClick={() => navigate(`/update-patient-records/${patientId}`)}>Update Records</button>
        </div>
    );
}

export default ViewPrescriptionRecords;