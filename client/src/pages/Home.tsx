import { Layout } from "@/components/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Map as MapIcon, List } from "lucide-react";
import heroImg from "@assets/generated_images/modern_luxury_home_exterior_at_twilight.png";
import mapBg from "@assets/generated_images/a_light,_clean,_minimalist_street_map_background_in_the_style_of_apple_maps_or_google_maps..png";
import { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Home() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Search filter
        const matchesSearch = 
          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.zip.includes(searchQuery);
        
        // Status filter
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "open" && p.status === "needs_funding") ||
          (statusFilter === "funded" && (p.status === "funded" || p.status === "committed"));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_asc":
            return a.purchase_price - b.purchase_price;
          case "price_desc":
            return b.purchase_price - a.purchase_price;
          case "equity":
            return b.equity_available - a.equity_available;
          case "newest":
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [searchQuery, statusFilter, sortBy]);

  // Helper to position pins on the mock map
  // We normalize lat/lng to 10-90% range for the view
  const getPinPosition = (prop: typeof properties[0]) => {
    const minLat = Math.min(...properties.map(p => p.lat));
    const maxLat = Math.max(...properties.map(p => p.lat));
    const minLng = Math.min(...properties.map(p => p.lng));
    const maxLng = Math.max(...properties.map(p => p.lng));

    // Avoid divide by zero if only one property
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    // Invert lat because screen Y goes down, but latitude goes up
    const top = 80 - ((prop.lat - minLat) / latRange) * 60; 
    const left = 20 + ((prop.lng - minLng) / lngRange) * 60;

    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
        </div>
        
        <div className="relative container mx-auto h-full flex flex-col justify-center px-4 sm:px-8 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 max-w-3xl drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            Exclusive Real Estate Deals. <br />
            Curated for Growth.
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-8 font-light leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Access off-market opportunities vetted by our expert team. Simple, transparent, and built for accredited investors.
          </p>
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-8 text-base h-12 border-0 shadow-lg hover:shadow-xl transition-all">
              View Properties
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/20 font-semibold px-8 text-base h-12 bg-transparent backdrop-blur-sm">
              How it Works
            </Button>
          </div>
        </div>
      </div>

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
              <SelectTrigger className="w-[140px] rounded-full border-gray-200 bg-background shadow-sm h-10 text-xs font-medium hover:bg-muted/50 transition-colors">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Funding Open</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] rounded-full border-gray-200 bg-background shadow-sm h-10 text-xs font-medium hover:bg-muted/50 transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="equity">Equity Available</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(val) => val && setViewMode(val as "list" | "map")} className="bg-muted/50 p-1 rounded-full border">
                <ToggleGroupItem value="list" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all">
                    <List className="h-4 w-4 mr-2" /> List
                </ToggleGroupItem>
                <ToggleGroupItem value="map" size="sm" className="rounded-full px-3 h-8 data-[state=on]:bg-white data-[state=on]:shadow-sm transition-all">
                    <MapIcon className="h-4 w-4 mr-2" /> Map
                </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-8 py-8 min-h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Opportunities</h2>
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
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
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
                </div>
            )}
            </div>
        ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden border shadow-lg relative bg-[#F4F4F4] animate-in fade-in zoom-in-95 duration-300">
                {/* Mock Map Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-90"
                    style={{ backgroundImage: `url(${mapBg})` }}
                />
                
                {/* Map Pins */}
                {filteredProperties.map((prop) => {
                    const pos = getPinPosition(prop);
                    return (
                        <Popover key={prop.id}>
                            <PopoverTrigger asChild>
                                <button
                                    className="absolute transform -translate-x-1/2 -translate-y-full group"
                                    style={{ top: pos.top, left: pos.left }}
                                >
                                    <div className="relative">
                                        <div className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1.5 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-1 whitespace-nowrap z-10">
                                            ${(prop.purchase_price / 1000)}k
                                        </div>
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary absolute left-1/2 -translate-x-1/2 -bottom-2"></div>
                                        <div className="w-8 h-2 bg-black/20 blur-sm rounded-full absolute left-1/2 -translate-x-1/2 -bottom-3 z-0"></div>
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 border-none shadow-xl bg-transparent" sideOffset={10}>
                                <div className="bg-background rounded-xl overflow-hidden shadow-2xl border">
                                    <PropertyCard property={prop} />
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                })}

                <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-white hover:bg-gray-50">
                        <span className="text-xl font-bold text-gray-600">+</span>
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-white hover:bg-gray-50">
                        <span className="text-xl font-bold text-gray-600">−</span>
                    </Button>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
}
