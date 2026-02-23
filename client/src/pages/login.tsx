import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { authenticated, isLoading: authLoading } = useClientAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authenticated && !authLoading) {
      setLocation("/client");
    }
  }, [authenticated, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({ title: "Error", description: "Por favor ingresa la contraseña", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/client-login", { password });
      if (response.ok) {
        queryClient.setQueryData(["/api/auth/client-check"], { authenticated: true });
        toast({ title: "Bienvenido", description: "Acceso concedido" });
        setLocation("/client");
      }
    } catch {
      toast({ title: "Error", description: "Contraseña incorrecta. Por favor intenta nuevamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-burgundy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-wedding-cream">
      <Card className="w-full max-w-md border-wedding-gold">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Heart className="w-8 h-8 text-wedding-burgundy fill-wedding-burgundy" data-testid="icon-heart" />
          </div>
          <div>
            <CardTitle className="text-3xl font-sans text-wedding-burgundy">
              Acceso Cliente
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-serif text-wedding-gold">
              Portal de gestión de invitaciones
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium font-serif text-wedding-burgundy">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-password"
                className="font-serif border-wedding-gold"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-submit"
              className="w-full font-serif text-white bg-wedding-burgundy"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
