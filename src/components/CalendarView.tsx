import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Appointment } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  startOfMonth, 
  addMonths, 
  isSameMonth, 
  addDays as addDaysFns,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  onSlotClick: (date: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSlotClick,
  onAppointmentClick,
}) => {
  const { appointments, clients, services } = useApp();
  
  // App state for active view mode and focused date
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [focusedDate, setFocusedDate] = useState<Date>(() => new Date('2026-06-02T12:00:00')); // Mock today base date

  const hourHeight = 68; // height in pixels of 1 hour
  const startHour = 8;  // start at 08:00 AM
  const endHour = 19;   // end at 07:00 PM (11 hours total grid)
  const totalHours = endHour - startHour;

  const hoursArray = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Date Navigators based on current view mode
  const handlePrev = () => {
    setFocusedDate((prev) => {
      if (viewMode === 'day') return addDaysFns(prev, -1);
      if (viewMode === 'week') return addDaysFns(prev, -7);
      return addMonths(prev, -1);
    });
  };

  const handleNext = () => {
    setFocusedDate((prev) => {
      if (viewMode === 'day') return addDaysFns(prev, 1);
      if (viewMode === 'week') return addDaysFns(prev, 7);
      return addMonths(prev, 1);
    });
  };

  const handleToday = () => {
    setFocusedDate(new Date('2026-06-02T12:00:00')); // Return to mock today
  };

  // Convert time string "HH:MM" to pixel offset top
  const getTimeOffset = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    const decimalHours = h + m / 60;
    const hoursFromStart = decimalHours - startHour;
    return Math.max(0, hoursFromStart * hourHeight);
  };

  // Convert service duration to pixel height
  const getCardHeight = (durationMin: number): number => {
    return (durationMin / 60) * hourHeight;
  };

  const isWithinGrid = (app: Appointment): boolean => {
    const [h] = app.startTime.split(':').map(Number);
    return h >= startHour && h < endHour;
  };

  // Helper to color card based on service color property
  const getServiceColorClasses = (color: string): string => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20';
      case 'emerald':
        return 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20';
      case 'violet':
        return 'bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 hover:bg-violet-500/20';
      case 'amber':
        return 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20';
      case 'rose':
        return 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20';
      default:
        return 'bg-primary/10 border-primary text-primary hover:bg-primary/20';
    }
  };

  // Header Title Formatting
  const getHeaderTitle = (): string => {
    if (viewMode === 'day') {
      const formatted = format(focusedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    if (viewMode === 'week') {
      const weekStart = startOfWeek(focusedDate, { weekStartsOn: 1 });
      const weekEnd = addDaysFns(weekStart, 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return format(weekStart, "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase());
      } else {
        const month1 = format(weekStart, "MMMM", { locale: es });
        const month2 = format(weekEnd, "MMMM yyyy", { locale: es });
        return `${month1.charAt(0).toUpperCase() + month1.slice(1)} - ${month2.charAt(0).toUpperCase() + month2.slice(1)}`;
      }
    }
    
    // Month View
    return format(focusedDate, "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase());
  };

  // Click on empty cell in day/week view
  const handleCellClick = (day: Date, hour: number) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    onSlotClick(dateStr, timeStr);
  };

  // Click on a day cell in Month view
  const handleMonthDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    onSlotClick(dateStr, '09:00');
  };

  return (
    <Card className="flex flex-col flex-1 bg-card/60 border border-border/40 overflow-hidden rounded-2xl shadow-xl backdrop-blur-md">
      
      {/* CALENDAR HEADER */}
      <div className="flex flex-col lg:flex-row items-center justify-between p-6 gap-4 border-b border-border/40 bg-card/50">
        
        {/* Title & Navigation */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight m-0">{getHeaderTitle()}</h2>
          </div>
          
          <div className="flex items-center border border-border/50 rounded-xl overflow-hidden shadow-sm bg-background/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none border-r border-border/40 hover:bg-muted"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-4 rounded-none text-xs font-semibold hover:bg-muted border-r border-border/40"
              onClick={handleToday}
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none hover:bg-muted"
              onClick={handleNext}
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-muted p-1 rounded-xl border border-border/30">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(mode)}
                className={`text-xs font-bold rounded-lg px-4 h-8 transition-all ${
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* RENDER VIEW MODE */}
      <div className="flex-1 overflow-x-auto">
        
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="min-w-[500px] flex flex-col">
            {/* Header day label */}
            <div className="flex border-b border-border/40 bg-muted/30">
              <div className="w-16 shrink-0 border-r border-border/40" />
              <div className="flex-1 py-4 text-center font-bold text-foreground">
                {format(focusedDate, 'EEEE, d MMMM', { locale: es }).toUpperCase()}
              </div>
            </div>

            {/* Grid */}
            <div className="flex relative" style={{ height: `${totalHours * hourHeight}px` }}>
              <div className="w-16 shrink-0 border-r border-border/40 bg-muted/10 flex flex-col relative select-none">
                {hoursArray.map((hour, idx) => (
                  <div
                    key={hour}
                    className="absolute w-full text-right pr-3 text-[11px] font-semibold text-muted-foreground/75"
                    style={{ top: `${idx * hourHeight - 8}px` }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div className="flex-1 relative h-full">
                {/* Horizontal lines */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {Array.from({ length: totalHours }).map((_, idx) => (
                    <div key={idx} className="border-b border-border/40" style={{ height: `${hourHeight}px` }} />
                  ))}
                </div>

                {/* Clickable slots */}
                {Array.from({ length: totalHours }).map((_, hourIdx) => {
                  const hour = startHour + hourIdx;
                  return (
                    <div
                      key={hour}
                      onClick={() => handleCellClick(focusedDate, hour)}
                      className="absolute w-full cursor-pointer hover:bg-primary/5 transition-all duration-150"
                      style={{ top: `${hourIdx * hourHeight}px`, height: `${hourHeight}px` }}
                    />
                  );
                })}

                {/* Day Appointments */}
                {appointments
                  .filter((app) => isSameDay(parseISO(app.date + 'T12:00:00'), focusedDate) && isWithinGrid(app))
                  .map((app) => {
                    const client = clients.find((c) => c.id === app.clientId);
                    const service = services.find((s) => s.id === app.serviceId);
                    if (!service || !client) return null;

                    const top = getTimeOffset(app.startTime);
                    const height = getCardHeight(service.duration);
                    const isCancelled = app.status === 'cancelled';

                    return (
                      <div
                        key={app.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(app);
                        }}
                        style={{ top: `${top + 2}px`, height: `${height - 4}px`, zIndex: 10 }}
                        className={`absolute left-3 right-3 px-4 py-3.5 border rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm transition-all duration-300 cursor-pointer select-none group/card ${
                          isCancelled 
                            ? 'bg-muted/40 border-muted text-muted-foreground/60 line-through hover:bg-muted/60'
                            : getServiceColorClasses(service.color)
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 leading-tight">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-sm truncate max-w-[85%]">
                              {service.name}
                            </span>
                            <Info className="h-4 w-4 opacity-0 group-hover/card:opacity-60 transition-opacity" />
                          </div>
                          <span className="text-xs font-semibold opacity-90">
                            Cliente: {client.name} | Contacto: {client.phone}
                          </span>
                          {app.notes && (
                            <p className="text-[11px] opacity-75 mt-1 truncate">Nota: {app.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-xs font-semibold mt-1">
                          <span>
                            {app.startTime} - {app.endTime} ({service.duration} mins)
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide border ${
                            isCancelled 
                              ? 'bg-muted border-muted-foreground/30 text-muted-foreground'
                              : app.status === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700'
                              : 'bg-blue-500/20 border-blue-500/30 text-blue-700'
                          }`}>
                            {isCancelled ? 'Cancelado' : app.status === 'completed' ? 'Completado' : 'Agendado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="min-w-[850px] flex flex-col">
            {/* Headers */}
            <div className="flex border-b border-border/40 bg-muted/30">
              <div className="w-16 shrink-0 border-r border-border/40" />
              {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focusedDate, { weekStartsOn: 1 }), i)).map((day, i) => {
                const isToday = isSameDay(day, new Date('2026-06-02'));
                return (
                  <div
                    key={i}
                    className={`flex-1 py-3 text-center border-r border-border/40 last:border-r-0 flex flex-col items-center justify-center gap-1 ${
                      isToday ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'eee', { locale: es })}
                    </span>
                    <span className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex relative" style={{ height: `${totalHours * hourHeight}px` }}>
              <div className="w-16 shrink-0 border-r border-border/40 bg-muted/10 flex flex-col relative select-none">
                {hoursArray.map((hour, idx) => (
                  <div
                    key={hour}
                    className="absolute w-full text-right pr-3 text-[11px] font-semibold text-muted-foreground/75"
                    style={{ top: `${idx * hourHeight - 8}px` }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div className="flex-1 flex relative h-full">
                {/* Horizontal lines */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {Array.from({ length: totalHours }).map((_, idx) => (
                    <div key={idx} className="border-b border-border/40" style={{ height: `${hourHeight}px` }} />
                  ))}
                </div>

                {/* Day columns */}
                {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focusedDate, { weekStartsOn: 1 }), i)).map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayAppointments = appointments.filter((app) => app.date === dateStr && isWithinGrid(app));
                  return (
                    <div key={dayIdx} className="flex-1 h-full border-r border-border/40 last:border-r-0 relative">
                      {Array.from({ length: totalHours }).map((_, hourIdx) => {
                        const hour = startHour + hourIdx;
                        return (
                          <div
                            key={hour}
                            onClick={() => handleCellClick(day, hour)}
                            className="absolute w-full cursor-pointer hover:bg-primary/5 transition-all"
                            style={{ top: `${hourIdx * hourHeight}px`, height: `${hourHeight}px` }}
                          />
                        );
                      })}

                      {dayAppointments.map((app) => {
                        const client = clients.find((c) => c.id === app.clientId);
                        const service = services.find((s) => s.id === app.serviceId);
                        if (!service || !client) return null;

                        const top = getTimeOffset(app.startTime);
                        const height = getCardHeight(service.duration);
                        const isCancelled = app.status === 'cancelled';

                        return (
                          <div
                            key={app.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(app);
                            }}
                            style={{ top: `${top + 2}px`, height: `${height - 4}px`, zIndex: 10 }}
                            className={`absolute left-1 right-1 px-2.5 py-1.5 border rounded-xl flex flex-col justify-between overflow-hidden shadow-sm transition-all cursor-pointer select-none group/card ${
                              isCancelled 
                                ? 'bg-muted/40 border-muted text-muted-foreground/60 line-through'
                                : getServiceColorClasses(service.color)
                            }`}
                          >
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-[11px] truncate">{service.name}</span>
                              <span className="text-[10px] opacity-90 truncate">{client.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-semibold mt-1">
                              <span>{app.startTime}</span>
                              <span className={`px-1 rounded-full text-[8px] border ${
                                isCancelled ? 'border-muted-foreground/20' : app.status === 'completed' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-blue-500/20 text-blue-700'
                              }`}>
                                {isCancelled ? 'C' : app.status === 'completed' ? 'OK' : 'A'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="min-w-[850px] flex flex-col border-t border-border/40">
            {/* Weekdays Headers */}
            <div className="flex bg-muted/30">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                <div key={i} className="flex-1 py-2 text-center text-xs font-bold text-muted-foreground border-r border-border/40 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 bg-border/40 gap-px">
              {(() => {
                const monthStart = startOfMonth(focusedDate);
                const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                
                // Render 42 day cells
                return Array.from({ length: 42 }, (_, i) => {
                  const day = addDays(gridStart, i);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayAppointments = appointments.filter((app) => app.date === dateStr);
                  const isCurrentMonth = isSameMonth(day, focusedDate);
                  const isToday = isSameDay(day, new Date('2026-06-02'));

                  return (
                    <div
                      key={i}
                      onClick={() => handleMonthDayClick(day)}
                      className={`min-h-[110px] bg-card p-2 flex flex-col gap-1 cursor-pointer transition hover:bg-muted/10 relative ${
                        isCurrentMonth ? '' : 'bg-muted/15'
                      }`}
                    >
                      {/* Day Number */}
                      <div className="flex justify-between items-center select-none">
                        <span className={`text-xs font-bold ${
                          isToday 
                            ? 'h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-sm shadow-primary/20'
                            : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/45'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        
                        {dayAppointments.length > 0 && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                          </span>
                        )}
                      </div>

                      {/* Day appointments list */}
                      <div className="flex flex-col gap-1 overflow-y-hidden max-h-[72px] mt-1">
                        {dayAppointments.slice(0, 3).map((app) => {
                          const service = services.find((s) => s.id === app.serviceId);
                          const client = clients.find((c) => c.id === app.clientId);
                          if (!service || !client) return null;
                          const isCancelled = app.status === 'cancelled';

                          return (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentClick(app);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate transition-all ${
                                isCancelled 
                                  ? 'bg-muted/40 border-muted text-muted-foreground/60 line-through'
                                  : getServiceColorClasses(service.color)
                              }`}
                              title={`${app.startTime} - ${service.name} (${client.name})`}
                            >
                              <span className="font-semibold">{app.startTime}</span> {service.name}
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <div className="text-[9px] text-muted-foreground font-bold pl-1">
                            + {dayAppointments.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

      </div>
    </Card>
  );
};
