import React from 'react';
import { Calendar, Users, Briefcase, Plus, Clock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

interface LayoutProps {
  activeTab: 'calendar' | 'clients' | 'services';
  setActiveTab: (tab: 'calendar' | 'clients' | 'services') => void;
  onNewAppointmentClick: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  onNewAppointmentClick,
  children,
}) => {
  // Current time logic for header
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const navItems = [
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'services', label: 'Servicios', icon: Briefcase },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-primary/20 transition-colors duration-300">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-card border-r border-border/40 p-6 gap-8 justify-between backdrop-blur-md">
        <div className="flex flex-col gap-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary text-primary-foreground h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 font-bold text-lg tracking-wider">
              AC
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-tight m-0">AgendaClickk</h1>
              <p className="text-xs text-muted-foreground m-0">Citas para Servicios</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <Button 
            onClick={onNewAppointmentClick}
            className="w-full justify-start gap-2 shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 rounded-xl"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Nueva Cita
          </Button>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-inner'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <div className="text-[11px] text-muted-foreground/60 px-2 leading-relaxed">
            &copy; 2026 AgendaClickk.<br />
            Juan Workspace
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm">
            AC
          </div>
          <h1 className="font-bold text-base m-0">AgendaClickk</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            onClick={onNewAppointmentClick}
            size="icon" 
            className="h-8 w-8 rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR / PANEL HEADER (DESKTOP) */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-border/40 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Clock className="h-4.5 w-4.5 text-primary/80" />
            <span>{capitalizedDate}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-muted px-3 py-1 rounded-full border border-border/30 text-muted-foreground font-semibold">
              Modo Local (Persistente)
            </span>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            {children}
          </div>
        </main>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="md:hidden flex border-t border-border/40 bg-card/85 backdrop-blur-md justify-around py-2 px-1 sticky bottom-0 z-30 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
