import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Edit, Trash2, Plus, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

const PlanManagement = ({ onUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, [currentPage, typeFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      let params = `?page=${currentPage}&size=10`;
      if (typeFilter) params += `&type=${typeFilter}`;
      
      const response = await API.get(`/admin/plans${params}`);
      setPlans(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (planId) => {
    try {
      const plan = plans.find(p => p.id === planId);
      const endpoint = plan.isActive ? `/admin/plans/${planId}/deactivate` : `/admin/plans/${planId}/activate`;
      await API.put(endpoint);
      onUpdate();
      fetchPlans();
      toast.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update plan status');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await API.delete(`/admin/plans/${planId}`);
        onUpdate();
        fetchPlans();
        toast.success('Plan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowAddModal(true);
  };

  const handlePlanSaved = () => {
    setShowAddModal(false);
    setEditingPlan(null);
    onUpdate();
    fetchPlans();
  };

  const filteredPlans = plans.filter(plan =>
    plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanTypeColor = (type) => {
    switch (type) {
      case 'HEALTH': return 'bg-green-100 text-green-800';
      case 'LIFE': return 'bg-cyan-900 text-cyan-200';
      case 'PROPERTY': return 'bg-purple-100 text-purple-800';
      case 'LIABILITY': return 'bg-yellow-100 text-yellow-800';
      case 'VEHICLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Insurance Plan Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-[#1F2937] text-white rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-700 bg-[#1F2937] text-white rounded-md focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
            >
              <option value="">All Types</option>
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
              <option value="PROPERTY">Property</option>
              <option value="LIABILITY">Liability</option>
              <option value="VEHICLE">Vehicle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-[#111827] shadow border-b border-gray-800 overflow-hidden rounded-md">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#1F2937]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Premium
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#111827] divide-y divide-gray-800">
            {filteredPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-[#1F2937]">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">{plan.planName}</div>
                    <div className="text-sm text-gray-400 max-w-xs truncate">
                      {plan.description || 'No description'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanTypeColor(plan.planType)}`}>
                    {plan.planType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {plan.coverageAmount ? formatCurrency(plan.coverageAmount) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatCurrency(plan.premiumAmount)}/month
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {plan.durationMonths} months
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(plan.id)}
                    className="flex items-center text-sm"
                  >
                    {plan.isActive ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-red-500 mr-1" />
                        <span className="text-red-600">Inactive</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="text-cyan-500 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-2 border border-gray-700 bg-[#1F2937] text-white rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 border border-gray-700 bg-[#1F2937] text-white rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No plans found</h3>
          <p className="text-gray-400">
            {searchTerm || typeFilter 
              ? "Try adjusting your search or filter criteria."
              : "No insurance plans in the system."}
          </p>
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {showAddModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlan(null);
          }}
          onSave={handlePlanSaved}
        />
      )}
    </div>
  );
};

// Plan Modal Component
const PlanModal = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    planName: plan?.planName || '',
    planType: plan?.planType || 'HEALTH',
    description: plan?.description || '',
    coverageAmount: plan?.coverageAmount || '',
    premiumAmount: plan?.premiumAmount || '',
    durationMonths: plan?.durationMonths || 12,
    isActive: plan?.isActive !== undefined ? plan.isActive : true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (plan) {
        await API.put(`/admin/plans/${plan.id}`, formData);
      } else {
        await API.post('/admin/plans', formData);
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#111827] rounded-lg p-6 w-full max-w-2xl border border-gray-800 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-medium text-white mb-4">
          {plan ? 'Edit Plan' : 'Add New Plan'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Plan Name</label>
              <input
                type="text"
                required
                value={formData.planName}
                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Plan Type</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({...formData, planType: e.target.value})}
                className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="HEALTH">Health</option>
                <option value="LIFE">Life</option>
                <option value="PROPERTY">Property</option>
                <option value="LIABILITY">Liability</option>
                <option value="VEHICLE">Vehicle</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Coverage Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.coverageAmount}
                onChange={(e) => setFormData({...formData, coverageAmount: e.target.value})}
                className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Premium Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.premiumAmount}
                onChange={(e) => setFormData({...formData, premiumAmount: e.target.value})}
                className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Duration (months)</label>
              <input
                type="number"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({...formData, durationMonths: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 bg-[#1F2937] text-white rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-white">
              Active
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#111827] hover:bg-[#1F2937]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanManagement;
