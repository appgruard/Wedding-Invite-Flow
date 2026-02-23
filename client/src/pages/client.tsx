import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import type { Invitation, Wedding } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Heart, Copy, Users, LogOut, UserPlus, Calendar, MapPin } from "lucide-react";

const createInvitationSchema = z.object({
  guestName: z.string().min(1, "El nombre es requerido"),
  seats: z.coerce.number().min(1).max(10).default(2),
  weddingId: z.string().min(1, "Selecciona una boda"),
});
type CreateInvitationForm = z.infer<typeof createInvitationSchema>;

function statusBadge(status: string) {
  if (status === "confirmed") return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
  if (status === "declined") return <Badge className="bg-red-100 text-red-800">Declinado</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
}

export default function ClientPage() {
  const [, setLocation] = useLocation();
  const { authenticated, isLoading: authLoading } = useClientAuth();
  const { toast } = useToast();
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !authenticated) {
      setLocation("/login");
    }
  }, [authenticated, authLoading, setLocation]);

  const { data: weddings = [], isLoading: weddingsLoading } = useQuery<Wedding[]>({
    queryKey: ["/api/weddings"],
    enabled: authenticated,
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/invitations/wedding", selectedWeddingId],
    queryFn: async () => {
      const res = await fetch(`/api/invitations/wedding/${selectedWeddingId}`);
      if (!res.ok) throw new Error("Error al cargar invitaciones");
      return res.json();
    },
    enabled: !!selectedWeddingId && authenticated,
  });

  const form = useForm<CreateInvitationForm>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { guestName: "", seats: 2, weddingId: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInvitationForm) =>
      apiRequest("POST", "/api/invitations", data).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/wedding", selectedWeddingId] });
      form.reset({ guestName: "", seats: 2, weddingId: selectedWeddingId });
      toast({ title: "Invitación creada", description: "La invitación fue creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear la invitación", variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    queryClient.setQueryData(["/api/auth/client-check"], { authenticated: false });
    setLocation("/login");
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/invitation?id=${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Enlace copiado", description: "El enlace de invitación fue copiado" });
  };

  const selectedWedding = weddings.find((w) => w.id === selectedWeddingId);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-burgundy" />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-wedding-cream p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-wedding-burgundy fill-wedding-burgundy" />
            <div>
              <h1 className="text-2xl font-sans font-bold text-wedding-burgundy">Portal de Invitaciones</h1>
              <p className="text-sm text-wedding-gold font-serif">Gestión de invitados</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-wedding-gold text-wedding-burgundy gap-2">
            <LogOut className="w-4 h-4" /> Salir
          </Button>
        </div>

        {/* Wedding selector */}
        <Card className="border-wedding-gold">
          <CardHeader>
            <CardTitle className="text-lg text-wedding-burgundy font-sans">Seleccionar Boda</CardTitle>
            <CardDescription className="font-serif">Elige la boda para gestionar sus invitaciones</CardDescription>
          </CardHeader>
          <CardContent>
            {weddingsLoading ? (
              <div className="text-muted-foreground text-sm">Cargando bodas...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weddings.map((w) => (
                  <button
                    key={w.id}
                    data-testid={`card-wedding-${w.id}`}
                    onClick={() => {
                      setSelectedWeddingId(w.id);
                      form.setValue("weddingId", w.id);
                    }}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedWeddingId === w.id
                        ? "border-wedding-burgundy bg-wedding-burgundy/5"
                        : "border-wedding-gold/40 hover:border-wedding-gold"
                    }`}
                  >
                    <p className="font-sans font-semibold text-wedding-burgundy">{w.coupleName}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{w.weddingDate}</span>
                    </div>
                    {w.venueName && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{w.venueName}</span>
                      </div>
                    )}
                  </button>
                ))}
                {weddings.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">No hay bodas registradas aún.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedWedding && (
          <>
            {/* Create invitation */}
            <Card className="border-wedding-gold">
              <CardHeader>
                <CardTitle className="text-lg text-wedding-burgundy font-sans flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Nueva Invitación
                </CardTitle>
                <CardDescription className="font-serif">
                  Para: <strong>{selectedWedding.coupleName}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                    className="flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="font-serif text-wedding-burgundy">Nombre del invitado</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Familia García"
                              {...field}
                              data-testid="input-guest-name"
                              className="border-wedding-gold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormLabel className="font-serif text-wedding-burgundy">Lugares</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              {...field}
                              data-testid="input-seats"
                              className="border-wedding-gold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-create-invitation"
                      className="bg-wedding-burgundy text-white font-serif"
                    >
                      {createMutation.isPending ? "Creando..." : "Crear"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Invitations list */}
            <Card className="border-wedding-gold">
              <CardHeader>
                <CardTitle className="text-lg text-wedding-burgundy font-sans flex items-center gap-2">
                  <Users className="w-5 h-5" /> Invitados ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invitationsLoading ? (
                  <div className="text-sm text-muted-foreground">Cargando invitados...</div>
                ) : invitations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay invitaciones para esta boda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invitado</TableHead>
                        <TableHead className="text-center">Lugares</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Enlace</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((inv) => (
                        <TableRow key={inv.id} data-testid={`row-invitation-${inv.id}`}>
                          <TableCell className="font-medium">{inv.guestName}</TableCell>
                          <TableCell className="text-center">{inv.seats}</TableCell>
                          <TableCell className="text-center">{statusBadge(inv.status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyLink(inv.id)}
                              data-testid={`button-copy-${inv.id}`}
                              className="gap-1 text-wedding-burgundy"
                            >
                              <Copy className="w-3 h-3" /> Copiar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
