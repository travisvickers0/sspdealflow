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

  const statusBadgeClass = (open: boolean) =>
    open
      ? "text-[8px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-[3px] flex-shrink-0 bg-[rgba(232,67,45,0.12)] text-[#e8432d] border border-[rgba(232,67,45,0.22)]"
      : "text-[8px] font-bold tracking-[0.07em] uppercase px-1.5 py-0.5 rounded-[3px] flex-shrink-0 bg-[rgba(59,130,246,0.10)] text-[#3b82f6] border border-[rgba(59,130,246,0.2)]";

  return (
    <Layout transparentNav>
      <div className="relative min-h-screen overflow-hidden flex flex-col justify-end bg-[#0a0908]">

        <div className="absolute inset-0 z-0">
          {(() => {
            const heroPhoto = sortedProperties.find(p => p.mainPhotoUrl)?.mainPhotoUrl ?? null;
            return heroPhoto ? (
              <img
                src={heroPhoto}
                alt="Featured property"
                className="w-full h-full object-cover object-[50%_40%]"
                style={{ animation: "ken-burns 16s ease-out forwards" }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a2018] via-[#151210] to-[#0a0908]" />
            );
          })()}
        </div>

        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: `
              linear-gradient(to right,
                rgba(8,7,6,0.95) 0%,
                rgba(8,7,6,0.88) 30%,
                rgba(8,7,6,0.55) 58%,
                rgba(8,7,6,0.12) 100%
              ),
              linear-gradient(to top,
                rgba(8,7,6,1.0) 0%,
                rgba(8,7,6,0.7) 14%,
                transparent 40%
              ),
              linear-gradient(to bottom,
                rgba(8,7,6,0.55) 0%,
                transparent 22%
              )
            `
          }}
        />

        <div
          className="hidden lg:flex flex-col gap-2 absolute right-14 top-1/2 -translate-y-1/2 z-10 w-[300px]"
          style={{ animation: "fade-up 0.9s ease 0.2s both" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] font-medium tracking-[0.14em] uppercase text-[#6b6158]">
              Live Deal Flow
            </span>
            <div className="flex items-center gap-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#22c55e]">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              {properties?.length ?? 0} Active
            </div>
          </div>

          {sortedProperties.slice(0, 6).map((property) => {
            const open = normalizeStatus(property.status) === "AVAILABLE";
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
                className="flex items-center justify-between gap-2.5 bg-[rgba(24,22,20,0.82)] backdrop-blur-md border border-[#2a2724] rounded-[10px] px-3.5 py-2.5 cursor-pointer hover:border-[#353129] hover:bg-[rgba(30,28,25,0.9)] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[#f0ebe3] truncate">
                    {property.address}
                  </div>
                  <div className="text-[10px] text-[#6b6158] mt-0.5">
                    {property.city}, {property.state}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-[13px] font-medium text-[#22c55e]">
                    {formatMoney(property.estimatedEquity ?? 0)}
                  </span>
                  <span className={statusBadgeClass(open)}>
                    {open ? "Open" : "Funded"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-10 lg:px-14 pb-[100px] lg:pb-[110px] pt-28"
          style={{ animation: "fade-up 0.8s ease both" }}
        >
          <div className="max-w-[580px]">

            <div className="inline-flex items-center gap-2 border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] rounded-[4px] px-3 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-[#22c55e]">
                Accredited Investors Only
              </span>
            </div>

            <h1
              className="font-['Bebas_Neue',sans-serif] text-[clamp(64px,8vw,108px)] leading-[0.9] tracking-[0.02em] text-[#f0ebe3] mb-5"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.4)" }}
            >
              Real Estate<br />
              <span className="text-[#e8432d]">Built for</span><br />
              Investors
            </h1>

            <p className="text-[15px] text-[rgba(240,235,227,0.72)] leading-[1.75] max-w-[440px] mb-7 border-l-2 border-[rgba(232,67,45,0.4)] pl-3.5">
              Vetted off-market acquisitions. 50/50 profit split at sale. No fees — deal-by-deal JV structure built for accredited investors.
            </p>

            <div className="flex gap-3 items-center mb-6">
              <button
                type="button"
                onClick={() => setLocation("/properties")}
                className="bg-[#e8432d] hover:bg-[#d63520] text-white font-semibold text-[14px] px-7 py-3.5 rounded-[8px] flex items-center gap-2 transition-all hover:-translate-y-px shadow-[0_8px_24px_rgba(232,67,45,0.3)] hover:shadow-[0_12px_32px_rgba(232,67,45,0.4)]"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLocation("/how-it-works")}
                className="bg-[rgba(240,235,227,0.06)] backdrop-blur-sm text-[#f0ebe3] font-medium text-[14px] px-6 py-3.5 rounded-[8px] border border-[rgba(240,235,227,0.2)] hover:bg-[rgba(240,235,227,0.12)] hover:border-[rgba(240,235,227,0.4)] transition-all hidden sm:flex"
              >
                View Partnership Structure
              </button>
            </div>

            <div className="items-center gap-2 text-[11px] text-[#6b6158] hidden sm:flex">
              <ShieldCheck className="h-3 w-3 flex-shrink-0" />
              Secured by First-Position Lien Structure
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 bg-[rgba(8,7,6,0.88)] backdrop-blur-2xl border-t border-[#2a2724]">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-3 lg:grid-cols-5">
              {[
                { v: "119", l: "Deals Closed", g: false },
                { v: "94d", l: "Avg Hold Time", g: false },
                { v: formatMoney(totalEquity), l: "Total Equity", g: true },
                { v: "250+", l: "Active Investors", g: false },
                { v: "50/50", l: "Profit Split", g: false },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={`py-4 lg:py-5 border-r border-[#2a2724] last:border-r-0 ${i === 0 ? "pl-0 pr-6 lg:pr-8" : "px-6 lg:px-8"} ${i >= 3 ? "hidden lg:block" : ""}`}
                >
                  <div className={`font-mono text-[22px] lg:text-[26px] font-medium leading-none tracking-[-0.02em] mb-1 ${s.g ? "text-[#22c55e]" : "text-[#f0ebe3]"}`}>
                    {s.v}
                  </div>
                  <div className="text-[9px] font-semibold tracking-[0.11em] uppercase text-[#6b6158]">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
