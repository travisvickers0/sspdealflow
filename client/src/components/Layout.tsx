import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutGrid, ShieldCheck, Home, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground overflow-x-hidden">
      {/* Header with dark gray background */}
      <header className="sticky top-0 z-50 w-full bg-[#2C2C2C] pt-[env(safe-area-inset-top)]">
        <nav className="px-8 py-4 flex items-center justify-between">
          <div className="logo text-white font-bold text-2xl">SSP</div>
          <div className="nav-links hidden md:flex items-center gap-6 text-white text-base font-normal">
            <Link href="/properties" className="hover:opacity-80 transition-opacity">
              Marketplace
            </Link>
            <Link href="/how-it-works" className="hover:opacity-80 transition-opacity">
              How It Works
            </Link>
          </div>
          <div className="user-actions flex items-center gap-4 text-white text-sm font-normal">
            {!isLoading && (
              isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="hidden sm:block hover:opacity-80 transition-opacity">
                      Admin
                    </Link>
                  )}
                  <a href="/api/logout" className="hidden sm:block hover:opacity-80 transition-opacity cursor-pointer">
                    Log out
                  </a>
                </>
              ) : (
                <div className="hidden sm:flex gap-2">
                  <a href="/signin" className="hover:opacity-80 transition-opacity">
                    Sign in
                  </a>
                  <a href="/signup" className="hover:opacity-80 transition-opacity">
                    Sign up
                  </a>
                </div>
              )
            )}
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9 text-white hover:bg-white/10 cursor-pointer active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-[#2C2C2C] animate-in slide-in-from-top-2 duration-200">
            <nav className="px-4 py-4 flex flex-col gap-2">
              <Link 
                href="/properties" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-sm font-normal py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
              >
                Marketplace
              </Link>
              <Link 
                href="/how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-sm font-normal py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
              >
                How It Works
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-sm font-normal py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Admin
                </Link>
              )}
              <div className="border-t border-white/20 my-2" />
              {isAuthenticated ? (
                <a href="/api/logout" className="w-full">
                  <Button variant="outline" className="w-full justify-center cursor-pointer active:scale-95 gap-2 text-white border-white/20 hover:bg-white/10">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </a>
              ) : (
                <div className="flex gap-2 w-full">
                  <a href="/signin" className="flex-1">
                    <Button className="w-full justify-center cursor-pointer active:scale-95">
                      Sign in
                    </Button>
                  </a>
                  <a href="/signup" className="flex-1">
                    <Button className="w-full justify-center cursor-pointer active:scale-95 bg-white/90 hover:bg-white text-primary border-2 border-primary">
                      Sign up
                    </Button>
                  </a>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
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
          <div className="border-t pt-6">
            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto mb-3">
              SSP Deal Flow facilitates private, deal-by-deal joint venture partnerships. This is not a fund, syndication, or pooled investment vehicle.
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
              Securities offered through [broker-dealer if applicable]. Not a solicitation. Accredited investors only. Past performance does not guarantee future results. Investments involve risk of loss.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
