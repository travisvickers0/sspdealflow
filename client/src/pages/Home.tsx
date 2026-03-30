import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { posthog } from "@/lib/posthog";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const normalizeStatus = (s: string) =>
  s === "needs_funding" || s === "committed" ? "AVAILABLE" : s === "funded" || s === "archived" ? "FUNDED" : s;

export default function Home() {
  const { data: properties, isLoading } = useProperties();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const sortedProperties = (properties || [])
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  const openForFunding = sortedProperties.filter((p) => p.status === "needs_funding");
  const otherDeals = sortedProperties.filter((p) => p.status !== "needs_funding");
  const heroStackProperties = [...openForFunding, ...otherDeals].slice(0, 3);
  const needsFundingProperties = openForFunding;

  const getPropertyImage = (property: any) => {
    return property?.mainPhotoUrl || (property?.galleryPhotoUrls?.[0] ?? null);
  };

  const heroIds = new Set(heroStackProperties.map((p: any) => p.id));
  const featuredProperties = needsFundingProperties.filter((p: any) => !heroIds.has(p.id)).slice(0, 3);

  const totalEquity = properties?.reduce((sum, p) => sum + (p.estimatedEquity || 0), 0) || 0;
  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
    return `$${amount}`;
  };

  const handleLeadSubmit = async () => {
    if (!formData.firstName || !formData.email) return;
    setFormError("");
    setFormSubmitting(true);
    try {
      await apiRequest("POST", "/api/leads", formData);
      setFormSuccess(true);
      posthog.capture("lead_submitted", {
        source: "homepage_lead_form",
      });
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "generate_lead", {
          event_category: "engagement",
          event_label: "homepage_lead_form",
        });
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again in a moment.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const goToProperty = (property: any) => {
    if (isAuthenticated) {
      setLocation(`/property/${property.slug || property.id}`);
    } else {
      setLocation("/signin");
    }
  };

  const inputClass =
    "w-full bg-[var(--surface-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[14px] px-4 py-3 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  const tapeProps = sortedProperties.slice(0, 10);
  const mobileTapeProps = sortedProperties.slice(0, 6);

  const row1Items = [
    { t: "119 DEALS", accent: false },
    { t: "$6.1M", accent: true },
    { t: "94 DAYS", accent: false },
    { t: "50/50", accent: true },
    { t: "250+ INVESTORS", accent: false },
    { t: "10+ YEARS", accent: true },
  ];
  const row2Items = [
    { t: "GEORGIA", accent: false },
    { t: "TENNESSEE", accent: true },
    { t: "FLORIDA", accent: false },
    { t: "TEXAS", accent: true },
    { t: "KENTUCKY", accent: false },
    { t: "VIRGINIA", accent: true },
  ];
  const row3Items = [
    { t: "HUD", accent: false },
    { t: "OFF-MARKET", accent: true },
    { t: "JV PARTNER", accent: false },
    { t: "1ST LIEN", accent: true },
    { t: "NO FEES", accent: false },
    { t: "ACCREDITED", accent: true },
  ];

  const renderTickerStrip = (items: { t: string; accent: boolean }[], animClass: string) => (
    <div className={`flex gap-12 flex-shrink-0 ${animClass}`}>
      {[0, 1].map((dup) =>
        items.map((item, idx) => (
          <span
            key={`${dup}-${idx}`}
            className={`font-['Bebas_Neue',sans-serif] text-[58px] sm:text-[58px] lg:text-[clamp(64px,8vw,110px)] leading-none tracking-[0.02em] ${
              item.accent ? "text-[rgba(232,67,45,0.07)]" : "text-[rgba(240,235,227,0.055)]"
            }`}
          >
            {item.t}
          </span>
        )),
      )}
    </div>
  );

  const statusBadgeClass = (open: boolean) =>
    open
      ? "text-[8px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-[3px] flex-shrink-0 bg-[rgba(232,67,45,0.12)] text-[#e8432d] border border-[rgba(232,67,45,0.22)]"
      : "text-[8px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-[3px] flex-shrink-0 bg-[rgba(59,130,246,0.10)] text-[#3b82f6] border border-[rgba(59,130,246,0.2)]";

  return (
    <Layout>
      <div className="relative overflow-hidden bg-[#0a0908] lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            maskImage: `
    radial-gradient(
      ellipse 60% 55% at 50% 50%,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) 10%,
      rgba(0,0,0,0.6) 38%,
      rgba(0,0,0,1) 60%
    ),
    linear-gradient(
      to bottom,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    )
  `,
            WebkitMaskImage: `
    radial-gradient(
      ellipse 60% 55% at 50% 50%,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) 10%,
      rgba(0,0,0,0.6) 38%,
      rgba(0,0,0,1) 60%
    ),
    linear-gradient(
      to bottom,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    )
  `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <div className="flex h-full flex-col justify-between lg:justify-center lg:gap-[clamp(20px,4vh,48px)] lg:items-center lg:py-[8vh]">
            <div className="flex overflow-hidden whitespace-nowrap">
              {renderTickerStrip(row1Items, "animate-[ticker-left_28s_linear_infinite]")}
            </div>
            <div className="flex overflow-hidden whitespace-nowrap">
              {renderTickerStrip(row2Items, "animate-[ticker-right_34s_linear_infinite]")}
            </div>
            <div className="flex overflow-hidden whitespace-nowrap">
              {renderTickerStrip(row3Items, "animate-[ticker-left_44s_linear_infinite]")}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto my-auto hidden max-w-[1200px] grid-cols-[1fr_400px] items-center gap-16 px-6 pb-8 pt-8 sm:px-10 lg:grid lg:px-20 lg:pb-20 lg:pt-14">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-[4px] border border-[#353129] px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#22c55e]">
                Accredited Investors Only
              </span>
            </div>

            <h1 className="font-['Bebas_Neue',sans-serif] text-[clamp(72px,8.5vw,116px)] font-normal leading-[0.92] tracking-[0.025em] text-[#f0ebe3]">
              Real Estate
              <br />
              <span className="text-[#e8432d]">Built for</span>
              <br />
              Investors
            </h1>

            <p className="my-5 max-w-[400px] border-l-2 border-[#2a2724] pl-4 text-[15px] leading-[1.8] text-[#a89e91]">
              Vetted off-market acquisitions. 50/50 profit split at sale. No fees — deal-by-deal JV structure built for accredited investors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
              {[
                "10+ Years Verified Exits",
                "Deal-by-Deal JV Structure",
                "No Fees · 100% Transparent",
                "50/50 Profit Split at Sale",
              ].map((label) => (
                <div key={label} className="flex items-center gap-2 text-[13px] text-[#a89e91]">
                  <span className="grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border border-[rgba(232,67,45,0.25)] bg-[rgba(232,67,45,0.1)]">
                    <CheckIcon className="h-2.5 w-2.5 text-[#e8432d]" />
                  </span>
                  {label}
                </div>
              ))}
            </div>

            <div className="mb-8 grid grid-cols-4 overflow-hidden rounded-[10px] border border-[#2a2724] bg-[#181614]">
              {[
                { v: "119", l: "Deals Closed" },
                { v: "94d", l: "Avg Hold" },
                { v: formatMoney(totalEquity), l: "Total Equity", green: true as const },
                { v: "250+", l: "Active Investors" },
              ].map((s) => (
                <div key={s.l} className="border-r border-[#2a2724] px-4 py-5 last:border-r-0">
                  <div
                    className={`mb-1 font-mono text-[26px] font-medium leading-none tracking-[-0.02em] ${s.green ? "text-[#22c55e]" : "text-[#f0ebe3]"}`}
                  >
                    {s.v}
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.11em] text-[#6b6158]">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mb-5 flex gap-3">
              <button
                type="button"
                onClick={() => setLocation("/properties")}
                className="flex items-center gap-2 rounded-[8px] bg-[#e8432d] px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#d63520] hover:shadow-[0_8px_24px_rgba(232,67,45,0.25)]"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLocation("/how-it-works")}
                className="rounded-[8px] border border-[#353129] bg-transparent px-6 py-3.5 text-[14px] font-medium text-[#a89e91] transition-all hover:border-[#6b6158] hover:text-[#f0ebe3]"
              >
                View Partnership Structure
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#6b6158]">
              <ShieldCheck className="h-3 w-3 flex-shrink-0" />
              Secured by First-Position Lien Structure
            </div>
          </div>

          <div
            className="relative h-[500px] overflow-hidden rounded-[16px] border border-[#2a2724] bg-[#181614]"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-[#181614] via-[#181614]/80 to-transparent px-4 py-3.5">
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#6b6158]">Live Deal Flow</span>
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#22c55e]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                {properties?.length ?? 81} Active
              </div>
            </div>

            <div className="relative h-full pt-11">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#e8432d]" />
                </div>
              ) : (
                <div
                  className="flex flex-col gap-0.5 px-2.5"
                  style={{ animation: "tape-scroll 22s linear infinite" }}
                >
                  {[...tapeProps, ...tapeProps].map((property, idx) => {
                    const open = normalizeStatus(property.status) === "AVAILABLE";
                    const label = open ? "Open" : "Funded";
                    return (
                      <div
                        key={`${property.id}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => goToProperty(property)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToProperty(property);
                          }
                        }}
                        className="mb-0.5 flex cursor-pointer items-center justify-between gap-2.5 rounded-[8px] border border-[#2a2724] bg-[#1e1c19] p-3 transition-all hover:border-[#353129] hover:bg-[#201e1b]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-[#f0ebe3]">{property.address}</div>
                          <div className="mt-0.5 text-[10px] text-[#6b6158]">
                            {property.city}, {property.state}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="whitespace-nowrap font-mono text-[13px] font-medium text-[#22c55e]">
                            {formatMoney(property.estimatedEquity ?? 0)}
                          </span>
                          <span className={statusBadgeClass(open)}>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 block px-5 pb-0 pt-8 lg:hidden">
          <div className="mb-4 inline-flex items-center gap-2 rounded-[4px] border border-[#353129] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#22c55e]">
              Accredited Investors Only
            </span>
          </div>

          <h1 className="font-['Bebas_Neue',sans-serif] text-[72px] font-normal leading-[0.9] tracking-[0.02em] text-[#f0ebe3]">
            Real Estate
            <br />
            <span className="text-[#e8432d]">Built for</span>
            <br />
            Investors
          </h1>

          <p className="hidden sm:block mb-5 mt-3.5 border-l-2 border-[#2a2724] pl-3.5 text-[14px] leading-[1.75] text-[#a89e91]">
            Vetted off-market acquisitions. 50/50 profit split. No fees, no funds.
          </p>

          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
            {[
              "10+ Years Verified Exits",
              "Deal-by-Deal JV Structure",
              "No Fees · 100% Transparent",
              "50/50 Profit Split at Sale",
            ].map((label) => (
              <div key={`m-${label}`} className="flex items-center gap-2 text-[13px] text-[#a89e91]">
                <span className="grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border border-[rgba(232,67,45,0.25)] bg-[rgba(232,67,45,0.1)]">
                  <CheckIcon className="h-2.5 w-2.5 text-[#e8432d]" />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[#2a2724] bg-[#2a2724]">
            {[
              { v: "119", l: "Deals Closed" },
              { v: "94d", l: "Avg Hold" },
              { v: formatMoney(totalEquity), l: "Total Equity", green: true as const },
              { v: "250+", l: "Active Investors" },
            ].map((s) => (
              <div key={s.l} className="bg-[#181614] px-4 py-3.5">
                <div
                  className={`font-mono text-[22px] tracking-[-0.02em] ${s.green ? "text-[#22c55e]" : "text-[#f0ebe3]"}`}
                >
                  {s.v}
                </div>
                <div className="text-[9px] uppercase tracking-[0.1em] text-[#6b6158]">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setLocation("/properties")}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#e8432d] py-4 text-[14px] font-semibold text-white transition-all hover:bg-[#d63520]"
            >
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setLocation("/how-it-works")}
              className="hidden sm:flex w-full items-center justify-center rounded-[8px] border border-[#353129] bg-transparent py-3.5 text-[14px] font-medium text-[#a89e91] transition-all hover:border-[#6b6158] hover:text-[#f0ebe3]"
            >
              View Partnership Structure
            </button>
          </div>

          <div className="hidden sm:flex items-center justify-center gap-1.5 pb-1 text-[11px] text-[#6b6158]">
            <ShieldCheck className="h-3 w-3 flex-shrink-0" />
            Secured by First-Position Lien Structure
          </div>
        </div>

        <div className="mt-0 block overflow-hidden border-t border-[#2a2724] bg-[#0f0e0d] py-3.5 lg:hidden">
          <div className="mb-2.5 flex items-center justify-between px-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6b6158]">Live Deal Flow</span>
            <div className="flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#22c55e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              {properties?.length ?? 81} Active
            </div>
          </div>
          <div
            className="overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-[#e8432d]" />
              </div>
            ) : (
              <div
                className="flex gap-2 px-5"
                style={{ animation: "tape-h 26s linear infinite", width: "max-content" }}
              >
                {[...mobileTapeProps, ...mobileTapeProps].map((property, idx) => {
                  const open = normalizeStatus(property.status) === "AVAILABLE";
                  const label = open ? "Open" : "Funded";
                  return (
                    <div
                      key={`${property.id}-m-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => goToProperty(property)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          goToProperty(property);
                        }
                      }}
                      className="w-[160px] flex-shrink-0 cursor-pointer rounded-[10px] border border-[#2a2724] bg-[#181614] p-2.5 transition-all hover:border-[#353129]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold leading-[1.3] text-[#f0ebe3]">{property.address}</div>
                          <div className="mt-0.5 text-[9px] text-[#6b6158]">
                            {property.city}, {property.state}
                          </div>
                        </div>
                        <span className={statusBadgeClass(open)}>{label}</span>
                      </div>
                      <div className="font-mono text-[13px] font-medium tracking-[-0.01em] text-[#22c55e]">
                        {formatMoney(property.estimatedEquity ?? 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0e0d] to-transparent lg:hidden"
          aria-hidden
        />
      </div>

      <section className="pt-4 pb-20 sm:pt-28 sm:pb-28 bg-[#0f0e0d] lg:bg-[var(--surface-hex)] border-t border-[var(--line)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4 lg:mb-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-2 lg:mb-3">Current Opportunities</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)] leading-tight">Featured Deals</h2>
            </div>
            <Link href="/properties" className="text-[13px] text-primary font-medium hover:gap-3 transition-all flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProperties.map((property) => {
                const img = getPropertyImage(property);
                const closeDate = property.closingDate
                  ? new Date(property.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "TBD";
                return (
                  <div
                    key={property.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToProperty(property)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToProperty(property);
                      }
                    }}
                    className="group block bg-[var(--bg-hex)] border border-[var(--line)] rounded-[18px] overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-2xl hover:border-[var(--line-light)] cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-[var(--surface-2-hex)] overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={property.address}
                          className="w-full h-full object-cover brightness-[0.85] saturate-[0.9] transition-transform group-hover:scale-[1.03]"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : null}
                      {property.status === "needs_funding" ? (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-[4px]">
                          Needs Funding
                        </div>
                      ) : null}
                      <div className="absolute bottom-3 right-3 bg-[rgba(15,14,13,0.82)] backdrop-blur-sm border border-green-900/30 text-green-400 font-mono text-[13px] font-medium px-2.5 py-1 rounded-[7px]">
                        +${((property.estimatedEquity || 0) / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-[16px] font-semibold text-[var(--text-primary)] truncate mb-1">{property.address}</h3>
                      <p className="text-[12px] text-[var(--text-tertiary)] mb-4">
                        {property.city}, {property.state}
                      </p>
                      <div className="grid grid-cols-2 pb-3 mb-3 border-b border-[var(--line)]">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Purchase Price</div>
                          <div className="font-mono text-[17px] font-medium text-[var(--text-primary)]">
                            ${property.purchasePrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Est. Equity</div>
                          <div className="font-mono text-[17px] font-medium text-green-400">
                            +${(property.estimatedEquity || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center text-[12px] text-[var(--text-tertiary)] mb-3">
                        {property.beds} bed · {property.baths} bath · {(property.squareFeet || 0).toLocaleString()} sqft
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
                        <span className="text-[11px] text-[var(--text-tertiary)]">Closes {closeDate}</span>
                        {property.bpoValue != null ? (
                          <span className="flex items-center gap-1 text-[11px] text-green-400 font-medium">
                            <TrendingUp className="h-3 w-3" />
                            BPO: ${property.bpoValue.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[13px] py-2.5 rounded-[7px] flex items-center justify-center gap-1.5 pointer-events-none">
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {featuredProperties.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[var(--text-tertiary)]">
                  No properties available yet. Check back soon!
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--bg-hex)] border-t border-[var(--line)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[var(--line)] rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            <div className="p-12 lg:p-16 flex flex-col justify-center bg-[var(--surface-hex)] border-b lg:border-b-0 lg:border-r border-[var(--line)]">
              <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-primary mb-4">Get Early Access</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-5">
                New Deals Drop
                <br />
                <em className="italic text-primary">Every Week</em>
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-[1.8] mb-8 max-w-sm">
                Our best opportunities fund within days. Leave your info and we&apos;ll reach out directly — no spam, no mass emails, just a
                real conversation.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "No fees. No commitment to apply.",
                  "119 deals closed. 10+ year track record.",
                  "For accredited investors only.",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 grid place-items-center flex-shrink-0">
                      <CheckIcon className="w-2.5 h-2.5 text-primary" />
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-12 lg:p-16 flex flex-col justify-center bg-[var(--surface-2-hex)]">
              {!formSuccess ? (
                <>
                  <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">Get on the deal list</h3>
                  <p className="text-[13px] text-[var(--text-tertiary)] mb-7">Takes 30 seconds. We&apos;ll reach out within 1 business day.</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      className={inputClass}
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormError("");
                        setFormData((d) => ({ ...d, firstName: e.target.value }));
                      }}
                    />
                    <input
                      className={inputClass}
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormError("");
                        setFormData((d) => ({ ...d, lastName: e.target.value }));
                      }}
                    />
                  </div>
                  <input
                    type="email"
                    className={`${inputClass} mb-3`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormError("");
                      setFormData((d) => ({ ...d, email: e.target.value }));
                    }}
                  />
                  <input
                    type="tel"
                    className={`${inputClass} mb-6`}
                    placeholder="(404) 555-0123"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormError("");
                      setFormData((d) => ({ ...d, phone: e.target.value }));
                    }}
                  />
                  {formError ? (
                    <p className="text-[13px] text-destructive mb-3" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={formSubmitting}
                    onClick={handleLeadSubmit}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[14px] py-3.5 rounded-[8px] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Schedule a Call
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-[var(--text-tertiary)] text-center mt-3 leading-relaxed">
                    By submitting you agree to be contacted by SSP Deal Flow.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full grid place-items-center mx-auto mb-5">
                    <CheckIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-serif text-[26px] text-[var(--text-primary)] mb-2">You&apos;re on the list.</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.8] mb-6 max-w-xs mx-auto">
                    We&apos;ll be in touch within one business day. In the meantime, book a quick intro call — most investors go from curious to
                    committed after one conversation.
                  </p>
                  <a
                    href="https://calendly.com/sspdealflow/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-[8px] font-semibold text-[14px] transition-all"
                  >
                    Book an Intro Call
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--surface-hex)] border-t border-[var(--line)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative border border-[var(--line)] rounded-[20px] overflow-hidden p-10 sm:p-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] bg-primary/8 rounded-full filter blur-[80px] pointer-events-none" />
            <div className="relative text-center lg:text-left">
              <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-primary mb-4">Ready to invest?</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] mb-4 tracking-tight">Start Investing Today</h2>
              <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] max-w-md mx-auto lg:mx-0">
                Join our community of accredited investors and access exclusive real estate opportunities.
              </p>
            </div>
            <div className="relative flex flex-col items-center lg:items-end gap-3">
              <Link
                href="/properties"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-xl text-[15px] inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(232,67,45,0.2)] hover:shadow-[0_12px_32px_rgba(232,67,45,0.3)] hover:-translate-y-0.5 transition-all"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-[var(--text-tertiary)]">No fees. No funds. Deal-by-deal JV only.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
