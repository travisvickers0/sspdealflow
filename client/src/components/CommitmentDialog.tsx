import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Commitment } from "@/lib/mockData";

interface CommitmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commitment?: Commitment;
  onApprove?: (notes: string) => void;
  onReject?: (notes: string) => void;
}

export function CommitmentDialog({ open, onOpenChange, commitment, onApprove, onReject }: CommitmentDialogProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onApprove?.(notes);
      onOpenChange(false);
      setNotes("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onReject?.(notes);
      onOpenChange(false);
      setNotes("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-commitment">
        <DialogHeader>
          <DialogTitle>Review Commitment</DialogTitle>
          <DialogDescription>
            Approve or reject this investment commitment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Investor</div>
              <div className="font-medium" data-testid="text-investor-id">User {commitment?.user_id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-medium text-lg" data-testid="text-commitment-amount">${commitment?.amount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Equity %</div>
              <div className="font-medium" data-testid="text-equity-percent">{commitment?.equity_percent.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium capitalize" data-testid="text-commitment-status">{commitment?.status}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Decision Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this commitment..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-commitment"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              disabled={isLoading}
              onClick={handleReject}
              data-testid="button-reject-commitment"
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </Button>
            <Button 
              type="button"
              disabled={isLoading}
              onClick={handleApprove}
              data-testid="button-approve-commitment"
            >
              {isLoading ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
