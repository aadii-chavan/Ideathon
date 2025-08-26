import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Reports() {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and view analysis reports</p>
      </div>

      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Reports will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reports available.</p>
        </CardContent>
      </Card>
    </div>
  );
}