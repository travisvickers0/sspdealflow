import type { Property } from "@shared/schema";
import { Link } from "wouter";

interface PropertyCardProps {
  property: Property;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function PropertyCard({ property }: PropertyCardProps) {
  const statusConfig = {
    needs_funding: {
      label: "Needs Funding",
      bg: "bg-emerald-500"
    },
    committed: {
      label: "Funding Committed",
      bg: "bg-yellow-500"
    },
    funded: {
      label: "Funded",
      bg: "bg-blue-500"
    },
    archived: {
      label: "Archived",
      bg: "bg-gray-500"
    }
  };

  const status = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.needs_funding;
  const closeDate = property.closingDate 
    ? new Date(property.closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBD';

  return (
    <Link href={`/property/${property.slug}`}>
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col w-full font-sans border border-gray-100 cursor-pointer h-full"
        data-testid={`card-property-${property.id}`}
      >
        
        {/* 1. IMAGE SECTION with OVERLAYS */}
        <div className="relative h-48 sm:h-56 w-full group">
          <img 
            src={property.mainPhotoUrl || "/placeholder.jpg"} 
            alt={property.address} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${property.status === 'funded' ? 'grayscale opacity-75' : ''}`}
          />
          
          {/* Status Badge */}
          <div className={`absolute top-3 left-3 ${status.bg} text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm tracking-wide`}>
            {status.label}
          </div>

          {/* FUNDED Stamp Overlay */}
          {property.status === 'funded' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="border-4 border-green-600 text-green-600 px-6 py-3 rounded-lg -rotate-12 bg-white/10 backdrop-blur-sm shadow-xl">
                <span className="text-3xl font-black uppercase tracking-widest">
                  FUNDED
                </span>
              </div>
            </div>
          )}

          {/* Gradient Scrim for Address Readability */}
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
            <h3 className="text-white text-xl font-bold leading-tight drop-shadow-md">
              {property.address}
            </h3>
            <p className="text-gray-200 text-sm drop-shadow-sm opacity-90">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
        </div>

        {/* 2. CARD BODY */}
        <div className="p-4 flex flex-col gap-5 flex-1">

          {/* Financials Row */}
          <div className="flex justify-between items-end border-b border-gray-100 pb-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                Purchase Price
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(property.purchasePrice || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider mb-0.5">
                Est. Equity
              </p>
              <p className="text-2xl font-bold text-green-600">
                +{formatMoney(property.estimatedEquity || 0)}
              </p>
            </div>
          </div>

          {/* Stats Row with Custom Icons (Gray) */}
          <div className="flex items-center text-gray-500 text-sm font-medium mt-1">
            
            {/* BED ICON (Geometric Style) */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l14 0M5 11a2 2 0 012-2h10a2 2 0 012 2v8M5 19v-8a2 2 0 012-2h10a2 2 0 012 2v8M4 15h16"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11V9a2 2 0 012-2h1a2 2 0 012 2v2M12 11V9a2 2 0 012-2h1a2 2 0 012 2v2"></path>
              </svg>
              <span className="text-gray-600 font-semibold">{property.beds} bed</span>
            </div>

            {/* BATH ICON (Tub + Shower Head Style) */}
            <div className="flex items-center gap-2 px-4 border-r border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14v4a3 3 0 003 3h10a3 3 0 003-3v-4H4z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h16"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5h3v3M14 8l-2 2"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 12v.01M12 11v.01"></path>
              </svg>
              <span className="text-gray-600 font-semibold">{property.baths} bath</span>
            </div>

            {/* SQFT ICON (Floorplan Style) */}
            <div className="flex items-center gap-2 pl-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v18M3 14h6M15 9h6"></path>
              </svg>
              <span className="text-gray-600 font-semibold">{(property.squareFeet || 0).toLocaleString()} sqft</span>
            </div>

          </div>

          {/* Info/Dates Row */}
          <div className="flex justify-between items-center text-xs mt-1">
            <div className="flex items-center gap-1.5 text-gray-400 font-medium">
              {/* Clock Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Closes {closeDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
              {/* Chart Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>BPO: {formatMoney(property.bpoValue || 0)}</span>
            </div>
          </div>

          {/* 3. ACTION BUTTON */}
          <div className="mt-auto pt-2">
            <div className={`group/btn w-full font-semibold text-sm py-2.5 rounded-md flex justify-center items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              property.status === 'funded' 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
                : 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-white'
            }`}>
              {property.status === 'funded' ? 'View Case Study' : 'View Details'}
              <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;
