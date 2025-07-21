'use client';

import { useState, useRef } from 'react';
import AddEventModal, { Event } from './AddEventModal';
import EventDisplay from './EventDisplay';
import Toast from './Toast';
import { generateRecurringEvents, getEventsForDate, checkEventConflict } from '@/utils/recurrenceUtils';

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
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

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

  // Get events for a specific date (including recurring instances)
  const getEventsForDate = (date: Date) => {
    return getEventsForDate(date, events);
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
    setEditingEvent(event); // Open in edit mode instead of just viewing
    setSelectedEvent(null); // Close any open event display
  };

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(), // Simple ID generation
    };

    // Generate recurring events if needed
    let allEvents = [newEvent];
    if (eventData.recurrenceRule && eventData.recurrenceRule.type !== 'none') {
      const recurringEvents = generateRecurringEvents(newEvent, eventData.recurrenceRule);
      allEvents = recurringEvents;
    }

    setEvents(prev => [...prev, ...allEvents]);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    // Remove all instances of this event (including recurring ones)
    const filteredEvents = events.filter(event => 
      !event.id.startsWith(updatedEvent.id + '_') && event.id !== updatedEvent.id
    );

    // Generate new recurring events if needed
    let allEvents = [updatedEvent];
    if (updatedEvent.recurrenceRule && updatedEvent.recurrenceRule.type !== 'none') {
      const recurringEvents = generateRecurringEvents(updatedEvent, updatedEvent.recurrenceRule);
      allEvents = recurringEvents;
    }

    setEvents([...filteredEvents, ...allEvents]);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Remove all instances of this recurring event
    const filteredEvents = events.filter(event => 
      !event.id.startsWith(eventId + '_') && event.id !== eventId
    );
    setEvents(filteredEvents);
    setEditingEvent(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (event: Event, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (targetDate: Date, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedEvent) {
      // Check for conflicts at the new date/time
      const newEventDate = new Date(targetDate);
      newEventDate.setHours(draggedEvent.date.getHours());
      newEventDate.setMinutes(draggedEvent.date.getMinutes());

      const updatedEvent: Event = {
        ...draggedEvent,
        date: newEventDate,
      };

      const conflicts = checkEventConflict(updatedEvent, events, draggedEvent.id);
      
      if (conflicts.length === 0) {
        // Update the event
        handleUpdateEvent(updatedEvent);
        setToast({
          message: 'Event moved successfully!',
          type: 'success',
          isVisible: true,
        });
      } else {
        // Show conflict warning
        setToast({
          message: `Cannot move event: conflicts with ${conflicts.length} existing event(s)`,
          type: 'error',
          isVisible: true,
        });
      }
    }

    setDraggedEvent(null);
    setDragOverDate(null);
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
            const isDragOver = dragOverDate && date && 
              dragOverDate.getDate() === date.getDate() &&
              dragOverDate.getMonth() === date.getMonth() &&
              dragOverDate.getFullYear() === date.getFullYear();
            
            return (
              <div
                key={index}
                className={`p-2 border border-gray-200 min-h-[100px] ${
                  date === null
                    ? 'bg-gray-50 text-gray-400'
                    : isToday(date!)
                    ? 'bg-blue-50'
                    : isDragOver
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => date && handleDateClick(date)}
                onDragOver={(e) => date && handleDragOver(date, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => date && handleDrop(date, e)}
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
                      className={`text-xs p-1 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity relative group ${
                        draggedEvent?.id === event.id ? 'opacity-50' : ''
                      }`}
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} - ${formatTime(event.date)}`}
                      onClick={(e) => handleEventClick(event, e)}
                      draggable
                      onDragStart={(e) => handleDragStart(event, e)}
                    >
                      {event.title}
                      <button
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        title="View details"
                      >
                        ℹ
                      </button>
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

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={isModalOpen || !!editingEvent}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        selectedDate={modalDate}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        editingEvent={editingEvent}
        existingEvents={events}
      />

      {/* Event Display Modal */}
      {selectedEvent && (
        <EventDisplay
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setEditingEvent(event);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
} 