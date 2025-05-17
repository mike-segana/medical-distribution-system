import React, { useEffect, useState } from "react";
import axios from "axios";
import { REQUESTS_API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [newRequest, setNewRequest] = useState({ inventory_id: "", quantity: 1 });
    const [error, setError] = useState("");
    const [role, setRole] = useState("");
    const [viewingHistory, setViewingHistory] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);

        fetchAvailableItems();

        if (payload.role === "admin") {
            fetchPendingRequests();
        } else {
            fetchMyRequests();
        }
    }, []);

    const fetchMyRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
        } catch (error) {
            setError("Failed to fetch your requests.");
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
            setViewingHistory(false);
        } catch (error) {
            setError("Failed to fetch pending requests.");
        }
    };

    const fetchRequestHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(response.data);
            setViewingHistory(true);
        } catch (error) {
            setError("Failed to fetch request history.");
        }
    };

    const fetchAvailableItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${REQUESTS_API_URL}/requests/available-items`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAvailableItems(response.data);
        } catch (error) {
            setError("Failed to fetch available items.");
        }
    };

    const handleAcceptRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests/${id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPendingRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeclineRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests/${id}/decline`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPendingRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateRequest = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${REQUESTS_API_URL}/requests`, newRequest, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMyRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRequest = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${REQUESTS_API_URL}/requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMyRequests();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Requests</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {role === "user" && (
                <div>
                    <h3>Create New Request</h3>
                    <select
                        value={newRequest.inventory_id}
                        onChange={(e) => setNewRequest({ ...newRequest, inventory_id: parseInt(e.target.value) })}
                    >
                        <option value="">Select Item</option>
                        {availableItems.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} (Available: {item.quantity})
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={newRequest.quantity}
                        onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                    />
                    <button onClick={handleCreateRequest}>Submit Request</button>

                    <h3>My Requests</h3>
                    <ul>
                        {requests.map((req) => (
                            <li key={req.id}>
                                {req.inventory.name} - {req.quantity} units - Status: {req.status}
                                {req.status === "pending" && (
                                    <button onClick={() => handleDeleteRequest(req.id)}>Cancel</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {role === "admin" && (
                <div>
                    <div>
                        <button onClick={fetchPendingRequests} disabled={!viewingHistory}>View Pending Requests</button>
                        <button onClick={fetchRequestHistory} disabled={viewingHistory}>View Request History</button>
                    </div>

                    <h3>{viewingHistory ? "Request History" : "Pending Requests"}</h3>
                    <ul>
                        {requests.map((req) => {
                            const itemAvailable = availableItems.find(item => item.id === req.inventory_id);
                            const availableQty = itemAvailable ? itemAvailable.quantity : "Unknown";

                            return (
                                <li key={req.id}>
                                    {req.inventory.name} - {req.quantity} units requested (Available: {availableQty}) - Status: {req.status} - User: {req.user_id}
                                    {!viewingHistory && (
                                        <>
                                            <button style={{ marginLeft: 10, color: "green" }} onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                                            <button style={{ marginLeft: 5, color: "red" }} onClick={() => handleDeclineRequest(req.id)}>Decline</button>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                </div>
            )}

            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
        </div>
    );
}

export default RequestsPage;
