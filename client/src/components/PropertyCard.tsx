import { Property } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

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
          {/* Image Section - Reduced to 200px */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img 
              src={property.images[0]} 
              alt={property.address}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-md ${
                property.status === 'needs_funding' ? 'bg-amber-500' :
                property.status === 'committed' ? 'bg-blue-500' :
                'bg-green-500'
              }`}>
                {property.status === "needs_funding" ? "Needs Funding" : property.status === "committed" ? "Funding Committed" : "Funded"}
              </div>
            </div>

            {/* Arrow Button - Bottom Right */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </div>

          <CardContent className="p-3 space-y-2.5">
            {/* Address Section */}
            <div>
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors text-gray-900">
                {property.address}
              </h3>
              <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{property.city}, {property.state}</span>
              </div>
            </div>

            {/* Purchase Price & Est. Equity - Compact */}
            <div className="flex justify-between items-center py-2 text-xs">
              <div>
                <div className="text-muted-foreground font-medium">Purchase</div>
                <div className="font-bold text-gray-900">${(property.purchase_price / 1000).toFixed(0)}K</div>
              </div>
              <div className="text-right">
                <div className="text-primary font-medium">Equity</div>
                <div className="font-bold text-primary">+${(property.equity_available / 1000).toFixed(0)}K</div>
              </div>
            </div>

            {/* Beds, Baths, Sqft - Text only */}
            <div className="text-xs font-medium text-gray-700 space-y-1">
              <div className="flex gap-3">
                <span>{property.beds} bd</span>
                <span>•</span>
                <span>{property.baths} ba</span>
                <span>•</span>
                <span>{property.sqft.toLocaleString()} sf</span>
              </div>
            </div>

            {/* Funding Progress Bar - Compact */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Funding</span>
                <span className="font-semibold text-gray-900">{fundingProgress}%</span>
              </div>
              <Progress value={fundingProgress} className="h-1.5" />
            </div>

            {/* Closes Date and BPO Price - Compact */}
            <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
              <div className="text-muted-foreground">
                <div className="font-medium">Closes {new Date(property.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
              <div className="text-right text-primary">
                <div className="font-bold">BPO: ${(property.arv / 1000).toFixed(0)}K</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
