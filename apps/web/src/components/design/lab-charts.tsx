import { PRICE_IMPACT_WATCH_BPS, SIMULATION_MAX_IMPACT_BPS, type LabRunResult } from "@elf/shared";
import { formatUsd } from "@/lib/utils";

/**
 * Charts drawn ONLY from a simulation result. They are deliberately unlike the
 * live-market charts: dashed frame, hatched field, amber accents and a
 * permanent SIMULATED tag, so a simulated series can never pass for live data.
 * Nothing here interpolates or invents points — one mark per simulated trade.
 */
const W = 320;
const H = 170;
const PAD = { l: 58, r: 12, t: 22, b: 34 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

const sizeLabel = (usd: number) => `$${usd >= 1000 ? `${usd / 1000}k` : usd}`;
const isUnfillable = (bps: number) => bps >= SIMULATION_MAX_IMPACT_BPS;

function Frame({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <figure className="border border-dashed border-warning/40 bg-surface-elevated/60">
      <figcaption className="flex items-center justify-between px-3 pt-2.5 text-[10px] uppercase tracking-[0.15em]">
        <span className="text-muted-foreground">{title}</span>
        <span className="text-warning">SIMULATED</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} (simulated)`} className="block h-auto w-full">
        <defs>
          <pattern id={`hatch-${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--warning)" strokeOpacity="0.09" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x={PAD.l} y={PAD.t} width={PLOT_W} height={PLOT_H} fill={`url(#hatch-${id})`} />
        {children}
      </svg>
    </figure>
  );
}

const axisText = { fill: "var(--muted-foreground)", fontSize: 8.5, fontFamily: "var(--font-mono-terminal), monospace" } as const;

