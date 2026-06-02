import { useState } from 'react';
import { ThemeProvider } from './context/ThemeProvider';
import { AppProvider } from './context/AppContext';
import type { Appointment } from './context/AppContext';
import { Layout } from './components/Layout';
import { CalendarView } from './components/CalendarView';
import { ClientsView } from './components/ClientsView';
import { ServicesView } from './components/ServicesView';
import { AppointmentDialog } from './components/AppointmentDialog';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'clients' | 'services'>('calendar');
  
  // Appointment Dialog state
  const [isAppDialogOpen, setIsAppDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const handleSlotClick = (date: string, time: string) => {
    setAppointmentToEdit(null);
    setSelectedDate(date);
    setSelectedTime(time);
    setIsAppDialogOpen(true);
  };

  const handleAppointmentClick = (app: Appointment) => {
    setAppointmentToEdit(app);
    setSelectedDate(app.date);
    setSelectedTime(app.startTime);
    setIsAppDialogOpen(true);
  };

  const handleNewAppointmentClick = () => {
    setAppointmentToEdit(null);
    // Default to mock "today" date formatted as YYYY-MM-DD
    const todayStr = '2026-06-02'; 
    setSelectedDate(todayStr);
    setSelectedTime('09:00');
    setIsAppDialogOpen(true);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onNewAppointmentClick={handleNewAppointmentClick}
    >
      {activeTab === 'calendar' && (
        <CalendarView
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}
      {activeTab === 'clients' && <ClientsView />}
      {activeTab === 'services' && <ServicesView />}

      <AppointmentDialog
        key={`${isAppDialogOpen}-${appointmentToEdit?.id || 'new'}`}
        isOpen={isAppDialogOpen}
        onClose={() => setIsAppDialogOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        appointmentToEdit={appointmentToEdit}
      />
      <Toaster position="top-right" />
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
