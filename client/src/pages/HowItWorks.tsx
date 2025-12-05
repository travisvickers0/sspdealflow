import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Building2, Shield } from "lucide-react";

export default function HowItWorks() {
  return (
    <Layout>
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

      {/* INVESTMENT MODEL SECTION */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8 border-t">
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

          <div className="bg-slate-50 p-8 rounded-lg mb-8">
            <p className="text-gray-700 mb-6">
              We operate a single, investor-friendly joint venture model designed for transparency, alignment, and security. Here's how it works:
            </p>

            {/* THREE BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Box 1 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
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
              <div className="bg-white p-6 rounded-lg border border-gray-200">
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
              <div className="bg-white p-6 rounded-lg border border-gray-200">
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

      {/* WHO DOES WHAT SECTION */}
      <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
            Who does what in the partnership
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* What you do */}
            <div>
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
            <div>
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

      {/* DEAL TIMELINE SECTION */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What a typical deal looks like from start to finish
          </h2>
          <p className="text-gray-600 mb-12 text-lg">
            A predictable, repeatable timeline based on dozens of projects.
          </p>

          {/* Timeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-12">
            {[
              { num: "1", title: "Review deals", time: "1–2 days" },
              { num: "2", title: "Lock in plan", time: "3–5 days" },
              { num: "3", title: "Fund purchase", time: "1 day" },
              { num: "4", title: "We execute", time: "60–120 days" },
              { num: "5", title: "Payout", time: "Settlement day" }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.num}
                  </div>
                  {idx < 4 && (
                    <ChevronRight className="w-6 h-6 text-gray-300 -ml-4 -mr-2 hidden sm:block" />
                  )}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{step.title}</p>
                <p className="text-xs text-gray-500">{step.time}</p>
              </div>
            ))}
          </div>

          {/* Detailed Steps */}
          <div className="space-y-8">
            {[
              {
                num: "1",
                title: "You review live deals",
                time: "1–2 days",
                desc: "Browse active opportunities inside SSP DealFlow, review photos, numbers, and projected outcomes. When a deal fits your criteria, you raise your hand."
              },
              {
                num: "2",
                title: "We lock in the plan",
                time: "3–5 days",
                desc: "We finalize acquisition details, improvement scope, timelines, and exit expectations — so you know exactly how your capital is being deployed."
              },
              {
                num: "3",
                title: "You fund the purchase",
                time: "1 day",
                desc: "Your capital is wired to the title company according to the JV structure. Your guaranteed minimum return starts accruing from closing day."
              },
              {
                num: "4",
                title: "We execute the plan",
                time: "60–120 days",
                desc: "We handle all improvements, contractors, oversight, holding costs, and sale preparation. You receive updates at major milestones."
              },
              {
                num: "5",
                title: "You receive your payout",
                time: "Settlement day",
                desc: "Your capital is returned first, then we follow the waterfall: closing costs, your capital, and rehab cost reimbursement. We compare the 50% profit share to your guaranteed minimum and you receive whichever is higher."
              }
            ].map((step, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 pl-6 py-2">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-center text-xs font-bold leading-6">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <span className="text-sm text-gray-500">{step.time}</span>
                </div>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl">
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

      {/* RECENTLY FUNDED DEALS */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Recently funded deals
          </h2>
          <p className="text-gray-600 mb-12">
            Here is a sample of deals that partners have already funded and exited with us. These come directly from the same pipeline you will access inside SSP DealFlow.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { address: "7832 Brickyard Rd, Powell, TN", equity: "$91,052.64", price: "$158,947.36", date: "Nov 29, 2025", bpo: "$250,000", beds: 4, baths: 2, sqft: "1,280" },
              { address: "844 Oconnor St, Smithville, TN", equity: "$69,000", price: "$151,000", date: "Nov 24, 2025", bpo: "$220,000", beds: 3, baths: 2, sqft: "1,256" },
              { address: "4020 North 4th, Evansville, IN", equity: "$48,000", price: "$52,000", date: "Nov 19, 2025", bpo: "$100,000", beds: 4, baths: 2, sqft: "1,580" },
              { address: "500 Soho Pl, Locust Grove, GA", equity: "$65,936", price: "$251,064", date: "TBD", bpo: "$317,000", beds: 4, baths: 3, sqft: "2,669" },
              { address: "9739 Crescent Moon, San Antonio, TX", equity: "$77,850", price: "$142,150", date: "Nov 13, 2025", bpo: "$220,000", beds: 3, baths: 2.5, sqft: "1,644" },
              { address: "240 Line Of Fire Way, Jarrell, TX", equity: "$63,998", price: "$165,000", date: "Nov 9, 2025", bpo: "$228,998", beds: 3, baths: 2, sqft: "1,389" }
            ].map((deal, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 border-b border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Funded</p>
                  <p className="text-lg font-bold text-green-600">{deal.equity} equity</p>
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 mb-4 text-sm">{deal.address}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center">
                      <p className="text-gray-500 mb-1">{deal.beds} bed</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <p className="text-gray-500 mb-1">{deal.baths} bath</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 mb-1">{deal.sqft} sqft</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3 text-xs text-gray-600 space-y-1">
                    <p>Purchase: {deal.price}</p>
                    <p>Closes: {deal.date}</p>
                    <p>BPO: {deal.bpo}</p>
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
