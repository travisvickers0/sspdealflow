import { Layout } from "@/components/Layout";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoute, Link, Redirect } from "wouter";
import { MapPin, ChevronLeft, ChevronRight, Home as HomeIcon, FileText, Share2, Loader2, Bed, Bath, Calendar, Ruler, Heart, TrendingUp, DollarSign, Hammer, Target, ArrowRight, Images, Check, Download, Shield, ArrowDown, Building2, Wallet, Lock, CheckCircle2, Landmark, Home, Coins, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { CompsMap } from "@/components/CompsMap";
import { generatePropertyDescription } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { data: property, isLoading, error } = useProperty(params?.slug);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Calculate images array early for keyboard navigation
  const galleryImages = property?.galleryPhotoUrls || [];
  const allImages = property?.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

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

  // Require authentication to view property details
  if (!authLoading && !isAuthenticated) {
    return <Redirect to="/signin" />;
  }

  if (isLoading || authLoading) {
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

  // Status mode logic with backwards compatibility
  // Map old status values to new system for backwards compatibility
  const normalizedStatus = property.status === "needs_funding"
    ? "AVAILABLE" 
    : property.status === "committed"
    ? "COMMITTED"
    : property.status === "funded" || property.status === "archived"
    ? "FUNDED"
    : property.status;
  
  const isAvailable = normalizedStatus === "AVAILABLE";
  const isCommitted = normalizedStatus === "COMMITTED";
  const isFunded = normalizedStatus === "FUNDED";
  const isSold = normalizedStatus === "SOLD";

  // Calculate profit metrics - use SOLD values if available, otherwise use estimates
  const totalEquity = isSold && property.totalProjectProfit !== null && property.totalProjectProfit !== undefined
    ? property.totalProjectProfit
    : property?.estimatedEquity || 0;
  
  const purchasePrice = property?.purchasePrice || 0;
  
  // For sold deals, use actual values
  let investorProfitShare: number;
  let sspProfitShare: number;
  let returnPercentage: number;
  let usesGuaranteedMinimum = false;
  
  if (isSold && property.investorProfit !== null && property.investorProfit !== undefined) {
    // Use actual sold values
    investorProfitShare = property.investorProfit;
    sspProfitShare = property.sponsorProfit !== null && property.sponsorProfit !== undefined 
      ? property.sponsorProfit 
      : totalEquity - investorProfitShare;
    returnPercentage = property.realizedROI !== null && property.realizedROI !== undefined
      ? property.realizedROI
      : purchasePrice > 0 ? (investorProfitShare / purchasePrice) * 100 : 0;
  } else {
    // Calculate for available/funded deals
    // Step 1: Calculate 50/50 profit split
    const profitSplit50_50 = totalEquity * 0.5;
    
    // Step 2: Calculate guaranteed minimum return (1% per month, minimum 8% total)
    // Estimate hold period: use actual if available, otherwise estimate 3 months (typical 60-120 days)
    const holdPeriodMonths = property?.holdPeriodMonths || 3;
    const monthlyReturnPercent = 1; // 1% per month
    const minimumTotalReturnPercent = 8; // Minimum 8% total
    const calculatedMonthlyReturn = monthlyReturnPercent * holdPeriodMonths;
    const guaranteedReturnPercent = Math.max(calculatedMonthlyReturn, minimumTotalReturnPercent);
    const guaranteedMinimumProfit = (purchasePrice * guaranteedReturnPercent) / 100;
    
    // Step 3: Investor gets whichever is higher: 50/50 split OR guaranteed minimum
    investorProfitShare = Math.max(profitSplit50_50, guaranteedMinimumProfit);
    usesGuaranteedMinimum = profitSplit50_50 < guaranteedMinimumProfit;
    
    // Step 4: SSP profit is the remainder (may be negative if guaranteed minimum exceeds 50% split)
    // SSP covers the shortfall per the agreement
    sspProfitShare = Math.max(0, totalEquity - investorProfitShare);
    
    // Step 5: Calculate ROI
    returnPercentage = purchasePrice > 0 ? (investorProfitShare / purchasePrice) * 100 : 0;
  }
  
  const investorTotalReturn = purchasePrice + investorProfitShare;

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Images & Content */}
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-first">
              
              {/* Address Header - Above Gallery */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : isCommitted
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : isFunded
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-100/80 text-amber-800 border-amber-300'
                      }`}>
                        {isSold && <Check className="w-3 h-3" />}
                        {isAvailable ? "Needs Funding" : 
                         isCommitted ? "Funding Committed" :
                         isFunded ? "Funded" : 
                         "SOLD · Case Study"}
                      </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2 break-words" data-testid="text-property-address">
                      {property.address}
                    </h1>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-base">{property.city}, {property.state} {property.zip}</span>
                      </div>
                      {isSold && (
                        <span className="text-sm text-gray-500 mt-0.5">Exited Investment</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 sm:self-start">
                    <a
                      href={`https://www.zillow.com/homes/${encodeURIComponent(`${property.address} ${property.city} ${property.state} ${property.zip}`.replace(/,/g, '').replace(/\s+/g, '-').trim())}_rb/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 md:px-4 md:py-2 bg-[#006AFF] hover:bg-[#0055CC] text-white rounded-lg text-[10px] md:text-sm font-bold transition-colors whitespace-nowrap"
                      title="View on Zillow"
                      data-testid="link-zillow"
                    >
                      Zillow
                    </a>
                    <button className="p-1.5 md:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0" title="Share">
                      <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 md:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0" title="Save">
                      <Heart className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                {/* Main Image */}
                <div 
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-200 shadow-lg group cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                  data-testid="button-open-gallery"
                >
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
                  
                  {/* View All Photos Button */}
                  {allImages.length > 1 && (
                    <button
                      className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white rounded-lg shadow-lg text-sm font-medium text-gray-900 transition-all hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxOpen(true);
                      }}
                    >
                      <Images className="w-4 h-4" />
                      View all {allImages.length} photos
                    </button>
                  )}
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviousImage();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 active:scale-95"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
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

                {/* Lightbox Gallery */}
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  index={selectedImage}
                  slides={allImages.map(src => ({ src }))}
                  plugins={[Thumbnails, Counter, Zoom]}
                  thumbnails={{
                    position: "bottom",
                    width: 100,
                    height: 70,
                    gap: 8,
                    padding: 8,
                  }}
                  counter={{ container: { style: { top: "unset", bottom: 0, left: "50%", transform: "translateX(-50%)" } } }}
                  carousel={{
                    finite: false,
                    preload: 3,
                  }}
                  zoom={{
                    maxZoomPixelRatio: 3,
                    scrollToZoom: true,
                  }}
                  styles={{
                    container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
                  }}
                  on={{
                    view: ({ index }) => setSelectedImage(index),
                  }}
                />
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
                          {isSold && property.exitDate
                            ? new Date(property.exitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : property.closingDate 
                            ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">{isSold ? 'Exit Date' : 'Closing'}</span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Mobile: Investment Status Card - Show on mobile only, right after Property Specs */}
              <div className="lg:hidden space-y-6">
                {/* Investment Status Card / Deal Outcome Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{isSold ? "Deal Outcome" : "Investment Status"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status Indicator */}
                    {isSold ? (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">Status</span>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Sold and Exited</span>
                          </div>
                        </div>
                        <div className="text-amber-900 text-sm font-semibold mb-1">
                          Successfully Exited
                        </div>
                        <p className="text-xs text-amber-700/80 leading-relaxed">
                          This deal has been completed and exited. View the financial breakdown below.
                        </p>
                      </div>
                    ) : isAvailable ? (
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
                    ) : (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">Status</span>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Funded</span>
                          </div>
                        </div>
                        <div className="text-blue-800 text-sm font-semibold mb-1">
                          Fully Funded
                        </div>
                        <p className="text-xs text-blue-700/80 leading-relaxed">
                          This deal has been fully funded and closed.
                        </p>
                      </div>
                    )}

                    {/* Equity Available / Deal Outcome Metrics */}
                    {isSold ? (
                      <div className="space-y-4">
                        {property.exitDate && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Exit Date</span>
                              <span className="text-sm font-bold text-gray-900">
                                {new Date(property.exitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.holdPeriodMonths !== null && property.holdPeriodMonths !== undefined && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Hold Period</span>
                              <span className="text-sm font-bold text-gray-900">
                                {property.holdPeriodMonths} {property.holdPeriodMonths === 1 ? 'month' : 'months'}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.finalSalePrice !== null && property.finalSalePrice !== undefined && (
                          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-semibold text-gray-700">Final Sale Price</span>
                              <span className="text-xl font-bold text-green-600">
                                ${property.finalSalePrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.totalProjectProfit !== null && property.totalProjectProfit !== undefined && (
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Total Project Profit</span>
                              <span className="text-lg font-bold text-blue-600">
                                ${property.totalProjectProfit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        {property.investorProfit !== null && property.investorProfit !== undefined && (
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-semibold text-gray-700">Investor Profit</span>
                              <span className="text-2xl font-bold text-green-600">
                                ${property.investorProfit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
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
                    )}

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
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Est. Profit</span>
                        </div>
                        <span className="text-sm font-medium text-green-500">
                          ${(property.estimatedEquity || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Timeline - Only show for AVAILABLE/FUNDED */}
                    {!isSold && (
                      <div className="pt-4 border-t border-gray-200 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Closing Date</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {property.closingDate ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        {isAvailable && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Funding Deadline</span>
                            <span className="text-sm font-semibold text-gray-900">14 days</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA Button */}
                    {isSold ? (
                      <Button 
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
                        data-testid="button-case-study"
                      >
                        <Download className="mr-2 w-4 h-4" />
                        Download Case Study PDF
                      </Button>
                    ) : (
                      <a 
                        href="https://calendly.com/sspdealflow/30min" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button 
                          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                          disabled={!isAvailable}
                          data-testid="button-invest"
                        >
                          {isAvailable ? (
                            <>
                              Commit to Invest
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          ) : (
                            'Funding Secured'
                          )}
                        </Button>
                      </a>
                    )}

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

                {/* Profit Calculator Card - 50/50 Split */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Profit Calculator
                      <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">50/50 Split</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Your Investment */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Investment</span>
                          <p className="text-xs text-gray-500 mt-0.5">Full purchase price</p>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${(property.purchasePrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Total Equity */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {isSold ? "Final Project Profit" : "Total Projected Equity"}
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          ${totalEquity.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700/80">
                        {isSold ? "Total profit realized at exit" : "ARV minus purchase price and rehab costs"}
                      </p>
                    </div>

                    {/* Profit Split Visualization */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profit Distribution</p>
                        {usesGuaranteedMinimum && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            Guaranteed Minimum Applied
                          </span>
                        )}
                      </div>
                      
                      {/* Visual Split Bar */}
                      {totalEquity > 0 ? (
                        <div className="h-4 rounded-full overflow-hidden flex relative">
                          {usesGuaranteedMinimum ? (
                            <>
                              <div 
                                className="bg-green-500 flex items-center justify-center"
                                style={{ width: `${(investorProfitShare / totalEquity) * 100}%` }}
                              >
                                <span className="text-[10px] font-bold text-white px-1">YOU</span>
                              </div>
                              <div className="bg-gray-400 flex items-center justify-center flex-1">
                                <span className="text-[10px] font-bold text-white px-1">SSP</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-1/2 bg-green-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">YOU 50%</span>
                              </div>
                              <div className="w-1/2 bg-gray-400 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">SSP 50%</span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-4 rounded-full bg-gray-200"></div>
                      )}

                      {/* Split Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                          <p className="text-xs text-gray-600 mb-1">{isSold ? "Investor Share" : "Your Share"}</p>
                          <p className="text-lg font-bold text-green-600">${investorProfitShare.toLocaleString()}</p>
                          {usesGuaranteedMinimum && (
                            <p className="text-[10px] text-amber-600 mt-1">(Guaranteed Min)</p>
                          )}
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-center">
                          <p className="text-xs text-gray-600 mb-1">{isSold ? "Sponsor Share" : "SSP Share"}</p>
                          <p className="text-lg font-bold text-gray-600">${sspProfitShare.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Total Return */}
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Your Total Return</span>
                          <p className="text-xs text-gray-500 mt-0.5">Investment + profit share</p>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          ${investorTotalReturn.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-green-200">
                        <span className="text-xs font-medium text-gray-600">
                          {isSold ? "Realized ROI" : "Estimated ROI"}
                        </span>
                        <div className="flex items-center gap-2">
                          {usesGuaranteedMinimum && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                              MIN
                            </span>
                          )}
                          <span className="text-lg font-bold text-green-700">
                            +{typeof returnPercentage === 'number' ? returnPercentage.toFixed(1) : returnPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Guaranteed Minimum Info (only show for non-sold deals) */}
                    {!isSold && usesGuaranteedMinimum && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-amber-900 mb-1">Protected by Guaranteed Minimum</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                              Your return is protected by our guaranteed minimum (1% per month, minimum 8% total). You receive whichever is higher: 50% of profit or the guaranteed minimum.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* How It Works Note / Final Numbers Helper */}
                    {isSold ? (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">Final numbers at exit</p>
                        <p>All figures reflect the actual financial results from this completed deal.</p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-1">How it works:</p>
                        <p className="mb-2">You fund the purchase. SSP handles rehab & management. When the property sells, you get your capital back plus your profit share.</p>
                        <p className="text-gray-600">
                          <strong>Your return:</strong> Whichever is higher — 50% of net profit or guaranteed minimum (1% per month, minimum 8% total).
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* About this Property / Deal Summary */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{isSold ? "Deal Summary" : "About this Property"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {isSold ? (
                      <div className="text-gray-700 leading-relaxed space-y-4">
                        <p>
                          This property was successfully acquired, renovated, and sold as part of our value-add strategy. 
                          The project was secured off-market at a competitive entry price and executed through a standardized, 
                          low-risk cosmetic update. The renovation focused on high-impact basics—new flooring, fresh paint, 
                          and general improvements—to bring the property to market standards and maximize resale value.
                        </p>
                        {property.description && (
                          <p>{property.description}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div 
                          className="text-gray-700 leading-relaxed space-y-4"
                          dangerouslySetInnerHTML={{
                            __html: generatePropertyDescription(property)
                              .split('\n\n')
                              .map(para => `<p>${para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
                              .join('')
                          }}
                          data-testid="text-property-description"
                        />
                        <p className="text-gray-700 leading-relaxed mt-4">
                          This opportunity represents a clear value-add scenario secured off-market at a competitive entry price. The project scope is a standardized, low-risk cosmetic update. The renovation plan focuses strictly on high-impact basics—new flooring, fresh paint, and a general spruce-up—to bring the property to market standards and maximize resale value.
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location & Comps Map - Mobile: Show after About this Property */}
              {(property.comps as any[])?.length > 0 && (
                <div className="space-y-6 lg:hidden">
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

              {/* Optional Timeline Section - Only for SOLD */}
              {isSold && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {property.closingDate && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                          <div>
                            <p className="font-semibold text-gray-900">Acquired</p>
                            <p className="text-sm text-gray-500">{new Date(property.closingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      )}
                      {property.exitDate && (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                            <div>
                              <p className="font-semibold text-gray-900">Renovation Start</p>
                              <p className="text-sm text-gray-500">Renovation completed</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                            <div>
                              <p className="font-semibold text-gray-900">Listed</p>
                              <p className="text-sm text-gray-500">Property listed for sale</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                            <div>
                              <p className="font-semibold text-gray-900">Under Contract</p>
                              <p className="text-sm text-gray-500">Sale contract executed</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                            <div>
                              <p className="font-semibold text-gray-900">Closed</p>
                              <p className="text-sm text-gray-500">{new Date(property.exitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location & Comps Map - Desktop: Show in left column */}
              {(property.comps as any[])?.length > 0 && (
                <div className="space-y-6 hidden lg:block">
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

              {/* Mobile: Documents Card - Show at end for mobile */}
              <div className="lg:hidden">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(property.documents) && property.documents.length > 0 ? (
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
                      <div className="text-center py-6">
                        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No documents available yet</p>
                        <p className="text-xs text-gray-400 mt-1">Documents will appear here once uploaded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Sidebar (Desktop Only) */}
            <div className="lg:col-span-1 hidden lg:block order-first lg:order-last">
              <div className="sticky top-6 space-y-6">
              
              {/* Investment Status Card / Deal Outcome Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{isSold ? "Deal Outcome" : "Investment Status"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Indicator */}
                  {isSold ? (
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Sold and Exited</span>
                        </div>
                      </div>
                      <div className="text-amber-900 text-sm font-semibold mb-1">
                        Successfully Exited
                      </div>
                      <p className="text-xs text-amber-700/80 leading-relaxed">
                        This deal has been completed and exited. View the financial breakdown below.
                      </p>
                    </div>
                  ) : isAvailable ? (
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
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                          </span>
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Funded</span>
                        </div>
                      </div>
                      <div className="text-blue-800 text-sm font-semibold mb-1">
                        Fully Funded
                      </div>
                      <p className="text-xs text-blue-700/80 leading-relaxed">
                        This deal has been fully funded and closed.
                      </p>
                    </div>
                  )}

                  {/* Equity Available / Deal Outcome Metrics */}
                  {isSold ? (
                    <div className="space-y-4">
                      {property.exitDate && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Exit Date</span>
                            <span className="text-sm font-bold text-gray-900">
                              {new Date(property.exitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      )}
                      {property.holdPeriodMonths !== null && property.holdPeriodMonths !== undefined && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Hold Period</span>
                            <span className="text-sm font-bold text-gray-900">
                              {property.holdPeriodMonths} {property.holdPeriodMonths === 1 ? 'month' : 'months'}
                            </span>
                          </div>
                        </div>
                      )}
                      {property.finalSalePrice !== null && property.finalSalePrice !== undefined && (
                        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-700">Final Sale Price</span>
                            <span className="text-xl font-bold text-green-600">
                              ${property.finalSalePrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {property.totalProjectProfit !== null && property.totalProjectProfit !== undefined && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-700">Total Project Profit</span>
                            <span className="text-lg font-bold text-blue-600">
                              ${property.totalProjectProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {property.investorProfit !== null && property.investorProfit !== undefined && (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-700">Investor Profit</span>
                            <span className="text-2xl font-bold text-green-600">
                              ${property.investorProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
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
                  )}

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
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Est. Profit</span>
                      </div>
                      <span className="text-sm font-medium text-green-500">
                        ${(property.estimatedEquity || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Timeline - Only show for AVAILABLE/FUNDED */}
                  {!isSold && (
                    <div className="pt-4 border-t border-gray-200 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Closing Date</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {property.closingDate ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      {isAvailable && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Funding Deadline</span>
                          <span className="text-sm font-semibold text-gray-900">14 days</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Button */}
                  {isSold ? (
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-base font-semibold border-2 hover:bg-gray-50 transition-all"
                      data-testid="button-case-study"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download Case Study PDF
                    </Button>
                  ) : (
                    <a 
                      href="https://calendly.com/sspdealflow/30min" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button 
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        disabled={!isAvailable}
                        data-testid="button-invest"
                      >
                        {isAvailable ? (
                          <>
                            Commit to Invest
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        ) : (
                          'Funding Secured'
                        )}
                      </Button>
                    </a>
                  )}

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

              {/* Profit Calculator Card - 50/50 Split */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Profit Calculator
                    <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">50/50 Split</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Your Investment */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Investment</span>
                        <p className="text-xs text-gray-500 mt-0.5">Full purchase price</p>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${(property.purchasePrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Total Equity */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {isSold ? "Final Project Profit" : "Total Projected Equity"}
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ${totalEquity.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700/80">
                      {isSold ? "Total profit realized at exit" : "ARV minus purchase price and rehab costs"}
                    </p>
                  </div>

                  {/* Profit Split Visualization */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profit Distribution</p>
                      {usesGuaranteedMinimum && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          Guaranteed Minimum Applied
                        </span>
                      )}
                    </div>
                    
                    {/* Visual Split Bar */}
                    {totalEquity > 0 ? (
                      <div className="h-4 rounded-full overflow-hidden flex relative">
                        {usesGuaranteedMinimum ? (
                          <>
                            <div 
                              className="bg-green-500 flex items-center justify-center"
                              style={{ width: `${(investorProfitShare / totalEquity) * 100}%` }}
                            >
                              <span className="text-[10px] font-bold text-white px-1">YOU</span>
                            </div>
                            <div className="bg-gray-400 flex items-center justify-center flex-1">
                              <span className="text-[10px] font-bold text-white px-1">SSP</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-1/2 bg-green-500 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">YOU 50%</span>
                            </div>
                            <div className="w-1/2 bg-gray-400 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">SSP 50%</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-4 rounded-full bg-gray-200"></div>
                    )}

                    {/* Split Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">{isSold ? "Investor Share" : "Your Share"}</p>
                        <p className="text-lg font-bold text-green-600">${investorProfitShare.toLocaleString()}</p>
                        {usesGuaranteedMinimum && (
                          <p className="text-[10px] text-amber-600 mt-1">(Guaranteed Min)</p>
                        )}
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 text-center">
                        <p className="text-xs text-gray-600 mb-1">{isSold ? "Sponsor Share" : "SSP Share"}</p>
                        <p className="text-lg font-bold text-gray-600">${sspProfitShare.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Return */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Your Total Return</span>
                        <p className="text-xs text-gray-500 mt-0.5">Investment + profit share</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ${investorTotalReturn.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-green-200">
                      <span className="text-xs font-medium text-gray-600">
                        {isSold ? "Realized ROI" : "Estimated ROI"}
                      </span>
                      <div className="flex items-center gap-2">
                        {usesGuaranteedMinimum && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                            MIN
                          </span>
                        )}
                        <span className="text-lg font-bold text-green-700">
                          +{typeof returnPercentage === 'number' ? returnPercentage.toFixed(1) : returnPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Guaranteed Minimum Info (only show for non-sold deals) */}
                  {!isSold && usesGuaranteedMinimum && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-amber-900 mb-1">Protected by Guaranteed Minimum</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            Your return is protected by our guaranteed minimum (1% per month, minimum 8% total). You receive whichever is higher: 50% of profit or the guaranteed minimum.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* How It Works Note / Final Numbers Helper */}
                  {isSold ? (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="font-semibold text-gray-700 mb-1">Final numbers at exit</p>
                      <p>All figures reflect the actual financial results from this completed deal.</p>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="font-semibold text-gray-700 mb-1">How it works:</p>
                      <p className="mb-2">You fund the purchase. SSP handles rehab & management. When the property sells, you get your capital back plus your profit share.</p>
                      <p className="text-gray-600">
                        <strong>Your return:</strong> Whichever is higher — 50% of net profit or guaranteed minimum (1% per month, minimum 8% total).
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(property.documents) && property.documents.length > 0 ? (
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
                    <div className="text-center py-6">
                      <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No documents available yet</p>
                      <p className="text-xs text-gray-400 mt-1">Documents will appear here once uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Sticky Invest Button - Fixed at bottom on mobile */}
        {!isSold && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 safe-area-inset-bottom">
            <a 
              href="https://calendly.com/sspdealflow/30min" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button 
                className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                disabled={!isAvailable}
                data-testid="button-invest-mobile-sticky"
              >
                {isAvailable ? (
                  <>
                    Commit to Invest
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  'Funding Secured'
                )}
              </Button>
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
