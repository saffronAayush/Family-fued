import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { server } from "../constant";
import { io } from "socket.io-client";
import { Users, BarChart3 } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminStats = () => {
  console.log("in admin stats");
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [questions, setQuestions] = useState([1, 2, 3]);
  const [selected, setSelected] = useState(1);
  const [data, setData] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [liveUsers, setLiveUsers] = useState(0);

  const load = async (q) => {
    try {
      const res = await axios.get(`${server}/api/getquestiondetails/${q}`);
      if (res.data?.success) {
        setData(res.data.question);
        setTotalParticipants(res.data.totalParticipants || 0);
      }
    } catch {}
  };

  useEffect(() => {
    load(selected);
  }, [selected]);

  useEffect(() => {
    const s = io(server, { transports: ["websocket"], withCredentials: true });
    s.on("connect", () => {
      // Identify as admin for socket role tracking
      s.emit("register", { role: "admin" });
    });
    s.on("optionIncremented", (payload) => {
      if (!payload) return;
      if (payload.questionNumber === selected && payload.question) {
        setData(payload.question);
        if (typeof payload.totalParticipants === "number") {
          setTotalParticipants(payload.totalParticipants);
        }
      }
    });
    s.on("liveUsers", (payload) => {
      if (payload && typeof payload.count === "number") {
        setLiveUsers(payload.count);
      }
    });
    return () => s.close();
  }, [selected]);

  const maxOptionCount = useMemo(() => {
    if (!data || !data.answers?.length) return 0;
    return Math.max(...data.answers.map((a) => a.optionCount || 0));
  }, [data]);
  if (!token) {
    return <Navigate to={"/admin"} />;
  }
  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-purple-950 via-blue-950 to-black text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-blue-400/20 bg-blue-900/10 backdrop-blur-md p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/30">
                <BarChart3 className="text-blue-300" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Stats</h1>
                <p className="text-blue-300/80 text-sm">
                  Live submissions per option by question
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-blue-300/80">
                Select Question:
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="bg-blue-950/40 border border-blue-400/30 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400/50"
              >
                {questions.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300">
              Q#{selected}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 inline-flex items-center gap-1">
              <Users size={14} /> {liveUsers}
            </span>
          </div>
        </div>

        {!data ? (
          <div className="text-center text-blue-200/80">Loading…</div>
        ) : (
          <div className="bg-blue-900/15 rounded-2xl p-6 backdrop-blur-md border border-blue-400/20 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">
              Q{data.questionNumber}: {data.question}
            </h2>
            <p className="text-sm text-blue-300/80 mb-4">
              Total participants: {totalParticipants}
            </p>
            <div className="space-y-3">
              {data.answers.map((a) => {
                const pct = maxOptionCount
                  ? Math.round(((a.optionCount || 0) / maxOptionCount) * 100)
                  : 0;
                return (
                  <div
                    key={a.optionNumber}
                    className="relative bg-blue-950/30 border-2 border-blue-700 rounded-xl p-4 hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex justify-between items-center text-sm mb-2 pl-6">
                      <span className="font-medium text-blue-100">
                        {a.text}
                      </span>
                      <span className="font-semibold text-blue-200">
                        {a.optionCount}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-blue-900/30 rounded overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-purple-400 rounded"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
