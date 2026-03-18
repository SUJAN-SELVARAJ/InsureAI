import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

const AvailabilityForm = ({ onClose, onSuccess, availability = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!availability;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: availability ? {
      availableDate: availability.availableDate,
      startTime: availability.startTime,
      endTime: availability.endTime,
    } : {}
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        availableDate: data.availableDate,
        startTime: data.startTime + ':00',
        endTime: data.endTime + ':00',
      };

      if (isEditing) {
        await API.put(`/availability/${availability.id}`, payload);
        toast.success('Availability updated successfully!');
      } else {
        await API.post('/availability', payload);
        toast.success('Availability added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      const message = typeof error.response?.data === 'string' ? error.response.data : (error.response?.data?.message || 'Failed to save availability');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Edit Availability' : 'Add New Availability'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="availableDate" className="block text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4 inline mr-2" />
            Date
          </label>
          <input
            {...register('availableDate', {
              required: 'Date is required',
              validate: (value) => {
                const parts = value.split('-');
                const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today || 'Date must be today or in the future';
              }
            })}
            type="date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.availableDate && (
            <p className="mt-1 text-sm text-red-600">{errors.availableDate.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 inline mr-2" />
              Start Time
            </label>
            <input
              {...register('startTime', {
                required: 'Start time is required',
              })}
              type="time"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              {...register('endTime', {
                required: 'End time is required',
                validate: (value) => {
                  const startTime = watch('startTime');
                  if (startTime && value <= startTime) {
                    return 'End time must be after start time';
                  }
                  return true;
                }
              })}
              type="time"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              isEditing ? 'Update' : 'Add'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityForm;
