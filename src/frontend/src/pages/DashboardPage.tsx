import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EntriesTable from '@/components/entries/EntriesTable';
import SuccessRateChart from '@/components/dashboard/SuccessRateChart';
import FollowUpTodayList from '@/components/dashboard/FollowUpTodayList';
import DaysSinceLastPostCard from '@/components/dashboard/DaysSinceLastPostCard';
import WinningPostsCard from '@/components/dashboard/WinningPostsCard';
import EntryFormDialog from '@/components/entries/EntryFormDialog';
import { useOutreachQueries } from '@/hooks/useOutreachQueries';
import { useAuthorizedActor } from '@/hooks/useAuthorizedActor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<bigint | null>(null);

  const { isInitializing } = useAuthorizedActor();
  
  const { data: entries, isLoading, isError, error, refetch } = useOutreachQueries.useListEntries();
  const { data: todayFollowUps, isLoading: isLoadingToday } = useOutreachQueries.useFollowUpToday();
  const { data: groupSummary, isLoading: isLoadingSummary } = useOutreachQueries.useGroupSummary();

  const handleAddNew = () => {
    setEditingEntryId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: bigint) => {
    setEditingEntryId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntryId(null);
  };

  // Show loading state while auth is initializing
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketing Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your Facebook outreach and monitor engagement
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header Section for Mobile */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:backdrop-blur-none lg:pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 lg:pt-0 border-b lg:border-b-0 pb-4 lg:pb-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketing Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your Facebook outreach and monitor engagement
            </p>
          </div>
          <Button onClick={handleAddNew} size="default" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Follow-up Reminders */}
      {isLoadingToday ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <FollowUpTodayList entries={todayFollowUps || []} onEdit={handleEdit} />
      )}

      {/* Winning Posts Section */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <WinningPostsCard entries={entries || []} />
      )}

      {/* Days Since Last Post */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DaysSinceLastPostCard entries={entries || []} />
      )}

      {/* Success Rate Chart */}
      {isLoadingSummary ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <SuccessRateChart data={groupSummary || []} />
      )}

      {/* Recent Posts Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>
        
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load entries: {error?.message || 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <EntriesTable entries={entries || []} onEdit={handleEdit} />
        )}
      </div>

      {/* Entry Form Dialog */}
      <EntryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingEntryId={editingEntryId}
        onClose={handleCloseForm}
      />
    </div>
  );
}
