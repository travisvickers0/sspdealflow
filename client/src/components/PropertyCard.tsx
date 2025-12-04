import { Property } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bed, Bath, Home, Clock, TrendingUp, ArrowRight } from "lucide-react";
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
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-0">
            <img 
              src={property.images[0]} 
              alt={property.address}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <div className={`px-4 py-2 rounded-full text-xs font-semibold text-white shadow-md ${
                property.status === 'needs_funding' ? 'bg-amber-500' :
                property.status === 'committed' ? 'bg-blue-500' :
                'bg-green-500'
              }`}>
                {property.status === "needs_funding" ? "Needs Funding" : property.status === "committed" ? "Funding Committed" : "Funded"}
              </div>
            </div>
          </div>

          <CardContent className="p-5 space-y-4">
            {/* Address Section */}
            <div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors text-gray-900">
                {property.address}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {property.city}, {property.state} {property.zip}
              </div>
            </div>

            {/* Purchase Price and Est. Equity */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purchase Price</div>
                <div className="font-bold text-lg text-gray-900">${property.purchase_price.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">Est. Equity</div>
                <div className="font-bold text-lg text-primary">+${property.equity_available.toLocaleString()}</div>
              </div>
            </div>

            {/* Beds, Baths, Sqft */}
            <div className="flex gap-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <Bed className="h-3 w-3 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-900">{property.beds} bd</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <Bath className="h-3 w-3 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-900">{property.baths} ba</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <Home className="h-3 w-3 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-900">{property.sqft.toLocaleString()} sf</span>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="text-gray-900">{fundingProgress}%</span>
              </div>
              <Progress value={fundingProgress} className="h-2" />
            </div>

            {/* Closes Date and BPO Price */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Closes</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(property.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-xs text-muted-foreground">BPO</div>
                  <div className="text-sm font-semibold text-primary">${property.arv.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* View Details Button */}
            <Button className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm gap-2 mt-2">
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
