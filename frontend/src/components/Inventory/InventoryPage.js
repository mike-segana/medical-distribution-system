import React, { useEffect, useState } from "react";
import axios from "axios";
import { INVENTORY_API_URL } from "../../config";
import InventoryForm from "./InventoryForm";
import InventoryItem from "./InventoryItem";
import { useNavigate } from "react-router-dom";

function InventoryPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(""); 
    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${INVENTORY_API_URL}/inventory`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            setError("Failed to fetch inventory items.");
            console.error("Error fetching inventory:", error);
        }
    };

    const handleAddItem = async (item) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${INVENTORY_API_URL}/inventory`, item, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems([...items, response.data]); 
        } catch (error) {
            setError("Failed to add item.");
            console.error("Error adding item:", error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${INVENTORY_API_URL}/inventory/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(items.filter((item) => item.id !== id));
            console.log(response.data.message);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.detail);
            } else {
                setError("Failed to delete item.");
            }
            console.error("Error deleting item:", error);
        }
    };
    

    const handleUpdateItem = async (id, updatedItem) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${INVENTORY_API_URL}/inventory/${id}`, updatedItem, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(items.map((item) => (item.id === id ? response.data : item)));
        } catch (error) {
            setError("Failed to update item.");
            console.error("Error updating item:", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <div>
            <h2>Inventory</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <InventoryForm onSubmit={handleAddItem} submitLabel="Add Item" />
            <br />
            <button onClick={() => navigate("/Dashboard")}>Back to Dashboard</button>
            <ul>
                {items.length > 0 ? (
                    items.map((item) => (
                        <InventoryItem
                            key={item.id}
                            item={item}
                            onDelete={handleDeleteItem}
                            onUpdate={handleUpdateItem}
                        />
                    ))
                ) : (
                    <p>No inventory items available</p>
                )}
            </ul>
        </div>
    );
}

export default InventoryPage;
