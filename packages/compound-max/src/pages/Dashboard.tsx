import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Zap, Activity, Settings, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHandlers } from "@/hooks/use-handlers";
import { SettingsModal } from "@/components/settings/SettingsModal";
import type { Handler } from "@/hooks/use-handlers";

const NETWORK_LABELS: Record<string, string> = {
  ethereum: "🔷 ETH",
  arbitrum: "🔵 ARB",
  polygon: "🟣 POLY",
  base: "🔵 BASE",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { handlers, updateHandler, removeHandler } = useHandlers();
  const [settingsHandler, setSettingsHandler] = useState<Handler | null>(null);

  if (handlers.length === 0) {
    return (
      <div className="container py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto glow-primary">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">No handlers deployed yet</h1>
            <p className="text-muted-foreground">
              Deploy your first auto-compound handler and start earning optimized yield.
            </p>
          </div>
          <Button onClick={() => navigate("/deploy")} size="lg" className="gap-2 glow-primary">
            <Plus className="h-5 w-5" />
            Deploy New Handler
          </Button>
        </div>
      </div>
    );
  }

  const totalYield = handlers.reduce((sum, h) => sum + (h.stats?.grossYield ?? 0), 0);
  const totalFees = handlers.reduce((sum, h) => sum + (h.stats?.feesPaid ?? 0), 0);
  const totalCompounds = handlers.reduce((sum, h) => sum + (h.stats?.totalCompounds ?? 0), 0);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {handlers.length} handler{handlers.length !== 1 && "s"} deployed
          </p>
        </div>
        <Button onClick={() => navigate("/deploy")} className="gap-2 glow-primary">
          <Plus className="h-4 w-4" />
          Deploy Handler
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Gross Yield</p>
            <p className="text-xl font-bold text-success">${totalYield.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Fees Paid</p>
            <p className="text-xl font-bold">${totalFees.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Net Yield</p>
            <p className="text-xl font-bold text-primary">${(totalYield - totalFees).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Total Compounds</p>
            <p className="text-xl font-bold">{totalCompounds}</p>
          </CardContent>
        </Card>
      </div>

      {/* Handler Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {handlers.map((handler) => (
          <Card
            key={handler.address}
            className="glass cursor-pointer hover:border-primary/30 transition-all group"
            onClick={() => navigate(`/monitor/${handler.address}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{handler.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {NETWORK_LABELS[handler.network] || handler.network}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      handler.status === "active"
                        ? "bg-success/15 text-success"
                        : handler.status === "paused"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {handler.status === "active" ? "Active" : handler.status === "paused" ? "Paused" : "Error"}
                  </span>
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {handler.vaultAddress.slice(0, 6)}...{handler.vaultAddress.slice(-4)}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Compounds</p>
                  <p className="text-sm font-semibold">{handler.stats?.totalCompounds ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Yield</p>
                  <p className="text-sm font-semibold text-success">
                    ${(handler.stats?.grossYield ?? 0).toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Last</p>
                  <p className="text-sm font-semibold">
                    {handler.stats?.lastCompound ? new Date(handler.stats.lastCompound).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/monitor/${handler.address}`);
                  }}
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsHandler(handler);
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {settingsHandler && (
        <SettingsModal
          open={!!settingsHandler}
          onOpenChange={(open) => !open && setSettingsHandler(null)}
          handler={settingsHandler}
          onUpdate={updateHandler}
          onDelete={(addr) => {
            removeHandler(addr);
            setSettingsHandler(null);
          }}
        />
      )}
    </div>
  );
}
