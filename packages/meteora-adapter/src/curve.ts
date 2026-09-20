import {
  ActivationType,
  BaseFeeMode,
  CollectFeeMode,
  MigrationFeeOption,
  MigrationOption,
  TokenAuthorityOption,
  TokenDecimal,
  TokenType,
  buildCurveWithMarketCap,
  type BuildCurveWithMarketCapParams,
  type ConfigParameters,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import type { CurveCandidate, MarketProfile } from "@elf/shared";
import { getQuoteUsdPrice } from "./pricing";

const MIGRATION_FEE_BPS_TO_OPTION: Record<number, MigrationFeeOption> = {
  25: MigrationFeeOption.FixedBps25,
  30: MigrationFeeOption.FixedBps30,
  100: MigrationFeeOption.FixedBps100,
  200: MigrationFeeOption.FixedBps200,
  400: MigrationFeeOption.FixedBps400,
  600: MigrationFeeOption.FixedBps600,
};

function resolveMigrationFeeOption(bps: number): MigrationFeeOption {
  const option = MIGRATION_FEE_BPS_TO_OPTION[bps];
  if (option === undefined) {
    throw new Error(`Unsupported migration fee tier: ${bps} bps is not one of Meteora's fixed options.`);
  }
  return option;
}

/**
 * Translates ELF's own candidate/profile domain model into the exact
 * params shape `buildCurveWithMarketCap` expects. This is the ONLY place
 * in the codebase that maps ELF semantics onto Meteora SDK enums — every
 * other package works with @elf/shared types only.
 */
/**
 * Fraction of the total supply the curve deliberately leaves unallocated
 * (`leftover`, withdrawable by the config's leftoverReceiver after migration).
 *
 * The SDK sizes the curve to fill the supply exactly, i.e. swap-with-buffer +
 * migration amounts equal `preMigrationTokenSupply` with zero slack. The deployed
 * DBC program computes that minimum slightly higher (verified on devnet by
 * simulating createConfig: `leftover = 0` is rejected with InvalidTokenSupply
 * (6020) at every supply from 1M to 2B tokens, for both deployable candidates;
 * 1e-9 of the supply passes everywhere tested). One part per billion is ~1000x
 * the observed shortfall and far below anything a holder could notice.
 */
export const SUPPLY_LEFTOVER_FRACTION = 1e-9;

export function supplyLeftoverTokens(totalTokenSupply: number): number {
  return Number((totalTokenSupply * SUPPLY_LEFTOVER_FRACTION).toFixed(9));
}

export async function candidateToBuildCurveParams(
  candidate: CurveCandidate,
  profile: MarketProfile,
): Promise<BuildCurveWithMarketCapParams> {
  const quoteUsdPrice = await getQuoteUsdPrice(profile.quoteToken);
  const tokenQuoteDecimal = profile.quoteToken === "SOL" ? TokenDecimal.NINE : TokenDecimal.SIX;

  return {
    token: {
      tokenType: TokenType.SPLToken,
      tokenBaseDecimal: TokenDecimal.NINE,
      tokenQuoteDecimal,
      tokenAuthorityOption: TokenAuthorityOption.Immutable,
      totalTokenSupply: candidate.tokenSupply,
      leftover: supplyLeftoverTokens(candidate.tokenSupply),
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
        feeSchedulerParam: {
          startingFeeBps: candidate.feeSchedule.startingFeeBps,
          endingFeeBps: candidate.feeSchedule.endingFeeBps,
          numberOfPeriod: candidate.feeSchedule.numberOfPeriods,
          totalDuration: candidate.feeSchedule.totalDurationSeconds,
        },
      },
      dynamicFeeEnabled: candidate.feeSchedule.dynamicFeeEnabled,
      collectFeeMode: CollectFeeMode.QuoteToken,
      creatorTradingFeePercentage: 100,
      poolCreationFee: 0,
      enableFirstSwapWithMinFee: true,
    },
    migration: {
      migrationOption: MigrationOption.MET_DAMM_V2,
      migrationFeeOption: resolveMigrationFeeOption(candidate.migration.migrationFeeOptionBps),
      migrationFee: {
        feePercentage: candidate.migration.migrationFeeOptionBps / 100,
        creatorFeePercentage: 100,
      },
    },
    liquidityDistribution: {
      partnerPermanentLockedLiquidityPercentage: candidate.liquidityDistribution.partnerPermanentLockedLiquidityPercentage,
      partnerLiquidityPercentage: candidate.liquidityDistribution.partnerLiquidityPercentage,
      creatorPermanentLockedLiquidityPercentage: candidate.liquidityDistribution.creatorPermanentLockedLiquidityPercentage,
      creatorLiquidityPercentage: candidate.liquidityDistribution.creatorLiquidityPercentage,
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: ActivationType.Slot,
    initialMarketCap: candidate.initialMarketCapUsd / quoteUsdPrice,
    migrationMarketCap: candidate.migrationMarketCapUsd / quoteUsdPrice,
  };
}

/**
 * Pure, offline curve math — no RPC call. Produces the exact
 * `ConfigParameters` that will later be sent on-chain via
 * `partner.createConfig`, so the config-review screen can display the
 * real derived curve before any transaction is built.
 */
export async function buildConfigParametersFromCandidate(
  candidate: CurveCandidate,
  profile: MarketProfile,
): Promise<ConfigParameters> {
  const params = await candidateToBuildCurveParams(candidate, profile);
  return buildCurveWithMarketCap(params);
}
