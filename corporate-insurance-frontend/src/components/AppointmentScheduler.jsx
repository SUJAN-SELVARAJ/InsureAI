import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, User, Search, Check } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

const AppointmentScheduler = ({ onSuccess }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: select agent, 2: select date, 3: select time, 4: confirm

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedAgent, selectedDate]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/customer/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedAgent || !selectedDate) return;

    try {
      setLoading(true);
      const response = await API.get(`/availability/agent/${selectedAgent}/available?date=${selectedDate}`);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      toast.error('Failed to fetch available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent.id);
    setValue('agentId', agent.id);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(3);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setValue('availabilityId', slot.id);
    setValue('appointmentDate', slot.availableDate);
    setValue('startTime', slot.startTime);
    setValue('endTime', slot.endTime);
    setStep(4);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        notes: data.notes,
        agentId: Number(selectedAgent),
        availabilityId: Number(selectedSlot.id),
        appointmentDate: selectedDate, // Use guaranteed string YYYY-MM-DD
        // Ensure startTime and endTime are properly formatted strings
        startTime: Array.isArray(selectedSlot.startTime)
          ? selectedSlot.startTime.map(n => String(n).padStart(2, '0')).join(':')
          : selectedSlot.startTime,
        endTime: Array.isArray(selectedSlot.endTime)
          ? selectedSlot.endTime.map(n => String(n).padStart(2, '0')).join(':')
          : selectedSlot.endTime
      };

      // If time format is missing seconds (HH:mm), Jackson handles it, but adding :00 can be safer
      if (payload.startTime && payload.startTime.length === 5) payload.startTime += ':00';
      if (payload.endTime && payload.endTime.length === 5) payload.endTime += ':00';

      await API.post('/appointments', payload);
      onSuccess();
      resetForm();
    } catch (error) {
      let message = 'Failed to book appointment';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data; // Handles "Error: ..." string responses
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        } else if (typeof error.response.data === 'object') {
          // Handle spring validation field errors
          const fieldErrors = Object.values(error.response.data);
          if (fieldErrors.length > 0) {
            message = fieldErrors[0];
          }
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAgent(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
    setStep(1);
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Book an Appointment</h2>
          <p className="mt-1 text-sm text-gray-500">Follow the steps to schedule your appointment</p>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= stepNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span className={`ml-2 text-sm ${step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                  {stepNumber === 1 && 'Select Agent'}
                  {stepNumber === 2 && 'Select Date'}
                  {stepNumber === 3 && 'Select Time'}
                  {stepNumber === 4 && 'Confirm'}
                </span>
                {stepNumber < 4 && (
                  <div className={`ml-4 w-12 h-0.5 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Step 1: Select Agent */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select an Agent</h3>
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No agents available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {agent.firstName} {agent.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                          <p className="text-sm text-gray-500">{agent.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Date</h3>
              <div className="max-w-xs">
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Time Slots</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No available time slots for the selected date.</p>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-4 text-blue-600 hover:text-blue-500"
                  >
                    Choose a different date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors text-center"
                    >
                      <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Appointment Details</h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Agent:</p>
                      <p className="text-sm text-gray-900">
                        {agents.find(a => a.id === selectedAgent)?.firstName} {agents.find(a => a.id === selectedAgent)?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date:</p>
                      <p className="text-sm text-gray-900">{selectedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time:</p>
                      <p className="text-sm text-gray-900">
                        {selectedSlot && formatTime(selectedSlot.startTime)} - {selectedSlot && formatTime(selectedSlot.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <input type="hidden" {...register('agentId')} />
                <input type="hidden" {...register('availabilityId')} />
                <input type="hidden" {...register('appointmentDate')} />
                <input type="hidden" {...register('startTime')} />
                <input type="hidden" {...register('endTime')} />

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any additional information for the appointment..."
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
