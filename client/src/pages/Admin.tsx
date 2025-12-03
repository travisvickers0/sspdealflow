import { Layout } from "@/components/Layout";
import { properties as initialProperties, commitments as initialCommitments, Property, Commitment } from "@/lib/mockData";
import { PropertyDialog } from "@/components/PropertyDialog";
import { CommitmentDialog } from "@/components/CommitmentDialog";
import { CompDialog, Comp } from "@/components/CompDialog";
import { DocumentDialog, Document } from "@/components/DocumentDialog";
import { JVDialog, JV } from "@/components/JVDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, FileText, Check, X, Search, Edit, Trash2, Download, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ExtendedDoc extends Document {
  propertyAddress?: string;
}

export default function Admin() {
  const [properties, setProperties] = useState(initialProperties);
  const [commitments, setCommitments] = useState(initialCommitments);
  const [comps, setComps] = useState<Comp[]>([]);
  const [documents, setDocuments] = useState<ExtendedDoc[]>([]);
  const [jvProposals, setJVProposals] = useState<JV[]>([]);

  // Dialog states
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  
  const [commitmentDialogOpen, setCommitmentDialogOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | undefined>();

  const [compDialogOpen, setCompDialogOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<Comp | undefined>();
  const [selectedPropertyForComp, setSelectedPropertyForComp] = useState<string>("");

  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedPropertyForDoc, setSelectedPropertyForDoc] = useState<string>("");

  const [jvDialogOpen, setJVDialogOpen] = useState(false);
  const [selectedJV, setSelectedJV] = useState<JV | undefined>();
  const [selectedPropertyForJV, setSelectedPropertyForJV] = useState<string>("");

  // Property handlers
  const handleOpenPropertyDialog = (property?: Property) => {
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };

  const handleSubmitProperty = (data: Partial<Property>) => {
    if (selectedProperty) {
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
    setPropertyDialogOpen(false);
    setSelectedProperty(undefined);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
    toast({
      title: "Property Deleted",
      description: "Property has been removed.",
    });
  };

  // Commitment handlers
  const handleOpenCommitmentDialog = (commitment: Commitment) => {
    setSelectedCommitment(commitment);
    setCommitmentDialogOpen(true);
  };

  const handleApproveCommitment = (notes: string) => {
    if (selectedCommitment) {
      setCommitments(commitments.map(c =>
        c.id === selectedCommitment.id
          ? { ...c, status: "approved" }
          : c
      ));
      toast({
        title: "Commitment Approved",
        description: `Investment commitment of $${selectedCommitment.amount.toLocaleString()} has been approved.`,
      });
    }
  };

  const handleRejectCommitment = (notes: string) => {
    if (selectedCommitment) {
      setCommitments(commitments.map(c =>
        c.id === selectedCommitment.id
          ? { ...c, status: "rejected" }
          : c
      ));
      toast({
        title: "Commitment Rejected",
        description: "Investment commitment has been rejected.",
      });
    }
  };

  // Comp handlers
  const handleOpenCompDialog = (propertyId: string, comp?: Comp) => {
    setSelectedPropertyForComp(propertyId);
    setSelectedComp(comp);
    setCompDialogOpen(true);
  };

  const handleSubmitComp = (data: Comp) => {
    if (selectedComp) {
      setComps(comps.map(c => c.id === selectedComp.id ? data : c));
      toast({
        title: "Comparable Updated",
        description: "Comparable sale has been updated.",
      });
    } else {
      setComps([...comps, { ...data, id: String(comps.length + 1) }]);
      toast({
        title: "Comparable Added",
        description: "Comparable sale has been added successfully.",
      });
    }
    setCompDialogOpen(false);
    setSelectedComp(undefined);
  };

  const handleDeleteComp = (id: string) => {
    setComps(comps.filter(c => c.id !== id));
    toast({
      title: "Comparable Deleted",
      description: "Comparable sale has been removed.",
    });
  };

  // Document handlers
  const handleOpenDocumentDialog = (propertyId: string) => {
    setSelectedPropertyForDoc(propertyId);
    setDocumentDialogOpen(true);
  };

  const handleSubmitDocument = (data: Partial<Document>) => {
    const newDoc: ExtendedDoc = {
      id: String(documents.length + 1),
      property_id: selectedPropertyForDoc,
      propertyAddress: properties.find(p => p.id === selectedPropertyForDoc)?.address,
      type: data.type || "other",
      filename: data.filename || "",
      filepath: data.filepath || "",
      uploaded_at: data.uploaded_at || new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
    toast({
      title: "Document Uploaded",
      description: `${data.filename} has been uploaded successfully.`,
    });
    setDocumentDialogOpen(false);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast({
      title: "Document Deleted",
      description: "Document has been removed.",
    });
  };

  // JV handlers
  const handleOpenJVDialog = (propertyId: string, jv?: JV) => {
    setSelectedPropertyForJV(propertyId);
    setSelectedJV(jv);
    setJVDialogOpen(true);
  };

  const handleSubmitJV = (data: Partial<JV>) => {
    if (selectedJV) {
      setJVProposals(jvProposals.map(j => j.id === selectedJV.id ? { ...j, ...data } : j));
      toast({
        title: "JV Proposal Updated",
        description: "Joint venture proposal has been updated.",
      });
    } else {
      const newJV: JV = {
        id: String(jvProposals.length + 1),
        property_id: selectedPropertyForJV,
        investor_split: data.investor_split || 50,
        ssp_split: data.ssp_split || 50,
        projected_profit: data.projected_profit || 0,
        notes: data.notes || "",
      };
      setJVProposals([...jvProposals, newJV]);
      toast({
        title: "JV Proposal Created",
        description: "Joint venture proposal has been created successfully.",
      });
    }
    setJVDialogOpen(false);
    setSelectedJV(undefined);
  };

  const handleDeleteJV = (id: string) => {
    setJVProposals(jvProposals.filter(j => j.id !== id));
    toast({
      title: "JV Proposal Deleted",
      description: "Joint venture proposal has been removed.",
    });
  };

  const propertyComps = (propertyId: string) => comps.filter(c => c.id.startsWith(`${propertyId}-`) || comps.find(cc => cc.id === propertyId) !== undefined);
  const propertyDocs = (propertyId: string) => documents.filter(d => d.property_id === propertyId);
  const propertyJVs = (propertyId: string) => jvProposals.filter(j => j.property_id === propertyId);

  return (
    <Layout>
      <PropertyDialog 
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        property={selectedProperty}
        onSubmit={handleSubmitProperty}
      />
      <CommitmentDialog
        open={commitmentDialogOpen}
        onOpenChange={setCommitmentDialogOpen}
        commitment={selectedCommitment}
        onApprove={handleApproveCommitment}
        onReject={handleRejectCommitment}
      />
      <CompDialog
        open={compDialogOpen}
        onOpenChange={setCompDialogOpen}
        comp={selectedComp}
        onSubmit={handleSubmitComp}
      />
      <DocumentDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        propertyId={selectedPropertyForDoc}
        onSubmit={handleSubmitDocument}
      />
      <JVDialog
        open={jvDialogOpen}
        onOpenChange={setJVDialogOpen}
        jv={selectedJV}
        onSubmit={handleSubmitJV}
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
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-comps">Comps</Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-jv">JV Proposals</Button>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground px-2 mb-2">AI Tools</h3>
                <Button variant="ghost" className="w-full justify-start" data-testid="nav-bpo">BPO Extraction</Button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 bg-background">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage properties, commitments, and deal data.</p>
                </div>
                <Button className="gap-2" onClick={() => handleOpenPropertyDialog()} data-testid="button-new-property">
                    <Plus className="h-4 w-4" /> New Property
                </Button>
            </div>

            <Tabs defaultValue="properties" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="commitments">Commitments</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="comps">Comps</TabsTrigger>
                    <TabsTrigger value="jv">JV Proposals</TabsTrigger>
                    <TabsTrigger value="bpo">AI BPO Tools</TabsTrigger>
                </TabsList>

                {/* PROPERTIES TAB */}
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
                                    <TableHead className="text-right">Equity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.map((p) => (
                                    <TableRow key={p.id} data-testid={`row-property-${p.id}`}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span data-testid={`text-address-${p.id}`}>{p.address}</span>
                                                <span className="text-xs text-muted-foreground">{p.city}, {p.state}</span>
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
                                                  onClick={() => handleOpenPropertyDialog(p)}
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

                {/* COMMITMENTS TAB */}
                <TabsContent value="commitments" className="space-y-4">
                    <Card>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Investor</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
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
                                            {properties.find(p => p.id === c.property_id)?.address || "Unknown"}
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
                                                <Button 
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleOpenCommitmentDialog(c)}
                                                  data-testid={`button-review-${c.id}`}
                                                >
                                                  Review
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            {properties.length > 0 && (
                                <Button 
                                  className="gap-2"
                                  onClick={() => handleOpenDocumentDialog(properties[0].id)}
                                  data-testid="button-upload-doc"
                                >
                                  <Plus className="h-4 w-4" /> Upload Document
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No documents uploaded yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.map((d) => (
                                        <TableRow key={d.id} data-testid={`row-document-${d.id}`}>
                                            <TableCell className="font-medium flex items-center gap-2" data-testid={`text-filename-${d.id}`}>
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {d.filename}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize" data-testid={`badge-doc-type-${d.id}`}>
                                                    {d.type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell data-testid={`text-doc-property-${d.id}`}>{d.propertyAddress}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(d.uploaded_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-download-${d.id}`}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-8 w-8 text-destructive"
                                                      onClick={() => handleDeleteDocument(d.id)}
                                                      data-testid={`button-delete-doc-${d.id}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* COMPS TAB */}
                <TabsContent value="comps" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            {properties.length > 0 && (
                                <Button 
                                  className="gap-2"
                                  onClick={() => handleOpenCompDialog(properties[0].id)}
                                  data-testid="button-add-comp"
                                >
                                  <Plus className="h-4 w-4" /> Add Comparable
                                </Button>
                            )}
                        </div>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Address</TableHead>
                                    <TableHead className="text-right">Sale Price</TableHead>
                                    <TableHead className="text-right">Sq Ft</TableHead>
                                    <TableHead className="text-right">Price/Sq Ft</TableHead>
                                    <TableHead className="text-right">Distance</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comps.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No comparables added yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    comps.map((c) => (
                                        <TableRow key={c.id} data-testid={`row-comp-${c.id}`}>
                                            <TableCell className="font-medium" data-testid={`text-comp-address-${c.id}`}>{c.address}</TableCell>
                                            <TableCell className="text-right" data-testid={`text-comp-price-${c.id}`}>${c.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right" data-testid={`text-comp-sqft-${c.id}`}>{c.sq_ft.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium" data-testid={`text-price-per-sqft-${c.id}`}>${(c.price / c.sq_ft).toFixed(2)}</TableCell>
                                            <TableCell className="text-right" data-testid={`text-comp-distance-${c.id}`}>{c.distance} mi</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-8 w-8"
                                                      onClick={() => handleOpenCompDialog(selectedPropertyForComp || properties[0].id, c)}
                                                      data-testid={`button-edit-comp-${c.id}`}
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-8 w-8 text-destructive"
                                                      onClick={() => handleDeleteComp(c.id)}
                                                      data-testid={`button-delete-comp-${c.id}`}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* JV PROPOSALS TAB */}
                <TabsContent value="jv" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            {properties.length > 0 && (
                                <Button 
                                  className="gap-2"
                                  onClick={() => handleOpenJVDialog(properties[0].id)}
                                  data-testid="button-create-jv"
                                >
                                  <Plus className="h-4 w-4" /> Create JV Proposal
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jvProposals.length === 0 ? (
                            <Card className="col-span-full">
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    No JV proposals created yet
                                </CardContent>
                            </Card>
                        ) : (
                            jvProposals.map((jv) => (
                                <Card key={jv.id} data-testid={`card-jv-${jv.id}`}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">
                                            {properties.find(p => p.id === jv.property_id)?.address || "Property"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <div className="text-xs text-blue-600 font-medium">Investor</div>
                                                <div className="font-bold text-blue-900" data-testid={`text-jv-investor-${jv.id}`}>{jv.investor_split}%</div>
                                                <div className="text-xs text-blue-700 mt-1" data-testid={`text-jv-investor-profit-${jv.id}`}>
                                                    ${Math.round((jv.investor_split / 100) * jv.projected_profit).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-orange-50 rounded-lg">
                                                <div className="text-xs text-orange-600 font-medium">SSP</div>
                                                <div className="font-bold text-orange-900" data-testid={`text-jv-ssp-${jv.id}`}>{jv.ssp_split}%</div>
                                                <div className="text-xs text-orange-700 mt-1" data-testid={`text-jv-ssp-profit-${jv.id}`}>
                                                    ${Math.round((jv.ssp_split / 100) * jv.projected_profit).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {jv.notes && (
                                            <div className="text-xs text-muted-foreground border-t pt-3">
                                                {jv.notes}
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="flex-1"
                                              onClick={() => handleOpenJVDialog(jv.property_id, jv)}
                                              data-testid={`button-edit-jv-${jv.id}`}
                                            >
                                              <Edit className="h-3 w-3 mr-1" /> Edit
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="text-destructive hover:text-destructive/80"
                                              onClick={() => handleDeleteJV(jv.id)}
                                              data-testid={`button-delete-jv-${jv.id}`}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* BPO EXTRACTION TAB */}
                <TabsContent value="bpo" className="space-y-4">
                    <Card className="border-dashed border-2 bg-muted/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                AI BPO Extraction
                            </CardTitle>
                            <CardDescription>Upload a PDF or image of a BPO report to automatically extract property data.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                             <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                             </div>
                             <p className="text-sm font-medium mb-2">Drag and drop BPO file here or click to browse</p>
                             <p className="text-xs text-muted-foreground mb-4">Extracts: Purchase Price, ARV, Rehab Estimate, Comps</p>
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
