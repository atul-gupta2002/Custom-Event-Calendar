'use client';

import { useState } from 'react';
import AddEventModal, { Event } from './AddEventModal';
import EventDisplay from './EventDisplay';

interface CalendarGridProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
}

export default function CalendarGrid({ currentDate, onDateSelect }: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Get the number of days in the current month
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get today's date for highlighting
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    
    // Fill remaining cells to complete 6 weeks (42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalDate(date);
    setIsModalOpen(true);
    onDateSelect?.(date);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent date click
    setSelectedEvent(event);
  };

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(), // Simple ID generation
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {formatMonthYear(currentDate)}
        </h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Previous Month
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Next Month
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            
            return (
              <div
                key={index}
                className={`p-2 border border-gray-200 min-h-[100px] ${
                  date === null
                    ? 'bg-gray-50 text-gray-400'
                    : isToday(date!)
                    ? 'bg-blue-50'
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => date && handleDateClick(date)}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium mb-1 ${
                  date === null
                    ? 'text-gray-400'
                    : isToday(date!)
                    ? 'text-blue-800 font-bold'
                    : 'text-gray-800'
                }`}>
                  {date ? date.getDate() : ''}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} - ${formatTime(event.date)}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={modalDate}
        onAddEvent={handleAddEvent}
      />

      {/* Event Display Modal */}
      {selectedEvent && (
        <EventDisplay
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
} 