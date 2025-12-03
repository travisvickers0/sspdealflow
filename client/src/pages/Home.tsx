import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";
import { ArrowRight, TrendingUp, Lock, Zap } from "lucide-react";

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

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
                  <span className="text-lg sm:text-2xl font-bold text-gray-900">18-24%</span>
                </div>
                <p className="text-xs text-gray-600">Avg Returns</p>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/properties" className="w-full sm:w-auto">
                <Button 
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 border-0 shadow-lg hover:shadow-xl transition-all w-full text-sm sm:text-base"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </Link>
              <Button 
                size="sm"
                variant="outline" 
                className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-6 sm:px-8 h-10 sm:h-12 bg-white/60 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base"
              >
                Schedule Demo
              </Button>
            </div>
            </div>

            {/* Right Side - Stacked Property Cards */}
            <div className="hidden lg:block relative h-[700px]">
              {/* Card 1 - Front */}
              <div className="absolute right-0 top-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 z-30 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[0].images[0] && (
                    <img 
                      src={properties[0].images[0]}
                      alt={properties[0].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    ${(properties[0].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{properties[0].address}</h3>
                  <p className="text-sm text-gray-600 mb-4">{properties[0].city}, {properties[0].state}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-semibold">${(properties[0].equity_available / 1000).toFixed(0)}k Available</span>
                    <span className="text-gray-600">20% ROI</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Middle */}
              <div className="absolute right-8 top-40 w-96 bg-white rounded-2xl shadow-xl overflow-hidden transform -rotate-6 z-20 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[1].images[0] && (
                    <img 
                      src={properties[1].images[0]}
                      alt={properties[1].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    ${(properties[1].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{properties[1].address}</h3>
                  <p className="text-sm text-gray-600 mb-4">{properties[1].city}, {properties[1].state}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-semibold">${(properties[1].equity_available / 1000).toFixed(0)}k Available</span>
                    <span className="text-gray-600">18% ROI</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Back */}
              <div className="absolute right-16 top-80 w-96 bg-white rounded-2xl shadow-lg overflow-hidden transform rotate-3 z-10 animate-in fade-in slide-in-from-right-4 duration-700 delay-1000">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[2].images[0] && (
                    <img 
                      src={properties[2].images[0]}
                      alt={properties[2].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                    ${(properties[2].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{properties[2].address}</h3>
                  <p className="text-sm text-gray-600 mb-4">{properties[2].city}, {properties[2].state}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-semibold">Fully Funded</span>
                    <span className="text-gray-600">24% ROI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Featured Properties Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">Featured Opportunities</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Hand-picked deals curated for maximum returns</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="hidden md:flex rounded-full gap-2 text-sm">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-x-8 lg:gap-y-12 mb-8">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>

        <div className="flex md:hidden justify-center">
          <Link href="/properties" className="w-full">
            <Button className="rounded-full w-full gap-2 text-sm">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
