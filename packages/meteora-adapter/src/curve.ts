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
      leftover: 0,
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
