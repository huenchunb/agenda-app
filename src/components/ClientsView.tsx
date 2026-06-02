import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Client } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Search, Edit2, Trash2, Mail, Phone, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';

export const ClientsView: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [search, setSearch] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Handle open dialog (create vs edit)
  const openDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
      setNotes(client.notes || '');
    } else {
      setEditingClient(null);
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Por favor, ingresa el nombre del cliente.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Por favor, ingresa un teléfono de contacto.');
      return;
    }

    if (editingClient) {
      updateClient({
        id: editingClient.id,
        name,
        email,
        phone,
        notes,
      });
      toast.success('Cliente actualizado exitosamente.');
    } else {
      addClient({
        name,
        email,
        phone,
        notes,
      });
      toast.success('Cliente creado exitosamente.');
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name}? Esto no eliminará sus citas pasadas pero no podrás agendarle nuevas.`)) {
      deleteClient(id);
      toast.success('Cliente eliminado.');
    }
  };

  // Filter clients list
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight m-0">Administración de Clientes</h2>
          <p className="text-sm text-muted-foreground m-0">Gestiona la información de contacto y detalles de tus clientes.</p>
        </div>
        <Button 
          onClick={() => openDialog()}
          className="rounded-xl gap-2 shadow-sm shrink-0"
        >
          <Plus className="h-5 w-5" />
          Agregar Cliente
        </Button>
      </div>

      {/* FILTER & LIST CARD */}
      <Card className="border border-border/40 bg-card/60 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Lista de Clientes
            <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full font-medium text-muted-foreground">
              {filteredClients.length} total
            </span>
          </CardTitle>
          <CardDescription>Busca y filtra rápidamente en tu base de datos de clientes.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4">
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground/70" />
            <Input
              type="text"
              placeholder="Buscar por nombre, correo electrónico o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl border border-border/60 hover:border-border transition"
            />
          </div>

          {/* CLIENTS TABLE */}
          <div className="border border-border/40 rounded-xl overflow-hidden bg-background/40">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[200px] font-bold">Nombre</TableHead>
                  <TableHead className="font-bold">Contacto</TableHead>
                  <TableHead className="font-bold hidden md:table-cell">Notas</TableHead>
                  <TableHead className="w-[100px] text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No se encontraron clientes registrados que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/20 transition-colors">
                      {/* Name Column */}
                      <TableCell className="font-bold text-foreground py-3.5">
                        {client.name}
                      </TableCell>

                      {/* Contact Info Column */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            {client.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            {client.phone}
                          </span>
                        </div>
                      </TableCell>

                      {/* Notes Column (Desktop only) */}
                      <TableCell className="text-xs text-muted-foreground/90 max-w-sm truncate py-3.5 hidden md:table-cell">
                        {client.notes ? (
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                            {client.notes}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground/40">Sin observaciones</span>
                        )}
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="text-right py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => openDialog(client)}
                            title="Editar cliente"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(client.id, client.name)}
                            title="Eliminar cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE/EDIT CLIENT MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingClient ? 'Editar Información del Cliente' : 'Registrar Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Complete los datos del cliente para su registro en la base de datos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4 py-3">
            
            {/* NAME INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nombre Completo
              </Label>
              <Input
                id="c-name"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>

            {/* EMAIL INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Correo Electrónico
              </Label>
              <Input
                id="c-email"
                type="email"
                placeholder="Ej. juan.perez@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>

            {/* PHONE INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Teléfono de Contacto
              </Label>
              <Input
                id="c-phone"
                type="tel"
                placeholder="Ej. +56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl border border-border/60 hover:bg-muted/40 transition"
              />
            </div>

            {/* NOTES INPUT */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Observaciones (Opcional)
              </Label>
              <Input
                id="c-notes"
                type="text"
                placeholder="Detalles del perfil del cliente, preferencias, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                {editingClient ? 'Guardar Cambios' : 'Registrar'}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};
