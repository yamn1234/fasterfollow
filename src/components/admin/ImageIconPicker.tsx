import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Link as LinkIcon, Smile, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COMMON_EMOJIS = [
  '📸', '🎵', '👍', '▶️', '🐦', '👻', '🧵', '📱', '💬', '❤️',
  '⭐', '🔥', '💰', '🎯', '🚀', '✅', '💎', '👥', '📊', '🎉',
  '💪', '🌟', '📈', '🎁', '🏆', '💡', '🔔', '📢', '🛒', '💳',
];

interface ImageIconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  folder?: string;
}

const ImageIconPicker = ({ 
  value, 
  onChange, 
  label = 'الصورة/الأيقونة',
  folder = 'general'
}: ImageIconPickerProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value?.startsWith('http') ? value : '');
  const [activeTab, setActiveTab] = useState<string>(
    value?.startsWith('http') ? 'url' : (value?.length <= 4 ? 'emoji' : 'url')
  );

  const isEmoji = value && !value.startsWith('http') && value.length <= 4;
  const isUrl = value && value.startsWith('http');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast({
        title: 'تم بنجاح',
        description: 'تم رفع الصورة',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ في رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    if (url.startsWith('http')) {
      onChange(url);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setUrlInput('');
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 ml-1" />
            مسح
          </Button>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border">
          {isEmoji ? (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-4xl">
              {value}
            </div>
          ) : isUrl ? (
            <img
              src={value}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : null}
          <div className="flex-1 text-sm text-muted-foreground overflow-hidden">
            {isEmoji ? 'إيموجي' : (
              <span className="truncate block" dir="ltr">{value}</span>
            )}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emoji" className="gap-1">
            <Smile className="h-4 w-4" />
            إيموجي
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1">
            <LinkIcon className="h-4 w-4" />
            رابط
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1">
            <Upload className="h-4 w-4" />
            رفع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emoji" className="mt-3">
          <div className="grid grid-cols-10 gap-2">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                type="button"
                variant={value === emoji ? 'default' : 'outline'}
                size="icon"
                className="h-10 w-10 text-xl"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Input
              placeholder="أو أدخل إيموجي مخصص..."
              value={isEmoji ? value : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 4) {
                  onChange(val);
                }
              }}
              className="text-center text-xl"
              maxLength={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            أدخل رابط صورة خارجية (يجب أن يبدأ بـ http أو https)
          </p>
        </TabsContent>

        <TabsContent value="upload" className="mt-3">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  اختر صورة للرفع (PNG, JPG - حد أقصى 2MB)
                </p>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>اختر صورة</span>
                  </Button>
                </label>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageIconPicker;