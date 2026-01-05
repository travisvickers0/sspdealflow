import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Calendar, ShieldCheck, Lock, Building2, Handshake, DollarSign, TrendingUp, ArrowDown, Scale, Check } from "lucide-react";
import { Link } from "wouter";

export default function MetaLanding() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* No navigation menu - focused experience */}
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Headline Section with Gradient Background */}
        <div className="relative text-center mb-20 pb-16">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-16 -mb-16 bg-gradient-to-br from-[#FAF9F7] via-[#F5F4F2] to-[#F0EFED] rounded-3xl opacity-80" />
          <div 
            className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-16 -mb-16 rounded-3xl opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`,
            }}
          />
          <div className="relative">
            {/* Trust Badge - Above Headline */}
            <div className="mb-6">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                ESTABLISHED RECORD | 10+ YEARS OF EXITS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              First-Position Real Estate Joint Ventures
            </h1>
            {/* Trust Strip - Checklist Style */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 bg-gray-50/80 border border-gray-200/50 rounded-full">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">10+ years verified foreclosure & REO exits nationwide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Deal-by-deal joint ventures</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">No fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">50/50 profit split at sale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* First-Position Explanation */}
        <div className="mb-20 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            How First-Position Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl border border-[#D4AF37]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200/50 mb-4">
                <Lock className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Your Capital in First Position</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your capital is secured in first position via joint venture agreement. SSP capital is subordinated.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl border border-[#D4AF37]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 border border-blue-200/50 mb-4">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Title Company Control</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                All funds flow through licensed title company. No direct transfers to SSP operating accounts.
              </p>
            </div>
            <div className="p-8 bg-white rounded-2xl border border-[#D4AF37]/20 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-200/50 mb-4">
                <Handshake className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Simple Structure</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                50/50 profit split. No fees. No preferred returns. Transparent and straightforward.
              </p>
            </div>
          </div>
        </div>

        {/* Capital Flow Diagram Placeholder */}
        <div className="mb-20 p-10 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Capital Flow Structure</h3>
            {/* Vertical stack for mobile, horizontal for desktop */}
            <div className="max-w-5xl mx-auto">
              {/* Mobile: Vertical Stack */}
              <div className="block md:hidden space-y-5">
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">Investor Capital → Title Company (First Position)</p>
                  </div>
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0.5 h-5 bg-gray-300" />
                </div>
                
                <div className="relative">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-[3px] border-blue-400 rounded-xl shadow-lg ring-2 ring-blue-200 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-blue-700 flex-shrink-0" />
                    <div>
                      <p className="text-base font-bold text-gray-900">Title Company</p>
                      <p className="text-xs text-gray-600">Central Control</p>
                    </div>
                    <Lock className="w-4 h-4 text-blue-600 ml-auto" />
                  </div>
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0.5 h-5 bg-gray-300" />
                </div>
                
                <div className="relative">
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl shadow-sm opacity-90 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-700">SSP Capital (Subordinated) → Title Company</p>
                  </div>
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0.5 h-5 bg-gray-300" />
                </div>
                
                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-900">Sale Proceeds → Title Company → 50/50 Distribution</p>
                </div>
              </div>

              {/* Desktop: Horizontal Flow */}
              <div className="hidden md:flex items-center justify-between gap-4">
                <div className="flex-1 p-5 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm flex flex-col items-center gap-2">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                  <p className="text-xs font-semibold text-gray-900 text-center">Investor Capital</p>
                  <p className="text-[10px] text-gray-600 text-center">First Position</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                
                <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-[3px] border-blue-400 rounded-xl shadow-lg ring-2 ring-blue-200 flex flex-col items-center gap-2 relative">
                  <div className="absolute -top-2 -right-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <Scale className="w-7 h-7 text-blue-700" />
                  <p className="text-sm font-bold text-gray-900 text-center">Title Company</p>
                  <p className="text-[10px] text-gray-600 text-center">Central Control</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                
                <div className="flex-1 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl shadow-sm opacity-90 flex flex-col items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <p className="text-xs font-semibold text-gray-700 text-center">SSP Capital</p>
                  <p className="text-[10px] text-gray-500 text-center">Subordinated</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                
                <div className="flex-1 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm flex flex-col items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-amber-700" />
                  <p className="text-xs font-semibold text-gray-900 text-center">Sale Proceeds</p>
                  <p className="text-[10px] text-gray-600 text-center">50/50 Distribution</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6 italic">
              Visual diagram available in Partnership Overview PDF
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <Link href="/qualify" className="w-full sm:w-auto">
            <Button 
              size="lg"
              className="w-full sm:w-auto min-w-[360px] h-20 sm:h-20 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-lg sm:text-xl px-8 sm:px-10 transform hover:scale-[1.02]"
            >
              Request Partnership Access
              <Calendar className="ml-3 h-6 w-6" />
            </Button>
          </Link>
          
          <a href="/api/docs/SSP_Investor_Partnership_Overview.md" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[360px] h-20 sm:h-20 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50/50 font-semibold text-lg sm:text-xl shadow-sm hover:shadow-md transition-all bg-transparent px-8 sm:px-10"
            >
              <Download className="mr-3 h-6 w-6" />
              Download Partnership Overview
            </Button>
          </a>
        </div>

        {/* Trust Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-500">
            First-Position Capital Structure
          </p>
        </div>

        {/* Compliance Disclaimer */}
        <div className="border-t border-gray-200 pt-12">
          <p className="text-xs text-gray-500 text-center max-w-2xl mx-auto leading-relaxed">
            Accredited investors only. Not a solicitation. Past performance does not guarantee future results. Investments involve risk of loss.
          </p>
        </div>
      </main>
    </div>
  );
}

