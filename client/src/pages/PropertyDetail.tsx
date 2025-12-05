import { Layout } from "@/components/Layout";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoute, Link } from "wouter";
import { MapPin, ChevronLeft, ChevronRight, Home as HomeIcon, FileText, Share2, Loader2, Bed, Bath, Calendar, Ruler, Heart, TrendingUp, DollarSign, Hammer, Target, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { CompsMap } from "@/components/CompsMap";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { data: property, isLoading, error } = useProperty(params?.slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [investAmount, setInvestAmount] = useState(50000);

  // Calculate images array early for keyboard navigation
  const galleryImages = property?.galleryPhotoUrls || [];
  const allImages = property?.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  useEffect(() => {
    if (property) {
      setInvestAmount(property.purchasePrice);
    }
  }, [property]);

  // Keyboard navigation - must be before any conditional returns
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : (allImages.length > 0 ? allImages.length - 1 : 0)));
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev < (allImages.length > 0 ? allImages.length - 1 : 0) ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [allImages.length]);

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

  // Calculate profit share based on investment amount
  const investmentRatio = property?.purchasePrice > 0 ? investAmount / property.purchasePrice : 0;
  const investorReturn = (property?.estimatedEquity || 0) * investmentRatio;
  const returnPercentage = investAmount > 0 ? (investorReturn / investAmount) * 100 : 0;

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link href="/properties" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Back to Marketplace
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Images & Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Address Header - Above Gallery */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                        property.status === 'needs_funding' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : property.status === 'committed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {property.status === "needs_funding" ? "Needs Funding" : 
                         property.status === "committed" ? "Funding Committed" : "Funded"}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2" data-testid="text-property-address">
                      {property.address}
                    </h1>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-base">{property.city}, {property.state} {property.zip}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors" title="Share">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-400" />
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-200 shadow-lg group">
                  {allImages[selectedImage] ? (
                    <img 
                      src={allImages[selectedImage]} 
                      className="w-full h-full object-cover transition-opacity duration-300" 
                      alt="Property" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HomeIcon className="h-16 w-16" />
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-95"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-95"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {selectedImage + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Property Specs */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    
                    <div className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Bed className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block text-xl font-bold text-gray-900">{property.beds}</span>
                        <span className="text-xs text-gray-500">Bedrooms</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Bath className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block text-xl font-bold text-gray-900">{property.baths}</span>
                        <span className="text-xs text-gray-500">Bathrooms</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Ruler className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block text-xl font-bold text-gray-900">{(property.squareFeet || 0).toLocaleString()}</span>
                        <span className="text-xs text-gray-500">Sq. Ft.</span>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Calendar className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="block text-xl font-bold text-gray-900">
                          {property.closingDate ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">Closing</span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* About this Property */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">About this Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {property.description || "Historic charm meets modern convenience. This property requires a light cosmetic rehab and foundation leveling."}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      This opportunity represents a prime value-add scenario in a rapidly appreciating neighborhood. Our team has secured this off-market deal at significantly below replacement cost. The renovation plan includes a full cosmetic update, modernizing the kitchen and baths, and enhancing curb appeal to maximize resale value.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Comps Map */}
              {(property.comps as any[])?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Location & Comps Map</h2>
                  
                  {/* Interactive Map Container */}
                  <div className="rounded-xl overflow-hidden h-80 shadow-sm border border-gray-200">
                    <CompsMap
                      subjectAddress={property.address}
                      subjectCity={property.city}
                      subjectState={property.state}
                      subjectZip={property.zip}
                      comps={property.comps as any[]}
                    />
                  </div>

                  {/* Comparable Sales List */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Sales</h3>
                    <div className="divide-y divide-gray-100">
                      {(property.comps as any[]).map((comp, idx) => (
                        <div 
                          key={comp.id || idx}
                          className="py-4 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{comp.address?.split(',')[0]}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {comp.beds} beds · {comp.baths} baths · {comp.sqft?.toLocaleString()} sqft
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-gray-900">${comp.price?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Sold {new Date(comp.soldDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
              
              {/* Investment Status Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Investment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Indicator */}
                  {property.status === 'needs_funding' ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Live</span>
                        </div>
                      </div>
                      <div className="text-emerald-800 text-sm font-semibold mb-1">
                        Open for Funding
                      </div>
                      <p className="text-xs text-emerald-700/80 leading-relaxed">
                        Secure this deal with full funding commitment.
                      </p>
                    </div>
                  ) : property.status === 'committed' ? (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Secured</span>
                        </div>
                      </div>
                      <div className="text-blue-800 text-sm font-semibold mb-1">
                        Funding Committed
                      </div>
                      <p className="text-xs text-blue-700/80 leading-relaxed">
                        This deal has been secured by an investor.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                          </span>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Closed</span>
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm font-semibold mb-1">
                        Fully Funded
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        This deal has been fully funded and closed.
                      </p>
                    </div>
                  )}

                  {/* Equity Available - Highlighted */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-700">Equity Available</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600" data-testid="text-estimated-equity">
                        ${(property.estimatedEquity || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Your potential profit share</p>
                  </div>

                  {/* Deal Financials */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Purchase Price</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900" data-testid="text-purchase-price">
                        ${(property.purchasePrice || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Rehab Budget</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(property.rehabBudget || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">After Repair Value</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(property.bpoValue || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Est. Profit</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        ${(property.estimatedEquity || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="pt-4 border-t border-gray-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Closing Date</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {property.closingDate ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Funding Deadline</span>
                      <span className="text-sm font-semibold text-gray-900">14 days</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/invest/${property.id}`}>
                    <Button 
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                      disabled={property.status !== 'needs_funding'}
                      data-testid="button-invest"
                    >
                      {property.status === 'needs_funding' ? (
                        <>
                          Commit to Invest
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      ) : property.status === 'committed' ? (
                        'Funding Secured'
                      ) : (
                        'Fully Funded'
                      )}
                    </Button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-6 pt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Verified
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                      Secure
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Profit Calculator Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Profit Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Your Investment</label>
                    <div className="mb-4">
                      <Slider 
                        value={[investAmount]}
                        onValueChange={(value) => setInvestAmount(value[0])}
                        min={10000}
                        max={property.purchasePrice}
                        step={5000}
                        className="mb-3"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">$10,000</span>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            ${investAmount.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">${property.purchasePrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">Projected Profit Share</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${investorReturn.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-green-200">
                        <span className="text-xs font-medium text-gray-600">Estimated ROI</span>
                        <span className="text-lg font-bold text-green-700">
                          ~{returnPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {(property.documents as any[])?.length > 0 ? (
                    <div className="space-y-2">
                      {(property.documents as any[]).map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all group border border-transparent hover:border-gray-200"
                        >
                          <div className="p-2 bg-white rounded-lg group-hover:bg-primary/5 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.type || 'PDF'} {doc.size ? `· ${(doc.size / 1024).toFixed(1)} KB` : ''}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="p-2 bg-white rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Property Pro Forma</p>
                          <p className="text-xs text-gray-500">PDF · 2.4 KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="p-2 bg-white rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Inspection Report</p>
                          <p className="text-xs text-gray-500">PDF · 5.1 KB</p>
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
      </div>
    </Layout>
  );
}
