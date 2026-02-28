import { useState, useEffect } from "react";
import { ExternalLink, Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventSubscription } from "@/hooks/use-event-subscription";
import type { Handler } from "@/hooks/use-handlers";

interface EventItem {
  id: number;
  type: "compound" | "threshold" | "manual";
  amount: number;
  timestamp: number;
  tx: string;
  blockNumber?: number;
  gasUsed?: string;
}

interface EventLogProps {
  handler?: Handler;
}

const mockEvents: EventItem[] = [
  { id: 1, type: "compound", amount: 82.5, timestamp: Date.now() - 3600000, tx: "0xabc...def", blockNumber: 18942315, gasUsed: "124,532" },
  { id: 2, type: "threshold", amount: 50, timestamp: Date.now() - 7200000, tx: "0x123...456", blockNumber: 18942100, gasUsed: "85,200" },
  { id: 3, type: "compound", amount: 67.3, timestamp: Date.now() - 86400000, tx: "0x789...012", blockNumber: 18935420, gasUsed: "118,900" },
  { id: 4, type: "manual", amount: 120, timestamp: Date.now() - 172800000, tx: "0xdef...abc", blockNumber: 18928100, gasUsed: "132,100" },
  { id: 5, type: "compound", amount: 45.2, timestamp: Date.now() - 259200000, tx: "0xfed...321", blockNumber: 18920800, gasUsed: "110,400" },
  { id: 6, type: "compound", amount: 91.1, timestamp: Date.now() - 345600000, tx: "0x456...789", blockNumber: 18913500, gasUsed: "126,700" },
];

export function EventLog({ handler }: EventLogProps) {
  const { events: liveEvents, isLoading, error } = useEventSubscription();
  const [eventFilter, setEventFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // Use live events if available, fall back to mock data
  const displayEvents: EventItem[] = liveEvents.length > 0 
    ? liveEvents.map((e, idx) => ({
        id: idx,
        type: "compound" as const,
        amount: parseFloat(e.amount) / 1e18, // Convert wei to token
        timestamp: e.timestamp,
        tx: e.transactionHash || "pending",
        blockNumber: e.blockNumber,
        gasUsed: "N/A",
      }))
    : mockEvents;

  const filteredEvents =
    eventFilter === "all" ? displayEvents : displayEvents.filter((e) => e.type === eventFilter);

  // Subscribe to events when handler is provided
  useEffect(() => {
    if (handler?.address) {
      // Subscription logic will be triggered by hook
      console.log("Monitoring events for handler:", handler.address);
    }
  }, [handler?.address]);

  const exportCSV = () => {
    const headers = "Timestamp,Event Type,Amount,Transaction\n";
    const rows = filteredEvents
      .map((e) => `${new Date(e.timestamp).toISOString()},${e.type},${e.amount},${e.tx}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compound-events.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const visibleEvents = filteredEvents.slice(0, visibleCount);

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium">Event Log</CardTitle>
          <div className="flex gap-2">
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="compound">Compounds</SelectItem>
                <SelectItem value="threshold">Threshold</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={exportCSV}>
              <Download className="h-3 w-3" /> CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-xs w-8"></TableHead>
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs">Event</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-right">Tx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleEvents.map((event) => (
                <>
                  <TableRow
                    key={event.id}
                    className="border-border/30 cursor-pointer hover:bg-accent/30"
                    onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                  >
                    <TableCell className="w-8 px-2">
                      {expandedRow === event.id ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          event.type === "compound"
                            ? "bg-success/15 text-success"
                            : event.type === "threshold"
                            ? "bg-warning/15 text-warning"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {event.type === "compound"
                          ? "✅ Compound"
                          : event.type === "threshold"
                          ? "Threshold"
                          : "Manual"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      ${event.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={`https://etherscan.io/tx/${event.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.tx} <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                  {expandedRow === event.id && (
                    <TableRow key={`${event.id}-detail`} className="border-border/20 bg-accent/20">
                      <TableCell colSpan={5} className="py-3 px-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Block Number</span>
                            <p className="font-mono font-medium">{event.blockNumber?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gas Used</span>
                            <p className="font-mono font-medium">{event.gasUsed}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Exact Amount</span>
                            <p className="font-mono font-medium">${event.amount.toFixed(6)}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
        {visibleCount < filteredEvents.length && (
          <div className="p-3 text-center border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setVisibleCount((c) => c + 5)}
            >
              Load more ({filteredEvents.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
