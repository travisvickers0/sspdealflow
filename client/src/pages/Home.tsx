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
  const activeStates = ["Georgia", "Tennessee", "Florida", "Texas", "Kentucky", "Virginia", "Alabama", "Mississippi", "North Carolina", "Arizona"];
  const tickerStates = Array.from({ length: 4 }, () => activeStates).flat();

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
      <section className="bg-[var(--cream-base)]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pt-10 pb-0 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-0">
            <div className="inline-flex items-center gap-2 bg-[rgba(232,67,45,0.06)] border border-[rgba(232,67,45,0.16)] rounded-full px-3.5 py-1.5 mb-6 w-fit">
              <span className="w-1.5 h-1.5 bg-[#e8432d] rounded-full animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-[#e8432d]">Accredited Investors Only</span>
            </div>

            <h1 className="font-bold tracking-[-0.03em] text-[#0d0c0b] mb-4 leading-[0.92]" style={{ fontSize: "clamp(52px,6vw,76px)" }}>
              Real estate
              <br />
              <em
                className="not-italic block"
                style={{
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#e8432d",
                }}
              >
                built for
              </em>
              investors
            </h1>

            <p className="text-[15px] text-[rgba(13,12,11,0.48)] leading-[1.75] max-w-[380px] mb-8">
              Vetted off-market acquisitions across the Southeast. 50/50 profit split at sale. No fees, no pooled capital.
            </p>

            <div className="flex gap-3 items-center mb-9">
              <button
                type="button"
                onClick={() => setLocation("/properties")}
                className="bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[14px] px-7 py-3.5 rounded-[12px] flex items-center gap-2 transition-all hover:-translate-y-px"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLocation("/how-it-works")}
                className="bg-white text-[rgba(13,12,11,0.65)] border border-[rgba(13,12,11,0.1)] hover:border-[rgba(13,12,11,0.25)] hover:text-[#0d0c0b] font-medium text-[14px] px-6 py-3.5 rounded-[12px] transition-all hidden sm:block"
              >
                How It Works
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-medium text-[rgba(13,12,11,0.35)]">Active across</span>
              {["Georgia", "Tennessee", "Florida", "Texas"].map((s) => (
                <span
                  key={s}
                  className="bg-white border border-[rgba(13,12,11,0.08)] rounded-full px-3 py-1.5 text-[11px] font-semibold text-[rgba(13,12,11,0.45)] shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="sm:hidden -mx-6 mb-6">
              <div className="bg-[#0d0c0b] py-3 overflow-hidden flex items-center rounded-none">
                <div className="flex-shrink-0 px-4 font-mono text-[9px] font-medium tracking-[0.14em] uppercase text-[rgba(255,255,255,0.25)] border-r border-[rgba(255,255,255,0.07)] mr-4 whitespace-nowrap">
                  Active across
                </div>
                <div
                  className="overflow-hidden flex-1"
                  style={{
                    maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                  }}
                >
                  <div className="flex items-center w-max" style={{ animation: "tape-scroll-h 24s linear infinite" }}>
                    {[0, 1].map((copy) => (
                      <div key={copy} className="flex items-center flex-shrink-0" aria-hidden={copy === 1}>
                        {tickerStates.map((state, i) => (
                          <div
                            key={`${copy}-${state}-${i}`}
                            className="flex items-center gap-2 px-4 text-[11px] font-semibold text-[rgba(255,255,255,0.42)] tracking-[0.05em] uppercase whitespace-nowrap border-r border-[rgba(255,255,255,0.06)]"
                          >
                            <span className="w-1 h-1 bg-[#e8432d] rounded-full flex-shrink-0" />
                            {state}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[460px] lg:h-[500px]">
            {(() => {
              const heroProperty = sortedProperties.find((p) => p.mainPhotoUrl) ?? sortedProperties[0];
              const heroPhoto = heroProperty ? getPropertyImage(heroProperty) : null;
              const zillowHref =
                heroProperty && typeof heroProperty === "object" && "zillowUrl" in heroProperty
                  ? String((heroProperty as { zillowUrl?: string }).zillowUrl ?? "#")
                  : "#";
              return (
                <div
                  className="col-span-1 row-span-2 lg:row-span-2 max-lg:col-span-2 max-lg:row-span-1 max-lg:h-[220px] rounded-[20px] overflow-hidden relative cursor-pointer group bg-[#1a2018]"
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
                  {!heroPhoto && <div className="w-full h-full bg-gradient-to-br from-[#1e2a18] to-[#253520]" />}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 48%, transparent 70%)",
                    }}
                  />
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
                    <span className="bg-[#e8432d] text-white text-[8px] font-bold tracking-[0.07em] uppercase px-2.5 py-1 rounded-[5px]">
                      {heroProperty && normalizeStatus(heroProperty.status) === "AVAILABLE" ? "Open · Needs Funding" : "Funded"}
                    </span>
                    <a
                      href={zillowHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[rgba(255,255,255,0.15)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] text-white text-[10px] font-semibold px-2.5 py-1 rounded-[5px] hover:bg-[rgba(255,255,255,0.25)] transition-all"
                    >
                      Zillow →
                    </a>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5">
                    <div className="text-[15px] font-semibold text-white mb-0.5">{heroProperty?.address ?? "—"}</div>
                    <div className="text-[10px] text-[rgba(255,255,255,0.55)] mb-2.5">
                      {heroProperty ? `${heroProperty.city}, ${heroProperty.state}` : "—"}
                      {heroProperty?.beds ? ` · ${heroProperty.beds}bd · ${heroProperty.baths}ba` : ""}
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.1)] rounded-[10px] overflow-hidden">
                      <div className="bg-[rgba(0,0,0,0.42)] backdrop-blur-sm px-3 py-2.5">
                        <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(255,255,255,0.4)] mb-1">Purchase Price</div>
                        <div className="font-mono text-[14px] font-medium text-white">
                          {heroProperty ? `$${heroProperty.purchasePrice.toLocaleString()}` : "—"}
                        </div>
                      </div>
                      <div className="bg-[rgba(0,0,0,0.42)] backdrop-blur-sm px-3 py-2.5">
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

            <div
              className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="card-deals-closed"
            >
              <div>
                <div
                  className="font-mono text-[clamp(36px,3.5vw,48px)] font-medium text-[#0d0c0b] leading-none tracking-[-0.02em] mb-1"
                  data-testid="text-deals-count"
                >
                  119
                </div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.3)] mb-4">Deals Closed</div>
              </div>
              <div className="flex items-end gap-1 mb-4 h-10">
                {[40, 55, 45, 65, 58, 72, 68, 85, 78, 95, 88, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: i === 11 ? "#e8432d" : i >= 8 ? "rgba(13,12,11,0.15)" : "rgba(13,12,11,0.07)",
                    }}
                  />
                ))}
              </div>
              <div className="border-t border-[rgba(13,12,11,0.06)] pt-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#0d0c0b]">+12 this quarter</div>
                  <div className="text-[10px] text-[rgba(13,12,11,0.35)]">94d avg hold</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-[#16a34a] tracking-[0.06em] uppercase">Live Platform</span>
                </div>
              </div>
            </div>

            <div className="bg-[#e8432d] rounded-[20px] p-5 flex flex-col justify-between relative overflow-hidden" data-testid="card-total-equity">
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[rgba(255,255,255,0.07)] rounded-full pointer-events-none" />
              <div>
                <div
                  className="font-mono text-[clamp(32px,3.2vw,44px)] font-medium text-white leading-none tracking-[-0.02em] mb-1"
                  data-testid="text-equity-amount"
                >
                  {formatMoney(totalEquity) === "$0" ? "$6.1M" : formatMoney(totalEquity)}
                </div>
                <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.55)] mb-4">Total Equity</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[rgba(0,0,0,0.15)] rounded-[10px] px-3 py-2.5">
                  <div className="font-mono text-[18px] font-medium text-white leading-none mb-1">50/50</div>
                  <div className="text-[9px] font-semibold tracking-[0.09em] uppercase text-[rgba(255,255,255,0.5)]">Profit Split</div>
                </div>
                <div className="bg-[rgba(0,0,0,0.15)] rounded-[10px] px-3 py-2.5">
                  <div className="font-mono text-[18px] font-medium text-white leading-none mb-1">20%+</div>
                  <div className="text-[9px] font-semibold tracking-[0.09em] uppercase text-[rgba(255,255,255,0.5)]">Avg ROI</div>
                </div>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.15)] pt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {["B", "G", "J", "M"].map((l, i) => (
                    <div
                      key={l}
                      className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.2)] border-[1.5px] border-[#e8432d] flex items-center justify-center text-[6px] font-bold text-white flex-shrink-0"
                      style={{ marginLeft: i === 0 ? 0 : -4 }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-[rgba(255,255,255,0.6)]">250+ investors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hidden sm:flex bg-[#0d0c0b] py-3.5 overflow-hidden items-center">
        <div className="flex-shrink-0 px-6 font-mono text-[9px] font-medium tracking-[0.14em] uppercase text-[rgba(255,255,255,0.25)] border-r border-[rgba(255,255,255,0.07)] mr-5 whitespace-nowrap">
          Active across
        </div>
        <div
          className="overflow-hidden flex-1"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
          }}
        >
          <div className="flex items-center w-max" style={{ animation: "tape-scroll-h 24s linear infinite" }}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center flex-shrink-0" aria-hidden={copy === 1}>
                {tickerStates.map((state, i) => (
                  <div
                    key={`${copy}-${state}-${i}`}
                    className="flex items-center gap-2 px-4 text-[11px] font-semibold text-[rgba(255,255,255,0.42)] tracking-[0.05em] uppercase whitespace-nowrap border-r border-[rgba(255,255,255,0.06)]"
                  >
                    <span className="w-1 h-1 bg-[#e8432d] rounded-full flex-shrink-0" />
                    {state}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-[var(--cream-alt)] py-20 px-6 sm:px-10 lg:px-14" data-featured-pool-size={featuredProperties.length}>
        <div className="max-w-[1360px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-2.5">Current Opportunities</p>
              <h2 className="text-[clamp(36px,4vw,50px)] font-bold tracking-[-0.025em] text-[#0d0c0b] leading-none">
                Featured{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    fontFamily: "'Instrument Serif',Georgia,serif",
                    fontWeight: 400,
                  }}
                >
                  deals
                </em>
              </h2>
            </div>
            <Link
              href="/properties"
              className="text-[13px] font-semibold text-[#0d0c0b] border border-[rgba(13,12,11,0.12)] px-4 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#0d0c0b] hover:text-white transition-all whitespace-nowrap"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#e8432d]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {needsFundingProperties.slice(0, 6).map((property) => {
                const img = getPropertyImage(property);
                const closeDate = property.closingDate
                  ? new Date(property.closingDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
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
                    className="group bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:border-[rgba(13,12,11,0.12)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#c8d8b0]">
                      {img ? (
                        <img
                          src={img}
                          alt={property.address}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.25)] to-transparent" />
                      <div className="absolute top-2.5 left-2.5 bg-[#e8432d] text-white text-[8px] font-bold tracking-[0.07em] uppercase px-2.5 py-1 rounded-[5px] z-10">
                        Needs Funding
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-white text-[#16a34a] font-mono text-[12px] font-medium px-2.5 py-1 rounded-[7px] z-10">
                        +{formatMoney(property.estimatedEquity ?? 0)}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-[15px] font-semibold text-[#0d0c0b] mb-0.5 truncate">{property.address}</div>
                      <div className="text-[11px] text-[rgba(13,12,11,0.4)] mb-3">
                        {property.city}, {property.state}
                      </div>
                      <div className="grid grid-cols-2 pb-3 mb-3 border-b border-[rgba(13,12,11,0.06)]">
                        <div>
                          <div className="text-[9px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)] mb-1">Purchase</div>
                          <div className="font-mono text-[15px] font-medium text-[#0d0c0b]">${property.purchasePrice.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)] mb-1">Est. Equity</div>
                          <div className="font-mono text-[15px] font-medium text-[#16a34a]">
                            +${(property.estimatedEquity ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[rgba(13,12,11,0.4)] mb-2.5">
                        {property.beds} bed · {property.baths} bath · {(property.squareFeet ?? 0).toLocaleString()} sqft
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[rgba(13,12,11,0.4)] pt-2.5 mb-3 border-t border-[rgba(13,12,11,0.06)]">
                        <span>Closes {closeDate}</span>
                        {property.bpoValue ? (
                          <span className="flex items-center gap-1 text-[#16a34a] font-medium">
                            <TrendingUp className="h-3 w-3" />
                            BPO ${property.bpoValue.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="w-full bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[13px] py-2.5 rounded-[10px] flex items-center justify-center gap-1.5 transition-colors pointer-events-none"
                      >
                        View Deal Room
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {needsFundingProperties.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[rgba(13,12,11,0.4)]">
                  No properties available yet. Check back soon!
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[var(--cream-base)] border-t border-[rgba(13,12,11,0.07)] py-20 px-6 sm:px-10 lg:px-14">
        <div className="max-w-[1360px] mx-auto">
          <div className="mb-14">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-3">How It Works</p>
            <h2 className="text-[clamp(36px,4vw,50px)] font-bold tracking-[-0.025em] text-[#0d0c0b] leading-none">
              Simple{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontWeight: 400,
                }}
              >
                by design
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "We source the deal",
                desc: "SSP identifies and acquires vetted HUD and off-market properties across the Southeast. Every deal is underwritten before it hits the platform — you see the numbers before committing a dollar.",
                tags: "HUD · Off-market · Pre-underwritten",
              },
              {
                num: "02",
                title: "You fund the purchase",
                desc: "You commit capital to a specific property — not a fund. You're on title as a JV partner with first-position lien protection on your investment. Deal-by-deal, no pooled capital.",
                tags: "Deal-by-deal · On title · 1st lien",
              },
              {
                num: "03",
                title: "We split the profit",
                desc: "SSP handles renovation, management, and the sale. When the property sells, profit is split exactly 50/50. Your original capital comes back plus your share — no fees, no surprises.",
                tags: "50/50 split · Capital returned · No fees",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] p-8 flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-[rgba(13,12,11,0.12)] transition-all"
              >
                <div>
                  <div className="font-mono text-[12px] font-medium text-[#e8432d] tracking-[0.1em] mb-3">{step.num}</div>
                  <div className="w-10 h-[2px] bg-[#e8432d] rounded-full opacity-50 mb-5" />
                  <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#0d0c0b] leading-[1.1] mb-3">{step.title}</h3>
                  <p className="text-[14px] text-[rgba(13,12,11,0.5)] leading-[1.75]">{step.desc}</p>
                </div>
                <div className="font-mono text-[9px] font-medium tracking-[0.1em] text-[rgba(13,12,11,0.3)] uppercase border-t border-[rgba(13,12,11,0.06)] pt-4">
                  {step.tags}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream-alt)] border-t border-[rgba(13,12,11,0.07)] py-20 px-6 sm:px-10 lg:px-14">
        <div className="max-w-[1360px] mx-auto">
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-3">Track Record</p>
            <h2 className="text-[clamp(36px,4vw,50px)] font-bold tracking-[-0.025em] text-[#0d0c0b] leading-none">
              10+ years of{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Instrument Serif',Georgia,serif",
                  fontWeight: 400,
                }}
              >
                verified exits
              </em>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(13,12,11,0.08)] rounded-[16px] overflow-hidden mb-10">
            {[
              {
                val: "119",
                label: "Deals Closed",
                sub: "Since 2014",
                green: false,
              },
              {
                val: formatMoney(totalEquity) === "$0" ? "$6.1M" : formatMoney(totalEquity),
                label: "Total Equity Generated",
                sub: "For investors",
                green: true,
              },
              {
                val: "94d",
                label: "Average Hold Time",
                sub: "Close to exit",
                green: false,
              },
              {
                val: "50/50",
                label: "Profit Split",
                sub: "Every single deal",
                green: false,
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-7 py-9 flex flex-col gap-3">
                <div
                  className={`font-mono leading-none tracking-[-0.02em] ${stat.green ? "text-[#16a34a]" : "text-[#0d0c0b]"}`}
                  style={{ fontSize: "clamp(36px,3.5vw,52px)" }}
                >
                  {stat.val}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#0d0c0b] mb-1">{stat.label}</div>
                  <div className="text-[12px] text-[rgba(13,12,11,0.4)]">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-[14px] text-[rgba(13,12,11,0.45)] max-w-[480px] leading-[1.75]">
              10+ years of verified exits across Georgia, Tennessee, Florida, and 7 other states. Deal-by-deal JV only — no pooled capital, no fund,
              no management fees.
            </p>
            <button
              type="button"
              onClick={() => setLocation("/properties")}
              className="bg-[#0d0c0b] hover:bg-[#e8432d] text-white font-semibold text-[14px] px-7 py-3.5 rounded-[12px] flex items-center gap-2 transition-all hover:-translate-y-px flex-shrink-0"
            >
              View All Deals
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#181614]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="border border-[var(--line)] rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            <div className="p-12 lg:p-16 flex flex-col justify-center bg-[var(--surface-hex)] border-b lg:border-b-0 lg:border-r border-[var(--line)]">
              <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-primary mb-4">Get Early Access</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-5">
                New Deals Drop
                <br />
                <em className="italic text-primary">Every Week</em>
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-[1.8] mb-8 max-w-sm">
                Our best opportunities fund within days. Leave your info and we&apos;ll reach out directly — no spam, no mass emails, just a real
                conversation.
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

      <section className="py-20 bg-[#0f0e0d] border-t border-[var(--line)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative border border-[var(--line)] rounded-[20px] overflow-hidden p-10 sm:p-20 flex flex-col gap-10 lg:gap-12">
            <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] bg-primary/8 rounded-full filter blur-[80px] pointer-events-none" />
            <div className="w-[60px] h-[3px] bg-[#e8432d] rounded-full opacity-60 shrink-0 relative z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              <div className="relative z-20 text-center lg:text-left">
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#e8432d] mb-4">Ready to invest?</p>
                <h2 className="font-serif text-4xl sm:text-5xl text-[#f0ebe3] mb-4 tracking-tight leading-none">Start Investing Today</h2>
                <p className="text-[15px] text-[rgba(240,235,227,0.68)] leading-[1.7] max-w-md mx-auto lg:mx-0">
                  Join our community of accredited investors and access exclusive real estate opportunities.
                </p>
              </div>
              <div className="relative z-20 flex flex-col items-center lg:items-end gap-3">
                <Link
                  href="/properties"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-xl text-[15px] inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(232,67,45,0.2)] hover:shadow-[0_12px_32px_rgba(232,67,45,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  Explore Properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-[11px] text-[rgba(240,235,227,0.4)]">No fees. No funds. Deal-by-deal JV only.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
