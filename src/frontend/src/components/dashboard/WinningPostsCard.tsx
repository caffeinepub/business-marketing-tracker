import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ExternalLink, MessageSquare } from 'lucide-react';
import type { FacebookOutreachEntry } from '@/backend';
import { formatDisplayDate } from '@/utils/dateFormat';

interface WinningPostsCardProps {
  entries: FacebookOutreachEntry[];
}

export default function WinningPostsCard({ entries }: WinningPostsCardProps) {
  // Filter entries with more than 5 comments
  const winningPosts = entries.filter((entry) => Number(entry.numComments) > 5);

  // Sort by number of comments (descending)
  const sortedWinningPosts = [...winningPosts].sort(
    (a, b) => Number(b.numComments) - Number(a.numComments)
  );

  if (sortedWinningPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Winning Posts
          </CardTitle>
          <CardDescription>Posts with more than 5 comments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No winning posts yet. Keep engaging with your audience!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Winning Posts
        </CardTitle>
        <CardDescription>
          {sortedWinningPosts.length} {sortedWinningPosts.length === 1 ? 'post' : 'posts'} with high engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedWinningPosts.map((entry) => (
            <div
              key={entry.id.toString()}
              className="p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{entry.groupName}</h4>
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
                  <p className="text-sm text-muted-foreground">
                    Posted: {formatDisplayDate(entry.datePosted)}
                  </p>
                </div>
                <Badge variant="default" className="flex items-center gap-1 flex-shrink-0">
                  <MessageSquare className="h-3 w-3" />
                  {entry.numComments.toString()} comments
                </Badge>
              </div>
              <p className="text-sm line-clamp-2 text-muted-foreground">
                {entry.postContent}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
