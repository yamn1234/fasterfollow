import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Download,
  Upload,
  Eye,
  Pencil,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Settings2,
  ArchiveRestore,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  price: number;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  is_archived: boolean;
  category_id: string | null;
  provider_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  is_indexable: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  is_active: boolean;
}

const AdminServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    price: '',
    min_quantity: '1',
    max_quantity: '10000',
    category_id: '',
    provider_id: '',
    is_active: true,
    // SEO
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    is_indexable: true,
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    is_active: true,
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFormData, setImportFormData] = useState({
    provider_id: '',
    category_id: '',
    price_multiplier: '1.0',
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchProviders();
  }, [showArchived]);

  const fetchServices = async () => {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('api_providers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleImportServices = async () => {
    if (!importFormData.provider_id) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار مزود',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('smm-import-services', {
        body: {
          providerId: importFormData.provider_id,
          categoryId: importFormData.category_id || null,
          priceMultiplier: parseFloat(importFormData.price_multiplier) || 1.0,
        },
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        toast({
          title: 'تم بنجاح',
          description: result.message,
        });
        setImportDialogOpen(false);
        fetchServices();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ في استيراد الخدمات',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSaveService = async () => {
    try {
      const serviceData = {
        name: formData.name,
        name_ar: formData.name_ar || null,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        min_quantity: parseInt(formData.min_quantity) || 1,
        max_quantity: parseInt(formData.max_quantity) || 10000,
        category_id: formData.category_id || null,
        provider_id: formData.provider_id || null,
        is_active: formData.is_active,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
        canonical_url: formData.canonical_url || null,
        og_title: formData.og_title || null,
        og_description: formData.og_description || null,
        is_indexable: formData.is_indexable,
      };

      if (selectedService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', selectedService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);
        if (error) throw error;
      }

      toast({
        title: 'تم بنجاح',
        description: selectedService ? 'تم تحديث الخدمة' : 'تم إضافة الخدمة',
      });

      setServiceDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveService = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          is_archived: !service.is_archived,
          archived_at: service.is_archived ? null : new Date().toISOString(),
        })
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: service.is_archived ? 'تم استعادة الخدمة' : 'تم أرشفة الخدمة',
      });

      fetchServices();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData = {
        name: categoryFormData.name,
        name_ar: categoryFormData.name_ar || null,
        slug: categoryFormData.slug || generateSlug(categoryFormData.name),
        is_active: categoryFormData.is_active,
      };

      const { error } = await supabase
        .from('service_categories')
        .insert(categoryData);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الفئة',
      });

      setCategoryDialogOpen(false);
      setCategoryFormData({ name: '', name_ar: '', slug: '', is_active: true });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      slug: '',
      description: '',
      description_ar: '',
      price: '',
      min_quantity: '1',
      max_quantity: '10000',
      category_id: '',
      provider_id: '',
      is_active: true,
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      is_indexable: true,
    });
    setSelectedService(null);
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      name_ar: service.name_ar || '',
      slug: service.slug,
      description: service.description || '',
      description_ar: '',
      price: service.price.toString(),
      min_quantity: service.min_quantity.toString(),
      max_quantity: service.max_quantity.toString(),
      category_id: service.category_id || '',
      provider_id: service.provider_id || '',
      is_active: service.is_active,
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || '',
      seo_keywords: service.seo_keywords || '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      is_indexable: service.is_indexable,
    });
    setServiceDialogOpen(true);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
          <p className="text-muted-foreground">
            {showArchived ? 'الخدمات المؤرشفة' : 'إدارة وتعديل الخدمات'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 ml-2" />
            {showArchived ? 'عرض النشطة' : 'عرض المؤرشفة'}
          </Button>
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <FolderPlus className="w-4 h-4 ml-2" />
            فئة جديدة
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 ml-2" />
            استيراد من مزود
          </Button>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => {
              resetForm();
              setServiceDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" />
            خدمة جديدة
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الرابط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الخدمة</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحد الأدنى / الأقصى</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      لا توجد خدمات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">/{service.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {categories.find(c => c.id === service.category_id)?.name || '-'}
                      </TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {service.min_quantity.toLocaleString()} / {service.max_quantity.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={service.is_indexable ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                            {service.is_indexable ? 'Index' : 'NoIndex'}
                          </Badge>
                          {service.seo_title && (
                            <Badge variant="outline" className="text-xs">SEO</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={async (checked) => {
                            await supabase
                              .from('services')
                              .update({ is_active: checked })
                              .eq('id', service.id);
                            fetchServices();
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(service)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings2 className="w-4 h-4 ml-2" />
                              إعدادات SEO
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchiveService(service)}>
                              {service.is_archived ? (
                                <>
                                  <ArchiveRestore className="w-4 h-4 ml-2" />
                                  استعادة
                                </>
                              ) : (
                                <>
                                  <Archive className="w-4 h-4 ml-2" />
                                  أرشفة
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الخدمة (إنجليزي)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Service Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم الخدمة (عربي)</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="اسم الخدمة"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>الرابط (Slug)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="service-name"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الخدمة..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>السعر</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأدنى</Label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى</Label>
                  <Input
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">نشط</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>عنوان SEO</Label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="عنوان الصفحة في محركات البحث"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seo_title.length}/60 حرف
                </p>
              </div>

              <div className="space-y-2">
                <Label>وصف SEO</Label>
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="وصف الصفحة في محركات البحث"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seo_description.length}/160 حرف
                </p>
              </div>

              <div className="space-y-2">
                <Label>الكلمات المفتاحية</Label>
                <Input
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  placeholder="كلمة1, كلمة2, كلمة3"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_indexable"
                  checked={formData.is_indexable}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_indexable: checked })}
                />
                <Label htmlFor="is_indexable">السماح بالفهرسة في محركات البحث</Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveService}>
              {selectedService ? 'حفظ التغييرات' : 'إضافة الخدمة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم الفئة (إنجليزي)</Label>
                <Input
                  value={categoryFormData.name}
                  onChange={(e) => {
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Category Name"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم الفئة (عربي)</Label>
                <Input
                  value={categoryFormData.name_ar}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name_ar: e.target.value })}
                  placeholder="اسم الفئة"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الرابط (Slug)</Label>
              <Input
                value={categoryFormData.slug}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                placeholder="category-name"
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveCategory}>
              إضافة الفئة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Services Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استيراد خدمات من المزود</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اختر المزود</Label>
              <Select
                value={importFormData.provider_id}
                onValueChange={(v) => setImportFormData({ ...importFormData, provider_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مزود API" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفئة الافتراضية (اختياري)</Label>
              <Select
                value={importFormData.category_id || 'none'}
                onValueChange={(v) => setImportFormData({ ...importFormData, category_id: v === 'none' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون فئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فئة</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مضاعف السعر</Label>
              <Input
                type="number"
                step="0.1"
                value={importFormData.price_multiplier}
                onChange={(e) => setImportFormData({ ...importFormData, price_multiplier: e.target.value })}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">
                مثال: 1.5 = زيادة 50% على سعر المزود
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleImportServices} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  استيراد
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;
