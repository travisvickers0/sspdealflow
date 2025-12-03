import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home, DollarSign, TrendingUp, Shield, Users, ArrowRight, Zap, Lock, BarChart3 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Browse Properties",
      description: "Explore our curated marketplace of pre-vetted real estate opportunities. Filter by location, investment size, and expected returns.",
      icon: Home,
    },
    {
      number: "02",
      title: "Review Deal Terms",
      description: "Analyze detailed financial models, property metrics, and investment structures. Access transparent deal documentation and market comparables.",
      icon: DollarSign,
    },
    {
      number: "03",
      title: "Commit Capital",
      description: "Submit your investment commitment with flexible allocation options. Secure your position in high-quality deals with institutional-grade protections.",
      icon: Shield,
    },
    {
      number: "04",
      title: "Track Returns",
      description: "Monitor your portfolio in real-time. Access performance dashboards, quarterly updates, and comprehensive reporting on all your investments.",
      icon: TrendingUp,
    },
  ];

  const features = [
    {
      title: "Curated Opportunities",
      description: "Every property is rigorously vetted by our team of real estate experts and investment professionals.",
      icon: BarChart3,
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees. Know exactly what you're investing in with clear, upfront deal structures.",
      icon: Lock,
    },
    {
      title: "Real-Time Dashboards",
      description: "Track performance metrics, distributions, and portfolio analytics in one unified platform.",
      icon: Zap,
    },
    {
      title: "Investor Community",
      description: "Join 250+ accredited investors accessing premium real estate opportunities together.",
      icon: Users,
    },
  ];

  return (
    <Layout>
      {/* Hero Section - Condensed */}
      <div className="relative min-h-[50vh] w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-3 text-gray-900 leading-tight">
              How It Works
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
              Four simple steps to access premium real estate investment opportunities and build wealth through institutional-grade deals.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section - Compact */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Card */}
                <div className="relative p-5 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 pt-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
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

      {/* Features Section - Compact */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1">
              Why Choose Us
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-light">
              We combine modern technology with institutional expertise to make real estate investing accessible, transparent, and profitable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="p-4 sm:p-5 bg-white rounded-lg sm:rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section - Inline Compact */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-lg sm:rounded-xl border border-primary/10">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">$15M+</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Capital Deployed</p>
          </div>
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-lg sm:rounded-xl border border-primary/10">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">250+</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Investors</p>
          </div>
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-lg sm:rounded-xl border border-primary/10">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">18-24%</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Avg Returns</p>
          </div>
        </div>

        {/* Mini Features Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: "Vetted Properties", value: "Every deal verified by experts" },
            { label: "Transparent Terms", value: "No hidden fees or surprises" },
            { label: "Live Tracking", value: "Real-time performance dashboards" },
            { label: "Legal Protection", value: "Institutional-grade agreements" },
          ].map((item, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-semibold text-primary mb-1">{item.label}</p>
              <p className="text-xs text-gray-600">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section - Compact */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2 sm:mb-3 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-5 sm:mb-6 max-w-2xl mx-auto font-light">
            Browse our marketplace and discover high-quality real estate opportunities designed for accredited investors.
          </p>
          <Link href="/properties">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 border-0 shadow-lg hover:shadow-xl transition-all gap-2 text-sm sm:text-base">
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
