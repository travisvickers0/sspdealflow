import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Handshake, 
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Briefcase,
  ChevronRight,
  Mail,
  Phone
} from "lucide-react";

// Mock Data
const PROPERTIES = [
  {
    id: 1,
    address: "1428 Elm Street, Atlanta, GA",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    purchasePrice: 215000,
    bpoValue: 345000,
    estEquity: 130000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    status: "Funding Open",
    featured: true
  },
  {
    id: 2,
    address: "804 Oak Drive, Charlotte, NC",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    purchasePrice: 165000,
    bpoValue: 240000,
    estEquity: 75000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    status: "Funding Open",
    featured: false
  },
  {
    id: 3,
    address: "920 Pine Lane, Austin, TX",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    purchasePrice: 285000,
    bpoValue: 410000,
    estEquity: 125000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    status: "Funding Open",
    featured: false
  },
  {
    id: 4,
    address: "512 Maple Court, Nashville, TN",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    purchasePrice: 190000,
    bpoValue: 290000,
    estEquity: 100000,
    beds: 3,
    baths: 2,
    sqft: 2100,
    status: "Recently Closed",
    featured: false
  },
  {
    id: 5,
    address: "305 Cedar Way, Charleston, SC",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
    purchasePrice: 145000,
    bpoValue: 210000,
    estEquity: 65000,
    beds: 3,
    baths: 1.5,
    sqft: 1500,
    status: "Recently Closed",
    featured: false
  },
  {
    id: 6,
    address: "719 Birch Street, Orlando, FL",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    purchasePrice: 320000,
    bpoValue: 480000,
    estEquity: 160000,
    beds: 5,
    baths: 4,
    sqft: 3200,
    status: "Recently Closed",
    featured: false
  }
];

const STATS = [
  { label: "Deals Closed", value: "119", icon: Building2 },
  { label: "Avg Hold Time", value: "94 Days", icon: TrendingUp },
  { label: "Total Equity", value: "~$1.2M", icon: Briefcase },
  { label: "Active Investors", value: "250+", icon: Handshake },
];

