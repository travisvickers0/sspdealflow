import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import type { ClosedDeal } from "@shared/schema";

const fmtMoney = (n?: number | null) => (n == null ? "—" : `$${n.toLocaleString()}`);

const fmtDate = (value?: string | null, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(
    "en-US",
    options ?? {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

const generalizeVendor = (
  category: string,
  index: number
): string => {
  const labels: Record<string, string[]> = {
    Renovation: [
      "General Contractor",
      "Specialty Trade",
      "Materials & Labor",
      "Subcontractor",
    ],
    Holding: [
      "Property Taxes",
      "Insurance",
      "Utilities",
      "HOA / Other",
    ],
    Acquisition: [
      "Closing Costs",
      "Title & Escrow",
      "Inspection",
      "Other",
    ],
    Sales: [
      "Agent Commission",
      "Closing Costs",
      "Staging",
      "Other",
    ],
  };
  const options =
    labels[category] ??
    labels["Renovation"];
  return options[index % options.length];
};

export default function ClosedDealDetail() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.slug]);

  const { data: deal, isLoading } = useQuery<ClosedDeal>({
    queryKey: [`/api/closed-deals/${params.slug}`],
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] bg-[#f7f4ef]">
          <Loader2 className="h-8 w-8 animate-spin text-[#e8432d]" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <div className="min-h-[60vh] bg-[#f7f4ef] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[#0d0c0b] mb-3">Closed deal not found</h1>
          <p className="text-[14px] text-[rgba(13,12,11,0.45)] mb-6 max-w-[420px]">
            This case study may have been removed or the link is incorrect.
          </p>
          <button
            type="button"
            onClick={() => setLocation("/track-record")}
            className="bg-[#0d0c0b] text-white font-semibold text-[14px] px-5 py-3 rounded-[12px] hover:bg-[#e8432d] transition-colors"
          >
            Back to Track Record
          </button>
        </div>
      </Layout>
    );
  }

  const closeDateLong = deal.closeDate
    ? `Closed ${new Date(deal.closeDate)
        .toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })}`
    : "";

  const costLineItems = Array.isArray(deal.costLineItems) ? (deal.costLineItems as any[]) : [];

  const timelineItems = [
    {
      date: fmtDate(deal.acquisitionDate),
      event: "Acquisition",
      detail: `Property acquired at ${fmtMoney(deal.purchasePrice)} - ${deal.source ?? "Acquisition"}`,
    },
    {
      date: "During hold period",
      event: "Renovation",
      detail: [
        deal.rehabCosts != null ? `${fmtMoney(deal.rehabCosts)} in rehab costs` : "No renovation costs",
        deal.holdingCosts != null ? `${fmtMoney(deal.holdingCosts)} holding costs` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      date: fmtDate(deal.closeDate),
      event: "Settlement & Distribution",
      detail: `Sale closed. 50/50 split distributed. ${fmtMoney(deal.totalInvestorPayoff)} returned to investor.`,
    },
  ];

  const sourceRows = [
    { label: "Net Sale Proceeds", value: deal.netSaleProceeds, green: true },
    { label: "Investor Capital", value: deal.investorCapital, green: false },
    { label: "Excess Draw Reimbursement", value: deal.excessDrawReimbursement, green: false },
  ];

  const useRows = [
    { label: "Cash to Close", value: deal.cashToClose, accent: false },
    { label: "Earnest Money", value: deal.earnestMoney, accent: false },
    { label: "Acquisition Costs", value: deal.acquisitionCosts, accent: false },
    { label: "Rehab Costs", value: deal.rehabCosts, accent: false },
    { label: "Holding Costs", value: deal.holdingCosts, accent: true },
    { label: "Sales Costs", value: deal.salesCosts, accent: false },
  ];

  const settlementRows = [
    { label: "Capital Contributed", value: fmtMoney(deal.investorCapital), green: false },
    { label: "Profit Share (50%)", value: deal.investorProfitShare != null ? `+${fmtMoney(deal.investorProfitShare)}` : "—", green: true },
    { label: "Investor ROI", value: deal.investorRoi != null ? `${deal.investorRoi.toFixed(2)}%` : "—", green: true },
    { label: "Annualized APR", value: deal.annualizedRoi != null ? `${deal.annualizedRoi.toFixed(2)}%` : "—", green: true },
    { label: "Total Payoff", value: fmtMoney(deal.totalInvestorPayoff), green: true },
  ];

  const summaryRows = [
    { label: "Purchase Price", value: fmtMoney(deal.purchasePrice), green: false },
    { label: "Rehab Costs", value: fmtMoney(deal.rehabCosts), green: false },
    { label: "Net Profit", value: fmtMoney(deal.dealProfit), green: true },
  ];

  const sidebarTimelineRows = [
    { label: "Acquisition", value: fmtDate(deal.acquisitionDate), accent: false },
    { label: "Settlement", value: fmtDate(deal.closeDate), accent: false },
    { label: "Days Held", value: deal.daysHeld ? `${deal.daysHeld} days` : "—", accent: true },
  ];

  return (
    <Layout transparentNav>
      <div className="bg-[#f7f4ef]">
        <div className="relative overflow-hidden min-h-[400px] lg:min-h-[480px] flex items-end">
          {deal.mainPhotoUrl ? (
            <img
              src={deal.mainPhotoUrl}
              alt={deal.address}
              className="absolute inset-0 w-full h-full object-cover object-[50%_40%]"
              style={{ filter: "brightness(0.32) saturate(0.8)" }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#0d0c0b]" />
          )}

          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.72) 100%)",
            }}
          />

          <div className="absolute top-14 sm:top-16 left-0 right-0 z-20">
            <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-14 pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setLocation("/track-record")}
                className="flex items-center gap-2 text-[14px] font-medium text-[rgba(255,255,255,0.78)] hover:text-white transition-colors bg-[rgba(0,0,0,0.28)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] rounded-full px-3.5 py-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Track Record
              </button>
              <div className="text-[12px] text-[rgba(255,255,255,0.58)]">
                {closeDateLong}
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-14 pb-10 pt-28 sm:pt-32">
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase text-[#4ade80]">
                <span className="w-1.5 h-1.5 bg-[#4ade80] rounded-full flex-shrink-0" />
                Completed
              </div>
            </div>

            <h1
              className="font-bold text-[#f0ebe3] leading-[1.05] tracking-[-0.025em] mb-2"
              style={{ fontSize: "clamp(28px,4vw,48px)" }}
            >
              {deal.address}
            </h1>
            <div className="flex items-center gap-1.5 text-[15px] text-[rgba(255,255,255,0.45)] mb-8">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {deal.city}, {deal.state}
              {deal.zip ? ` ${deal.zip}` : ""}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  val: fmtMoney(deal.dealProfit),
                  label: "Deal Profit",
                  sub: "Total net profit at settlement",
                  color: "text-[#4ade80]",
                },
                {
                  val: deal.investorRoi != null ? `${deal.investorRoi.toFixed(2)}%` : "—",
                  label: "Investor ROI",
                  sub: "Flat return on capital",
                  color: "text-[#60a5fa]",
                },
                {
                  val: deal.annualizedRoi != null ? `${deal.annualizedRoi.toFixed(2)}%` : "—",
                  label: "Annualized ROI",
                  sub: `APR over ${deal.daysHeld ?? "—"} days`,
                  color: "text-[#e8432d]",
                },
                {
                  val: fmtMoney(deal.totalInvestorPayoff),
                  label: "Total Investor Payoff",
                  sub: "Capital + profit returned",
                  color: "text-[#f0ebe3]",
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-[rgba(0,0,0,0.45)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] rounded-[14px] p-5"
                >
                  <div
                    className={`font-mono font-medium leading-none tracking-[-0.02em] mb-1.5 ${kpi.color}`}
                    style={{ fontSize: "clamp(20px,2.2vw,30px)" }}
                  >
                    {kpi.val}
                  </div>
                  <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)] mb-1">{kpi.label}</div>
                  <div className="text-[10px] text-[rgba(255,255,255,0.2)]">{kpi.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#f7f4ef]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-14 py-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8432d] mb-5">Deal Timeline</p>
                <div className="flex flex-col gap-0">
                  {timelineItems.map((item, index, arr) => (
                    <div key={item.event} className="flex gap-4 relative">
                      {index < arr.length - 1 ? (
                        <div className="absolute left-[9px] top-5 bottom-[-8px] w-px bg-[rgba(13,12,11,0.1)]" />
                      ) : null}
                      <div className="w-5 h-5 rounded-full bg-[#0d0c0b] flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke="white"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="pb-5">
                        <div className="text-[11px] text-[rgba(13,12,11,0.4)] mb-1">{item.date}</div>
                        <div className="text-[13px] font-semibold text-[#0d0c0b] mb-1">{item.event}</div>
                        <div className="text-[12px] text-[rgba(13,12,11,0.45)]">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8432d] mb-5">Sources & Uses of Funds</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.3)] mb-3">Sources</p>
                    {sourceRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center py-2 border-b border-[rgba(13,12,11,0.05)] last:border-0 text-[13px]"
                      >
                        <span className="text-[rgba(13,12,11,0.6)]">{row.label}</span>
                        <span className={`font-mono font-medium ${row.green ? "text-[#16a34a]" : "text-[#0d0c0b]"}`}>{fmtMoney(row.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-[rgba(13,12,11,0.08)] text-[13px] font-bold">
                      <span className="text-[#0d0c0b]">Total Sources</span>
                      <span className="font-mono text-[#16a34a]">{fmtMoney(deal.totalSources)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.3)] mb-3">Uses</p>
                    {useRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center py-2 border-b border-[rgba(13,12,11,0.05)] last:border-0 text-[13px]"
                      >
                        <span className="text-[rgba(13,12,11,0.6)]">{row.label}</span>
                        <span className={`font-mono font-medium ${row.accent ? "text-[#e8432d]" : "text-[#0d0c0b]"}`}>{fmtMoney(row.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-[rgba(13,12,11,0.08)] text-[13px] font-bold">
                      <span className="text-[#0d0c0b]">Total Uses</span>
                      <span className="font-mono text-[#0d0c0b]">{fmtMoney(deal.totalUses)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {costLineItems.length > 0 ? (
                <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8432d] mb-5">Cost Breakdown</p>
                  {["Renovation", "Holding", "Acquisition", "Sales"].map((category) => {
                    const items = costLineItems.filter((item) => item.category === category);
                    if (!items.length) return null;

                    const total = items.reduce((sum: number, item: any) => sum + (item.amount ?? 0), 0);

                    return (
                      <div key={category} className="mb-5 last:mb-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[rgba(13,12,11,0.4)]">{category}</span>
                          <span className="font-mono text-[13px] font-medium text-[#0d0c0b]">{fmtMoney(total)}</span>
                        </div>
                        {items.map((item: any, index: number) => (
                          <div
                            key={`${category}-${index}`}
                            className="flex justify-between py-1.5 border-b border-[rgba(13,12,11,0.05)] last:border-0 text-[12px]"
                          >
                            <div>
                              <div className="text-[rgba(13,12,11,0.65)] font-medium">{generalizeVendor(item.category, index)}</div>
                            </div>
                            <span className="font-mono font-medium text-[#0d0c0b] flex-shrink-0 ml-4">{fmtMoney(item.amount ?? 0)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8432d] mb-5">JV Profit Split</p>
                <div className="h-2.5 rounded-full overflow-hidden flex mb-3">
                  <div className="flex-1 bg-[#0d0c0b]" />
                  <div className="flex-1 bg-[#e8432d]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-[18px] font-medium text-[#0d0c0b] leading-none mb-1">{fmtMoney(deal.operatorShare)}</div>
                    <div className="text-[12px] text-[rgba(13,12,11,0.5)]">SSP Operator (50%)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[18px] font-medium text-[#0d0c0b] leading-none mb-1">{fmtMoney(deal.partnerShare)}</div>
                    <div className="text-[12px] text-[rgba(13,12,11,0.5)]">Investor Partner (50%)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[#0d0c0b] rounded-[16px] p-5">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.3)] mb-4">Investor Settlement</p>
                {settlementRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.07)] last:border-0 last:pt-3 last:font-bold text-[13px]"
                  >
                    <span className="text-[rgba(255,255,255,0.45)]">{row.label}</span>
                    <span className={`font-mono font-medium ${row.green ? "text-[#4ade80]" : "text-[#f0ebe3]"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(13,12,11,0.35)] mb-4">Deal Summary</p>
                {summaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2 border-b border-[rgba(13,12,11,0.06)] last:border-0 last:font-bold text-[13px]"
                  >
                    <span className="text-[rgba(13,12,11,0.55)]">{row.label}</span>
                    <span className={`font-mono font-medium ${row.green ? "text-[#16a34a]" : "text-[#0d0c0b]"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[rgba(13,12,11,0.06)] rounded-[16px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[rgba(13,12,11,0.35)] mb-4">Timeline</p>
                {sidebarTimelineRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2 border-b border-[rgba(13,12,11,0.06)] last:border-0 text-[13px]"
                  >
                    <span className="text-[rgba(13,12,11,0.55)]">{row.label}</span>
                    <span className={`font-mono font-medium ${row.accent ? "text-[#e8432d]" : "text-[#0d0c0b]"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#e8432d] rounded-[16px] p-5 text-center">
                <div className="text-[13px] font-semibold text-white mb-1.5">Ready to invest in a deal like this?</div>
                <div className="text-[11px] text-[rgba(255,255,255,0.6)] mb-4">Current opportunities are now available</div>
                <button
                  type="button"
                  onClick={() => setLocation("/properties")}
                  className="w-full bg-white text-[#e8432d] font-bold text-[13px] py-2.5 rounded-[10px] border-none cursor-pointer transition-opacity hover:opacity-90"
                >
                  View Open Deals →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
