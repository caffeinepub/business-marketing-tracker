import { useState } from 'react';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EntriesTable from '@/components/entries/EntriesTable';
import SuccessRateChart from '@/components/dashboard/SuccessRateChart';
import FollowUpTodayList from '@/components/dashboard/FollowUpTodayList';
import DaysSinceLastPostCard from '@/components/dashboard/DaysSinceLastPostCard';
import WinningPostsCard from '@/components/dashboard/WinningPostsCard';
import EntryFormDialog from '@/components/entries/EntryFormDialog';
import { useOutreachQueries } from '@/hooks/useOutreachQueries';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { isStoppedCanisterError } from '@/utils/canisterErrors';

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<bigint | null>(null);

  // Check backend health first
  const { 
    data: healthStatus, 
    isLoading: isHealthLoading, 
    isError: isHealthError,
    error: healthError,
    refetch: refetchHealth 
  } = useBackendHealth();

  const isBackendAvailable = healthStatus === true;
  
  // Only enable data queries when backend is healthy
  const { data: entries, isLoading: isEntriesLoading, isError: isEntriesError, error: entriesError, refetch: refetchEntries } = useOutreachQueries.useListEntries(isBackendAvailable);
  const { data: todayFollowUps, isLoading: isLoadingToday, refetch: refetchToday } = useOutreachQueries.useFollowUpToday(isBackendAvailable);
  const { data: groupSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useOutreachQueries.useGroupSummary(isBackendAvailable);

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

  const handleRetry = async () => {
    // Re-check health first
    const healthResult = await refetchHealth();
    
    // If health check succeeds, refetch all data
    if (healthResult.data === true) {
      refetchEntries();
      refetchToday();
      refetchSummary();
    }
  };

  // Detect stopped canister error
  const hasStoppedCanisterError = isHealthError && isStoppedCanisterError(healthError);
  const hasDataError = isEntriesError && isStoppedCanisterError(entriesError);
  const showStoppedError = hasStoppedCanisterError || hasDataError;

  return (
    <div className="space-y-6">
      {/* Sticky Header Section - Enhanced for mobile reliability */}
      <div className="sticky top-0 z-20 bg-background pb-4 border-b shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketing Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your Facebook outreach and monitor engagement
            </p>
          </div>
          <Button onClick={handleAddNew} size="default" className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
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

      {/* Follow-up Reminders */}
      {isHealthLoading || isLoadingToday ? (
        <Skeleton className="h-32 w-full" />
      ) : isBackendAvailable ? (
        <FollowUpTodayList entries={todayFollowUps || []} onEdit={handleEdit} />
      ) : null}

      {/* Winning Posts Section */}
      {isHealthLoading || isEntriesLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isBackendAvailable ? (
        <WinningPostsCard entries={entries || []} />
      ) : null}

      {/* Days Since Last Post */}
      {isHealthLoading || isEntriesLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isBackendAvailable ? (
        <DaysSinceLastPostCard entries={entries || []} />
      ) : null}

      {/* Success Rate Chart */}
      {isHealthLoading || isLoadingSummary ? (
        <Skeleton className="h-64 w-full" />
      ) : isBackendAvailable ? (
        <SuccessRateChart data={groupSummary || []} />
      ) : null}

      {/* Recent Posts Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>
        
        {isEntriesError && !showStoppedError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load entries: {entriesError?.message || 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetchEntries()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isHealthLoading || isEntriesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isBackendAvailable ? (
          <EntriesTable entries={entries || []} onEdit={handleEdit} />
        ) : null}
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
