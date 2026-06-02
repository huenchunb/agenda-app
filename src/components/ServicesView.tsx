import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Service } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Plus, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export const ServicesView: React.FC = () => {
  const { services, addService, updateService, deleteService } = useApp();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  const openDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setPrice(service.price);
      setDuration(service.duration);
      setDescription(service.description);
      setColor(service.color);
    } else {
      setEditingService(null);
      setName('');
      setPrice(30);
      setDuration(30);
      setDescription('');
      setColor('blue');
    }
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor, ingresa el nombre del servicio.');
      return;
    }
    if (price <= 0) {
      toast.error('Por favor, ingresa un precio mayor a 0.');
      return;
    }
    if (duration <= 0) {
      toast.error('Por favor, ingresa una duración mayor a 0.');
      return;
    }

    if (editingService) {
      updateService({
        id: editingService.id,
        name,
        price,
        duration,
        description,
        color,
      });
      toast.success('Servicio actualizado exitosamente.');
    } else {
      addService({
        name,
        price,
        duration,
        description,
        color,
      });
      toast.success('Servicio creado exitosamente.');
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${name}"? Las citas agendadas mantendrán su información, pero no se podrán agendar nuevas citas con este servicio.`)) {
      deleteService(id);
      toast.success('Servicio eliminado.');
    }
  };

  // Helper to resolve Tailwind badge classes for color choice
  const getColorDotClasses = (c: string): string => {
    switch (c) {
      case 'blue':
        return 'bg-blue-500 shadow-sm shadow-blue-500/40';
      case 'emerald':
        return 'bg-emerald-500 shadow-sm shadow-emerald-500/40';
      case 'violet':
        return 'bg-violet-500 shadow-sm shadow-violet-500/40';
      case 'amber':
        return 'bg-amber-500 shadow-sm shadow-amber-500/40';
      case 'rose':
        return 'bg-rose-500 shadow-sm shadow-rose-500/40';
      default:
        return 'bg-primary shadow-sm';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight m-0">Catálogo de Servicios</h2>
          <p className="text-sm text-muted-foreground m-0">Gestiona los servicios ofrecidos, sus duraciones, costos y etiquetas de color.</p>
        </div>
        <Button 
          onClick={() => openDialog()}
          className="rounded-xl gap-2 shadow-sm shrink-0"
        >
          <Plus className="h-5 w-5" />
          Nuevo Servicio
        </Button>
      </div>

      {/* GRID OF SERVICES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className="flex flex-col border border-border/40 bg-card/60 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            {/* Colored top border strip */}
            <div className={`h-1.5 w-full ${
              service.color === 'blue' ? 'bg-blue-500' :
              service.color === 'emerald' ? 'bg-emerald-500' :
              service.color === 'violet' ? 'bg-violet-500' :
              service.color === 'amber' ? 'bg-amber-500' :
              service.color === 'rose' ? 'bg-rose-500' : 'bg-primary'
            }`} />

            <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-base font-bold leading-snug">{service.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${getColorDotClasses(service.color)}`} />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Etiqueta {service.color}
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="bg-primary/10 text-primary text-sm font-bold px-3 py-1.5 rounded-xl border border-primary/20 shrink-0">
                ${service.price} USD
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-3 pb-4">
              <p className="text-xs text-muted-foreground/90 leading-relaxed italic flex-1">
                {service.description || 'Sin descripción detallada.'}
              </p>
              
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground border-t border-border/20 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/75" />
                  <span>{service.duration} minutos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-primary/75" />
                  <span>${service.price} por sesión</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/15 border-t border-border/20 px-6 py-3 flex justify-end gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground gap-1.5"
                onClick={() => openDialog(service)}
              >
                <Edit className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold hover:bg-destructive/10 text-muted-foreground hover:text-destructive gap-1.5"
                onClick={() => handleDelete(service.id, service.name)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* CREATE/EDIT SERVICE DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure las propiedades del servicio para ofrecerlo en el calendario.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4 py-3">
            
            {/* NAME INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nombre del Servicio
              </Label>
              <Input
                id="s-name"
                type="text"
                placeholder="Ej. Limpieza Dental, Asesoría Legal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>

            {/* DURATION & PRICE ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="s-duration" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Duración (Minutos)
                </Label>
                <Input
                  id="s-duration"
                  type="number"
                  placeholder="30"
                  min="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="s-price" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Precio (USD)
                </Label>
                <Input
                  id="s-price"
                  type="number"
                  placeholder="50"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
                />
              </div>
            </div>

            {/* COLOR SELECT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-color" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Color de Visualización
              </Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id="s-color" className="rounded-xl border border-border/60 hover:bg-muted/40 transition">
                  <SelectValue placeholder="Seleccione un color" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="blue" className="rounded-lg">Azul (General)</SelectItem>
                  <SelectItem value="emerald" className="rounded-lg">Esmeralda (Asesoría)</SelectItem>
                  <SelectItem value="violet" className="rounded-lg">Violeta (Terapia)</SelectItem>
                  <SelectItem value="amber" className="rounded-lg">Ámbar (Mantenimiento)</SelectItem>
                  <SelectItem value="rose" className="rounded-lg">Rosa (Urgencia/Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DESCRIPTION INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-desc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Descripción
              </Label>
              <Input
                id="s-desc"
                type="text"
                placeholder="Breve explicación de lo que incluye el servicio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>

            <DialogFooter className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-border/80 hover:bg-muted w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-6 w-full sm:w-auto"
              >
                {editingService ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};
