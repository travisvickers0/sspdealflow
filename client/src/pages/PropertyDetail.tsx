import { Layout } from "@/components/Layout";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { useRoute, Link, Redirect } from "wouter";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
  Share2,
  Loader2,
  Bed,
  Bath,
  Calendar,
  Ruler,
  Heart,
  TrendingUp,
  DollarSign,
  Hammer,
  Target,
  ArrowRight,
  Images,
  Check,
  Download,
  Shield,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { posthog } from "@/lib/posthog";
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
  const { data: property, isLoading } = useProperty(params?.slug);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = property?.galleryPhotoUrls || [];
  const allImages = property?.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  useEffect(() => {
    if (!property) return;

    posthog.capture("property_viewed", {
      property_id: property.id,
      property_address: property.address,
      property_city: property.city,
      property_state: property.state,
      property_status: property.status,
      purchase_price: property.purchasePrice,
      estimated_equity: property.estimatedEquity,
    });

    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "view_item", {
        items: [
          {
            item_id: String(property.id),
            item_name: property.address,
            item_category: property.status,
            price: property.purchasePrice,
          },
        ],
      });
    }
  }, [property?.id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length > 0 ? allImages.length - 1 : 0));
      } else if (e.key === "ArrowRight") {
        setSelectedImage((prev) =>
          prev < (allImages.length > 0 ? allImages.length - 1 : 0) ? prev + 1 : 0,
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [allImages.length]);

  useEffect(() => {
    document.body.removeAttribute("data-nav-scrolled");

    const handleScroll = () => {
      if (window.scrollY > 80) {
        document.body.setAttribute("data-nav-scrolled", "true");
      } else {
        document.body.removeAttribute("data-nav-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeAttribute("data-nav-scrolled");
    };
  }, []);

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Property not found</h1>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const normalizedStatus =
    property.status === "needs_funding"
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

  const totalEquity =
    isSold && property.totalProjectProfit !== null && property.totalProjectProfit !== undefined
      ? property.totalProjectProfit
      : property?.estimatedEquity || 0;

  const purchasePrice = property?.purchasePrice || 0;

  let investorProfitShare: number;
  let sspProfitShare: number;
  let returnPercentage: number;
  let usesGuaranteedMinimum = false;

  if (isSold && property.investorProfit !== null && property.investorProfit !== undefined) {
    investorProfitShare = property.investorProfit;
    sspProfitShare =
      property.sponsorProfit !== null && property.sponsorProfit !== undefined
        ? property.sponsorProfit
        : totalEquity - investorProfitShare;
    returnPercentage =
      property.realizedROI !== null && property.realizedROI !== undefined
        ? property.realizedROI
        : purchasePrice > 0
          ? (investorProfitShare / purchasePrice) * 100
          : 0;
  } else {
    const profitSplit50_50 = totalEquity * 0.5;
    const holdPeriodMonths = property?.holdPeriodMonths || 3;
    const monthlyReturnPercent = 1;
    const minimumTotalReturnPercent = 8;
    const calculatedMonthlyReturn = monthlyReturnPercent * holdPeriodMonths;
    const guaranteedReturnPercent = Math.max(calculatedMonthlyReturn, minimumTotalReturnPercent);
    const guaranteedMinimumProfit = (purchasePrice * guaranteedReturnPercent) / 100;

    investorProfitShare = Math.max(profitSplit50_50, guaranteedMinimumProfit);
    usesGuaranteedMinimum = profitSplit50_50 < guaranteedMinimumProfit;
    sspProfitShare = Math.max(0, totalEquity - investorProfitShare);
    returnPercentage = purchasePrice > 0 ? (investorProfitShare / purchasePrice) * 100 : 0;
  }

  const investorTotalReturn = purchasePrice + investorProfitShare;

  const handlePreviousImage = () => {
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleInvestClick = () => {
    posthog.capture("invest_clicked", {
      property_id: property.id,
      property_address: property.address,
      purchase_price: property.purchasePrice,
      estimated_equity: property.estimatedEquity,
    });

    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "begin_checkout", {
        items: [
          {
            item_id: String(property.id),
            item_name: property.address,
            price: property.purchasePrice,
          },
        ],
      });
    }
  };

  const zillowHref = `https://www.zillow.com/homes/${encodeURIComponent(`${property.address} ${property.city} ${property.state} ${property.zip}`.replace(/,/g, "").replace(/\s+/g, "-").trim())}_rb/`;

  const bpoValue = property.bpoValue ?? 0;
  const rehabBudget = property.rehabBudget ?? 0;
  const estimatedEquityVal = property.estimatedEquity ?? 0;
  const purchaseBarPct = bpoValue > 0 ? Math.min(95, (purchasePrice / bpoValue) * 100) : 0;
  const rehabBarPct = bpoValue > 0 ? Math.min(100, (rehabBudget / bpoValue) * 100) : 0;
  const netEquityBarPct = bpoValue > 0 ? Math.min(100, (estimatedEquityVal / bpoValue) * 100) : 0;

  const closingDaysRemaining = property.closingDate
    ? Math.max(0, Math.ceil((new Date(property.closingDate).getTime() - Date.now()) / 86400000))
    : 14;

  const rawComps =
    (property.comps as { id?: string; address?: string; beds?: number; baths?: number; sqft?: number; price?: number; soldDate?: string }[]) || [];
  const comps = rawComps;
  const compsForMap = comps.map((c, i) => ({
    id: String(c.id ?? i),
    address: c.address ?? "",
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft,
    price: c.price,
    soldDate: c.soldDate,
  }));
  const hasComps = Array.isArray(comps) && comps.length > 0;
  const documents = Array.isArray(property.documents) ? (property.documents as { url: string; name: string; type?: string; size?: number }[]) : [];

  const closingDateDisplay = property.closingDate
    ? new Date(property.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "TBD";

  const specDateLabel = isSold ? "Exit Date" : "Closing";
  const specDateValue =
    isSold && property.exitDate
      ? new Date(property.exitDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : property.closingDate
        ? new Date(property.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "N/A";

  const sectionLabel = (label: string) => (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-[var(--line)]" />
    </div>
  );

  const profitCalculatorCard = (
    <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Profit Calculator</span>
        <span className="text-[10px] bg-[var(--surface-2-hex)] border border-[var(--line)] text-[var(--text-tertiary)] px-2 py-0.5 rounded-full">
          50/50 Split
        </span>
      </div>

      <div className="p-4 bg-[var(--surface-2-hex)] rounded-xl border border-[var(--line)]">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Your Investment</span>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Full purchase price</p>
          </div>
          <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">${purchasePrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 bg-[var(--blue-muted)] rounded-xl border border-[var(--blue-border)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            {isSold ? "Final Project Profit" : "Total Projected Equity"}
          </span>
          <span className="text-xl font-mono font-bold text-blue-400">${totalEquity.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-blue-400/70">
          {isSold ? "Total profit realized at exit" : "ARV minus purchase price and rehab costs"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Profit Distribution</p>
          {usesGuaranteedMinimum && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
              Guaranteed Minimum Applied
            </span>
          )}
        </div>

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
                <div className="bg-[var(--surface-3-hex)] flex items-center justify-center flex-1">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] px-1">SSP</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-1/2 bg-green-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">YOU 50%</span>
                </div>
                <div className="w-1/2 bg-[var(--surface-3-hex)] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">SSP 50%</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-4 rounded-full bg-[var(--surface-2-hex)]" />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[var(--green-muted)] rounded-lg border border-[var(--green-border)] text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">{isSold ? "Investor Share" : "Your Share"}</p>
            <p className="text-lg font-mono font-bold text-green-400">${investorProfitShare.toLocaleString()}</p>
            {usesGuaranteedMinimum && <p className="text-[10px] text-amber-400 mt-1">(Guaranteed Min)</p>}
          </div>
          <div className="p-3 bg-[var(--surface-2-hex)] rounded-lg border border-[var(--line)] text-center">
            <p className="text-[11px] text-[var(--text-tertiary)] mb-1">{isSold ? "Sponsor Share" : "SSP Share"}</p>
            <p className="text-lg font-mono font-bold text-[var(--text-secondary)]">${sspProfitShare.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[var(--green-muted)] rounded-xl border-2 border-[var(--green-border)]">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-sm font-semibold text-[var(--text-secondary)]">Your Total Return</span>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Investment + profit share</p>
          </div>
          <span className="text-2xl font-mono font-bold text-green-400">${investorTotalReturn.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--green-border)]">
          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
            {isSold ? "Realized ROI" : "Estimated ROI"}
          </span>
          <div className="flex items-center gap-2">
            {usesGuaranteedMinimum && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded border border-amber-500/20">
                MIN
              </span>
            )}
            <span className="text-lg font-mono font-bold text-green-400">
              +{typeof returnPercentage === "number" ? returnPercentage.toFixed(1) : returnPercentage}%
            </span>
          </div>
        </div>
      </div>

      {!isSold && usesGuaranteedMinimum && (
        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-amber-400 mb-1">Protected by Guaranteed Minimum</p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Your return is protected by our guaranteed minimum (1% per month, minimum 8% total). You receive whichever is higher: 50% of profit or the guaranteed minimum.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSold ? (
        <div className="text-[11px] text-[var(--text-tertiary)] bg-[var(--surface-2-hex)] rounded-lg p-3 border border-[var(--line)]">
          <p className="font-semibold text-[var(--text-secondary)] mb-1">Final numbers at exit</p>
          <p>All figures reflect the actual financial results from this completed deal.</p>
        </div>
      ) : (
        <div className="text-[11px] text-[var(--text-tertiary)] bg-[var(--surface-2-hex)] rounded-lg p-3 border border-[var(--line)]">
          <p className="font-semibold text-[var(--text-secondary)] mb-1">How it works:</p>
          <p className="mb-2">
            You fund the purchase. SSP handles rehab & management. When the property sells, you get your capital back plus your profit share.
          </p>
          <p className="text-[var(--text-secondary)]">
            <strong>Your return:</strong> Whichever is higher — 50% of net profit or guaranteed minimum (1% per month, minimum 8% total).
          </p>
        </div>
      )}
    </div>
  );

  const investButtonClass =
    "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[15px] py-4 rounded-[12px] flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_28px_rgba(232,67,45,0.3)] hover:-translate-y-0.5";

  const sidebarCommitCard = (
    <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] overflow-hidden">
      {isSold ? (
        <div className="bg-[var(--amber-muted)] border-b border-[var(--amber-border)] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-amber-400">
            <Check className="h-4 w-4" />
            Sold and Exited
          </div>
        </div>
      ) : isAvailable ? (
        <div className="bg-[var(--green-muted)] border-b border-[var(--green-border)] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Open for Funding
          </div>
          <span className="text-[10px] uppercase tracking-wide text-green-400/60">LIVE</span>
        </div>
      ) : isCommitted ? (
        <div className="bg-[var(--blue-muted)] border-b border-[var(--blue-border)] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Funding Committed
          </div>
          <span className="text-[10px] uppercase tracking-wide text-blue-400/60">COMMITTED</span>
        </div>
      ) : (
        <div className="bg-[var(--blue-muted)] border-b border-[var(--blue-border)] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-blue-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            Funded
          </div>
          <span className="text-[10px] uppercase tracking-wide text-blue-400/60">CLOSED</span>
        </div>
      )}

      <div className="p-6">
        {isSold ? (
          <div className="space-y-4">
            {property.exitDate && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--line)]">
                <span className="text-[13px] text-[var(--text-secondary)]">Exit Date</span>
                <span className="text-[13px] font-mono font-semibold text-[var(--text-primary)]">
                  {new Date(property.exitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
            {property.holdPeriodMonths != null && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--line)]">
                <span className="text-[13px] text-[var(--text-secondary)]">Hold Period</span>
                <span className="text-[13px] font-mono font-semibold text-[var(--text-primary)]">
                  {property.holdPeriodMonths} {property.holdPeriodMonths === 1 ? "month" : "months"}
                </span>
              </div>
            )}
            {property.finalSalePrice != null && (
              <div className="py-3 border-b border-[var(--line)]">
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Final Sale Price</p>
                <p className="font-mono text-[32px] font-medium text-green-400 leading-none">${property.finalSalePrice.toLocaleString()}</p>
              </div>
            )}
            {property.totalProjectProfit != null && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--line)]">
                <span className="text-[13px] text-[var(--text-secondary)]">Total Project Profit</span>
                <span className="text-[13px] font-mono font-medium text-[var(--text-primary)]">
                  ${property.totalProjectProfit.toLocaleString()}
                </span>
              </div>
            )}
            {property.investorProfit != null && (
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Investor Profit</p>
                <p className="font-mono text-[38px] font-medium text-green-400 leading-none">${property.investorProfit.toLocaleString()}</p>
              </div>
            )}
            <Button variant="outline" className="w-full mt-4 h-12 text-[15px] font-semibold border-[var(--line)]" data-testid="button-case-study">
              <Download className="mr-2 w-4 h-4" />
              Download Case Study PDF
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-[var(--line)] pb-6 mb-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[var(--text-tertiary)] mb-3">
                EQUITY AVAILABLE TO YOU
              </p>
              <p className="font-mono text-[52px] font-medium text-green-400 leading-none text-center mb-1" data-testid="text-estimated-equity">
                ${estimatedEquityVal.toLocaleString()}
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)] text-center">
                50% of ${estimatedEquityVal.toLocaleString()} net profit · est. {returnPercentage.toFixed(1)}% ROI
              </p>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between py-2.5 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <DollarSign className="h-4 w-4 text-[var(--text-tertiary)]" />
                  Purchase Price
                </div>
                <span className="font-mono text-[13px] font-medium text-[var(--text-primary)]" data-testid="text-purchase-price">
                  ${purchasePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <Hammer className="h-4 w-4 text-[var(--text-tertiary)]" />
                  Rehab Budget
                </div>
                <span className="font-mono text-[13px] font-medium text-[var(--text-primary)]">${rehabBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <Target className="h-4 w-4 text-[var(--text-tertiary)]" />
                  ARV
                </div>
                <span className="font-mono text-[13px] font-medium text-[var(--text-primary)]">${bpoValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Your 50%
                </div>
                <span className="font-mono text-[13px] font-medium text-green-400">${estimatedEquityVal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[var(--surface-2-hex)] border border-[var(--line)] rounded-[10px] p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-tertiary)]">Closing Date</span>
                <div className="text-right">
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] block">{closingDateDisplay}</span>
                  {isAvailable && (
                    <span className="text-[11px] text-amber-400 block mt-1">
                      {closingDaysRemaining > 0
                        ? `⚡ ${closingDaysRemaining} day${closingDaysRemaining === 1 ? "" : "s"} to closing`
                        : "⚡ Closing soon"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isAvailable ? (
              <a
                href="https://calendly.com/sspdealflow/30min"
                target="_blank"
                rel="noopener noreferrer"
                className={investButtonClass}
                data-testid="button-invest"
                onClick={handleInvestClick}
              >
                Commit to Invest →
              </a>
            ) : (
              <button
                type="button"
                className={`${investButtonClass} opacity-50 cursor-not-allowed`}
                disabled
                data-testid="button-invest"
              >
                Funding Secured
              </button>
            )}

            <div className="flex items-center justify-center gap-5 pt-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                Verified
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                <Shield className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                1st Lien
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                <Lock className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                Secure
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Layout transparentNav>
      <div className="relative w-full overflow-hidden" style={{ height: "92vh", maxHeight: "900px" }}>
        {allImages[selectedImage] ? (
          <img
            src={allImages[selectedImage]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover brightness-75"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hex)] via-[var(--surface-2-hex)] to-[var(--bg-hex)]">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[var(--bg-hex)]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 to-transparent" />

        {allImages.length > 1 && (
          <button
            type="button"
            className="absolute bottom-[120px] right-12 flex items-center gap-2 px-4 py-2.5 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[13px] font-medium rounded-[8px] hover:bg-black/80 transition-all cursor-pointer z-20"
            onClick={() => setLightboxOpen(true)}
            data-testid="button-open-gallery"
          >
            <Images className="h-4 w-4" />
            View all {allImages.length} photos
          </button>
        )}

        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePreviousImage}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 grid place-items-center text-white hover:bg-black/70 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 grid place-items-center text-white hover:bg-black/70 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-12 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {isAvailable && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-500/15 border border-green-500/20 text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Open for Funding
                  </span>
                )}
                {isCommitted && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-blue-500/15 border border-blue-500/20 text-blue-400">
                    Funding Committed
                  </span>
                )}
                {isFunded && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-blue-500/15 border border-blue-500/20 text-blue-400">
                    Funded
                  </span>
                )}
                {isSold && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-amber-500/15 border border-amber-500/20 text-amber-400">
                    <Check className="h-3 w-3" />
                    Sold · Case Study
                  </span>
                )}
                <a
                  href={zillowHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#006AFF] hover:bg-[#0055CC] text-white text-[12px] font-bold rounded-[6px] transition-colors"
                  data-testid="link-zillow"
                >
                  Zillow
                </a>
              </div>

              <h1
                className="font-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.0] tracking-tight text-white mb-3 break-words"
                data-testid="text-property-address"
              >
                {property.address}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-white/70 text-[16px]">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {property.city}, {property.state} {property.zip}
                  {isSold && <span className="text-white/50"> · Exited Investment</span>}
                </span>
              </div>

              <div className="flex gap-2 mt-4 md:hidden">
                <button
                  type="button"
                  className="p-2.5 rounded-[8px] border border-white/15 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all"
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-[8px] border border-white/15 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all"
                  title="Save"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-3 items-end">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-[12px] px-5 py-3.5 text-right min-w-[190px]">
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-white/40 mb-1">Purchase Price</p>
                <p className="font-mono text-[22px] font-medium text-white leading-none">${purchasePrice.toLocaleString()}</p>
              </div>
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-[12px] px-5 py-3.5 text-right min-w-[190px]">
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-white/40 mb-1">Est. Equity</p>
                <p className="font-mono text-[22px] font-medium text-green-400 leading-none">${estimatedEquityVal.toLocaleString()}</p>
              </div>
              <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-[12px] px-5 py-3.5 text-right min-w-[190px]">
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-white/40 mb-1">After Repair Value</p>
                <p className="font-mono text-[22px] font-medium text-white leading-none">${bpoValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedImage}
        slides={allImages.map((src) => ({ src }))}
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

      <div className="bg-[var(--bg-hex)] relative z-10 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/properties"
            className="inline-flex items-center text-[13px] font-medium text-[var(--text-secondary)] hover:text-primary transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </Link>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="flex flex-col">
            <section className="py-10 border-b border-[var(--line)]">
              {sectionLabel("Property")}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--line)] rounded-[16px] overflow-hidden bg-[var(--surface-hex)] divide-x divide-y divide-[var(--line)]">
                {[
                  { Icon: Bed, value: property.beds, label: "Bedrooms" },
                  { Icon: Bath, value: property.baths, label: "Bathrooms" },
                  { Icon: Ruler, value: (property.squareFeet ?? 0).toLocaleString(), label: "Sq. Ft." },
                  { Icon: Calendar, value: specDateValue, label: specDateLabel },
                ].map(({ Icon, value, label }, i) => (
                  <div key={i} className="px-5 py-6 hover:bg-[var(--surface-2-hex)] transition-colors">
                    <div className="w-9 h-9 bg-[var(--surface-2-hex)] rounded-[8px] grid place-items-center mb-4 text-[var(--text-tertiary)]">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <p className="font-serif text-[32px] leading-none text-[var(--text-primary)] mb-1.5">{value}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-10 border-b border-[var(--line)]">
              {sectionLabel("Deal Financials")}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[14px] p-6">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-3">PURCHASE PRICE</p>
                  <p className="font-mono text-[28px] font-medium text-[var(--text-primary)]">${purchasePrice.toLocaleString()}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-2">Your total investment</p>
                </div>
                <div className="bg-[var(--blue-muted)] border border-[var(--blue-border)] rounded-[14px] p-6">
                  <p className="text-[10px] uppercase tracking-wide text-blue-400/60 mb-3">AFTER REPAIR VALUE</p>
                  <p className="font-mono text-[28px] font-medium text-blue-400">${bpoValue.toLocaleString()}</p>
                  <p className="text-[11px] text-blue-400/50 mt-2">BPO-verified market value</p>
                </div>
                {!isSold && (
                  <div className="bg-[var(--green-muted)] border border-[var(--green-border)] rounded-[14px] p-6">
                    <p className="text-[10px] uppercase tracking-wide text-green-400/60 mb-3">EST. PROFIT</p>
                    <p className="font-mono text-[28px] font-medium text-green-400">${estimatedEquityVal.toLocaleString()}</p>
                    <p className="text-[11px] text-green-400/50 mt-2">50/50 split at sale</p>
                  </div>
                )}
              </div>

              <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[16px] p-7">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">Deal Waterfall</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {rehabBudget === 0 ? "$0 rehab budget" : `$${rehabBudget.toLocaleString()} rehab budget`}
                  </span>
                </div>

                {[
                  {
                    label: "Purchase",
                    widthPct: purchaseBarPct,
                    fillClass: "bg-[var(--surface-3-hex)] text-[var(--text-secondary)] border border-[var(--line)]",
                    value: `$${purchasePrice.toLocaleString()}`,
                  },
                  {
                    label: "Rehab",
                    widthPct: rehabBarPct,
                    fillClass: "bg-[var(--surface-3-hex)] text-[var(--text-secondary)] border border-[var(--line)]",
                    value: rehabBudget === 0 ? "$0" : `$${rehabBudget.toLocaleString()}`,
                    empty: rehabBudget === 0,
                  },
                  {
                    label: "ARV",
                    widthPct: 100,
                    fillClass: "bg-blue-500/25 border border-blue-500/20 text-blue-400",
                    value: `$${bpoValue.toLocaleString()}`,
                  },
                  {
                    label: "Net Equity",
                    widthPct: netEquityBarPct,
                    fillClass: "bg-green-500/20 border border-green-500/20 text-green-400",
                    value: `$${estimatedEquityVal.toLocaleString()}`,
                  },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-4 mb-3 last:mb-0">
                    <span className="text-[12px] text-[var(--text-tertiary)] w-[140px] flex-shrink-0">{row.label}</span>
                    <div className="flex-1 h-8 bg-[var(--surface-2-hex)] rounded-[6px] overflow-hidden">
                      <div
                        className={`h-full rounded-[6px] flex items-center px-3 font-mono text-[12px] font-medium min-w-0 ${row.fillClass}`}
                        style={{
                          width: row.empty ? "4px" : `${row.widthPct}%`,
                          minWidth: row.empty ? "4px" : undefined,
                        }}
                      >
                        {(row.empty || row.widthPct > 12) && <span className="truncate">{row.value}</span>}
                      </div>
                    </div>
                    <span className="font-mono text-[12px] text-[var(--text-tertiary)] w-20 text-right flex-shrink-0">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {!isSold && (
              <section className="py-10 border-b border-[var(--line)]">
                {sectionLabel("50 / 50 Profit Split")}
                <div className="grid grid-cols-2 gap-0.5 rounded-[16px] overflow-hidden mb-5">
                  <div className="bg-[var(--green-muted)] border border-[var(--green-border)] rounded-l-[16px] p-7">
                    <p className="text-[10px] uppercase tracking-wide text-green-400/60 mb-2">YOUR SHARE</p>
                    <p className="font-mono text-[38px] font-medium text-green-400 leading-none mb-2">
                      ${investorProfitShare.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      50% of net profit at sale
                      {usesGuaranteedMinimum && <span className="text-amber-400"> (Guaranteed Minimum)</span>}
                    </p>
                  </div>
                  <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-r-[16px] p-7">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-2">SSP SHARE</p>
                    <p className="font-mono text-[38px] font-medium text-[var(--text-secondary)] leading-none mb-2">
                      ${sspProfitShare.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">SSP manages all operations</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden flex mb-5 bg-[var(--surface-2-hex)]">
                  <div className="w-1/2 bg-green-500 rounded-full" />
                  <div className="w-1/2 bg-[var(--surface-3-hex)] rounded-full" />
                </div>
                <div className="flex items-center justify-between bg-[var(--surface-hex)] border border-[var(--line)] rounded-[12px] px-6 py-5">
                  <div>
                    <p className="text-[13px] text-[var(--text-secondary)]">Your Total Return at Sale</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">${investorTotalReturn.toLocaleString()} total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[26px] font-medium text-green-400">+{returnPercentage.toFixed(1)}%</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Est. ROI</p>
                  </div>
                </div>
              </section>
            )}

            <section className="py-10 border-b border-[var(--line)]">
              {sectionLabel("Deal Thesis")}
              {isSold ? (
                <div className="text-[15px] text-[var(--text-secondary)] leading-[1.85] space-y-4">
                  <p>
                    This property was successfully acquired, renovated, and sold as part of our value-add strategy. The project was secured off-market at a competitive entry price and executed through a standardized, low-risk cosmetic update. The renovation focused on high-impact basics—new flooring, fresh paint, and general improvements—to bring the property to market standards and maximize resale value.
                  </p>
                  {property.description && <p>{property.description}</p>}
                </div>
              ) : (
                <>
                  <div
                    className="text-[15px] text-[var(--text-secondary)] leading-[1.85] space-y-4 [&_p]:mb-4"
                    dangerouslySetInnerHTML={{
                      __html: generatePropertyDescription(property)
                        .split("\n\n")
                        .map((para) => `<p>${para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`)
                        .join(""),
                    }}
                    data-testid="text-property-description"
                  />
                  <div className="mt-7 pl-5 border-l-4 border-primary bg-[var(--surface-hex)] rounded-r-[12px] p-5 text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                    This opportunity represents a clear value-add scenario secured off-market at a competitive entry price. You fund the purchase. SSP handles rehab & management. When the property sells, you get your capital back plus your 50% profit share.
                  </div>
                </>
              )}
            </section>

            {isSold && (
              <section className="lg:hidden py-10 border-b border-[var(--line)]">
                {sectionLabel("Deal Outcome")}
                <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] p-6 space-y-4">
                  {property.exitDate && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[var(--text-secondary)]">Exit Date</span>
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        {new Date(property.exitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {property.finalSalePrice != null && (
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Final Sale Price</p>
                      <p className="font-mono text-2xl font-medium text-green-400">${property.finalSalePrice.toLocaleString()}</p>
                    </div>
                  )}
                  {property.investorProfit != null && (
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-tertiary)] mb-1">Investor Profit</p>
                      <p className="font-mono text-2xl font-medium text-green-400">${property.investorProfit.toLocaleString()}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-12 border-[var(--line)]" data-testid="button-case-study">
                    <Download className="mr-2 w-4 h-4" />
                    Download Case Study PDF
                  </Button>
                </div>
              </section>
            )}

            <div className="lg:hidden py-10 border-b border-[var(--line)]">
              {sectionLabel("Profit Calculator")}
              {profitCalculatorCard}
            </div>

            {hasComps && (
              <section className="py-10 border-b border-[var(--line)]">
                {sectionLabel("Location & Comps")}
                <div className="rounded-[16px] overflow-hidden h-[280px] border border-[var(--line)] mb-6">
                  <CompsMap
                    subjectAddress={property.address}
                    subjectCity={property.city}
                    subjectState={property.state}
                    subjectZip={property.zip}
                    comps={compsForMap}
                  />
                </div>
                <div className="w-full border border-[var(--line)] rounded-[14px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--surface-2-hex)]">
                      <tr>
                        {["Address", "Beds·Baths", "Sq.Ft.", "Sale Price", "Sold"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-[10px] uppercase tracking-[0.1em] font-semibold text-[var(--text-tertiary)] border-b border-[var(--line)]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[var(--surface-hex)] border-b border-[var(--line)] hover:bg-[var(--surface-2-hex)] transition-colors">
                        <td className="px-4 py-3.5 text-[13px]">
                          <span className="text-[var(--text-primary)] font-medium">{property.address}</span>
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded ml-2">Subject</span>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                          {property.beds}·{property.baths}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                          {(property.squareFeet ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-primary font-mono font-medium">
                          ${purchasePrice.toLocaleString()} <span className="text-[11px] font-sans">(acq.)</span>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">—</td>
                      </tr>
                      {comps.map((comp, idx) => (
                        <tr
                          key={comp.id ?? idx}
                          className="bg-[var(--surface-hex)] hover:bg-[var(--surface-2-hex)] border-b border-[var(--line)] last:border-b-0 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] mr-2 align-middle" />
                            {comp.address?.split(",")[0]}
                          </td>
                          <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                            {comp.beds}·{comp.baths}
                          </td>
                          <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                            {comp.sqft?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[13px] text-[var(--text-primary)]">${comp.price?.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-[13px] text-[var(--text-secondary)]">
                            {comp.soldDate ? new Date(comp.soldDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {(isAvailable || isCommitted) && (
              <section className="py-10 border-b border-[var(--line)]">
                {sectionLabel("Deal Timeline")}
                <div className="relative pl-2">
                  <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[var(--line)]" />
                  {[
                    {
                      title: "Deal Sourced Off-Market",
                      meta: "HUD acquisition, clear title",
                      state: "done" as const,
                    },
                    {
                      title: isAvailable ? "Funding Open" : "Funding Committed",
                      meta: `Seeking full capital commitment · ${closingDaysRemaining} days remaining`,
                      state: "active" as const,
                    },
                    {
                      title: "Closing",
                      meta: property.closingDate
                        ? new Date(property.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "TBD",
                      state: "future" as const,
                    },
                    {
                      title: "Renovation & Listing",
                      meta: "Cosmetic update, list on market",
                      state: "future" as const,
                    },
                    {
                      title: "Exit & Profit Distribution",
                      meta: "Capital + profit returned to investor",
                      state: "future" as const,
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className={`relative flex gap-5 pb-8 last:pb-0 ${step.state === "future" ? "opacity-40" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full grid place-items-center flex-shrink-0 z-10 ${
                          step.state === "done"
                            ? "bg-[var(--green-muted)] border-2 border-[var(--green-border)]"
                            : step.state === "active"
                              ? "bg-[var(--accent-muted)] border-2 border-primary/30"
                              : "bg-[var(--surface-2-hex)] border-2 border-[var(--line)]"
                        }`}
                      >
                        {step.state === "done" && (
                          <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                        {step.state === "active" && <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />}
                        {step.state === "future" && <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full" />}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                          {step.title}
                          {step.state === "active" && (
                            <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full ml-2 font-semibold">
                              You Are Here
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-[var(--text-tertiary)] mt-1">{step.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="py-10">
              {sectionLabel("Documents")}
              {documents.length > 0 ? (
                <div>
                  {documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3.5 bg-[var(--surface-hex)] border border-[var(--line)] rounded-[10px] hover:border-[var(--line-light)] hover:bg-[var(--surface-2-hex)] transition-all cursor-pointer group mb-2"
                    >
                      <div className="w-9 h-9 bg-[var(--surface-2-hex)] rounded-[8px] grid place-items-center text-primary flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-primary transition-colors truncate">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          {doc.type || "PDF"} {doc.size ? `· ${(doc.size / 1024).toFixed(1)} KB` : ""}
                        </p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-[var(--text-tertiary)] group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[14px] p-10 text-center">
                  <FileText className="h-9 w-9 text-[var(--line-light)] mx-auto mb-3" />
                  <p className="text-[13px] text-[var(--text-tertiary)]">No documents uploaded yet</p>
                  <p className="text-[11px] mt-1 opacity-60 text-[var(--text-tertiary)]">Documents appear here once uploaded</p>
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:flex flex-col gap-4 sticky top-[80px]">
            {sidebarCommitCard}

            <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] p-6">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">Deal Terms</span>
                <span className="text-[10px] bg-[var(--surface-2-hex)] border border-[var(--line)] text-[var(--text-tertiary)] px-2 py-0.5 rounded-[4px]">
                  50/50 JV
                </span>
              </div>
              {[
                { Icon: Shield, label: "Structure", value: "Deal-by-deal JV partnership" },
                { Icon: TrendingUp, label: "Profit Split", value: "50% investor / 50% SSP at sale" },
                { Icon: DollarSign, label: "Fees", value: "No fees. 100% transparent." },
                { Icon: Lock, label: "Security", value: "First-position lien on title" },
                { Icon: Calendar, label: "Est. Hold Period", value: "90–120 days" },
              ].map(({ Icon, label, value }, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--line)] last:border-b-0">
                  <div className="w-7 h-7 bg-[var(--surface-2-hex)] rounded-[6px] grid place-items-center text-[var(--text-tertiary)] flex-shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.04em] font-semibold text-[var(--text-tertiary)] mb-0.5">{label}</p>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {profitCalculatorCard}

            <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] p-6 text-center">
              <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-2">Questions before committing?</p>
              <p className="text-[12px] text-[var(--text-tertiary)] leading-[1.6] mb-5">
                Most investors go from curious to committed after one 30-minute call. No pressure, just a real conversation.
              </p>
              <a href="https://calendly.com/sspdealflow/30min" target="_blank" rel="noopener noreferrer" className="block">
                <button
                  type="button"
                  className="w-full border border-[var(--line-light)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-[8px] py-3 text-[13px] font-medium transition-all flex items-center justify-center gap-2 bg-transparent cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  Book a 30-min Intro Call
                </button>
              </a>
            </div>
          </aside>
        </div>
      </div>

      {!isSold && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-hex)] border-t border-[var(--line)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isAvailable ? (
            <a
              href="https://calendly.com/sspdealflow/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-md flex items-center justify-center gap-2"
              data-testid="button-invest-mobile-sticky"
              onClick={handleInvestClick}
            >
              Commit to Invest
              <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <Button
              className="w-full h-14 text-base font-semibold opacity-50 cursor-not-allowed"
              disabled
              data-testid="button-invest-mobile-sticky"
            >
              Funding Secured
            </Button>
          )}
        </div>
      )}
    </Layout>
  );
}
