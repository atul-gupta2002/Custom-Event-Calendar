'use client';

import { Event } from './AddEventModal';

interface EventDisplayProps {
  event: Event;
  onClose: () => void;
  onEdit?: (event: Event) => void;
}

export default function EventDisplay({ event, onClose, onEdit }: EventDisplayProps) {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Event Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Event Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Title</h4>
              <p className="text-gray-900 font-semibold">{event.title}</p>
            </div>

            {/* Date and Time */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Date & Time</h4>
              <p className="text-gray-900">{formatDateTime(event.date)}</p>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-gray-900">{event.description}</p>
              </div>
            )}

            {/* Category */}
            {event.category && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                <p className="text-gray-900">{event.category}</p>
              </div>
            )}

            {/* Recurrence */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Recurrence</h4>
              <p className="text-gray-900 capitalize">{event.recurrence}</p>
            </div>

            {/* Color Indicator */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Color</h4>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: event.color }}
                />
                <span className="text-gray-900">Event color</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Edit Event
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 