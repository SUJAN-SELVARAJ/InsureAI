import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, Calendar, Filter, Search } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

const InsurancePlanList = ({ onSelectPlan, userType }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchPlans();
  }, [filter, searchTerm, sortBy]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      let endpoint = '/plans';

      if (filter !== 'all') {
        endpoint = `/plans/type/${filter}`;
      } else if (sortBy === 'premium') {
        endpoint = '/plans/sorted-by-premium';
      }

      const response = await API.get(endpoint);
      let filteredPlans = response.data;

      // Apply search filter
      if (searchTerm) {
        filteredPlans = filteredPlans.filter(plan =>
          plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPlans(filteredPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to fetch insurance plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlanTypeColor = (type) => {
    switch (type) {
      case 'HEALTH':
        return 'bg-green-100 text-green-800';
      case 'LIFE':
        return 'bg-cyan-900 text-cyan-200';
      case 'PROPERTY':
        return 'bg-purple-100 text-purple-800';
      case 'LIABILITY':
        return 'bg-yellow-100 text-yellow-800';
      case 'VEHICLE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-700 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-700 rounded-md focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="health">Health</option>
              <option value="life">Life</option>
              <option value="property">Property</option>
              <option value="liability">Liability</option>
              <option value="vehicle">Vehicle</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 w-full border border-gray-700 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="name">Sort by Name</option>
              <option value="premium">Sort by Premium (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] rounded-xl shadow-lg border border-gray-800">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No insurance plans found</h3>
          <p className="text-gray-400">
            {searchTerm || filter !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "No insurance plans are available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#111827] rounded-lg shadow-md border border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.planName}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanTypeColor(plan.planType)}`}>
                    {plan.planType}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {plan.description || 'No description available for this plan.'}
                </p>

                <div className="space-y-3">
                  {plan.coverageAmount && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-400">Coverage</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(plan.coverageAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Premium</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(plan.premiumAmount)}/month
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Duration</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {plan.durationMonths} months
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    {userType === 'customer' ? 'View Details' : 'Select Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsurancePlanList;
