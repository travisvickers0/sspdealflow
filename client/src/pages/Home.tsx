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
  const featuredProperties = properties?.slice(0, 3) || [];
  
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
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 bg-white/60 backdrop-blur border border-gray-200/50 rounded-full animate-in fade-in slide-in-from-top duration-700 shadow-sm text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium text-gray-700">Exclusively for Accredited Investors</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
              Real Estate Opportunities<br />
              <span className="text-primary">
                Built for Investors
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-xl mb-8 sm:mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 font-light">
              Discover curated real estate deals with transparent structures, real-time dashboards, and institutional returns. All in one place.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="p-3 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">{formatMoney(totalEquity)}</span>
                </div>
                <p className="text-xs text-gray-600">Total Equity</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">$15M+</span>
                </div>
                <p className="text-xs text-gray-600">Deployed</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md hidden sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">250+</span>
                </div>
                <p className="text-xs text-gray-600">Active Investors</p>
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

            {/* Right Side - Stacked Property Cards */}
            <div className="hidden lg:block relative h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : featuredProperties.length > 0 ? (
                <>
                  {/* Card 3 - Back (renders first so it's behind) */}
                  {featuredProperties[2] && (
                    <div 
                      className={`absolute right-16 top-48 w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 cursor-pointer ${
                        hoveredCard === 2 ? 'z-50 scale-105 opacity-100 rotate-0' : 'z-10 -rotate-3 opacity-60'
                      }`}
                      onMouseEnter={() => setHoveredCard(2)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {featuredProperties[2]?.mainPhotoUrl && (
                          <img 
                            src={featuredProperties[2].mainPhotoUrl}
                            alt={featuredProperties[2].address}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                          ${(featuredProperties[2]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">{featuredProperties[2]?.address}</h3>
                        <p className="text-sm text-gray-600">{featuredProperties[2]?.city}, {featuredProperties[2]?.state}</p>
                      </div>
                    </div>
                  )}

                  {/* Card 2 - Middle */}
                  {featuredProperties[1] && (
                    <div 
                      className={`absolute right-8 top-24 w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 cursor-pointer ${
                        hoveredCard === 1 ? 'z-50 scale-105 opacity-100 rotate-0' : 'z-20 rotate-3 opacity-80'
                      }`}
                      onMouseEnter={() => setHoveredCard(1)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {featuredProperties[1]?.mainPhotoUrl && (
                          <img 
                            src={featuredProperties[1].mainPhotoUrl}
                            alt={featuredProperties[1].address}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                          ${(featuredProperties[1]?.purchasePrice / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-2">{featuredProperties[1]?.address}</h3>
                        <p className="text-sm text-gray-600">{featuredProperties[1]?.city}, {featuredProperties[1]?.state}</p>
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
                      {featuredProperties[0]?.mainPhotoUrl && (
                        <img 
                          src={featuredProperties[0].mainPhotoUrl}
                          alt={featuredProperties[0].address}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                        ${(featuredProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{featuredProperties[0]?.address}</h3>
                      <p className="text-sm text-gray-600 mb-4">{featuredProperties[0]?.city}, {featuredProperties[0]?.state}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-primary font-semibold">${(featuredProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span className="text-gray-600">{(featuredProperties[0]?.squareFeet || 0).toLocaleString()} sf</span>
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
