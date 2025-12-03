import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, File, X } from "lucide-react";
import { useState } from "react";

export interface Document {
  id: string;
  property_id: string;
  type: "bpo" | "purchase_contract" | "other";
  filename: string;
  filepath: string;
  uploaded_at: string;
}

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  onSubmit: (data: Partial<Document>) => void;
}

export function DocumentDialog({ open, onOpenChange, propertyId, onSubmit }: DocumentDialogProps) {
  const [type, setType] = useState<"bpo" | "purchase_contract" | "other">("bpo");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onSubmit({
        property_id: propertyId,
        type,
        filename: file.name,
        filepath: `/uploads/${file.name}`,
        uploaded_at: new Date().toISOString(),
      });
      onOpenChange(false);
      setFile(null);
      setType("bpo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-document">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload property documents for this deal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type *</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger data-testid="select-doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bpo">BPO Report</SelectItem>
                <SelectItem value="purchase_contract">Purchase Contract</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">File *</Label>
            <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                data-testid="input-file-upload"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={() => setFile(null)}
                    data-testid="button-remove-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG up to 10 MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-document"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !file}
              data-testid="button-submit-document"
            >
              {isLoading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
