import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DevOpsInsights() {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">DevOps Insights</h1>
        <p className="text-muted-foreground">Builds, deployments, and performance metrics</p>
      </div>

      <Card className="card-dark">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Insights will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}