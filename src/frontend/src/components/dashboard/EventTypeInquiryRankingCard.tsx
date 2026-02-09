import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InquirySummary } from '@/backend';
import { TrendingUp } from 'lucide-react';

interface EventTypeInquiryRankingCardProps {
  summary: InquirySummary | undefined;
}

interface RankedEventType {
  label: string;
  count: number;
}

export default function EventTypeInquiryRankingCard({ summary }: EventTypeInquiryRankingCardProps) {
  if (!summary) {
    return null;
  }

  // Map backend fields to user-friendly labels and convert bigint to number
  const eventTypes: RankedEventType[] = [
    { label: 'General DIY (Individual)', count: Number(summary.generalDIY) },
    { label: 'Birthday Party (Kids)', count: Number(summary.birthdayPartyKids) },
    { label: 'Birthday Party (Adult)', count: Number(summary.birthdayPartyAdult) },
    { label: 'Bachelorette/Bridal Shower', count: Number(summary.bacheloretteBridalShower) },
    { label: "Girls' Night Out", count: Number(summary.girlsNightOut) },
    { label: 'Field Trips', count: Number(summary.fieldTrips) },
    { label: 'Corporate Team Building', count: Number(summary.corporateTeamBuilding) },
  ];

  // Sort by count descending
  const rankedEventTypes = eventTypes.sort((a, b) => b.count - a.count);

  // Check if all counts are zero
  const hasData = rankedEventTypes.some((et) => et.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Event Type Inquiry Ranking
        </CardTitle>
        <CardDescription>
          Group Booking inquiries ranked by event type
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No Group Booking inquiries yet. Start tracking entries to see which event types are most popular!
          </p>
        ) : (
          <div className="space-y-3">
            {rankedEventTypes.map((eventType, index) => (
              <div
                key={eventType.label}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{eventType.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{eventType.count}</span>
                  <span className="text-sm text-muted-foreground">
                    {eventType.count === 1 ? 'inquiry' : 'inquiries'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
