import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SuccessRateChartProps {
  data: Array<[string, bigint]>;
}

export default function SuccessRateChart({ data }: SuccessRateChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Success Rate by Group</CardTitle>
          <CardDescription>Groups with Active Discussion or Leads Generated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No successful engagements yet. Keep posting!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by count descending
  const sortedData = [...data].sort((a, b) => Number(b[1]) - Number(a[1]));
  const maxCount = Math.max(...sortedData.map(([, count]) => Number(count)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Success Rate by Group
        </CardTitle>
        <CardDescription>Groups with Active Discussion or Leads Generated</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map(([groupName, count]) => {
            const percentage = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0;
            
            return (
              <div key={groupName} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[70%]">{groupName}</span>
                  <span className="text-muted-foreground">{count.toString()} posts</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
