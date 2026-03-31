import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { posthog } from "@/lib/posthog";

function LogoMark() {
  return (
    <div className="flex items-center no-underline">
      <img src="/ssp-logo.png" alt="SSP" className="h-8" />
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  transparentNav?: boolean;
}

export function Layout({ children, transparentNav = false }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });

    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_title: document.title,
      });
    }
  }, [location]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      posthog.identify(user.id, {
        email: user.email ?? undefined,
        name: user.firstName
          ? `${user.firstName} ${user.lastName ?? ""}`.trim()
          : undefined,
        is_admin: isAdmin,
      });
    }
    if (!isLoading && !isAuthenticated) {
      posthog.reset();
    }
  }, [isLoading, isAuthenticated, user, isAdmin]);

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active
        ? "text-[var(--text-primary)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  const mobileNavLinkClass = (active: boolean) =>
    `text-sm font-medium py-3 px-4 rounded-lg transition-colors ${navLinkClass(active)}`;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground overflow-x-hidden">
      <header
        className={`sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[rgba(15,14,13,0.92)] backdrop-blur-[16px] pt-[env(safe-area-inset-top)] ${transparentNav ? "nav-transparent" : ""}`}
      >
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/">
              <LogoMark />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className={navLinkClass(location === "/properties")}>
                Marketplace
              </Link>
              <Link href="/how-it-works" className={navLinkClass(location === "/how-it-works")}>
                How It Works
              </Link>
              {isAdmin && (
                <Link href="/admin" className={navLinkClass(location.startsWith("/admin"))}>
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && (
              isAuthenticated ? (
                <>
                  {user?.profileImageUrl && (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover hidden sm:block"
                    />
                  )}
                  <a href="/api/logout">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex cursor-pointer gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </a>
                </>
              ) : (
                <div className="hidden sm:flex gap-2 sm:gap-3">
                  <a href="/signin">
                    <Button
                      size="sm"
                      className="h-9 rounded-full px-5 border border-[var(--line-light)] bg-transparent text-[var(--text-secondary)] text-[13px] font-medium hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      Sign in
                    </Button>
                  </a>
                  <a href="/signup">
                    <Button
                      size="sm"
                      className="h-9 rounded-full px-5 bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
                    >
                      Sign up
                    </Button>
                  </a>
                </div>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 cursor-pointer active:scale-95 text-[var(--text-secondary)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--line)] bg-[rgba(15,14,13,0.96)] backdrop-blur-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/properties")}
              >
                Marketplace
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/how-it-works")}
              >
                How It Works
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass(location.startsWith("/admin"))}
                >
                  Admin
                </Link>
              )}
              <div className="border-t border-[var(--line)] my-2" />
              {isAuthenticated ? (
                <a href="/api/logout" className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-center cursor-pointer active:scale-95 gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </a>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <a href="/signin" className="w-full">
                    <Button className="w-full justify-center cursor-pointer active:scale-95 h-9 rounded-full px-5 border border-[var(--line-light)] bg-transparent text-[var(--text-secondary)] text-[13px] font-medium hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all">
                      Sign in
                    </Button>
                  </a>
                  <a href="/signup" className="w-full">
                    <Button className="w-full justify-center cursor-pointer active:scale-95 h-9 rounded-full px-5 bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-all">
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
      <footer className="border-t border-[var(--line)] py-12 bg-[var(--bg-hex)]">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="mb-2">
              <LogoMark />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.1em] font-semibold mb-4">
              A Division of Southern Specialty Properties
            </p>
            <p className="text-sm text-[var(--text-tertiary)] max-w-xs mb-4">
              Premium real estate investment opportunities for accredited investors.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              © 2026 Southern Specialty Properties. All Rights Reserved.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-[var(--text-primary)]">Platform</span>
              <Link href="/properties" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                Browse Properties
              </Link>
              <Link href="/how-it-works" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                How it Works
              </Link>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-[var(--text-primary)]">Company</span>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                About Us
              </a>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                Contact
              </a>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-[var(--line)] text-center">
          <p className="text-sm text-[var(--text-tertiary)] font-medium italic">
            Deal-by-deal joint venture partnerships. Not a Fund. No pooled capital
          </p>
        </div>
      </footer>
    </div>
  );
}
