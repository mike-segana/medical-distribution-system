import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { PRESCRIPTION_API_URL } from "../../config";

function AddPrescriptions() {
    const { patientId } = useParams();
    const [prescriptions, setPrescriptions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [response, setResponse] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${PRESCRIPTION_API_URL}/prescriptions/prescriptions`)
            .then(res => setPrescriptions(res.data))
            .catch(err => console.error("Error fetching prescriptions", err));
    }, []);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/prescriptions`, {
                prescription_ids: selected
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResponse(res.data.message);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data.detail) {
                alert(`Error: ${err.response.data.detail}`);
            } else {
                alert("Failed to prescribe");
            }
        }
    };

    return (
        <div>
            <h3>Add Prescriptions</h3>
            {prescriptions.map(pres => (
                <label key={pres.id}>
                    <input
                        type="checkbox"
                        value={pres.id}
                        onChange={e => {
                            const id = parseInt(e.target.value);
                            setSelected(prev =>
                                e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                            );
                        }}
                    />
                    {pres.name}
                </label>
            ))}
            <br />
            <button onClick={handleSubmit}>Prescribe</button>
            {response && <p>{response}</p>}
            <button onClick={() => navigate("/my-patients")}>Back</button>
        </div>
    );
}

export default AddPrescriptions;