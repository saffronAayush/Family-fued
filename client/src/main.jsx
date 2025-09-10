import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./components/AdminDashboard";
import FamilyFeud from "./FamilyFeud";
import AdminStats from "./components/AdminStats.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin-stats" element={<AdminStats />} />
    </Routes>
  </BrowserRouter>
);
