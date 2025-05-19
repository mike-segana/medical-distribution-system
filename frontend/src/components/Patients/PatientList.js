import React, { useEffect, useState } from "react";
import axios from "axios";
import { PATIENT_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

function PatientList() {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await axios.get(`${PATIENT_API_URL}/patients`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPatients(res.data);
            } catch (err) {
                alert("Failed to load patients");
            }
        };

        fetchPatients();
    }, []);

    const deletePatient = async (id) => {
        const token = localStorage.getItem("token");
        if (!window.confirm("Are you sure you want to delete this patient?")) return;

        try {
            await axios.delete(`${PATIENT_API_URL}/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(patients.filter((p) => p.id !== id));
        } catch (err) {
            alert("Failed to delete patient");
        }
    };

    const editPatient = (id) => {
        navigate(`/edit-patient/${id}`);
    };

    return (
        <div>
            <h3>My Patients</h3>
            <ul>
                {patients.map((p) => (
                    <li key={p.id}>
                        {p.first_name} {p.last_name} - Age: {p.age}, Gender: {p.gender}, Id: {p.id}
                        <button onClick={() => editPatient(p.id)} style={{ marginLeft: "10px" }}>Edit</button>
                        <button onClick={() => deletePatient(p.id)} style={{ marginLeft: "5px", color: "red" }}>Delete</button>
                        <Link to={`/add-vitals/${p.id}`}>
                            <button style={{ marginLeft: "5px" }}>Add Vitals</button>
                        </Link>
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default PatientList;