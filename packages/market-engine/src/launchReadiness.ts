import type { LaunchPlan } from "@elf/shared";

/**
 * Launch readiness: a report over REAL current app state (network, wallet, plan, deployment) — never a signature,
 * never a submission. It is a pure function of plain data, so it cannot touch a wallet or the network; the UI panel
 * that gathers the inputs is read-only too. The flow stays: Copilot -> plan -> user review -> wallet approval ->
 * HTTP-polling confirmation. This report only says whether that flow is ready to start.
 */

/**
 * ELF-defined conservative minimum of native SOL for the deployer wallet: account rent for the config, pool, vaults
 * and metadata plus transaction fees. It is a safety margin chosen by ELF, not a protocol constant — the wallet
 * approval step still shows the exact fee of each transaction.
 */
export const MIN_DEPLOYMENT_SOL = 0.05;

export type ReadinessStatus = "pass" | "fail" | "warn" | "unavailable";

export interface ReadinessItem {
  id: "network" | "wallet" | "asset" | "curve" | "simulation" | "meteora" | "security" | "deployment";
  label: string;
  status: ReadinessStatus;
  /** "measured" = read from live state just now; "design" = a property of ELF's architecture, not measured here. */
  basis: "measured" | "design";
  detail: string;
}

export interface LaunchReadinessInput {
  network: {
    configuredCluster: string;
    /** The cluster the ELF server reports; null when it could not be read. */
    serverCluster: string | null;
    /** The server's own genesis-hash check of its RPC; null when unknown. */
    serverClusterVerified: boolean | null;
    walletAssessment: "compatible" | "unverifiable" | "mismatch" | null;
    walletMessage: string | null;
  };
  wallet: { connected: boolean; solBalance: number | null; balanceProblem: "rate_limited" | "unavailable" | null };
  plan: LaunchPlan | null;
  deployment: { state: "none" | "in_progress" | "deployed" | "unknown"; poolAddress?: string | null };
  minSol?: number;
}

export interface LaunchReadiness {
  items: ReadinessItem[];
  ready: boolean;
  action: string;
}

const item = (id: ReadinessItem["id"], label: string, status: ReadinessStatus, detail: string, basis: ReadinessItem["basis"] = "measured"): ReadinessItem => ({ id, label, status, basis, detail });

function networkItem(n: LaunchReadinessInput["network"]): ReadinessItem {
  if (n.serverCluster === null) return item("network", "Network", "unavailable", "ELF's server did not report its network, so it could not be compared with the browser.");
  if (n.serverCluster !== n.configuredCluster) {
    return item("network", "Network", "fail", `The server is on ${n.serverCluster} but the browser is configured for ${n.configuredCluster}. Both must use the same cluster.`);
  }
  if (n.serverClusterVerified === false) return item("network", "Network", "fail", "The server's RPC endpoint failed its genesis-hash check for this cluster.");
  if (n.serverClusterVerified === null) return item("network", "Network", "warn", `Server and browser both target ${n.configuredCluster}; the genesis-hash check could not run.`);
  return item("network", "Network", "pass", `Server and browser both target ${n.configuredCluster}, and the server's RPC passed its genesis-hash check.`);
}

function walletItem(input: LaunchReadinessInput, minSol: number): ReadinessItem {
  const { wallet, network } = input;
  if (!wallet.connected) return item("wallet", "Wallet", "fail", "No wallet is connected.");
  if (network.walletAssessment === "mismatch") return item("wallet", "Wallet", "fail", network.walletMessage ?? `The wallet is not on ${network.configuredCluster}.`);
  if (wallet.solBalance === null) {
    return item("wallet", "Wallet", "unavailable", wallet.balanceProblem === "rate_limited" ? "Connected, but the RPC is rate-limiting the SOL balance read." : "Connected, but the SOL balance could not be read.");
  }
  if (wallet.solBalance < minSol) {
    return item("wallet", "Wallet", "fail", `Connected, but holds ${wallet.solBalance} SOL; ELF requires at least ${minSol} SOL for rent and fees.`);
  }
  const networkNote = network.walletAssessment === "compatible" ? "wallet network verified" : "wallet network could not be verified by ELF";
  return item("wallet", "Wallet", network.walletAssessment === "compatible" ? "pass" : "warn", `Connected, ${networkNote}, ${wallet.solBalance} SOL (minimum ${minSol}).`);
}

