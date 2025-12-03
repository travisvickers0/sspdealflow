import { useForm } from "react-hook-form";
import { Property, PropertyStatus } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: Partial<Property>) => void;
  isLoading?: boolean;
}

export function PropertyForm({ property, onSubmit, isLoading }: PropertyFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: property || {
      address: "",
      city: "",
      state: "",
      zip: "",
      lat: 0,
      lng: 0,
      purchase_price: 0,
      arv: 0,
      rehab_budget: 0,
      equity_available: 0,
      description: "",
      status: "needs_funding" as PropertyStatus,
    },
  });

  const [status, setStatus] = useState<PropertyStatus>(property?.status || "needs_funding");
  const purchasePrice = watch("purchase_price");
  const rehabBudget = watch("rehab_budget");
  const equityAvailable = watch("equity_available");
  const totalCost = (purchasePrice || 0) + (rehabBudget || 0);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, status }))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address *</Label>
          <Input
            id="address"
            {...register("address", { required: "Address is required" })}
            placeholder="123 Main St"
            data-testid="input-address"
          />
          {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              {...register("city", { required: "City is required" })}
              placeholder="Austin"
              data-testid="input-city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              {...register("state", { required: "State is required" })}
              placeholder="TX"
              maxLength={2}
              data-testid="input-state"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP</Label>
            <Input
              id="zip"
              {...register("zip")}
              placeholder="78702"
              data-testid="input-zip"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="0.0001"
            {...register("lat", { valueAsNumber: true })}
            placeholder="30.2672"
            data-testid="input-latitude"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="0.0001"
            {...register("lng", { valueAsNumber: true })}
            placeholder="-97.7431"
            data-testid="input-longitude"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Financial Details</Label>
        <Card className="p-4 border-0 bg-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-xs">Purchase Price *</Label>
              <Input
                id="purchase_price"
                type="number"
                {...register("purchase_price", { valueAsNumber: true, required: "Required" })}
                placeholder="450000"
                data-testid="input-purchase-price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rehab_budget" className="text-xs">Rehab Budget *</Label>
              <Input
                id="rehab_budget"
                type="number"
                {...register("rehab_budget", { valueAsNumber: true, required: "Required" })}
                placeholder="120000"
                data-testid="input-rehab-budget"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arv" className="text-xs">ARV (After Repair Value) *</Label>
              <Input
                id="arv"
                type="number"
                {...register("arv", { valueAsNumber: true, required: "Required" })}
                placeholder="750000"
                data-testid="input-arv"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equity_available" className="text-xs">Equity Available *</Label>
              <Input
                id="equity_available"
                type="number"
                {...register("equity_available", { valueAsNumber: true, required: "Required" })}
                placeholder="200000"
                data-testid="input-equity"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Project Cost:</span>
              <span className="font-semibold">${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit (ARV - Cost):</span>
              <span className="font-semibold text-green-600">${((watch("arv") || 0) - totalCost).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe the property and investment opportunity..."
          rows={4}
          data-testid="input-description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Property Status *</Label>
        <Select value={status} onValueChange={(val) => setStatus(val as PropertyStatus)}>
          <SelectTrigger data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="needs_funding">Needs Funding</SelectItem>
            <SelectItem value="committed">Fully Committed</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" disabled={isLoading} data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid="button-submit">
          {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
        </Button>
      </div>
    </form>
  );
}
