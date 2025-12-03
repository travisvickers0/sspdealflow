import { Layout } from "@/components/Layout";
import { properties as initialProperties, commitments, Property } from "@/lib/mockData";
import { PropertyDialog } from "@/components/PropertyDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, FileText, Check, X, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Admin() {
  const [properties, setProperties] = useState(initialProperties);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();

  const handleOpenDialog = (property?: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProperty(undefined);
  };

  const handleSubmitProperty = (data: Partial<Property>) => {
    if (selectedProperty) {
      // Edit existing
      setProperties(properties.map(p => 
        p.id === selectedProperty.id 
          ? { ...p, ...data, updated_at: new Date().toISOString() }
          : p
      ));
      toast({
        title: "Property Updated",
        description: `${data.address} has been updated successfully.`,
      });
    } else {
      // Add new
      const newProperty: Property = {
        id: String(properties.length + 1),
        slug: (data.address || "").toLowerCase().replace(/\s+/g, "-"),
        images: [],
        created_at: new Date().toISOString(),
        ...data,
      } as Property;
      setProperties([...properties, newProperty]);
      toast({
        title: "Property Created",
        description: `${data.address} has been added successfully.`,
      });
    }
    handleCloseDialog();
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
    toast({
      title: "Property Deleted",
      description: "Property has been removed.",
    });
  };

  return (
    <Layout>
      <PropertyDialog 
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        property={selectedProperty}
        onSubmit={handleSubmitProperty}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar Rail */}
        <div className="w-64 border-r bg-muted/20 hidden md:block p-6 space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground px-2 mb-2">Overview</h3>
                <Button variant="secondary" className="w-full justify-start" data-testid="nav-dashboard">Dashboard</Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-analytics">Analytics</Button>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground px-2 mb-2">Deal Flow</h3>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-properties">Properties</Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-commitments">Commitments</Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-documents">Documents</Button>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground px-2 mb-2">AI Tools</h3>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-bpo">BPO Extraction</Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-comps">Market Comps</Button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 bg-background">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage properties and investment commitments.</p>
                </div>
                <Button className="gap-2" onClick={() => handleOpenDialog()} data-testid="button-new-property">
                    <Plus className="h-4 w-4" /> New Property
                </Button>
            </div>

            <Tabs defaultValue="properties" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="commitments">Commitments</TabsTrigger>
                    <TabsTrigger value="bpo">AI BPO Tools</TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="search" 
                              placeholder="Search properties..." 
                              className="pl-9 bg-white"
                              data-testid="input-search-properties"
                            />
                        </div>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Equity Avail</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.map((p) => (
                                    <TableRow key={p.id} data-testid={`row-property-${p.id}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span data-testid={`text-address-${p.id}`}>{p.address}</span>
                                                <span className="text-xs text-muted-foreground" data-testid={`text-location-${p.id}`}>{p.city}, {p.state}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize" data-testid={`badge-status-${p.id}`}>
                                              {p.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" data-testid={`text-price-${p.id}`}>
                                          ${(p.purchase_price + p.rehab_budget).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right" data-testid={`text-equity-${p.id}`}>
                                          ${p.equity_available.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-8 w-8"
                                                  onClick={() => handleOpenDialog(p)}
                                                  data-testid={`button-edit-${p.id}`}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                                                  onClick={() => handleDeleteProperty(p.id)}
                                                  data-testid={`button-delete-${p.id}`}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="commitments" className="space-y-4">
                    <Card>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Investor</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {commitments.map((c) => (
                                    <TableRow key={c.id} data-testid={`row-commitment-${c.id}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span data-testid={`text-user-${c.id}`}>User {c.user_id}</span>
                                                <span className="text-xs text-muted-foreground">user@example.com</span>
                                            </div>
                                        </TableCell>
                                        <TableCell data-testid={`text-property-${c.id}`}>
                                            {properties.find(p => p.id === c.property_id)?.address || "Unknown Property"}
                                        </TableCell>
                                        <TableCell className="text-right" data-testid={`text-amount-${c.id}`}>
                                          ${c.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                              variant={c.status === 'approved' ? 'default' : c.status === 'rejected' ? 'destructive' : 'secondary'} 
                                              className="capitalize"
                                              data-testid={`badge-commitment-status-${c.id}`}
                                            >
                                                {c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {c.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline" 
                                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                      data-testid={`button-approve-${c.id}`}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline" 
                                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                      data-testid={`button-reject-${c.id}`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                 <TabsContent value="bpo" className="space-y-4">
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardHeader>
                            <CardTitle>AI BPO Extraction</CardTitle>
                            <CardDescription>Upload a PDF or Image of a BPO to automatically extract data.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                             <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                             </div>
                             <p className="text-sm font-medium mb-4">Drag and drop file here or click to browse</p>
                             <Button variant="secondary" data-testid="button-upload-bpo">Select File</Button>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
      </div>
    </Layout>
  );
}
