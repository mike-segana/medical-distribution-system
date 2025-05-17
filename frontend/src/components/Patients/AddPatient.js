import React, { useState } from "react";
import axios from "axios";
import { PATIENT_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

function AddPatient() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
    });
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${PATIENT_API_URL}/patients`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Patient added successfully!");
        } catch (err) {
            alert("Failed to add patient");
        }
    };

    return (
        <div>
            <h3>Add Patient</h3>
            <input name="first_name" placeholder="First Name" onChange={handleChange} />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} />
            <input name="age" placeholder="Age" type="number" onChange={handleChange} />
            <input name="gender" placeholder="Gender" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="phone" placeholder="Phone" onChange={handleChange} />
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default AddPatient;