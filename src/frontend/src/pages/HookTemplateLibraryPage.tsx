import { useState, useEffect } from 'react';
import { Copy, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetHookTemplates, useSaveHookTemplates } from '@/hooks/useHookTemplateLibrary';
import { useAuthorizedActor } from '@/hooks/useAuthorizedActor';
import { toast } from 'sonner';
import type { HookTemplate } from '@/backend';

export default function HookTemplateLibraryPage() {
  const { isInitializing } = useAuthorizedActor();
  
  const { data: templates, isLoading, isError, error, refetch } = useGetHookTemplates();
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

    try {
      await navigator.clipboard.writeText(template.content);
      toast.success(`Hook ${index + 1} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
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

  // Show loading state while auth is initializing
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hook Template Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Save and manage your hook templates for quick access
          </p>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
          disabled={saveMutation.isPending}
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

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load templates: {error?.message || 'Unknown error'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hook Templates */}
      {isLoading ? (
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
                    placeholder="e.g., Problem-Solution Hook"
                    value={template.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`content-${index}`}>Hook Content</Label>
                  <Textarea
                    id={`content-${index}`}
                    placeholder="Write your hook template here..."
                    value={template.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    rows={6}
                    className="resize-none"
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
