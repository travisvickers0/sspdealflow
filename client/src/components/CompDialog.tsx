import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export interface Comp {
  id: string;
  address: string;
  price: number;
  sq_ft: number;
  distance: number;
}

interface CompDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comp?: Comp;
  onSubmit: (data: Comp) => void;
}

export function CompDialog({ open, onOpenChange, comp, onSubmit }: CompDialogProps) {
  const [formData, setFormData] = useState<Comp>(comp || {
    id: "",
    address: "",
    price: 0,
    sq_ft: 0,
    distance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onSubmit(formData);
      onOpenChange(false);
      setFormData({ id: "", address: "", price: 0, sq_ft: 0, distance: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-comp">
        <DialogHeader>
          <DialogTitle>{comp ? "Edit Comparable Sale" : "Add Comparable Sale"}</DialogTitle>
          <DialogDescription>
            {comp ? "Update the comparable sale details." : "Add a comparable property to help with valuation."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="456 Oak St"
              required
              data-testid="input-comp-address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="500000"
                required
                data-testid="input-comp-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sq_ft">Square Footage *</Label>
              <Input
                id="sq_ft"
                type="number"
                value={formData.sq_ft || ""}
                onChange={(e) => setFormData({ ...formData, sq_ft: Number(e.target.value) })}
                placeholder="3500"
                required
                data-testid="input-comp-sqft"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance">Distance (miles) *</Label>
            <Input
              id="distance"
              type="number"
              step="0.1"
              value={formData.distance || ""}
              onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
              placeholder="0.5"
              required
              data-testid="input-comp-distance"
            />
          </div>

          {formData.sq_ft > 0 && formData.price > 0 && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-xs text-muted-foreground">Price per Sq Ft</div>
              <div className="font-semibold text-lg" data-testid="text-price-per-sqft">
                ${(formData.price / formData.sq_ft).toFixed(2)}/sq ft
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-comp"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-submit-comp"
            >
              {isLoading ? "Saving..." : comp ? "Update Comp" : "Add Comp"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
