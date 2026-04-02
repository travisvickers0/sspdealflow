import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Properties from "@/pages/Properties";
import HowItWorks from "@/pages/HowItWorks";
import PropertyDetail from "@/pages/PropertyDetail";
import Invest from "@/pages/Invest";
import Admin from "@/pages/Admin";
import MetaLanding from "@/pages/MetaLanding";
import Qualify from "@/pages/Qualify";
import ThankYou from "@/pages/ThankYou";
import TrackRecord from "@/pages/TrackRecord";
import ClosedDealDetail from "@/pages/ClosedDealDetail";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/signup" />;
  }

  return <Component />;
}

function AdminRoute() {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return <Admin />;
}

function InvestorIntroRedirect() {
  return <Redirect to="/investors" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/properties">{() => <ProtectedRoute component={Properties} />}</Route>
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/investor-intro" component={InvestorIntroRedirect} />
      <Route path="/investors" component={MetaLanding} />
      <Route path="/qualify" component={Qualify} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/track-record" component={TrackRecord} />
      <Route path="/track-record/:slug" component={ClosedDealDetail} />
      <Route path="/property/:slug" component={PropertyDetail} />
      <Route path="/invest/:propertyId" component={Invest} />
      <Route path="/admin" component={AdminRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
