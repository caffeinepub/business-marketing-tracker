import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Upload, Camera, Image as ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  selectedFile: File | null;
  previewUrl: string | null;
  existingImageUrl: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export default function ImageUploadField({
  selectedFile,
  previewUrl,
  existingImageUrl,
  onFileSelect,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClear = () => {
    onFileSelect(null);
    // Reset both file inputs to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleLibraryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const displayUrl = previewUrl || existingImageUrl;
  const hasImage = selectedFile || existingImageUrl;

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Image Upload</Label>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {/* Hidden file input for library selection */}
          <Input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          
          {/* Hidden file input for camera capture */}
          <Input
            ref={cameraInputRef}
            id="image-camera"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          
          {/* Library upload button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleLibraryClick}
            disabled={disabled}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {selectedFile ? 'Replace' : existingImageUrl ? 'Replace' : 'Choose Image'}
          </Button>

          {/* Camera capture button (mobile) */}
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraClick}
            disabled={disabled}
            title="Take photo"
          >
            <Camera className="h-4 w-4" />
          </Button>

          {/* Clear button */}
          {hasImage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {selectedFile && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {!selectedFile && existingImageUrl && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image attached</span>
          </div>
        )}

        {displayUrl && (
          <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-border">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-auto object-contain max-h-48"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Optional: Upload or capture an image related to your post (max 10MB)
      </p>
    </div>
  );
}
