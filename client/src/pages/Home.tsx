import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";
import fintechHero from "@assets/generated_images/modern_fintech_gradient_hero_background_with_geometric_elements.png";
import { ArrowRight, TrendingUp, Lock, Zap } from "lucide-react";

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

  return (
    <Layout>
      {/* Modern Fintech Hero Section */}
      <div className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src={fintechHero}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full filter blur-3xl animate-pulse delay-700" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-8 h-full py-20 flex flex-col justify-center">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full animate-in fade-in slide-in-from-top duration-700">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80">Exclusively for Accredited Investors</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
              Real Estate Returns,<br />
              <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Access pre-vetted commercial real estate opportunities with transparent deal structures, real-time analytics, and institutional-grade returns.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-2xl font-bold text-white">18-24%</span>
                </div>
                <p className="text-xs text-white/60">Avg Annual Returns</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span className="text-2xl font-bold text-white">$15M+</span>
                </div>
                <p className="text-xs text-white/60">Deployed Capital</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">250+</span>
                </div>
                <p className="text-xs text-white/60">Active Investors</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/properties">
                <Button 
                  size="lg" 
                  className="rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold px-8 h-12 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 bg-transparent backdrop-blur-sm w-full sm:w-auto"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />
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
