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
      <div className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-50">
          <img 
            src={airbnbHero}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Subtle Animated Accents */}
        <div className="absolute top-32 right-32 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-orange-200/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-8 h-full py-20 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
            {/* Left Side - Text & CTAs */}
            <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/60 backdrop-blur border border-gray-200/50 rounded-full animate-in fade-in slide-in-from-top duration-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Exclusively for Accredited Investors</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
              Real Estate Opportunities<br />
              <span className="text-primary">
                Built for Investors
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 font-light">
              Discover curated real estate deals with transparent structures, real-time dashboards, and institutional returns. All in one place.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-gray-900">18-24%</span>
                </div>
                <p className="text-xs text-gray-600">Avg Annual Returns</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-gray-900">$15M+</span>
                </div>
                <p className="text-xs text-gray-600">Deployed Capital</p>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur border border-gray-200/50 rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-gray-900">250+</span>
                </div>
                <p className="text-xs text-gray-600">Active Investors</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/properties">
                <Button 
                  size="lg" 
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-8 h-12 bg-white/60 backdrop-blur-sm w-full sm:w-auto"
              >
                Schedule Demo
              </Button>
            </div>
            </div>

            {/* Right Side - Stacked Property Cards */}
            <div className="hidden lg:block relative h-[600px]">
              {/* Card 1 - Front */}
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 z-30 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[0].images[0] && (
                    <img 
                      src={properties[0].images[0]}
                      alt={properties[0].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ${(properties[0].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{properties[0].address}</h3>
                  <p className="text-sm text-gray-600 mb-3">{properties[0].city}, {properties[0].state}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary font-semibold">${(properties[0].equity_available / 1000).toFixed(0)}k Available</span>
                    <span className="text-gray-600">20% ROI</span>
                  </div>
                </div>
              </div>

              {/* Card 2 - Middle */}
              <div className="absolute right-12 top-32 w-80 bg-white rounded-2xl shadow-xl overflow-hidden transform -rotate-6 z-20 animate-in fade-in slide-in-from-right-4 duration-700 delay-700">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[1].images[0] && (
                    <img 
                      src={properties[1].images[0]}
                      alt={properties[1].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ${(properties[1].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{properties[1].address}</h3>
                  <p className="text-sm text-gray-600 mb-3">{properties[1].city}, {properties[1].state}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary font-semibold">${(properties[1].equity_available / 1000).toFixed(0)}k Available</span>
                    <span className="text-gray-600">18% ROI</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Back */}
              <div className="absolute right-24 top-52 w-80 bg-white rounded-2xl shadow-lg overflow-hidden transform rotate-3 z-10 animate-in fade-in slide-in-from-right-4 duration-700 delay-1000">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {properties[2].images[0] && (
                    <img 
                      src={properties[2].images[0]}
                      alt={properties[2].address}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ${(properties[2].purchase_price / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{properties[2].address}</h3>
                  <p className="text-sm text-gray-600 mb-3">{properties[2].city}, {properties[2].state}</p>
                  <div className="flex justify-between text-xs">
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
      <div className="container mx-auto px-4 sm:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">Hand-picked deals curated for maximum returns</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="hidden md:flex rounded-full gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-8">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>

        <div className="flex md:hidden justify-center">
          <Link href="/properties">
            <Button className="rounded-full px-8 gap-2">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
