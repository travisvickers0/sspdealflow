import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Loader2, MapPin } from "lucide-react";
import type { ClosedDeal } from "@shared/schema";

type SortOption = "recent" | "roi" | "profit" | "hold";

const fmtCompactMoney = (n?: number | null) =>
  n == null
    ? "—"
    : n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `$${Math.round(n / 1_000)}k`
        : `$${n.toLocaleString()}`;

function DealCard({
  deal,
  index,
}: {
  deal: ClosedDeal;
  index: number;
}) {
  const [, setLocation] = useLocation();
  const photo = deal.mainPhotoUrl;

  const acqDate = deal.acquisitionDate
    ? new Date(deal.acquisitionDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";
  const closeDate = deal.closeDate
    ? new Date(deal.closeDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setLocation(`/track-record/${deal.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setLocation(`/track-record/${deal.slug}`);
        }
      }}
      className="group animate-[fade-up_0.5s_ease_forwards] bg-white border border-[rgba(13,12,11,0.06)] rounded-[20px] overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.1)] hover:border-[rgba(13,12,11,0.12)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-0"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#c8d8b0]">
        {photo ? (
          <img
            src={photo}
            alt={deal.address}
            className="w-full h-full object-cover object-[50%_40%] transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#c8d8b0] to-[#a8bc90]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[rgba(10,9,8,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full flex-shrink-0" />
            <span className="text-[9px] font-bold tracking-[0.07em] uppercase text-[rgba(255,255,255,0.8)]">
              Completed
            </span>
          </div>
          {(deal.investorRoi == null || deal.investorRoi === 0) && (
            <div className="flex items-center gap-1.5 bg-[rgba(10,9,8,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] rounded-full px-2.5 py-1">
              <span className="text-[9px] font-bold tracking-[0.07em] uppercase text-amber-400">
                Cash Deal
              </span>
            </div>
          )}
        </div>

        {deal.annualizedRoi != null ? (
          <div className="absolute bottom-3 right-3 bg-white rounded-[8px] px-2.5 py-1.5 text-right">
            <div className="font-mono text-[14px] font-medium text-[#16a34a] leading-none">
              {deal.annualizedRoi.toFixed(1)}%
            </div>
            <div className="text-[8px] font-semibold tracking-[0.08em] uppercase text-[rgba(13,12,11,0.4)] mt-0.5">
              Ann. ROI
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="text-[15px] font-bold text-[#0d0c0b] mb-0.5 tracking-[-0.01em] truncate">
          {deal.address}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[rgba(13,12,11,0.4)] mb-3">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          {deal.city}, {deal.state}
          {deal.zip ? ` ${deal.zip}` : ""}
        </div>

        <div className="grid grid-cols-3 gap-px bg-[rgba(13,12,11,0.07)] rounded-[10px] overflow-hidden mb-3">
          <div className="bg-[#f7f4ef] px-3 py-2.5">
            <div className="font-mono text-[14px] font-medium text-[#16a34a] leading-none mb-1">
              {fmtCompactMoney(deal.dealProfit)}
            </div>
            <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)]">
              Profit
            </div>
          </div>
          <div className="bg-[#f7f4ef] px-3 py-2.5">
            {deal.investorRoi != null && deal.investorRoi > 0 ? (
              <>
                <div className="font-mono text-[14px] font-medium text-[#2563eb] leading-none mb-1">
                  {deal.investorRoi.toFixed(2)}%
                </div>
                <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)]">
                  Inv. ROI
                </div>
              </>
            ) : (
              <>
                <div className="font-mono text-[11px] font-semibold text-amber-600 leading-none mb-1">
                  Cash Deal
                </div>
                <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)]">
                  No JV
                </div>
              </>
            )}
          </div>
          <div className="bg-[#f7f4ef] px-3 py-2.5">
            <div className="font-mono text-[14px] font-medium text-[#0d0c0b] leading-none mb-1">
              {deal.daysHeld != null ? `${deal.daysHeld}d` : "—"}
            </div>
            <div className="text-[8px] font-semibold tracking-[0.09em] uppercase text-[rgba(13,12,11,0.35)]">
              Days Held
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(13,12,11,0.06)] pt-3">
          <div className="text-[10px] text-[rgba(13,12,11,0.4)]">
            <div className="font-semibold text-[11px] text-[#0d0c0b] mb-0.5">{acqDate}</div>
            Acquired
          </div>
          <div className="flex-1 h-px bg-[rgba(13,12,11,0.1)] mx-2 relative top-[-4px]" />
          <div className="font-mono text-[10px] font-medium text-[#e8432d] bg-[rgba(232,67,45,0.08)] border border-[rgba(232,67,45,0.15)] px-2 py-1 rounded-[4px] flex-shrink-0">
            {deal.daysHeld ? `${deal.daysHeld}d` : "—"}
          </div>
          <div className="flex-1 h-px bg-[rgba(13,12,11,0.1)] mx-2 relative top-[-4px]" />
          <div className="text-[10px] text-[rgba(13,12,11,0.4)] text-right">
            <div className="font-semibold text-[11px] text-[#0d0c0b] mb-0.5">{closeDate}</div>
            Closed
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackRecord() {
  const { data: deals = [], isLoading } = useQuery<ClosedDeal[]>({
    queryKey: ["/api/closed-deals"],
  });

  const stats = useMemo(() => {
    if (!deals.length) {
      return {
        total: 0,
        equity: 0,
        avgHold: 0,
        avgRoi: "0.0",
        profitPct: 100,
      };
    }

    return {
      total: deals.length,
      equity: deals.reduce((sum, deal) => sum + (deal.dealProfit ?? 0), 0),
      avgHold: Math.round(deals.reduce((sum, deal) => sum + (deal.daysHeld ?? 0), 0) / deals.length),
      avgRoi: (
        deals.reduce((sum, deal) => sum + (deal.annualizedRoi ?? 0), 0) / deals.length
      ).toFixed(1),
      profitPct: Math.round(
        (deals.filter((deal) => (deal.dealProfit ?? 0) > 0).length / deals.length) * 100,
      ),
    };
  }, [deals]);

  const [activeState, setActiveState] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const states = useMemo(() => {
    const uniqueStates = Array.from(new Set(deals.map((deal) => deal.state).filter(Boolean))).sort();
    return ["All", ...uniqueStates];
  }, [deals]);

  const filtered = useMemo(() => {
    let nextDeals = activeState === "All" ? deals : deals.filter((deal) => deal.state === activeState);

    if (sortBy === "roi") {
      nextDeals = [...nextDeals].sort((a, b) => (b.annualizedRoi ?? 0) - (a.annualizedRoi ?? 0));
    } else if (sortBy === "profit") {
      nextDeals = [...nextDeals].sort((a, b) => (b.dealProfit ?? 0) - (a.dealProfit ?? 0));
    } else if (sortBy === "hold") {
      nextDeals = [...nextDeals].sort((a, b) => (a.daysHeld ?? 0) - (b.daysHeld ?? 0));
    } else {
      nextDeals = [...nextDeals].sort((a, b) => {
        const da = a.closeDate ? new Date(a.closeDate).getTime() : 0;
        const db = b.closeDate ? new Date(b.closeDate).getTime() : 0;
        return db - da;
      });
    }

    return nextDeals;
  }, [activeState, deals, sortBy]);

  return (
    <Layout transparentNavDark>
      <div className="bg-[#f7f4ef]">
        <div className="bg-[#f7f4ef] px-6 sm:px-10 lg:px-14 pt-16 pb-12 max-w-[1360px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#e8432d] mb-3">
            Verified Closed Deals
          </p>
          <h1
            className="font-bold tracking-[-0.03em] text-[#0d0c0b] leading-[0.95] mb-4"
            style={{ fontSize: "clamp(40px,5vw,64px)" }}
          >
            Every deal.
            <br />
            <em
              style={{
                fontStyle: "italic",
                fontFamily: "'Instrument Serif',Georgia,serif",
                fontWeight: 400,
              }}
            >
              Every number.
            </em>
          </h1>
          <p className="text-[16px] text-[rgba(13,12,11,0.5)] leading-[1.75] max-w-[520px]">
            Real closed deals with real returns. No projections, no estimates - every figure comes from a verified closeout report generated at
            settlement.
          </p>
        </div>

        <div className="bg-[#0d0c0b]">
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-3 lg:grid-cols-5 divide-x divide-[rgba(255,255,255,0.06)]">
              {[
                {
                  val: isLoading ? "—" : String(stats.total),
                  label: "Deals Closed",
                  color: "",
                },
                {
                  val: isLoading ? "—" : fmtCompactMoney(stats.equity),
                  label: "Total Equity Distributed",
                  color: "text-[#4ade80]",
                },
                {
                  val: isLoading ? "—" : `${stats.avgHold}d`,
                  label: "Avg Hold Time",
                  color: "",
                },
                {
                  val: isLoading ? "—" : `${stats.avgRoi}%`,
                  label: "Avg Annualized ROI",
                  color: "text-[#e8432d]",
                },
                {
                  val: isLoading ? "—" : `${stats.profitPct}%`,
                  label: "Deals Profitable",
                  color: "",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="py-7 px-6 first:pl-0 last:border-r-0 hidden lg:block [&:nth-child(-n+3)]:block"
                >
                  <div
                    className={`font-mono text-[clamp(22px,2.2vw,30px)] font-medium leading-none tracking-[-0.02em] mb-1.5 ${
                      stat.color || "text-[#f0ebe3]"
                    }`}
                  >
                    {stat.val}
                  </div>
                  <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#f7f4ef] border-b border-[rgba(13,12,11,0.07)] px-6 sm:px-10 lg:px-14 py-4 sticky top-[68px] z-40">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1 bg-[rgba(13,12,11,0.06)] rounded-full p-1 overflow-x-auto">
              {states.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setActiveState(state)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    activeState === state
                      ? "bg-white text-[#0d0c0b] shadow-sm"
                      : "text-[rgba(13,12,11,0.45)] hover:text-[#0d0c0b]"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-[12px] text-[rgba(13,12,11,0.4)]">
              <span>
                Showing <span className="font-semibold text-[#0d0c0b]">{filtered.length} deals</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-[rgba(13,12,11,0.12)] bg-white text-[rgba(13,12,11,0.6)] px-3 py-1.5 rounded-[8px] text-[12px] outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="roi">Highest ROI</option>
                <option value="profit">Highest Profit</option>
                <option value="hold">Shortest Hold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#f7f4ef] px-6 sm:px-10 lg:px-14 py-10 max-w-[1360px] mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#e8432d]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-[rgba(13,12,11,0.4)]">
              No closed deals yet. Upload your first closeout PDF in the Admin panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
