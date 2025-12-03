import { Layout } from "@/components/Layout";
import { useRoute, Link, useLocation } from "wouter";
import { properties } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ChevronLeft, Lock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Invest() {
  const [, params] = useRoute("/invest/:propertyId");
  const property = properties.find((p) => p.id === params?.propertyId);
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState(25000);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!property) return <div>Property not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
        title: "Commitment Submitted",
        description: "We have received your investment commitment. Our team will contact you shortly."
    });
  };

  if (submitted) {
      return (
          <Layout>
              <div className="container mx-auto px-4 py-20 max-w-lg text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Commitment Received</h1>
                  <p className="text-muted-foreground mb-8">
                      Thank you for your commitment of <strong>${amount.toLocaleString()}</strong> to <strong>{property.address}</strong>.
                      <br/>
                      Our team will review your profile and send the subscription documents within 24 hours.
                  </p>
                  <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setLocation("/")}>Return Home</Button>
                      <Button onClick={() => setLocation("/admin")}>View in Dashboard</Button>
                  </div>
              </div>
          </Layout>
      )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href={`/property/${property.slug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Property
        </Link>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="border-b bg-secondary/30">
            <CardTitle>Investment Commitment</CardTitle>
            <CardDescription>Secure your allocation in this opportunity.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg border">
                <img src={property.images[0]} className="w-16 h-16 rounded-md object-cover" alt="thumb" />
                <div>
                    <h3 className="font-semibold">{property.address}</h3>
                    <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Commitment Amount ($)</Label>
                <Input 
                    id="amount" 
                    type="number" 
                    min="1000"
                    max={property.equity_available}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="text-lg font-mono h-12"
                />
                <p className="text-xs text-muted-foreground">
                    Available allocation: ${property.equity_available.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                  <Label>Estimated Equity Ownership</Label>
                  <div className="text-2xl font-bold">
                      {((amount / (property.purchase_price + property.rehab_budget)) * 100).toFixed(2)}%
                  </div>
              </div>

              <div className="flex items-start gap-3 pt-4">
                <Checkbox 
                    id="terms" 
                    checked={agreed} 
                    onCheckedChange={(c) => setAgreed(c === true)} 
                    className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I understand that this is a non-binding indication of interest.
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By submitting this form, you confirm you are an accredited investor and agree to our terms of service.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={!agreed || amount <= 0}>
                <Lock className="h-4 w-4 mr-2" /> Submit Commitment
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-secondary/30 border-t py-4 justify-center">
              <p className="text-xs text-muted-foreground flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  256-bit SSL Encrypted connection
              </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