function checkStatus(plan: LaunchPlan, ids: string[]): { status: ReadinessStatus; detail: string } {
  const checks = plan.checks.filter((c) => ids.includes(c.id));
  const failed = checks.find((c) => c.status === "fail");
  if (failed) return { status: "fail", detail: failed.detail };
  const missing = checks.find((c) => c.status === "unavailable" || c.status === "not_run");
  if (missing) return { status: "unavailable", detail: missing.detail };
  return { status: "pass", detail: checks.map((c) => c.detail).join(" ") };
}

export function evaluateLaunchReadiness(input: LaunchReadinessInput): LaunchReadiness {
  const { plan } = input;
  const minSol = input.minSol ?? MIN_DEPLOYMENT_SOL;
  const items: ReadinessItem[] = [networkItem(input.network), walletItem(input, minSol)];

  if (!plan) {
    for (const [id, label] of [["asset", "Asset"], ["curve", "Curve"], ["simulation", "Simulation"], ["meteora", "Meteora config"]] as const) {
      items.push(item(id, label, "unavailable", "No launch plan has been assembled yet."));
    }
  } else {
    items.push(
      plan.asset.symbol && plan.asset.referencePriceUsd > 0
        ? item("asset", "Asset", "pass", `${plan.asset.symbol} selected, reference price $${plan.asset.referencePriceUsd} (${plan.asset.source}).`)
        : item("asset", "Asset", "fail", "The selected asset has no usable reference price."),
    );

    const curve = checkStatus(plan, ["curve_parameters", "liquidity_parameters"]);
    items.push(
      Number.isFinite(plan.curve.impliedStartPriceUsd) && plan.curve.impliedStartPriceUsd > 0
        ? item("curve", "Curve", curve.status, curve.status === "pass" ? `${plan.curve.label}: starts at $${plan.curve.impliedStartPriceUsd}, graduates at a $${plan.graduation.declaredTargetUsd} target.` : curve.detail)
        : item("curve", "Curve", "fail", "The compiled curve has no valid starting price."),
    );

    const sim = plan.simulation;
    if (sim.status === "not_run") items.push(item("simulation", "Simulation", "fail", "Not run yet. Simulation — no blockchain transaction is executed."));
    else if (sim.status === "invalid") items.push(item("simulation", "Simulation", "fail", `The simulation was invalid: ${sim.reasons.join("; ")}`));
    else {
      const capped = sim.scenarios.filter((s) => s.unfillableTrades > 0);
      items.push(
        capped.length > 0
          ? item("simulation", "Simulation", "warn", `Completed (${sim.scenarios.length} scenarios); ${capped.length} hit the price-impact cap, meaning some simulated trades could not be filled. Simulation — no blockchain transaction is executed.`)
          : item("simulation", "Simulation", "pass", `Completed across ${sim.scenarios.length} scenarios with no unfillable trades. Simulation — no blockchain transaction is executed.`),
      );
    }

    const meteora = checkStatus(plan, ["configuration", "graduation_configuration"]);
    items.push(item("meteora", "Meteora config", meteora.status, meteora.status === "pass" ? "Meteora's own SDK validated the compiled configuration." : meteora.detail));
  }

  items.push(
    item(
      "security",
      "Security",
      "pass",
      "Deployment needs a wallet-signed ownership proof, every step re-verifies on-chain state (idempotent), the server never holds your wallet key, and nothing is sent without your wallet approval.",
      "design",
    ),
  );

  const d = input.deployment;
  items.push(
    d.state === "deployed"
      ? item("deployment", "Deployment", "fail", `This configuration is already deployed${d.poolAddress ? ` (pool ${d.poolAddress})` : ""}.`)
      : d.state === "in_progress"
        ? item("deployment", "Deployment", "warn", "A deployment of this configuration is already in progress; continuing resumes it without repeating confirmed steps.")
        : d.state === "unknown"
          ? item("deployment", "Deployment", "unavailable", "The existing deployment state could not be read.")
          : item("deployment", "Deployment", "pass", "No existing deployment found for this configuration."),
  );

  const blocking = items.find((i) => i.status === "fail") ?? items.find((i) => i.status === "unavailable");
  const ready = !blocking;
  return { items, ready, action: ready ? "Ready for wallet approval" : `Not ready — ${blocking.label}: ${blocking.detail}` };
}
