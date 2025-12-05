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
          p.zip.includes(searchQuery);
        
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "open" && p.status === "needs_funding") ||
          (statusFilter === "funded" && (p.status === "funded" || p.status === "committed"));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
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
      <div className="sticky top-16 z-40 w-full bg-background/80 backdrop-blur-xl border-b py-4 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-2 bg-muted/50 hover:bg-muted/80 rounded-full px-4 py-2 border transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 focus-within:bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="City, State, or Zip" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full sm:w-64 placeholder:text-muted-foreground/70"
              data-testid="input-search"
            />
            {searchQuery && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                >
                    <span className="sr-only">Clear</span>
                    <span aria-hidden="true">×</span>
                </Button>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-full border-gray-200 bg-background shadow-sm h-10 text-xs font-medium hover:bg-muted/50 transition-colors" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Funding Open</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] rounded-full border-gray-200 bg-background shadow-sm h-10 text-xs font-medium hover:bg-muted/50 transition-colors" data-testid="filter-sort">
                <SelectValue placeholder="Sort by" />
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

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as "list" | "map")} className="bg-muted/50 p-1 rounded-full border">
                <ToggleGroupItem value="list" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all" data-testid="toggle-list">
                    <List className="h-4 w-4 mr-2" /> List
                </ToggleGroupItem>
                <ToggleGroupItem value="map" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all" data-testid="toggle-map">
                    <MapIcon className="h-4 w-4 mr-2" /> Map
                </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-8 py-8 min-h-[600px]">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Properties</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Spread</p>
                <p className="text-3xl font-bold text-foreground mt-2">${(stats.totalSpread / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Needs Funding</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.needsFunding}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Home className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Funded Deals</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.fundedDeals}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 animate-in fade-in duration-500">
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
