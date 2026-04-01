import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, TrendingUp, Loader2 } from "lucide-react";
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

  return (
    <Layout transparentNavDark>
      <section className="bg-[#f7f4ef] -mt-[56px] sm:-mt-[64px]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pt-[calc(56px+2rem)] sm:pt-[calc(64px+2.5rem)] lg:pt-[calc(64px+3rem)] pb-16 lg:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <div className="flex flex-col gap-0">

            <div className="inline-flex items-center gap-2 bg-[rgba(232,67,45,0.06)] border border-[rgba(232,67,45,0.18)] rounded-full px-3.5 py-1.5 mb-6 w-fit">
              <span className="w-1.5 h-1.5 bg-[#e8432d] rounded-full animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-[#e8432d]">
                Accredited Investors Only
              </span>
            </div>

            <h1 className="font-bold leading-[.92] tracking-[-0.03em] text-[#0d0c0b] mb-4" style={{ fontSize: "clamp(52px,6vw,76px)" }}>
              Real estate<br />
              <em className="not-italic" style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: "italic", fontWeight: 400, color: "#e8432d", display: "block" }}>
                built for
              </em>
              investors
            </h1>

            <p className="text-[16px] text-[rgba(13,12,11,0.5)] leading-[1.75] max-w-[380px] mb-9">
              Vetted off-market acquisitions across the Southeast. 50/50 profit split at sale. No fees, no pooled capital.
            </p>

            <div className="flex gap-3 items-center mb-10">
              <button
                type="button"
                onClick={() => setLocation("/properties")}
                className="bg-[#0d0c0b] hover:bg-[#e8432d] text-[#f7f4ef] font-semibold text-[14px] px-7 py-3.5 rounded-[12px] flex items-center gap-2 transition-all hover:-translate-y-px"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLocation("/how-it-works")}
                className="bg-white text-[rgba(13,12,11,0.65)] border border-[rgba(13,12,11,0.1)] hover:border-[rgba(13,12,11,0.25)] hover:text-[#0d0c0b] font-medium text-[14px] px-6 py-3.5 rounded-[12px] transition-all hidden sm:block"
              >
                View Structure
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-medium text-[rgba(13,12,11,0.35)]">
                Active across
              </span>
              {["Georgia", "Tennessee", "Florida", "Texas"].map(s => (
                <span key={s} className="bg-white border border-[rgba(13,12,11,0.08)] rounded-full px-3 py-1 text-[11px] font-semibold text-[rgba(13,12,11,0.45)] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[460px] lg:h-[500px]">

            {(() => {
              const heroProperty = sortedProperties.find(p => p.mainPhotoUrl) ?? sortedProperties[0];
              const heroPhoto = heroProperty ? getPropertyImage(heroProperty) : null;
              return (
                <div
                  className="col-span-1 row-span-2 rounded-[20px] overflow-hidden relative cursor-pointer group bg-[#1a2018]"
                  role="button"
                  tabIndex={0}
                  onClick={() => heroProperty && goToProperty(heroProperty)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && heroProperty) {
                      e.preventDefault();
                      goToProperty(heroProperty);
                    }
                  }}
                >
                  {heroPhoto && (
                    <img
                      src={heroPhoto}
                      alt={heroProperty?.address}
                      className="w-full h-full object-cover object-[50%_40%] transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  {!heroPhoto && (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e2a18] to-[#253520]" />
                  )}

                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)" }} />

                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
                    <span className="bg-[#e8432d] text-white text-[8px] font-bold tracking-[0.07em] uppercase px-2.5 py-1 rounded-[5px]">
                      {heroProperty && normalizeStatus(heroProperty.status) === "AVAILABLE" ? "Open · Needs Funding" : "Funded"}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5">
                    <div className="text-[15px] font-semibold text-white mb-0.5">
                      {heroProperty?.address ?? "Property"}
                    </div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.55)] mb-2.5">
                      {heroProperty
                        ? `${heroProperty.city}, ${heroProperty.state} · ${heroProperty.beds}bd · ${heroProperty.baths}ba`
                        : ""}
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
                      <div className="bg-[rgba(0,0,0,0.4)] backdrop-blur-sm px-3 py-2.5">
                        <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(255,255,255,0.4)] mb-1">Purchase Price</div>
                        <div className="font-mono text-[14px] font-medium text-white">
                          {heroProperty ? `$${heroProperty.purchasePrice.toLocaleString()}` : "—"}
                        </div>
                      </div>
                      <div className="bg-[rgba(0,0,0,0.4)] backdrop-blur-sm px-3 py-2.5">
                        <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(255,255,255,0.4)] mb-1">Est. Equity</div>
                        <div className="font-mono text-[14px] font-medium text-[#4ade80]">
                          +{heroProperty ? formatMoney(heroProperty.estimatedEquity ?? 0) : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div>
                <div className="font-mono text-[48px] font-medium text-[#0d0c0b] leading-none tracking-[-0.02em] mb-1.5">119</div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.35)]">Deals Closed</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse flex-shrink-0" />
                <span className="text-[11px] font-semibold text-[#16a34a] tracking-[0.06em] uppercase">Live Platform</span>
              </div>
            </div>

            <div className="bg-[#e8432d] rounded-[20px] p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[rgba(255,255,255,0.08)] rounded-full pointer-events-none" />
              <div>
                <div className="font-mono text-[44px] font-medium text-white leading-none tracking-[-0.02em] mb-1.5">
                  {formatMoney(totalEquity) === "$0" ? "$6.1M" : formatMoney(totalEquity)}
                </div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.55)] mb-2">Total Equity</div>
                <div className="text-[11px] text-[rgba(255,255,255,0.45)] leading-[1.5]">
                  Generated for investors across all closed deals
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {["B", "G", "J", "M"].map((l, i) => (
                    <div key={l} className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.2)] border-2 border-[#e8432d] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ marginLeft: i === 0 ? 0 : -6 }}>
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-[rgba(255,255,255,0.6)]">250+ investors</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="bg-[#f7f4ef] border-t border-[rgba(13,12,11,0.06)] py-5 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 flex items-center gap-8">
          <span className="text-[11px] font-medium text-[rgba(13,12,11,0.3)] flex-shrink-0">
            Active across
          </span>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-10 w-max" style={{ animation: "tape-scroll-h 28s linear infinite" }}>
              {[
                "Georgia", "Tennessee", "Florida", "Texas",
                "Kentucky", "Virginia", "Alabama", "Mississippi",
                "North Carolina", "Arizona",
                "Georgia", "Tennessee", "Florida", "Texas",
                "Kentucky", "Virginia", "Alabama", "Mississippi",
                "North Carolina", "Arizona",
              ].map((state, i) => (
                <span key={i} className="text-[11px] font-semibold text-[rgba(13,12,11,0.25)] uppercase tracking-[0.04em] flex items-center gap-2 whitespace-nowrap">
                  {state}
                  <span className="w-1 h-1 bg-[rgba(13,12,11,0.15)] rounded-full" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="pt-4 pb-20 sm:pt-28 sm:pb-28 bg-[#f7f4ef]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4 lg:mb-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary mb-2 lg:mb-3">Current Opportunities</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0d0c0b] leading-tight">
                Featured{" "}
                <em style={{ fontStyle: "italic", fontFamily: "'Instrument Serif',Georgia,serif", fontWeight: 400 }}>deals</em>
              </h2>
            </div>
            <Link href="/properties" className="text-[13px] font-semibold text-[#0d0c0b] border border-[rgba(13,12,11,0.12)] px-4 py-2 rounded-full flex items-center gap-2 hover:bg-[#0d0c0b] hover:text-white transition-all">
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
                    className="group block bg-white border border-[rgba(13,12,11,0.06)] rounded-[18px] overflow-hidden transition-all hover:-translate-y-[3px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)] hover:border-[rgba(13,12,11,0.12)] cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-[#f0ede8] overflow-hidden">
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
                      <h3 className="text-[16px] font-semibold text-[#0d0c0b] truncate mb-1">{property.address}</h3>
                      <p className="text-[12px] text-[rgba(13,12,11,0.4)] mb-4">
                        {property.city}, {property.state}
                      </p>
                      <div className="grid grid-cols-2 pb-3 mb-3 border-b border-[rgba(13,12,11,0.06)]">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-[rgba(13,12,11,0.35)] mb-1">Purchase Price</div>
                          <div className="font-mono text-[17px] font-medium text-[#0d0c0b]">
                            ${property.purchasePrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wide text-[rgba(13,12,11,0.35)] mb-1">Est. Equity</div>
                          <div className="font-mono text-[17px] font-medium text-[#16a34a]">
                            +${(property.estimatedEquity || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center text-[12px] text-[rgba(13,12,11,0.4)] mb-3">
                        {property.beds} bed · {property.baths} bath · {(property.squareFeet || 0).toLocaleString()} sqft
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(13,12,11,0.06)]">
                        <span className="text-[11px] text-[rgba(13,12,11,0.4)]">Closes {closeDate}</span>
                        {property.bpoValue != null ? (
                          <span className="flex items-center gap-1 text-[11px] text-[#16a34a] font-medium">
                            <TrendingUp className="h-3 w-3" />
                            BPO: ${property.bpoValue.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 w-full bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[13px] py-2.5 rounded-[7px] flex items-center justify-center gap-1.5 pointer-events-none">
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {featuredProperties.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[rgba(13,12,11,0.4)]">
                  No properties available yet. Check back soon!
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--bg-hex)] border-t-4 border-[#e8432d]">
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
