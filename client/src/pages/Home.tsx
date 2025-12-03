import { Layout } from "@/components/Layout";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import heroImg from "@assets/contentcreationteamkova_modern_home_with_new_vinyl_siding_--ar_1764790436690.png";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>
        
        <div className="relative container mx-auto h-full flex flex-col justify-center px-4 sm:px-8 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 max-w-3xl drop-shadow-lg">
            Exclusive Real Estate Deals. <br />
            Curated for Growth.
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-8 font-light leading-relaxed drop-shadow-md">
            Access off-market opportunities vetted by our expert team. Simple, transparent, and built for accredited investors.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-8 text-base h-12 border-0">
              View Properties
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/20 font-semibold px-8 text-base h-12 bg-transparent">
              How it Works
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur-sm border-b py-4 shadow-sm">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex w-full sm:w-auto items-center gap-2 bg-secondary/50 rounded-full px-4 py-2 border transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="City, State, or Zip" 
              className="bg-transparent border-none focus:outline-none text-sm w-full sm:w-64"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px] rounded-full border-gray-200 bg-white shadow-sm h-10 text-xs font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Funding Open</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="newest">
              <SelectTrigger className="w-[140px] rounded-full border-gray-200 bg-white shadow-sm h-10 text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="equity">Equity Available</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0 border-gray-200 shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="container mx-auto px-4 sm:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Featured Opportunities</h2>
          <span className="text-sm text-muted-foreground">{properties.length} properties available</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
