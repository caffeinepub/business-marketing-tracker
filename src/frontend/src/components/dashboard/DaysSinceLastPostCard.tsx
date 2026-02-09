import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import type { FacebookOutreachEntry } from '@/backend';

interface DaysSinceLastPostCardProps {
  entries: FacebookOutreachEntry[];
}

interface GroupLastPost {
  groupName: string;
  groupUrl: string;
  daysSince: number;
  lastPostDate: string;
}

export default function DaysSinceLastPostCard({ entries }: DaysSinceLastPostCardProps) {
  // Group entries by groupUrl (or groupName as fallback)
  const groupMap = new Map<string, FacebookOutreachEntry[]>();
  
  entries.forEach((entry) => {
    const key = entry.groupUrl || entry.groupName;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(entry);
  });

  // Calculate days since last post for each group
  const groupStats: GroupLastPost[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  groupMap.forEach((groupEntries, key) => {
    // Find the most recent datePosted
    const sortedEntries = [...groupEntries].sort((a, b) => {
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    });

    const mostRecent = sortedEntries[0];
    const lastPostDate = new Date(mostRecent.datePosted);
    lastPostDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastPostDate.getTime();
    const daysSince = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    groupStats.push({
      groupName: mostRecent.groupName,
      groupUrl: mostRecent.groupUrl,
      daysSince,
      lastPostDate: mostRecent.datePosted,
    });
  });

  // Sort by days since (most recent first)
  groupStats.sort((a, b) => a.daysSince - b.daysSince);

  if (groupStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Days Since Last Post
          </CardTitle>
          <CardDescription>Track posting frequency to avoid spamming groups</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No entries yet. Add your first post to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Days Since Last Post
        </CardTitle>
        <CardDescription>Track posting frequency to avoid spamming groups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group/Page</TableHead>
                <TableHead className="text-right">Days Since Last Post</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupStats.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{stat.groupName}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        stat.daysSince === 0
                          ? 'text-primary font-semibold'
                          : stat.daysSince <= 3
                          ? 'text-destructive font-semibold'
                          : stat.daysSince <= 7
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {stat.daysSince} {stat.daysSince === 1 ? 'day' : 'days'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
