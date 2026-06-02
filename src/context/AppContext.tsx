import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  color: string; // tailwind color prefix (e.g. "blue", "emerald", "violet", "amber", "rose")
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AppContextType {
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'endTime'>) => { success: boolean; error?: string };
  updateAppointment: (appointment: Appointment) => { success: boolean; error?: string };
  deleteAppointment: (id: string) => void;
  checkOverlap: (date: string, startTime: string, endTime: string, excludeId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const defaultServices: Service[] = [
  {
    id: 's1',
    name: 'Consulta General',
    duration: 30,
    price: 50,
    description: 'Consulta técnica o médica general de media hora para evaluar necesidades.',
    color: 'blue',
  },
  {
    id: 's2',
    name: 'Asesoría Completa',
    duration: 60,
    price: 90,
    description: 'Sesión uno a uno de planificación y estrategia comercial o técnica.',
    color: 'emerald',
  },
  {
    id: 's3',
    name: 'Terapia Especializada',
    duration: 90,
    price: 130,
    description: 'Tratamiento extendido de terapia física o psicológica adaptada.',
    color: 'violet',
  },
  {
    id: 's4',
    name: 'Mantenimiento Preventivo',
    duration: 45,
    price: 75,
    description: 'Revisión técnica de infraestructura, equipos informáticos o maquinaria.',
    color: 'amber',
  },
];

const defaultClients: Client[] = [
  {
    id: 'c1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+56 9 1234 5678',
    notes: 'Cliente recurrente. Prefiere citas en la mañana.',
  },
  {
    id: 'c2',
    name: 'María González',
    email: 'maria.g@example.com',
    phone: '+56 9 8765 4321',
    notes: 'Puntual. Requiere facturación electrónica.',
  },
  {
    id: 'c3',
    name: 'Carlos Rodríguez',
    email: 'carlos.r@example.com',
    phone: '+56 9 5555 4444',
    notes: 'Nueva incorporación. Contactar por email preferentemente.',
  },
  {
    id: 'c4',
    name: 'Ana Silva',
    email: 'ana.silva@example.com',
    phone: '+56 9 3333 2222',
  },
];

// Helper to get formatted dates relative to today (2026-06-02)
const getRelativeDateStr = (offsetDays: number): string => {
  const base = new Date('2026-06-02T12:00:00'); // Tuesday
  base.setDate(base.getDate() + offsetDays);
  return base.toISOString().split('T')[0];
};

const defaultAppointments: Appointment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    serviceId: 's1',
    date: getRelativeDateStr(0), // Today (Tuesday 2026-06-02)
    startTime: '09:00',
    endTime: '09:30',
    status: 'scheduled',
    notes: 'Consulta inicial de control.',
  },
  {
    id: 'a2',
    clientId: 'c2',
    serviceId: 's2',
    date: getRelativeDateStr(0), // Today (Tuesday 2026-06-02)
    startTime: '11:00',
    endTime: '12:00',
    status: 'scheduled',
  },
  {
    id: 'a3',
    clientId: 'c3',
    serviceId: 's3',
    date: getRelativeDateStr(1), // Wednesday
    startTime: '10:00',
    endTime: '11:30',
    status: 'scheduled',
  },
  {
    id: 'a4',
    clientId: 'c4',
    serviceId: 's4',
    date: getRelativeDateStr(2), // Thursday
    startTime: '14:00',
    endTime: '14:45',
    status: 'scheduled',
  },
  {
    id: 'a5',
    clientId: 'c1',
    serviceId: 's2',
    date: getRelativeDateStr(3), // Friday
    startTime: '15:30',
    endTime: '16:30',
    status: 'scheduled',
  },
  {
    id: 'a6',
    clientId: 'c2',
    serviceId: 's1',
    date: getRelativeDateStr(-1), // Monday (yesterday)
    startTime: '16:00',
    endTime: '16:30',
    status: 'completed',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(() => {
    const local = localStorage.getItem('scheduler_services');
    return local ? JSON.parse(local) : defaultServices;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const local = localStorage.getItem('scheduler_clients');
    return local ? JSON.parse(local) : defaultClients;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const local = localStorage.getItem('scheduler_appointments');
    return local ? JSON.parse(local) : defaultAppointments;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('scheduler_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('scheduler_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('scheduler_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // CRUD Services
  const addService = (newService: Omit<Service, 'id'>) => {
    const id = 's_' + Math.random().toString(36).substr(2, 9);
    setServices((prev) => [...prev, { ...newService, id }]);
  };

  const updateService = (updated: Service) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    // Optionally clean up appointments for this service, or let them remain as orphaned
  };

  // CRUD Clients
  const addClient = (newClient: Omit<Client, 'id'>) => {
    const id = 'c_' + Math.random().toString(36).substr(2, 9);
    setClients((prev) => [...prev, { ...newClient, id }]);
  };

  const updateClient = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Time overlap validation helper
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const checkOverlap = (date: string, startTime: string, endTime: string, excludeId?: string): boolean => {
    const newStart = parseTimeToMinutes(startTime);
    const newEnd = parseTimeToMinutes(endTime);

    return appointments
      .filter((app) => app.date === date && app.id !== excludeId && app.status !== 'cancelled')
      .some((app) => {
        const appStart = parseTimeToMinutes(app.startTime);
        const appEnd = parseTimeToMinutes(app.endTime);
        // Overlap condition: start A < end B && start B < end A
        return newStart < appEnd && appStart < newEnd;
      });
  };

  // CRUD Appointments
  const addAppointment = (newApp: Omit<Appointment, 'id' | 'endTime'>) => {
    // Find service to calculate duration & end time
    const service = services.find((s) => s.id === newApp.serviceId);
    if (!service) {
      return { success: false, error: 'Servicio no encontrado.' };
    }

    const startMinutes = parseTimeToMinutes(newApp.startTime);
    const endMinutes = startMinutes + service.duration;
    
    const endHours = Math.floor(endMinutes / 60).toString().padStart(2, '0');
    const endMins = (endMinutes % 60).toString().padStart(2, '0');
    const endTime = `${endHours}:${endMins}`;

    // Overlap validation
    if (checkOverlap(newApp.date, newApp.startTime, endTime)) {
      return { success: false, error: 'El horario seleccionado se traslapa con otra cita existente.' };
    }

    const id = 'a_' + Math.random().toString(36).substr(2, 9);
    setAppointments((prev) => [...prev, { ...newApp, id, endTime, status: 'scheduled' }]);
    return { success: true };
  };

  const updateAppointment = (updated: Appointment) => {
    // Find service to re-calculate end time in case service changed
    const service = services.find((s) => s.id === updated.serviceId);
    if (!service) {
      return { success: false, error: 'Servicio no encontrado.' };
    }

    const startMinutes = parseTimeToMinutes(updated.startTime);
    const endMinutes = startMinutes + service.duration;
    
    const endHours = Math.floor(endMinutes / 60).toString().padStart(2, '0');
    const endMins = (endMinutes % 60).toString().padStart(2, '0');
    const endTime = `${endHours}:${endMins}`;

    const finalApp = { ...updated, endTime };

    // Overlap validation
    if (checkOverlap(finalApp.date, finalApp.startTime, finalApp.endTime, finalApp.id)) {
      return { success: false, error: 'El horario seleccionado se traslapa con otra cita existente.' };
    }

    setAppointments((prev) => prev.map((a) => (a.id === finalApp.id ? finalApp : a)));
    return { success: true };
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        services,
        clients,
        appointments,
        addService,
        updateService,
        deleteService,
        addClient,
        updateClient,
        deleteClient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        checkOverlap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
