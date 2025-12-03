import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutGrid, ShieldCheck, Home, LogOut } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>SSP Deal Flow</span>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Log in
            </Button>
            <Button size="sm" className="rounded-full px-6 font-semibold shadow-sm">
              Sign up
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
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
