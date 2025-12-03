import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/lib/mockData";
import heroImg from "@assets/generated_images/modern_luxury_home_exterior_at_twilight.png";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredProperties = properties.slice(0, 3);

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
            <Link href="/properties">
              <Button 
                size="lg" 
                className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-8 text-base h-12 border-0 shadow-lg hover:shadow-xl transition-all"
              >
                View Properties
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/20 font-semibold px-8 text-base h-12 bg-transparent backdrop-blur-sm">
              How it Works
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="container mx-auto px-4 sm:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">Hand-picked deals curated for maximum returns</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="hidden md:flex rounded-full gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-8">
          {featuredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>

        <div className="flex md:hidden justify-center">
          <Link href="/properties">
            <Button className="rounded-full px-8 gap-2">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
