'use client';

import { useState } from 'react';
import CalendarGrid from '@/components/CalendarGrid';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Custom Event Calendar
        </h1>
        <CalendarGrid 
          currentDate={currentDate} 
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
      </div>
    </main>
  );
}
