import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import InventoryPage from "./components/Inventory/InventoryPage";
import RequestsPage from "./components/Requests/RequestsPage";
import AddPatient from "./components/Patients/AddPatient";
import AddVitals from "./components/Vitals/AddVitals";
import PatientList from "./components/Patients/PatientList";
import ViewVitals from "./components/Vitals/ViewVitals";
import EditPatient from "./components/Patients/EditPatient";
import EditVitals from "./components/Vitals/EditVitals";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<PrivateRoute role="admin"><InventoryPage /></PrivateRoute>}/>
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/add-patient" element={<PrivateRoute role="user"><AddPatient /></PrivateRoute>} />
                <Route path="/add-vitals/:patientId" element={<PrivateRoute role="user"><AddVitals /></PrivateRoute>} />
                <Route path="/my-patients" element={<PrivateRoute role="user"><PatientList /></PrivateRoute>} />
                <Route path="/view-vitals" element={<PrivateRoute role="user"><ViewVitals /></PrivateRoute>} />
                <Route path="/edit-patient/:id" element={<PrivateRoute role="user"><EditPatient /></PrivateRoute>} />
                <Route path="/edit-vitals/patient/:id" element={<EditVitals />} />
            </Routes>
        </Router>
    );
}

export default App;