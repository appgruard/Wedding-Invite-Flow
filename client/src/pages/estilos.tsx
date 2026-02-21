import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { INVITATION_STYLES, type Settings } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Check, LogOut, ArrowLeft, Sparkles } from "lucide-react";

type StyleItem = typeof INVITATION_STYLES[number];

export default function EstilosPage() {
  const { authenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !authenticated) {
      setLocation("/login?returnTo=/estilos");
    }
  }, [authLoading, authenticated, setLocation]);

  const { data: styles, isLoading: stylesLoading } = useQuery<StyleItem[]>({
    queryKey: ["/api/styles"],
    enabled: authenticated,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    enabled: authenticated,
  });

  const changeStyleMutation = useMutation({
    mutationFn: async (styleId: string) => {
      await apiRequest("PATCH", "/api/settings", { activeStyle: styleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Estilo actualizado",
        description: "El estilo de tus invitaciones ha sido cambiado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estilo.",
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
      setLocation("/login");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FDF8F0" }}>
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const isLoading = stylesLoading || settingsLoading;
  const displayStyles = styles ?? [...INVITATION_STYLES];
  const activeStyle = settings?.activeStyle ?? "clasico";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF8F0" }}>
      <header className="border-b" style={{ borderColor: "#C9A96E33" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-row items-center justify-between gap-4 flex-wrap">
          <Link href="/admin" data-testid="link-back-admin">
            <Button variant="ghost" className="gap-2" data-testid="button-back-admin">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al Admin</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesion
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Palette className="w-6 h-6" style={{ color: "#C9A96E" }} />
            <h1
              className="text-3xl md:text-4xl font-serif font-bold"
              style={{ color: "#800020" }}
              data-testid="text-page-title"
            >
              Selector de Estilos
            </h1>
            <Sparkles className="w-5 h-5" style={{ color: "#C9A96E" }} />
          </div>
          <p className="text-lg font-sans" style={{ color: "#5C4033" }} data-testid="text-page-subtitle">
            Elige el diseño de tus invitaciones
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-visible">
                <CardContent className="p-0">
                  <Skeleton className="h-40 w-full rounded-t-md" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStyles.map((style) => {
              const isActive = activeStyle === style.id;
              return (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all duration-200 overflow-visible ${
                    isActive ? "ring-2 shadow-lg" : "hover-elevate"
                  }`}
                  style={
                    isActive
                      ? { borderColor: "#C9A96E", boxShadow: "0 0 0 2px #C9A96E" }
                      : {}
                  }
                  onClick={() => {
                    if (!isActive && !changeStyleMutation.isPending) {
                      changeStyleMutation.mutate(style.id);
                    }
                  }}
                  data-testid={`card-style-${style.id}`}
                >
                  <CardContent className="p-0">
                    <div
                      className="relative rounded-t-md p-6 flex flex-col items-center justify-center"
                      style={{
                        backgroundColor: style.preview.bg,
                        minHeight: "160px",
                      }}
                    >
                      {isActive && (
                        <div
                          className="absolute top-3 right-3 rounded-full p-1"
                          style={{ backgroundColor: "#C9A96E" }}
                          data-testid={`icon-check-${style.id}`}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div
                        className="w-full max-w-[180px] rounded-md p-4 text-center"
                        style={{
                          backgroundColor: style.preview.bg,
                          border: `1px solid ${style.preview.accent}`,
                        }}
                      >
                        <p
                          className="text-xs uppercase tracking-widest mb-1 font-sans"
                          style={{ color: style.preview.accent }}
                        >
                          Boda
                        </p>
                        <p
                          className="text-lg font-serif font-bold leading-tight"
                          style={{ color: style.preview.primary }}
                        >
                          Maria & Juan
                        </p>
                        <div
                          className="w-12 h-[2px] mx-auto my-2"
                          style={{ backgroundColor: style.preview.accent }}
                        />
                        <p
                          className="text-[10px] font-sans"
                          style={{ color: style.preview.text }}
                        >
                          15 de Junio, 2026
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-row items-center justify-between gap-2 mb-2 flex-wrap">
                        <h3
                          className="text-base font-serif font-semibold"
                          style={{ color: "#800020" }}
                          data-testid={`text-style-name-${style.id}`}
                        >
                          {style.name}
                        </h3>
                        {isActive && (
                          <Badge
                            className="text-xs no-default-hover-elevate no-default-active-elevate"
                            style={{
                              backgroundColor: "#C9A96E",
                              color: "#FFFFFF",
                              borderColor: "#C9A96E",
                            }}
                            data-testid={`badge-active-${style.id}`}
                          >
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-sm font-sans leading-relaxed"
                        style={{ color: "#5C4033" }}
                        data-testid={`text-style-desc-${style.id}`}
                      >
                        {style.description}
                      </p>

                      <div className="flex flex-row items-center gap-1.5 mt-3">
                        {Object.entries(style.preview).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-5 h-5 rounded-full border"
                            style={{
                              backgroundColor: color,
                              borderColor: "#00000015",
                            }}
                            title={key}
                            data-testid={`color-${style.id}-${key}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
