import { useState } from 'react';
import { MoreHorizontal, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { FacebookOutreachEntry } from '@/backend';
import { getResponseStatusLabel, getResponseStatusStyle } from './responseStatusLabels';
import DeleteEntryConfirm from './DeleteEntryConfirm';
import { formatDisplayDate } from '@/utils/dateFormat';

interface EntriesTableProps {
  entries: FacebookOutreachEntry[];
  onEdit: (id: bigint) => void;
}

export default function EntriesTable({ entries, onEdit }: EntriesTableProps) {
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No entries yet. Click "Add Entry" to get started.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Group/Page</TableHead>
                <TableHead className="min-w-[100px]">Date Posted</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="text-right min-w-[80px]">Reactions</TableHead>
                <TableHead className="text-right min-w-[90px]">Comments</TableHead>
                <TableHead className="min-w-[100px]">Follow-up</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id.toString()}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{entry.groupName}</span>
                      {entry.groupUrl && (
                        <a
                          href={entry.groupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDisplayDate(entry.datePosted)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getResponseStatusStyle(entry.responseStatus)}
                    >
                      {getResponseStatusLabel(entry.responseStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{entry.numReactions.toString()}</TableCell>
                  <TableCell className="text-right">{entry.numComments.toString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDisplayDate(entry.followUpDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(entry.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteEntryConfirm
        entryId={deleteId}
        onClose={() => setDeleteId(null)}
      />
    </>
  );
}
