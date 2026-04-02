import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { posthog } from "@/lib/posthog";

function NavLogo({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? "#0d0c0b" : "#f0ebe3";
  return (
    <span className="flex items-center gap-0 flex-shrink-0">
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "28px",
        fontWeight: "400",
        color: "#e8432d",
        lineHeight: "1",
        letterSpacing: "-0.02em",
        marginRight: "-2px",
        transition: "color 0.3s",
      }}>[</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "22px",
        fontWeight: "400",
        color: textColor,
        lineHeight: "1",
        letterSpacing: "0.08em",
        padding: "0 3px",
        transition: "color 0.3s",
      }}>SSP DEAL FLOW</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "28px",
        fontWeight: "400",
        color: "#e8432d",
        lineHeight: "1",
        letterSpacing: "-0.02em",
        marginLeft: "-2px",
        transition: "color 0.3s",
      }}>]</span>
    </span>
  );
}

function FooterLogo() {
  return (
    <span className="flex items-center gap-0 flex-shrink-0">
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "22px",
        fontWeight: "400",
        color: "#e8432d",
        lineHeight: "1",
        letterSpacing: "-0.02em",
        marginRight: "-2px",
      }}>[</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "17px",
        fontWeight: "400",
        color: "#f0ebe3",
        lineHeight: "1",
        letterSpacing: "0.08em",
        padding: "0 3px",
      }}>SSP DEAL FLOW</span>
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "22px",
        fontWeight: "400",
        color: "#e8432d",
        lineHeight: "1",
        letterSpacing: "-0.02em",
        marginLeft: "-2px",
      }}>]</span>
    </span>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  transparentNav?: boolean;
  transparentNavDark?: boolean;
  creamShell?: boolean;
}

export function Layout({ children, transparentNav = false, transparentNavDark = false, creamShell = false }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
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

  useEffect(() => {
    if (!transparentNav && !transparentNavDark) {
      setNavScrolled(false);
      return;
    }
    const onScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      setNavScrolled(false);
    };
  }, [transparentNav, transparentNavDark]);

  const isDarkText = transparentNavDark && !navScrolled;
  const usesCreamChrome = isDarkText || (creamShell && (!transparentNav || navScrolled));

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center text-[14px] font-medium transition-colors ${
      usesCreamChrome
        ? (active ? "text-[#0d0c0b]" : "text-[rgba(13,12,11,0.5)] hover:text-[#0d0c0b]")
        : (active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
    }`;

  const mobileNavLinkClass = (active: boolean) =>
    `text-sm font-medium py-3 px-4 rounded-full transition-all ${
      active
        ? "bg-[#e8432d] text-white shadow-[0_8px_24px_rgba(232,67,45,0.22)]"
        : usesCreamChrome
          ? "text-[rgba(13,12,11,0.5)] hover:text-[#0d0c0b]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-x-hidden ${
        creamShell ? "bg-[var(--cream-base)] text-[var(--cream-ink)]" : "bg-background text-foreground"
      }`}
    >
      <header
        className={`sticky top-0 z-50 w-full pt-[env(safe-area-inset-top)] ${
          (transparentNav || transparentNavDark) && !navScrolled
            ? transparentNavDark
              ? "border-b border-transparent bg-[var(--cream-base)]"
              : "border-b border-transparent bg-transparent"
            : creamShell
              ? "border-b border-[var(--cream-border)] bg-[rgba(247,244,239,0.92)] backdrop-blur-[16px]"
            : "border-b border-[var(--line)] bg-[rgba(15,14,13,0.92)] backdrop-blur-[16px]"
        }`}
        style={{ transition: "background 0.5s, border-color 0.5s, backdrop-filter 0.5s" }}
      >
        <div className="container mx-auto relative flex h-14 sm:h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-0 flex-shrink-0">
              <NavLogo dark={isDarkText} />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            <Link href="/properties" className={navLinkClass(location === "/properties")}>
              Marketplace
            </Link>
            <Link href="/track-record" className={navLinkClass(location === "/track-record")}>
              Track Record
            </Link>
            <Link href="/how-it-works" className={navLinkClass(location === "/how-it-works")}>
              How It Works
            </Link>
            <Link href="/contact" className={navLinkClass(location === "/contact")}>
              Contact
            </Link>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 ml-auto">
            {!isLoading && (
              isAuthenticated ? (
                <a href="/api/logout">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`hidden sm:flex cursor-pointer gap-2 transition-colors ${usesCreamChrome ? "text-[rgba(13,12,11,0.6)] hover:text-[#0d0c0b]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </a>
              ) : (
                <div className="hidden sm:flex gap-2 sm:gap-3">
                  <a href="/signin">
                    <Button
                      size="sm"
                      className={`h-9 rounded-full px-5 bg-transparent text-[13px] font-medium transition-all cursor-pointer ${usesCreamChrome ? "border border-[rgba(13,12,11,0.15)] text-[rgba(13,12,11,0.6)] hover:text-[#0d0c0b] hover:border-[rgba(13,12,11,0.3)]" : "border border-[var(--line-light)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"}`}
                    >
                      Sign in
                    </Button>
                  </a>
                  <a href="/signup">
                    <Button
                      size="sm"
                      className={`h-9 rounded-full px-5 text-[13px] font-semibold transition-all cursor-pointer active:scale-95 ${usesCreamChrome ? "bg-[#0d0c0b] text-[var(--cream-base)] hover:bg-[#e8432d]" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                    >
                      Get started
                    </Button>
                  </a>
                </div>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden h-9 w-9 cursor-pointer active:scale-95 ${usesCreamChrome ? "text-[#0d0c0b]" : "text-[var(--text-secondary)]"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className={`md:hidden backdrop-blur-lg animate-in slide-in-from-top-2 duration-200 ${
              usesCreamChrome
                ? "border-t border-[var(--cream-border)] bg-[rgba(247,244,239,0.98)]"
                : "border-t border-[var(--line)] bg-[rgba(15,14,13,0.96)]"
            }`}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/properties")}
              >
                Marketplace
              </Link>
              <Link
                href="/track-record"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/track-record")}
              >
                Track Record
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/how-it-works")}
              >
                How It Works
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass(location === "/contact")}
              >
                Contact
              </Link>
              <div className={`my-2 ${usesCreamChrome ? "border-t border-[var(--cream-border)]" : "border-t border-[var(--line)]"}`} />
              {isAuthenticated ? (
                <a href="/api/logout" className="w-full">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center cursor-pointer active:scale-95 gap-2 ${
                      usesCreamChrome
                        ? "text-[rgba(13,12,11,0.6)] hover:text-[#0d0c0b]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </a>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <a href="/signin" className="w-full">
                    <Button
                      className={`w-full justify-center cursor-pointer active:scale-95 h-9 rounded-full px-5 bg-transparent text-[13px] font-medium transition-all ${
                        usesCreamChrome
                          ? "border border-[rgba(13,12,11,0.15)] text-[rgba(13,12,11,0.6)] hover:border-[rgba(13,12,11,0.3)] hover:text-[#0d0c0b]"
                          : "border border-[var(--line-light)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Sign in
                    </Button>
                  </a>
                  <a href="/signup" className="w-full">
                    <Button
                      className={`w-full justify-center cursor-pointer active:scale-95 h-9 rounded-full px-5 text-[13px] font-semibold transition-all ${
                        usesCreamChrome ? "bg-[#0d0c0b] text-[var(--cream-base)] hover:bg-[#e8432d]" : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      Get started
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
              <FooterLogo />
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
