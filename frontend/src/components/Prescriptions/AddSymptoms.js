import React, { useEffect, useState } from "react";
import axios from "axios";
import { PRESCRIPTION_API_URL } from "../../config";
import { useParams, useNavigate } from "react-router-dom";

function AddSymptoms() {
    const { patientId } = useParams();
    const [symptoms, setSymptoms] = useState([]);
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${PRESCRIPTION_API_URL}/prescriptions/symptoms`)
            .then(res => setSymptoms(res.data))
            .catch(err => console.error("Error fetching symptoms", err));
    }, []);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/symptoms`, {
                symptom_ids: selected
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Symptoms added!");
            navigate("/my-patients");
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data.detail) {
                alert(`Error: ${err.response.data.detail}`);
            } else {
                alert("Failed to add symptoms");
            }
        }
    };

    return (
        <div>
            <h3>Add Symptoms</h3>
            {symptoms.map(sym => (
                <label key={sym.id}>
                    <input
                        type="checkbox"
                        value={sym.id}
                        onChange={e => {
                            const id = parseInt(e.target.value);
                            setSelected(prev =>
                                e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                            );
                        }}
                    />
                    {sym.name}
                </label>
            ))}
            <br />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default AddSymptoms;