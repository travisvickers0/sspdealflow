import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Home, DollarSign, TrendingUp, Shield, Users, ArrowRight } from "lucide-react";

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
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees. Know exactly what you're investing in with clear, upfront deal structures.",
    },
    {
      title: "Real-Time Dashboards",
      description: "Track performance metrics, distributions, and portfolio analytics in one unified platform.",
    },
    {
      title: "Investor Community",
      description: "Join 250+ accredited investors accessing premium real estate opportunities together.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-screen lg:min-h-[80vh] w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white pt-20 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 text-gray-900 leading-tight">
              How It Works
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed font-light">
              Four simple steps to access premium real estate investment opportunities and build wealth through institutional-grade deals.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2" />
                )}

                {/* Card */}
                <div className="relative p-6 sm:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 pt-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Why Choose Us
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-light">
              We combine modern technology with institutional expertise to make real estate investing accessible, transparent, and profitable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">$15M+</p>
            <p className="text-sm sm:text-base text-gray-600">Capital Deployed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">250+</p>
            <p className="text-sm sm:text-base text-gray-600">Active Investors</p>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">18-24%</p>
            <p className="text-sm sm:text-base text-gray-600">Avg Returns</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 sm:mb-6 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto font-light">
            Browse our marketplace and discover high-quality real estate opportunities designed for accredited investors.
          </p>
          <Link href="/properties">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 border-0 shadow-lg hover:shadow-xl transition-all gap-2">
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