export function LabCharts({ run, children }: { run: LabRunResult; children?: React.ReactNode }) {
  const { trades, startPriceUsd } = run.result;
  const slot = PLOT_W / trades.length;
  const cx = (i: number) => PAD.l + slot * i + slot / 2;

  // --- price by trade ---
  const filled = trades.filter((t) => !isUnfillable(t.estimatedPriceImpactBps));
  const prices = [...filled.flatMap((t) => [t.estimatedExecutionPrice, t.postTradePrice]), ...(startPriceUsd === undefined ? [] : [startPriceUsd])];
  const pMin = Math.min(...prices);
  const pMax = Math.max(...prices);
  const pSpan = pMax - pMin || Math.max(pMax, 1e-9) * 0.1;
  const py = (v: number) => PAD.t + PLOT_H - ((v - (pMin - pSpan * 0.15)) / (pSpan * 1.3)) * PLOT_H;

  // --- impact ---
  const impactMax = Math.max(PRICE_IMPACT_WATCH_BPS, ...filled.map((t) => t.estimatedPriceImpactBps)) * 1.15;
  const iy = (bps: number) => PAD.t + PLOT_H - (bps / impactMax) * PLOT_H;

  // --- reserve vs threshold ---
  const graduation = run.graduation;
  const reserveRows =
    graduation === null
      ? null
      : [
          { label: "start", pct: (graduation.startQuoteReserveUsd / graduation.migrationThresholdUsd) * 100 },
          ...graduation.trades.map((t) => ({ label: `${t.side} ${sizeLabel(t.tradeSizeUsd)}`, pct: t.reserveAfterUsd === null ? null : (t.reserveAfterUsd / graduation.migrationThresholdUsd) * 100 })),
        ];
  const reserveMax = reserveRows ? Math.max(100, ...reserveRows.map((r) => r.pct ?? 0)) * 1.05 : 100;
  const rowH = PLOT_H / (reserveRows?.length ?? 1);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Frame title="Price by trade" id="price">
        {startPriceUsd !== undefined && filled.length > 0 ? (
          <>
            <line x1={PAD.l} x2={PAD.l + PLOT_W} y1={py(startPriceUsd)} y2={py(startPriceUsd)} stroke="var(--warning)" strokeDasharray="3 3" strokeOpacity="0.7" />
            <text x={PAD.l + PLOT_W} y={py(startPriceUsd) - 3} textAnchor="end" {...axisText}>
              start {formatUsd(startPriceUsd)}
            </text>
            {trades.map((t, i) =>
              isUnfillable(t.estimatedPriceImpactBps) ? (
                <text key={i} x={cx(i)} y={PAD.t + PLOT_H / 2} textAnchor="middle" {...axisText}>
                  unfillable
                </text>
              ) : (
                <g key={i}>
                  <line x1={cx(i)} x2={cx(i)} y1={py(t.estimatedExecutionPrice)} y2={py(t.postTradePrice)} stroke="var(--muted-foreground)" strokeOpacity="0.5" />
                  <circle cx={cx(i)} cy={py(t.estimatedExecutionPrice)} r="3" fill="none" stroke="var(--foreground)" />
                  <rect x={cx(i) - 3} y={py(t.postTradePrice) - 3} width="6" height="6" transform={`rotate(45 ${cx(i)} ${py(t.postTradePrice)})`} fill="var(--warning)" />
                </g>
              ),
            )}
            <text x={PAD.l - 4} y={py(pMax)} textAnchor="end" {...axisText}>
              {formatUsd(pMax)}
            </text>
            <text x={PAD.l - 4} y={py(pMin)} textAnchor="end" {...axisText}>
              {formatUsd(pMin)}
            </text>
          </>
        ) : (
          <text x={PAD.l + PLOT_W / 2} y={PAD.t + PLOT_H / 2} textAnchor="middle" {...axisText}>
            No filled trades to plot
          </text>
        )}
        {trades.map((t, i) => (
          <text key={i} x={cx(i)} y={H - 18} textAnchor="middle" {...axisText}>
            {t.side} {sizeLabel(t.tradeSizeUsd)}
          </text>
        ))}
        <text x={PAD.l} y={H - 5} {...axisText}>
          ○ execution price ◆ post-trade price
        </text>
      </Frame>

      <Frame title="Price impact by trade (bps)" id="impact">
        <line x1={PAD.l} x2={PAD.l + PLOT_W} y1={iy(PRICE_IMPACT_WATCH_BPS)} y2={iy(PRICE_IMPACT_WATCH_BPS)} stroke="var(--warning)" strokeDasharray="3 3" strokeOpacity="0.7" />
        <text x={PAD.l + 3} y={iy(PRICE_IMPACT_WATCH_BPS) - 3} {...axisText}>
          cutoff {PRICE_IMPACT_WATCH_BPS} bps
        </text>
        {trades.map((t, i) => {
          const unfillable = isUnfillable(t.estimatedPriceImpactBps);
          const h = unfillable ? PLOT_H : PAD.t + PLOT_H - iy(t.estimatedPriceImpactBps);
          return (
            <g key={i}>
              <rect
                x={cx(i) - 14}
                y={PAD.t + PLOT_H - h}
                width="28"
                height={Math.max(h, 1)}
                fill={unfillable ? "none" : t.estimatedPriceImpactBps >= PRICE_IMPACT_WATCH_BPS ? "var(--warning)" : "var(--muted-foreground)"}
                fillOpacity={unfillable ? 0 : 0.55}
                stroke={unfillable ? "var(--negative)" : "none"}
                strokeDasharray={unfillable ? "3 2" : undefined}
              />
              <text x={cx(i)} y={PAD.t + PLOT_H - h - 3} textAnchor="middle" {...axisText}>
                {unfillable ? "n/a" : Math.round(t.estimatedPriceImpactBps)}
              </text>
              <text x={cx(i)} y={H - 18} textAnchor="middle" {...axisText}>
                {t.side} {sizeLabel(t.tradeSizeUsd)}
              </text>
            </g>
          );
        })}
        <text x={PAD.l} y={H - 5} {...axisText}>
          dashed red = could not be filled
        </text>
      </Frame>

      <div>
        <Frame title="Quote reserve vs migration threshold" id="reserve">
          {reserveRows && graduation ? (
            <>
              {reserveRows.map((r, i) => {
                const y = PAD.t + rowH * i;
                const w = r.pct === null ? 0 : (Math.min(r.pct, reserveMax) / reserveMax) * PLOT_W;
                return (
                  <g key={i}>
                    <text x={PAD.l - 4} y={y + rowH / 2 + 3} textAnchor="end" {...axisText}>
                      {r.label}
                    </text>
                    <rect x={PAD.l} y={y + 3} width={Math.max(w, r.pct === null ? 0 : 1)} height={Math.max(rowH - 6, 2)} fill={r.pct !== null && r.pct >= 100 ? "var(--positive)" : "var(--muted-foreground)"} fillOpacity="0.55" />
                    <text x={PAD.l + w + 4} y={y + rowH / 2 + 3} {...axisText}>
                      {r.pct === null ? "unfillable" : `${+r.pct.toFixed(1)}%`}
                    </text>
                  </g>
                );
              })}
              <line x1={PAD.l + (100 / reserveMax) * PLOT_W} x2={PAD.l + (100 / reserveMax) * PLOT_W} y1={PAD.t} y2={PAD.t + PLOT_H} stroke="var(--warning)" strokeDasharray="3 3" />
              <text x={PAD.l + (100 / reserveMax) * PLOT_W} y={PAD.t - 6} textAnchor="end" {...axisText}>
                threshold {formatUsd(graduation.migrationThresholdUsd, { compact: true })}
              </text>
            </>
          ) : (
            <text x={PAD.l + PLOT_W / 2} y={PAD.t + PLOT_H / 2} textAnchor="middle" {...axisText}>
              Reserve data unavailable for this result
            </text>
          )}
          <text x={PAD.l} y={H - 5} {...axisText}>
            share of the real DBC migration threshold — each trade quoted from the start position
          </text>
        </Frame>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
