import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOutreachMutations } from '@/hooks/useOutreachMutations';
import { useOutreachQueries } from '@/hooks/useOutreachQueries';
import { ResponseStatus, ExternalBlob } from '@/backend';
import { getResponseStatusLabel, RESPONSE_STATUS_OPTIONS } from './responseStatusLabels';
import { validateUrl, validateNonNegative } from './entryFormValidation';
import { formatDateForInput, formatDateForBackend } from '@/utils/dateFormat';
import { validateImageFile, fileToUint8Array, createPreviewUrl } from '@/utils/imageFile';
import ImageUploadField from './ImageUploadField';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntryId: bigint | null;
  onClose: () => void;
}

interface FormData {
  groupName: string;
  groupUrl: string;
  datePosted: string;
  postContent: string;
  numReactions: string;
  numComments: string;
  responseStatus: ResponseStatus;
  followUpDate: string;
  groupNotes: string;
}

type ImageIntent = 'keep' | 'replace' | 'remove';

export default function EntryFormDialog({
  open,
  onOpenChange,
  editingEntryId,
  onClose,
}: EntryFormDialogProps) {
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>(ResponseStatus.NoResponse);
  const [currentGroupUrl, setCurrentGroupUrl] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageIntent, setImageIntent] = useState<ImageIntent>('keep');
  
  const { data: entries } = useOutreachQueries.useListEntries();
  const { data: groupNotes, isLoading: isLoadingNotes } = useOutreachQueries.useGroupNotes(currentGroupUrl);
  const createMutation = useOutreachMutations.useCreateEntry();
  const updateMutation = useOutreachMutations.useUpdateEntry();
  const saveNotesMutation = useOutreachMutations.useSaveGroupNotes();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const editingEntry = editingEntryId
    ? entries?.find((e) => e.id === editingEntryId)
    : null;

  const watchedGroupUrl = watch('groupUrl');

  // Update currentGroupUrl when groupUrl changes
  useEffect(() => {
    if (watchedGroupUrl && watchedGroupUrl.trim()) {
      setCurrentGroupUrl(watchedGroupUrl.trim());
    }
  }, [watchedGroupUrl]);

  // Load group notes when they're fetched
  useEffect(() => {
    if (groupNotes !== undefined && groupNotes !== null) {
      setValue('groupNotes', groupNotes);
    } else if (currentGroupUrl && !isLoadingNotes) {
      setValue('groupNotes', '');
    }
  }, [groupNotes, currentGroupUrl, isLoadingNotes, setValue]);

  // Reset form and image state when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editingEntry) {
        setValue('groupName', editingEntry.groupName);
        setValue('groupUrl', editingEntry.groupUrl);
        setValue('datePosted', formatDateForInput(editingEntry.datePosted));
        setValue('postContent', editingEntry.postContent);
        setValue('numReactions', editingEntry.numReactions.toString());
        setValue('numComments', editingEntry.numComments.toString());
        setValue('followUpDate', formatDateForInput(editingEntry.followUpDate));
        setResponseStatus(editingEntry.responseStatus);
        setCurrentGroupUrl(editingEntry.groupUrl);
        
        // Reset image state for editing
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        setImageIntent('keep');
      } else {
        reset({
          groupName: '',
          groupUrl: '',
          datePosted: formatDateForInput(new Date().toISOString().split('T')[0]),
          postContent: '',
          numReactions: '0',
          numComments: '0',
          followUpDate: formatDateForInput(new Date().toISOString().split('T')[0]),
          groupNotes: '',
        });
        setResponseStatus(ResponseStatus.NoResponse);
        setCurrentGroupUrl('');
        
        // Reset image state for new entry
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        setImageIntent('keep');
      }
    } else {
      // Clean up preview URL when dialog closes
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    }
  }, [open, editingEntry, reset, setValue]);

  const handleImageSelect = (file: File | null) => {
    // Clean up old preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid image file');
        return;
      }

      setSelectedImageFile(file);
      const { url } = createPreviewUrl(file);
      setImagePreviewUrl(url);
      setImageIntent('replace');
    } else {
      setSelectedImageFile(null);
      setImageIntent(editingEntry?.attachment ? 'remove' : 'keep');
    }
  };

  const onSubmit = async (data: FormData) => {
    const urlValidation = validateUrl(data.groupUrl);
    if (!urlValidation.valid) {
      toast.error(urlValidation.error);
      return;
    }

    const reactionsValidation = validateNonNegative(data.numReactions);
    if (!reactionsValidation.valid) {
      toast.error('Reactions: ' + reactionsValidation.error);
      return;
    }

    const commentsValidation = validateNonNegative(data.numComments);
    if (!commentsValidation.valid) {
      toast.error('Comments: ' + commentsValidation.error);
      return;
    }

    try {
      // Prepare attachment based on intent
      let attachment: ExternalBlob | null = null;

      if (selectedImageFile && imageIntent === 'replace') {
        // Convert file to Uint8Array and create ExternalBlob
        const bytes = await fileToUint8Array(selectedImageFile);
        attachment = ExternalBlob.fromBytes(bytes);
      } else if (imageIntent === 'keep' && editingEntry?.attachment) {
        // Keep existing attachment
        attachment = editingEntry.attachment;
      } else if (imageIntent === 'remove') {
        // Remove attachment (set to null)
        attachment = null;
      }

      const payload = {
        groupName: data.groupName.trim(),
        groupUrl: data.groupUrl.trim(),
        datePosted: formatDateForBackend(data.datePosted),
        postContent: data.postContent.trim(),
        numReactions: BigInt(data.numReactions),
        numComments: BigInt(data.numComments),
        responseStatus,
        followUpDate: formatDateForBackend(data.followUpDate),
        attachment,
      };

      // Save entry
      if (editingEntryId) {
        await updateMutation.mutateAsync({
          id: editingEntryId,
          ...payload,
        });
        toast.success('Entry updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Entry created successfully');
      }

      // Save group notes if they've been modified
      if (data.groupUrl.trim() && data.groupNotes !== undefined) {
        await saveNotesMutation.mutateAsync({
          groupUrl: data.groupUrl.trim(),
          notes: data.groupNotes.trim(),
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save entry');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || saveNotesMutation.isPending;

  const existingImageUrl = editingEntry?.attachment && imageIntent === 'keep' && !selectedImageFile
    ? editingEntry.attachment.getDirectURL()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEntryId ? 'Edit Entry' : 'Add New Entry'}</DialogTitle>
          <DialogDescription>
            {editingEntryId
              ? 'Update the details of your outreach entry.'
              : 'Track a new Facebook outreach post.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group/Page Name *</Label>
            <Input
              id="groupName"
              {...register('groupName', { required: true })}
              placeholder="Enter group or page name"
            />
            {errors.groupName && (
              <p className="text-sm text-destructive">Group name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupUrl">Group URL *</Label>
            <Input
              id="groupUrl"
              {...register('groupUrl', { required: true })}
              placeholder="https://facebook.com/groups/..."
              type="url"
            />
            {errors.groupUrl && (
              <p className="text-sm text-destructive">Group URL is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupNotes">Group Rules Notes</Label>
            <Textarea
              id="groupNotes"
              {...register('groupNotes')}
              placeholder="e.g., Business posts only on Fridays, No links in first comment, etc."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Save important rules for this group to avoid getting banned
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datePosted">Date Posted *</Label>
              <Input
                id="datePosted"
                type="date"
                {...register('datePosted', { required: true })}
              />
              {errors.datePosted && (
                <p className="text-sm text-destructive">Date is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date *</Label>
              <Input
                id="followUpDate"
                type="date"
                {...register('followUpDate', { required: true })}
              />
              {errors.followUpDate && (
                <p className="text-sm text-destructive">Follow-up date is required</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postContent">Post Content/Topic *</Label>
            <Textarea
              id="postContent"
              {...register('postContent', { required: true })}
              placeholder="Describe what you posted..."
              rows={4}
            />
            {errors.postContent && (
              <p className="text-sm text-destructive">Post content is required</p>
            )}
          </div>

          <ImageUploadField
            selectedFile={selectedImageFile}
            previewUrl={imagePreviewUrl}
            existingImageUrl={existingImageUrl}
            onFileSelect={handleImageSelect}
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numReactions">Reactions</Label>
              <Input
                id="numReactions"
                type="number"
                min="0"
                {...register('numReactions')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numComments">Comments</Label>
              <Input
                id="numComments"
                type="number"
                min="0"
                {...register('numComments')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseStatus">Response Status *</Label>
              <Select value={responseStatus} onValueChange={(value) => setResponseStatus(value as ResponseStatus)}>
                <SelectTrigger id="responseStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getResponseStatusLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEntryId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
