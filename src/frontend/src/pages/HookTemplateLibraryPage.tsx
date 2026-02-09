import { useState, useEffect } from 'react';
import { Copy, Save, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetHookTemplates, useSaveHookTemplates } from '@/hooks/useHookTemplateLibrary';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { toast } from 'sonner';
import { isStoppedCanisterError } from '@/utils/canisterErrors';
import { copyToClipboard } from '@/utils/clipboard';
import type { HookTemplate } from '@/backend';

export default function HookTemplateLibraryPage() {
  // Check backend health first
  const { 
    data: healthStatus, 
    isLoading: isHealthLoading, 
    isError: isHealthError,
    error: healthError,
    refetch: refetchHealth 
  } = useBackendHealth();

  const isBackendAvailable = healthStatus === true;
  
  const { data: templates, isLoading: isTemplatesLoading, isError: isTemplatesError, error: templatesError, refetch: refetchTemplates } = useGetHookTemplates(isBackendAvailable);
  const saveMutation = useSaveHookTemplates();

  const [localTemplates, setLocalTemplates] = useState<HookTemplate[]>([
    { title: '', content: '' },
    { title: '', content: '' },
    { title: '', content: '' },
  ]);

  // Update local state when templates are loaded
  useEffect(() => {
    if (templates && templates.length === 3) {
      setLocalTemplates(templates);
    }
  }, [templates]);

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...localTemplates];
    updated[index] = { ...updated[index], title: value };
    setLocalTemplates(updated);
  };

  const handleContentChange = (index: number, value: string) => {
    const updated = [...localTemplates];
    updated[index] = { ...updated[index], content: value };
    setLocalTemplates(updated);
  };

  const handleCopy = async (index: number) => {
    const template = localTemplates[index];
    if (!template.content.trim()) {
      toast.error('Cannot copy empty hook');
      return;
    }

    const result = await copyToClipboard(template.content);
    if (result.success) {
      toast.success(`Hook ${index + 1} copied to clipboard!`);
    } else {
      toast.error(result.error || 'Failed to copy to clipboard');
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(localTemplates);
      toast.success('Hook templates saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save hook templates');
    }
  };

  const handleRetry = async () => {
    // Re-check health first
    const healthResult = await refetchHealth();
    
    // If health check succeeds, refetch templates
    if (healthResult.data === true) {
      refetchTemplates();
    }
  };

  // Detect stopped canister error
  const hasStoppedCanisterError = isHealthError && isStoppedCanisterError(healthError);
  const hasDataError = isTemplatesError && isStoppedCanisterError(templatesError);
  const showStoppedError = hasStoppedCanisterError || hasDataError;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hook Template Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Save and manage your hook templates for quick access
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending || !isBackendAvailable}
          size="default" 
          className="w-full sm:w-auto"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Templates
            </>
          )}
        </Button>
      </div>

      {/* Backend Unavailable Error */}
      {showStoppedError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Service Unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 mt-2">
            <span>
              The backend service is currently stopped or unreachable. Please start the canister or contact support if the issue persists.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="w-fit"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Other Errors */}
      {isTemplatesError && !showStoppedError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load templates: {templatesError?.message || 'Unknown error'}</span>
            <Button variant="outline" size="sm" onClick={() => refetchTemplates()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hook Templates */}
      {isHealthLoading || isTemplatesLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {localTemplates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hook {index + 1}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(index)}
                    disabled={!template.content.trim()}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </div>
                <CardDescription>
                  Create a compelling hook for your outreach posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={template.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    placeholder="e.g., Question Hook, Curiosity Hook, Value Hook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`content-${index}`}>Hook Content</Label>
                  <Textarea
                    id={`content-${index}`}
                    value={template.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    placeholder="Write your hook template here..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
