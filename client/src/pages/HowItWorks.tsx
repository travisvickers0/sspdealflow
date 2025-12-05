import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Building2, Shield, TrendingUp, DollarSign, Home, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function HowItWorks() {
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [holdPeriod, setHoldPeriod] = useState(4);

  const estimatedProfit = Math.round(investmentAmount * 0.18 * (holdPeriod / 12));
  const totalReturn = investmentAmount + estimatedProfit;

  return (
    <Layout>
      {/* TRUST TICKER - Key Metrics Bar */}
      <section className="bg-gray-900 py-4 px-4 sm:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">$4.2M</p>
              <p className="text-xs sm:text-sm text-gray-400">Total Asset Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">18%</p>
              <p className="text-xs sm:text-sm text-gray-400">Avg Annualized Return</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-400">$0</p>
              <p className="text-xs sm:text-sm text-gray-400">Principal Lost</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">24</p>
              <p className="text-xs sm:text-sm text-gray-400">Deals Funded</p>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            Investor partnerships
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            How SSP partners with investors
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            You provide the capital. We source, manage, and execute the projects. We share profits when the property exits.
          </p>
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <Link href="/properties">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View current deals
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Book a quick call
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Most partners start with one or two deals to see our process in action.
          </p>
          <p className="text-sm text-gray-500">
            Trusted by private partners investing alongside us in real estate opportunities nationwide.
          </p>
        </div>
      </section>

      {/* PERFORMANCE VS MARKET CHART */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-8 border-t">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            How SSP compares to other investments
          </h2>
          <p className="text-gray-600 mb-10 text-center">
            Target returns that outpace traditional investment vehicles
          </p>

          <div className="flex items-end justify-center gap-8 sm:gap-16 h-64">
            {/* S&P 500 */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-24 bg-gray-300 rounded-t-lg flex items-end justify-center" style={{ height: '80px' }}>
                <span className="text-gray-700 font-bold text-sm pb-2">~10%</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 text-center font-medium">S&P 500</p>
            </div>
            {/* REITs */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-24 bg-gray-400 rounded-t-lg flex items-end justify-center" style={{ height: '100px' }}>
                <span className="text-white font-bold text-sm pb-2">~12%</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 text-center font-medium">REITs</p>
            </div>
            {/* SSP Target */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-24 bg-gray-800 rounded-t-lg flex items-end justify-center relative" style={{ height: '160px' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Target
                </div>
                <span className="text-white font-bold text-lg pb-2">18%+</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-900 mt-3 text-center font-bold">SSP DealFlow</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-8">
            *Past performance does not guarantee future results. Returns shown are targets based on historical deal performance.
          </p>
        </div>
      </section>

      {/* INVESTMENT MODEL SECTION */}
      <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
            <Building2 className="w-5 h-5" />
            <span>Our investment model</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Our investment model (simple, transparent, aligned)
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            One structure. One partnership. One shared outcome.
          </p>

          <div className="bg-white p-8 rounded-lg mb-8 border border-gray-200">
            <p className="text-gray-700 mb-6">
              We operate a single, investor-friendly joint venture model designed for transparency, alignment, and security. Here's how it works:
            </p>

            {/* THREE BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Box 1 */}
              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">You fund the purchase. We handle everything else.</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>You provide the capital needed to acquire the property.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>We advance all rehab, improvements, holding costs, and management from our own funds.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>When the property sells, both sides are reimbursed and profits are split 50/50.</span>
                  </li>
                </ul>
              </div>

              {/* Box 2 */}
              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Your return is whichever is greater:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-2">Option 1</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">50% of net profit after all costs</p>
                    <p className="text-sm text-gray-600">You receive half of the true profit after closing costs, your capital return, and rehab reimbursement.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-2">Option 2</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Guaranteed minimum return</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 1 percent per month</li>
                      <li>• Minimum 8 percent total</li>
                      <li>• Paid if profit doesn't exceed minimum</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Box 3 */}
              <div className="bg-slate-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Designed to protect investors
                </h3>
                <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">Based on our Joint Venture Agreement:</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Your capital is returned first.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>All rehab costs we paid are reimbursed next.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Then the real profit is calculated and shared.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>If profit isn't enough for guaranteed minimum, we cover the shortfall.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="font-bold text-green-900">You win in good deals.</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="font-bold text-blue-900">You are protected in slow or break-even deals.</p>
              </div>
              <div className="sm:col-span-2 bg-purple-50 border border-purple-200 p-4 rounded">
                <p className="font-bold text-purple-900">Our goals remain perfectly aligned.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPITAL PROTECTION DIAGRAM */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-center">
            How your capital is protected
          </h2>
          <p className="text-gray-600 mb-12 text-center text-lg">
            Your investment sits in the most secure position in the capital stack
          </p>

          <div className="max-w-md mx-auto">
            {/* Capital Stack Visualization */}
            <div className="space-y-0">
              {/* SSP Equity - Risk Buffer */}
              <div className="bg-gray-200 p-6 rounded-t-xl border-2 border-gray-300 border-b-0 relative">
                <div className="absolute -top-3 right-4 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Risk Buffer
                </div>
                <p className="font-bold text-gray-700 text-lg">SSP Equity</p>
                <p className="text-sm text-gray-600">We absorb losses first. Our capital takes the hit before yours.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Higher risk position</span>
                </div>
              </div>

              {/* Investor Capital - 1st Lien */}
              <div className="bg-gray-800 p-6 border-2 border-gray-900 relative">
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  1st Lien Position
                </div>
                <p className="font-bold text-white text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Your Investment
                </p>
                <p className="text-sm text-gray-300">Secured by the property itself. You get paid back first.</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Protected position</span>
                </div>
              </div>

              {/* Property Foundation */}
              <div className="bg-gray-900 p-6 rounded-b-xl border-2 border-gray-900 border-t-0">
                <div className="flex items-center justify-center gap-3">
                  <Home className="w-8 h-8 text-white" />
                  <div>
                    <p className="font-bold text-white">The Property</p>
                    <p className="text-xs text-gray-400">Real asset backing your investment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-4">
                <span className="font-bold text-green-800">SSP loses money before you do.</span>
                <br />
                <span className="text-green-700">Your capital is protected by our equity buffer and backed by real property.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO DOES WHAT SECTION */}
      <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
            Who does what in the partnership
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* What you do */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                What you do
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Decide how much capital you want to put to work.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Review live deals inside SSP DealFlow.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Select the opportunities that fit your comfort level.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Fund your portion at closing through the title company.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>Receive updates and a detailed payout summary at exit.</span>
                </li>
              </ul>
            </div>

            {/* What we do */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                What we do
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Source and underwrite investment-ready properties.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Manage inspections, contractors, renovations, and improvements.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Advance all rehab funds from our own capital.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Cover taxes, insurance, utilities, and hold costs.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>List, negotiate, and sell the property.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Calculate the full payout waterfall through title.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Send you capital plus profit or guaranteed minimum, whichever is greater.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DEAL TIMELINE - GANTT STYLE */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What a typical deal looks like
          </h2>
          <p className="text-gray-600 mb-12 text-lg">
            A predictable, repeatable timeline based on dozens of projects.
          </p>

          {/* Gantt Chart */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Month Headers */}
              <div className="flex border-b border-gray-200 pb-2 mb-4">
                <div className="w-32 flex-shrink-0"></div>
                {['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'].map((month, idx) => (
                  <div key={idx} className="flex-1 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {month}
                  </div>
                ))}
              </div>

              {/* Gantt Rows */}
              <div className="space-y-3">
                {/* Acquisition */}
                <div className="flex items-center">
                  <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-700">Acquisition</div>
                  <div className="flex-1 flex">
                    <div className="w-1/6 pr-1">
                      <div className="bg-gray-800 h-8 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Close</span>
                      </div>
                    </div>
                    <div className="w-5/6"></div>
                  </div>
                </div>

                {/* Rehab */}
                <div className="flex items-center">
                  <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-700">Rehab</div>
                  <div className="flex-1 flex">
                    <div className="w-1/6"></div>
                    <div className="w-3/6 pr-1">
                      <div className="bg-gray-600 h-8 rounded flex items-center justify-center" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' }}>
                        <span className="text-white text-xs font-bold">Renovations</span>
                      </div>
                    </div>
                    <div className="w-2/6"></div>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex items-center">
                  <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-700">Marketing</div>
                  <div className="flex-1 flex">
                    <div className="w-4/6"></div>
                    <div className="w-1/6 pr-1">
                      <div className="bg-gray-400 h-8 rounded flex items-center justify-center">
                        <span className="text-gray-800 text-xs font-bold">List</span>
                      </div>
                    </div>
                    <div className="w-1/6"></div>
                  </div>
                </div>

                {/* Sale/Exit */}
                <div className="flex items-center">
                  <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-700">Sale/Exit</div>
                  <div className="flex-1 flex">
                    <div className="w-5/6"></div>
                    <div className="w-1/6 flex items-center justify-center">
                      <div className="w-8 h-8 bg-green-600 rotate-45 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white -rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-8 text-xs text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 rounded"></div>
                  <span>Acquisition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)' }}></div>
                  <span>Active Work</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rotate-45"></div>
                  <span>Liquidity Event</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Details */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">Day 1</p>
              <p className="text-sm text-gray-600 mt-1">Your capital is wired</p>
              <p className="text-xs text-green-600 mt-2 font-semibold">Guaranteed minimum starts accruing</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">60-120 Days</p>
              <p className="text-sm text-gray-600 mt-1">Typical hold period</p>
              <p className="text-xs text-gray-500 mt-2">Updates at major milestones</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">Settlement</p>
              <p className="text-sm text-gray-600 mt-1">Capital + profit returned</p>
              <p className="text-xs text-green-600 mt-2 font-semibold">Or guaranteed minimum, whichever is higher</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="bg-gray-900 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center">
            Calculate your potential return
          </h2>
          <p className="text-gray-400 mb-10 text-center">
            See what your investment could earn based on our target 18% annual return
          </p>

          <div className="bg-gray-800 p-8 rounded-xl">
            {/* Investment Amount Slider */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Investment Amount</label>
                <span className="text-lg font-bold text-white">${investmentAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="500000"
                step="10000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$50K</span>
                <span>$500K</span>
              </div>
            </div>

            {/* Hold Period Dropdown */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Hold Period</label>
                <span className="text-lg font-bold text-white">{holdPeriod} months</span>
              </div>
              <select
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(Number(e.target.value))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={3}>3 months</option>
                <option value={4}>4 months</option>
                <option value={5}>5 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>

            {/* Results */}
            <div className="border-t border-gray-700 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Estimated Profit</p>
                  <p className="text-3xl font-bold text-green-400">+${estimatedProfit.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Total Return</p>
                  <p className="text-3xl font-bold text-white">${totalReturn.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                *Estimates based on 18% annualized target return. Actual returns may vary. Guaranteed minimum of 8% or 1%/month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-2xl text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Schedule your intro call
          </h2>
          <p className="text-lg mb-2 text-blue-100">
            Want to walk through how this structure works live, or see if our deals match your investment goals?
          </p>
          <p className="text-sm text-blue-100 mb-8">
            Calls typically last 10–15 minutes and are purely informational.
          </p>
          <Button size="lg" variant="secondary" className="mb-8">
            Book a call with us
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm mb-2">✓</p>
              <p className="text-sm">Talk through your ideal check size and risk level.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm mb-2">✓</p>
              <p className="text-sm">Walk the numbers on a real example deal.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm mb-2">✓</p>
              <p className="text-sm">Ask anything about returns, timelines, and structure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY FUNDED DEALS - UPGRADED */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Recently funded deals
          </h2>
          <p className="text-gray-600 mb-12">
            Here is a sample of deals that partners have already funded and exited with us.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { address: "7832 Brickyard Rd, Powell, TN", equity: 91052.64, price: 158947.36, bpo: 250000, investorPct: 64, sspPct: 36, returnPct: 57, beds: 4, baths: 2, sqft: "1,280" },
              { address: "844 Oconnor St, Smithville, TN", equity: 69000, price: 151000, bpo: 220000, investorPct: 69, sspPct: 31, returnPct: 46, beds: 3, baths: 2, sqft: "1,256" },
              { address: "4020 North 4th, Evansville, IN", equity: 48000, price: 52000, bpo: 100000, investorPct: 52, sspPct: 48, returnPct: 92, beds: 4, baths: 2, sqft: "1,580" },
              { address: "500 Soho Pl, Locust Grove, GA", equity: 65936, price: 251064, bpo: 317000, investorPct: 79, sspPct: 21, returnPct: 26, beds: 4, baths: 3, sqft: "2,669" },
              { address: "9739 Crescent Moon, San Antonio, TX", equity: 77850, price: 142150, bpo: 220000, investorPct: 65, sspPct: 35, returnPct: 55, beds: 3, baths: 2.5, sqft: "1,644" },
              { address: "240 Line Of Fire Way, Jarrell, TX", equity: 63998, price: 165000, bpo: 228998, investorPct: 72, sspPct: 28, returnPct: 39, beds: 3, baths: 2, sqft: "1,389" }
            ].map((deal, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                {/* Header with Status */}
                <div className="bg-gray-900 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Funded</span>
                    <span className="text-xs text-gray-400">100% Complete</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-bold text-gray-900 mb-3 text-sm">{deal.address}</p>
                  
                  {/* Capital Stack Donut */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-16 h-16">
                        {/* Background circle */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        {/* Investor portion */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.9155" 
                          fill="none" 
                          stroke="#1f2937" 
                          strokeWidth="3" 
                          strokeDasharray={`${deal.investorPct} ${100 - deal.investorPct}`}
                          strokeDashoffset="25"
                          className="transform -rotate-90 origin-center"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">{deal.investorPct}%</span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                        <span className="text-gray-600">Investor: {deal.investorPct}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                        <span className="text-gray-600">SSP: {deal.sspPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Equity & Return */}
                  <div className="flex justify-between items-center mb-4 p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Equity</p>
                      <p className="text-lg font-bold text-green-600">${deal.equity.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Return</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <p className="text-lg font-bold text-green-600">{deal.returnPct}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 border-t pt-3">
                    <div className="text-center">{deal.beds} bed</div>
                    <div className="text-center border-l border-r border-gray-200">{deal.baths} bath</div>
                    <div className="text-center">{deal.sqft} sqft</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
            Common questions from new investors
          </h2>

          <div className="space-y-6">
            {[
              { q: "What is the minimum to start?", a: "We work with investors of all sizes. Most partners start with $50K-$250K to diversify across multiple deals." },
              { q: "How is my money protected?", a: "Your capital is held by the title company. We maintain a joint venture agreement with clear waterfall protections for your investment." },
              { q: "How long is my money typically in a deal?", a: "Most deals run 60-120 days from closing to payout. However, some can extend longer depending on market conditions and scope." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8 border-t">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to see current opportunities?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse live deals, see real numbers, and choose the ones that match your goals.
          </p>
          <Link href="/properties">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 mb-8">
              View all current deals <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            New opportunities added weekly.
          </p>
        </div>
      </section>
    </Layout>
  );
}
