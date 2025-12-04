import { Layout } from "@/components/Layout";
import { properties, commitments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PropertyGallery } from "@/components/PropertyGallery";
import { useRoute, Link } from "wouter";
import { MapPin, ChevronLeft, CheckCircle2, Home as HomeIcon, Ruler, DollarSign, FileText, Share2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const property = properties.find((p) => p.slug === params?.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (!property) return <div>Property not found</div>;

  const fundedPercent = Math.min(100, Math.max(0, ((property.purchase_price + property.rehab_budget - property.equity_available) / (property.purchase_price + property.rehab_budget)) * 100));

  // Mock JV Calculator State
  const [investorContribution, setInvestorContribution] = useState(50000);
  const totalCost = property.purchase_price + property.rehab_budget;
  const projectedProfit = property.arv - totalCost; // Simplified
  const investorShare = (investorContribution / totalCost) * projectedProfit; // Simplified logic

  return (
    <Layout>
      <div className="w-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Marketplace
          </Link>
        </div>

        {/* Header with Address */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{property.address}</h1>
              <p className="text-lg text-gray-500 mt-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                <Heart className="w-4 h-4 text-gray-400" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Airbnb-Style Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div className="md:col-span-3 h-full relative group cursor-pointer">
              <img 
                src={property.images[0]} 
                className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                alt="Property Front" 
              />
            </div>
            
            {/* Right side gallery images */}
            <div className="hidden md:flex flex-col gap-4 h-full">
              <div className="h-1/2 relative group cursor-pointer overflow-hidden rounded-lg">
                <img 
                  src={property.images[1] || property.images[0]} 
                  className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                  alt="Gallery" 
                />
              </div>
              <div className="h-1/2 relative group cursor-pointer overflow-hidden rounded-lg">
                <img 
                  src={property.images[2] || property.images[0]} 
                  className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                  alt="Gallery" 
                />
                <button className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 text-xs font-semibold rounded-lg shadow hover:bg-white transition">
                  View all photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 flex flex-wrap justify-between items-center gap-8">
            
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Purchase Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${property.purchase_price.toLocaleString()}</p>
            </div>

            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Rehab Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${property.rehab_budget.toLocaleString()}</p>
            </div>

            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">ARV</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${property.arv.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 px-8 py-4 rounded-lg border border-green-100">
              <p className="text-xs text-green-700 uppercase font-bold tracking-wider">Est. Profit</p>
              <p className="text-3xl font-extrabold text-green-600 mt-2">${(property.arv - totalCost).toLocaleString()}</p>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About this Property */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">About this Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                  <br /><br />
                  This opportunity represents a prime value-add scenario in a rapidly appreciating neighborhood. 
                  Our team has secured this off-market deal at significantly below replacement cost. 
                  The renovation plan includes a full cosmetic update, modernizing the kitchen and baths, 
                  and enhancing curb appeal to maximize resale value.
                </p>
              </div>

              {/* Property Specs */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Bedrooms</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{property.beds}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Bathrooms</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{property.baths}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Square Feet</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{property.sqft.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Location Map with Comps */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Location & Comps Map</h2>
                <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm border border-blue-200/50">
                  {/* Map Grid Background */}
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#0066cc 1px, transparent 1px)", backgroundSize: "40px 40px"}}></div>
                  
                  {/* Map Visualization with Property & Comps */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Property Pin (Center) */}
                    <div className="absolute flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center border-4 border-white animate-pulse">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="mt-2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-md whitespace-nowrap">
                        {property.address}
                      </div>
                    </div>

                    {/* Comps Pins (Scattered around) */}
                    <div className="absolute inset-0">
                      {property.comps.map((comp, idx) => {
                        const offsetX = Math.sin(idx * 1.2) * 120;
                        const offsetY = Math.cos(idx * 1.2) * 100;
                        return (
                          <div
                            key={comp.id}
                            className="absolute flex flex-col items-center"
                            style={{
                              left: `calc(50% + ${offsetX}px)`,
                              top: `calc(50% + ${offsetY}px)`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <div className="w-6 h-6 bg-gray-600 rounded-full shadow-lg flex items-center justify-center border-3 border-white">
                              <span className="text-white text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="mt-1 px-2 py-0.5 bg-gray-700 text-white text-xs rounded shadow-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                              {comp.address}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 space-y-2 bg-white/90 backdrop-blur p-3 rounded-lg shadow-md text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      <span className="font-semibold">Subject Property</span>
                    </div>
                    {property.comps.slice(0, 3).map((comp, idx) => (
                      <div key={comp.id} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                        <span>Comp</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comparable Sales */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Comparable Sales</h2>
                <div className="space-y-3">
                  {property.comps.map((comp) => (
                    <div key={comp.id} className="p-4 bg-white border border-gray-200/50 rounded-lg hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{comp.address}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>{comp.beds} bed{comp.beds !== 1 ? 's' : ''}</span>
                            <span>{comp.baths} bath{comp.baths !== 1 ? 's' : ''}</span>
                            <span>{comp.sqft.toLocaleString()} sqft</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">${comp.price.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Sold {new Date(comp.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="relative">
              <div className="sticky top-8 space-y-6">
                {/* Investment Status Card */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-lg shadow-gray-200/50 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Investment Status</h3>
                      <p className="text-sm text-gray-500 mt-1">Closing: {new Date(property.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white ${
                      property.status === 'needs_funding' ? 'bg-amber-500' :
                      property.status === 'committed' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}>
                      {property.status === 'needs_funding' ? 'Needs Funding' :
                       property.status === 'committed' ? 'Funding Committed' :
                       'Funded'}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-900">{Math.round(fundedPercent)}% Funded</span>
                      <span className="text-gray-500">${totalCost.toLocaleString()} Goal</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          property.status === 'needs_funding' ? 'bg-amber-500' :
                          property.status === 'committed' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`} 
                        style={{width: `${fundedPercent}%`}}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Min. Invest</p>
                      <p className="font-semibold text-gray-900 mt-1">$25,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Equity Left</p>
                      <p className="font-semibold text-green-600 mt-1">${property.equity_available.toLocaleString()}</p>
                    </div>
                  </div>

                  <Link href={`/invest/${property.id}`} className="block">
                    <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg" disabled={property.equity_available === 0}>
                      {property.equity_available > 0 ? "Commit to Invest" : "Fully Funded"}
                    </Button>
                  </Link>
                  
                  <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Verified Deal
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      Secure Transfer
                    </span>
                  </div>
                </div>

                {/* Profit Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profit Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Your Investment</Label>
                        <div className="flex items-center gap-4">
                          <Slider 
                            value={[investorContribution]} 
                            min={10000} 
                            max={property.equity_available || 100000} 
                            step={5000} 
                            onValueChange={(val) => setInvestorContribution(val[0])}
                            className="flex-1"
                          />
                          <Input 
                            className="w-24 text-right font-mono" 
                            value={`$${investorContribution.toLocaleString()}`} 
                            readOnly 
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Projected Profit Share</span>
                          <span className="font-bold text-green-600 text-lg">
                            ${Math.round(investorShare).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                           <span>Est. ROI</span>
                           <span>~{Math.round((investorShare / investorContribution) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Button variant="ghost" className="justify-start h-auto py-3 px-2" asChild>
                            <a href="#">
                                <FileText className="h-4 w-4 mr-3 text-primary" />
                                <div className="text-left">
                                    <div className="font-medium text-sm">Property Pro Forma</div>
                                    <div className="text-xs text-muted-foreground">PDF • 2.4 MB</div>
                                </div>
                            </a>
                        </Button>
                        <Button variant="ghost" className="justify-start h-auto py-3 px-2" asChild>
                            <a href="#">
                                <FileText className="h-4 w-4 mr-3 text-primary" />
                                <div className="text-left">
                                    <div className="font-medium text-sm">Inspection Report</div>
                                    <div className="text-xs text-muted-foreground">PDF • 5.1 MB</div>
                                </div>
                            </a>
                        </Button>
                    </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ShieldCheck(props: any) {
    return (
        <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
    )
}
