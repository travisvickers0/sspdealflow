import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";
import { ArrowRight, TrendingUp, Lock, Zap, Loader2 } from "lucide-react";
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
      {/* Airbnb-Style Modern Hero Section */}
      <div className="relative min-h-screen lg:min-h-[90vh] w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-50">
          <img 
            src={airbnbHero}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Subtle Animated Accents */}
        <div className="hidden sm:block absolute top-32 right-32 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse" />
        <div className="hidden sm:block absolute bottom-20 left-20 w-64 h-64 bg-orange-200/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full py-12 sm:py-16 lg:py-20 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 w-full items-center">
            {/* Left Side - Text & CTAs */}
            <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 bg-white/60 backdrop-blur border border-gray-200/50 rounded-full animate-in fade-in slide-in-from-top duration-700 shadow-sm text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium text-gray-700">Exclusively for Accredited Investors</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-3 sm:mb-4 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
              Real Estate Opportunities<br className="hidden sm:block" />
              <span className="text-primary"> Built for Investors</span>
            </h1>

            {/* Subheading Cards */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mb-8 sm:mb-12 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm max-w-xl hover:bg-white/80 transition-colors group">
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm sm:text-base text-gray-800 leading-snug font-semibold">
                  10+ years of verified foreclosure and REO exits nationwide.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm max-w-xl hover:bg-white/80 transition-colors group">
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm sm:text-base text-gray-800 leading-snug font-semibold">
                  Deal-by-deal joint ventures with no fees and 50/50 profit splits at sale.
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="p-2 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                  <TrendingUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
                  <span className="text-sm sm:text-2xl font-bold text-gray-900 whitespace-nowrap">{formatMoney(totalEquity)}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">Equity</p>
              </div>
              <div className="p-2 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                  <Lock className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
                  <span className="text-sm sm:text-2xl font-bold text-gray-900 whitespace-nowrap">{dealsClosed}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">Closed</p>
              </div>
              <div className="p-2 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                  <Zap className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
                  <span className="text-sm sm:text-2xl font-bold text-gray-900 whitespace-nowrap">{averageHoldPeriod}d</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">Hold</p>
              </div>
              <div className="p-2 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md hidden sm:block">
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-2">
                  <Zap className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
                  <span className="text-sm sm:text-2xl font-bold text-gray-900 whitespace-nowrap">250+</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">Investors</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 relative z-10">
              <a href="/properties" className="w-full sm:w-auto">
                <Button 
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 border-0 shadow-lg hover:shadow-xl transition-all w-full text-sm sm:text-base cursor-pointer"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </a>
              <a href="/how-it-works" className="w-full sm:w-auto">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-6 sm:px-8 h-10 sm:h-12 bg-white/60 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base cursor-pointer"
                >
                  How It Works
                </Button>
              </a>
            </div>
            </div>

            {/* Mobile Card Stack */}
            <div className="lg:hidden relative mt-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : heroStackProperties.length > 0 ? (
                <div className="relative h-[280px] mx-auto max-w-[320px]">
                  {/* Card 3 - Back */}
                  {heroStackProperties[2] && (
                    <div className="absolute left-4 top-8 w-[280px] bg-white rounded-xl shadow-md overflow-hidden transform -rotate-3 opacity-50 z-10">
                      <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative">
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
                    <div className="absolute left-2 top-4 w-[280px] bg-white rounded-xl shadow-lg overflow-hidden transform rotate-2 opacity-70 z-20">
                      <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative">
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
                  <a href={`/property/${heroStackProperties[0]?.id}`} className="block">
                    <div className="absolute left-0 top-0 w-[280px] bg-white rounded-xl shadow-2xl overflow-hidden z-30">
                      <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {getPropertyImage(heroStackProperties[0]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[0])}
                            alt={heroStackProperties[0].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                          ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{heroStackProperties[0]?.address}</h3>
                        <p className="text-xs text-gray-600 mb-2">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-primary font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                          <span className="text-gray-600">{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} sf</span>
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : heroStackProperties.length > 0 ? (
                <>
                  {/* Card 3 - Back (renders first so it's behind) */}
                  {heroStackProperties[2] && (
                    <div 
                      className={`absolute right-16 top-48 w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 cursor-pointer ${
                        hoveredCard === 2 ? 'z-50 scale-105 opacity-100 rotate-0' : 'z-10 -rotate-3 opacity-60'
                      }`}
                      onMouseEnter={() => setHoveredCard(2)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {getPropertyImage(heroStackProperties[2]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[2])}
                            alt={heroStackProperties[2].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                          ${(heroStackProperties[2]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">{heroStackProperties[2]?.address}</h3>
                        <p className="text-sm text-gray-600">{heroStackProperties[2]?.city}, {heroStackProperties[2]?.state}</p>
                      </div>
                    </div>
                  )}

                  {/* Card 2 - Middle */}
                  {heroStackProperties[1] && (
                    <div 
                      className={`absolute right-8 top-24 w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 cursor-pointer ${
                        hoveredCard === 1 ? 'z-50 scale-105 opacity-100 rotate-0' : 'z-20 rotate-3 opacity-80'
                      }`}
                      onMouseEnter={() => setHoveredCard(1)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {getPropertyImage(heroStackProperties[1]) && (
                          <img 
                            src={getPropertyImage(heroStackProperties[1])}
                            alt={heroStackProperties[1].address}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                          ${(heroStackProperties[1]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">{heroStackProperties[1]?.address}</h3>
                        <p className="text-sm text-gray-600">{heroStackProperties[1]?.city}, {heroStackProperties[1]?.state}</p>
                      </div>
                    </div>
                  )}

                  {/* Card 1 - Front */}
                  <div 
                    className={`absolute right-0 top-0 w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 cursor-pointer ${
                      hoveredCard === 0 ? 'z-50 scale-105' : hoveredCard !== null ? 'z-30 opacity-90' : 'z-30'
                    }`}
                    onMouseEnter={() => setHoveredCard(0)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      {getPropertyImage(heroStackProperties[0]) && (
                        <img 
                          src={getPropertyImage(heroStackProperties[0])}
                          alt={heroStackProperties[0].address}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                        ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{heroStackProperties[0]?.address}</h3>
                      <p className="text-sm text-gray-600 mb-4">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span className="text-gray-600">{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No properties available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Featured Opportunities
              </h2>
              <p className="text-gray-600 mt-2">
                Hand-picked deals ready for investment
              </p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="gap-2 hover:bg-gray-100">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {featuredProperties.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p>No properties available yet. Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 to-amber-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Investing?
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Join our community of accredited investors and access exclusive real estate opportunities.
          </p>
          <Link href="/properties">
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 shadow-lg">
              Explore Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
