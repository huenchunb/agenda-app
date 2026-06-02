import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Appointment } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedTime: string;
  appointmentToEdit: Appointment | null;
}

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  appointmentToEdit,
}) => {
  const {
    clients,
    services,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    checkOverlap,
  } = useApp();

  const [clientId, setClientId] = useState(appointmentToEdit?.clientId || clients[0]?.id || '');
  const [serviceId, setServiceId] = useState(appointmentToEdit?.serviceId || services[0]?.id || '');
  const [date, setDate] = useState(appointmentToEdit?.date || selectedDate || '');
  const [startTime, setStartTime] = useState(appointmentToEdit?.startTime || selectedTime || '09:00');
  const [notes, setNotes] = useState(appointmentToEdit?.notes || '');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>(appointmentToEdit?.status || 'scheduled');

  const selectedService = services.find((s) => s.id === serviceId);

  // Real-time overlap warning computed on render
  let errorMsg: string | null = null;
  if (date && startTime && selectedService) {
    const [h, m] = startTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + selectedService.duration;
      const endHours = Math.floor(endMinutes / 60).toString().padStart(2, '0');
      const endMins = (endMinutes % 60).toString().padStart(2, '0');
      const endTime = `${endHours}:${endMins}`;

      const overlap = checkOverlap(date, startTime, endTime, appointmentToEdit?.id);
      if (overlap) {
        errorMsg = 'Advertencia: El horario seleccionado coincide con otra cita reservada.';
      }
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error('Por favor, selecciona un cliente.');
      return;
    }
    if (!serviceId) {
      toast.error('Por favor, selecciona un servicio.');
      return;
    }
    if (!date) {
      toast.error('Por favor, ingresa una fecha.');
      return;
    }
    if (!startTime) {
      toast.error('Por favor, ingresa una hora de inicio.');
      return;
    }

    if (appointmentToEdit) {
      const result = updateAppointment({
        id: appointmentToEdit.id,
        clientId,
        serviceId,
        date,
        startTime,
        endTime: appointmentToEdit.endTime, // will be recalculated in context
        notes,
        status,
      });

      if (result.success) {
        toast.success('Cita actualizada exitosamente.');
        onClose();
      } else {
        toast.error(result.error || 'Ocurrió un error al actualizar la cita.');
      }
    } else {
      const result = addAppointment({
        clientId,
        serviceId,
        date,
        startTime,
        notes,
        status: 'scheduled',
      });

      if (result.success) {
        toast.success('Cita agendada exitosamente.');
        onClose();
      } else {
        toast.error(result.error || 'Ocurrió un error al agendar la cita.');
      }
    }
  };

  const handleDelete = () => {
    if (appointmentToEdit) {
      if (confirm('¿Estás seguro de que deseas eliminar esta cita permanentemente?')) {
        deleteAppointment(appointmentToEdit.id);
        toast.success('Cita eliminada.');
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {appointmentToEdit ? 'Editar Detalles de la Cita' : 'Agendar Nueva Cita'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete los campos correspondientes para guardar la reservación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-5 py-4">
          
          {/* CLIENT SELECT */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="client" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cliente
            </Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client" className="rounded-xl border border-border/60 hover:bg-muted/40 transition">
                <SelectValue placeholder="Seleccione un cliente" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="rounded-lg">
                    {c.name} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SERVICE SELECT */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="service" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Servicio
            </Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service" className="rounded-xl border border-border/60 hover:bg-muted/40 transition">
                <SelectValue placeholder="Seleccione un servicio" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="rounded-lg">
                    {s.name} — {s.duration} min / ${s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DATE & TIME ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="time" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hora de Inicio
              </Label>
              <Input
                id="time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>
          </div>

          {/* SERVICE SUMMARY INFO CARD */}
          {selectedService && (
            <div className="bg-muted/30 border border-border/20 rounded-xl p-3.5 flex flex-col gap-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Duración Estimada:</span>
                <span className="font-bold text-foreground">{selectedService.duration} minutos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Costo del Servicio:</span>
                <span className="font-bold text-foreground text-sm">${selectedService.price} USD</span>
              </div>
              <p className="text-[11px] text-muted-foreground/80 mt-1 italic leading-snug">
                {selectedService.description}
              </p>
            </div>
          )}

          {/* EDIT ONLY: STATUS SELECT */}
          {appointmentToEdit && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estado de la Cita
              </Label>
              <Select 
                value={status} 
                onValueChange={(val) => setStatus(val as 'scheduled' | 'completed' | 'cancelled')}
              >
                <SelectTrigger id="status" className="rounded-xl border border-border/60 hover:bg-muted/40 transition">
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="scheduled" className="rounded-lg">Agendado</SelectItem>
                  <SelectItem value="completed" className="rounded-lg">Completado</SelectItem>
                  <SelectItem value="cancelled" className="rounded-lg">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* NOTES TEXTAREA */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notas Adicionales
            </Label>
            <Input
              id="notes"
              type="text"
              placeholder="Detalles o requerimientos adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
            />
          </div>

          {/* OVERLAP WARNING PANEL */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl p-3 flex items-start gap-2 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            {/* Delete button (Edit Mode Only) */}
            {appointmentToEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="rounded-xl gap-2 mr-auto w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            )}
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl w-full sm:w-auto border-border/80 hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl w-full sm:w-auto px-6"
                disabled={errorMsg !== null && !appointmentToEdit} // prevent saving overlaps on new appointments
              >
                Guardar
              </Button>
            </div>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};
