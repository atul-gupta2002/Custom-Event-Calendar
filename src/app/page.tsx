import CalendarGrid from '@/components/CalendarGrid';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Custom Event Calendar
        </h1>
        <CalendarGrid currentDate={new Date()} />
      </div>
    </main>
  );
}
