import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Loader2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Handler } from "@/hooks/use-handlers";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handler: Handler;
  onUpdate: (address: string, updates: Partial<Handler>) => void;
  onDelete: (address: string) => void;
}

export function SettingsModal({ open, onOpenChange, handler, onUpdate, onDelete }: SettingsModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(handler.name);
  const [autoCompound, setAutoCompound] = useState(handler.status === "active");
  const [threshold, setThreshold] = useState(handler.threshold);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Advanced
  const [gasCapEnabled, setGasCapEnabled] = useState(false);
  const [gasCap, setGasCap] = useState(50);
  const [executors, setExecutors] = useState<string[]>([]);
  const [newExecutor, setNewExecutor] = useState("");

  // Ownership
  const [newOwner, setNewOwner] = useState("");

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleSaveBasic = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onUpdate(handler.address, {
      name,
      threshold,
      status: autoCompound ? "active" : "paused",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({ title: "Settings saved" });
  };

  const addExecutor = () => {
    if (isValidAddress(newExecutor) && !executors.includes(newExecutor)) {
      setExecutors([...executors, newExecutor]);
      setNewExecutor("");
    }
  };

  const handleTransfer = async () => {
    if (!isValidAddress(newOwner)) return;
    toast({ title: "Ownership transferred", description: `New owner: ${newOwner.slice(0, 10)}...` });
    setNewOwner("");
  };

  const handleDelete = () => {
    onDelete(handler.address);
    onOpenChange(false);
    toast({ title: "Handler deleted" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass border-border/50">
        <DialogHeader>
          <DialogTitle>Handler Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Handler Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Compound</Label>
                <p className="text-xs text-muted-foreground">Automatically compound when threshold reached</p>
              </div>
              <Switch checked={autoCompound} onCheckedChange={setAutoCompound} />
            </div>

            <div className="space-y-3">
              <Label>Reinvestment Threshold</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={10}
                  max={10000}
                  step={10}
                  className="flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Math.min(10000, Math.max(10, Number(e.target.value))))}
                    className="w-24 text-right"
                    min={10}
                    max={10000}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveBasic} disabled={saving} className="w-full gap-2">
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="h-4 w-4" /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-5 mt-4">
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-sm font-medium">CompoundMax Fee</p>
              <p className="text-2xl font-bold text-primary mt-1">7%</p>
              <p className="text-xs text-muted-foreground mt-1">Applied on realized yield only</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Max Gas Price Cap</Label>
                  <p className="text-xs text-muted-foreground">Skip compounds if gas is too high</p>
                </div>
                <Switch checked={gasCapEnabled} onCheckedChange={setGasCapEnabled} />
              </div>
              {gasCapEnabled && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={gasCap}
                    onChange={(e) => setGasCap(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">Gwei</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Executor Whitelist</Label>
              <p className="text-xs text-muted-foreground">Only these addresses can trigger compounds</p>
              <div className="flex gap-2">
                <Input
                  value={newExecutor}
                  onChange={(e) => setNewExecutor(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-xs"
                />
                <Button size="sm" onClick={addExecutor} disabled={!isValidAddress(newExecutor)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {executors.length > 0 && (
                <div className="space-y-1.5">
                  {executors.map((addr) => (
                    <div key={addr} className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2">
                      <span className="font-mono text-xs">{addr.slice(0, 10)}...{addr.slice(-6)}</span>
                      <button
                        onClick={() => setExecutors(executors.filter((a) => a !== addr))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {executors.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No executors whitelisted — anyone can trigger</p>
              )}
            </div>
          </TabsContent>

          {/* Ownership */}
          <TabsContent value="ownership" className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Current Owner</Label>
              <div className="rounded-md bg-accent/30 px-3 py-2.5">
                <span className="font-mono text-sm">{handler.address.slice(0, 14)}...{handler.address.slice(-8)}</span>
                <span className="text-xs text-muted-foreground ml-2">(You)</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Transfer Ownership</Label>
              <Input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="New owner address (0x...)"
                className="font-mono text-xs"
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2" disabled={!isValidAddress(newOwner)}>
                    <AlertTriangle className="h-4 w-4" /> Transfer Ownership
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Transfer Ownership?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You will lose control of this handler.
                      <br /><br />
                      <span className="font-mono text-xs">New owner: {newOwner}</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTransfer}>Transfer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> This cannot be undone!
              </p>
            </div>

            <Separator />

            <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
              <p className="text-sm font-medium text-destructive">Danger Zone</p>
              <p className="text-xs text-muted-foreground">
                This will permanently remove the handler. You can deploy a new one anytime.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Handler
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{handler.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this handler from your dashboard.
                      The on-chain contract will remain but will no longer be managed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
