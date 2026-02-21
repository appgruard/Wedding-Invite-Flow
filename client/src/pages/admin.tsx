import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invitation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Download,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Armchair,
  QrCode,
  Eye,
} from "lucide-react";

const createInvitationSchema = z.object({
  guestName: z.string().min(1, "El nombre es requerido"),
  seats: z.coerce.number().min(1).max(10).default(2),
});

const editInvitationSchema = z.object({
  guestName: z.string().min(1, "El nombre es requerido"),
  seats: z.coerce.number().min(1).max(10),
});

type CreateFormValues = z.infer<typeof createInvitationSchema>;
type EditFormValues = z.infer<typeof editInvitationSchema>;

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <Badge
        data-testid={`badge-status-${status}`}
        className="bg-green-600 dark:bg-green-700 text-white no-default-hover-elevate"
      >
        Aceptada
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge
        data-testid={`badge-status-${status}`}
        variant="destructive"
        className="no-default-hover-elevate"
      >
        Declinada
      </Badge>
    );
  }
  return (
    <Badge
      data-testid={`badge-status-${status}`}
      className="bg-amber-500 dark:bg-amber-600 text-white no-default-hover-elevate"
    >
      Pendiente
    </Badge>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/invitations"],
  });

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { guestName: "", seats: 2 },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editInvitationSchema),
    defaultValues: { guestName: "", seats: 2 },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormValues) => {
      await apiRequest("POST", "/api/invitations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "Invitación creada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear invitación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: EditFormValues & { id: string }) => {
      const { id, ...body } = data;
      await apiRequest("PATCH", `/api/invitations/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      setEditDialogOpen(false);
      setSelectedInvitation(null);
      toast({ title: "Invitación actualizada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar invitación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/invitations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      toast({ title: "Invitación eliminada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar invitación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch = inv.guestName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvitations = invitations.length;
  const acceptedCount = invitations.filter(
    (i) => i.status === "accepted"
  ).length;
  const declinedCount = invitations.filter(
    (i) => i.status === "declined"
  ).length;
  const pendingCount = invitations.filter(
    (i) => i.status === "pending"
  ).length;
  const totalConfirmedSeats = invitations.reduce(
    (sum, i) => sum + (i.confirmedSeats ?? 0),
    0
  );
  const totalSeats = invitations.reduce((sum, i) => sum + i.seats, 0);

  function copyLink(invitation: Invitation) {
    const link = `${window.location.origin}/invitation?id=${invitation.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Enlace copiado al portapapeles" });
  }

  function openEdit(invitation: Invitation) {
    setSelectedInvitation(invitation);
    editForm.reset({
      guestName: invitation.guestName,
      seats: invitation.seats,
    });
    setEditDialogOpen(true);
  }

  function openQrPreview(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setQrDialogOpen(true);
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(180, 130, 50);
    doc.text("Lista de Invitados - Boda Ana Maria & Carlos Eduardo", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generado el: ${new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      14,
      28
    );

    const tableData = invitations.map((inv, idx) => [
      idx + 1,
      inv.guestName,
      inv.seats,
      inv.confirmedSeats ?? 0,
      inv.status === "accepted"
        ? "Confirmado"
        : inv.status === "declined"
          ? "Declinado"
          : "Pendiente",
    ]);

    autoTable(doc, {
      startY: 34,
      head: [
        [
          "#",
          "Nombre del Invitado",
          "Asientos Asignados",
          "Asientos Confirmados",
          "Estado",
        ],
      ],
      body: tableData,
      headStyles: {
        fillColor: [180, 130, 50],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [250, 245, 235] },
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 150;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const summaryY = finalY + 12;
    doc.text(`Total invitados: ${totalInvitations}`, 14, summaryY);
    doc.text(`Confirmados: ${acceptedCount}`, 14, summaryY + 6);
    doc.text(`Declinados: ${declinedCount}`, 14, summaryY + 12);
    doc.text(`Pendientes: ${pendingCount}`, 14, summaryY + 18);
    doc.text(
      `Total asientos confirmados: ${totalConfirmedSeats}`,
      14,
      summaryY + 24
    );

    doc.save("lista-invitados-boda.pdf");
    toast({ title: "PDF descargado exitosamente" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1
            className="text-2xl md:text-3xl font-bold"
            data-testid="text-admin-title"
          >
            Panel de Administración
          </h1>
          <p
            className="text-muted-foreground"
            data-testid="text-admin-subtitle"
          >
            Boda Ana Maria & Carlos Eduardo
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card data-testid="card-total-invitations">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invitaciones
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-count">
                {totalInvitations}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-accepted-count">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-green-600"
                data-testid="text-accepted-count"
              >
                {acceptedCount}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-declined-count">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declinadas</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-destructive"
                data-testid="text-declined-count"
              >
                {declinedCount}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-pending-count">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold text-amber-500"
                data-testid="text-pending-count"
              >
                {pendingCount}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-confirmed-seats">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asientos Confirmados
              </CardTitle>
              <Armchair className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                data-testid="text-confirmed-seats"
              >
                {totalConfirmedSeats}
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-total-seats">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asientos Totales
              </CardTitle>
              <Armchair className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-seats">
                {totalSeats}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-60"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-40"
                data-testid="select-status-filter"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="accepted">Aceptadas</SelectItem>
                <SelectItem value="declined">Declinadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={downloadPDF}
              data-testid="button-download-pdf"
            >
              <Download />
              Descargar Lista de Invitados (PDF)
            </Button>

            <Dialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button data-testid="button-create-invitation">
                  <Plus />
                  Nueva Invitación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Invitación</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit((data) =>
                      createMutation.mutate(data)
                    )}
                    className="space-y-4"
                    data-testid="form-create-invitation"
                  >
                    <FormField
                      control={createForm.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Invitado</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-guest-name"
                              placeholder="Nombre completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Asientos</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-seats"
                              type="number"
                              min={1}
                              max={10}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-create"
                    >
                      {createMutation.isPending
                        ? "Creando..."
                        : "Crear Invitación"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invitado</TableHead>
                  <TableHead className="text-center">Asientos</TableHead>
                  <TableHead className="text-center">Confirmados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">QR</TableHead>
                  <TableHead>Enlace</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No se encontraron invitaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvitations.map((invitation) => (
                    <TableRow
                      key={invitation.id}
                      data-testid={`row-invitation-${invitation.id}`}
                    >
                      <TableCell
                        className="font-medium"
                        data-testid={`text-guest-name-${invitation.id}`}
                      >
                        {invitation.guestName}
                      </TableCell>
                      <TableCell
                        className="text-center"
                        data-testid={`text-seats-${invitation.id}`}
                      >
                        {invitation.seats}
                      </TableCell>
                      <TableCell
                        className="text-center"
                        data-testid={`text-confirmed-${invitation.id}`}
                      >
                        {invitation.confirmedSeats ?? 0}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invitation.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        {invitation.qrCode ? (
                          <button
                            onClick={() => openQrPreview(invitation)}
                            className="inline-block cursor-pointer"
                            data-testid={`button-qr-preview-${invitation.id}`}
                          >
                            <img
                              src={invitation.qrCode}
                              alt="QR Code"
                              className="w-8 h-8 inline-block rounded-sm"
                            />
                          </button>
                        ) : (
                          <QrCode className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(invitation)}
                          data-testid={`button-copy-link-${invitation.id}`}
                        >
                          <Copy />
                          Copiar
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(invitation)}
                            data-testid={`button-edit-${invitation.id}`}
                          >
                            <Pencil />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-delete-${invitation.id}`}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Eliminar Invitación
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que deseas eliminar la
                                  invitación de{" "}
                                  <strong>{invitation.guestName}</strong>? Esta
                                  acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  data-testid="button-cancel-delete"
                                >
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate(invitation.id)
                                  }
                                  data-testid="button-confirm-delete"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Invitación</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((data) =>
                  editMutation.mutate({
                    ...data,
                    id: selectedInvitation?.id ?? "",
                  })
                )}
                className="space-y-4"
                data-testid="form-edit-invitation"
              >
                <FormField
                  control={editForm.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Invitado</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-edit-guest-name"
                          placeholder="Nombre completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Asientos</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-edit-seats"
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={editMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {editMutation.isPending
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Código QR - {selectedInvitation?.guestName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {selectedInvitation?.qrCode && (
                <img
                  src={selectedInvitation.qrCode}
                  alt="QR Code"
                  className="w-64 h-64 rounded-md"
                  data-testid="img-qr-full"
                />
              )}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground break-all">
                  {selectedInvitation &&
                    `${window.location.origin}/invitation?id=${selectedInvitation.id}`}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    selectedInvitation && copyLink(selectedInvitation)
                  }
                  data-testid="button-copy-link-qr-dialog"
                >
                  <Copy />
                  Copiar Enlace
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
