import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";
import { ArrowRight, Loader2, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: properties, isLoading } = useProperties();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  // Filter for properties that need funding
  const needsFundingProperties = properties?.filter(p => p.status === 'needs_funding') || [];
  
  // Hero stack shows first 3 needs_funding properties
  const heroStackProperties = needsFundingProperties.slice(0, 3);
  
  // Helper to get image URL - use mainPhotoUrl or fallback to first gallery photo
  const getPropertyImage = (property: any) => {
    return property?.mainPhotoUrl || (property?.galleryPhotoUrls?.[0] ?? null);
  };
  
  // Featured Opportunities shows next 3 different needs_funding properties
  const featuredProperties = needsFundingProperties.slice(3, 6);
  
  // Calculate total equity from all properties
  const totalEquity = properties?.reduce((sum, p) => sum + (p.estimatedEquity || 0), 0) || 0;
  
  // Calculate deals closed (SOLD status properties)
  const dealsClosed = properties?.filter(p => {
    const normalizedStatus = p.status === "funded" || p.status === "archived" ? "FUNDED" : p.status;
    return normalizedStatus === "SOLD" || normalizedStatus === "FUNDED";
  }).length || 0;
  
  // Calculate average hold period from SOLD properties with holdPeriodMonths (convert to days)
  const soldProperties = properties?.filter(p => p.status === "SOLD" && p.holdPeriodMonths) || [];
  const averageHoldPeriod = soldProperties.length > 0
    ? Math.round((soldProperties.reduce((sum, p) => sum + (p.holdPeriodMonths || 0), 0) / soldProperties.length) * 30.44)
    : 94; // Default fallback (94 days ≈ 3 months)
  
  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
    return `$${amount}`;
  };

  return (
    <Layout>
      {/* High-End Minimalist Hero Section */}
      <div className="relative min-h-[95vh] lg:min-h-[90vh] w-full overflow-hidden bg-[#faf9f6] border-b border-gray-100">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none">
          <img 
            src={airbnbHero}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Refined Animated Accents */}
        <div className="hidden sm:block absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary/5 rounded-full filter blur-[120px] animate-pulse pointer-events-none" />
        <div className="hidden sm:block absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-orange-200/10 rounded-full filter blur-[100px] animate-pulse delay-1000 pointer-events-none" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full py-12 sm:py-16 lg:py-20 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 w-full items-center">
            {/* Left Side - Positioning & Proof */}
            <div className="max-w-2xl">
              {/* TIER 0: SUBTLE ANNOUNCEMENT */}
              <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 bg-white/40 backdrop-blur-sm border border-gray-200/30 rounded-full animate-in fade-in slide-in-from-top duration-700">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Accredited Investors Only</span>
              </div>

              {/* TIER 1: THE POSITIONING STATEMENT */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-[1.05]">
                Real Estate Opportunities<br className="hidden sm:block" />
                <span className="text-primary/90"> Built for Investors</span>
              </h1>

              {/* TIER 2: THE TRUST STRIP */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mb-12">
                <div className="inline-flex items-center px-6 py-2.5 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-lg max-w-xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)]">
                  <p className="text-[10px] sm:text-[13px] text-gray-500 font-semibold leading-relaxed flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-primary/40" /> 10+ years verified foreclosure & REO exits nationwide</span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary/40" /> Deal-by-deal joint ventures</span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span>No fees</span>
                    <span className="text-gray-300 hidden sm:inline">·</span>
                    <span>50/50 profit split at sale</span>
                  </p>
                </div>
              </div>

              {/* TIER 3: THE METRICS BAR */}
              <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                {[
                  { label: 'Deals Closed', value: dealsClosed, important: true },
                  { label: 'Avg Hold', value: `${averageHoldPeriod}d`, important: true },
                  { label: 'Total Equity', value: formatMoney(totalEquity), important: true },
                  { label: 'Active Investors', value: '250+', important: false },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col border-l border-gray-200 pl-6 first:border-l-0 first:pl-0">
                    <span className={`text-2xl font-bold tracking-tight tabular-nums leading-none ${stat.important ? 'text-gray-800' : 'text-gray-400 font-semibold'}`}>{stat.value}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.12em] mt-3 leading-none ${stat.important ? 'text-gray-400' : 'text-gray-300'}`}>{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* TIER 4: ACTION ZONE */}
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 relative z-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <a href="/properties" className="w-full sm:w-auto">
                    <Button 
                      size="lg"
                      className="group rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-14 border-0 shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-full text-base cursor-pointer"
                    >
                      Explore Properties
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="/how-it-works" className="w-full sm:w-auto">
                    <Button 
                      size="lg"
                      variant="outline" 
                      className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-8 h-14 bg-white/80 backdrop-blur-sm w-full sm:w-auto text-base cursor-pointer transition-all"
                    >
                      View Partnership Structure
                    </Button>
                  </a>
                </div>
                
                {/* Optional Badge */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200/60 bg-white/40 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">First-Position JV Structure</span>
                </div>
              </div>
            </div>

            {/* Mobile Card Stack */}
            <div className="lg:hidden relative mt-16 pb-12">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                </div>
              ) : heroStackProperties.length > 0 ? (
                <div className="relative h-[320px] mx-auto max-w-[320px]">
                  {/* Card 3 - Back */}
                  {heroStackProperties[2] && (
                    <div className="absolute left-6 top-10 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform -rotate-6 opacity-30 z-10">
                      <div className="aspect-[16/10] bg-gray-100 relative">
                        {getPropertyImage(heroStackProperties[2]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[2])}
                            alt={heroStackProperties[2].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Card 2 - Middle */}
                  {heroStackProperties[1] && (
                    <div className="absolute left-3 top-5 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-2 opacity-80 z-20 transition-all duration-500">
                      <div className="aspect-[16/10] bg-gray-100 relative">
                        {getPropertyImage(heroStackProperties[1]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[1])}
                            alt={heroStackProperties[1].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Card 1 - Front */}
                  <a href={`/property/${heroStackProperties[0]?.id}`} className="block relative z-30">
                    <div className="absolute left-0 top-0 w-[280px] bg-white rounded-2xl shadow-[0_30px_50px_-15px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden group">
                      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                        {getPropertyImage(heroStackProperties[0]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[0])}
                            alt={heroStackProperties[0].address}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider">
                          ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-0.5 text-sm truncate">{heroStackProperties[0]?.address}</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</p>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-primary font-bold uppercase tracking-wider">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                          <span className="text-gray-400 font-medium">{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} SF</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ) : null}
            </div>

            {/* Desktop Stacked Property Cards */}
            <div className="hidden lg:block relative h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                </div>
              ) : heroStackProperties.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Card 2 - Middle */}
                  {heroStackProperties[1] && (
                    <div 
                      className={`absolute right-8 top-24 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden transform transition-all duration-500 ease-out cursor-pointer ${
                        hoveredCard === 1 ? 'z-50 scale-[1.02] opacity-100 rotate-0 translate-x-[-10px] translate-y-[-10px]' : 'z-20 rotate-3 opacity-60 translate-x-2 translate-y-4'
                      }`}
                      onMouseEnter={() => setHoveredCard(1)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        {getPropertyImage(heroStackProperties[1]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[1])}
                            alt={heroStackProperties[1].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider">
                          ${(heroStackProperties[1]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1">{heroStackProperties[1]?.address}</h3>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{heroStackProperties[1]?.city}, {heroStackProperties[1]?.state}</p>
                      </div>
                    </div>
                  )}

                  {/* Card 1 - Front */}
                  <a href={`/property/${heroStackProperties[0]?.id}`} className="block relative z-30">
                    <div 
                      className={`absolute right-0 top-0 w-[420px] bg-white rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100/80 overflow-hidden transform transition-all duration-500 ease-out cursor-pointer group ${
                        hoveredCard === 0 ? 'z-50 scale-[1.02]' : hoveredCard !== null ? 'z-30 opacity-90' : 'z-30'
                      }`}
                      onMouseEnter={() => setHoveredCard(0)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {getPropertyImage(heroStackProperties[0]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[0])}
                            alt={heroStackProperties[0].address}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider">
                          ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-0.5 text-lg truncate">{heroStackProperties[0]?.address}</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-4">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary font-bold uppercase tracking-wider">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                          <span className="text-gray-400 font-medium">{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} SF</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No properties available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Opportunities Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Featured Opportunities
              </h2>
              <p className="text-gray-500 mt-3 text-lg font-medium">
                Hand-picked deals ready for investment
              </p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="gap-2 hover:bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-full transition-colors">
                View All Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {featuredProperties.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <p className="text-lg">No properties available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-[#faf9f6] to-amber-50/30 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to Start Investing?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12 text-lg font-medium">
            Join our community of accredited investors and access exclusive real estate opportunities.
          </p>
          <Link href="/properties">
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-14 shadow-lg shadow-primary/20 transition-all text-base">
              Explore All Properties
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
