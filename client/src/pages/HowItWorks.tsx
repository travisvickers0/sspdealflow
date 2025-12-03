import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home, DollarSign, TrendingUp, Shield, Zap, ArrowRight, Flame } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Home,
      title: "Browse",
      subtitle: "Curated Deals",
      description: "Explore verified real estate opportunities filtered by location, returns, and investment size.",
    },
    {
      icon: DollarSign,
      title: "Analyze",
      subtitle: "Financial Details",
      description: "Review detailed metrics, market data, and transparent deal structures with institutional-grade documentation.",
    },
    {
      icon: Shield,
      title: "Invest",
      subtitle: "Commit Capital",
      description: "Secure your allocation with flexible terms and comprehensive legal protections.",
    },
    {
      icon: TrendingUp,
      title: "Earn",
      subtitle: "Track Returns",
      description: "Monitor performance in real-time with live dashboards and quarterly distribution reports.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-background pt-16 pb-20 sm:pt-20 sm:pb-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full filter blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 backdrop-blur border border-primary/20 rounded-full">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">The Modern Way to Invest</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
            Build Wealth <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-400">the Smart Way</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Four simple steps to access institutional-grade real estate opportunities. No complexity, just results.
          </p>
        </div>
      </div>

      {/* Steps Timeline - Compact Grid */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Timeline Connector - Hidden on Mobile */}
        <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="group">
                {/* Number Indicator */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">{step.subtitle}</p>
                  </div>
                </div>

                {/* Card */}
                <div className="relative p-5 sm:p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur border border-white/20 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:from-white hover:to-white/80 transition-all duration-300 group-hover:-translate-y-1">
                  {/* Icon */}
                  <div className="mb-4 p-3 bg-gradient-to-br from-primary/20 to-orange-500/10 rounded-lg w-fit">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Grid - Compact */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-gray-50" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Why We're Different</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { title: "Vetted Deals", desc: "Every property hand-picked by experts" },
              { title: "Zero Hidden Fees", desc: "Transparent pricing, upfront terms" },
              { title: "Live Tracking", desc: "Real-time dashboards & performance data" },
              { title: "250+ Investors", desc: "Join our community of accredited investors" },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 sm:p-5 bg-white/50 backdrop-blur border border-gray-200/50 rounded-lg sm:rounded-xl hover:bg-white/80 transition-all hover:shadow-md group">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-orange-500 flex-shrink-0 mt-1 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{feature.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats - Inline */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-12">
          {[
            { label: "$15M+", desc: "Deployed" },
            { label: "250+", desc: "Investors" },
            { label: "18-24%", desc: "Returns" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-orange-500/5 rounded-lg sm:rounded-xl border border-primary/20">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.label}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-primary/20 to-gray-950 py-12 sm:py-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full filter blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Start Investing?</h2>
          <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-lg mx-auto">Discover premium real estate opportunities tailored for accredited investors.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/properties">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 border-0 shadow-lg hover:shadow-xl transition-all gap-2 w-full sm:w-auto">
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-10 sm:h-12 bg-white/5 backdrop-blur-sm w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
