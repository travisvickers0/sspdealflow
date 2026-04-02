import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { 
  ArrowRight, 
  Shield,
  TrendingUp,
  Home
} from "lucide-react";

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: (action: string, event: string, params?: any) => void;
  }
}

function HeaderSection() {
  return (
    <section className="bg-[var(--cream-base)] py-14 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center">
          <div className="mb-4">
            <span className="bg-gray-50 border border-primary/20 text-primary tracking-wider px-3 py-1.5 rounded-full text-[10px] font-bold uppercase shadow-sm">
              Accredited Investors Only
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-6 text-gray-900 leading-tight">
            First-Position Real Estate<br />
            Joint Venture Partnerships
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto mb-6 leading-relaxed">
            Deal-by-deal partnerships on residential foreclosure and REO properties. No fees. No pooled capital. Profits split at sale.
          </p>

          <div className="mb-8">
            <span className="bg-white border border-gray-200 text-gray-700 tracking-wide px-4 py-2 rounded-full text-xs font-semibold shadow-sm">
              10+ years verified foreclosure & REO exits nationwide
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowFirstPositionWorksSection() {
  const cards = [
    {
      icon: Shield,
      title: "Your Capital in First Position",
      description: "Investor capital is positioned in first position through a joint venture agreement. SSP capital is subordinated."
    },
    {
      icon: Home,
      title: "Title Company Control",
      description: "Funds are wired directly to the licensed title company or closing attorney. SSP does not take custody of investor funds."
    },
    {
      icon: TrendingUp,
      title: "Simple, Aligned Structure",
      description: "50/50 profit split at sale. No fees. No preferred returns. SSP is paid only after investor capital is returned."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-[var(--cream-base)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How First-Position Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <card.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapitalFlowSection() {
  const flowSteps = [
    "Investor Capital → Title Company (First Position)",
    "Title Company (Central Control)",
    "SSP Capital (Subordinated) → Title Company",
    "Sale Proceeds → Title Company → 50/50 Distribution"
  ];

  return (
    <section className="py-16 lg:py-24 bg-[var(--cream-alt)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Capital Flow Structure
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="space-y-4">
            {flowSteps.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                </div>
                <p className="text-slate-700 text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Full visual diagram included in the Partnership Overview
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-[var(--cream-base)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/qualify">
              <Button 
                size="lg"
                className="rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-16 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-base cursor-pointer"
              >
                Schedule 30-Min Intro Call
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="/assets/SSP_Investor_Partnership_Overview.pdf" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button 
                size="lg"
                variant="outline" 
                className="rounded-lg border-primary text-primary hover:bg-primary/5 font-semibold px-10 h-16 bg-white w-full sm:w-auto text-base cursor-pointer"
              >
                Download Partnership Overview
              </Button>
            </a>
          </div>

          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            Accredited investors only. Not a solicitation. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function MetaLanding() {
  // Track ViewContent event when page loads
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent');
    }
  }, []);

  return (
    <Layout creamShell>
      <main>
        <HeaderSection />
        <HowFirstPositionWorksSection />
        <CapitalFlowSection />
        <CTASection />
      </main>
    </Layout>
  );
}

