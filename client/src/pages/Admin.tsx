import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useProperties, useAdminProperties, useBulkEditor, useUpload } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, FileText, Image, Save, X, RefreshCw, Building2, DollarSign, TrendingUp, FileUp, Download, Check, AlertCircle, Star, GripVertical, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property, InsertProperty, UpdateProperty, PropertyStatus, Lead, PropertyInterest } from "@shared/schema";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NewPropertyRow {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  purchasePrice: number;
  estimatedEquity: number;
  beds: number;
  baths: number;
  squareFeet: number;
  closingDate: string;
  bpoValue: number;
  rehabBudget: number;
  isValid: boolean;
}

const createEmptyRow = (): NewPropertyRow => ({
  id: crypto.randomUUID(),
  address: "",
  city: "",
  state: "",
  zip: "",
  status: "AVAILABLE",
  purchasePrice: 0,
  estimatedEquity: 0,
  beds: 0,
  baths: 0,
  squareFeet: 0,
  closingDate: "",
  bpoValue: 0,
  rehabBudget: 0,
  isValid: false,
});

const validateRow = (row: NewPropertyRow): boolean => {
  return !!(
    row.address.trim() &&
    row.city.trim() &&
    row.state.trim() &&
    row.zip.trim() &&
    row.purchasePrice > 0 &&
    row.estimatedEquity > 0 &&
    row.bpoValue > 0 &&
    row.beds > 0 &&
    row.baths > 0 &&
    row.squareFeet > 0 &&
    row.closingDate
  );
};

