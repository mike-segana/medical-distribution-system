import React, { useEffect, useState } from "react";
import axios from "axios";
import { PRESCRIPTION_API_URL } from "../../config";
import { useNavigate, useLocation } from "react-router-dom";

function UpdateSymptomsPrescriptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId;

  const [symptoms, setSymptoms] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);

  const [searchSymptoms, setSearchSymptoms] = useState("");
  const [searchPrescriptions, setSearchPrescriptions] = useState("");

  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!patientId || !token) return;

    const fetchAll = async () => {
      try {
        const [symRes, presRes, recRes] = await Promise.all([
          axios.get(`${PRESCRIPTION_API_URL}/prescriptions/symptoms`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${PRESCRIPTION_API_URL}/prescriptions/prescriptions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/records`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSymptoms(symRes.data);
        setPrescriptions(presRes.data);

        setSelectedSymptoms(recRes.data.symptoms || []);
        setSelectedPrescriptions(recRes.data.prescriptions?.names || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchAll();
  }, [patientId, token]);

  const toggleSymptom = (item) => {
    setSelectedSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const togglePrescription = (item) => {
    setSelectedPrescriptions((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const filteredSymptoms = symptoms.filter((s) =>
    s.name.toLowerCase().includes(searchSymptoms.toLowerCase())
  );
  const filteredPrescriptions = prescriptions.filter((p) =>
    p.name.toLowerCase().includes(searchPrescriptions.toLowerCase())
  );

  const handleUpdate = async () => {
    try {
      const symptomIds = symptoms
        .filter((s) => selectedSymptoms.includes(s.name))
        .map((s) => s.id);
      const prescriptionIds = prescriptions
        .filter((p) => selectedPrescriptions.includes(p.name))
        .map((p) => p.id);

      await axios.put(
        `${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/symptoms`,
        { symptom_ids: symptomIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.put(
        `${PRESCRIPTION_API_URL}/prescriptions/patients/${patientId}/prescriptions`,
        { prescription_ids: prescriptionIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Updated successfully!");
    } catch (err) {
      console.error("Update error", err);
      alert(err.response?.data?.detail || "Update failed.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "1rem" }}>
      <h2>Update Patient Symptoms & Prescriptions</h2>
      <p><strong>Patient ID:</strong> {patientId}</p>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3>Symptoms</h3>
          <input
            type="text"
            placeholder="Search symptoms..."
            value={searchSymptoms}
            onChange={(e) => setSearchSymptoms(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "0.5rem",
              borderRadius: "4px",
              backgroundColor: "#fafafa",
            }}
          >
            {filteredSymptoms.length === 0 ? (
              <p>No symptoms found.</p>
            ) : (
              filteredSymptoms.map((s) => (
                <div
                  key={s.id}
                  onClick={() => toggleSymptom(s.name)}
                  style={{
                    padding: "6px 10px",
                    marginBottom: "4px",
                    cursor: "pointer",
                    backgroundColor: selectedSymptoms.includes(s.name)
                      ? "#007bff"
                      : "white",
                    color: selectedSymptoms.includes(s.name) ? "white" : "black",
                    borderRadius: "4px",
                    userSelect: "none",
                    border: "1px solid #ccc",
                  }}
                  title="Click to toggle selection"
                >
                  {s.name}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <strong>Selected Symptoms:</strong>
            {selectedSymptoms.length === 0 ? (
              <p style={{ fontStyle: "italic" }}>None selected</p>
            ) : (
              <ul
                style={{
                  listStyleType: "none",
                  paddingLeft: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {selectedSymptoms.map((sym) => (
                  <li
                    key={sym}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "15px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => toggleSymptom(sym)}
                    title="Click to remove"
                  >
                    {sym} &times;
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3>Prescriptions</h3>
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchPrescriptions}
            onChange={(e) => setSearchPrescriptions(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "0.5rem",
              borderRadius: "4px",
              backgroundColor: "#fafafa",
            }}
          >
            {filteredPrescriptions.length === 0 ? (
              <p>No prescriptions found.</p>
            ) : (
              filteredPrescriptions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => togglePrescription(p.name)}
                  style={{
                    padding: "6px 10px",
                    marginBottom: "4px",
                    cursor: "pointer",
                    backgroundColor: selectedPrescriptions.includes(p.name)
                      ? "#007bff"
                      : "white",
                    color: selectedPrescriptions.includes(p.name) ? "white" : "black",
                    borderRadius: "4px",
                    userSelect: "none",
                    border: "1px solid #ccc",
                  }}
                  title="Click to toggle selection"
                >
                  {p.name}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <strong>Selected Prescriptions:</strong>
            {selectedPrescriptions.length === 0 ? (
              <p style={{ fontStyle: "italic" }}>None selected</p>
            ) : (
              <ul
                style={{
                  listStyleType: "none",
                  paddingLeft: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {selectedPrescriptions.map((pres) => (
                  <li
                    key={pres}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "15px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => togglePrescription(pres)}
                    title="Click to remove"
                  >
                    {pres} &times;
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={handleUpdate}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Update Records
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>

      {message && (
        <p style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default UpdateSymptomsPrescriptions;