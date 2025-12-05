import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutGrid, ShieldCheck, Home, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground overflow-x-hidden">
      {/* Header with iOS safe area for notch/Dynamic Island */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="hidden xs:inline">SSP Deal Flow</span>
              <span className="xs:hidden">SSP</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/properties" ? "text-foreground" : "text-muted-foreground"}`}>
                Marketplace
              </Link>
              <Link href="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith("/admin") ? "text-foreground" : "text-muted-foreground"}`}>
                Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex cursor-pointer">
              Log in
            </Button>
            <Button size="sm" className="rounded-full px-4 sm:px-6 font-semibold shadow-sm cursor-pointer active:scale-95 transition-transform">
              Sign up
            </Button>
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9 cursor-pointer active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link 
                href="/properties" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium py-3 px-4 rounded-lg transition-colors active:scale-98 ${location === "/properties" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                Marketplace
              </Link>
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium py-3 px-4 rounded-lg transition-colors active:scale-98 ${location.startsWith("/admin") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                Admin
              </Link>
              <div className="border-t my-2" />
              <Button variant="outline" className="w-full justify-center cursor-pointer active:scale-95">
                Log in
              </Button>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>SSP Deal Flow</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium real estate investment opportunities for accredited investors.
            </p>
          </div>
          <div className="flex gap-12 text-sm text-muted-foreground">
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-foreground">Platform</span>
              <a href="#" className="hover:text-primary">Browse Properties</a>
              <a href="#" className="hover:text-primary">How it Works</a>
              <a href="#" className="hover:text-primary">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-foreground">Company</span>
              <a href="#" className="hover:text-primary">About Us</a>
              <a href="#" className="hover:text-primary">Contact</a>
              <a href="#" className="hover:text-primary">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
