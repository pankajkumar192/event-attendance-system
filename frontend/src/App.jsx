import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import QRCode from 'qrcode.react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { Download, Users, CheckCircle, Clock, Mail, User, BarChart3, Activity, Scan, Wifi, Zap } from 'lucide-react';

// --- API and Socket Configuration ---
const API_URL = 'http://localhost:4000/api';
const SOCKET_URL = 'http://localhost:4000';
const socket = io(SOCKET_URL);

// --- The Main Application Component ---
const EventManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [participants, setParticipants] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [generatedQR, setGeneratedQR] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // --- Data Fetching and Real-Time Updates ---
  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchParticipants();

    // Listen for real-time updates from the server
    const handleUpdate = (updatedParticipant) => {
      setParticipants(prev => {
        const exists = prev.some(p => p.id === updatedParticipant.id);
        if (exists) {
          return prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p);
        }
        return [updatedParticipant, ...prev];
      });
    };
    socket.on('attendanceUpdate', handleUpdate);

    // Clean up the socket listener
    return () => socket.off('attendanceUpdate', handleUpdate);
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`${API_URL}/participants`);
      setParticipants(res.data.participants);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  };

  // --- Core Functions ---
  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsLoading(true);
    setGeneratedQR(null);
    try {
      const res = await axios.post(`${API_URL}/register`, formData);
      setGeneratedQR(res.data.participant);
      setFormData({ name: '', email: '' });
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (result) => {
    try {
      const data = JSON.parse(result);
      if (!data.regId) throw new Error();
      
      const response = await axios.post(`${API_URL}/scan`, { regId: data.regId });
      setScanResult({
        type: 'success',
        message: `Welcome, ${response.data.participant.name}!`,
        details: response.data.message,
      });
    } catch (error) {
      setScanResult({
        type: 'error',
        message: 'Scan Failed',
        details: error.response?.data?.error || 'Invalid QR code.',
      });
    }
    setTimeout(() => setScanResult(null), 5000);
  };
  
  const handleManualCheckIn = (regId) => {
      handleScan(JSON.stringify({ regId }));
  };

  const exportToExcel = () => {
    window.location.href = `${API_URL}/export`;
  };

  // --- Filtering and Memoized Calculations ---
  const filteredParticipants = React.useMemo(() => {
    return participants.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
                            p.email.toLowerCase().includes(searchLower) ||
                            p.regId.toLowerCase().includes(searchLower);

      const status = p.Attendance ? 'present' : 'absent';
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [participants, searchTerm, filterStatus]);
  
  const stats = React.useMemo(() => {
    const present = participants.filter(p => p.Attendance).length;
    const total = participants.length;
    return {
      present,
      total,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [participants]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-[Inter,sans-serif]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-indigo-400"/>
            <h1 className="text-2xl font-bold text-white tracking-tight">EventPro</h1>
          </div>
          <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 p-1 rounded-lg">
            <button onClick={() => setActiveTab('register')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'register' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Register</button>
            <button onClick={() => setActiveTab('scanner')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'scanner' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Scanner</button>
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Dashboard</button>
          </div>
        </header>

        {/* Main Content Area */}
        <main>
          {/* Registration Tab */}
          {activeTab === 'register' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-white">Participant Registration</h2>
                <p className="text-gray-400 mt-2">Enter details to generate a unique QR pass for event check-in.</p>
                <form onSubmit={handleRegistration} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                    <input type="email" id="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500">
                    {isLoading ? 'Generating Pass...' : 'Register & Generate Pass'}
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                {generatedQR ? (
                  <div className="text-center animate-fade-in">
                    <div className="p-4 bg-white rounded-lg inline-block">
                      <QRCode value={JSON.stringify({ regId: generatedQR.regId })} size={160} />
                    </div>
                    <h3 className="text-lg font-bold text-white mt-4">{generatedQR.name}</h3>
                    <p className="font-mono bg-gray-700 px-2 py-1 rounded text-sm mt-1">{generatedQR.regId}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <User className="w-16 h-16 mx-auto mb-2"/>
                    <p>QR Pass will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scanner Tab */}
          {activeTab === 'scanner' && (
             <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white">Attendance Scanner</h2>
                <p className="text-gray-400 mt-2">Point the camera at a QR pass to check in a participant.</p>
                <div className="mt-8 max-w-md mx-auto rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg">
                    <QrScanner onDecode={handleScan} onError={console.error} />
                </div>
                {scanResult && (
                    <div className={`mt-6 max-w-md mx-auto p-4 rounded-lg text-center font-semibold text-white ${scanResult.type === 'success' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                    <p className="text-lg">{scanResult.message}</p>
                    <p className="text-sm opacity-80">{scanResult.details}</p>
                    </div>
                )}
             </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Users} title="Total Registered" value={stats.total} color="indigo"/>
                    <StatCard icon={CheckCircle} title="Present" value={stats.present} color="green"/>
                    <StatCard icon={Clock} title="Absent" value={stats.absent} color="amber"/>
                    <StatCard icon={BarChart3} title="Attendance Rate" value={`${stats.rate}%`} color="sky"/>
                </div>

                {/* Participant Table */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl">
                    <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-700">
                      <div>
                        <h3 className="text-lg font-medium text-white">Participant List</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1"><Wifi className="w-4 h-4 text-green-400"/>Live updates enabled</p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-auto bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="all">All</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                        <button onClick={exportToExcel} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-indigo-700">
                          <Download className="w-4 h-4 mr-2"/>
                          Export
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Check-in Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {filteredParticipants.map(p => (
                            <tr key={p.regId} className="hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{p.name}</div>
                                <div className="text-sm text-gray-400">{p.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.Attendance ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {p.Attendance ? 'Present' : 'Absent'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                                {p.Attendance ? new Date(p.Attendance.timestamp).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {!p.Attendance && (
                                    <button onClick={() => handleManualCheckIn(p.regId)} className="text-indigo-400 hover:text-indigo-300 font-medium">
                                        Check In
                                    </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
      indigo: 'text-indigo-400 bg-indigo-900/50',
      green: 'text-green-400 bg-green-900/50',
      amber: 'text-amber-400 bg-amber-900/50',
      sky: 'text-sky-400 bg-sky-900/50',
    };
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    );
};

export default EventManagementSystem;