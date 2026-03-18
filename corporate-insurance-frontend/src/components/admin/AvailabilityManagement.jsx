import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Calendar } from 'lucide-react';
import API from '../../api';
import toast from 'react-hot-toast';

const AvailabilityManagement = ({ onUpdate }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      let endpoint = '/admin/availabilities';

      if (dateFilter.start && dateFilter.end) {
        endpoint = `/admin/availabilities/range?startDate=${dateFilter.start}&endDate=${dateFilter.end}`;
      }

      const response = await API.get(endpoint);
      setAvailabilities(response.data);
    } catch (error) {
      console.error('Failed to fetch availabilities:', error);
      toast.error('Failed to fetch availabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (dateFilter.start && dateFilter.end) {
      fetchAvailabilities();
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const clearDateFilter = () => {
    setDateFilter({ start: '', end: '' });
  };

  const formatTime = (timeData) => {
    if (!timeData) return '';
    let hours, minutes;

    if (Array.isArray(timeData)) {
      hours = timeData[0];
      minutes = timeData[1] !== undefined ? timeData[1] : 0;
    } else {
      const parts = String(timeData).split(':');
      hours = parts[0];
      minutes = parts[1];
    }

    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateData) => {
    if (!dateData) return '';
    let dateObj;
    if (Array.isArray(dateData)) {
      // Spring Boot returns [YYYY, MM, DD]
      dateObj = new Date(dateData[0], dateData[1] - 1, dateData[2]);
    } else {
      dateObj = new Date(dateData);
    }
    return dateObj.toLocaleDateString();
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Agent Availability Management</h2>
        <p className="mt-1 text-sm text-gray-400">View all agent availability slots across the system</p>
      </div>

      {/* Date Filter */}
      <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300">Start Date</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">End Date</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="mt-1 block w-full border-gray-700 bg-[#1F2937] text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Filter
            </button>
            <button
              onClick={clearDateFilter}
              className="px-4 py-2 bg-gray-300 text-gray-300 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Availability Table */}
      <div className="bg-[#111827] shadow border-b border-gray-800 overflow-hidden rounded-md">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#1F2937]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time Slot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#111827] divide-y divide-gray-800">
            {availabilities.map((availability) => (
              <tr key={availability.id} className="hover:bg-[#1F2937]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {availability.agent?.firstName} {availability.agent?.lastName}
                    </div>
                    <div className="text-sm text-gray-400">{availability.agent?.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {formatDate(availability.availableDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availability.isBooked
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {availability.isBooked ? 'Booked' : 'Available'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    {new Date(availability.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {availabilities.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No availability found</h3>
          <p className="text-gray-400">
            {dateFilter.start && dateFilter.end
              ? "No availability found in the selected date range."
              : "No agent availability in the system."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;
