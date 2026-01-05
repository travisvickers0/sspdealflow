import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Search, 
  Handshake, 
  Hammer, 
  Shield, 
  TrendingUp, 
  Home, 
  Building2,
  Users,
  CheckCircle2
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";

function HeroSection() {
  return (
    <section className="relative bg-[#faf9f7] py-20 lg:py-28 overflow-hidden">
      {/* Subtle background image/texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <img 
          src={airbnbHero} 
          alt="background texture" 
          className="w-full h-full object-cover grayscale"
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center">
          <p className="text-sm font-bold text-primary mb-6 uppercase tracking-[0.2em]">
            Investor Partnership Model
          </p>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-[1.1]">
            Institutional-Grade Foreclosures <br className="hidden md:block" />
            <span className="text-primary/90">for Private Investors</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Deal-by-deal, first-position joint venture partnerships on residential foreclosure and REO properties. No fees. No pooled capital. Profits split at&nbsp;sale.
          </p>

          <Link href="/properties">
            <Button 
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-10 h-14 shadow-xl hover:shadow-2xl transition-all active:scale-95"
              data-testid="button-explore-properties"
            >
              Explore live deals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  const steps = [
    {
      step: "Step 1",
      icon: Search,
      title: "We source undervalued deals",
      description: "Using BPOs, market data, and local partners, SSP identifies residential foreclosure and REO properties with meaningful equity at purchase. Only vetted opportunities are shared with investors."
    },
    {
      step: "Step 2",
      icon: Handshake,
      title: "We structure the partnership",
      description: "Each opportunity is structured as a first-position joint venture. Investors fund the purchase price directly through a licensed title company or closing attorney. SSP advances rehab and holding costs and is subordinated to investor capital. SSP does not take custody of investor funds at any point."
    },
    {
      step: "Step 3",
      icon: Hammer,
      title: "We execute and manage the project",
      description: "SSP manages renovations, timelines, and the sale of the property. At closing, investor capital is returned first, then profits are distributed per the joint venture agreement."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4 tracking-tight">
            Three steps to partnering with SSP
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A straightforward path from discovery to profit distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
              data-testid={`card-step-${idx + 1}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">{item.step}</span>
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const comparisons = [
    {
      title: "Traditional Rentals",
      description: "Own and manage property yourself",
      bullets: [
        "Active management required",
        "Tenant risk and vacancies",
        "Slow equity growth over years"
      ],
      featured: false
    },
    {
      title: "Syndications & Funds",
      description: "Pool capital with other investors",
      bullets: [
        "Limited visibility into individual deals",
        "Multi-year lockups typical",
        "Management fees and layers of carry"
      ],
      featured: false
    },
    {
      title: "SSP Deal Flow",
      description: "Partner directly on vetted deals",
      bullets: [
        "Partner directly on individual properties",
        "First-position joint venture structure",
        "Short projected hold periods",
        "No fees. No pooled capital. No carry"
      ],
      featured: true
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How SSP compares to other investments
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how our model stacks up against traditional real estate investing options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comparisons.map((item, idx) => (
            <div 
              key={idx}
              className={`bg-white rounded-2xl p-8 relative transition-all duration-300 ${
                item.featured 
                  ? 'border-2 border-emerald-400 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] scale-105 z-10' 
                  : 'border border-slate-100 shadow-sm opacity-90'
              }`}
              data-testid={`card-comparison-${idx}`}
            >
              {item.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                  Best Value
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 font-medium">{item.description}</p>
              <ul className="space-y-3">
                {item.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.featured ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-slate-600 text-sm font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function InvestmentModelSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Our partnership model
          </h2>
          <p className="text-gray-600">
            Simple, transparent, and aligned with investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">What SSP does</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Source and underwrite investment-ready properties",
                "Negotiate purchase terms and manage acquisition",
                "Advance all rehab funds from our own capital",
                "Manage renovations, contractors, and inspections",
                "Cover holding costs (taxes, insurance, utilities)",
                "List, market, and sell the property",
                "Handle the entire closing and payout process"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">What investors do</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Review live deals on the SSP platform",
                "Choose which opportunities to fund",
                "Fund the full purchase price by wiring directly to the closing attorney or title company",
                "Monitor progress through the investor dashboard",
                "Receive profit share at exit"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapitalProtectionSection() {
  const protections = [
    {
      icon: Home,
      title: "Real assets as collateral",
      description: "Each partnership is backed by titled residential real estate acquired at conservative valuations. Investor capital is positioned in first position through the joint venture agreement."
    },
    {
      icon: TrendingUp,
      title: "Aligned profit structure",
      description: "SSP earns only after investor capital is returned and profits are realized. There are no management fees, preferred returns, or layers of carry."
    },
    {
      icon: Shield,
      title: "Focused risk management",
      description: "Conservative rehab scopes, margin buffers, and defined exit strategies are used to manage downside risk and protect capital."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How your capital is protected
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built-in structure, security, and clear downside protections give you confidence in every deal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {protections.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center"
              data-testid={`card-protection-${idx}`}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  const timeline = [
    {
      day: "Day 1",
      title: "Capital committed and property purchased",
      description: "Investor funds are wired to close and SSP takes ownership of the property. Funds are wired directly to the title company at closing."
    },
    {
      day: "Days 30-60",
      title: "Renovation and value-add work",
      description: "SSP manages renovations, inspections, and listing preparation."
    },
    {
      day: "Days 60-120",
      title: "Property listed and sold",
      description: "SSP lists the property, negotiates offers, and closes the sale."
    },
    {
      day: "Post-Closing",
      title: "Profit distribution",
      description: "Costs and capital are repaid, then profits are split per deal terms."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            What a typical deal timeline looks like
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Most deals follow a 60 to 120 day cycle from acquisition to exit.
          </p>
        </div>

        <div className="hidden md:block relative px-2">
          <div className="absolute left-2 right-2 top-12 h-1.5 bg-gradient-to-r from-slate-200 via-primary to-slate-200" />
          
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center" data-testid={`timeline-step-${idx}`}>
                <div className="w-8 h-8 rounded-full bg-primary border-[6px] border-white shadow-lg mb-8 ring-1 ring-primary/20" />
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 w-full h-full flex flex-col group hover:border-primary/30 transition-colors">
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{item.day}</span>
                  <h3 className="text-sm font-bold text-gray-900 mt-3 mb-3 leading-tight line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-grow font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden space-y-6">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-6" data-testid={`timeline-mobile-step-${idx}`}>
              <div className="flex flex-col items-center pt-2">
                <div className="w-5 h-5 rounded-full bg-primary border-3 border-white shadow-md" />
                {idx < timeline.length - 1 && <div className="w-1 flex-grow bg-gradient-to-b from-primary to-slate-200 mt-3 mb-3" />}
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex-1 flex flex-col">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">{item.day}</span>
                <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-3 leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed flex-grow">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "Who holds title to the property?",
      answer: "Properties are acquired and held by Southern Specialty Properties LLC. Investor capital is protected through a first-position joint venture structure."
    },
    {
      question: "Where does my money go at closing?",
      answer: "Investor funds are wired directly to the licensed title company or closing attorney, not to SSP operating accounts."
    },
    {
      question: "Who can invest with SSP?",
      answer: "SSP opportunities are available to accredited investors as defined by SEC regulations. This typically includes individuals with a net worth exceeding $1 million (excluding primary residence) or annual income exceeding $200,000 ($300,000 with spouse) for the past two years."
    },
    {
      question: "How long is my capital typically deployed?",
      answer: "Most deals have a target hold period of 60 to 120 days, from acquisition through sale. This short-term deployment allows for multiple investment cycles per year and provides more liquidity compared to traditional real estate investments."
    },
    {
      question: "How do I track my deals?",
      answer: "All investors have access to the SSP Deal Flow dashboard where you can monitor your active investments, view property updates, track renovation progress, and see detailed financial breakdowns for each deal."
    },
    {
      question: "What happens if a deal doesn't perform as expected?",
      answer: "SSP structures deals with built-in protections. Your capital is returned first before any profit splits. In slower deals, our minimum return guarantee ensures you still receive a baseline return on your investment."
    },
    {
      question: "How are profits distributed?",
      answer: "Upon sale of the property, proceeds flow through the title company. Your original capital is returned first, followed by your share of the profits (typically 50% of net profit or guaranteed minimum, whichever is greater)."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Common questions from new investors
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem 
              key={idx} 
              value={`faq-${idx}`}
              className="bg-white rounded-xl border border-slate-100 px-6 shadow-sm"
              data-testid={`accordion-faq-${idx}`}
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50 to-white">
      <div className="hidden sm:block absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl animate-pulse" />
      <div className="hidden sm:block absolute bottom-10 right-32 w-72 h-72 bg-orange-200/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Ready to see live opportunities?
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
          Join accredited investors already partnering with SSP on real estate deals nationwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties">
            <Button 
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-14 shadow-lg hover:shadow-xl transition-all text-base"
              data-testid="button-browse-properties"
            >
              View Live Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="https://calendly.com/sspdealflow/30min" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg"
              variant="outline" 
              className="rounded-full border-gray-300 text-gray-900 hover:bg-white font-semibold px-10 h-14 bg-white/60 backdrop-blur-sm text-base cursor-pointer"
              data-testid="button-schedule-call"
            >
              Schedule Intro Call
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  return (
    <Layout>
      <main>
        <HeroSection />
        <StepsSection />
        <CapitalProtectionSection />
        <ComparisonSection />
        <InvestmentModelSection />
        <TimelineSection />
        <RecentlyFundedSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </Layout>
  );
}
