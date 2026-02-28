import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const chartData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  compounds: Math.floor(Math.random() * 5) + 1,
}));

export function CompoundChart() {
  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Compounds (30 days)</CardTitle>
          <span className="text-xs text-success font-medium">+12% WoW</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(220 10% 40%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(220 10% 40%)" />
              <RechartsTooltip
                contentStyle={{
                  background: "hsl(220 15% 11%)",
                  border: "1px solid hsl(220 12% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="compounds"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
