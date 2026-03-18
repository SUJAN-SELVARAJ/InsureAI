import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, FileText, Bell, LogOut } from 'lucide-react';
import AppointmentScheduler from '../components/AppointmentScheduler';
import AppointmentList from '../components/AppointmentList';
import InsurancePlanList from '../components/InsurancePlanList';
import toast from 'react-hot-toast';
import API from '../api';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isOptingIn, setIsOptingIn] = useState(false);
  const [myPlans, setMyPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePlans: 0
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'my-plans') {
      fetchMyPlans();
    }
  }, [refreshKey, activeTab]);

  const fetchMyPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await API.get('/customer/plans');
      setMyPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch my plans', error);
      toast.error('Failed to fetch your plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/customer/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const handleAppointmentBooked = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Appointment booked successfully!');
  };

  const handleAppointmentUpdated = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Appointment updated successfully!');
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleOptIn = async () => {
    if (!selectedPlan) return;
    
    setIsOptingIn(true);
    try {
      await API.post(`/customer/plans/${selectedPlan.id}/opt-in`);
      toast.success('Successfully opted in to ' + selectedPlan.planName + '!');
      setSelectedPlan(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to opt in to plan');
    } finally {
      setIsOptingIn(false);
    }
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
                <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
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
              onClick={() => setActiveTab('book-appointment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'book-appointment'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-appointments'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab('my-plans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-plans'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              My Plans
            </button>
            <button
              onClick={() => setActiveTab('insurance-plans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'insurance-plans'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              Insurance Plans
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
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Active Insurance Plans
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        {stats.activePlans} plans
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'book-appointment' && (
          <AppointmentScheduler onSuccess={handleAppointmentBooked} />
        )}

        {activeTab === 'my-appointments' && (
          <AppointmentList
            key={refreshKey}
            onUpdate={handleAppointmentUpdated}
            userType="customer"
          />
        )}

        {activeTab === 'my-plans' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">My Insurance Plans</h2>
            {loadingPlans ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myPlans.length === 0 ? (
              <div className="text-center py-12 bg-[#111827] rounded-xl shadow-lg border border-gray-800">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Active Plans</h3>
                <p className="text-gray-400">You haven't opted into any insurance plans yet.</p>
                <button
                  onClick={() => setActiveTab('insurance-plans')}
                  className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                >
                  Browse Plans
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlans.map((customerPlan) => (
                  <div key={customerPlan.id} className="bg-[#111827] rounded-lg shadow-md border border-gray-800 overflow-hidden border border-gray-800">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{customerPlan.plan.planName}</h3>
                          <p className="text-sm font-medium text-cyan-500">{customerPlan.plan.planType}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {customerPlan.status}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-400"><span className="font-medium">Policy No:</span> {customerPlan.policyNumber}</p>
                        <p className="text-sm text-gray-400"><span className="font-medium">Valid from:</span> {new Date(customerPlan.startDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-400"><span className="font-medium">Valid to:</span> {new Date(customerPlan.endDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-400"><span className="font-medium">Premium:</span> ${customerPlan.premiumAmount.toFixed(2)}/mo</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insurance-plans' && (
          <InsurancePlanList onSelectPlan={handlePlanSelect} userType="customer" />
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-lg p-6 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedPlan.planName}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-900 text-cyan-200">
                {selectedPlan.planType}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-gray-300 mb-6 border-gray-800 border-b pb-6">
              <p className="whitespace-pre-wrap">{selectedPlan.description || 'No description available for this plan.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#1F2937] p-4 rounded-lg border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">Coverage</span>
                <span className="font-semibold text-lg text-white">
                  {selectedPlan.coverageAmount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedPlan.coverageAmount) : 'N/A'}
                </span>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-lg border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">Premium</span>
                <span className="font-semibold text-lg text-white">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedPlan.premiumAmount)}/mo
                </span>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-lg border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-400 uppercase tracking-wider mb-1">Duration</span>
                <span className="font-semibold text-lg text-white">
                  {selectedPlan.durationMonths} months
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-4 border-t pt-6">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-6 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-[#1F2937] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setActiveTab('book-appointment');
                }}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Book Appointment to Discuss
              </button>
              <button
                onClick={handleOptIn}
                disabled={isOptingIn}
                className="px-6 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isOptingIn ? 'Processing...' : 'Opt-in to Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