export default function Admin() {
  const { data: properties, isLoading, refetch } = useProperties();
  const { createProperty, updateProperty, deleteProperty } = useAdminProperties();
  const { uploadPhoto, uploadPhotos, uploadDocument } = useUpload();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Sort properties to match marketplace: status priority, then by newest
  const sortedProperties = useMemo(() => {
    if (!properties) return [];
    
    return [...properties].sort((a, b) => {
      // Normalize status for comparison (backwards compatible)
      const normalizeStatus = (status: string) => {
        if (status === "needs_funding" || status === "committed") return "AVAILABLE";
        if (status === "funded" || status === "archived") return "FUNDED";
        return status;
      };
      
      // Status priority: AVAILABLE > FUNDED > SOLD
      const statusOrder = { AVAILABLE: 0, FUNDED: 1, SOLD: 2 };
      const statusA = normalizeStatus(a.status);
      const statusB = normalizeStatus(b.status);
      const statusDiff = (statusOrder[statusA as keyof typeof statusOrder] ?? 99) - (statusOrder[statusB as keyof typeof statusOrder] ?? 99);
      
      if (statusDiff !== 0) return statusDiff;
      
      // Secondary sort by newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [properties]);

  const stats = {
    total: properties?.length || 0,
    needsFunding: properties?.filter(p => {
      const s = p.status;
      return s === 'needs_funding' || s === 'committed' || s === 'AVAILABLE';
    }).length || 0,
    funded: properties?.filter(p => {
      const s = p.status;
      return s === 'funded' || s === 'archived' || s === 'FUNDED';
    }).length || 0,
    sold: properties?.filter(p => p.status === 'SOLD').length || 0,
    totalEquity: properties?.reduce((sum, p) => sum + p.estimatedEquity, 0) || 0,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-[var(--text-tertiary)] mt-1">Manage properties and investments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-property" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <PropertyForm
                  onSubmit={async (data) => {
                    try {
                      await createProperty.mutateAsync(data as InsertProperty);
                      setIsCreateDialogOpen(false);
                      toast({
                        title: "Property Created",
                        description: "The property has been added successfully.",
                      });
                    } catch (error) {
                      console.error("Error creating property:", error);
                      toast({
                        title: "Error Creating Property",
                        description: error instanceof Error ? error.message : "Failed to create property. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  isLoading={createProperty.isPending}
                  uploadPhoto={uploadPhoto}
                  uploadPhotos={uploadPhotos}
                  uploadDocument={uploadDocument}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-[rgba(59,130,246,0.12)] rounded-lg w-fit">
                  <Building2 className="h-4 sm:h-6 w-4 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">Total Properties</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-[rgba(245,158,11,0.12)] rounded-lg w-fit">
                  <DollarSign className="h-4 sm:h-6 w-4 sm:w-6 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">Needs Funding</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.needsFunding}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-[rgba(34,197,94,0.12)] rounded-lg w-fit">
                  <TrendingUp className="h-4 sm:h-6 w-4 sm:w-6 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">Funded</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stats.funded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-[rgba(168,85,247,0.12)] rounded-lg w-fit">
                  <DollarSign className="h-4 sm:h-6 w-4 sm:w-6 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">Total Equity</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">${(stats.totalEquity / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">
              <Users className="h-4 w-4 mr-1.5 inline-block align-middle" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="interests" data-testid="tab-interests">
              <Heart className="h-4 w-4 mr-1.5 inline-block align-middle" />
              Interests
            </TabsTrigger>
            <TabsTrigger value="bulk-add" data-testid="tab-bulk-add">Bulk Add</TabsTrigger>
            <TabsTrigger value="bulk-edit" data-testid="tab-bulk-edit">Bulk Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-[var(--surface-hex)] rounded-xl border border-[var(--line)] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--surface-2-hex)] border-b border-[var(--line)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Equity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Closing</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {sortedProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-[var(--surface-2-hex)]" data-testid={`row-property-${property.id}`}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Link href={`/property/${property.slug}`}>
                                {property.mainPhotoUrl ? (
                                  <img 
                                    src={property.mainPhotoUrl} 
                                    alt={property.address}
                                    className="w-12 h-12 rounded-lg object-cover hover:ring-2 hover:ring-primary cursor-pointer transition-all"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-[var(--surface-3-hex)] flex items-center justify-center hover:ring-2 hover:ring-primary cursor-pointer transition-all">
                                    <Building2 className="h-6 w-6 text-[var(--text-tertiary)]" />
                                  </div>
                                )}
                              </Link>
                              <div>
                                <div className="font-medium text-[var(--text-primary)]" data-testid={`text-address-${property.id}`}>{property.address}</div>
                                <div className="text-sm text-[var(--text-tertiary)]">{property.city}, {property.state}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {(() => {
                              const normalizeStatus = (status: string) => {
                                if (status === "needs_funding" || status === "committed") return "AVAILABLE";
                                if (status === "funded" || status === "archived") return "FUNDED";
                                return status;
                              };
                              const s = normalizeStatus(property.status);
                              return (
                                <Badge className={
                                  s === 'AVAILABLE' ? 'bg-[rgba(245,158,11,0.15)] text-amber-400 hover:bg-[rgba(245,158,11,0.15)]' :
                                  s === 'FUNDED' ? 'bg-[rgba(59,130,246,0.15)] text-blue-400 hover:bg-[rgba(59,130,246,0.15)]' :
                                  'bg-[rgba(245,158,11,0.25)] text-amber-300 hover:bg-[rgba(245,158,11,0.25)]'
                                } data-testid={`badge-status-${property.id}`}>
                                  {s === 'AVAILABLE' ? 'Needs Funding' :
                                   s === 'FUNDED' ? 'Funded' : 'SOLD'}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-4 font-medium text-[var(--text-primary)]" data-testid={`text-price-${property.id}`}>${property.purchasePrice.toLocaleString()}</td>
                          <td className="px-4 py-4 text-[var(--green-hex)] font-medium" data-testid={`text-equity-${property.id}`}>${property.estimatedEquity.toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-[var(--text-tertiary)]">{property.closingDate}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingProperty(property);
                                  setIsEditDialogOpen(true);
                                }}
                                data-testid={`button-edit-${property.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)]"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this property?")) {
                                    deleteProperty.mutate(property.id);
                                    toast({
                                      title: "Property Deleted",
                                      description: "The property has been removed.",
                                    });
                                  }
                                }}
                                data-testid={`button-delete-${property.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {sortedProperties.map((property) => (
                    <Card key={property.id} data-testid={`row-property-${property.id}`} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-3 mb-3">
                          <Link href={`/property/${property.slug}`}>
                            {property.mainPhotoUrl ? (
                              <img 
                                src={property.mainPhotoUrl} 
                                alt={property.address}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hover:ring-2 hover:ring-primary cursor-pointer transition-all"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-[var(--surface-3-hex)] flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-primary cursor-pointer transition-all">
                                <Building2 className="h-8 w-8 text-[var(--text-tertiary)]" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[var(--text-primary)] text-sm truncate" data-testid={`text-address-${property.id}`}>{property.address}</div>
                            <div className="text-xs text-[var(--text-tertiary)] truncate">{property.city}, {property.state}</div>
                            {(() => {
                              const normalizeStatus = (status: string) => {
                                if (status === "needs_funding" || status === "committed") return "AVAILABLE";
                                if (status === "funded" || status === "archived") return "FUNDED";
                                return status;
                              };
                              const s = normalizeStatus(property.status);
                              return (
                                <Badge className={`mt-1 ${
                                  s === 'AVAILABLE' ? 'bg-[rgba(245,158,11,0.15)] text-amber-400 hover:bg-[rgba(245,158,11,0.15)]' :
                                  s === 'FUNDED' ? 'bg-[rgba(59,130,246,0.15)] text-blue-400 hover:bg-[rgba(59,130,246,0.15)]' :
                                  'bg-[rgba(245,158,11,0.25)] text-amber-300 hover:bg-[rgba(245,158,11,0.25)]'
                                }`} data-testid={`badge-status-${property.id}`}>
                                  {s === 'AVAILABLE' ? 'Needs Funding' :
                                   s === 'FUNDED' ? 'Funded' : 'SOLD'}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div>
                            <p className="text-[var(--text-tertiary)]">Purchase Price</p>
                            <p className="font-semibold text-[var(--text-primary)]" data-testid={`text-price-${property.id}`}>${(property.purchasePrice / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-tertiary)]">Equity</p>
                            <p className="font-semibold text-[var(--green-hex)]" data-testid={`text-equity-${property.id}`}>${(property.estimatedEquity / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        
                        <div className="mb-3 pb-3 border-t border-[var(--line)]">
                          <p className="text-xs text-[var(--text-tertiary)] mt-2 mb-1">Closing: <span className="text-[var(--text-primary)] font-medium">{property.closingDate}</span></p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setEditingProperty(property);
                              setIsEditDialogOpen(true);
                            }}
                            data-testid={`button-edit-${property.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)]"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this property?")) {
                                deleteProperty.mutate(property.id);
                                toast({
                                  title: "Property Deleted",
                                  description: "The property has been removed.",
                                });
                              }
                            }}
                            data-testid={`button-delete-${property.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {(!properties || properties.length === 0) && (
                  <div className="text-center py-12 text-[var(--text-tertiary)]">
                    No properties yet. Click "Add Property" to create one.
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="leads">
            <AdminLeadsPanel />
          </TabsContent>

          <TabsContent value="interests">
            <AdminPropertyInterestsPanel />
          </TabsContent>

          <TabsContent value="bulk-add">
            <BulkAddEditor onSuccess={() => {
              refetch();
              toast({
                title: "Properties Added",
                description: "All properties have been created successfully.",
              });
            }} />
          </TabsContent>

          <TabsContent value="bulk-edit">
            <BulkEditor 
              properties={sortedProperties} 
              onSuccess={() => {
                refetch();
                toast({
                  title: "Changes Saved",
                  description: "All property updates have been saved.",
                });
              }} 
            />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            {editingProperty && (
              <PropertyForm
                property={editingProperty}
                onSubmit={async (data) => {
                  try {
                    await updateProperty.mutateAsync({ id: editingProperty.id, data });
                    setIsEditDialogOpen(false);
                    setEditingProperty(null);
                    toast({
                      title: "Property Updated",
                      description: "The property has been updated successfully.",
                    });
                  } catch (error) {
                    console.error("Error updating property:", error);
                    toast({
                      title: "Error Updating Property",
                      description: error instanceof Error ? error.message : "Failed to update property. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                isLoading={updateProperty.isPending}
                uploadPhoto={uploadPhoto}
                uploadPhotos={uploadPhotos}
                uploadDocument={uploadDocument}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

function AdminLeadsPanel() {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
  });

  const list = leads ?? [];

  const { last7, last30 } = useMemo(() => {
    const now = Date.now();
    const cutoff7 = now - 7 * 86400000;
    const cutoff30 = now - 30 * 86400000;
    let n7 = 0;
    let n30 = 0;
    for (const l of list) {
      const t = l.createdAt ? new Date(l.createdAt).getTime() : 0;
      if (t >= cutoff7) n7++;
      if (t >= cutoff30) n30++;
    }
    return { last7: n7, last30: n30 };
  }, [list]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total leads", value: String(list.length) },
          { label: "Last 7 days", value: String(last7) },
          { label: "Last 30 days", value: String(last30) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-hex)] px-4 py-3 text-[var(--text-primary)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 rounded-xl border border-[var(--line)] bg-[var(--surface-hex)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-hex)] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[var(--surface-2-hex)] border-b border-[var(--line)]">
              <tr>
                {["Date", "Name", "Email", "Phone", "Source", "Accredited"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[var(--text-tertiary)]">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                list.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--surface-2-hex)]/80 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                      {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy h:mm a") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--text-primary)]">{lead.fullName}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">{lead.phone || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)]">{lead.primaryInterest}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          lead.isAccredited === "true"
                            ? "bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/15"
                            : "bg-[var(--surface-2-hex)] text-[var(--text-tertiary)] border-[var(--line)] hover:bg-[var(--surface-2-hex)]"
                        }
                      >
                        {lead.isAccredited === "true" ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminPropertyInterestsPanel() {
  const { data: interests, isLoading } = useQuery<PropertyInterest[]>({
    queryKey: ["/api/admin/property-interests"],
  });

  const list = interests ?? [];

  const { last7, last30 } = useMemo(() => {
    const now = Date.now();
    const cutoff7 = now - 7 * 86400000;
    const cutoff30 = now - 30 * 86400000;
    let n7 = 0;
    let n30 = 0;
    for (const row of list) {
      const t = row.createdAt ? new Date(row.createdAt).getTime() : 0;
      if (t >= cutoff7) n7++;
      if (t >= cutoff30) n30++;
    }
    return { last7: n7, last30: n30 };
  }, [list]);

  const truncateMessage = (msg: string | null, max = 72) => {
    if (!msg) return "—";
    const s = msg.trim();
    if (s.length <= max) return s;
    return `${s.slice(0, max)}…`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total", value: String(list.length) },
          { label: "Last 7 days", value: String(last7) },
          { label: "Last 30 days", value: String(last30) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-hex)] px-4 py-3 text-[var(--text-primary)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 rounded-xl border border-[var(--line)] bg-[var(--surface-hex)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-hex)] overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[var(--surface-2-hex)] border-b border-[var(--line)]">
              <tr>
                {["Date", "Property", "Name", "Email", "Phone", "Message"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-[var(--text-tertiary)]">
                    No property interests yet.
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--surface-2-hex)]/80 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                      {row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy h:mm a") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--text-primary)] max-w-[220px]">
                      <span className="line-clamp-2">{row.propertyAddress}</span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--text-primary)]">{row.fullName}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                        {row.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                      {row.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] max-w-[280px]">
                      <span title={row.message ?? undefined}>{truncateMessage(row.message)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface HeroPhotoProps {
  url: string;
  onRemove: () => void;
}

function HeroPhoto({ url, onRemove }: HeroPhotoProps) {
  const [showDelete, setShowDelete] = useState(false);
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="absolute top-1 left-1 z-10 bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
        <Star className="h-3 w-3" /> Hero
      </div>
      <img 
        src={url} 
        alt="Main" 
        className="w-full aspect-square object-cover rounded-lg border-2 border-amber-500 shadow-md cursor-pointer"
        onClick={() => setShowDelete(!showDelete)}
      />
      <div className={`absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center transition-opacity ${showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          type="button"
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setShowDelete(false);
          }}
          title="Remove photo"
          data-testid={`button-delete-hero-${url.split('/').pop()}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface SortablePhotoProps {
  id: string;
  url: string;
  onSetHero: () => void;
  onRemove: () => void;
}

function SortablePhoto({ id, url, onSetHero, onRemove }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [showActions, setShowActions] = useState(false);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <img 
        src={url} 
        alt="Gallery photo" 
        className="w-full aspect-square object-cover rounded-lg border border-[var(--line)] hover:border-amber-400 transition-all cursor-pointer"
        onClick={() => setShowActions(!showActions)}
      />
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 p-1.5 bg-white/90 rounded cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-[var(--text-tertiary)]" />
      </div>
      <div className={`absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-2 transition-opacity ${showActions || !isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          type="button"
          className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onSetHero();
            setShowActions(false);
          }}
          title="Set as hero"
          data-testid={`button-set-hero-${url.split('/').pop()}`}
        >
          <Star className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setShowActions(false);
          }}
          title="Remove photo"
          data-testid={`button-delete-photo-${url.split('/').pop()}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface PhotoManagerProps {
  mainPhotoUrl: string;
  galleryPhotoUrls: string[];
  onUpdate: (main: string, gallery: string[]) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

function PhotoManager({ mainPhotoUrl, galleryPhotoUrls, onUpdate, onUpload, isUploading }: PhotoManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = galleryPhotoUrls.indexOf(active.id as string);
      const newIndex = galleryPhotoUrls.indexOf(over.id as string);
      const newGallery = arrayMove(galleryPhotoUrls, oldIndex, newIndex);
      onUpdate(mainPhotoUrl, newGallery);
    }
  };

  const setAsHero = (url: string) => {
    const oldMain = mainPhotoUrl;
    const newGallery = galleryPhotoUrls.filter(u => u !== url);
    if (oldMain) {
      newGallery.unshift(oldMain);
    }
    onUpdate(url, newGallery);
  };

  const removePhoto = (url: string, isMain: boolean) => {
    if (isMain) {
      onUpdate("", galleryPhotoUrls);
    } else {
      onUpdate(mainPhotoUrl, galleryPhotoUrls.filter(u => u !== url));
    }
  };

  const removeAllPhotos = () => {
    onUpdate("", []);
  };

  const totalPhotos = (mainPhotoUrl ? 1 : 0) + galleryPhotoUrls.length;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--text-primary)]">Photos</h3>
      <p className="text-sm text-[var(--text-tertiary)]">Drag photos to reorder. Click the star to set as hero image.</p>
      
      <div className="space-y-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mainPhotoUrl && (
              <HeroPhoto 
                url={mainPhotoUrl} 
                onRemove={() => removePhoto(mainPhotoUrl, true)}
              />
            )}
            
            <SortableContext items={galleryPhotoUrls} strategy={rectSortingStrategy}>
              {galleryPhotoUrls.map((url) => (
                <SortablePhoto
                  key={url}
                  id={url}
                  url={url}
                  onSetHero={() => setAsHero(url)}
                  onRemove={() => removePhoto(url, false)}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors text-sm sm:text-base ${
            isUploading 
              ? 'bg-[rgba(59,130,246,0.15)] text-blue-400 cursor-wait' 
              : 'bg-[var(--surface-3-hex)] hover:bg-[var(--surface-3-hex)] cursor-pointer active:bg-[var(--line)]'
          }`}>
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" />
                <span className="font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Add Photos</span>
              </>
            )}
            <Input 
              type="file" 
              accept="image/*"
              multiple
              className="hidden"
              onChange={onUpload}
              disabled={isUploading}
              data-testid="input-gallery-photos"
            />
          </Label>
          {totalPhotos > 0 && (
            <button
              type="button"
              onClick={removeAllPhotos}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors active:bg-red-300 text-sm sm:text-base"
              data-testid="button-delete-all-photos"
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Delete All Photos</span>
            </button>
          )}
          <span className="text-xs sm:text-sm text-[var(--text-tertiary)]">
            {totalPhotos} photo(s)
          </span>
        </div>
      </div>
    </div>
  );
}

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: InsertProperty | UpdateProperty) => Promise<void>;
  isLoading: boolean;
  uploadPhoto: any;
  uploadPhotos: any;
  uploadDocument: any;
}

function PropertyForm({ property, onSubmit, isLoading, uploadPhoto, uploadPhotos, uploadDocument }: PropertyFormProps) {
  const { toast } = useToast();
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isProcessingBPO, setIsProcessingBPO] = useState(false);
  const [formData, setFormData] = useState({
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip: property?.zip || "",
    status: (property?.status || "needs_funding") as PropertyStatus,
    purchasePrice: property?.purchasePrice || 0,
    estimatedEquity: property?.estimatedEquity || 0,
    beds: property?.beds || 0,
    baths: property?.baths || 0,
    squareFeet: property?.squareFeet || 0,
    closingDate: property?.closingDate || "",
    bpoValue: property?.bpoValue || 0,
    rehabBudget: property?.rehabBudget || 0,
    fundingProgress: property?.fundingProgress || 0,
    mainPhotoUrl: property?.mainPhotoUrl || "",
    galleryPhotoUrls: property?.galleryPhotoUrls || [],
    documents: property?.documents || [],
    comps: property?.comps || [],
    description: property?.description || "",
    // SOLD-only fields
    exitDate: property?.exitDate || "",
    finalSalePrice: property?.finalSalePrice || undefined,
    holdPeriodMonths: property?.holdPeriodMonths || undefined,
    totalProjectProfit: property?.totalProjectProfit || undefined,
    investorProfit: property?.investorProfit || undefined,
    sponsorProfit: property?.sponsorProfit || undefined,
    realizedROI: property?.realizedROI || undefined,
  });

  const addComp = () => {
    setFormData(prev => ({
      ...prev,
      comps: [...(prev.comps as any[]), {
        id: crypto.randomUUID(),
        address: "",
        price: 0,
        beds: 0,
        baths: 0,
        sqft: 0,
        soldDate: "",
        distance: "",
      }]
    }));
  };

  const updateComp = (idx: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      comps: (prev.comps as any[]).map((comp, i) => 
        i === idx ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const removeComp = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      comps: (prev.comps as any[]).filter((_, i) => i !== idx)
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadPhoto.mutateAsync(file);
      setFormData(prev => ({ ...prev, mainPhotoUrl: result.url }));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploadingPhotos(true);
      try {
        const result = await uploadPhotos.mutateAsync(files);
        setFormData(prev => ({ 
          ...prev, 
          galleryPhotoUrls: [...prev.galleryPhotoUrls, ...result.urls.map((u: any) => u.url)]
        }));
        toast({
          title: "Photos Uploaded",
          description: `Successfully uploaded ${files.length} photo(s)`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Some photos may not have uploaded. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploadingPhotos(false);
        // Reset the file input so the same files can be selected again
        e.target.value = '';
      }
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadDocument.mutateAsync(file);
      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents as any[]), { name: result.originalName, url: result.url }]
      }));
    }
  };

  const handleBPOUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingBPO(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading BPO file:", file.name, file.type, file.size);

      const response = await fetch("/api/admin/process-bpo", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to process BPO";
        
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } else {
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Add the BPO as a document and update form with extracted data
      setFormData(prev => {
        const updates: any = {
          ...prev,
          documents: [...(prev.documents as any[]), { 
            name: result.originalName || file.name, 
            url: result.url 
          }],
          // Add extracted comps to the comps array
          comps: [...(prev.comps as any[]), ...(result.comps || [])]
        };
        
        // Auto-populate BPO Value from As-Is Price if extracted
        if (result.subject?.asIsValue && result.subject.asIsValue > 0) {
          updates.bpoValue = result.subject.asIsValue;
        }
        
        return updates;
      });

      // Build success message
      let successMessage = `Extracted ${result.comps?.length || 0} comparable sales.`;
      if (result.subject?.asIsValue) {
        successMessage += ` As-Is Price: $${result.subject.asIsValue.toLocaleString()} (auto-filled in BPO Value).`;
      }
      successMessage += ` Click Save to persist changes.`;

      toast({
        title: "BPO Processed Successfully",
        description: successMessage,
      });
    } catch (error) {
      console.error("Error processing BPO:", error);
      let errorMessage = "Unknown error";
      
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error: Could not reach server. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Processing BPO",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingBPO(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Location</h3>
          <div>
            <Label className="text-xs sm:text-sm">Address *</Label>
            <Input 
              value={formData.address} 
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              data-testid="input-address"
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">City *</Label>
              <Input 
                value={formData.city} 
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                data-testid="input-city"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">State *</Label>
              <Input 
                value={formData.state} 
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
                data-testid="input-state"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">ZIP *</Label>
              <Input 
                value={formData.zip} 
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                required
                data-testid="input-zip"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Pricing</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">Purchase Price *</Label>
              <Input 
                type="number"
                value={formData.purchasePrice} 
                onChange={(e) => {
                  const purchasePrice = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ ...prev, purchasePrice, estimatedEquity: Math.max(0, prev.bpoValue - purchasePrice) }));
                }}
                required
                data-testid="input-purchase-price"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Estimated Equity</Label>
              <Input 
                type="number"
                value={formData.estimatedEquity} 
                readOnly
                tabIndex={-1}
                data-testid="input-equity"
                className="text-sm bg-[var(--surface-2-hex)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">BPO Value *</Label>
              <Input 
                type="number"
                value={formData.bpoValue} 
                onChange={(e) => {
                  const bpoValue = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ ...prev, bpoValue, estimatedEquity: Math.max(0, bpoValue - prev.purchasePrice) }));
                }}
                required
                data-testid="input-bpo"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Rehab Budget</Label>
              <Input 
                type="number"
                value={formData.rehabBudget} 
                onChange={(e) => setFormData(prev => ({ ...prev, rehabBudget: parseInt(e.target.value) || 0 }))}
                data-testid="input-rehab"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Property Specs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">Beds *</Label>
              <Input 
                type="number"
                value={formData.beds} 
                onChange={(e) => setFormData(prev => ({ ...prev, beds: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-beds"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Baths *</Label>
              <Input 
                type="number"
                step="0.5"
                value={formData.baths} 
                onChange={(e) => setFormData(prev => ({ ...prev, baths: parseFloat(e.target.value) || 0 }))}
                required
                data-testid="input-baths"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Sq Ft *</Label>
              <Input 
                type="number"
                value={formData.squareFeet} 
                onChange={(e) => setFormData(prev => ({ ...prev, squareFeet: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-sqft"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Status & Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PropertyStatus }))}
              >
                <SelectTrigger data-testid="select-status" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs_funding">Needs Funding</SelectItem>
                  <SelectItem value="committed">Funding Committed</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Closing Date *</Label>
              <Input 
                type="date"
                value={formData.closingDate} 
                onChange={(e) => setFormData(prev => ({ ...prev, closingDate: e.target.value }))}
                required
                data-testid="input-closing-date"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SOLD Fields - Only show when status is SOLD */}
      {formData.status === "SOLD" && (
        <div className="space-y-4 sm:space-y-6 border-t pt-6">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base mb-4">Sold Deal Information</h3>
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mb-4">Fill in the final numbers from the completed deal.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Exit Date</Label>
                <Input 
                  type="date"
                  value={formData.exitDate} 
                  onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                  data-testid="input-exit-date"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Hold Period (Months)</Label>
                <Input 
                  type="number"
                  value={formData.holdPeriodMonths || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, holdPeriodMonths: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="e.g., 12"
                  data-testid="input-hold-period"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Final Sale Price</Label>
                <Input 
                  type="number"
                  value={formData.finalSalePrice || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, finalSalePrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  data-testid="input-final-sale-price"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Total Project Profit</Label>
                <Input 
                  type="number"
                  value={formData.totalProjectProfit || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, totalProjectProfit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  data-testid="input-total-profit"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Investor Profit (50%)</Label>
                <Input 
                  type="number"
                  value={formData.investorProfit || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, investorProfit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  data-testid="input-investor-profit"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Sponsor Profit (50%)</Label>
                <Input 
                  type="number"
                  value={formData.sponsorProfit || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsorProfit: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="0"
                  data-testid="input-sponsor-profit"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Realized ROI (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={formData.realizedROI || ""} 
                  onChange={(e) => setFormData(prev => ({ ...prev, realizedROI: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  placeholder="0.0"
                  data-testid="input-realized-roi"
                  className="text-sm"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Enter as percentage (e.g., 25.5 for 25.5%)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Description</h3>
        <Textarea 
          value={formData.description || ""} 
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          placeholder="Property description..."
          data-testid="input-description"
          className="text-sm"
        />
      </div>

      <PhotoManager 
        mainPhotoUrl={formData.mainPhotoUrl}
        galleryPhotoUrls={formData.galleryPhotoUrls}
        onUpdate={(main, gallery) => setFormData(prev => ({ ...prev, mainPhotoUrl: main, galleryPhotoUrls: gallery }))}
        onUpload={handleGalleryUpload}
        isUploading={isUploadingPhotos}
      />

      <div className="space-y-4">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Documents</h3>
        <div className="space-y-2">
          {(formData.documents as any[]).map((doc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-[var(--surface-2-hex)] rounded text-sm">
              <FileText className="h-4 w-4 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="flex-1 text-xs sm:text-sm truncate">{doc.name}</span>
              <button 
                type="button"
                className="text-red-500 flex-shrink-0"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  documents: (prev.documents as any[]).filter((_, i) => i !== idx)
                }))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <Input 
              type="file" 
              accept=".pdf"
              onChange={handleDocumentUpload}
              data-testid="input-document"
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-[var(--line)]"></div>
              <span className="text-xs text-[var(--text-tertiary)]">OR</span>
              <div className="flex-1 border-t border-[var(--line)]"></div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                Upload BPO Document (Auto-extract Comps)
              </Label>
              <Input 
                type="file" 
                accept=".pdf"
                onChange={handleBPOUpload}
                disabled={isProcessingBPO}
                data-testid="input-bpo"
                className="text-sm"
              />
              {isProcessingBPO ? (
                <div className="flex items-center gap-2 text-xs text-amber-700 mt-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Extracting comps from BPO... This may take up to a minute.
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Upload a BPO PDF to automatically extract comparable sales data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Sales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">Comparable Sales</h3>
          <Button type="button" variant="outline" size="sm" onClick={addComp} className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Comp</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        <div className="space-y-3">
          {(formData.comps as any[]).map((comp, idx) => (
            <div key={comp.id || idx} className="p-3 border rounded-lg bg-[var(--surface-2-hex)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Comp #{idx + 1}</span>
                <button 
                  type="button"
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                  onClick={() => removeComp(idx)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input 
                    value={comp.address || ""}
                    onChange={(e) => updateComp(idx, "address", e.target.value)}
                    placeholder="123 Main St"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sale Price</Label>
                  <Input 
                    type="number"
                    value={comp.price || ""}
                    onChange={(e) => updateComp(idx, "price", parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sold Date</Label>
                  <Input 
                    type="date"
                    value={comp.soldDate || ""}
                    onChange={(e) => updateComp(idx, "soldDate", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Beds</Label>
                  <Input 
                    type="number"
                    value={comp.beds || ""}
                    onChange={(e) => updateComp(idx, "beds", parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Baths</Label>
                  <Input 
                    type="number"
                    step="0.5"
                    value={comp.baths || ""}
                    onChange={(e) => updateComp(idx, "baths", parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sqft</Label>
                  <Input 
                    type="number"
                    value={comp.sqft || ""}
                    onChange={(e) => updateComp(idx, "sqft", parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Distance</Label>
                  <Input 
                    value={comp.distance || ""}
                    onChange={(e) => updateComp(idx, "distance", e.target.value)}
                    placeholder="0.3 mi"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          {(formData.comps as any[]).length === 0 && (
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)] text-center py-4">No comparable sales added yet.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
        {isProcessingBPO && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-[rgba(245,158,11,0.1)] px-3 py-2 rounded-lg mr-auto">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Processing BPO... Please wait before saving.
          </div>
        )}
        <Button type="submit" disabled={isLoading || isProcessingBPO} data-testid="button-submit" className="w-full sm:w-auto text-sm">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isProcessingBPO ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing BPO...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {property ? "Update Property" : "Create Property"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function BulkAddEditor({ onSuccess }: { onSuccess: () => void }) {
  const { bulkImport } = useBulkEditor();
  const [rows, setRows] = useState<NewPropertyRow[]>([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
  const [jsonInput, setJsonInput] = useState("");
  const [importMode, setImportMode] = useState<"table" | "json">("table");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateRow = (id: string, field: keyof NewPropertyRow, value: any) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };
      updated.isValid = validateRow(updated);
      return updated;
    }));
  };

  const addRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const validRows = rows.filter(r => r.isValid);

  const handleTableSubmit = async () => {
    if (validRows.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const properties = validRows.map(row => ({
        address: row.address,
        city: row.city,
        state: row.state,
        zip: row.zip,
        status: row.status,
        purchasePrice: row.purchasePrice,
        estimatedEquity: row.estimatedEquity,
        beds: row.beds,
        baths: row.baths,
        squareFeet: row.squareFeet,
        closingDate: row.closingDate,
        bpoValue: row.bpoValue,
        rehabBudget: row.rehabBudget,
        fundingProgress: 0,
        mainPhotoUrl: "",
        galleryPhotoUrls: [],
        documents: [],
        description: "",
      }));
      
      await bulkImport.mutateAsync(properties as InsertProperty[]);
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
      onSuccess();
    } catch (error: any) {
      console.error("Bulk import error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const properties = Array.isArray(parsed) ? parsed : [parsed];
      
      setIsSubmitting(true);
      await bulkImport.mutateAsync(properties);
      setJsonInput("");
      onSuccess();
    } catch (error: any) {
      console.error("JSON import error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      if (file.name.endsWith('.json')) {
        setJsonInput(text);
        setImportMode("json");
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newRows: NewPropertyRow[] = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = createEmptyRow();
          
          headers.forEach((header, idx) => {
            const value = values[idx] || "";
            switch (header) {
              case 'address': row.address = value; break;
              case 'city': row.city = value; break;
              case 'state': row.state = value; break;
              case 'zip': row.zip = value; break;
              case 'status': row.status = value || 'AVAILABLE'; break;
              case 'purchaseprice': case 'purchase_price': row.purchasePrice = parseInt(value) || 0; break;
              case 'estimatedequity': case 'estimated_equity': case 'equity': row.estimatedEquity = parseInt(value) || 0; break;
              case 'beds': case 'bedrooms': row.beds = parseInt(value) || 0; break;
              case 'baths': case 'bathrooms': row.baths = parseFloat(value) || 0; break;
              case 'squarefeet': case 'sqft': case 'square_feet': row.squareFeet = parseInt(value) || 0; break;
              case 'closingdate': case 'closing_date': row.closingDate = value; break;
              case 'bpovalue': case 'bpo_value': case 'bpo': row.bpoValue = parseInt(value) || 0; break;
              case 'rehabbudget': case 'rehab_budget': case 'rehab': row.rehabBudget = parseInt(value) || 0; break;
            }
          });
          
          row.isValid = validateRow(row);
          return row;
        });
        
        setRows(newRows);
        setImportMode("table");
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = "address,city,state,zip,status,purchasePrice,estimatedEquity,beds,baths,squareFeet,closingDate,bpoValue,rehabBudget";
    const example = "123 Main St,Atlanta,GA,30301,AVAILABLE,250000,50000,3,2,1500,2025-03-15,300000,25000";
    const csv = `${headers}\n${example}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button
            variant={importMode === "table" ? "default" : "outline"}
            onClick={() => setImportMode("table")}
            size="sm"
          >
            Spreadsheet
          </Button>
          <Button
            variant={importMode === "json" ? "default" : "outline"}
            onClick={() => setImportMode("json")}
            size="sm"
          >
            JSON Import
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <FileUp className="h-4 w-4 mr-2" />
            Import File
          </Button>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {importMode === "table" ? (
        <>
          <div className="bg-[var(--surface-hex)] rounded-xl border border-[var(--line)] overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[var(--surface-2-hex)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] w-8"></th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Address *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">City *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">State *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">ZIP *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Status</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Price *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Equity *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Beds *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Baths *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">SqFt *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">BPO *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Closing *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={row.isValid ? "bg-[rgba(34,197,94,0.08)]" : "hover:bg-[var(--surface-2-hex)]"}>
                    <td className="px-2 py-1.5 text-center">
                      {row.isValid ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-[var(--text-tertiary)] text-xs">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        value={row.address}
                        onChange={(e) => updateRow(row.id, "address", e.target.value)}
                        className="h-7 text-xs"
                        placeholder="123 Main St"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        value={row.city}
                        onChange={(e) => updateRow(row.id, "city", e.target.value)}
                        className="h-7 text-xs w-20"
                        placeholder="Atlanta"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        value={row.state}
                        onChange={(e) => updateRow(row.id, "state", e.target.value)}
                        className="h-7 text-xs w-12"
                        placeholder="GA"
                        maxLength={2}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        value={row.zip}
                        onChange={(e) => updateRow(row.id, "zip", e.target.value)}
                        className="h-7 text-xs w-16"
                        placeholder="30301"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Select value={row.status} onValueChange={(v) => updateRow(row.id, "status", v)}>
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="needs_funding">Needs Funding</SelectItem>
                          <SelectItem value="committed">Committed</SelectItem>
                          <SelectItem value="funded">Funded</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        value={row.purchasePrice || ""}
                        onChange={(e) => updateRow(row.id, "purchasePrice", parseInt(e.target.value) || 0)}
                        className="h-7 text-xs w-24"
                        placeholder="250000"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        value={row.estimatedEquity || ""}
                        onChange={(e) => updateRow(row.id, "estimatedEquity", parseInt(e.target.value) || 0)}
                        className="h-7 text-xs w-20"
                        placeholder="50000"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        value={row.beds || ""}
                        onChange={(e) => updateRow(row.id, "beds", parseInt(e.target.value) || 0)}
                        className="h-7 text-xs w-12"
                        placeholder="3"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        step="0.5"
                        value={row.baths || ""}
                        onChange={(e) => updateRow(row.id, "baths", parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs w-12"
                        placeholder="2"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        value={row.squareFeet || ""}
                        onChange={(e) => updateRow(row.id, "squareFeet", parseInt(e.target.value) || 0)}
                        className="h-7 text-xs w-16"
                        placeholder="1500"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="number"
                        value={row.bpoValue || ""}
                        onChange={(e) => updateRow(row.id, "bpoValue", parseInt(e.target.value) || 0)}
                        className="h-7 text-xs w-24"
                        placeholder="300000"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input 
                        type="date"
                        value={row.closingDate}
                        onChange={(e) => updateRow(row.id, "closingDate", e.target.value)}
                        className="h-7 text-xs w-32"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)]"
                        onClick={() => removeRow(row.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-tertiary)]">
                {validRows.length} of {rows.length} rows valid
              </span>
              <Button 
                onClick={handleTableSubmit}
                disabled={validRows.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {validRows.length} Properties
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <Label>JSON Data</Label>
            <Textarea 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={15}
              placeholder={`[
  {
    "address": "123 Main St",
    "city": "Atlanta",
    "state": "GA",
    "zip": "30301",
    "status": "AVAILABLE",
    "purchasePrice": 250000,
    "estimatedEquity": 50000,
    "beds": 3,
    "baths": 2,
    "squareFeet": 1500,
    "closingDate": "2025-03-15",
    "bpoValue": 300000,
    "rehabBudget": 25000
  }
]`}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleJsonSubmit}
              disabled={!jsonInput.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BulkEditor({ properties, onSuccess }: { properties: Property[], onSuccess: () => void }) {
  const { bulkUpdate } = useBulkEditor();
  const [editedRows, setEditedRows] = useState<Map<string, Partial<Property>>>(new Map());
  const [filter, setFilter] = useState({ status: "", state: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProperties = properties.filter(p => {
    if (filter.status) {
      // Normalize status for filtering (backwards compatible)
      const normalizeStatus = (status: string) => {
        if (status === "needs_funding" || status === "committed") return "AVAILABLE";
        if (status === "funded" || status === "archived") return "FUNDED";
        return status;
      };
      if (normalizeStatus(p.status) !== filter.status) return false;
    }
    if (filter.state && !p.state.toLowerCase().includes(filter.state.toLowerCase())) return false;
    return true;
  });

  const handleCellChange = (id: string, field: string, value: any) => {
    setEditedRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id) || {};
      newMap.set(id, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleSaveAll = async () => {
    const updates = Array.from(editedRows.entries()).map(([id, data]) => ({
      id,
      data: data as any,
    }));
    if (updates.length > 0) {
      setIsSubmitting(true);
      try {
        await bulkUpdate.mutateAsync(updates);
        setEditedRows(new Map());
        onSuccess();
      } catch (error) {
        console.error("Bulk update error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClearChanges = () => {
    setEditedRows(new Map());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select value={filter.status} onValueChange={(v) => setFilter(prev => ({ ...prev, status: v }))}>
            <SelectTrigger className="w-40" data-testid="filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Needs Funding</SelectItem>
              <SelectItem value="FUNDED">Funded</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Filter by state..."
            value={filter.state}
            onChange={(e) => setFilter(prev => ({ ...prev, state: e.target.value }))}
            className="w-40"
            data-testid="filter-state"
          />
        </div>
        <div className="flex gap-2">
          {editedRows.size > 0 && (
            <Button variant="outline" onClick={handleClearChanges}>
              <X className="h-4 w-4 mr-2" />
              Clear Changes
            </Button>
          )}
          <Button 
            onClick={handleSaveAll} 
            disabled={editedRows.size === 0 || isSubmitting}
            data-testid="button-save-bulk"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes ({editedRows.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {editedRows.size > 0 && (
        <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-amber-300">
            You have {editedRows.size} unsaved {editedRows.size === 1 ? 'change' : 'changes'}. Click "Save Changes" to apply them.
          </span>
        </div>
      )}

      <div className="bg-[var(--surface-hex)] rounded-xl border border-[var(--line)] overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-[var(--surface-2-hex)] border-b">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Address</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">City</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">State</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Price</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Equity</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">BPO</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProperties.map((property) => {
              const edited = editedRows.get(property.id) || {};
              const hasEdits = editedRows.has(property.id);
              return (
                <tr key={property.id} className={hasEdits ? "bg-[rgba(245,158,11,0.08)]" : "hover:bg-[var(--surface-2-hex)]"}>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.address ?? property.address) as string}
                      onChange={(e) => handleCellChange(property.id, "address", e.target.value)}
                      className={`h-8 text-sm ${hasEdits && edited.address !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.city ?? property.city) as string}
                      onChange={(e) => handleCellChange(property.id, "city", e.target.value)}
                      className={`h-8 text-sm w-24 ${hasEdits && edited.city !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.state ?? property.state) as string}
                      onChange={(e) => handleCellChange(property.id, "state", e.target.value)}
                      className={`h-8 text-sm w-16 ${hasEdits && edited.state !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select 
                      value={(edited.status ?? property.status) as string}
                      onValueChange={(v) => handleCellChange(property.id, "status", v)}
                    >
                      <SelectTrigger className={`h-8 text-sm w-32 ${hasEdits && edited.status !== undefined ? 'border-amber-400' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="needs_funding">Needs Funding</SelectItem>
                        <SelectItem value="committed">Committed</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="number"
                      value={(edited.purchasePrice ?? property.purchasePrice) as number}
                      onChange={(e) => handleCellChange(property.id, "purchasePrice", parseInt(e.target.value))}
                      className={`h-8 text-sm w-28 ${hasEdits && edited.purchasePrice !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="number"
                      value={(edited.estimatedEquity ?? property.estimatedEquity) as number}
                      onChange={(e) => handleCellChange(property.id, "estimatedEquity", parseInt(e.target.value))}
                      className={`h-8 text-sm w-28 ${hasEdits && edited.estimatedEquity !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="number"
                      value={(edited.bpoValue ?? property.bpoValue) as number}
                      onChange={(e) => handleCellChange(property.id, "bpoValue", parseInt(e.target.value))}
                      className={`h-8 text-sm w-28 ${hasEdits && edited.bpoValue !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="date"
                      value={(edited.closingDate ?? property.closingDate) as string}
                      onChange={(e) => handleCellChange(property.id, "closingDate", e.target.value)}
                      className={`h-8 text-sm w-36 ${hasEdits && edited.closingDate !== undefined ? 'border-amber-400' : ''}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            {properties.length === 0 
              ? "No properties yet. Use 'Bulk Add' to add properties."
              : "No properties found matching the filters."}
          </div>
        )}
      </div>
    </div>
  );
}
