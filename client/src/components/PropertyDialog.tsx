import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PropertyForm } from "@/components/PropertyForm";
import { Property } from "@/lib/mockData";
import { useState } from "react";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
  onSubmit: (data: Partial<Property>) => void;
}

export function PropertyDialog({ open, onOpenChange, property, onSubmit }: PropertyDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: Partial<Property>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-property">
        <DialogHeader>
          <DialogTitle>{property ? "Edit Property" : "Add New Property"}</DialogTitle>
          <DialogDescription>
            {property 
              ? "Update the property details below." 
              : "Fill in the details to create a new investment property."}
          </DialogDescription>
        </DialogHeader>
        <PropertyForm 
          property={property}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
