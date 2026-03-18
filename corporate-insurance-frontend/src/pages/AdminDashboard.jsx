import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, Calendar, FileText, Clock, Bell, Settings, BarChart3,
  UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter, LogOut
} from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import AppointmentManagement from '../components/admin/AppointmentManagement';
import PlanManagement from '../components/admin/PlanManagement';
import DashboardOverview from '../components/admin/DashboardOverview';
import AvailabilityManagement from '../components/admin/AvailabilityManagement';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview key={refreshKey} onNavigate={setActiveTab} />;
      case 'users':
        return <UserManagement onUpdate={handleDataUpdate} />;
      case 'appointments':
        return <AppointmentManagement onUpdate={handleDataUpdate} />;
      case 'plans':
        return <PlanManagement onUpdate={handleDataUpdate} />;
      case 'availability':
        return <AvailabilityManagement onUpdate={handleDataUpdate} />;

      default:
        return <DashboardOverview key={refreshKey} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Header */}
      <div className="bg-[#111827] shadow border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-cyan-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user?.email} | Administrator
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

      {/* Navigation Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#111827] shadow border-b border-gray-800-md min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
                  }`}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard Overview
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
                  }`}
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'appointments'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
                  }`}
              >
                <Calendar className="mr-3 h-5 w-5" />
                Appointment Management
              </button>

              <button
                onClick={() => setActiveTab('plans')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'plans'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
                  }`}
              >
                <FileText className="mr-3 h-5 w-5" />
                Insurance Plans
              </button>

              <button
                onClick={() => setActiveTab('availability')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'availability'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-400 hover:bg-[#1F2937] hover:text-white'
                  }`}
              >
                <Clock className="mr-3 h-5 w-5" />
                Agent Availability
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
