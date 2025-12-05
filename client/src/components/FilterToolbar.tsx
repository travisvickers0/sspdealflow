import { Search, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  stats: {
    total: number;
    totalSpread: number;
    needsFunding: number;
    fundedDeals: number;
  };
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  stats,
}: FilterToolbarProps) {
  return (
    <div className="w-full bg-white/90 backdrop-blur-sm sticky top-0 z-30 pb-4 pt-4 px-6 border-b border-gray-100">
      {/* Slim Stats Row */}
      <div className="flex gap-8 mb-4 text-sm text-gray-600 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>
            <strong className="font-semibold text-foreground">{stats.total}</strong> Available
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>
            <strong className="font-semibold text-foreground">${(stats.totalSpread / 1000000).toFixed(1)}M</strong> Est. Equity
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>
            <strong className="font-semibold text-foreground">{stats.needsFunding}</strong> Need Funding
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            <strong className="font-semibold text-foreground">{stats.fundedDeals}</strong> Funded
          </span>
        </div>
      </div>

      {/* The Omni-Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Left: Unified Search Pill */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm w-full md:w-auto divide-x divide-gray-200">
          {/* Search Input */}
          <div className="flex items-center px-4 py-2 flex-1 md:flex-none">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="City, Zip, or Address"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-gray-700 w-full placeholder-gray-400"
              data-testid="input-search-toolbar"
            />
          </div>

          {/* Status Dropdown - Hidden on mobile */}
          <div className="hidden md:flex items-center px-4 py-2">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs text-gray-500 font-bold uppercase cursor-pointer"
              data-testid="filter-status-toolbar"
            >
              <option value="all">All Status</option>
              <option value="open">Funding Open</option>
              <option value="funded">Funded</option>
            </select>
          </div>
        </div>

        {/* Right: Sort & Search Button */}
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full md:w-[180px] rounded-lg border-gray-200 bg-white shadow-sm h-10 text-sm font-medium hover:bg-muted/50 transition-colors" data-testid="filter-sort-toolbar">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="closing_soonest">Closing: Soonest</SelectItem>
              <SelectItem value="closing_latest">Closing: Latest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="equity">Highest Equity</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="icon"
            className="bg-gray-900 hover:bg-black text-white rounded-lg h-10 w-10"
            data-testid="button-search"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
