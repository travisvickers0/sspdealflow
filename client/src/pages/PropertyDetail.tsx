import { Layout } from "@/components/Layout";
import { PropertyPhotoGallery } from "@/components/property/PropertyPhotoGallery";
import { useProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { useRoute, Link, Redirect } from "wouter";
import {
  MapPin,
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
import { getPropertyDisplayStatus } from "@/lib/propertyStatus";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { data: property, isLoading } = useProperty(params?.slug);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestForm, setInterestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);

  const galleryImages = property?.galleryPhotoUrls || [];
  const allImages = property?.mainPhotoUrl ? [property.mainPhotoUrl, ...galleryImages] : galleryImages;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  useEffect(() => {
    setInterestOpen(false);
    setInterestSuccess(false);
    setInterestForm({ fullName: "", email: "", phone: "", message: "" });
  }, [property?.id]);

  useEffect(() => {
    if (user) {
      setInterestForm((f) => ({
        ...f,
        fullName: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : f.fullName,
        email: user.email ?? f.email,
      }));
    }
  }, [user]);

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

  const normalizedStatus = getPropertyDisplayStatus(property.status);

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

  investorProfitShare = Math.round(investorProfitShare);
  sspProfitShare = Math.round(sspProfitShare);

  const investorTotalReturn = purchasePrice + investorProfitShare;

  const handleInterestSubmit = async () => {
    if (!property) return;
    if (!interestForm.fullName || !interestForm.email) return;
    setInterestSubmitting(true);
    try {
      await apiRequest("POST", "/api/property-interest", {
        propertyId: property.id,
        propertyAddress: property.address,
        ...interestForm,
      });
      setInterestSuccess(true);

      posthog.capture('invest_submitted', {
        property_id: property.id,
        property_address: property.address,
        estimated_equity: property.estimatedEquity,
        purchase_price: property.purchasePrice,
        investor_name: interestForm.fullName,
        has_phone: Boolean(interestForm.phone),
        has_message: Boolean(interestForm.message),
      });
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'begin_checkout', {
          items: [{
            item_id: String(property.id),
            item_name: property.address,
            price: property.purchasePrice,
          }],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInterestSubmitting(false);
    }
  };

  const zillowHref =
    property.zillowUrl ??
    `https://www.zillow.com/homes/${encodeURIComponent(
      `${property.address} ${property.city} ${property.state} ${property.zip}`
        .replace(/,/g, "")
        .replace(/\s+/g, "-")
        .trim(),
    )}_rb/`;

  const handleShareProperty = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.address,
          text: `${property.address}, ${property.city}, ${property.state}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const mobileStreetAddress = property.address
    .replace(new RegExp(`,?\\s*${property.city},\\s*${property.state}\\s+${property.zip}$`), "")
    .split(",")[0]
    .trim();

  const bpoValue = property.bpoValue ?? 0;
  const rehabBudget = property.rehabBudget ?? 0;
  const estimatedEquityVal = property.estimatedEquity ?? 0;
  const purchaseBarPct = bpoValue > 0 ? Math.min(95, (purchasePrice / bpoValue) * 100) : 0;
  const rehabBarPct = bpoValue > 0 ? Math.min(100, (rehabBudget / bpoValue) * 100) : 0;
  const netEquityBarPct = bpoValue > 0 ? Math.min(100, (estimatedEquityVal / bpoValue) * 100) : 0;

  const closingDaysRemaining = property.closingDate
    ? Math.max(0, Math.ceil((new Date(property.closingDate).getTime() - Date.now()) / 86400000))
    : 14;

  const documents = Array.isArray(property.documents) ? (property.documents as { url: string; name: string; type?: string; size?: number }[]) : [];

  /** Prefer linking the processed BPO/valuation PDF near the comps map */
  const valuationPdf = documents.find((d) => {
    const blob = `${d.name} ${d.type ?? ""}`.toLowerCase();
    return /\.pdf$/i.test(d.name) && /bpo|valuation|broker|comp|appraisal|mao|ssp\s*·?\s*valuation/i.test(blob);
  }) ?? documents.find((d) => /\.pdf$/i.test(d.name));

  const rawComps =
    (property.comps as {
      id?: string;
      address?: string;
      beds?: number;
      baths?: number;
      sqft?: number;
      price?: number;
      soldDate?: string;
      lat?: number;
      lng?: number;
    }[]) || [];
  const comps = rawComps;
  const compsForMap = comps.map((c, i) => ({
    id: String(c.id ?? i),
    address: c.address ?? "",
    beds: c.beds,
    baths: c.baths,
    sqft: c.sqft,
    price: c.price,
    soldDate: c.soldDate,
    lat: typeof c.lat === "number" ? c.lat : undefined,
    lng: typeof c.lng === "number" ? c.lng : undefined,
  }));
  const hasComps = Array.isArray(comps) && comps.length > 0;

  const closingDateDisplay = property.closingDate
    ? new Date(property.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "TBD";

  const specDateLabel = "Closing";
  const specDateValue = property.closingDate
    ? new Date(property.closingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const sectionLabel = (label: string, className = "mb-6") => (
    <div className={`hidden lg:flex items-center gap-3 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-[var(--line)]" />
    </div>
  );
  const mobileSectionLabel = (label: string) => (
    <p className="lg:hidden text-[10px] font-semibold tracking-[0.12em] uppercase text-[var(--text-tertiary)] mb-3">
      {label}
    </p>
  );
  const mobileSectionDividerClassName = "border-t border-[var(--line)] my-6 lg:hidden";
  const fundingStatusPillClassName =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide";
  const fundingStatusLabel = isAvailable
    ? "Open"
    : isCommitted
      ? "Committed"
      : isFunded
        ? "Funded"
        : "Sold";
  const fundingStatusClassName = isAvailable
    ? "bg-green-500/15 border border-green-500/20 text-green-400"
    : isCommitted || isFunded
      ? "bg-blue-500/15 border border-blue-500/20 text-blue-400"
      : "bg-amber-500/15 border border-amber-500/20 text-amber-400";

  const profitCalculatorCard = (
    <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Profit Calculator</span>
        <span className="text-[10px] bg-[var(--surface-2-hex)] border border-[var(--line)] text-[var(--text-tertiary)] px-2 py-0.5 rounded-full">
          50/50 Split
        </span>
      </div>

      <div className="p-4 bg-[var(--surface-2-hex)] rounded-xl border border-[var(--line)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Your Investment</span>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Full purchase price</p>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)] break-words">${purchasePrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 bg-[var(--blue-muted)] rounded-xl border border-[var(--blue-border)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            {isSold ? "Final Project Profit" : "Total Projected Equity"}
          </span>
          <span className="text-lg sm:text-xl font-mono font-bold text-blue-400 break-words">${totalEquity.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-blue-400/70">
          {isSold ? "Total profit realized at exit" : "ARV minus purchase price and rehab costs"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-3">
          <div>
            <span className="text-sm font-semibold text-[var(--text-secondary)]">Your Total Return</span>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Investment + profit share</p>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-bold text-green-400 break-words">${investorTotalReturn.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-[var(--green-border)]">
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
              <div>
                {!interestOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInterestOpen(true);
                      posthog.capture('invest_form_opened', {
                        property_id: property.id,
                        property_address: property.address,
                        estimated_equity: property.estimatedEquity,
                        purchase_price: property.purchasePrice,
                      });
                    }}
                    className={investButtonClass}
                    data-testid="button-invest"
                  >
                    I'm In — Contact Me
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : !interestSuccess ? (
                  <div className="space-y-3">
                    <p className="text-[12px] text-[var(--text-tertiary)] mb-1">
                      We'll call you within 2 hours to finalize.
                    </p>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={interestForm.fullName}
                      onChange={(e) => setInterestForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={interestForm.email}
                      onChange={(e) => setInterestForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={interestForm.phone}
                      onChange={(e) => setInterestForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleInterestSubmit}
                      disabled={interestSubmitting || !interestForm.fullName || !interestForm.email}
                      className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold text-[14px] py-3 rounded-[8px] flex items-center justify-center gap-2 transition-all"
                      data-testid="button-invest-submit"
                    >
                      {interestSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Confirm Interest <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestOpen(false)}
                      className="w-full text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-full grid place-items-center mx-auto mb-3">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M3.5 9l4 4 7-8"
                          stroke="#22c55e"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">We got it — you're on this deal.</p>
                    <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                      Travis will call you within 2 hours to walk through next steps.
                    </p>
                  </div>
                )}
                {!interestOpen && !interestSuccess && (
                  <a
                    href="https://calendly.com/sspdealflow/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors mt-2"
                  >
                    Prefer to schedule a call instead →
                  </a>
                )}
              </div>
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
      <div className="bg-[var(--bg-hex)] relative z-10 min-h-screen">
        <div className="pt-4 sm:pt-6 lg:pt-8">
          <PropertyPhotoGallery
            images={allImages}
            address={property.address}
          />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-6 mt-6 pb-0 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 sm:gap-10 items-start">
          <div className="flex flex-col pb-28 sm:pb-0">
            <section className="lg:hidden mb-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className={`${fundingStatusPillClassName} ${fundingStatusClassName}`}>
                    {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    {fundingStatusLabel}
                  </span>
                  <a
                    href={zillowHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006aff] text-white text-[11px] font-semibold transition-colors hover:bg-[#0058d4]"
                    data-testid="link-zillow"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                      <path d="M12 2L2 9.5V22h7v-7h6v7h7V9.5L12 2z" />
                    </svg>
                    Zillow
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleShareProperty}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  title="Share"
                  aria-label="Share property"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <h1
                className="text-[26px] font-bold tracking-[-0.025em] text-[var(--text-primary)] leading-[1.1] mb-2"
                data-testid="text-property-address"
              >
                {mobileStreetAddress}
              </h1>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.72 3.5 6.5 3.5 6.5s3.5-3.78 3.5-6.5C9.5 2.57 7.93 1 6 1z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle cx="6" cy="4.5" r="1.2" fill="currentColor" />
                </svg>
                {property.city}, {property.state} {property.zip}
              </div>
            </section>

            <section className="hidden lg:block lg:pb-10 lg:border-b border-[var(--line)]">
              <div className="mb-6 lg:mb-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`${fundingStatusPillClassName} ${fundingStatusClassName}`}>
                    {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    {fundingStatusLabel}
                  </span>
                  <a
                    href={zillowHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006aff] text-white text-[11px] font-semibold transition-colors hover:bg-[#0058d4]"
                    data-testid="link-zillow"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                      <path d="M12 2L2 9.5V22h7v-7h6v7h7V9.5L12 2z" />
                    </svg>
                    Zillow
                  </a>
                  <button
                    type="button"
                    onClick={handleShareProperty}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    title="Share"
                    aria-label="Share property"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                <h1
                  className="font-serif text-3xl lg:text-[44px] leading-[1.05] tracking-tight text-[var(--text-primary)] mb-3 break-words"
                  data-testid="text-property-address"
                >
                  {property.address}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" />
                  <span>
                    {property.city}, {property.state} {property.zip}
                  </span>
                </div>
              </div>
            </section>
            <div className="hidden lg:block border-t border-[var(--line)] my-0" />

            <section className="lg:py-10 lg:border-b border-[var(--line)]">
              <div className="mb-6 lg:mb-0">
                {mobileSectionLabel("PROPERTY")}
                {sectionLabel("Property", "mt-0 mb-3")}
                <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--line)] rounded-[16px] overflow-hidden bg-[var(--surface-hex)] divide-x divide-y divide-[var(--line)]">
                {[
                  { Icon: Bed, value: property.beds, label: "Bedrooms" },
                  { Icon: Bath, value: property.baths, label: "Bathrooms" },
                  {
                    Icon: Ruler,
                    value: property.squareFeet ? property.squareFeet.toLocaleString() : "—",
                    label: "Sq Ft",
                  },
                  { Icon: Calendar, value: specDateValue, label: specDateLabel },
                ].map(({ Icon, value, label }, i) => (
                  <div key={i} className="p-3.5 lg:p-5 hover:bg-[var(--surface-2-hex)] transition-colors">
                    <div className="w-7 h-7 lg:w-9 lg:h-9 bg-[var(--surface-2-hex)] rounded-[8px] grid place-items-center mb-2.5 lg:mb-4 text-[var(--text-tertiary)]">
                      <Icon className="h-4 w-4 lg:h-6 lg:w-6" strokeWidth={1.5} />
                    </div>
                    <p className="font-serif text-[22px] lg:text-[28px] leading-none text-[var(--text-primary)] mb-1.5 break-words">{value}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{label}</p>
                  </div>
                ))}
                </div>
              </div>
            </section>
            <div className={mobileSectionDividerClassName} />

            <section className="lg:py-10 lg:border-b border-[var(--line)]">
              <div className="mb-6 lg:mb-0">
                {mobileSectionLabel("DEAL FINANCIALS")}
                {sectionLabel("Deal Financials", "mt-0 mb-2")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-3 mb-6 lg:mb-8">
                <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[10px] sm:rounded-[14px] p-4 sm:p-6 mb-3 sm:mb-0">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-3">PURCHASE PRICE</p>
                  <p className="font-mono text-[24px] sm:text-[28px] font-medium text-[var(--text-primary)] break-words">${purchasePrice.toLocaleString()}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-2">Your total investment</p>
                </div>
                <div className="bg-[var(--blue-muted)] border border-[var(--blue-border)] rounded-[10px] sm:rounded-[14px] p-4 sm:p-6 mb-3 sm:mb-0">
                  <p className="text-[10px] uppercase tracking-wide text-blue-400/60 mb-3">AFTER REPAIR VALUE</p>
                  <p className="font-mono text-[24px] sm:text-[28px] font-medium text-blue-400 break-words">${bpoValue.toLocaleString()}</p>
                  <p className="text-[11px] text-blue-400/50 mt-2">BPO-verified market value</p>
                </div>
                {!isSold && (
                  <div className="bg-[var(--green-muted)] border border-[var(--green-border)] rounded-[10px] sm:rounded-[14px] p-4 sm:p-6">
                    <p className="text-[10px] uppercase tracking-wide text-green-400/60 mb-3">EST. PROFIT</p>
                    <p className="font-mono text-[24px] sm:text-[28px] font-medium text-green-400 break-words">${estimatedEquityVal.toLocaleString()}</p>
                    <p className="text-[11px] text-green-400/50 mt-2">50/50 split at sale</p>
                  </div>
                )}
              </div>

              <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[16px] p-5 sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">Deal Waterfall</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] sm:text-right">
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
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)_80px] gap-2 sm:gap-4 items-center mb-3 last:mb-0">
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <span className="text-[12px] text-[var(--text-tertiary)]">{row.label}</span>
                      <span className="font-mono text-[12px] text-[var(--text-tertiary)] sm:hidden">{row.value}</span>
                    </div>
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
                    <span className="hidden sm:block font-mono text-[12px] text-[var(--text-tertiary)] w-20 text-right flex-shrink-0">{row.value}</span>
                  </div>
                ))}
              </div>
              </div>
            </section>
            <div className={mobileSectionDividerClassName} />

            {!isSold && (
              <>
                <section className="lg:py-10 lg:border-b border-[var(--line)]">
                  <div className="mb-6 lg:mb-0">
                    {mobileSectionLabel("50/50 PROFIT SPLIT")}
                    {sectionLabel("50 / 50 Profit Split")}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0.5 rounded-[16px] overflow-hidden mb-5">
                  <div className="bg-[var(--green-muted)] border border-[var(--green-border)] rounded-[16px] sm:rounded-l-[16px] sm:rounded-r-none p-5 sm:p-7">
                    <p className="text-[10px] uppercase tracking-wide text-green-400/60 mb-2">YOUR SHARE</p>
                    <p className="font-mono text-[32px] sm:text-[38px] font-medium text-green-400 leading-none mb-2 break-words">
                      ${investorProfitShare.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      50% of net profit at sale
                      {usesGuaranteedMinimum && <span className="text-amber-400"> (Guaranteed Minimum)</span>}
                    </p>
                  </div>
                  <div className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[16px] sm:rounded-r-[16px] sm:rounded-l-none p-5 sm:p-7">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-2">SSP SHARE</p>
                    <p className="font-mono text-[32px] sm:text-[38px] font-medium text-[var(--text-secondary)] leading-none mb-2 break-words">
                      ${sspProfitShare.toLocaleString()}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">SSP manages all operations</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden flex mb-5 bg-[var(--surface-2-hex)]">
                  <div className="w-1/2 bg-green-500 rounded-full" />
                  <div className="w-1/2 bg-[var(--surface-3-hex)] rounded-full" />
                </div>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--surface-hex)] border border-[var(--line)] rounded-[12px] px-5 sm:px-6 py-5">
                  <div>
                    <p className="text-[13px] text-[var(--text-secondary)]">Your Total Return at Sale</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">${investorTotalReturn.toLocaleString()} total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[26px] font-medium text-green-400">+{returnPercentage.toFixed(1)}%</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Est. ROI</p>
                  </div>
                </div>
                  </div>
                </section>
                <div className={mobileSectionDividerClassName} />
              </>
            )}

            <section className="lg:py-10 lg:border-b border-[var(--line)]">
              <div className="mb-6 lg:mb-0">
                {mobileSectionLabel("DEAL THESIS")}
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
                    <div className="mt-6 lg:mt-7 pl-5 border-l-4 border-primary bg-[var(--surface-hex)] rounded-r-[12px] p-5 text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                    This opportunity represents a clear value-add scenario secured off-market at a competitive entry price. You fund the purchase. SSP handles rehab & management. When the property sells, you get your capital back plus your 50% profit share.
                    </div>
                  </>
                )}
              </div>
            </section>
            <div className={mobileSectionDividerClassName} />

            {isSold && (
              <>
                <section className="lg:hidden">
                  <div className="mb-6">
                    {mobileSectionLabel("DEAL OUTCOME")}
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
                  </div>
                </section>
                <div className={mobileSectionDividerClassName} />
              </>
            )}

            <div className="lg:hidden mb-6">
              {mobileSectionLabel("PROFIT CALCULATOR")}
              {profitCalculatorCard}
            </div>
            <div className={mobileSectionDividerClassName} />

            {hasComps && (
              <>
                <section className="lg:py-10 lg:border-b border-[var(--line)]">
                  <div className="mb-6 lg:mb-0">
                    {mobileSectionLabel("LOCATION & COMPS")}
                    {sectionLabel("Location & Comps")}
                    {valuationPdf && (
                      <a
                        href={valuationPdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mb-4 text-[13px] font-medium text-primary hover:underline"
                        data-testid="link-valuation-pdf"
                      >
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        Open valuation / BPO PDF ({valuationPdf.name})
                      </a>
                    )}
                    <div className="rounded-[16px] overflow-hidden h-[280px] border border-[var(--line)] mb-6">
                  <CompsMap
                    subjectAddress={property.address}
                    subjectCity={property.city}
                    subjectState={property.state}
                    subjectZip={property.zip}
                    comps={compsForMap}
                  />
                </div>
                <div className="w-full border border-[var(--line)] rounded-[14px] overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
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
                  </div>
                </section>
                <div className={mobileSectionDividerClassName} />
              </>
            )}

            {(isAvailable || isCommitted) && (
              <>
                <section className="lg:py-10 lg:border-b border-[var(--line)]">
                  <div className="mb-6 lg:mb-0">
                    {mobileSectionLabel("DEAL TIMELINE")}
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
                  </div>
                </section>
                <div className={mobileSectionDividerClassName} />
              </>
            )}

            <section className="lg:py-10">
              <div className="mb-6 lg:mb-0">
                {mobileSectionLabel("DOCUMENTS")}
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
              </div>
            </section>
          </div>

          <aside className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-[80px]">
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
            <div>
              {!interestOpen ? (
                <button
                  type="button"
                  onClick={() => {
                    setInterestOpen(true);
                    posthog.capture('invest_form_opened', {
                      property_id: property.id,
                      property_address: property.address,
                      estimated_equity: property.estimatedEquity,
                      purchase_price: property.purchasePrice,
                    });
                  }}
                  className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-md flex items-center justify-center gap-2"
                  data-testid="button-invest-mobile-sticky"
                >
                  I'm In — Contact Me
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : !interestSuccess ? (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pb-1">
                  <p className="text-[12px] text-[var(--text-tertiary)] mb-1 text-center">
                    We'll call you within 2 hours to finalize.
                  </p>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={interestForm.fullName}
                    onChange={(e) => setInterestForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={interestForm.email}
                    onChange={(e) => setInterestForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={interestForm.phone}
                    onChange={(e) => setInterestForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[var(--surface-2-hex)] border border-[var(--line-light)] rounded-[8px] text-[var(--text-primary)] text-[13px] px-3 py-2.5 outline-none placeholder:text-[var(--text-tertiary)] focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleInterestSubmit}
                    disabled={interestSubmitting || !interestForm.fullName || !interestForm.email}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold text-[14px] py-3 rounded-[8px] flex items-center justify-center gap-2 transition-all"
                    data-testid="button-invest-submit"
                  >
                    {interestSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Confirm Interest <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestOpen(false)}
                    className="w-full text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-full grid place-items-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M3.5 9l4 4 7-8"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">We got it — you're on this deal.</p>
                  <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                    Travis will call you within 2 hours to walk through next steps.
                  </p>
                </div>
              )}
              {!interestOpen && !interestSuccess && (
                <a
                  href="https://calendly.com/sspdealflow/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors mt-2"
                >
                  Prefer to schedule a call instead →
                </a>
              )}
            </div>
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
