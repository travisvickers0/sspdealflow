import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { ArrowRight, Loader2, FileText, BarChart3, Users } from "lucide-react";
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
      {/* Hero Section */}
      <section className="hero-section bg-[#F8F4F1] py-16 px-8 lg:px-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left Column */}
        <div className="left-column flex-1 max-w-2xl">
          {/* Accredited Investors Tag */}
          <span className="tag inline-flex items-center gap-2 bg-white text-[#333333] px-4 py-2 rounded-full text-sm font-normal border border-gray-200 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Exclusively for Accredited Investors
          </span>

          {/* Headings */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#333333] mb-4 leading-tight">
            Real Estate Opportunities<br />
            <span className="text-primary">Built for Investors</span>
          </h1>

          {/* Description */}
          <p className="text-[#666666] text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
            Discover curated real estate deals with transparent structures, real-time dashboards, and institutional returns. All in one place.
          </p>

          {/* Stats Section - 3 Column Grid */}
          <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="stat-card bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="number text-3xl font-bold text-[#333333] leading-none">{formatMoney(totalEquity)}</span>
                  <span className="label text-sm font-normal text-[#666666] mt-2">Total Equity</span>
                </div>
              </div>
            </div>
            <div className="stat-card bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="number text-3xl font-bold text-[#333333] leading-none">$15M+</span>
                  <span className="label text-sm font-normal text-[#666666] mt-2">Deployed</span>
                </div>
              </div>
            </div>
            <div className="stat-card bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="number text-3xl font-bold text-[#333333] leading-none">250+</span>
                  <span className="label text-sm font-normal text-[#666666] mt-2">Active Investors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="buttons flex flex-col sm:flex-row gap-4">
            <a href="/properties" className="primary-button inline-flex items-center justify-center bg-primary text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
              Explore Properties
            </a>
            <a href="/how-it-works" className="secondary-button inline-flex items-center justify-center bg-white border-2 border-gray-300 text-[#333333] px-8 py-3.5 rounded-lg text-base font-normal hover:border-gray-400 transition-all cursor-pointer">
              View Partnership Structure
            </a>
          </div>
        </div>

        {/* Right Column - Card Stack */}
        <div className="right-column hidden lg:block relative w-full max-w-[450px] h-[520px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : heroStackProperties.length > 0 ? (
            <div className="card-stack relative w-full h-full">
              {/* Card 3 - Back */}
              {heroStackProperties[2] && (
                <div className="property-card absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden transform translate-x-8 translate-y-8 rotate-[3deg] scale-95 z-10 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    {getPropertyImage(heroStackProperties[2]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[2])}
                        alt={heroStackProperties[2].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="card-content p-5">
                    <h3 className="text-lg font-bold text-[#333333] mb-2 truncate">{heroStackProperties[2]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-sm text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[2]?.city}, {heroStackProperties[2]?.state}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-semibold">${(heroStackProperties[2]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[2]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2 - Middle */}
              {heroStackProperties[1] && (
                <div className="property-card absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] overflow-hidden transform translate-x-4 translate-y-4 rotate-[1.5deg] scale-[0.97] z-20 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    {getPropertyImage(heroStackProperties[1]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[1])}
                        alt={heroStackProperties[1].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="card-content p-5">
                    <h3 className="text-lg font-bold text-[#333333] mb-2 truncate">{heroStackProperties[1]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-sm text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[1]?.city}, {heroStackProperties[1]?.state}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-semibold">${(heroStackProperties[1]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[1]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 1 - Front */}
              {heroStackProperties[0] && (
                <a href={`/property/${heroStackProperties[0]?.id}`} className="property-card block absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden z-30 hover:scale-[1.03] hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    {getPropertyImage(heroStackProperties[0]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[0])}
                        alt={heroStackProperties[0].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                    <div className="price-tag absolute top-3 left-3 bg-primary text-white px-5 py-2 rounded-lg text-base font-bold transform -rotate-[12deg] shadow-lg">
                      ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="card-content p-5">
                    <h3 className="text-lg font-bold text-[#333333] mb-2 truncate">{heroStackProperties[0]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-sm text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#666666]">
              <p>No properties available</p>
            </div>
          )}
        </div>

        {/* Mobile Card Stack */}
        <div className="lg:hidden relative w-full max-w-[380px] h-[450px] mt-8 mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : heroStackProperties.length > 0 ? (
            <div className="card-stack relative w-full h-full">
              {/* Card 3 - Back */}
              {heroStackProperties[2] && (
                <div className="property-card absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden transform translate-x-8 translate-y-8 rotate-[3deg] scale-95 z-10 transition-all">
                  <div className="relative h-44 overflow-hidden">
                    {getPropertyImage(heroStackProperties[2]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[2])}
                        alt={heroStackProperties[2].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="card-content p-4">
                    <h3 className="text-base font-bold text-[#333333] mb-2 truncate">{heroStackProperties[2]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-xs text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[2]?.city}, {heroStackProperties[2]?.state}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">${(heroStackProperties[2]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[2]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2 - Middle */}
              {heroStackProperties[1] && (
                <div className="property-card absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] overflow-hidden transform translate-x-4 translate-y-4 rotate-[1.5deg] scale-[0.97] z-20 transition-all">
                  <div className="relative h-44 overflow-hidden">
                    {getPropertyImage(heroStackProperties[1]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[1])}
                        alt={heroStackProperties[1].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="card-content p-4">
                    <h3 className="text-base font-bold text-[#333333] mb-2 truncate">{heroStackProperties[1]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-xs text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[1]?.city}, {heroStackProperties[1]?.state}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">${(heroStackProperties[1]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[1]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 1 - Front */}
              {heroStackProperties[0] && (
                <a href={`/property/${heroStackProperties[0]?.id}`} className="property-card block absolute top-0 left-0 w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden z-30 hover:scale-[1.03] hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer">
                  <div className="relative h-44 overflow-hidden">
                    {getPropertyImage(heroStackProperties[0]) ? (
                      <img 
                        src={getPropertyImage(heroStackProperties[0])}
                        alt={heroStackProperties[0].address}
                        className="w-full h-full object-cover rounded-t-2xl"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                    <div className="price-tag absolute top-2.5 left-2.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold transform -rotate-[12deg] shadow-lg">
                      ${(heroStackProperties[0]?.purchasePrice / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="card-content p-4">
                    <h3 className="text-base font-bold text-[#333333] mb-2 truncate">{heroStackProperties[0]?.address}</h3>
                    <div className="card-details flex flex-col gap-1 text-xs text-[#666666] font-normal">
                      <span className="text-[#333333]">{heroStackProperties[0]?.city}, {heroStackProperties[0]?.state}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">${(heroStackProperties[0]?.estimatedEquity / 1000).toFixed(0)}k Equity</span>
                        <span>{(heroStackProperties[0]?.squareFeet || 0).toLocaleString()} sf</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#666666]">
              <p>No properties available</p>
            </div>
          )}
        </div>
      </section>

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
