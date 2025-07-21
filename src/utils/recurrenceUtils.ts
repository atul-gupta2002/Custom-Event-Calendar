import { Event } from '@/components/AddEventModal';

export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number; // For custom: every X weeks/months
  weekdays?: number[]; // For weekly: [0,1,2,3,4,5,6] (Sunday=0)
  endDate?: Date; // Optional end date for recurring events
  maxOccurrences?: number; // Optional max number of occurrences
}

export interface RecurringEvent extends Event {
  recurrenceRule: RecurrenceRule;
  originalEventId: string; // Reference to the original event
}

// Generate recurring event instances
export function generateRecurringEvents(
  originalEvent: Event,
  recurrenceRule: RecurrenceRule,
  endDate: Date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
): Event[] {
  const events: Event[] = [];
  const originalDate = new Date(originalEvent.date);
  
  // Add the original event
  events.push(originalEvent);
  
  let currentDate = new Date(originalDate);
  let occurrenceCount = 1;
  
  // Set end conditions
  const maxOccurrences = recurrenceRule.maxOccurrences || 100;
  const recurrenceEndDate = recurrenceRule.endDate || endDate;
  
  while (occurrenceCount < maxOccurrences && currentDate < recurrenceEndDate) {
    let nextDate: Date;
    
    switch (recurrenceRule.type) {
      case 'daily':
        nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        break;
        
      case 'weekly':
        if (recurrenceRule.weekdays && recurrenceRule.weekdays.length > 0) {
          // Find next occurrence based on selected weekdays
          nextDate = findNextWeekday(currentDate, recurrenceRule.weekdays);
        } else {
          // Default to same day of week
          nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;
        
      case 'monthly':
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
        
      case 'custom':
        const interval = recurrenceRule.interval || 1;
        if (recurrenceRule.weekdays && recurrenceRule.weekdays.length > 0) {
          // Custom weekly with specific days
          nextDate = findNextWeekday(currentDate, recurrenceRule.weekdays, interval);
        } else {
          // Custom monthly
          nextDate = new Date(currentDate);
          nextDate.setMonth(nextDate.getMonth() + interval);
        }
        break;
        
      default:
        return events; // No recurrence
    }
    
    // Check if we've exceeded the end date
    if (nextDate > recurrenceEndDate) {
      break;
    }
    
    // Create recurring event instance
    const recurringEvent: Event = {
      ...originalEvent,
      id: `${originalEvent.id}_${occurrenceCount}`,
      date: nextDate,
    };
    
    events.push(recurringEvent);
    currentDate = nextDate;
    occurrenceCount++;
  }
  
  return events;
}

// Find next weekday occurrence
function findNextWeekday(currentDate: Date, weekdays: number[], interval: number = 1): Date {
  const nextDate = new Date(currentDate);
  let daysAdded = 0;
  
  while (daysAdded < 7 * interval) {
    nextDate.setDate(nextDate.getDate() + 1);
    daysAdded++;
    
    if (weekdays.includes(nextDate.getDay())) {
      return nextDate;
    }
  }
  
  // If no match found, return current date + interval weeks
  const fallbackDate = new Date(currentDate);
  fallbackDate.setDate(fallbackDate.getDate() + (7 * interval));
  return fallbackDate;
}

// Check for event conflicts
export function checkEventConflict(
  newEvent: Event,
  existingEvents: Event[],
  excludeEventId?: string
): Event[] {
  const conflicts: Event[] = [];
  const newEventStart = new Date(newEvent.date);
  const newEventEnd = new Date(newEventStart.getTime() + 60 * 60 * 1000); // Default 1 hour duration
  
  for (const event of existingEvents) {
    if (excludeEventId && event.id === excludeEventId) {
      continue;
    }
    
    const eventStart = new Date(event.date);
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // Default 1 hour duration
    
    // Check if events overlap
    if (
      (newEventStart >= eventStart && newEventStart < eventEnd) ||
      (newEventEnd > eventStart && newEventEnd <= eventEnd) ||
      (newEventStart <= eventStart && newEventEnd >= eventEnd)
    ) {
      conflicts.push(event);
    }
  }
  
  return conflicts;
}

// Get all events for a specific date (including recurring instances)
export function getEventsForDate(date: Date, allEvents: Event[]): Event[] {
  return allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });
}

// Update recurring event instances when original event is modified
export function updateRecurringEvents(
  originalEvent: Event,
  allEvents: Event[],
  recurrenceRule: RecurrenceRule
): Event[] {
  // Remove all instances of this recurring event
  const filteredEvents = allEvents.filter(event => 
    !event.id.startsWith(originalEvent.id + '_') && event.id !== originalEvent.id
  );
  
  // Generate new recurring instances
  const newRecurringEvents = generateRecurringEvents(originalEvent, recurrenceRule);
  
  return [...filteredEvents, ...newRecurringEvents];
} 