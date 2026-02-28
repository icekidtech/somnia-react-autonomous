import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ArrowLeft, Clipboard, Zap, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useHandlers } from "@/hooks/use-handlers";

const COMMON_TOKENS = [
  { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
  { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
];

function isValidAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export default function Deploy() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { addHandler } = useHandlers();

  const [name, setName] = useState("");
  const [vaultAddress, setVaultAddress] = useState("");
  const [compoundToken, setCompoundToken] = useState("");
  const [rewardToken, setRewardToken] = useState("");
  const [customCompound, setCustomCompound] = useState("");
  const [customReward, setCustomReward] = useState("");
  const [threshold, setThreshold] = useState(100);
  const [deploying, setDeploying] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const selectedCompound = compoundToken === "custom" ? customCompound : compoundToken;
  const selectedReward = rewardToken === "custom" ? customReward : rewardToken;

  const isValid =
    name.length >= 2 &&
    name.length <= 50 &&
    isValidAddress(vaultAddress) &&
    isValidAddress(selectedCompound) &&
    isValidAddress(selectedReward) &&
    threshold >= 10 &&
    threshold <= 10000;

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      toast({ title: "Connect your wallet first", variant: "destructive" });
      return;
    }
    setDeploying(true);
    try {
      // Simulate SDK call: deployAutoCompoundHandler(vaultAddress, selectedReward, threshold, address)
      await new Promise((r) => setTimeout(r, 2000));
      const handlerAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      addHandler({
        address: handlerAddress,
        name,
        vaultAddress,
        compoundToken: selectedCompound,
        rewardToken: selectedReward,
        threshold,
        network: "ethereum",
        status: "active",
        deployedAt: Date.now(),
        stats: { totalCompounds: 0, grossYield: 0, feesPaid: 0, netYield: 0, lastCompound: null },
      });

      toast({ title: "Handler deployed successfully!" });
      navigate(`/monitor/${handlerAddress}`);
    } catch {
      toast({ title: "Deployment failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setDeploying(false);
    }
  };

  const pasteAddress = async (setter: (v: string) => void) => {
    const text = await navigator.clipboard.readText();
    if (isValidAddress(text)) setter(text);
  };

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/")} className="gap-1 text-muted-foreground -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Deploy New Handler</h1>
        <p className="text-sm text-muted-foreground">Configure and deploy an auto-compound handler.</p>
      </div>

      {step === 1 ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
            <CardDescription>Set up your handler parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Handler Name */}
            <div className="space-y-2">
              <Label>Handler Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Yield Farm"
                maxLength={50}
              />
              {name.length > 0 && name.length < 2 && (
                <p className="text-xs text-destructive">Name must be at least 2 characters</p>
              )}
            </div>

            {/* Vault Address */}
            <div className="space-y-2">
              <Label>Vault / LP Address</Label>
              <div className="relative">
                <Input
                  value={vaultAddress}
                  onChange={(e) => setVaultAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono pr-10"
                />
                <button
                  onClick={() => pasteAddress(setVaultAddress)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              {vaultAddress && !isValidAddress(vaultAddress) && (
                <p className="text-xs text-destructive">Invalid Ethereum address</p>
              )}
            </div>

            {/* Compound Token */}
            <div className="space-y-2">
              <Label>Compound Token</Label>
              <Select value={compoundToken} onValueChange={setCompoundToken}>
                <SelectTrigger><SelectValue placeholder="Select token" /></SelectTrigger>
                <SelectContent>
                  {COMMON_TOKENS.map((t) => (
                    <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Address</SelectItem>
                </SelectContent>
              </Select>
              {compoundToken === "custom" && (
                <Input
                  value={customCompound}
                  onChange={(e) => setCustomCompound(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
              )}
            </div>

            {/* Reward Token */}
            <div className="space-y-2">
              <Label>Reward Token</Label>
              <Select value={rewardToken} onValueChange={setRewardToken}>
                <SelectTrigger><SelectValue placeholder="Select token" /></SelectTrigger>
                <SelectContent>
                  {COMMON_TOKENS.map((t) => (
                    <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Address</SelectItem>
                </SelectContent>
              </Select>
              {rewardToken === "custom" && (
                <Input
                  value={customReward}
                  onChange={(e) => setCustomReward(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
              )}
            </div>

            {/* Threshold */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Reinvestment Threshold</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Compound triggers when accumulated rewards exceed this USD amount.
                  </TooltipContent>
                </Tooltip>
              </div>
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

            <Button onClick={() => setStep(2)} disabled={!isValid} className="w-full mt-2">
              Review & Deploy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vault</span>
                <span className="font-mono text-xs">{vaultAddress.slice(0, 10)}...{vaultAddress.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compound Token</span>
                <span className="font-mono text-xs">{selectedCompound.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward Token</span>
                <span className="font-mono text-xs">{selectedReward.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Threshold</span>
                <span>${threshold.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/30">
            <CardContent className="pt-5 pb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Gas</span>
                <span>~0.005 ETH ($12.50)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                CompoundMax charges a 7% performance fee on realized yield.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={deploying}>
              Back
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={deploying || !isConnected}
              className="flex-1 gap-2 glow-primary"
            >
              {deploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Deploy Handler
                </>
              )}
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-center text-warning">Connect your wallet to deploy.</p>
          )}
        </div>
      )}
    </div>
  );
}
