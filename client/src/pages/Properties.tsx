import { Layout } from "@/components/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import type { Property } from "@shared/schema";
import { MarketplaceMap } from "@/components/MarketplaceMap";
import { FilterToolbar } from "@/components/FilterToolbar";
import { Search, Loader2 } from "lucide-react";

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
      {/* Split View Container */}
      <div className="flex h-[calc(100vh-64px)] bg-background">
        {/* Left Column - Scrollable Content (60% on desktop, 100% on mobile) */}
        <div className="w-full md:w-3/5 overflow-y-auto overflow-x-hidden">
          {/* Filter Toolbar - Sticky at top of scrollable area */}
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            stats={stats}
          />

          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Available Properties</h2>
              <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
              </span>
            </div>
            
            {/* Mobile Toggle - Show Map or List */}
            {viewMode === "map" && (
              <div className="md:hidden h-[600px] w-full rounded-2xl overflow-hidden border shadow-lg mb-8 animate-in fade-in zoom-in-95 duration-300">
                <MarketplaceMap properties={filteredProperties} />
              </div>
            )}

            {/* Property Grid - Always 2 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 animate-in fade-in duration-500">
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
          </div>
        </div>

        {/* Right Column - Fixed Map (40% width, hidden on mobile) */}
        <div className="hidden md:flex md:w-2/5 border-l bg-background sticky top-0 h-screen overflow-hidden">
          <div className="w-full h-full">
            <MarketplaceMap properties={filteredProperties} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
