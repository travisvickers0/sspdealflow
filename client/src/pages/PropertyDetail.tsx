import { Layout } from "@/components/Layout";
import { properties, commitments } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRoute, Link } from "wouter";
import { MapPin, ChevronLeft, CheckCircle2, Home as HomeIcon, Ruler, DollarSign, FileText, Share2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const property = properties.find((p) => p.slug === params?.slug);

  if (!property) return <div>Property not found</div>;

  const fundedPercent = Math.min(100, Math.max(0, ((property.purchase_price + property.rehab_budget - property.equity_available) / (property.purchase_price + property.rehab_budget)) * 100));

  // Mock JV Calculator State
  const [investorContribution, setInvestorContribution] = useState(50000);
  const totalCost = property.purchase_price + property.rehab_budget;
  const projectedProfit = property.arv - totalCost; // Simplified
  const investorShare = (investorContribution / totalCost) * projectedProfit; // Simplified logic

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-muted aspect-video relative group">
              <img 
                src={property.images[0]} 
                alt={property.address} 
                className="w-full h-full object-cover"
              />
              <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                View All Photos
              </Button>
            </div>

            {/* Header Info */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{property.address}</h1>
                <div className="flex gap-2">
                   <Button variant="outline" size="icon" className="rounded-full">
                    <Share2 className="h-4 w-4" />
                   </Button>
                </div>
              </div>
              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city}, {property.state} {property.zip}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y">
                <div>
                  <div className="text-sm text-muted-foreground">Purchase Price</div>
                  <div className="font-semibold text-lg">${property.purchase_price.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rehab Budget</div>
                  <div className="font-semibold text-lg">${property.rehab_budget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">ARV</div>
                  <div className="font-semibold text-lg">${property.arv.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Est. Profit</div>
                  <div className="font-semibold text-lg text-green-600">${(property.arv - (property.purchase_price + property.rehab_budget)).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">About this Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                  <br /><br />
                  This opportunity represents a prime value-add scenario in a rapidly appreciating neighborhood. 
                  Our team has secured this off-market deal at significantly below replacement cost. 
                  The renovation plan includes a full cosmetic update, modernizing the kitchen and baths, 
                  and enhancing curb appeal to maximize resale value.
                </p>
              </div>
            </div>

            {/* Location Map Placeholder */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64 bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
                <div className="text-muted-foreground flex flex-col items-center">
                  <MapPin className="h-8 w-8 mb-2 text-primary" />
                  <span>Map View Placeholder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Funding Status Card */}
            <Card className="shadow-lg border-0 ring-1 ring-gray-200 sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Investment Status</CardTitle>
                <CardDescription>Funding closes in 14 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{Math.round(fundedPercent)}%</span>
                  </div>
                  <Progress value={fundedPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>${(totalCost - property.equity_available).toLocaleString()} Raised</span>
                    <span>${totalCost.toLocaleString()} Goal</span>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min. Investment</span>
                    <span className="font-medium">$25,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Equity Available</span>
                    <span className="font-medium text-primary">${property.equity_available.toLocaleString()}</span>
                  </div>
                </div>

                <Link href={`/invest/${property.id}`} className="block">
                   <Button className="w-full h-12 text-base font-semibold shadow-md" size="lg" disabled={property.equity_available === 0}>
                    {property.equity_available > 0 ? "Commit to Invest" : "Fully Funded"}
                  </Button>
                </Link>
                
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> Vetted</div>
                  <div className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1 text-green-500" /> Secure</div>
                </div>
              </CardContent>
            </Card>

            {/* JV Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profit Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Investment</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[investorContribution]} 
                        min={10000} 
                        max={property.equity_available || 100000} 
                        step={5000} 
                        onValueChange={(val) => setInvestorContribution(val[0])}
                        className="flex-1"
                      />
                      <Input 
                        className="w-24 text-right font-mono" 
                        value={`$${investorContribution.toLocaleString()}`} 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Projected Profit Share</span>
                      <span className="font-bold text-green-600 text-lg">
                        ${Math.round(investorShare).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                       <span>Est. ROI</span>
                       <span>~{Math.round((investorShare / investorContribution) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Documents */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button variant="ghost" className="justify-start h-auto py-3 px-2" asChild>
                        <a href="#">
                            <FileText className="h-4 w-4 mr-3 text-primary" />
                            <div className="text-left">
                                <div className="font-medium text-sm">Property Pro Forma</div>
                                <div className="text-xs text-muted-foreground">PDF • 2.4 MB</div>
                            </div>
                        </a>
                    </Button>
                    <Button variant="ghost" className="justify-start h-auto py-3 px-2" asChild>
                        <a href="#">
                            <FileText className="h-4 w-4 mr-3 text-primary" />
                            <div className="text-left">
                                <div className="font-medium text-sm">Inspection Report</div>
                                <div className="text-xs text-muted-foreground">PDF • 5.1 MB</div>
                            </div>
                        </a>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ShieldCheck(props: any) {
    return (
        <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
    )
}
