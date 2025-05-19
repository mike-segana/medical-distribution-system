import React, { useEffect, useState } from "react";
import axios from "axios";
import { PATIENT_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

function MyPatientsPanel() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${PATIENT_API_URL}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
      } catch (err) {
        alert("Failed to load patients");
      }
    };
    fetchPatients();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  const filteredPatients = patients.filter((p) =>
    [p.first_name, p.last_name, p.email, p.phone]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleManageSymptomsClick = () => {
    if (!selectedPatient) return;
    const { id, flag_status } = selectedPatient;

    const route =
      flag_status === "Flagged" || flag_status === "Accepted"
        ? "/update-symptoms-and-prescriptions"
        : "/add-symptoms-and-prescriptions";

    navigate(route, { state: { patientId: id } });
  };

  const handleManageVitalsClick = () => {
    if (!selectedPatient) return;

    const { id, risk_level } = selectedPatient;

    const risk = (risk_level || "na").toLowerCase();

    if (risk === "na" || risk === "" || risk === null) {
      navigate(`/add-vitals/${id}`);
    } else if (["low", "medium", "high"].includes(risk)) {
      navigate(`/edit-vitals/patient/${id}`);
    } else {
      navigate(`/add-vitals/${id}`);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>My Patients</h3>
      <input
        type="text"
        placeholder="Search by name, email or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "1rem",
          width: "100%",
          padding: "0.5rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9f9f9", textAlign: "left" }}>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Risk</th>
              <th>Flag Status</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{
                  backgroundColor: selectedId === p.id ? "#d0ebff" : "white",
                  cursor: "pointer",
                }}
              >
                <td>{p.id}</td>
                <td>{p.first_name}</td>
                <td>{p.last_name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.risk_level}</td>
                <td>{p.flag_status}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={() => selectedId && navigate(`/edit-patient/${selectedId}`)}
          disabled={!selectedId}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            backgroundColor: selectedId ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: selectedId ? "pointer" : "not-allowed",
          }}
        >
          Update Selected Patient
        </button>

        <button
          onClick={handleManageSymptomsClick}
          disabled={!selectedId}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            backgroundColor: selectedId ? "#28a745" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: selectedId ? "pointer" : "not-allowed",
          }}
        >
          Manage Symptoms & Prescriptions
        </button>

        <button
          onClick={handleManageVitalsClick}
          disabled={!selectedId}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            backgroundColor: selectedId ? "#17a2b8" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: selectedId ? "pointer" : "not-allowed",
          }}
        >
          Manage Vitals
        </button>
      </div>
    </div>
  );
}

export default MyPatientsPanel;