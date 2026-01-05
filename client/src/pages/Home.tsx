import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { ArrowRight, Loader2, Shield } from "lucide-react";
import { useState, useEffect } from "react";

function useCountUp(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);
  
  return count;
}

export default function Home() {
  const { data: properties, isLoading } = useProperties();
  
  const needsFundingProperties = properties?.filter(p => p.status === 'needs_funding') || [];
  const featuredProperties = needsFundingProperties.slice(0, 6);
  
  const totalEquity = properties?.reduce((sum, p) => sum + (p.estimatedEquity || 0), 0) || 0;
  
  const dealsClosed = properties?.filter(p => {
    const normalizedStatus = p.status === "funded" || p.status === "archived" ? "FUNDED" : p.status;
    return normalizedStatus === "SOLD" || normalizedStatus === "FUNDED";
  }).length || 0;
  
  const soldProperties = properties?.filter(p => p.status === "SOLD" && p.holdPeriodMonths) || [];
  const averageHoldPeriod = soldProperties.length > 0
    ? Math.round((soldProperties.reduce((sum, p) => sum + (p.holdPeriodMonths || 0), 0) / soldProperties.length) * 30.44)
    : 94;
  
  const animatedDeals = useCountUp(dealsClosed || 29, 1500, 300);
  const animatedHold = useCountUp(averageHoldPeriod, 1500, 400);
  const animatedEquity = useCountUp(Math.round(totalEquity / 100000) || 34, 1500, 500);
  const animatedInvestors = useCountUp(250, 1500, 600);
  
  const formatEquity = (value: number) => {
    if (value >= 10) return `$${(value / 10).toFixed(1)}M`;
    return `$${value * 100}k`;
  };

  return (
    <Layout>
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] w-full bg-[#FAFAF8]">
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        
        <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8 py-24 lg:py-32">
          {/* Top Context Line */}
          <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '0ms' }}>
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-medium tracking-wide">Accredited Investors Only</span>
          </div>
          
          {/* Headline */}
          <div className="max-w-[700px] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '100ms' }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 leading-[1.1]">
              Real estate opportunities<br />
              built for <span className="font-semibold">disciplined investors</span>
            </h1>
          </div>
          
          {/* Subheadline */}
          <div className="max-w-[720px] mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '200ms' }}>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
              Deal-by-deal joint ventures focused on capital protection, clean structures, and repeatable execution.
            </p>
          </div>
          
          {/* Proof Points */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '300ms' }}>
            <div className="sm:pr-8 sm:border-r border-gray-200">
              <p className="text-sm text-gray-600">10+ years foreclosure and REO exits nationwide</p>
            </div>
            <div className="sm:px-8 sm:border-r border-gray-200">
              <p className="text-sm text-gray-600">50/50 profit split at sale</p>
            </div>
            <div className="sm:pl-8">
              <p className="text-sm text-gray-600">No management or platform fees</p>
            </div>
          </div>
          
          {/* Metrics Bar */}
          <div className="flex flex-wrap items-center gap-8 sm:gap-0 mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '400ms' }}>
            <div className="sm:pr-10 sm:border-r border-gray-200">
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tabular-nums">{animatedDeals}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Deals Closed</p>
            </div>
            <div className="sm:px-10 sm:border-r border-gray-200">
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tabular-nums">{animatedHold}d</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Avg Hold</p>
            </div>
            <div className="sm:px-10 sm:border-r border-gray-200">
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tabular-nums">{formatEquity(animatedEquity)}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Equity</p>
            </div>
            <div className="sm:pl-10">
              <p className="text-2xl sm:text-3xl font-semibold text-gray-900 tabular-nums">{animatedInvestors}+</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Active Investors</p>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '500ms' }}>
            <a href="/properties">
              <Button 
                size="lg"
                className="group bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 h-14 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-base cursor-pointer"
              >
                Explore Current Opportunities
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="/how-it-works" className="group">
              <span className="text-gray-600 font-medium text-base hover:text-gray-900 transition-colors border-b border-transparent hover:border-gray-400 pb-0.5 cursor-pointer">
                How the Partnership Works
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                Current Opportunities
              </h2>
              <p className="text-gray-500 mt-3 text-lg">
                Vetted deals ready for investment
              </p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="gap-2 hover:bg-gray-50 text-gray-600 font-medium px-4 py-2 rounded-lg transition-colors">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {featuredProperties.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <p className="text-lg">No properties available yet. Check back soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 sm:py-32 bg-[#FAFAF8] border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg">
            Access exclusive real estate opportunities built for disciplined investors.
          </p>
          <Link href="/properties">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 h-14 rounded-xl shadow-sm hover:shadow-md transition-all text-base">
              Explore Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
