import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Lock, UnlockKeyhole, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
const [stats, setStats] = useState({
    stats: {},
    topFive: [
        {option: "Exams 📚", count: 5, percentage: 12},
        {option: "Social Pressure", count: 3, percentage: 50},
        {option: "Lack of Time", count: 5, percentage: 20},
        {option: "Financial Issues", count: 9, percentage: 18},
        {option: "Mental Health", count: 10, percentage: 0}
    ]
});
const [currentQuestion, setCurrentQuestion] = useState({text: "What’s the most common breakup reason in college?"});
const [isLocked, setIsLocked] = useState(false);
const [token, setToken] = useState(localStorage.getItem('adminToken'));
const [password, setPassword] = useState('');
const [error, setError] = useState('');

//   useEffect(() => {
//     if (token) {
//       // Listen for stats updates
//       socket.on('stats_update', (newStats) => {
//         setStats(newStats);
//       });

//       // Listen for question state
//       socket.on('question_state', ({ question, locked }) => {
//         setCurrentQuestion(question);
//         setIsLocked(locked);
//       });

//       socket.emit('admin_join', token);
//     }

//     return () => {
//       socket.off('stats_update');
//       socket.off('question_state');
//     };
//   }, [token]);



const handleLogin = async (e) => {
e.preventDefault();
try {
    const response = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
    });

    if (!response.ok) throw new Error('Invalid credentials');

    const data = await response.json();
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
} catch (err) {
    setError('Invalid admin password');
    setTimeout(() => setError(''), 3000);
}
};

const handleAdvanceQuestion = async () => {
try {
    await fetch('http://localhost:3000/api/admin/advance', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });
} catch (err) {
    setError('Failed to advance question');
    setTimeout(() => setError(''), 3000);
}
};

const handleToggleLock = async () => {
try {
    await fetch('http://localhost:3000/api/admin/lock', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locked: !isLocked })
    });
} catch (err) {
    setError('Failed to toggle lock');
    setTimeout(() => setError(''), 3000);
}
};

if (!token) {
return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
    <motion.form 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleLogin}
        className="w-full max-w-md p-8 bg-blue-900/20 rounded-xl shadow-xl backdrop-blur-sm"
    >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Admin Login</h2>
        {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin Password"
        className="w-full p-3 bg-blue-950/40 border border-blue-400/30 rounded-lg mb-4 text-white"
        />
        <button
        type="submit"
        className="w-full p-3 bg-black hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
        >
        Login
        </button>
    </motion.form>
    </div>
);
}

return (
<div className="min-h-screen w-full p-6 bg-black">
    <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex gap-4">
        <button
            onClick={handleToggleLock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            isLocked 
                ? 'bg-red-500/80 hover:bg-red-600/80 text-white'
                : 'bg-green-500/80 hover:bg-green-600/80 text-white'
            }`}
        >
            {isLocked ? <Lock size={20} /> : <UnlockKeyhole size={20} />}
            {isLocked ? 'Unlock Question' : 'Lock Question'}
        </button>
        <button
            onClick={handleAdvanceQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg text-white font-semibold transition-colors"
        >
            <ArrowRight size={20} />
            Next Question
        </button>
        </div>
    </div>

    {/* Current Question */}
    {currentQuestion && (
        <div className="bg-blue-900/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-4">Current Question</h2>
        <p className="text-blue-100 text-lg mb-2">{currentQuestion.text}</p>
        <div className="flex items-center gap-2 text-blue-300">
            <Users size={20} />
            <span>{stats?.totalResponses || 0} responses</span>
        </div>
        </div>
    )}

    {/* Statistics */}
    {stats && (
        <div className="bg-blue-900/20 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Response Statistics</h2>
        <div className="grid gap-4">
            {stats.topFive?.map(({ option, count, percentage }) => (
            <div key={option} className="flex items-center gap-4">
                <div className="w-32 text-blue-100">{option}</div>
                <div className="flex-1 h-8 bg-blue-950/40 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-blue-500/50 rounded-full"
                />
                </div>
                <div className="w-20 text-right text-blue-200">{count} ({percentage}%)</div>
            </div>
            ))}
        </div>
        </div>
    )}
    </div>
</div>
);
};

export default AdminDashboard;