const VALUE_PROPS = [
  {
    title: "10+ Years Verified Exits",
    description: "A decade of proven performance, successful flips, and consistent returns for our partners.",
    icon: ShieldCheck
  },
  {
    title: "Deal-by-Deal JV Structure",
    description: "You choose exactly which properties to fund. No blind pools, no committed capital requirements.",
    icon: Building2
  },
  {
    title: "Zero Hidden Fees",
    description: "We make money when you make money. 100% transparent operations from acquisition to sale.",
    icon: Maximize
  },
  {
    title: "50/50 Profit Split",
    description: "True partnership. After capital is returned, all profits are split evenly at the closing table.",
    icon: Handshake
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

export function Premium() {
  const featuredProperty = PROPERTIES.find(p => p.featured) || PROPERTIES[0];
  const secondaryProperties = PROPERTIES.filter(p => !p.featured).slice(0, 2);
  const otherProperties = PROPERTIES.filter(p => !p.featured).slice(2);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-bold text-xl tracking-tighter shadow-lg shadow-red-600/20">
              SSP
            </div>
            <span className="font-['Space_Grotesk'] text-2xl tracking-wide font-semibold">Deal Flow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#" className="hover:text-emerald-400 transition-colors">Current Offerings</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Track Record</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-5 h-auto text-base rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              Apply to Join
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
            <div className="space-y-1.5 w-6">
              <span className="block w-full h-0.5 bg-current"></span>
              <span className="block w-full h-0.5 bg-current"></span>
              <span className="block w-2/3 h-0.5 bg-current"></span>
            </div>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 md:pt-48 md:pb-48 flex items-center min-h-[90vh] bg-zinc-950 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop" 
            alt="Luxury Real Estate" 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-full text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Exclusively for Accredited Investors
            </div>
            <h1 className="font-['Space_Grotesk'] text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.05] mb-6">
              Co-invest in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 italic">off-market</span> real estate.
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 font-light max-w-2xl mb-10 leading-relaxed">
              Partner directly with our acquisition team on high-margin flips. No fund structures. No hidden fees. Just direct deal-by-deal joint ventures with a 50/50 profit split.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-6 h-auto text-lg rounded-2xl transition-all duration-300">
                View Active Deals
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-zinc-600 text-white hover:bg-white/5 hover:text-white px-8 py-6 h-auto text-lg rounded-2xl backdrop-blur-sm">
                View Track Record
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800/50 bg-zinc-950/60 backdrop-blur-2xl z-20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-800/50">
              {STATS.map((stat, idx) => (
                <div key={idx} className={`flex items-center gap-4 ${idx !== 0 ? 'pl-8' : ''}`}>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-['Space_Grotesk'] text-white tracking-tight">{stat.value}</div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wide font-semibold mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl text-zinc-900 mb-6">A Partnership Built on Alignment</h2>
            <p className="text-lg text-zinc-500">
              We don't raise a blind fund and charge management fees. We put our expertise to work on specific assets, and we invite partners to fund the capital while we execute the turnaround.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {VALUE_PROPS.map((prop, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="mb-6 inline-block p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <prop.icon className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{prop.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Offerings - Magazine Layout */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-emerald-500 font-bold tracking-wide uppercase text-sm mb-3">Investment Opportunities</div>
              <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl text-zinc-900">Current Offerings</h2>
            </div>
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 pl-0 md:pl-4">
              View all opportunities <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Asymmetric Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Featured Large Card */}
            <div className="lg:col-span-8">
              <Card className="overflow-hidden border-0 shadow-xl rounded-3xl group h-full cursor-pointer flex flex-col">
                <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-emerald-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg">
                      {featuredProperty.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500 z-0"></div>
                  <img 
                    src={featuredProperty.image} 
                    alt={featuredProperty.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <CardContent className="p-8 md:p-10 flex-grow bg-white flex flex-col justify-between relative">
                  <div className="absolute top-0 right-10 -translate-y-1/2 w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2 font-['Space_Grotesk']">{featuredProperty.address}</h3>
                    <div className="flex items-center gap-6 text-sm text-zinc-500 mb-8 border-b border-zinc-100 pb-6">
                      <span className="flex items-center"><Bed className="w-4 h-4 mr-2 text-zinc-400"/> {featuredProperty.beds} Beds</span>
                      <span className="flex items-center"><Bath className="w-4 h-4 mr-2 text-zinc-400"/> {featuredProperty.baths} Baths</span>
                      <span className="flex items-center"><Maximize className="w-4 h-4 mr-2 text-zinc-400"/> {featuredProperty.sqft} SqFt</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1 font-semibold">Purchase Price</div>
                        <div className="text-2xl font-bold font-['Space_Grotesk'] text-zinc-900">{formatCurrency(featuredProperty.purchasePrice)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1 font-semibold">BPO Value</div>
                        <div className="text-2xl font-bold font-['Space_Grotesk'] text-zinc-900">{formatCurrency(featuredProperty.bpoValue)}</div>
                      </div>
                      <div className="col-span-2 md:col-span-1 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-xl">
                        <div className="text-xs text-zinc-600 uppercase tracking-wide mb-1 font-semibold">Est. Equity Built</div>
                        <div className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-600">{formatCurrency(featuredProperty.estEquity)}</div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full sm:w-auto self-start bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl py-6 px-8 text-base">
                    View Deal Details
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Two Smaller Cards Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {secondaryProperties.map(property => (
                <Card key={property.id} className="overflow-hidden border-0 shadow-lg rounded-3xl group cursor-pointer h-full flex flex-col">
                  <div className="relative h-[200px] overflow-hidden">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {property.status}
                      </span>
                    </div>
                    <img 
                      src={property.image} 
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <CardContent className="p-6 bg-white flex-grow">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4 line-clamp-1">{property.address}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                        <span className="text-zinc-500">Purchase</span>
                        <span className="font-semibold font-['Space_Grotesk'] text-zinc-900">{formatCurrency(property.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                        <span className="text-zinc-500">ARV (BPO)</span>
                        <span className="font-semibold font-['Space_Grotesk'] text-zinc-900">{formatCurrency(property.bpoValue)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm bg-emerald-50 rounded-lg p-2 border-l-2 border-emerald-400">
                        <span className="text-zinc-700 font-medium">Est. Equity</span>
                        <span className="font-bold font-['Space_Grotesk'] text-emerald-600">{formatCurrency(property.estEquity)}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent hover:text-emerald-500 font-semibold group-hover:translate-x-1 transition-transform">
                      Details <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl text-zinc-900 mb-6">The Investment Process</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-zinc-200 z-0"></div>

            {[
              {
                step: "01",
                title: "Select a Deal",
                desc: "Review our heavily vetted, off-market properties. We provide the purchase price, renovation budget, and conservative ARV."
              },
              {
                step: "02",
                title: "Fund & Execute",
                desc: "You fund the acquisition and rehab. We handle 100% of the project management, contracting, and daily operations."
              },
              {
                step: "03",
                title: "Sell & Split",
                desc: "Upon sale, your initial capital is returned first. Then, all remaining profits are split 50/50. Average hold time is just 94 days."
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto bg-zinc-950 text-white rounded-2xl text-xl font-bold flex items-center justify-center shadow-xl shadow-zinc-900/10 mb-8 font-['Space_Grotesk']">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4 font-['Space_Grotesk']">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button className="bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-2xl px-8 py-6 h-auto text-lg transition-colors">
              Read the Full Blueprint
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        {/* Subtle texture/pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212, 212, 216, 1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-6xl text-white mb-8">Ready to deploy capital into high-yield physical assets?</h2>
          <p className="text-xl text-zinc-300 mb-12 font-light">
            Join 250+ accredited investors currently partnering with SSP Deal Flow on lucrative real estate joint ventures.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow rounded-xl bg-white/5 border border-zinc-800 text-white px-6 py-4 outline-none focus:border-emerald-400 transition-colors placeholder:text-zinc-500"
            />
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 px-8 py-4 h-auto text-lg rounded-xl transition-all duration-300 whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Apply Now
            </Button>
          </form>
          <div className="mt-6 text-sm text-zinc-500">
            *Platform limited to verified accredited investors only.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white tracking-tighter">
                SSP
              </div>
              <span className="font-['Space_Grotesk'] text-xl text-white tracking-wide">Deal Flow</span>
            </div>
            <p className="mb-8 max-w-sm">
              Premium real estate joint ventures for accredited investors. Direct ownership, complete transparency, aligned incentives.
            </p>
            <div className="flex gap-4">
              {/* Social icons would go here, using simple circles for mockup */}
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-400 transition-colors cursor-pointer"><Mail className="w-4 h-4" /></div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-400 transition-colors cursor-pointer"><Phone className="w-4 h-4" /></div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-400 transition-colors cursor-pointer"><MapPin className="w-4 h-4" /></div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Current Deals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Past Performance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How JV Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investor Login</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Risk Disclosure</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accreditation Info</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-900 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Southern Specialty Properties. All rights reserved.</p>
          <p className="text-xs text-zinc-600 max-w-2xl text-center md:text-right">
            Information presented is for educational purposes and does not constitute an offer to sell securities. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
