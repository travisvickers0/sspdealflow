import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";
import { ArrowRight, CheckCircle, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
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
            <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top duration-700">
              <span className="bg-gray-50 border border-primary/20 text-primary tracking-wider px-3 py-1.5 rounded-full text-[10px] font-bold uppercase shadow-sm">
                Accredited Investors Only
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
              Real Estate Opportunities<br />
              <span className="text-primary">
                Built for Investors
              </span>
            </h1>

            {/* Checkmark Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-700">10+ Years Verified Exits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-700">Deal-by-Deal JV Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-700">No Fees · 100% Transparent</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-gray-700">50/50 Profit Split at Sale</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-6 sm:gap-8 p-5 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 w-full sm:w-fit mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-gray-900">29</span>
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap">Deals Closed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-gray-900">94d</span>
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap">Avg Hold</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-primary">{formatMoney(totalEquity)}</span>
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap">Total Equity</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-gray-900">250+</span>
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap">Active Investors</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 relative z-10">
              <a href="/properties" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold px-6 h-12 border-0 shadow-lg hover:shadow-xl transition-all w-full text-sm cursor-pointer"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="/how-it-works" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  variant="outline" 
                  className="rounded-lg border-primary text-primary hover:bg-primary/5 font-semibold px-6 h-12 bg-white w-full sm:w-auto text-sm cursor-pointer"
                >
                  View Partnership Structure
                </Button>
              </a>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-gray-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 whitespace-nowrap overflow-visible">
              <ShieldCheck className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-[13px] sm:text-sm">Secured by First-Position Lien Structure</span>
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
                          <span className="text-emerald-600 font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
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
                        <span className="text-emerald-600 font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
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
