import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PredictionResponse } from "@/lib/api";

interface Props { data: PredictionResponse; }

export function LossChart({ data }: Props) {
  const rows = data.trainingLoss.map((t, i) => ({
    epoch: i + 1, training: t, validation: data.validationLoss[i],
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-base font-semibold">Training curves</h3>
      <p className="text-xs text-muted-foreground">Loss (MSE) per epoch</p>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="epoch" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => Number(v).toFixed(5)}
            />
            <Line type="monotone" dataKey="training" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="validation" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[var(--color-primary)]" /> Training</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[var(--color-accent)]" /> Validation</span>
      </div>
    </div>
  );
}
