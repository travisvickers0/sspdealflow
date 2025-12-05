import { Layout } from "@/components/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Map as MapIcon, List, Loader2, Building2, DollarSign, TrendingUp, Home } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Property } from "@shared/schema";
import { MarketplaceMap } from "@/components/MarketplaceMap";

export default function Properties() {
  const { data: properties, isLoading, error } = useProperties({ refetchInterval: 10000 });
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
        
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "open" && p.status === "needs_funding") ||
          (statusFilter === "funded" && (p.status === "funded" || p.status === "committed"));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Status priority: needs_funding > committed > funded
        const statusOrder = { needs_funding: 0, committed: 1, funded: 2, archived: 3 };
        const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] ?? 99) - (statusOrder[b.status as keyof typeof statusOrder] ?? 99);
        
        if (statusDiff !== 0) return statusDiff;
        
        // Secondary sort by selected sortBy option
        switch (sortBy) {
          case "price_asc":
            return a.purchasePrice - b.purchasePrice;
          case "price_desc":
            return b.purchasePrice - a.purchasePrice;
          case "equity":
            return b.estimatedEquity - a.estimatedEquity;
          case "closing_soonest":
            const dateA = a.closingDate ? new Date(a.closingDate).getTime() : Infinity;
            const dateB = b.closingDate ? new Date(b.closingDate).getTime() : Infinity;
            return dateA - dateB;
          case "closing_latest":
            const lateDateA = a.closingDate ? new Date(a.closingDate).getTime() : 0;
            const lateDateB = b.closingDate ? new Date(b.closingDate).getTime() : 0;
            return lateDateB - lateDateA;
          case "newest":
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
  }, [properties, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    if (!properties) return { total: 0, totalSpread: 0, needsFunding: 0, fundedDeals: 0 };
    
    const total = properties.length;
    const totalSpread = properties.reduce((sum, p) => sum + (p.estimatedEquity || 0), 0);
    const needsFunding = properties.filter(p => p.status === "needs_funding").length;
    const fundedDeals = properties.filter(p => p.status === "funded" || p.status === "committed").length;
    
    return { total, totalSpread, needsFunding, fundedDeals };
  }, [properties]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Filters Bar */}
      <div className="w-full bg-background border-b py-3 sm:py-4 shadow-sm transition-all overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col gap-3 sm:flex-row sm:gap-4 items-stretch sm:items-center justify-between">
          {/* Search Input - Expanded width */}
          <div className="flex flex-1 max-w-md items-center gap-2 bg-muted/50 hover:bg-muted/80 rounded-full px-4 py-2.5 sm:py-2 border transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Address, City, State or Zip" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-muted-foreground/70"
              data-testid="input-search"
            />
            {searchQuery && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                    onClick={() => setSearchQuery("")}
                >
                    <span className="sr-only">Clear</span>
                    <span aria-hidden="true">×</span>
                </Button>
            )}
          </div>
          
          {/* Filters Row */}
          <div className="flex gap-1.5 sm:gap-3 flex-shrink-0 items-center justify-between w-full">
            <div className="flex gap-1.5 sm:gap-3 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[85px] sm:w-[140px] rounded-full border-gray-200 bg-background shadow-sm h-9 sm:h-10 text-[11px] sm:text-xs font-medium hover:bg-muted/50 transition-colors flex-shrink-0 cursor-pointer px-2 sm:px-3" data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Funding Open</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[90px] sm:w-[150px] rounded-full border-gray-200 bg-background shadow-sm h-9 sm:h-10 text-[11px] sm:text-xs font-medium hover:bg-muted/50 transition-colors flex-shrink-0 cursor-pointer px-2 sm:px-3" data-testid="filter-sort">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="closing_soonest">Closing: Soonest</SelectItem>
                  <SelectItem value="closing_latest">Closing: Latest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="equity">Equity Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile-only view toggle - far right */}
            <div className="lg:hidden flex items-center">
              <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as "list" | "map")} className="bg-muted/50 p-0.5 rounded-full border">
                  <ToggleGroupItem value="list" size="sm" className="rounded-full px-2 h-8 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-sm transition-all cursor-pointer" data-testid="toggle-list-mobile">
                      <List className="h-3.5 w-3.5 mr-1" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="map" size="sm" className="rounded-full px-2 h-8 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-sm transition-all cursor-pointer" data-testid="toggle-map-mobile">
                      <MapIcon className="h-3.5 w-3.5 mr-1" />
                  </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Desktop-only view toggle - hidden on mobile */}
            <div className="hidden lg:flex items-center">
              <div className="h-6 w-px bg-border mx-2" />
              <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as "list" | "map")} className="bg-muted/50 p-1 rounded-full border">
                  <ToggleGroupItem value="list" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all cursor-pointer" data-testid="toggle-list">
                      <List className="h-4 w-4 mr-2" /> List
                  </ToggleGroupItem>
                  <ToggleGroupItem value="map" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all cursor-pointer" data-testid="toggle-map">
                      <MapIcon className="h-4 w-4 mr-2" /> Map
                  </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - with bottom safe area for iOS home bar */}
      <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 min-h-[600px] pb-24 lg:pb-8">
        {/* Dashboard Stats - Compact on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Properties</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.total}</p>
              </div>
              <div className="bg-primary/10 p-2 sm:p-3 rounded-lg">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Equity</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">${(stats.totalSpread / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Needs Funding</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.needsFunding}</p>
              </div>
              <div className="bg-amber-100 p-2 sm:p-3 rounded-lg">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Funded Deals</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.fundedDeals}</p>
              </div>
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Available Properties</h2>
          <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
          </span>
        </div>
        
        {viewMode === "list" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 animate-in fade-in duration-500">
            {filteredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
            ))}
            {filteredProperties.length === 0 && (
                <div className="col-span-full text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No properties found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {properties && properties.length === 0 
                          ? "No properties have been added yet. Check back soon!"
                          : "Try adjusting your search or filters to find what you're looking for."}
                    </p>
                    {properties && properties.length > 0 && (
                      <Button 
                          variant="link" 
                          onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                          }}
                          className="mt-2"
                      >
                          Clear all filters
                      </Button>
                    )}
                </div>
            )}
            </div>
        ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden border shadow-lg animate-in fade-in zoom-in-95 duration-300">
                <MarketplaceMap properties={filteredProperties} />
            </div>
        )}
      </div>
    </Layout>
  );
}
