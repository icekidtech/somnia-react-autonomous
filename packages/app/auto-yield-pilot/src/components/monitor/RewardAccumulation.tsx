import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Handler } from "@/hooks/use-handlers";

interface RewardAccumulationProps {
  handler: Handler;
  rewardPct?: number;
  currentBalance?: number;
}

export function RewardAccumulation({ handler, rewardPct = 164, currentBalance = 82.5 }: RewardAccumulationProps) {
  return (
    <Card className="glass">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reward Accumulation</span>
          <span className="text-sm font-bold text-primary">{rewardPct}% of threshold</span>
        </div>
        <Progress value={Math.min(rewardPct, 100)} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Current: ${currentBalance.toFixed(2)}</span>
          <span>Threshold: ${handler.threshold.toFixed(2)}</span>
        </div>
        {rewardPct >= 100 && (
          <p className="text-xs text-success flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Threshold exceeded — auto-compound ready
          </p>
        )}
      </CardContent>
    </Card>
  );
}
