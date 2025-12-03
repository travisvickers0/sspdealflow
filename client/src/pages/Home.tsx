import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImg from "@assets/generated_images/modern_luxury_home_exterior_at_twilight.png";

export default function Home() {
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
    </Layout>
  );
}
