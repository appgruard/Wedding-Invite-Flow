import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { authenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get("returnTo") || "/admin";

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated && !authLoading) {
      setLocation(returnTo);
    }
  }, [authenticated, authLoading, returnTo, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "Error",
        description: "Por favor ingresa la contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { password });
      const data = await response.json();

      if (response.ok) {
        // Cache the authenticated state
        queryClient.setQueryData(["/api/auth/check"], { authenticated: true });
        toast({
          title: "Éxito",
          description: "Bienvenido al panel de administración",
        });
        setLocation(returnTo);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Contraseña incorrecta. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-burgundy mx-auto mb-4"></div>
        </div>
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
              Acceso Administrador
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-serif text-wedding-gold">
              Boda Ana Maria & Carlos Eduardo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium font-serif text-wedding-burgundy"
              >
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
