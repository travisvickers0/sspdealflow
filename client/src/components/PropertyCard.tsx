import type { Property } from "@shared/schema";
import { Heart, Bed, Bath, Square } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const statusConfig = {
    needs_funding: {
      label: "Ready",
      bg: "bg-emerald-500",
      text: "text-white"
    },
    committed: {
      label: "Pending",
      bg: "bg-amber-500",
      text: "text-white"
    },
    funded: {
      label: "Funded",
      bg: "bg-gray-500",
      text: "text-white"
    }
  };

  const status = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.needs_funding;

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${Math.round(price / 1000)}k`;
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div 
        className="group bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-400 ease-out hover:-translate-y-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
        data-testid={`card-property-${property.id}`}
      >
        {/* Image Section - 16:9 ratio */}
        <div className="relative aspect-video overflow-hidden">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          
          {/* Bottom gradient overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1]" />
          
          <img 
            src={property.mainPhotoUrl || "/placeholder.jpg"} 
            alt={property.address}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Status Pill - Top Left */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text} shadow-sm`}>
              {status.label}
            </span>
          </div>

          {/* Heart Button - Top Right */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 backdrop-blur-sm transition-all duration-200 z-10 shadow-sm hover:shadow-md hover:scale-105"
            aria-label="Save property"
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Price overlay on image - bottom left */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="text-white text-xl font-bold drop-shadow-lg">
              ${(property.purchasePrice || 0).toLocaleString()}
            </span>
          </div>

          {/* Equity badge - bottom right */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
              +${(property.estimatedEquity || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content Section - Compact */}
        <div className="p-4">
          {/* Address - Primary */}
          <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-0.5 truncate group-hover:text-gray-700 transition-colors">
            {property.address}
          </h3>
          
          {/* City/State - Secondary */}
          <p className="text-[13px] text-gray-500 mb-3">
            {property.city}, {property.state}
          </p>

          {/* Micro Icon Row */}
          <div className="flex items-center gap-4 text-[13px] text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-gray-400" />
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-gray-400" />
              {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <Square className="w-3.5 h-3.5 text-gray-400" />
              {(property.squareFeet || 0).toLocaleString()} sqft
            </span>
          </div>

          {/* Muted Financial Row - Apple Wallet style */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[12px] text-gray-400">
              Purchase: {formatCompactPrice(property.purchasePrice || 0)} · Value: {formatCompactPrice(property.bpoValue || 0)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* Image skeleton */}
      <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 bg-gray-100 rounded-full w-12 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded-full w-12 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded-full w-16 animate-pulse" />
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="h-3 bg-gray-100 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
