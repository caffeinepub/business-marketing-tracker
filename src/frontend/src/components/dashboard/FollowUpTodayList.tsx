import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ExternalLink, Pencil } from 'lucide-react';
import type { FacebookOutreachEntry } from '@/backend';
import { getResponseStatusLabel, getResponseStatusStyle } from '@/components/entries/responseStatusLabels';
import { formatDisplayDate } from '@/utils/dateFormat';

interface FollowUpTodayListProps {
  entries: FacebookOutreachEntry[];
  onEdit: (id: bigint) => void;
}

export default function FollowUpTodayList({ entries, onEdit }: FollowUpTodayListProps) {
  if (entries.length === 0) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Follow-up Reminders
          </CardTitle>
          <CardDescription>No follow-ups scheduled for today</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Follow-up Reminders
        </CardTitle>
        <CardDescription>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} due for follow-up today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id.toString()}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-background border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{entry.groupName}</h4>
                  {entry.groupUrl && (
                    <a
                      href={entry.groupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Posted: {formatDisplayDate(entry.datePosted)}</span>
                  <span>•</span>
                  <Badge
                    className={getResponseStatusStyle(entry.responseStatus)}
                  >
                    {getResponseStatusLabel(entry.responseStatus)}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(entry.id)}
                className="w-full sm:w-auto"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
