import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import InvitationPage from "@/pages/invitation";
import AdminPage from "@/pages/admin";
import ConfirmPage from "@/pages/confirm";
import LoginPage from "@/pages/login";
import EstilosPage from "@/pages/estilos";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InvitationPage} />
      <Route path="/invitation" component={InvitationPage} />
      <Route path="/confirm" component={ConfirmPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/estilos" component={EstilosPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
