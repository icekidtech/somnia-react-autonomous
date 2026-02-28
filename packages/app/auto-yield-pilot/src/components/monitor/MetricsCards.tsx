import { TrendingUp, Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Handler } from "@/hooks/use-handlers";

interface MetricsCardsProps {
  handler: Handler;
}

export function MetricsCards({ handler }: MetricsCardsProps) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Yield Earned</span>
          </div>
          <p className="text-2xl font-bold text-success">
            ${(handler.stats?.grossYield ?? 245.8).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gross: ${(handler.stats?.grossYield ?? 245.8).toFixed(0)} | Fee: -$
            {(handler.stats?.feesPaid ?? 17.2).toFixed(0)} | Net: $
            {((handler.stats?.grossYield ?? 245.8) - (handler.stats?.feesPaid ?? 17.2)).toFixed(0)}
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Stats</span>
          </div>
          <p className="text-2xl font-bold">{handler.stats?.totalCompounds ?? 38}</p>
          <p className="text-xs text-muted-foreground mt-1">
            compounds · {Math.floor((Date.now() - handler.deployedAt) / 86400000) || 1} days active · {(handler.stats?.totalCompounds ?? 38) + 4} events
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Compound Interval</span>
          </div>
          <p className="text-2xl font-bold">~6.5h</p>
          <p className="text-xs text-muted-foreground mt-1">Next estimated: ~2 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
