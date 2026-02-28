import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Play, Pause, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandlers } from "@/hooks/use-handlers";
import { useToast } from "@/hooks/use-toast";
import { useHandlerContract } from "@/hooks/use-handler-contract";
import { MetricsCards } from "@/components/monitor/MetricsCards";
import { RewardAccumulation } from "@/components/monitor/RewardAccumulation";
import { CompoundChart } from "@/components/monitor/CompoundChart";
import { EventLog } from "@/components/monitor/EventLog";
import { SettingsModal } from "@/components/settings/SettingsModal";

export default function Monitor() {
  const { address } = useParams();
  const navigate = useNavigate();
  const { handlers, updateHandler, removeHandler } = useHandlers();
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCompounding, setIsCompounding] = useState(false);

  const handler = handlers.find((h) => h.address === address);
  const { state: contractState, manualCompound } = useHandlerContract(handler?.address || "");

  // Auto-refresh every 15 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!handler) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-xl font-bold">Handler not found</h1>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const isPaused = handler.status === "paused";

  const togglePause = () => {
    updateHandler(handler.address, {
      status: isPaused ? "active" : "paused",
    });
    toast({ title: isPaused ? "Handler resumed" : "Handler paused" });
  };

  const handleManualCompound = async () => {
    if (!contractState.shouldCompound) {
      toast({
        title: "Cannot compound now",
        description: "Accumulated rewards are below the threshold",
        variant: "destructive",
      });
      return;
    }

    setIsCompounding(true);
    try {
      const result = await manualCompound();
      if (result) {
        toast({
          title: "Manual compound executed",
          description: `Transaction: ${result.transactionHash?.slice(0, 10)}...`,
        });
      }
    } catch (error) {
      toast({
        title: "Error triggering compound",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCompounding(false);
    }
  };

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{handler.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">
              {handler.address.slice(0, 10)}...{handler.address.slice(-6)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-3.5 w-3.5" /> Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleManualCompound}
            disabled={isCompounding || !contractState.shouldCompound}
          >
            {isCompounding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compounding...
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" /> Manual Trigger
              </>
            )}
          </Button>
          <Button
            variant={isPaused ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={togglePause}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      <MetricsCards handler={handler} />
      <RewardAccumulation handler={handler} />
      <CompoundChart />
      <EventLog handler={handler} />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        handler={handler}
        onUpdate={updateHandler}
        onDelete={(addr) => {
          removeHandler(addr);
          navigate("/");
        }}
      />
    </div>
  );
}
