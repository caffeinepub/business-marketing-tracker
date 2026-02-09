import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useOutreachMutations } from '@/hooks/useOutreachMutations';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DeleteEntryConfirmProps {
  entryId: bigint | null;
  onClose: () => void;
}

export default function DeleteEntryConfirm({ entryId, onClose }: DeleteEntryConfirmProps) {
  const deleteMutation = useOutreachMutations.useDeleteEntry();

  const handleDelete = async () => {
    if (!entryId) return;

    try {
      await deleteMutation.mutateAsync(entryId);
      toast.success('Entry deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete entry');
    }
  };

  return (
    <AlertDialog open={!!entryId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this entry? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
