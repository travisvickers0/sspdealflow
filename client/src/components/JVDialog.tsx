import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export interface JV {
  id: string;
  property_id: string;
  investor_split: number;
  ssp_split: number;
  projected_profit: number;
  notes: string;
}

interface JVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jv?: JV;
  projectedProfit?: number;
  onSubmit: (data: Partial<JV>) => void;
}

export function JVDialog({ open, onOpenChange, jv, projectedProfit = 200000, onSubmit }: JVDialogProps) {
  const [investorSplit, setInvestorSplit] = useState(jv?.investor_split || 50);
  const [sspSplit, setSSPSplit] = useState(jv?.ssp_split || 50);
  const [notes, setNotes] = useState(jv?.notes || "");
  const [isLoading, setIsLoading] = useState(false);

  const investorProfit = (investorSplit / 100) * projectedProfit;
  const sspProfit = (sspSplit / 100) * projectedProfit;
  const totalSplit = investorSplit + sspSplit;

  const handleInvestorChange = (val: number[]) => {
    const newInvestor = val[0];
    const remaining = 100 - newInvestor;
    setInvestorSplit(newInvestor);
    setSSPSplit(remaining);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSplit !== 100) {
      alert("Investor and SSP split must equal 100%");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onSubmit({
        investor_split: investorSplit,
        ssp_split: sspSplit,
        projected_profit: projectedProfit,
        notes,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-jv">
        <DialogHeader>
          <DialogTitle>{jv ? "Edit JV Proposal" : "Create JV Proposal"}</DialogTitle>
          <DialogDescription>
            Define the profit split between investor and SSP.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Projected Total Profit</div>
            <div className="text-2xl font-bold" data-testid="text-total-profit">
              ${projectedProfit.toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Profit Split</Label>
            <Slider
              value={[investorSplit]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleInvestorChange}
              data-testid="slider-investor-split"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">Investor Share</div>
                <div className="font-bold text-lg text-blue-900" data-testid="text-investor-split">
                  {investorSplit}%
                </div>
                <div className="text-xs text-blue-700 mt-1" data-testid="text-investor-profit">
                  ${Math.round(investorProfit).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-medium">SSP Share</div>
                <div className="font-bold text-lg text-orange-900" data-testid="text-ssp-split">
                  {sspSplit}%
                </div>
                <div className="text-xs text-orange-700 mt-1" data-testid="text-ssp-profit">
                  ${Math.round(sspProfit).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jv-notes">Proposal Notes</Label>
            <Textarea
              id="jv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details about this JV proposal..."
              rows={3}
              data-testid="textarea-jv-notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-jv"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || totalSplit !== 100}
              data-testid="button-submit-jv"
            >
              {isLoading ? "Saving..." : jv ? "Update Proposal" : "Create Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
