import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, Edit, Trash2, User, LogOut } from 'lucide-react';
import AvailabilityForm from '../components/AvailabilityForm';
import AvailabilityList from '../components/AvailabilityList';
import AppointmentList from '../components/AppointmentList';
import NotificationList from '../components/NotificationList';
import toast from 'react-hot-toast';
import API from '../api';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    todayAvailability: 0,
    upcomingAppointments: 0,
    totalCustomers: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await API.get('/agent/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const handleAvailabilityCreated = () => {
    setShowAvailabilityForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleAvailabilityUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAvailabilityDeleted = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Availability deleted successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <div className="bg-[#111827] shadow border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-cyan-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user?.email} | {user?.role}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'availability'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              My Availability
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'appointments'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${activeTab === 'notifications'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              Notifications
              {stats.unreadNotifications > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] overflow-hidden shadow-lg rounded-xl border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Today's Availability
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        {stats.todayAvailability} slots
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] overflow-hidden shadow-lg rounded-xl border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Upcoming Appointments
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        {stats.upcomingAppointments} appointments
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] overflow-hidden shadow-lg rounded-xl border border-gray-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Total Customers
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        {stats.totalCustomers} customers
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Manage Your Availability</h2>
              <button
                onClick={() => setShowAvailabilityForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </button>
            </div>

            {showAvailabilityForm && (
              <div className="mb-8">
                <AvailabilityForm
                  onClose={() => setShowAvailabilityForm(false)}
                  onSuccess={handleAvailabilityCreated}
                />
              </div>
            )}

            <AvailabilityList
              key={refreshKey}
              onEdit={() => { }}
              onDelete={handleAvailabilityDeleted}
              onUpdate={handleAvailabilityUpdated}
            />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Your Appointments</h2>
            <AppointmentList
              onUpdate={() => setRefreshKey(prev => prev + 1)}
              userType="agent"
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationList />
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
