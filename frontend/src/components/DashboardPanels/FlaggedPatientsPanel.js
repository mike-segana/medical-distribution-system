import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PRESCRIPTION_API_URL } from "../../config";

function FlaggedPatientsPanel() {
  const [flaggedPatients, setFlaggedPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlaggedPatients = async () => {
      try {
        const response = await axios.get(
          `${PRESCRIPTION_API_URL}/prescriptions/flagged-patients`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const detailedPatients = await Promise.all(
          response.data.map(async (p) => {
            const record = await axios.get(
              `${PRESCRIPTION_API_URL}/prescriptions/patients/${p.id}/records`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...p,
              first_name: p.first_name || p.name?.split(" ")[0] || "-",
              last_name: p.last_name || p.name?.split(" ")[1] || "-",
              symptoms: record.data.symptoms || [],
              prescriptions: record.data.prescriptions?.names || [],
              age: p.age || "-",
              gender: p.gender || "-",
            };
          })
        );

        setFlaggedPatients(detailedPatients);
      } catch (err) {
        console.error("Error fetching flagged patients:", err);
      }
    };

    fetchFlaggedPatients();
  }, [token]);

  const filteredPatients = flaggedPatients.filter((p) =>
    (p.first_name + " " + p.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>Flagged Patients</h3>

      <input
        type="text"
        placeholder="Search by name or ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "0.5rem",
        }}
      >
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Symptoms</th>
              <th>Prescriptions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  No flagged patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    backgroundColor: selectedId === p.id ? "#d0ebff" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <td>{p.id}</td>
                  <td>{p.first_name}</td>
                  <td>{p.last_name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.symptoms.join(", ")}</td>
                  <td>{p.prescriptions.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() =>
          selectedId &&
          navigate("/update-symptoms-and-prescriptions", {
            state: { patientId: selectedId },
          })
        }
        disabled={!selectedId}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: selectedId ? "#007bff" : "#ccc",
          color: "#fff",
          border: "none",
          cursor: selectedId ? "pointer" : "not-allowed",
          borderRadius: "4px",
        }}
      >
        Update Selected Patient
      </button>
    </div>
  );
}

export default FlaggedPatientsPanel;