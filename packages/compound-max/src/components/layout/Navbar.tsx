import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  Zap,
  Settings,
  Copy,
  ExternalLink,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Check,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CHAINS } from "@/config/wagmi";
import { useChainId, useSwitchChain } from "wagmi";

const NAV_LINKS = [
  { label: "Dashboard", path: "/" },
  { label: "Docs", path: "#docs" },
  { label: "About", path: "#about" },
];

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId) ?? SUPPORTED_CHAINS[0];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Address copied" });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">
            Compound<span className="text-gradient">Max</span>
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Network Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 border-border/50 bg-secondary/50">
                <span className="text-xs">{currentChain.icon}</span>
                <span className="text-xs">{currentChain.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {SUPPORTED_CHAINS.map((chain) => (
                <DropdownMenuItem
                  key={chain.id}
                  onClick={() => switchChain?.({ chainId: chain.id })}
                  className="gap-2"
                >
                  <span>{chain.icon}</span>
                  <span>{chain.name}</span>
                  {chain.id === chainId && <Check className="h-3 w-3 ml-auto text-success" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet */}
          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 border-border/50 bg-secondary/50">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  <span className="font-mono text-xs">{truncateAddress(address)}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={copyAddress} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Address"}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Etherscan
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => disconnect()} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => connect({ connector: injected() })}
              className="gap-1.5 glow-primary"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
          )}

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>App Settings</DropdownMenuItem>
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Report Bug</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile network selector */}
            <div className="flex items-center gap-2 px-3 py-2.5 sm:hidden">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => switchChain?.({ chainId: chain.id })}
                  className={`px-2 py-1 rounded text-xs ${
                    chain.id === chainId ? "bg-primary/20 text-primary" : "text-muted-foreground"
                  }`}
                >
                  {chain.icon} {chain.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
