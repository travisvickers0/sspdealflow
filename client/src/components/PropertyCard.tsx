import type { Property } from "@shared/schema";
import { ArrowRight, Calendar, Heart, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const statusConfig = {
    needs_funding: {
      label: "Needs Funding",
      color: "text-emerald-700",
      bg: "bg-white/90"
    },
    committed: {
      label: "Funding Committed",
      color: "text-blue-700",
      bg: "bg-white/90"
    },
    funded: {
      label: "Funded",
      color: "text-gray-700",
      bg: "bg-white/90"
    }
  };

  const status = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.needs_funding;

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col hover:border-primary/20 relative">
        {/* Color accent bar on hover */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
          
          <img 
            src={property.mainPhotoUrl || "/placeholder.jpg"} 
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Status Badge - Top Left with enhanced styling */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${status.bg} backdrop-blur-sm ${status.color} shadow-lg border border-white/50 group-hover:scale-105 transition-transform duration-300`}>
              {status.label}
            </span>
          </div>

          {/* Heart Button - Top Right with enhanced hover */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-300 z-10 hover:scale-110 hover:rotate-12"
            aria-label="Save property"
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Address */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
              {property.address}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>

          {/* Specs with Dot Separators - Enhanced */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-5 font-medium relative">
            <span className="group-hover:text-gray-900 transition-colors">{property.beds} Beds</span>
            <span className="text-gray-300">•</span>
            <span className="group-hover:text-gray-900 transition-colors">{property.baths} Baths</span>
            <span className="text-gray-300">•</span>
            <span className="group-hover:text-gray-900 transition-colors">{(property.squareFeet || 0).toLocaleString()} sqft</span>
          </div>

          {/* Price & Equity - Enhanced with color accents */}
          <div className="flex items-end justify-between pt-5 border-t border-gray-100 mt-auto bg-gradient-to-br from-emerald-50/30 via-gray-50/50 to-transparent -mx-5 px-5 pb-1 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="flex-1 relative z-10">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1.5 group-hover:text-gray-700 transition-colors">Purchase Price</p>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-950 transition-colors">
                ${(property.purchasePrice || 0).toLocaleString()}
              </p>
            </div>

            <div className="text-right flex-1 pl-4 relative z-10">
              <p className="text-xs text-emerald-600 uppercase font-semibold tracking-wider mb-1.5 group-hover:text-emerald-700 transition-colors">Est. Equity</p>
              <p className="text-2xl font-extrabold text-emerald-600 group-hover:text-emerald-700 group-hover:scale-105 transition-all duration-300 inline-block">
                +${(property.estimatedEquity || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Closing Date & BPO Price - Redesigned */}
          <div className="mt-5 pt-4 border-t border-gray-100 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              {/* Closing Date */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Closing</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-950 transition-colors">
                  {property.closingDate ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              
              {/* BPO Value */}
              <div className="flex flex-col gap-1.5 items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">BPO Value</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  ${(property.bpoValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
