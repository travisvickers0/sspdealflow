import { Property } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, TrendingUp, Bed, Bath, Ruler } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Funding progress: 0% if needs_funding, 100% if committed or funded
  const fundingProgress = property.status === "needs_funding" ? 0 : 100;
  
  return (
    <Link href={`/property/${property.slug}`}>
      <div className="group cursor-pointer block h-full">
        <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-lg transition-all bg-white">
          {/* Image Section with Floating Address */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img 
              src={property.images[0]} 
              alt={property.address}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Light gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            
            {/* Status Badge - Top Left */}
            <div className="absolute top-2 left-2 z-10">
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-md ${
                property.status === 'needs_funding' ? 'bg-amber-500' :
                property.status === 'committed' ? 'bg-blue-500' :
                'bg-green-500'
              }`}>
                {property.status === "needs_funding" ? "Needs Funding" : property.status === "committed" ? "Funding Committed" : "Funded"}
              </div>
            </div>

            {/* Arrow Button - Top Right */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors z-10">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>

            {/* Floating Address - Bottom Left */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
              <h3 className="font-bold text-base leading-tight drop-shadow-lg">
                {property.address}
              </h3>
              <p className="text-xs opacity-90 drop-shadow-md">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
          </div>

          <CardContent className="p-3 space-y-2.5">
            {/* Purchase Price & Est. Equity */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="text-xs">
                <div className="text-muted-foreground font-medium">PURCHASE PRICE</div>
                <div className="font-bold text-gray-900 text-sm">${property.purchase_price.toLocaleString()}</div>
              </div>
              <div className="text-right text-xs">
                <div className="text-green-600 font-medium">EST. EQUITY</div>
                <div className="font-bold text-green-600 text-sm">+${property.equity_available.toLocaleString()}</div>
              </div>
            </div>

            {/* Beds, Baths, Sqft - With Icons */}
            <div className="flex items-center justify-between text-xs font-medium text-gray-700 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-1">
                <Bed className="h-4 w-4 text-gray-600" />
                <span>{property.beds} bd</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2 flex-1 justify-center">
                <Bath className="h-4 w-4 text-gray-600" />
                <span>{property.baths} ba</span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2 flex-1 justify-end">
                <Ruler className="h-4 w-4 text-gray-600" />
                <span>{property.sqft.toLocaleString()} sf</span>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-1.5 py-2 border-b border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Funding Progress</span>
                <span className="font-semibold text-gray-900">{fundingProgress}%</span>
              </div>
              <Progress 
                value={fundingProgress} 
                className={cn(
                  "h-1.5",
                  property.status === 'needs_funding' && "[&>div]:bg-amber-500",
                  property.status === 'committed' && "[&>div]:bg-blue-500",
                  property.status === 'funded' && "[&>div]:bg-green-500"
                )}
              />
            </div>

            {/* Closes Date and BPO Price */}
            <div className="flex justify-between text-xs pt-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <div className="font-medium">Closes {new Date(property.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="flex items-center gap-1.5 text-right">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                <div className="font-bold text-green-600">BPO: ${property.arv.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
