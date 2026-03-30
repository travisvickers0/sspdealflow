import { Layout } from "@/components/Layout";
import { useProperties } from "@/hooks/useProperties";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Map as MapIcon,
  List,
  Loader2,
  Building2,
  DollarSign,
  TrendingUp,
  Home,
  LogIn,
  ArrowRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Property } from "@shared/schema";
import { MarketplaceMap } from "@/components/MarketplaceMap";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

const normalizeStatus = (status: string): string => {
  if (status === "needs_funding" || status === "committed") return "AVAILABLE";
  if (status === "funded" || status === "archived") return "FUNDED";
  return status;
};

export default function Properties() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    data: properties,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useProperties({
    refetchInterval: 10000,
    enabled: isAuthenticated,
  });
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties
      .filter((p) => {
        const matchesSearch =
          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.zip.includes(searchQuery);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "open" &&
            normalizeStatus(p.status) === "AVAILABLE") ||
          (statusFilter === "funded" &&
            normalizeStatus(p.status) === "FUNDED");

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const statusOrder = { AVAILABLE: 0, FUNDED: 1, SOLD: 2 };
        const statusA = normalizeStatus(a.status);
        const statusB = normalizeStatus(b.status);
        const statusDiff =
          (statusOrder[statusA as keyof typeof statusOrder] ?? 99) -
          (statusOrder[statusB as keyof typeof statusOrder] ?? 99);

        if (statusDiff !== 0) return statusDiff;

        switch (sortBy) {
          case "price_asc":
            return a.purchasePrice - b.purchasePrice;
          case "price_desc":
            return b.purchasePrice - a.purchasePrice;
          case "equity":
            return b.estimatedEquity - a.estimatedEquity;
          case "closing_soonest":
            const dateA = a.closingDate
              ? new Date(a.closingDate).getTime()
              : Infinity;
            const dateB = b.closingDate
              ? new Date(b.closingDate).getTime()
              : Infinity;
            return dateA - dateB;
          case "closing_latest":
            const lateDateA = a.closingDate
              ? new Date(a.closingDate).getTime()
              : 0;
            const lateDateB = b.closingDate
              ? new Date(b.closingDate).getTime()
              : 0;
            return lateDateB - lateDateA;
          case "newest":
          default:
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
        }
      });
  }, [properties, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    if (!properties)
      return { total: 0, totalSpread: 0, needsFunding: 0, fundedDeals: 0 };

    const total = properties.length;
    const totalSpread = properties.reduce(
      (sum, p) => sum + (p.estimatedEquity || 0),
      0,
    );
    const needsFunding = properties.filter(
      (p) => normalizeStatus(p.status) === "AVAILABLE",
    ).length;
    const fundedDeals = properties.filter(
      (p) => normalizeStatus(p.status) === "FUNDED",
    ).length;

    return { total, totalSpread, needsFunding, fundedDeals };
  }, [properties]);

  const fundingOpenList = useMemo(
    () =>
      filteredProperties.filter(
        (p) => normalizeStatus(p.status) === "AVAILABLE",
      ),
    [filteredProperties],
  );

  const fundedClosedList = useMemo(
    () =>
      filteredProperties.filter(
        (p) =>
          normalizeStatus(p.status) === "FUNDED" ||
          normalizeStatus(p.status) === "SOLD",
      ),
    [filteredProperties],
  );

  const featuredDeal =
    statusFilter === "all" || statusFilter === "open"
      ? (fundingOpenList[0] ?? null)
      : null;

  const gridOpenList = featuredDeal
    ? fundingOpenList.filter((p) => p.id !== featuredDeal.id)
    : fundingOpenList;

  if (authLoading || (isAuthenticated && isLoading)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-[var(--bg-hex)]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Sign In Required
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Access our exclusive marketplace of vetted real estate investment
              opportunities. Sign in to view available deals and start investing.
            </p>
            <a
              href="/api/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-sign-in"
            >
              <LogIn className="h-4 w-4" />
              Sign In to Continue
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-[var(--bg-hex)]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Couldn&apos;t load the marketplace
            </h1>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6">
              {error instanceof Error ? error.message : "Something went wrong. Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
              data-testid="button-retry-properties"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Try again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-hex)] text-[var(--text-primary)]">
        {/* ── PAGE HEADER ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-12 pb-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-3">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Live Deal Room
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] leading-[1.0] tracking-tight text-[var(--text-primary)] mb-3">
            Available{" "}
            <em className="italic text-primary">Opportunities</em>
          </h1>
          <p className="text-[14px] text-[var(--text-tertiary)] mb-0">
            Vetted off-market acquisitions. Updated weekly.
          </p>
        </div>

        {/* ── STATS BAND ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-[14px] p-5 sm:p-6 border cursor-pointer text-left transition-all ${
                statusFilter === "all"
                  ? "border-primary/30 bg-primary/5 border-b-2 border-b-primary"
                  : "border-[var(--line)] bg-[var(--surface-hex)] hover:border-[var(--line-light)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-[0.1em] font-semibold mb-2 ${
                      statusFilter === "all"
                        ? "text-primary/60"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    Total Properties
                  </p>
                  <p
                    className={`font-mono text-[28px] sm:text-[30px] font-medium leading-none ${
                      statusFilter === "all"
                        ? "text-primary"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {stats.total}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-[8px] grid place-items-center flex-shrink-0 ${
                    statusFilter === "all"
                      ? "bg-primary/10"
                      : "bg-[var(--surface-2-hex)]"
                  }`}
                >
                  <Building2
                    className={`h-5 w-5 ${
                      statusFilter === "all"
                        ? "text-primary"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  />
                </div>
              </div>
            </button>

            <div className="rounded-[14px] p-5 sm:p-6 border border-[var(--line)] bg-[var(--surface-hex)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-green-400/60 mb-2">
                    Total Equity
                  </p>
                  <p className="font-mono text-[28px] sm:text-[30px] font-medium leading-none text-green-400">
                    ${(stats.totalSpread / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[8px] grid place-items-center bg-green-500/10 flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatusFilter("open")}
              className={`rounded-[14px] p-5 sm:p-6 border cursor-pointer text-left transition-all ${
                statusFilter === "open"
                  ? "border-amber-500/30 bg-amber-500/5 border-b-2 border-b-amber-500"
                  : "border-[var(--line)] bg-[var(--surface-hex)] hover:border-[var(--line-light)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-[0.1em] font-semibold mb-2 ${
                      statusFilter === "open"
                        ? "text-amber-500/60"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    Needs Funding
                  </p>
                  <p
                    className={`font-mono text-[28px] sm:text-[30px] font-medium leading-none ${
                      statusFilter === "open"
                        ? "text-amber-400"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {stats.needsFunding}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-[8px] grid place-items-center flex-shrink-0 ${
                    statusFilter === "open"
                      ? "bg-amber-500/10"
                      : "bg-[var(--surface-2-hex)]"
                  }`}
                >
                  <Home
                    className={`h-5 w-5 ${
                      statusFilter === "open"
                        ? "text-amber-400"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("funded")}
              className={`rounded-[14px] p-5 sm:p-6 border cursor-pointer text-left transition-all ${
                statusFilter === "funded"
                  ? "border-blue-500/30 bg-blue-500/5 border-b-2 border-b-blue-500"
                  : "border-[var(--line)] bg-[var(--surface-hex)] hover:border-[var(--line-light)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-[10px] uppercase tracking-[0.1em] font-semibold mb-2 ${
                      statusFilter === "funded"
                        ? "text-blue-400/60"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    Funded Deals
                  </p>
                  <p
                    className={`font-mono text-[28px] sm:text-[30px] font-medium leading-none ${
                      statusFilter === "funded"
                        ? "text-blue-400"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {stats.fundedDeals}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-[8px] grid place-items-center flex-shrink-0 ${
                    statusFilter === "funded"
                      ? "bg-blue-500/10"
                      : "bg-[var(--surface-2-hex)]"
                  }`}
                >
                  <TrendingUp
                    className={`h-5 w-5 ${
                      statusFilter === "funded"
                        ? "text-blue-400"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── STICKY FILTER STRIP ── */}
        <div className="sticky top-14 sm:top-16 z-40 bg-[var(--bg-hex)]/95 backdrop-blur-md border-b border-[var(--line)] mt-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
            <div className="flex items-center gap-2 sm:gap-3 h-14 overflow-x-auto">
              <div className="flex items-center gap-2 bg-[var(--surface-hex)] border border-[var(--line-light)] rounded-[10px] px-3 h-10 min-w-[200px] flex-shrink-0 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Search className="h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Address, City, State or Zip"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-full"
                  data-testid="input-search"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="h-10 rounded-[10px] border-[var(--line-light)] bg-[var(--surface-hex)] text-[var(--text-secondary)] text-[12px] font-medium w-[130px] flex-shrink-0 cursor-pointer"
                  data-testid="filter-status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Funding Open</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className="h-10 rounded-[10px] border-[var(--line-light)] bg-[var(--surface-hex)] text-[var(--text-secondary)] text-[12px] font-medium w-[150px] flex-shrink-0 cursor-pointer"
                  data-testid="filter-sort"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="closing_soonest">Closing: Soonest</SelectItem>
                  <SelectItem value="closing_latest">Closing: Latest</SelectItem>
                  <SelectItem value="price_asc">Price: Low → High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                  <SelectItem value="equity">Equity: Highest</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-[11px] text-[var(--text-tertiary)] bg-[var(--surface-hex)] border border-[var(--line)] px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}
              </span>

              <div className="ml-auto flex-shrink-0">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(val) =>
                    val && setViewMode(val as "list" | "map")
                  }
                  className="bg-[var(--surface-hex)] border border-[var(--line-light)] rounded-[10px] p-0.5"
                >
                  <ToggleGroupItem
                    value="list"
                    size="sm"
                    className="rounded-[8px] px-3 h-8 text-[12px] data-[state=on]:bg-[var(--surface-2-hex)] data-[state=on]:text-[var(--text-primary)] text-[var(--text-tertiary)] transition-all cursor-pointer"
                    data-testid="toggle-list"
                  >
                    <List className="h-3.5 w-3.5 mr-1.5" /> List
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="map"
                    size="sm"
                    className="rounded-[8px] px-3 h-8 text-[12px] data-[state=on]:bg-[var(--surface-2-hex)] data-[state=on]:text-[var(--text-primary)] text-[var(--text-tertiary)] transition-all cursor-pointer"
                    data-testid="toggle-map"
                  >
                    <MapIcon className="h-3.5 w-3.5 mr-1.5" /> Map
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 pb-24">
          {viewMode === "list" ? (
            <div className="animate-in fade-in duration-300">
              {fundingOpenList.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--text-tertiary)] whitespace-nowrap">
                      Funding Open · {fundingOpenList.length} deals
                    </span>
                    <div className="flex-1 border-b border-[var(--line)]" />
                  </div>

                  {featuredDeal && (
                    <FeaturedDealCard
                      property={featuredDeal}
                      isAuthenticated={isAuthenticated}
                    />
                  )}

                  {gridOpenList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gridOpenList.map((prop) => (
                        <DealCard
                          key={prop.id}
                          property={prop}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {fundedClosedList.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--text-tertiary)] whitespace-nowrap">
                      Funded & Closed · {fundedClosedList.length} deals
                    </span>
                    <div className="flex-1 border-b border-[var(--line)]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fundedClosedList.map((prop) => (
                      <DealCard
                        key={prop.id}
                        property={prop}
                        isAuthenticated={isAuthenticated}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredProperties.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface-hex)] border border-[var(--line)] grid place-items-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[var(--text-secondary)] mb-2">
                    No properties found
                  </h3>
                  <p className="text-[13px] text-[var(--text-tertiary)] max-w-sm mx-auto mb-4">
                    {properties && properties.length === 0
                      ? "No properties have been added yet. Check back soon!"
                      : "Try adjusting your search or filters."}
                  </p>
                  {properties && properties.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                      className="text-primary text-[13px] underline underline-offset-4"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-[18px] overflow-hidden border border-[var(--line)] bg-[var(--surface-hex)] animate-in fade-in zoom-in-95 duration-300">
              <MarketplaceMap properties={filteredProperties} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function formatMoneyLocal(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
  return `$${amount}`;
}

interface DealCardProps {
  property: Property;
  isAuthenticated: boolean;
}

function DealCard({ property, isAuthenticated }: DealCardProps) {
  const [, setLocation] = useLocation();
  const status = normalizeStatus(property.status);
  const isAvailable = status === "AVAILABLE";
  const isFunded = status === "FUNDED";
  const isSold = status === "SOLD";

  const equityAmount =
    isSold && property.totalProjectProfit != null
      ? property.totalProjectProfit
      : (property.estimatedEquity ?? 0);

  const imageUrl =
    property.mainPhotoUrl || property.galleryPhotoUrls?.[0] || null;

  const handleClick = () => {
    if (isAuthenticated) {
      setLocation(`/property/${property.slug || property.id}`);
    } else {
      setLocation("/signin");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative bg-[var(--surface-hex)] border border-[var(--line)] rounded-[18px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--line-light)] hover:shadow-2xl"
    >
      <div className="relative aspect-[16/10] bg-[var(--surface-2-hex)] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.address}
            className="w-full h-full object-cover brightness-[0.85] saturate-[0.85] transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--surface-2-hex)] to-[var(--surface-3-hex)]" />
        )}

        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-[5px] text-[10px] font-bold uppercase tracking-wide ${
            isAvailable
              ? "bg-primary text-primary-foreground"
              : isFunded
                ? "bg-blue-500 text-white"
                : "bg-green-500/15 text-green-400 border border-green-900/30"
          }`}
        >
          {isAvailable
            ? "Needs Funding"
            : isFunded
              ? "Funded"
              : "✓ Sold · Case Study"}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm border border-green-900/30 text-green-400 font-mono text-[12px] font-medium px-2.5 py-1 rounded-[7px]">
          +{formatMoneyLocal(equityAmount)}
        </div>
      </div>

      <div className="p-4">
        <div className="text-[15px] font-semibold text-[var(--text-primary)] truncate mb-1">
          {property.address}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {property.city}, {property.state}
        </div>

        <div className="grid grid-cols-2 pb-3 mb-3 border-b border-[var(--line)]">
          <div>
            <div className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-tertiary)] mb-1">
              Price
            </div>
            <div className="font-mono text-[15px] font-medium text-[var(--text-primary)]">
              {formatMoneyLocal(property.purchasePrice ?? 0)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-tertiary)] mb-1">
              Equity
            </div>
            <div className="font-mono text-[15px] font-medium text-green-400">
              +{formatMoneyLocal(equityAmount)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] mb-3">
          <span>{property.beds} bd</span>
          <span className="w-1 h-1 bg-[var(--line-light)] rounded-full" />
          <span>{property.baths} ba</span>
          <span className="w-1 h-1 bg-[var(--line-light)] rounded-full" />
          <span>{(property.squareFeet ?? 0).toLocaleString()} sf</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-[11px] text-[var(--text-tertiary)]">
          <span>
            {property.closingDate
              ? new Date(property.closingDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : isSold
                ? "Exited"
                : "TBD"}
          </span>
          {property.bpoValue ? (
            <span className="flex items-center gap-1 text-green-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              BPO {formatMoneyLocal(property.bpoValue)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(15,14,13,0.95)] to-transparent px-4 pb-4 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        <div className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[13px] py-2.5 rounded-[8px] flex items-center justify-center gap-1.5">
          View Deal Room
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

interface FeaturedDealCardProps {
  property: Property;
  isAuthenticated: boolean;
}

function FeaturedDealCard({
  property,
  isAuthenticated,
}: FeaturedDealCardProps) {
  const [, setLocation] = useLocation();
  const equityAmount = property.estimatedEquity ?? 0;
  const imageUrl =
    property.mainPhotoUrl || property.galleryPhotoUrls?.[0] || null;

  const handleClick = () => {
    if (isAuthenticated) {
      setLocation(`/property/${property.slug || property.id}`);
    } else {
      setLocation("/signin");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="bg-[var(--surface-hex)] border border-[var(--line)] rounded-[20px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[var(--line-light)] hover:shadow-2xl grid grid-cols-1 lg:grid-cols-2 mb-5"
    >
      <div className="relative min-h-[280px] lg:min-h-[320px] bg-[var(--surface-2-hex)] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.address}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-2-hex)] to-[var(--surface-3-hex)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--surface-hex)]/80" />

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Top Deal This Week
        </div>

        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm border border-green-900/30 rounded-[10px] p-3">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-green-400/60 mb-1">
            Est. Equity
          </div>
          <div className="font-mono text-[26px] font-medium text-green-400 leading-none">
            +{formatMoneyLocal(equityAmount)}
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-10 flex flex-col justify-center">
        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-primary mb-3">
          Featured Opportunity
        </div>
        <h3 className="font-serif text-[28px] lg:text-[32px] leading-tight tracking-tight text-[var(--text-primary)] mb-2">
          {property.address}
        </h3>
        <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] mb-6">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          {property.city}, {property.state} {property.zip}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {(
            [
              {
                label: "Purchase Price",
                value: formatMoneyLocal(property.purchasePrice ?? 0),
                color: "",
              },
              {
                label: "After Repair Value",
                value:
                  property.bpoValue != null && property.bpoValue > 0
                    ? formatMoneyLocal(property.bpoValue)
                    : "TBD",
                color: "text-blue-400",
              },
              {
                label: "Est. Profit",
                value: `+${formatMoneyLocal(equityAmount)}`,
                color: "text-green-400",
              },
              {
                label: "Est. ROI",
                value: property.purchasePrice
                  ? `+${((equityAmount / property.purchasePrice) * 100).toFixed(1)}%`
                  : "N/A",
                color: "text-green-400",
              },
            ] as const
          ).map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[var(--surface-2-hex)] border border-[var(--line)] rounded-[10px] p-3.5"
            >
              <div className="text-[10px] uppercase tracking-wide font-semibold text-[var(--text-tertiary)] mb-1.5">
                {label}
              </div>
              <div
                className={`font-mono text-[17px] font-medium text-[var(--text-primary)] ${color}`}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[12px] text-[var(--text-tertiary)] pb-5 mb-5 border-b border-[var(--line)]">
          <span>{property.beds} bed</span>
          <span className="text-[var(--line-light)]">·</span>
          <span>{property.baths} bath</span>
          <span className="text-[var(--line-light)]">·</span>
          <span>{(property.squareFeet ?? 0).toLocaleString()} sqft</span>
          {property.closingDate && (
            <>
              <span className="text-[var(--line-light)]">·</span>
              <span>
                Closes{" "}
                {new Date(property.closingDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          )}
        </div>

        <div className="self-start flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[14px] px-5 py-2.5 rounded-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,67,45,0.25)]">
          View Deal Room
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
