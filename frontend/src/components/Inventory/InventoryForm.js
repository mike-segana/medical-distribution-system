import React, { useState } from "react";

function InventoryForm({ onSubmit, submitLabel }) {
    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.quantity) {
            alert("Name and Quantity are required.");
            return;
        }

        // Convert quantity to a number
        const payload = {
            ...formData,
            quantity: parseInt(formData.quantity, 10),
        };

        onSubmit(payload);
        setFormData({ name: "", quantity: "", description: "" }); // Clear after submit
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Item name"
                value={formData.name}
                onChange={handleChange}
            />
            <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
            />
            <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
            />
            <button type="submit">{submitLabel}</button>
        </form>
    );
}

export default InventoryForm;
