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
    <Link href={`/property/${property.id}`}>
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col w-full font-sans border border-gray-100 cursor-pointer h-full"
        data-testid={`card-property-${property.id}`}
      >
        
        {/* 1. IMAGE SECTION with OVERLAYS */}
        <div className="relative h-56 w-full group">
          <img 
            src={property.mainPhotoUrl || "/placeholder.jpg"} 
            alt={property.address} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${property.status === 'funded' ? 'grayscale opacity-75' : ''}`}
          />
          
          {/* Status Badge */}
          <div className={`absolute top-3 left-3 ${status.bg} text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm tracking-wide`}>
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

          {/* Stats Row with Inline SVG Icons */}
          <div className="flex items-center justify-start text-gray-500 text-sm font-medium">
            
            {/* Bed */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>{property.beds} bd</span>
            </div>

            {/* Bath */}
            <div className="flex items-center gap-2 px-4 border-r border-gray-200">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>{property.baths} ba</span>
            </div>

            {/* Sqft */}
            <div className="flex items-center gap-2 pl-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
              <span>{(property.squareFeet || 0).toLocaleString()} sf</span>
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
            <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
              {/* Chart Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
              <span>BPO: {formatMoney(property.bpoValue || 0)}</span>
            </div>
          </div>

          {/* 3. ACTION BUTTON */}
          <div className="mt-auto pt-2">
            <div className={`group/btn w-full font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition-all ${
              property.status === 'funded' 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-200 shadow-md hover:shadow-lg'
            }`}>
              {property.status === 'funded' ? 'View Case Study' : 'View Details'}
              {/* Chevron Right */}
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
