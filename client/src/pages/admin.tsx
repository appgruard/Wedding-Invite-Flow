import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link, useLocation } from "wouter";
import type { Invitation, Wedding } from "@shared/schema";
import { TEMPLATES, INVITATION_STYLES, insertWeddingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
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
  LogOut,
  Palette,
  Heart,
  Calendar as CalendarIcon,
  Music,
  Video,
  Gift,
  Layout,
  Upload,
  X,
} from "lucide-react";

const createInvitationSchema = z.object({
  guestName: z.string().min(1, "El nombre es requerido"),
  seats: z.coerce.number().min(1).max(10).default(2),
  weddingId: z.string().min(1, "Debe seleccionar una boda"),
});

const editInvitationSchema = z.object({
  guestName: z.string().min(1, "El nombre es requerido"),
  seats: z.coerce.number().min(1).max(10),
  weddingId: z.string().min(1, "Debe seleccionar una boda"),
});

const weddingFormSchema = insertWeddingSchema.extend({
  introDuration: z.coerce.number().min(1000).max(10000),
  clientUsername: z.string().default(""),
  clientPassword: z.string().default(""),
});

type CreateFormValues = z.infer<typeof createInvitationSchema>;
type EditFormValues = z.infer<typeof editInvitationSchema>;
type WeddingFormValues = z.infer<typeof weddingFormSchema>;

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
  const [, setLocation] = useLocation();
  const { authenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [colorsList, setColorsList] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#C9A96E");

  const { data: weddings = [], isLoading: weddingsLoading } = useQuery<Wedding[]>({
    queryKey: ["/api/weddings"],
  });

  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);

  const selectedWedding = weddings.find(w => w.id === selectedWeddingId);

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: selectedWeddingId ? ["/api/invitations/wedding", selectedWeddingId] : ["/api/invitations"],
    enabled: true,
  });

  const [weddingDialogOpen, setWeddingDialogOpen] = useState(false);
  const [editingWedding, setEditingWedding] = useState<Wedding | null>(null);

  const weddingForm = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: {
      coupleName: "Ana María & Carlos Eduardo",
      weddingDate: "15 de marzo de 2026",
      venueName: "Salón Gran Fiesta",
      venueAddress: "Av. Insurgentes Sur 1234, CDMX",
      venueTime: "20:00 hrs",
      churchName: "Parroquia de Santa María",
      churchAddress: "Calle Iglesia 45, CDMX",
      churchTime: "18:00 hrs",
      dressCode: "Formal / Etiqueta",
      message: "",
      giftUrl1: "https://www.liverpool.com.mx",
      giftLabel1: "Liverpool",
      giftUrl2: "https://www.amazon.com.mx",
      giftLabel2: "Amazon",
      couplePhotoUrl: "/images/couple.png",
      template: "clasico",
      colorStyleId: "clasico",
      videoUrl: "",
      videoType: "none",
      introDuration: 4000,
      tvVideoUrl: "https://youtu.be/BboMpayJomw",
      tvVideoType: "youtube",
      musicUrl: "",
      musicType: "none",
      clientUsername: "",
      clientPassword: "",
      allowedColors: "[]",
    },
  });

  const createWeddingMutation = useMutation({
    mutationFn: async (data: WeddingFormValues) => {
      await apiRequest("POST", "/api/weddings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
      setWeddingDialogOpen(false);
      weddingForm.reset();
      toast({ title: "Boda creada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear boda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWeddingMutation = useMutation({
    mutationFn: async (data: WeddingFormValues & { id: string }) => {
      const { id, ...body } = data;
      await apiRequest("PATCH", `/api/weddings/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
      setWeddingDialogOpen(false);
      setEditingWedding(null);
      toast({ title: "Boda actualizada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar boda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteWeddingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/weddings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
      if (selectedWeddingId === editingWedding?.id) {
        setSelectedWeddingId(null);
      }
      toast({ title: "Boda eliminada exitosamente" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar boda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { guestName: "", seats: 2, weddingId: selectedWeddingId || "" },
  });

  useEffect(() => {
    if (selectedWeddingId) {
      createForm.setValue("weddingId", selectedWeddingId);
    }
  }, [selectedWeddingId, createForm]);

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editInvitationSchema),
    defaultValues: { guestName: "", seats: 2, weddingId: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateFormValues) => {
      await apiRequest("POST", "/api/invitations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      if (selectedWeddingId) {
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/wedding", selectedWeddingId] });
      }
      setCreateDialogOpen(false);
      createForm.reset({ guestName: "", seats: 2, weddingId: selectedWeddingId || "" });
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
      if (selectedWeddingId) {
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/wedding", selectedWeddingId] });
      }
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
      if (selectedWeddingId) {
        queryClient.invalidateQueries({ queryKey: ["/api/invitations/wedding", selectedWeddingId] });
      }
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(["/api/auth/check"], { authenticated: false });
    },
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLoginPassword) return;
    setAdminLoginLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { password: adminLoginPassword });
      if (res.ok) {
        queryClient.setQueryData(["/api/auth/check"], { authenticated: true });
        queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
        setAdminLoginPassword("");
        toast({ title: "Bienvenido", description: "Acceso de administrador concedido" });
      } else {
        toast({ title: "Error", description: "Contraseña incorrecta", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Error de conexión", variant: "destructive" });
    } finally {
      setAdminLoginLoading(false);
    }
  };

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

  function openQrPreview(invitation: Invitation) {
    setSelectedInvitation(invitation);
    setQrDialogOpen(true);
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(180, 130, 50);
    doc.text(`Lista de Invitados - Boda ${selectedWedding?.coupleName || ""}`, 14, 20);

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

    doc.save(`lista-invitados-boda-${selectedWedding?.coupleName || "boda"}.pdf`);
    toast({ title: "PDF descargado exitosamente" });
  }

  function openEdit(invitation: Invitation) {
    setSelectedInvitation(invitation);
    editForm.reset({
      guestName: invitation.guestName,
      seats: invitation.seats,
      weddingId: invitation.weddingId || "",
    });
    setEditDialogOpen(true);
  }

  function openEditWedding(wedding: Wedding) {
    setEditingWedding(wedding);
    weddingForm.reset({
      coupleName: wedding.coupleName,
      weddingDate: wedding.weddingDate,
      venueName: wedding.venueName || "",
      venueAddress: wedding.venueAddress || "",
      venueTime: wedding.venueTime || "",
      churchName: wedding.churchName || "",
      churchAddress: wedding.churchAddress || "",
      churchTime: wedding.churchTime || "",
      dressCode: wedding.dressCode || "",
      message: wedding.message || "",
      giftUrl1: wedding.giftUrl1 || "",
      giftLabel1: wedding.giftLabel1 || "",
      giftUrl2: wedding.giftUrl2 || "",
      giftLabel2: wedding.giftLabel2 || "",
      couplePhotoUrl: wedding.couplePhotoUrl || "/images/couple.png",
      template: wedding.template,
      colorStyleId: wedding.colorStyleId,
      videoUrl: wedding.videoUrl || "",
      videoType: wedding.videoType,
      introDuration: wedding.introDuration,
      tvVideoUrl: wedding.tvVideoUrl || "https://youtu.be/BboMpayJomw",
      tvVideoType: wedding.tvVideoType || "youtube",
      musicUrl: wedding.musicUrl || "",
      musicType: wedding.musicType || "none",
      clientUsername: wedding.clientUsername || "",
      clientPassword: wedding.clientPassword || "",
      allowedColors: wedding.allowedColors || "[]",
    });
    try { setColorsList(JSON.parse(wedding.allowedColors || "[]")); } catch { setColorsList([]); }
    setWeddingDialogOpen(true);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        weddingForm.setValue(field as any, data.url);
        toast({ title: "Archivo subido correctamente" });
      }
    } catch (error) {
      toast({ title: "Error al subir archivo", variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wedding-cream">
        <Card className="w-full max-w-md border-wedding-gold">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="w-8 h-8 text-wedding-burgundy fill-wedding-burgundy" />
            </div>
            <div>
              <CardTitle className="text-3xl font-sans text-wedding-burgundy">Administrador</CardTitle>
              <CardDescription className="mt-2 text-sm font-serif text-wedding-gold">
                Panel de gestión completo
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium font-serif text-wedding-burgundy">
                  Contraseña de administrador
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={adminLoginPassword}
                  onChange={(e) => setAdminLoginPassword(e.target.value)}
                  disabled={adminLoginLoading}
                  data-testid="input-admin-password"
                  className="font-serif border-wedding-gold"
                />
              </div>
              <Button
                type="submit"
                disabled={adminLoginLoading}
                data-testid="button-admin-login"
                className="w-full font-serif text-white bg-wedding-burgundy"
              >
                {adminLoginLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (weddingsLoading || invitationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              {selectedWedding ? `Boda ${selectedWedding.coupleName}` : "Gestión de Bodas e Invitados"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/estilos">
              <Button variant="outline" data-testid="button-estilos">
                <Palette className="w-4 h-4 mr-2" />
                Selector de Estilos
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="bodas" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="bodas" data-testid="tab-weddings">
              <Heart className="w-4 h-4 mr-2" />
              Bodas
            </TabsTrigger>
            <TabsTrigger value="invitados" data-testid="tab-invitations">
              <Users className="w-4 h-4 mr-2" />
              Invitados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bodas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mis Bodas</h2>
              <Button onClick={() => {
                setEditingWedding(null);
                weddingForm.reset();
                setColorsList([]);
                setWeddingDialogOpen(true);
              }} data-testid="button-new-wedding">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Boda
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weddings.map((wedding) => {
                const template = TEMPLATES.find(t => t.id === wedding.template);
                return (
                  <Card 
                    key={wedding.id} 
                    className={`hover-elevate cursor-pointer ${selectedWeddingId === wedding.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedWeddingId(wedding.id)}
                    data-testid={`card-wedding-${wedding.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{wedding.coupleName}</CardTitle>
                        <Badge variant="outline">
                          {template?.thumbnail} {template?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {wedding.weddingDate}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm font-medium">
                          {invitations.filter(i => i.weddingId === wedding.id).length} Invitaciones
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditWedding(wedding)}
                            data-testid={`button-edit-wedding-${wedding.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-wedding-${wedding.id}`}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar boda?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esto eliminará también todas las invitaciones asociadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteWeddingMutation.mutate(wedding.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="invitados" className="space-y-6">
            {!selectedWeddingId ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Heart className="w-12 h-12 text-muted-foreground opacity-20" />
                  <h3 className="text-xl font-medium">Seleccionar boda</h3>
                  <p className="text-muted-foreground">Selecciona una boda en la pestaña "Bodas" para gestionar sus invitados.</p>
                  <Button variant="outline" onClick={() => {
                    const tab = document.querySelector('[value="bodas"]') as HTMLButtonElement;
                    tab?.click();
                  }}>
                    Ver Bodas
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Invitados de: {selectedWedding?.coupleName}</h2>
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
                        className="pl-9 w-full sm:w-60"
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
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Lista (PDF)
                    </Button>

                    <Dialog
                      open={createDialogOpen}
                      onOpenChange={setCreateDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button data-testid="button-create-invitation">
                          <Plus className="w-4 h-4 mr-2" />
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
                              name="weddingId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Boda</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-wedding">
                                        <SelectValue placeholder="Seleccionar boda" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {weddings.map((wedding) => (
                                        <SelectItem key={wedding.id} value={wedding.id}>
                                          {wedding.coupleName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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
                  <CardContent className="p-0 overflow-x-auto">
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
                                  <Copy className="w-4 h-4 mr-2" />
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
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        data-testid={`button-delete-${invitation.id}`}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
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
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Wedding Create/Edit Dialog */}
        <Dialog open={weddingDialogOpen} onOpenChange={setWeddingDialogOpen}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWedding ? "Editar Boda" : "Nueva Boda"}</DialogTitle>
            </DialogHeader>
            <Form {...weddingForm}>
              <form
                onSubmit={weddingForm.handleSubmit((data) =>
                  editingWedding 
                    ? updateWeddingMutation.mutate({ ...data, id: editingWedding.id })
                    : createWeddingMutation.mutate(data)
                )}
                className="space-y-6"
                data-testid="form-wedding"
              >
                <Tabs defaultValue="pareja">
                  <TabsList className="flex w-full overflow-x-auto">
                    <TabsTrigger value="pareja" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Pareja</TabsTrigger>
                    <TabsTrigger value="evento" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Evento</TabsTrigger>
                    <TabsTrigger value="regalos" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Regalos</TabsTrigger>
                    <TabsTrigger value="plantilla" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Plantilla</TabsTrigger>
                    <TabsTrigger value="musica" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Música</TabsTrigger>
                    <TabsTrigger value="video" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Video</TabsTrigger>
                    <TabsTrigger value="acceso" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">Acceso</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pareja" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={weddingForm.control}
                        name="coupleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Pareja</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-wedding-couple" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={weddingForm.control}
                        name="weddingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de la Boda</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="15 de marzo de 2026" data-testid="input-wedding-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={weddingForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje Personalizado</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} className="h-24" data-testid="textarea-wedding-message" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={weddingForm.control}
                      name="couplePhotoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto de la Pareja</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 rounded-md overflow-hidden border">
                                <img src={field.value || "/images/couple.png"} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleFileUpload(e, "couplePhotoUrl")} 
                                  className="cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Cargar nueva foto</p>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="evento" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md">
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center"><Plus className="w-4 h-4 mr-2" /> Ceremonia (Iglesia)</h4>
                        <FormField
                          control={weddingForm.control}
                          name="churchName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="churchAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="churchTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center"><Music className="w-4 h-4 mr-2" /> Recepción (Salón)</h4>
                        <FormField
                          control={weddingForm.control}
                          name="venueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="venueAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="venueTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <FormField
                      control={weddingForm.control}
                      name="dressCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Vestimenta</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3 mt-4">
                      <Label>Colores Permitidos</Label>
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          type="color"
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-border"
                          data-testid="input-color-picker"
                        />
                        <Input
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="w-28"
                          data-testid="input-color-hex"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (newColor && /^#[0-9A-Fa-f]{6}$/.test(newColor) && !colorsList.includes(newColor)) {
                              const updated = [...colorsList, newColor];
                              setColorsList(updated);
                              weddingForm.setValue("allowedColors", JSON.stringify(updated));
                            }
                          }}
                          data-testid="button-add-color"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                      </div>
                      {colorsList.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {colorsList.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-1 border rounded-md px-2 py-1 bg-muted/30" data-testid={`swatch-admin-${idx}`}>
                              <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: color }} />
                              <span className="text-xs font-mono">{color}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = colorsList.filter((_, i) => i !== idx);
                                  setColorsList(updated);
                                  weddingForm.setValue("allowedColors", JSON.stringify(updated));
                                }}
                                className="ml-1 text-muted-foreground hover:text-destructive"
                                data-testid={`button-remove-color-${idx}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="regalos" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-medium flex items-center"><Gift className="w-4 h-4 mr-2" /> Mesa 1</h4>
                        <FormField
                          control={weddingForm.control}
                          name="giftLabel1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Etiqueta</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="giftUrl1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-medium flex items-center"><Gift className="w-4 h-4 mr-2" /> Mesa 2</h4>
                        <FormField
                          control={weddingForm.control}
                          name="giftLabel2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Etiqueta</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={weddingForm.control}
                          name="giftUrl2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="plantilla" className="space-y-6 pt-4">
                    <FormField
                      control={weddingForm.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Seleccionar Plantilla</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {TEMPLATES.map((t) => (
                                <Card
                                  key={t.id}
                                  className={`p-4 cursor-pointer hover:border-primary transition-colors ${field.value === t.id ? 'border-2 border-primary ring-2 ring-primary/20' : ''}`}
                                  onClick={() => field.onChange(t.id)}
                                  data-testid={`card-template-${t.id}`}
                                >
                                  <div className="text-4xl mb-2 text-center">{t.thumbnail}</div>
                                  <div className="font-semibold text-center">{t.name}</div>
                                  <div className="text-xs text-muted-foreground text-center mt-1">{t.description}</div>
                                </Card>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {weddingForm.watch("template") === "clasico" && (
                      <FormField
                        control={weddingForm.control}
                        name="colorStyleId"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel>Estilo de Color (Solo Clásico)</FormLabel>
                            <FormControl>
                              <div className="flex gap-4 flex-wrap justify-center">
                                {INVITATION_STYLES.map((style) => (
                                  <div
                                    key={style.id}
                                    className={`w-12 h-12 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform ${field.value === style.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                                    style={{ backgroundColor: style.preview.accent }}
                                    onClick={() => field.onChange(style.id)}
                                    title={style.name}
                                    data-testid={`swatch-color-${style.id}`}
                                  />
                                ))}
                              </div>
                            </FormControl>
                            <div className="text-center text-sm font-medium mt-2">
                              {INVITATION_STYLES.find(s => s.id === field.value)?.name}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="musica" className="space-y-6 pt-4">
                    <FormField
                      control={weddingForm.control}
                      name="musicType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Música de fondo</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="music-none" />
                                <Label htmlFor="music-none">Sin música</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mp3" id="music-mp3" />
                                <Label htmlFor="music-mp3">Archivo MP3</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="youtube" id="music-youtube" />
                                <Label htmlFor="music-youtube">YouTube (URL del video)</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {weddingForm.watch("musicType") === "mp3" && (
                      <FormField
                        control={weddingForm.control}
                        name="musicUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Archivo MP3</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                {field.value && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    Actual: {field.value}
                                  </p>
                                )}
                                <Input
                                  type="file"
                                  accept="audio/mpeg,audio/mp3,.mp3"
                                  onChange={(e) => handleFileUpload(e, "musicUrl")}
                                  className="cursor-pointer"
                                  data-testid="input-music-file"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {weddingForm.watch("musicType") === "youtube" && (
                      <FormField
                        control={weddingForm.control}
                        name="musicUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL de YouTube</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-music-youtube"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              La música sonará en bucle. Los invitados podrán silenciarla con el botón flotante.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="video" className="space-y-6 pt-4">
                    <p className="text-sm text-muted-foreground">
                      {weddingForm.watch("template") === "nineties"
                        ? "Configura el video de la intro principal y el video del televisor retro por separado."
                        : weddingForm.watch("template") === "netflix"
                        ? "Configura un video intro. Sin video, se muestra la animación del logo Netflix."
                        : "Configura un video intro. Sin video, se muestran las cortinas de teatro."}
                    </p>
                    <FormField
                      control={weddingForm.control}
                      name="videoType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Tipo de Video Intro</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="video-none" />
                                <Label htmlFor="video-none">Sin video (animación predeterminada)</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="youtube" id="video-youtube" />
                                <Label htmlFor="video-youtube">YouTube</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mp4" id="video-mp4" />
                                <Label htmlFor="video-mp4">MP4 Upload</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {weddingForm.watch("videoType") === "mp4" && (
                      <FormField
                        control={weddingForm.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargar Archivo MP4</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                {field.value && (
                                  <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted">
                                    <Video className="w-6 h-6" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <Input 
                                    type="file" 
                                    accept="video/mp4" 
                                    onChange={(e) => handleFileUpload(e, "videoUrl")}
                                    data-testid="input-video-mp4"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {weddingForm.watch("videoType") === "youtube" && (
                      <FormField
                        control={weddingForm.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://youtube.com/watch?v=..." data-testid="input-video-youtube" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={weddingForm.control}
                      name="introDuration"
                      render={({ field }) => {
                        const isNineties = weddingForm.watch("template") === "nineties";
                        const maxMs = isNineties ? 180000 : 10000;
                        const stepMs = isNineties ? 5000 : 500;
                        const secs = field.value / 1000;
                        const label = secs >= 60 ? `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s` : `${secs.toFixed(1)} segundos`;
                        return (
                        <FormItem className="space-y-4">
                          <div className="flex justify-between items-center">
                            <FormLabel>Duración de la Intro</FormLabel>
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={1000}
                              max={maxMs}
                              step={stepMs}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              data-testid="slider-intro-duration"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            {isNineties
                              ? "Tiempo que dura la intro del televisor (hasta 3 minutos). El invitado puede saltarla tocando la pantalla."
                              : "Tiempo que dura la animación o video de introducción antes de mostrar la invitación."}
                          </p>
                          <FormMessage />
                        </FormItem>
                        );
                      }}
                    />

                    {weddingForm.watch("template") === "nineties" && (
                      <div className="space-y-4 border-t pt-6">
                        <h4 className="text-sm font-semibold">Video del Televisor (plantilla 90s)</h4>
                        <p className="text-xs text-muted-foreground">
                          Elige el video que se reproduce dentro del televisor retro en la intro. Por defecto se muestra un video de YouTube.
                        </p>
                        <FormField
                          control={weddingForm.control}
                          name="tvVideoType"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel>Tipo de Video del TV</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="tv-video-none" />
                                    <Label htmlFor="tv-video-none">Tostadoras voladoras</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="youtube" id="tv-video-youtube" />
                                    <Label htmlFor="tv-video-youtube">YouTube</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="mp4" id="tv-video-mp4" />
                                    <Label htmlFor="tv-video-mp4">MP4 Upload</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {weddingForm.watch("tvVideoType") === "mp4" && (
                          <FormField
                            control={weddingForm.control}
                            name="tvVideoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cargar Archivo MP4 para TV</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-4">
                                    {field.value && (
                                      <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted">
                                        <Video className="w-6 h-6" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        accept="video/mp4"
                                        onChange={(e) => handleFileUpload(e, "tvVideoUrl")}
                                        data-testid="input-tv-video-mp4"
                                      />
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {weddingForm.watch("tvVideoType") === "youtube" && (
                          <FormField
                            control={weddingForm.control}
                            name="tvVideoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>YouTube URL para TV</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="https://youtube.com/watch?v=... o https://youtu.be/..." data-testid="input-tv-video-youtube" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="acceso" className="space-y-6 pt-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800 font-serif">
                        Estas credenciales permiten al cliente acceder a su portal de invitaciones en <strong>/login</strong>. El cliente solo podrá gestionar las invitaciones de esta boda.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={weddingForm.control}
                        name="clientUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario del cliente</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: anaycarlos2026"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-client-username"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">El cliente usará esto para iniciar sesión.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={weddingForm.control}
                        name="clientPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña del cliente</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Boda2026Segura"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-client-password"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Comparte esta contraseña con el cliente.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createWeddingMutation.isPending || updateWeddingMutation.isPending}
                  data-testid="button-submit-wedding"
                >
                  {(createWeddingMutation.isPending || updateWeddingMutation.isPending)
                    ? "Guardando..."
                    : editingWedding ? "Guardar Cambios" : "Crear Boda"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Invitation Edit Dialog */}
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
                  name="weddingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boda</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-wedding">
                            <SelectValue placeholder="Seleccionar boda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weddings.map((wedding) => (
                            <SelectItem key={wedding.id} value={wedding.id}>
                              {wedding.coupleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  <Copy className="w-4 h-4 mr-2" />
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
