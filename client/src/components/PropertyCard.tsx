import { Property } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const fundedPercent = Math.min(100, Math.max(0, ((property.purchase_price + property.rehab_budget - property.equity_available) / (property.purchase_price + property.rehab_budget)) * 100));
  
  return (
    <Link href={`/property/${property.slug}`}>
      <div className="group cursor-pointer block h-full">
        <Card className="h-full overflow-hidden border-0 shadow-none bg-transparent hover:bg-transparent">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted mb-4">
            <img 
              src={property.images[0]} 
              alt={property.address}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
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
          
          <CardContent className="p-0 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  {property.address}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.city}, {property.state}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${property.purchase_price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Purchase Price</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className={property.equity_available > 0 ? "text-primary" : "text-muted-foreground"}>
                  {property.equity_available > 0 ? `$${property.equity_available.toLocaleString()} Available` : "Fully Funded"}
                </span>
                <span className="text-muted-foreground">{Math.round(fundedPercent)}% Funded</span>
              </div>
              <Progress 
                value={fundedPercent} 
                className={cn(
                  "h-1.5 bg-secondary", 
                  fundedPercent >= 100 && "[&>div]:bg-green-500" 
                )} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <div className="text-xs text-muted-foreground">ARV</div>
                <div className="font-medium">${property.arv.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Est. ROI</div>
                <div className="font-medium text-green-600">18-22%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
