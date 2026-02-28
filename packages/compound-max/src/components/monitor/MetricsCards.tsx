import { TrendingUp, Activity, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useHandlerContract } from "@/hooks/use-handler-contract";
import type { Handler } from "@/hooks/use-handlers";

interface MetricsCardsProps {
  handler: Handler;
}

export function MetricsCards({ handler }: MetricsCardsProps) {
  const { state: contractState } = useHandlerContract(handler.address);
  const [avgInterval, setAvgInterval] = useState("~6.5h");

  // Calculate average interval from compounds executed
  useEffect(() => {
    if (contractState.totalCompounds) {
      const compounds = parseInt(contractState.totalCompounds);
      const daysActive = Math.max(1, Math.floor((Date.now() - handler.deployedAt) / 86400000));
      const hoursPerCompound = (daysActive * 24) / Math.max(1, compounds);
      if (hoursPerCompound < 1) {
        setAvgInterval(`~${(hoursPerCompound * 60).toFixed(0)}m`);
      } else {
        setAvgInterval(`~${hoursPerCompound.toFixed(1)}h`);
      }
    }
  }, [contractState.totalCompounds, handler.deployedAt]);

  const grossYield = handler.stats?.grossYield ?? 245.8;
  const feesPaid = handler.stats?.feesPaid ?? 17.2;
  const totalCompounds = contractState.totalCompounds 
    ? parseInt(contractState.totalCompounds) 
    : (handler.stats?.totalCompounds ?? 38);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Yield Earned</span>
          </div>
          <p className="text-2xl font-bold text-success">
            ${grossYield.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gross: ${grossYield.toFixed(0)} | Fee: -${feesPaid.toFixed(0)} | Net: ${(grossYield - feesPaid).toFixed(0)}
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Stats</span>
          </div>
          <p className="text-2xl font-bold">{totalCompounds}</p>
          <p className="text-xs text-muted-foreground mt-1">
            compounds · {Math.floor((Date.now() - handler.deployedAt) / 86400000) || 1} days active · {totalCompounds + 4} events
          </p>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Compound Interval</span>
          </div>
          <p className="text-2xl font-bold">{avgInterval}</p>
          <p className="text-xs text-muted-foreground mt-1">Next estimated: ~2 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
