import { useState } from "react";
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
import { Plus, Pencil, Trash2, Upload, FileText, Image, Save, X, RefreshCw, Building2, DollarSign, TrendingUp } from "lucide-react";
import type { Property, InsertProperty, UpdateProperty } from "@shared/schema";

export default function Admin() {
  const { data: properties, isLoading, refetch } = useProperties();
  const { createProperty, updateProperty, deleteProperty } = useAdminProperties();
  const { uploadPhoto, uploadPhotos, uploadDocument } = useUpload();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const stats = {
    total: properties?.length || 0,
    needsFunding: properties?.filter(p => p.status === 'needs_funding').length || 0,
    committed: properties?.filter(p => p.status === 'committed').length || 0,
    funded: properties?.filter(p => p.status === 'funded').length || 0,
    totalEquity: properties?.reduce((sum, p) => sum + p.estimatedEquity, 0) || 0,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage properties and investments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <PropertyForm
                  onSubmit={async (data) => {
                    await createProperty.mutateAsync(data as InsertProperty);
                    setIsCreateDialogOpen(false);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Properties</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Needs Funding</p>
                  <p className="text-2xl font-bold">{stats.needsFunding}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Funded</p>
                  <p className="text-2xl font-bold">{stats.funded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Equity</p>
                  <p className="text-2xl font-bold">${(stats.totalEquity / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
            <TabsTrigger value="bulk" data-testid="tab-bulk">Bulk Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Equity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Closing</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {properties?.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50" data-testid={`row-property-${property.id}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {property.mainPhotoUrl ? (
                              <img 
                                src={property.mainPhotoUrl} 
                                alt={property.address}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900" data-testid={`text-address-${property.id}`}>{property.address}</div>
                              <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={
                            property.status === 'needs_funding' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                            property.status === 'committed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                            'bg-green-100 text-green-800 hover:bg-green-100'
                          } data-testid={`badge-status-${property.id}`}>
                            {property.status === 'needs_funding' ? 'Needs Funding' :
                             property.status === 'committed' ? 'Committed' : 'Funded'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-medium" data-testid={`text-price-${property.id}`}>${property.purchasePrice.toLocaleString()}</td>
                        <td className="px-4 py-4 text-green-600 font-medium" data-testid={`text-equity-${property.id}`}>${property.estimatedEquity.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{property.closingDate}</td>
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this property?")) {
                                  deleteProperty.mutate(property.id);
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
                {(!properties || properties.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    No properties yet. Click "Add Property" to create one.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bulk">
            <BulkEditor properties={properties || []} />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            {editingProperty && (
              <PropertyForm
                property={editingProperty}
                onSubmit={async (data) => {
                  await updateProperty.mutateAsync({ id: editingProperty.id, data });
                  setIsEditDialogOpen(false);
                  setEditingProperty(null);
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

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: InsertProperty | UpdateProperty) => Promise<void>;
  isLoading: boolean;
  uploadPhoto: any;
  uploadPhotos: any;
  uploadDocument: any;
}

function PropertyForm({ property, onSubmit, isLoading, uploadPhoto, uploadPhotos, uploadDocument }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip: property?.zip || "",
    status: property?.status || "needs_funding",
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
    description: property?.description || "",
  });

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
      const result = await uploadPhotos.mutateAsync(files);
      setFormData(prev => ({ 
        ...prev, 
        galleryPhotoUrls: [...prev.galleryPhotoUrls, ...result.urls.map((u: any) => u.url)]
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Location</h3>
          <div>
            <Label>Address *</Label>
            <Input 
              value={formData.address} 
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              data-testid="input-address"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>City *</Label>
              <Input 
                value={formData.city} 
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                data-testid="input-city"
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input 
                value={formData.state} 
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
                data-testid="input-state"
              />
            </div>
            <div>
              <Label>ZIP *</Label>
              <Input 
                value={formData.zip} 
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                required
                data-testid="input-zip"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Purchase Price *</Label>
              <Input 
                type="number"
                value={formData.purchasePrice} 
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-purchase-price"
              />
            </div>
            <div>
              <Label>Estimated Equity *</Label>
              <Input 
                type="number"
                value={formData.estimatedEquity} 
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedEquity: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-equity"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>BPO Value *</Label>
              <Input 
                type="number"
                value={formData.bpoValue} 
                onChange={(e) => setFormData(prev => ({ ...prev, bpoValue: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-bpo"
              />
            </div>
            <div>
              <Label>Rehab Budget</Label>
              <Input 
                type="number"
                value={formData.rehabBudget} 
                onChange={(e) => setFormData(prev => ({ ...prev, rehabBudget: parseInt(e.target.value) || 0 }))}
                data-testid="input-rehab"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Property Specs</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Beds *</Label>
              <Input 
                type="number"
                value={formData.beds} 
                onChange={(e) => setFormData(prev => ({ ...prev, beds: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-beds"
              />
            </div>
            <div>
              <Label>Baths *</Label>
              <Input 
                type="number"
                step="0.5"
                value={formData.baths} 
                onChange={(e) => setFormData(prev => ({ ...prev, baths: parseFloat(e.target.value) || 0 }))}
                required
                data-testid="input-baths"
              />
            </div>
            <div>
              <Label>Sq Ft *</Label>
              <Input 
                type="number"
                value={formData.squareFeet} 
                onChange={(e) => setFormData(prev => ({ ...prev, squareFeet: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-sqft"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Status & Dates</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs_funding">Needs Funding</SelectItem>
                  <SelectItem value="committed">Committed</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Closing Date *</Label>
              <Input 
                type="date"
                value={formData.closingDate} 
                onChange={(e) => setFormData(prev => ({ ...prev, closingDate: e.target.value }))}
                required
                data-testid="input-closing-date"
              />
            </div>
          </div>
          <div>
            <Label>Funding Progress (%)</Label>
            <Input 
              type="number"
              min="0"
              max="100"
              value={formData.fundingProgress} 
              onChange={(e) => setFormData(prev => ({ ...prev, fundingProgress: parseInt(e.target.value) || 0 }))}
              data-testid="input-funding-progress"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Description</h3>
        <Textarea 
          value={formData.description || ""} 
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Property description..."
          data-testid="input-description"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Photos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Main Photo</Label>
            <div className="mt-2 space-y-2">
              {formData.mainPhotoUrl && (
                <img src={formData.mainPhotoUrl} alt="Main" className="w-full h-32 object-cover rounded-lg" />
              )}
              <Input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoUpload}
                data-testid="input-main-photo"
              />
            </div>
          </div>
          <div>
            <Label>Gallery Photos</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2 flex-wrap">
                {formData.galleryPhotoUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`Gallery ${idx}`} className="w-16 h-16 object-cover rounded" />
                    <button 
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        galleryPhotoUrls: prev.galleryPhotoUrls.filter((_, i) => i !== idx)
                      }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                data-testid="input-gallery-photos"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Documents</h3>
        <div className="space-y-2">
          {(formData.documents as any[]).map((doc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="flex-1 text-sm">{doc.name}</span>
              <button 
                type="button"
                className="text-red-500"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  documents: (prev.documents as any[]).filter((_, i) => i !== idx)
                }))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Input 
            type="file" 
            accept=".pdf"
            onChange={handleDocumentUpload}
            data-testid="input-document"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} data-testid="button-submit">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
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

function BulkEditor({ properties }: { properties: Property[] }) {
  const { bulkUpdate } = useBulkEditor();
  const [editedRows, setEditedRows] = useState<Map<string, Partial<Property>>>(new Map());
  const [filter, setFilter] = useState({ status: "", state: "" });

  const filteredProperties = properties.filter(p => {
    if (filter.status && p.status !== filter.status) return false;
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
      await bulkUpdate.mutateAsync(updates);
      setEditedRows(new Map());
    }
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
              <SelectItem value="needs_funding">Needs Funding</SelectItem>
              <SelectItem value="committed">Committed</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
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
        <Button 
          onClick={handleSaveAll} 
          disabled={editedRows.size === 0 || bulkUpdate.isPending}
          data-testid="button-save-bulk"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes ({editedRows.size})
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Address</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">City</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">State</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Price</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Equity</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">BPO</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProperties.map((property) => {
              const edited = editedRows.get(property.id) || {};
              return (
                <tr key={property.id} className={editedRows.has(property.id) ? "bg-amber-50" : "hover:bg-gray-50"}>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.address ?? property.address) as string}
                      onChange={(e) => handleCellChange(property.id, "address", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.city ?? property.city) as string}
                      onChange={(e) => handleCellChange(property.id, "city", e.target.value)}
                      className="h-8 text-sm w-24"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      value={(edited.state ?? property.state) as string}
                      onChange={(e) => handleCellChange(property.id, "state", e.target.value)}
                      className="h-8 text-sm w-16"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Select 
                      value={(edited.status ?? property.status) as string}
                      onValueChange={(v) => handleCellChange(property.id, "status", v)}
                    >
                      <SelectTrigger className="h-8 text-sm w-32">
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
                      className="h-8 text-sm w-28"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="number"
                      value={(edited.estimatedEquity ?? property.estimatedEquity) as number}
                      onChange={(e) => handleCellChange(property.id, "estimatedEquity", parseInt(e.target.value))}
                      className="h-8 text-sm w-28"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="number"
                      value={(edited.bpoValue ?? property.bpoValue) as number}
                      onChange={(e) => handleCellChange(property.id, "bpoValue", parseInt(e.target.value))}
                      className="h-8 text-sm w-28"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input 
                      type="date"
                      value={(edited.closingDate ?? property.closingDate) as string}
                      onChange={(e) => handleCellChange(property.id, "closingDate", e.target.value)}
                      className="h-8 text-sm w-36"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProperties.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No properties found matching the filters.
          </div>
        )}
      </div>
    </div>
  );
}
