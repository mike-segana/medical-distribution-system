import React, { useState } from "react";

function InventoryItem({ item, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState({
        name: item.name,
        quantity: item.quantity,
        description: item.description || "",
    });
    
    const handleSave = () => {
        onUpdate(item.id, editedItem);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                <input
                    type="text"
                    value={editedItem.name}
                    onChange={(e) =>setEditedItem({ ...editedItem, name: e.target.value })}
                    placeholder="Name"
                />
                <input
                    type="number"
                    value={editedItem.quantity}
                    onChange={(e) => setEditedItem({ ...editedItem, quantity: parseInt(e.target.value) })}
                    placeholder="Quantity"
                />
                <input
                    type="text"
                    value={editedItem.description}
                    onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                    placeholder="Description"
                />
                <button onClick={handleSave} >Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
        );
    }

    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <p><strong>{item.name}</strong></p>
            <p>Quantity: {item.quantity}</p>
            <p>Description: {item.description}</p>
            <button onClick={() => setIsEditing(true)} style={{ marginRight: '10px' }}>Update</button>
            <button onClick={() => onDelete(item.id)}>Delete</button>

        </div>
    );
}

export default InventoryItem;