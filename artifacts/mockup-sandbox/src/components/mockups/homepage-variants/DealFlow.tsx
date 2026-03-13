import React from "react";
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock Data
const PLATFORM_STATS = [
  { label: "Deals Closed", value: "119", icon: Building2 },
  { label: "Avg Hold Time", value: "94 Days", icon: Clock },
  { label: "Total Equity", value: "~$1.2M", icon: TrendingUp },
  { label: "Active Investors", value: "250+", icon: Users },
];

const MOCK_PROPERTIES = [
  {
    id: 1,
    address: "1248 Oakwood Ave",
    city: "Atlanta",
    state: "GA",
    zip: "30315",
    beds: 3,
    baths: 2,
    sqft: 1850,
    purchasePrice: 185000,
    bpoValue: 265000,
    estimatedEquity: 80000,
    status: "Funding",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    address: "932 Maple Street",
    city: "Charlotte",
    state: "NC",
    zip: "28205",
    beds: 4,
    baths: 3,
    sqft: 2400,
    purchasePrice: 245000,
    bpoValue: 360000,
    estimatedEquity: 115000,
    status: "Funding",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
  },
  {
    id: 3,
    address: "550 Pine Lane",
    city: "Austin",
    state: "TX",
    zip: "78704",
    beds: 3,
    baths: 2,
    sqft: 1600,
    purchasePrice: 210000,
    bpoValue: 285000,
    estimatedEquity: 75000,
    status: "Coming Soon",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
  },
  {
    id: 4,
    address: "210 Cedar Ridge",
    city: "Nashville",
    state: "TN",
    zip: "37206",
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    purchasePrice: 280000,
    bpoValue: 410000,
    estimatedEquity: 130000,
    status: "Funding",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop"
  },
  {
    id: 5,
    address: "405 Elm Drive",
    city: "Orlando",
    state: "FL",
    zip: "32801",
    beds: 2,
    baths: 2,
    sqft: 1250,
    purchasePrice: 140000,
    bpoValue: 195000,
    estimatedEquity: 55000,
    status: "Under Contract",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"
  },
  {
    id: 6,
    address: "880 Birch Blvd",
    city: "Charleston",
    state: "SC",
    zip: "29403",
    beds: 3,
    baths: 2.5,
    sqft: 1950,
    purchasePrice: 225000,
    bpoValue: 320000,
    estimatedEquity: 95000,
    status: "Funding",
    image: "https://images.unsplash.com/photo-1600607687931-cece57736911?w=800&h=600&fit=crop"
  }
];

const HOW_IT_WORKS = [
  {
    title: "We Find the Deal",
    description: "We source off-market properties significantly below retail value.",
    icon: Search
  },
  {
    title: "Joint Venture Funding",
    description: "You provide the capital for the purchase. No hidden fees or fund structures.",
    icon: Briefcase
  },
  {
    title: "50/50 Profit Split",
    description: "We handle the rehab and sale. Profits are split 50/50 at exit.",
    icon: DollarSign
  }
];

export function DealFlow() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Stats Banner */}
      <div className="bg-red-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-y-2 gap-x-6 text-sm font-medium">
          {PLATFORM_STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <stat.icon className="w-4 h-4 opacity-80" />
              <span>
                <span className="font-bold">{stat.value}</span>{" "}
                <span className="opacity-90">{stat.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Header & Search Area */}
      <div className="bg-slate-900 text-white pt-10 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-red-500 font-semibold mb-3">
                <ShieldCheck className="w-5 h-5" />
                <span>SSP Deal Flow Platform</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Deal-by-Deal Joint Ventures
              </h1>
              <p className="text-slate-400 text-lg">
                Exclusive access to high-equity residential real estate deals for accredited investors. No fund structure. 100% transparent.
              </p>
            </div>
            
            <div className="flex-shrink-0 hidden md:block">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-md">
                Create Investor Account
              </Button>
            </div>
          </div>

          {/* Inline Search / Filter Bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by city, state, or zip..." 
                className="pl-10 bg-white text-slate-900 border-none h-12 text-base rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-12 bg-white/20 hover:bg-white/30 text-white border-none rounded-md px-6">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Deal Feed */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10 w-full flex-grow">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Current Deal Flow</h2>
          <div className="flex items-center text-sm text-slate-500 gap-4">
            <span className="hidden sm:inline-block">Showing {MOCK_PROPERTIES.length} opportunities</span>
            <select className="bg-transparent border-none text-slate-700 font-medium focus:ring-0 cursor-pointer">
              <option>Sort by: Newest</option>
              <option>Sort by: Equity (High to Low)</option>
              <option>Sort by: Purchase Price</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROPERTIES.map((property) => (
            <Card key={property.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              {/* Image Section - Smaller in this variant to emphasize numbers */}
              <div className="relative h-48 w-full bg-slate-200">
                <img 
                  src={property.image} 
                  alt={property.address} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={`${
                    property.status === 'Funding' ? 'bg-red-600 hover:bg-red-600' :
                    property.status === 'Under Contract' ? 'bg-amber-500 hover:bg-amber-500' :
                    'bg-blue-600 hover:bg-blue-600'
                  } text-white border-none px-2.5 py-1 text-xs shadow-sm`}>
                    {property.status}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">
                      {property.address}
                    </h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {property.city}, {property.state} {property.zip}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <span>{property.beds} Beds</span>
                  <span className="text-slate-300">•</span>
                  <span>{property.baths} Baths</span>
                  <span className="text-slate-300">•</span>
                  <span>{property.sqft} sqft</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 flex-grow">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mt-2">
                  
                  {/* Highlighted Metric */}
                  <div className="flex justify-between items-end mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Est. Equity Built-in</p>
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-5 h-5" />
                        {formatCurrency(property.estimatedEquity)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Purchase Price</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(property.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Target BPO</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(property.bpoValue)}</p>
                    </div>
                  </div>

                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  View Deal Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-slate-300 text-slate-700 bg-white">
            Load More Deals
          </Button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A Simpler Way to Invest</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We focus on one thing: acquiring distressed single-family properties at a steep discount and partnering with investors to fund them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left max-w-lg">
              <h3 className="text-2xl font-bold mb-2">Ready to see the full details?</h3>
              <p className="text-slate-400">Accredited investors get instant access to due diligence, comps, and investment docs.</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-md whitespace-nowrap flex-shrink-0 w-full md:w-auto">
              Get Approved Access
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-sm text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <ShieldCheck className="w-5 h-5 text-red-600" />
            <span className="font-bold text-lg">SSP Deal Flow</span>
          </div>
          <p className="mb-4">© {new Date().getFullYear()} Southern Specialty Properties. All rights reserved.</p>
          <p className="max-w-3xl mx-auto text-xs opacity-60">
            This platform is for accredited investors only. Real estate investments carry risk, including the potential loss of principal. Past performance is not indicative of future results. Information presented is estimated and subject to change without notice.
          </p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg">
          Create Investor Account
        </Button>
      </div>
    </div>
  );
}
