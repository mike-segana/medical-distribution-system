import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { VITALS_API_URL } from "../../config";

function HighRiskVitalsPanel() {
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHighRiskPatients = async () => {
      try {
        const response = await axios.get(`${VITALS_API_URL}/vitals/high-risk`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHighRiskPatients(response.data);
      } catch (err) {
        console.error("Error fetching high-risk vitals:", err);
      }
    };

    fetchHighRiskPatients();
  }, [token]);

  const filteredPatients = highRiskPatients.filter((p) =>
    (p.first_name + " " + p.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
      <h3>High Risk Vitals</h3>

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
              <th>Heart Rate</th>
              <th>SpO2</th>
              <th>Resp Rate</th>
              <th>Mean BP</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "1rem" }}>
                  No high-risk patients found.
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
                  <td>{p.heart_rate}</td>
                  <td>{p.spo2}</td>
                  <td>{p.respiratory_rate}</td>
                  <td>{p.mean_bp}</td>
                  <td style={{ color: "red", fontWeight: "bold" }}>{p.risk_level}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() =>
          selectedId && navigate(`/edit-vitals/patient/${selectedId}`)
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

export default HighRiskVitalsPanel;