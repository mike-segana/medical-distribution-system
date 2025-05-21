import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { PATIENT_API_URL } from "../../config";

function EditPatient() {
    const { id } = useParams();
    const [form, setForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(`${PATIENT_API_URL}/patients`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            const patient = res.data.find((p) => p.id === parseInt(id));
            if (patient) setForm(patient);
            else alert("Patient not found");
        })
        .catch(() => alert("Failed to load patient details"));
    }, [id]);

    const handleUpdate = async () => {
        const token = localStorage.getItem("token");
        try {
            const updateData = {};
            Object.keys(form).forEach((key) => {
                if (form[key] !== "") updateData[key] = form[key];
            });

            await axios.put(`${PATIENT_API_URL}/patients/${id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Patient updated");
        } catch (err) {
            alert("Failed to update patient");
        }
    };

    return (
        <div>
            <h2>Edit Patient</h2>
            <input placeholder="First Name" value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input placeholder="Last Name" value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <input type="number" placeholder="Age" value={form.age || ""} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <select value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <button onClick={handleUpdate}>Update Patient</button>
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default EditPatient;