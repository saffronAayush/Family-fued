import { useState } from "react";
import FamilyFeud from "./FamilyFeud";
import AdminDashboard from "./components/AdminDashboard";
import AdminStats from "./components/AdminStats";
import "./App.css";
// only to commit
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState("dashboard"); // 'dashboard' | 'stats'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {isAdmin ? (
        <>
          {adminView === "dashboard" ? <AdminDashboard /> : <AdminStats />}
          <div className="fixed bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setAdminView(adminView === "dashboard" ? "stats" : "dashboard")}
              className="px-4 py-2 bg-blue-600 rounded-lg text-white"
            >
              {adminView === "dashboard" ? "Go to Stats" : "Go to Dashboard"}
            </button>
            <button
              onClick={() => setIsAdmin(false)}
              className="px-4 py-2 bg-yellow-500 rounded-lg"
            >
              Switch to FamilyFeud
            </button>
          </div>
        </>
      ) : (
        <>
          <FamilyFeud />
          <button
            onClick={() => setIsAdmin(true)}
            className="fixed bottom-4 right-4 px-4 py-2 bg-yellow-500 rounded-lg"
          >
            Switch to Admin
          </button>
        </>
      )}
    </div>
  );
}

export default App;