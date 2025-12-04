import { Layout } from "@/components/Layout";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRoute, Link } from "wouter";
import { MapPin, ChevronLeft, CheckCircle2, Home as HomeIcon, Ruler, DollarSign, FileText, Share2, Heart, Loader2, Bed, Bath, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { data: property, isLoading, error } = useProperty(params?.slug);
  const [investorContribution, setInvestorContribution] = useState(50000);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Funding progress: 0% if needs_funding, 100% if committed or funded
  const fundingProgress = property.status === "needs_funding" ? 0 : 100;
  const totalCost = property.purchasePrice + (property.rehabBudget || 0);
  const projectedProfit = property.bpoValue - totalCost;
  const investorShare = (investorContribution / totalCost) * projectedProfit;

  const galleryImages = property.galleryPhotoUrls || [];
  const allImages = property.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;

  return (
    <Layout>
      <div className="w-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <Link href="/properties" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Properties
          </Link>
        </div>

        {/* Header with Address */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`${
                  property.status === 'needs_funding' ? 'bg-amber-100 text-amber-800' :
                  property.status === 'committed' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {property.status === "needs_funding" ? "Needs Funding" : 
                   property.status === "committed" ? "Funding Committed" : "Funded"}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900" data-testid="text-property-address">{property.address}</h1>
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

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div className="md:col-span-3 h-full relative group cursor-pointer bg-gray-100">
              {allImages[0] ? (
                <img 
                  src={allImages[0]} 
                  className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                  alt="Property Front" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <HomeIcon className="h-16 w-16" />
                </div>
              )}
            </div>
            
            {/* Right side gallery images */}
            <div className="hidden md:flex flex-col gap-4 h-full">
              <div className="h-1/2 relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100">
                {allImages[1] ? (
                  <img 
                    src={allImages[1]} 
                    className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                    alt="Gallery" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <HomeIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="h-1/2 relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100">
                {allImages[2] ? (
                  <img 
                    src={allImages[2]} 
                    className="w-full h-full object-cover transition transform group-hover:scale-105 duration-700" 
                    alt="Gallery" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <HomeIcon className="h-8 w-8" />
                  </div>
                )}
                {allImages.length > 3 && (
                  <button className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 text-xs font-semibold rounded-lg shadow hover:bg-white transition">
                    View all photos
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 flex flex-wrap justify-between items-center gap-8">
            
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Purchase Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-2" data-testid="text-purchase-price">${property.purchasePrice.toLocaleString()}</p>
            </div>

            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Rehab Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${(property.rehabBudget || 0).toLocaleString()}</p>
            </div>

            <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">BPO Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">${property.bpoValue.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 px-8 py-4 rounded-lg border border-green-100">
              <p className="text-xs text-green-700 uppercase font-bold tracking-wider">Est. Equity</p>
              <p className="text-3xl font-extrabold text-green-600 mt-2" data-testid="text-estimated-equity">${property.estimatedEquity.toLocaleString()}</p>
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
                  {property.description || "No description available."}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Bedrooms</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{property.beds}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Bath className="h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Bathrooms</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{property.baths}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Square Feet</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{property.squareFeet.toLocaleString()}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Closing</p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{new Date(property.closingDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(property.documents as any[])?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Documents</h2>
                  <div className="space-y-3">
                    {(property.documents as any[]).map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Investment Calculator */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="shadow-xl border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Investment Summary</CardTitle>
                    <CardDescription>Calculate your potential returns</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Funding Progress</span>
                        <span className="font-semibold">{fundingProgress}%</span>
                      </div>
                      <Progress 
                        value={fundingProgress} 
                        className={`h-2 ${
                          property.status === 'needs_funding' ? '[&>div]:bg-amber-500' :
                          property.status === 'committed' ? '[&>div]:bg-blue-500' :
                          '[&>div]:bg-green-500'
                        }`}
                      />
                      <p className="text-xs text-gray-500">
                        {property.status === 'needs_funding' ? 'Open for investment' :
                         property.status === 'committed' ? 'Funding secured' : 'Fully funded'}
                      </p>
                    </div>

                    {/* Investment Calculator */}
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label className="text-sm font-medium">Your Investment Amount</Label>
                        <div className="mt-2">
                          <Input
                            type="number"
                            value={investorContribution}
                            onChange={(e) => setInvestorContribution(Number(e.target.value))}
                            className="text-lg font-semibold"
                            min={10000}
                            step={5000}
                          />
                        </div>
                        <Slider
                          value={[investorContribution]}
                          onValueChange={([val]) => setInvestorContribution(val)}
                          min={10000}
                          max={property.estimatedEquity}
                          step={5000}
                          className="mt-3"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>$10,000</span>
                          <span>${property.estimatedEquity.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Projected Return</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                          ${Math.max(0, investorShare).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Based on {((investorContribution / totalCost) * 100).toFixed(1)}% equity stake
                        </p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3 pt-4">
                      {property.status === 'needs_funding' ? (
                        <Link href={`/invest/${property.id}`}>
                          <Button className="w-full h-12 text-base font-semibold" data-testid="button-invest">
                            Invest Now
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full h-12 text-base font-semibold" disabled>
                          {property.status === 'committed' ? 'Funding Secured' : 'Fully Funded'}
                        </Button>
                      )}
                      <Button variant="outline" className="w-full">
                        Request More Info
                      </Button>
                    </div>
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
