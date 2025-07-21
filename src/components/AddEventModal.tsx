'use client';

import { useState, useEffect } from 'react';
import { RecurrenceRule, checkEventConflict } from '@/utils/recurrenceUtils';

export interface Event {
  id: string;
  title: string;
  date: Date;
  description: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  color: string;
  category?: string;
  recurrenceRule?: RecurrenceRule;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  editingEvent?: Event | null;
  existingEvents?: Event[];
}

const EVENT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Gray', value: '#6B7280' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface FormData {
  title: string;
  date: string;
  description: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  color: string;
  category: string;
}

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onAddEvent, 
  onUpdateEvent, 
  onDeleteEvent,
  editingEvent,
  existingEvents = []
}: AddEventModalProps) {
  const isEditing = !!editingEvent;
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: selectedDate.toISOString().slice(0, 16), // Format for datetime-local input
    description: '',
    recurrence: 'none',
    color: '#3B82F6',
    category: '',
  });

  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    type: 'none',
  });

  const [conflicts, setConflicts] = useState<Event[]>([]);

  // Update form data when editing event changes
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        date: editingEvent.date.toISOString().slice(0, 16),
        description: editingEvent.description,
        recurrence: editingEvent.recurrence,
        color: editingEvent.color,
        category: editingEvent.category || '',
      });
      setRecurrenceRule(editingEvent.recurrenceRule || { type: 'none' });
    } else {
      setFormData({
        title: '',
        date: selectedDate.toISOString().slice(0, 16),
        description: '',
        recurrence: 'none',
        color: '#3B82F6',
        category: '',
      });
      setRecurrenceRule({ type: 'none' });
    }
  }, [editingEvent, selectedDate]);

  // Check for conflicts when form data changes
  useEffect(() => {
    if (formData.title && formData.date) {
      const newEvent: Event = {
        id: editingEvent?.id || 'temp',
        title: formData.title,
        date: new Date(formData.date),
        description: formData.description,
        recurrence: formData.recurrence,
        color: formData.color,
        category: formData.category || undefined,
        recurrenceRule,
      };

      const conflicts = checkEventConflict(newEvent, existingEvents, editingEvent?.id);
      setConflicts(conflicts);
    }
  }, [formData, recurrenceRule, existingEvents, editingEvent?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editingEvent && onUpdateEvent) {
      const updatedEvent: Event = {
        ...editingEvent,
        title: formData.title,
        date: new Date(formData.date),
        description: formData.description,
        recurrence: formData.recurrence,
        color: formData.color,
        category: formData.category || undefined,
        recurrenceRule,
      };
      onUpdateEvent(updatedEvent);
    } else {
      const newEvent = {
        title: formData.title,
        date: new Date(formData.date),
        description: formData.description,
        recurrence: formData.recurrence,
        color: formData.color,
        category: formData.category || undefined,
        recurrenceRule,
      };
      onAddEvent(newEvent);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (isEditing && editingEvent && onDeleteEvent) {
      onDeleteEvent(editingEvent.id);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRecurrenceChange = (type: RecurrenceRule['type']) => {
    setRecurrenceRule(prev => ({
      ...prev,
      type,
    }));
  };

  const handleWeekdayToggle = (weekday: number) => {
    setRecurrenceRule(prev => {
      const weekdays = prev.weekdays || [];
      const newWeekdays = weekdays.includes(weekday)
        ? weekdays.filter(w => w !== weekday)
        : [...weekdays, weekday];
      
      return {
        ...prev,
        weekdays: newWeekdays,
      };
    });
  };

  const handleIntervalChange = (interval: number) => {
    setRecurrenceRule(prev => ({
      ...prev,
      interval,
    }));
  };

  const handleEndDateChange = (endDate: string) => {
    setRecurrenceRule(prev => ({
      ...prev,
      endDate: endDate ? new Date(endDate) : undefined,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">⚠️ Event Conflict Detected</p>
              <p className="text-red-700 text-xs mt-1">
                This event conflicts with {conflicts.length} existing event(s) at the same time.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's your event called?"
                required
              />
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date and Time *
              </label>
              <input
                type="datetime-local"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us more about your event..."
              />
            </div>

            {/* Recurrence */}
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence
              </label>
              <select
                id="recurrence"
                value={formData.recurrence}
                onChange={(e) => {
                  handleInputChange('recurrence', e.target.value);
                  handleRecurrenceChange(e.target.value as RecurrenceRule['type']);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Recurrence Options */}
            {formData.recurrence !== 'none' && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                {/* Weekly Day Selection */}
                {formData.recurrence === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Days of Week
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleWeekdayToggle(day.value)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            recurrenceRule.weekdays?.includes(day.value)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Interval */}
                {formData.recurrence === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interval
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={recurrenceRule.interval || 1}
                      onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Every {recurrenceRule.interval || 1} {recurrenceRule.type === 'weekly' ? 'week(s)' : 'month(s)'}
                    </p>
                  </div>
                )}

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={recurrenceRule.endDate?.toISOString().slice(0, 10) || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Event Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Color
              </label>
              <div className="flex flex-wrap gap-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category (Optional)
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Work, Personal, Meeting, Birthday, Holiday"
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              {isEditing && onDeleteEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={conflicts.length > 0}
              >
                {isEditing ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 