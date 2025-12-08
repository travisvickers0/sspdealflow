import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, Upload, FileText, Image, Save, X, RefreshCw, Building2, DollarSign, TrendingUp, FileUp, Download, Check, AlertCircle, Star, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property, InsertProperty, UpdateProperty } from "@shared/schema";
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
  status: "needs_funding",
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

  const stats = {
    total: properties?.length || 0,
    needsFunding: properties?.filter(p => p.status === 'needs_funding').length || 0,
    committed: properties?.filter(p => p.status === 'committed').length || 0,
    funded: properties?.filter(p => p.status === 'funded').length || 0,
    totalEquity: properties?.reduce((sum, p) => sum + p.estimatedEquity, 0) || 0,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage properties and investments</p>
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
                    await createProperty.mutateAsync(data as InsertProperty);
                    setIsCreateDialogOpen(false);
                    toast({
                      title: "Property Created",
                      description: "The property has been added successfully.",
                    });
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
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg w-fit">
                  <Building2 className="h-4 sm:h-6 w-4 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Total Properties</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-amber-100 rounded-lg w-fit">
                  <DollarSign className="h-4 sm:h-6 w-4 sm:w-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Needs Funding</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.needsFunding}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg w-fit">
                  <TrendingUp className="h-4 sm:h-6 w-4 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Funded</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.funded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg w-fit">
                  <DollarSign className="h-4 sm:h-6 w-4 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Total Equity</p>
                  <p className="text-xl sm:text-2xl font-bold">${(stats.totalEquity / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
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
                <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
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
                  {properties?.map((property) => (
                    <Card key={property.id} data-testid={`row-property-${property.id}`} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-3 mb-3">
                          {property.mainPhotoUrl ? (
                            <img 
                              src={property.mainPhotoUrl} 
                              alt={property.address}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate" data-testid={`text-address-${property.id}`}>{property.address}</div>
                            <div className="text-xs text-gray-500 truncate">{property.city}, {property.state}</div>
                            <Badge className={`mt-1 ${
                              property.status === 'needs_funding' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                              property.status === 'committed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                              'bg-green-100 text-green-800 hover:bg-green-100'
                            }`} data-testid={`badge-status-${property.id}`}>
                              {property.status === 'needs_funding' ? 'Needs Funding' :
                               property.status === 'committed' ? 'Committed' : 'Funded'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div>
                            <p className="text-gray-500">Purchase Price</p>
                            <p className="font-semibold text-gray-900" data-testid={`text-price-${property.id}`}>${(property.purchasePrice / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Equity</p>
                            <p className="font-semibold text-green-600" data-testid={`text-equity-${property.id}`}>${(property.estimatedEquity / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        
                        <div className="mb-3 pb-3 border-t">
                          <p className="text-xs text-gray-500 mt-2 mb-1">Closing: <span className="text-gray-900 font-medium">{property.closingDate}</span></p>
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  <div className="text-center py-12 text-gray-500">
                    No properties yet. Click "Add Property" to create one.
                  </div>
                )}
              </>
            )}
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
              properties={properties || []} 
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
                  await updateProperty.mutateAsync({ id: editingProperty.id, data });
                  setIsEditDialogOpen(false);
                  setEditingProperty(null);
                  toast({
                    title: "Property Updated",
                    description: "The property has been updated successfully.",
                  });
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

interface SortablePhotoProps {
  id: string;
  url: string;
  onSetHero: () => void;
  onRemove: () => void;
}

function SortablePhoto({ id, url, onSetHero, onRemove }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <img 
        src={url} 
        alt="Gallery photo" 
        className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:border-amber-400 transition-all"
      />
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 p-1.5 bg-white/90 rounded cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 pointer-events-none">
        <button
          type="button"
          className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 pointer-events-auto"
          onClick={onSetHero}
          title="Set as hero"
        >
          <Star className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 pointer-events-auto"
          onClick={onRemove}
          title="Remove photo"
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
}

function PhotoManager({ mainPhotoUrl, galleryPhotoUrls, onUpdate, onUpload }: PhotoManagerProps) {
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

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Photos</h3>
      <p className="text-sm text-gray-500">Drag photos to reorder. Click the star to set as hero image.</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mainPhotoUrl && (
            <div className="relative group">
              <div className="absolute top-1 left-1 z-10 bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <Star className="h-3 w-3" /> Hero
              </div>
              <img 
                src={mainPhotoUrl} 
                alt="Main" 
                className="w-full aspect-square object-cover rounded-lg border-2 border-amber-500 shadow-md"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  onClick={() => removePhoto(mainPhotoUrl, true)}
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
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
          </DndContext>
        </div>
        
        <div className="flex items-center gap-4">
          <Label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            <span>Add Photos</span>
            <Input 
              type="file" 
              accept="image/*"
              multiple
              className="hidden"
              onChange={onUpload}
              data-testid="input-gallery-photos"
            />
          </Label>
          <span className="text-sm text-gray-500">
            {(mainPhotoUrl ? 1 : 0) + galleryPhotoUrls.length} photo(s) uploaded
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
    comps: property?.comps || [],
    description: property?.description || "",
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
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Location</h3>
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
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Pricing</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">Purchase Price *</Label>
              <Input 
                type="number"
                value={formData.purchasePrice} 
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-purchase-price"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Estimated Equity *</Label>
              <Input 
                type="number"
                value={formData.estimatedEquity} 
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedEquity: parseInt(e.target.value) || 0 }))}
                required
                data-testid="input-equity"
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">BPO Value *</Label>
              <Input 
                type="number"
                value={formData.bpoValue} 
                onChange={(e) => setFormData(prev => ({ ...prev, bpoValue: parseInt(e.target.value) || 0 }))}
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
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Property Specs</h3>
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
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Status & Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-status" className="text-sm">
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

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Description</h3>
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
      />

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Documents</h3>
        <div className="space-y-2">
          {(formData.documents as any[]).map((doc, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                Upload BPO Document (Auto-extract Comps)
              </Label>
              <Input 
                type="file" 
                accept=".pdf"
                onChange={handleBPOUpload}
                data-testid="input-bpo"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a BPO PDF to automatically extract comparable sales data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparable Sales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Comparable Sales</h3>
          <Button type="button" variant="outline" size="sm" onClick={addComp} className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Add Comp</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        <div className="space-y-3">
          {(formData.comps as any[]).map((comp, idx) => (
            <div key={comp.id || idx} className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Comp #{idx + 1}</span>
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
            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No comparable sales added yet.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isLoading} data-testid="button-submit" className="w-full sm:w-auto text-sm">
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
              case 'status': row.status = value || 'needs_funding'; break;
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
    const example = "123 Main St,Atlanta,GA,30301,needs_funding,250000,50000,3,2,1500,2025-03-15,300000,25000";
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
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8"></th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Address *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">City *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">State *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">ZIP *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Price *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Equity *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Beds *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Baths *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">SqFt *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">BPO *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Closing *</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={row.isValid ? "bg-green-50/50" : "hover:bg-gray-50"}>
                    <td className="px-2 py-1.5 text-center">
                      {row.isValid ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400 text-xs">{idx + 1}</span>
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
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
              <span className="text-sm text-gray-500">
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
    "status": "needs_funding",
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800">
            You have {editedRows.size} unsaved {editedRows.size === 1 ? 'change' : 'changes'}. Click "Save Changes" to apply them.
          </span>
        </div>
      )}

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
              const hasEdits = editedRows.has(property.id);
              return (
                <tr key={property.id} className={hasEdits ? "bg-amber-50" : "hover:bg-gray-50"}>
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
          <div className="text-center py-12 text-gray-500">
            {properties.length === 0 
              ? "No properties yet. Use 'Bulk Add' to add properties."
              : "No properties found matching the filters."}
          </div>
        )}
      </div>
    </div>
  );
}
