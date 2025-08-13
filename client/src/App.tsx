import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Events from "@/pages/events";
import Movies from "@/pages/movies";
import EventDetails from "@/pages/event-details";
import MovieDetails from "@/pages/movie-details";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/events" component={Events} />
          <Route path="/events/:id" component={EventDetails} />
          <Route path="/movies" component={Movies} />
          <Route path="/movies/:id" component={MovieDetails} />
          <Route path="/sports" component={() => <Events />} />
          <Route path="/theater" component={() => <Events />} />
          <Route path="/festival" component={() => <Events />} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/dashboard" component={Dashboard} />
        </>
      )}
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
