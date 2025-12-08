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
  Clock, 
  DollarSign,
  ChevronDown,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  Banknote
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";

function HeroSection() {
  return (
    <section className="bg-[#faf9f7] py-14 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wide">
            Investor Partnership Model
          </p>

          <h1 className="text-4xl font-bold tracking-tight mb-6 text-gray-900 leading-tight">
            How SSP partners with investors
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            SSP sources undervalued residential deals, structures transparent partnerships, 
            and delivers institutional-style returns. We handle the work. You share in the profits.
          </p>

          <Link href="/properties">
            <Button 
              size="lg"
              variant="outline"
              className="rounded-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold px-8 h-12 bg-white"
              data-testid="button-explore-properties"
            >
              Explore properties
              <ArrowRight className="ml-2 h-4 w-4" />
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
      description: "Using BPOs, market data, and local partners, we identify properties with significant equity at purchase. Every deal is vetted before it reaches investors."
    },
    {
      step: "Step 2",
      icon: Handshake,
      title: "We structure the partnership",
      description: "SSP creates a simple deal structure where you provide capital and we handle acquisition, rehab, and exit. Returns are aligned through a transparent profit split."
    },
    {
      step: "Step 3",
      icon: Hammer,
      title: "We execute and manage the project",
      description: "SSP manages renovations, timelines, and the sale. You receive regular updates and a detailed payout summary at exit."
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
        "Deal-by-deal transparency",
        "Short projected hold periods (60-120 days)",
        "Aligned incentives with simple profit splits"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisons.map((item, idx) => (
            <div 
              key={idx}
              className={`bg-white rounded-2xl shadow-sm border p-6 relative ${
                item.featured ? 'border-green-300 ring-2 ring-green-100' : 'border-slate-100'
              }`}
              data-testid={`card-comparison-${idx}`}
            >
              {item.featured && (
                <div className="absolute -top-3 left-6 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Featured
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <ul className="space-y-3">
                {item.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.featured ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-slate-600 text-sm">{bullet}</span>
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
            Our investment model
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
                "Provide capital at closing through title company",
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
      description: "Every deal is backed by titled real estate at conservative valuations. Your investment has tangible security."
    },
    {
      icon: TrendingUp,
      title: "Aligned profit structure",
      description: "SSP earns only when the project performs. No management fees, no layers of carry. We succeed together."
    },
    {
      icon: Shield,
      title: "Focused risk management",
      description: "Conservative renovation budgets, vetted local contractors, and clear exit strategies reduce downside exposure."
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
      description: "Investor funds are wired to close and SSP takes ownership of the property."
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
          <div className="absolute left-2 right-2 top-12 h-1 bg-gradient-to-r from-slate-200 via-primary to-slate-200" />
          
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center" data-testid={`timeline-step-${idx}`}>
                <div className="w-6 h-6 rounded-full bg-primary border-4 border-white shadow-md mb-8" />
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 w-full h-full flex flex-col">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">{item.day}</span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-3 leading-tight line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-grow">{item.description}</p>
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

function ReturnCalculatorSection() {
  const [investmentAmount, setInvestmentAmount] = useState(250000);
  const [projectedDealProfit, setProjectedDealProfit] = useState(80000);
  const [holdPeriodMonths, setHoldPeriodMonths] = useState(3);

  // Calculate results using the exact formula
  const remainingProfit = Math.max(projectedDealProfit - investmentAmount, 0);
  const investorProfit = remainingProfit * 0.5;
  const roiPercent = (investorProfit / investmentAmount) * 100;
  const annualizedReturn = roiPercent * (12 / holdPeriodMonths);
  const totalReturn = investmentAmount + investorProfit;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Estimate your potential return
            </h2>
            <p className="text-gray-600">
              See how your investment could perform on a typical SSP deal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Investment Amount
              </label>
              <p className="text-xs text-gray-600 mb-3">The amount you contribute to the deal at closing.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="input-investment-amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Projected Deal Profit
              </label>
              <p className="text-xs text-gray-600 mb-3">Total estimated profit after renovation and sale before the profit split.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={projectedDealProfit}
                  onChange={(e) => setProjectedDealProfit(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="input-projected-profit"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Expected Hold Period
              </label>
              <p className="text-xs text-gray-600 mb-3">Typical SSP deals range from 60 to 120 days.</p>
              <div className="relative">
                <input
                  type="number"
                  value={holdPeriodMonths}
                  onChange={(e) => setHoldPeriodMonths(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="input-hold-period"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">months</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Investor Profit</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-investor-profit">
                {formatCurrency(investorProfit)}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Return on Investment</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="text-roi">
                {roiPercent.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Annualized Return</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="text-annualized-return">
                {annualizedReturn.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Total Return at Exit</p>
              <p className="text-2xl font-bold text-green-600" data-testid="text-total-return">
                {formatCurrency(totalReturn)}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            Your capital is returned first. Remaining profit is split 50/50 between you and SSP.
          </p>
        </div>
      </div>
    </section>
  );
}

function RecentlyFundedSection() {
  const fundedDeals = [
    {
      image: "/uploads/photos/1764873312461-952360767.webp",
      address: "807 Redbud Dr",
      city: "Paola",
      state: "KS",
      purchasePrice: 224999,
      profit: 80001
    },
    {
      image: "/uploads/photos/1764873336713-601806450.jpeg",
      address: "15215 Westburn Loch Dr",
      city: "Humble",
      state: "TX",
      purchasePrice: 262000,
      profit: 113000
    },
    {
      image: "/uploads/photos/1764873354390-350658599.webp",
      address: "87 Banks Blvd",
      city: "Byhalia",
      state: "MS",
      purchasePrice: 198000,
      profit: 77000
    },
    {
      image: "/uploads/photos/1764873385641-316395001.jpg",
      address: "1314 E Brent Ct",
      city: "Casa Grande",
      state: "AZ",
      purchasePrice: 212795,
      profit: 85235
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Recently funded deals
          </h2>
          <p className="text-gray-600">
            Real properties funded by investors like you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fundedDeals.map((deal, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              data-testid={`card-funded-deal-${idx}`}
            >
              <div className="relative h-40 bg-gray-200">
                <img 
                  src={deal.image} 
                  alt={deal.address}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/></svg>';
                  }}
                />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Funded
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm">{deal.address}</h3>
                <p className="text-xs text-gray-600 mb-3">{deal.city}, {deal.state}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">${(deal.purchasePrice / 1000).toFixed(0)}k</span>
                  <span className="text-sm font-semibold text-green-600">+${(deal.profit / 1000).toFixed(0)}k equity</span>
                </div>
              </div>
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
              Browse Properties
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
              Schedule an intro call
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
        <ComparisonSection />
        <InvestmentModelSection />
        <CapitalProtectionSection />
        <TimelineSection />
        <ReturnCalculatorSection />
        <RecentlyFundedSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </Layout>
  );
}
