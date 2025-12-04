import { Layout } from "@/components/Layout";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useRoute, Link } from "wouter";
import { MapPin, ChevronLeft, Home as HomeIcon, FileText, Share2, Loader2, Bed, Bath, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { data: property, isLoading, error } = useProperty(params?.slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [investAmount, setInvestAmount] = useState(50000);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  useEffect(() => {
    if (property) {
      setInvestAmount(property.purchasePrice);
    }
  }, [property]);

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

  const investorReturn = property.estimatedEquity * 0.5;
  const returnPercentage = property.purchasePrice > 0 ? (investorReturn / property.purchasePrice) * 100 : 0;
  
  const galleryImages = property.galleryPhotoUrls || [];
  const allImages = property.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;
  
  const fundingProgress = property.status === "needs_funding" ? 0 : property.status === "committed" ? 83 : 100;
  const raisedAmount = Math.round((fundingProgress / 100) * property.purchasePrice);

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link href="/properties" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Marketplace
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Images & Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Image Gallery */}
              <div className="space-y-3">
                {/* Main Image */}
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-200">
                  {allImages[selectedImage] ? (
                    <img 
                      src={allImages[selectedImage]} 
                      className="w-full h-full object-cover" 
                      alt="Property" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HomeIcon className="h-16 w-16" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-3">
                    {allImages.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                          selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                    {allImages.length > 4 && (
                      <button className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-200 transition">
                        +{allImages.length - 4}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Address & Share */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900" data-testid="text-property-address">
                    {property.address}
                  </h1>
                  <p className="text-gray-500 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="flex flex-wrap gap-x-12 gap-y-4 py-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Purchase Price</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="text-purchase-price">${property.purchasePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Rehab Budget</p>
                  <p className="text-xl font-bold text-gray-900">${(property.rehabBudget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">ARV</p>
                  <p className="text-xl font-bold text-gray-900">${property.bpoValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Est. Profit</p>
                  <p className="text-xl font-bold text-green-600" data-testid="text-estimated-equity">${property.estimatedEquity.toLocaleString()}</p>
                </div>
              </div>

              {/* About this Property */}
              <div className="py-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About this Property</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.description || "Historic charm meets modern convenience. This property requires a light cosmetic rehab and foundation leveling."}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-3">
                  This opportunity represents a prime value-add scenario in a rapidly appreciating neighborhood. Our team has secured this off-market deal at significantly below replacement cost. The renovation plan includes a full cosmetic update, modernizing the kitchen and baths, and enhancing curb appeal to maximize resale value.
                </p>
              </div>

              {/* Comparable Sales */}
              {(property.comps as any[])?.length > 0 && (
                <div className="py-4 border-t border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Comparable Sales</h2>
                  <div className="space-y-3">
                    {(property.comps as any[]).map((comp, idx) => (
                      <div 
                        key={comp.id || idx}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{comp.address}</p>
                          <p className="text-xs text-gray-500">
                            {comp.beds} beds · {comp.baths} baths · {comp.sqft?.toLocaleString()} sqft
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${comp.price?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            Sold {new Date(comp.soldDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Investment Status Card */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Investment Status</h3>
                    <Badge className={`${
                      property.status === 'needs_funding' ? 'bg-amber-500 hover:bg-amber-500' :
                      property.status === 'committed' ? 'bg-blue-500 hover:bg-blue-500' :
                      'bg-green-500 hover:bg-green-500'
                    } text-white`}>
                      {property.status === "needs_funding" ? "Needs Funding" : 
                       property.status === "committed" ? "Funding Committed" : "Funded"}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Closing:</span>
                      <span className="font-medium">{new Date(property.closingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Funding Closes:</span>
                      <span className="font-medium">14 days</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-bold text-primary">{fundingProgress}%</span>
                    </div>
                    <Progress value={fundingProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>${raisedAmount.toLocaleString()} Raised</span>
                      <span>${property.purchasePrice.toLocaleString()} Goal</span>
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-t border-b border-gray-100 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min. Investment</span>
                      <span className="font-bold">${property.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Equity Available</span>
                      <span className="font-bold text-green-600">${property.estimatedEquity.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link href={`/invest/${property.id}`}>
                    <Button 
                      className="w-full h-12 text-base font-semibold bg-red-500 hover:bg-red-600"
                      disabled={property.status !== 'needs_funding'}
                      data-testid="button-invest"
                    >
                      {property.status === 'needs_funding' ? 'Commit to Invest' : 
                       property.status === 'committed' ? 'Funding Secured' : 'Fully Funded'}
                    </Button>
                  </Link>

                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                      Verified
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                      Secure
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Profit Calculator Card */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Profit Calculator</h3>
                  
                  <div className="mb-4">
                    <label className="text-sm text-gray-500 mb-2 block">Your Investment</label>
                    <Slider 
                      value={[investAmount]}
                      onValueChange={(value) => setInvestAmount(value[0])}
                      min={10000}
                      max={property.purchasePrice}
                      step={5000}
                      className="mb-2"
                    />
                    <div className="text-right text-xl font-bold text-gray-900">
                      ${investAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Projected Profit Share</span>
                      <span className="font-bold text-green-600 text-xl">${investorReturn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Est. ROI</span>
                      <span>~{returnPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Documents</h3>
                  
                  {(property.documents as any[])?.length > 0 ? (
                    <div className="space-y-3">
                      {(property.documents as any[]).map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <FileText className="h-5 w-5 text-red-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-400">PDF</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Property Pro Forma</p>
                          <p className="text-xs text-gray-400">PDF · 2.4 KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Inspection Report</p>
                          <p className="text-xs text-gray-400">PDF · 5.1 KB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
