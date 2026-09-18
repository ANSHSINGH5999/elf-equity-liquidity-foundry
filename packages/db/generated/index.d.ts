
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Asset
 * 
 */
export type Asset = $Result.DefaultSelection<Prisma.$AssetPayload>
/**
 * Model MarketProfile
 * 
 */
export type MarketProfile = $Result.DefaultSelection<Prisma.$MarketProfilePayload>
/**
 * Model CurveConfig
 * 
 */
export type CurveConfig = $Result.DefaultSelection<Prisma.$CurveConfigPayload>
/**
 * Model SimulationRun
 * 
 */
export type SimulationRun = $Result.DefaultSelection<Prisma.$SimulationRunPayload>
/**
 * Model Launch
 * A Launch IS the "Market" entity conceptually described in the ELF V1
 * spec — `Launch.id` is used as `marketId` everywhere in the new
 * Trade/PriceHistory/LiquidityHistory/GraduationEvent tables, rather
 * than introducing a redundant parallel Market table (decision recorded
 * in docs/production-readiness.md).
 */
export type Launch = $Result.DefaultSelection<Prisma.$LaunchPayload>
/**
 * Model Pool
 * 
 */
export type Pool = $Result.DefaultSelection<Prisma.$PoolPayload>
/**
 * Model MarketSnapshot
 * 
 */
export type MarketSnapshot = $Result.DefaultSelection<Prisma.$MarketSnapshotPayload>
/**
 * Model Trade
 * One row per real on-chain swap, decoded from the DBC program's own
 * EvtSwap/EvtSwap2 Anchor events (packages/indexer) — never fabricated
 * or estimated. `marketId` is a Launch.id (see the note on Launch).
 */
export type Trade = $Result.DefaultSelection<Prisma.$TradePayload>
/**
 * Model PriceHistory
 * Derived from indexed Trade rows (source = "indexed_trade") or, before
 * the indexer has caught up, from a polled analytics read (source =
 * "snapshot"). `source` must always be checked before treating a row as
 * a confirmed trade price.
 */
export type PriceHistory = $Result.DefaultSelection<Prisma.$PriceHistoryPayload>
/**
 * Model LiquidityHistory
 * 
 */
export type LiquidityHistory = $Result.DefaultSelection<Prisma.$LiquidityHistoryPayload>
/**
 * Model GraduationEvent
 * Decoded from the DBC program's real EvtCurveComplete event — fires
 * when a pool's curve reaches its migration threshold. `finalState`
 * stores the event's own base/quote reserve figures; this is NOT the
 * same as the separate DAMM v2 migration transaction itself.
 */
export type GraduationEvent = $Result.DefaultSelection<Prisma.$GraduationEventPayload>
/**
 * Model IndexerCursor
 * Per-pool watermark so the indexer only fetches new signatures on each
 * run. One row per indexed pool address.
 */
export type IndexerCursor = $Result.DefaultSelection<Prisma.$IndexerCursorPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const AssetType: {
  equity: 'equity',
  pre_ipo: 'pre_ipo',
  fund: 'fund',
  other: 'other'
};

export type AssetType = (typeof AssetType)[keyof typeof AssetType]


export const AssetSource: {
  manual: 'manual',
  prestocks: 'prestocks',
  tessera: 'tessera'
};

export type AssetSource = (typeof AssetSource)[keyof typeof AssetSource]


export const RiskProfile: {
  conservative: 'conservative',
  balanced: 'balanced',
  growth: 'growth'
};

export type RiskProfile = (typeof RiskProfile)[keyof typeof RiskProfile]


export const QuoteToken: {
  SOL: 'SOL',
  USDC: 'USDC'
};

export type QuoteToken = (typeof QuoteToken)[keyof typeof QuoteToken]


export const PoolStatus: {
  not_deployed: 'not_deployed',
  pending_deployment: 'pending_deployment',
  live: 'live',
  near_graduation: 'near_graduation',
  graduated: 'graduated'
};

export type PoolStatus = (typeof PoolStatus)[keyof typeof PoolStatus]


export const MarketRegime: {
  discovery: 'discovery',
  healthy: 'healthy',
  mature: 'mature',
  stressed: 'stressed',
  recovery: 'recovery'
};

export type MarketRegime = (typeof MarketRegime)[keyof typeof MarketRegime]


export const LaunchStage: {
  DRAFT: 'DRAFT',
  CONFIGURED: 'CONFIGURED',
  AWAITING_CONFIG_SIGNATURE: 'AWAITING_CONFIG_SIGNATURE',
  CONFIG_CREATED: 'CONFIG_CREATED',
  AWAITING_POOL_SIGNATURE: 'AWAITING_POOL_SIGNATURE',
  POOL_CREATED: 'POOL_CREATED',
  LIVE: 'LIVE',
  GRADUATED: 'GRADUATED',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED'
};

export type LaunchStage = (typeof LaunchStage)[keyof typeof LaunchStage]


export const TradeSide: {
  buy: 'buy',
  sell: 'sell'
};

export type TradeSide = (typeof TradeSide)[keyof typeof TradeSide]

}

export type AssetType = $Enums.AssetType

export const AssetType: typeof $Enums.AssetType

export type AssetSource = $Enums.AssetSource

export const AssetSource: typeof $Enums.AssetSource

export type RiskProfile = $Enums.RiskProfile

export const RiskProfile: typeof $Enums.RiskProfile

export type QuoteToken = $Enums.QuoteToken

export const QuoteToken: typeof $Enums.QuoteToken

export type PoolStatus = $Enums.PoolStatus

export const PoolStatus: typeof $Enums.PoolStatus

export type MarketRegime = $Enums.MarketRegime

export const MarketRegime: typeof $Enums.MarketRegime

export type LaunchStage = $Enums.LaunchStage

export const LaunchStage: typeof $Enums.LaunchStage

export type TradeSide = $Enums.TradeSide

export const TradeSide: typeof $Enums.TradeSide

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Assets
 * const assets = await prisma.asset.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Assets
   * const assets = await prisma.asset.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.asset`: Exposes CRUD operations for the **Asset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assets
    * const assets = await prisma.asset.findMany()
    * ```
    */
  get asset(): Prisma.AssetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.marketProfile`: Exposes CRUD operations for the **MarketProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketProfiles
    * const marketProfiles = await prisma.marketProfile.findMany()
    * ```
    */
  get marketProfile(): Prisma.MarketProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.curveConfig`: Exposes CRUD operations for the **CurveConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CurveConfigs
    * const curveConfigs = await prisma.curveConfig.findMany()
    * ```
    */
  get curveConfig(): Prisma.CurveConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.simulationRun`: Exposes CRUD operations for the **SimulationRun** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SimulationRuns
    * const simulationRuns = await prisma.simulationRun.findMany()
    * ```
    */
  get simulationRun(): Prisma.SimulationRunDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.launch`: Exposes CRUD operations for the **Launch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Launches
    * const launches = await prisma.launch.findMany()
    * ```
    */
  get launch(): Prisma.LaunchDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pool`: Exposes CRUD operations for the **Pool** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pools
    * const pools = await prisma.pool.findMany()
    * ```
    */
  get pool(): Prisma.PoolDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.marketSnapshot`: Exposes CRUD operations for the **MarketSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketSnapshots
    * const marketSnapshots = await prisma.marketSnapshot.findMany()
    * ```
    */
  get marketSnapshot(): Prisma.MarketSnapshotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trade`: Exposes CRUD operations for the **Trade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trades
    * const trades = await prisma.trade.findMany()
    * ```
    */
  get trade(): Prisma.TradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.priceHistory`: Exposes CRUD operations for the **PriceHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PriceHistories
    * const priceHistories = await prisma.priceHistory.findMany()
    * ```
    */
  get priceHistory(): Prisma.PriceHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.liquidityHistory`: Exposes CRUD operations for the **LiquidityHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LiquidityHistories
    * const liquidityHistories = await prisma.liquidityHistory.findMany()
    * ```
    */
  get liquidityHistory(): Prisma.LiquidityHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.graduationEvent`: Exposes CRUD operations for the **GraduationEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GraduationEvents
    * const graduationEvents = await prisma.graduationEvent.findMany()
    * ```
    */
  get graduationEvent(): Prisma.GraduationEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.indexerCursor`: Exposes CRUD operations for the **IndexerCursor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IndexerCursors
    * const indexerCursors = await prisma.indexerCursor.findMany()
    * ```
    */
  get indexerCursor(): Prisma.IndexerCursorDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Asset: 'Asset',
    MarketProfile: 'MarketProfile',
    CurveConfig: 'CurveConfig',
    SimulationRun: 'SimulationRun',
    Launch: 'Launch',
    Pool: 'Pool',
    MarketSnapshot: 'MarketSnapshot',
    Trade: 'Trade',
    PriceHistory: 'PriceHistory',
    LiquidityHistory: 'LiquidityHistory',
    GraduationEvent: 'GraduationEvent',
    IndexerCursor: 'IndexerCursor'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "asset" | "marketProfile" | "curveConfig" | "simulationRun" | "launch" | "pool" | "marketSnapshot" | "trade" | "priceHistory" | "liquidityHistory" | "graduationEvent" | "indexerCursor"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Asset: {
        payload: Prisma.$AssetPayload<ExtArgs>
        fields: Prisma.AssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findFirst: {
            args: Prisma.AssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findMany: {
            args: Prisma.AssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          create: {
            args: Prisma.AssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          createMany: {
            args: Prisma.AssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          delete: {
            args: Prisma.AssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          update: {
            args: Prisma.AssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          deleteMany: {
            args: Prisma.AssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AssetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          upsert: {
            args: Prisma.AssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          aggregate: {
            args: Prisma.AssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsset>
          }
          groupBy: {
            args: Prisma.AssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetCountArgs<ExtArgs>
            result: $Utils.Optional<AssetCountAggregateOutputType> | number
          }
        }
      }
      MarketProfile: {
        payload: Prisma.$MarketProfilePayload<ExtArgs>
        fields: Prisma.MarketProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarketProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarketProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          findFirst: {
            args: Prisma.MarketProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarketProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          findMany: {
            args: Prisma.MarketProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>[]
          }
          create: {
            args: Prisma.MarketProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          createMany: {
            args: Prisma.MarketProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MarketProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>[]
          }
          delete: {
            args: Prisma.MarketProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          update: {
            args: Prisma.MarketProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          deleteMany: {
            args: Prisma.MarketProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarketProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MarketProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>[]
          }
          upsert: {
            args: Prisma.MarketProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketProfilePayload>
          }
          aggregate: {
            args: Prisma.MarketProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarketProfile>
          }
          groupBy: {
            args: Prisma.MarketProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarketProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.MarketProfileCountArgs<ExtArgs>
            result: $Utils.Optional<MarketProfileCountAggregateOutputType> | number
          }
        }
      }
      CurveConfig: {
        payload: Prisma.$CurveConfigPayload<ExtArgs>
        fields: Prisma.CurveConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CurveConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CurveConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          findFirst: {
            args: Prisma.CurveConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CurveConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          findMany: {
            args: Prisma.CurveConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>[]
          }
          create: {
            args: Prisma.CurveConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          createMany: {
            args: Prisma.CurveConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CurveConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>[]
          }
          delete: {
            args: Prisma.CurveConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          update: {
            args: Prisma.CurveConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          deleteMany: {
            args: Prisma.CurveConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CurveConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CurveConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>[]
          }
          upsert: {
            args: Prisma.CurveConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CurveConfigPayload>
          }
          aggregate: {
            args: Prisma.CurveConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCurveConfig>
          }
          groupBy: {
            args: Prisma.CurveConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<CurveConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.CurveConfigCountArgs<ExtArgs>
            result: $Utils.Optional<CurveConfigCountAggregateOutputType> | number
          }
        }
      }
      SimulationRun: {
        payload: Prisma.$SimulationRunPayload<ExtArgs>
        fields: Prisma.SimulationRunFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SimulationRunFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SimulationRunFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          findFirst: {
            args: Prisma.SimulationRunFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SimulationRunFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          findMany: {
            args: Prisma.SimulationRunFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>[]
          }
          create: {
            args: Prisma.SimulationRunCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          createMany: {
            args: Prisma.SimulationRunCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SimulationRunCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>[]
          }
          delete: {
            args: Prisma.SimulationRunDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          update: {
            args: Prisma.SimulationRunUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          deleteMany: {
            args: Prisma.SimulationRunDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SimulationRunUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SimulationRunUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>[]
          }
          upsert: {
            args: Prisma.SimulationRunUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SimulationRunPayload>
          }
          aggregate: {
            args: Prisma.SimulationRunAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSimulationRun>
          }
          groupBy: {
            args: Prisma.SimulationRunGroupByArgs<ExtArgs>
            result: $Utils.Optional<SimulationRunGroupByOutputType>[]
          }
          count: {
            args: Prisma.SimulationRunCountArgs<ExtArgs>
            result: $Utils.Optional<SimulationRunCountAggregateOutputType> | number
          }
        }
      }
      Launch: {
        payload: Prisma.$LaunchPayload<ExtArgs>
        fields: Prisma.LaunchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LaunchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LaunchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          findFirst: {
            args: Prisma.LaunchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LaunchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          findMany: {
            args: Prisma.LaunchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>[]
          }
          create: {
            args: Prisma.LaunchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          createMany: {
            args: Prisma.LaunchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LaunchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>[]
          }
          delete: {
            args: Prisma.LaunchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          update: {
            args: Prisma.LaunchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          deleteMany: {
            args: Prisma.LaunchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LaunchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LaunchUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>[]
          }
          upsert: {
            args: Prisma.LaunchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LaunchPayload>
          }
          aggregate: {
            args: Prisma.LaunchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLaunch>
          }
          groupBy: {
            args: Prisma.LaunchGroupByArgs<ExtArgs>
            result: $Utils.Optional<LaunchGroupByOutputType>[]
          }
          count: {
            args: Prisma.LaunchCountArgs<ExtArgs>
            result: $Utils.Optional<LaunchCountAggregateOutputType> | number
          }
        }
      }
      Pool: {
        payload: Prisma.$PoolPayload<ExtArgs>
        fields: Prisma.PoolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PoolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PoolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          findFirst: {
            args: Prisma.PoolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PoolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          findMany: {
            args: Prisma.PoolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>[]
          }
          create: {
            args: Prisma.PoolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          createMany: {
            args: Prisma.PoolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PoolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>[]
          }
          delete: {
            args: Prisma.PoolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          update: {
            args: Prisma.PoolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          deleteMany: {
            args: Prisma.PoolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PoolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PoolUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>[]
          }
          upsert: {
            args: Prisma.PoolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          aggregate: {
            args: Prisma.PoolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePool>
          }
          groupBy: {
            args: Prisma.PoolGroupByArgs<ExtArgs>
            result: $Utils.Optional<PoolGroupByOutputType>[]
          }
          count: {
            args: Prisma.PoolCountArgs<ExtArgs>
            result: $Utils.Optional<PoolCountAggregateOutputType> | number
          }
        }
      }
      MarketSnapshot: {
        payload: Prisma.$MarketSnapshotPayload<ExtArgs>
        fields: Prisma.MarketSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarketSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarketSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          findFirst: {
            args: Prisma.MarketSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarketSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          findMany: {
            args: Prisma.MarketSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>[]
          }
          create: {
            args: Prisma.MarketSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          createMany: {
            args: Prisma.MarketSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MarketSnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>[]
          }
          delete: {
            args: Prisma.MarketSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          update: {
            args: Prisma.MarketSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.MarketSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarketSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MarketSnapshotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>[]
          }
          upsert: {
            args: Prisma.MarketSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketSnapshotPayload>
          }
          aggregate: {
            args: Prisma.MarketSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarketSnapshot>
          }
          groupBy: {
            args: Prisma.MarketSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarketSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.MarketSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<MarketSnapshotCountAggregateOutputType> | number
          }
        }
      }
      Trade: {
        payload: Prisma.$TradePayload<ExtArgs>
        fields: Prisma.TradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findFirst: {
            args: Prisma.TradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findMany: {
            args: Prisma.TradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          create: {
            args: Prisma.TradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          createMany: {
            args: Prisma.TradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TradeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          delete: {
            args: Prisma.TradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          update: {
            args: Prisma.TradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          deleteMany: {
            args: Prisma.TradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TradeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          upsert: {
            args: Prisma.TradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          aggregate: {
            args: Prisma.TradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrade>
          }
          groupBy: {
            args: Prisma.TradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<TradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.TradeCountArgs<ExtArgs>
            result: $Utils.Optional<TradeCountAggregateOutputType> | number
          }
        }
      }
      PriceHistory: {
        payload: Prisma.$PriceHistoryPayload<ExtArgs>
        fields: Prisma.PriceHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PriceHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PriceHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          findFirst: {
            args: Prisma.PriceHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PriceHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          findMany: {
            args: Prisma.PriceHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>[]
          }
          create: {
            args: Prisma.PriceHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          createMany: {
            args: Prisma.PriceHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PriceHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>[]
          }
          delete: {
            args: Prisma.PriceHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          update: {
            args: Prisma.PriceHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          deleteMany: {
            args: Prisma.PriceHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PriceHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PriceHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>[]
          }
          upsert: {
            args: Prisma.PriceHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PriceHistoryPayload>
          }
          aggregate: {
            args: Prisma.PriceHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePriceHistory>
          }
          groupBy: {
            args: Prisma.PriceHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<PriceHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.PriceHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<PriceHistoryCountAggregateOutputType> | number
          }
        }
      }
      LiquidityHistory: {
        payload: Prisma.$LiquidityHistoryPayload<ExtArgs>
        fields: Prisma.LiquidityHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LiquidityHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LiquidityHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          findFirst: {
            args: Prisma.LiquidityHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LiquidityHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          findMany: {
            args: Prisma.LiquidityHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>[]
          }
          create: {
            args: Prisma.LiquidityHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          createMany: {
            args: Prisma.LiquidityHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LiquidityHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>[]
          }
          delete: {
            args: Prisma.LiquidityHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          update: {
            args: Prisma.LiquidityHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          deleteMany: {
            args: Prisma.LiquidityHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LiquidityHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LiquidityHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>[]
          }
          upsert: {
            args: Prisma.LiquidityHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiquidityHistoryPayload>
          }
          aggregate: {
            args: Prisma.LiquidityHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLiquidityHistory>
          }
          groupBy: {
            args: Prisma.LiquidityHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LiquidityHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LiquidityHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<LiquidityHistoryCountAggregateOutputType> | number
          }
        }
      }
      GraduationEvent: {
        payload: Prisma.$GraduationEventPayload<ExtArgs>
        fields: Prisma.GraduationEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GraduationEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GraduationEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          findFirst: {
            args: Prisma.GraduationEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GraduationEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          findMany: {
            args: Prisma.GraduationEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>[]
          }
          create: {
            args: Prisma.GraduationEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          createMany: {
            args: Prisma.GraduationEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GraduationEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>[]
          }
          delete: {
            args: Prisma.GraduationEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          update: {
            args: Prisma.GraduationEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          deleteMany: {
            args: Prisma.GraduationEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GraduationEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GraduationEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>[]
          }
          upsert: {
            args: Prisma.GraduationEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GraduationEventPayload>
          }
          aggregate: {
            args: Prisma.GraduationEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGraduationEvent>
          }
          groupBy: {
            args: Prisma.GraduationEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<GraduationEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.GraduationEventCountArgs<ExtArgs>
            result: $Utils.Optional<GraduationEventCountAggregateOutputType> | number
          }
        }
      }
      IndexerCursor: {
        payload: Prisma.$IndexerCursorPayload<ExtArgs>
        fields: Prisma.IndexerCursorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IndexerCursorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IndexerCursorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          findFirst: {
            args: Prisma.IndexerCursorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IndexerCursorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          findMany: {
            args: Prisma.IndexerCursorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>[]
          }
          create: {
            args: Prisma.IndexerCursorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          createMany: {
            args: Prisma.IndexerCursorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IndexerCursorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>[]
          }
          delete: {
            args: Prisma.IndexerCursorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          update: {
            args: Prisma.IndexerCursorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          deleteMany: {
            args: Prisma.IndexerCursorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IndexerCursorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IndexerCursorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>[]
          }
          upsert: {
            args: Prisma.IndexerCursorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerCursorPayload>
          }
          aggregate: {
            args: Prisma.IndexerCursorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIndexerCursor>
          }
          groupBy: {
            args: Prisma.IndexerCursorGroupByArgs<ExtArgs>
            result: $Utils.Optional<IndexerCursorGroupByOutputType>[]
          }
          count: {
            args: Prisma.IndexerCursorCountArgs<ExtArgs>
            result: $Utils.Optional<IndexerCursorCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    asset?: AssetOmit
    marketProfile?: MarketProfileOmit
    curveConfig?: CurveConfigOmit
    simulationRun?: SimulationRunOmit
    launch?: LaunchOmit
    pool?: PoolOmit
    marketSnapshot?: MarketSnapshotOmit
    trade?: TradeOmit
    priceHistory?: PriceHistoryOmit
    liquidityHistory?: LiquidityHistoryOmit
    graduationEvent?: GraduationEventOmit
    indexerCursor?: IndexerCursorOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AssetCountOutputType
   */

  export type AssetCountOutputType = {
    marketProfiles: number
    curveConfigs: number
    launches: number
  }

  export type AssetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    marketProfiles?: boolean | AssetCountOutputTypeCountMarketProfilesArgs
    curveConfigs?: boolean | AssetCountOutputTypeCountCurveConfigsArgs
    launches?: boolean | AssetCountOutputTypeCountLaunchesArgs
  }

  // Custom InputTypes
  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCountOutputType
     */
    select?: AssetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountMarketProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketProfileWhereInput
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountCurveConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CurveConfigWhereInput
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountLaunchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LaunchWhereInput
  }


  /**
   * Count Type MarketProfileCountOutputType
   */

  export type MarketProfileCountOutputType = {
    curveConfigs: number
    launches: number
  }

  export type MarketProfileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    curveConfigs?: boolean | MarketProfileCountOutputTypeCountCurveConfigsArgs
    launches?: boolean | MarketProfileCountOutputTypeCountLaunchesArgs
  }

  // Custom InputTypes
  /**
   * MarketProfileCountOutputType without action
   */
  export type MarketProfileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfileCountOutputType
     */
    select?: MarketProfileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MarketProfileCountOutputType without action
   */
  export type MarketProfileCountOutputTypeCountCurveConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CurveConfigWhereInput
  }

  /**
   * MarketProfileCountOutputType without action
   */
  export type MarketProfileCountOutputTypeCountLaunchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LaunchWhereInput
  }


  /**
   * Count Type CurveConfigCountOutputType
   */

  export type CurveConfigCountOutputType = {
    simulationRuns: number
    launches: number
  }

  export type CurveConfigCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    simulationRuns?: boolean | CurveConfigCountOutputTypeCountSimulationRunsArgs
    launches?: boolean | CurveConfigCountOutputTypeCountLaunchesArgs
  }

  // Custom InputTypes
  /**
   * CurveConfigCountOutputType without action
   */
  export type CurveConfigCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfigCountOutputType
     */
    select?: CurveConfigCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CurveConfigCountOutputType without action
   */
  export type CurveConfigCountOutputTypeCountSimulationRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SimulationRunWhereInput
  }

  /**
   * CurveConfigCountOutputType without action
   */
  export type CurveConfigCountOutputTypeCountLaunchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LaunchWhereInput
  }


  /**
   * Count Type LaunchCountOutputType
   */

  export type LaunchCountOutputType = {
    trades: number
    priceHistory: number
    liquidityHistory: number
    graduationEvents: number
  }

  export type LaunchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trades?: boolean | LaunchCountOutputTypeCountTradesArgs
    priceHistory?: boolean | LaunchCountOutputTypeCountPriceHistoryArgs
    liquidityHistory?: boolean | LaunchCountOutputTypeCountLiquidityHistoryArgs
    graduationEvents?: boolean | LaunchCountOutputTypeCountGraduationEventsArgs
  }

  // Custom InputTypes
  /**
   * LaunchCountOutputType without action
   */
  export type LaunchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LaunchCountOutputType
     */
    select?: LaunchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LaunchCountOutputType without action
   */
  export type LaunchCountOutputTypeCountTradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
  }

  /**
   * LaunchCountOutputType without action
   */
  export type LaunchCountOutputTypeCountPriceHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceHistoryWhereInput
  }

  /**
   * LaunchCountOutputType without action
   */
  export type LaunchCountOutputTypeCountLiquidityHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LiquidityHistoryWhereInput
  }

  /**
   * LaunchCountOutputType without action
   */
  export type LaunchCountOutputTypeCountGraduationEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraduationEventWhereInput
  }


  /**
   * Count Type PoolCountOutputType
   */

  export type PoolCountOutputType = {
    snapshots: number
  }

  export type PoolCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    snapshots?: boolean | PoolCountOutputTypeCountSnapshotsArgs
  }

  // Custom InputTypes
  /**
   * PoolCountOutputType without action
   */
  export type PoolCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolCountOutputType
     */
    select?: PoolCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PoolCountOutputType without action
   */
  export type PoolCountOutputTypeCountSnapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketSnapshotWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Asset
   */

  export type AggregateAsset = {
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  export type AssetAvgAggregateOutputType = {
    referencePriceUsd: number | null
  }

  export type AssetSumAggregateOutputType = {
    referencePriceUsd: number | null
  }

  export type AssetMinAggregateOutputType = {
    id: string | null
    name: string | null
    symbol: string | null
    mintAddress: string | null
    issuer: string | null
    assetType: $Enums.AssetType | null
    referencePriceUsd: number | null
    source: $Enums.AssetSource | null
    externalId: string | null
    createdAt: Date | null
  }

  export type AssetMaxAggregateOutputType = {
    id: string | null
    name: string | null
    symbol: string | null
    mintAddress: string | null
    issuer: string | null
    assetType: $Enums.AssetType | null
    referencePriceUsd: number | null
    source: $Enums.AssetSource | null
    externalId: string | null
    createdAt: Date | null
  }

  export type AssetCountAggregateOutputType = {
    id: number
    name: number
    symbol: number
    mintAddress: number
    issuer: number
    assetType: number
    referencePriceUsd: number
    source: number
    externalId: number
    createdAt: number
    _all: number
  }


  export type AssetAvgAggregateInputType = {
    referencePriceUsd?: true
  }

  export type AssetSumAggregateInputType = {
    referencePriceUsd?: true
  }

  export type AssetMinAggregateInputType = {
    id?: true
    name?: true
    symbol?: true
    mintAddress?: true
    issuer?: true
    assetType?: true
    referencePriceUsd?: true
    source?: true
    externalId?: true
    createdAt?: true
  }

  export type AssetMaxAggregateInputType = {
    id?: true
    name?: true
    symbol?: true
    mintAddress?: true
    issuer?: true
    assetType?: true
    referencePriceUsd?: true
    source?: true
    externalId?: true
    createdAt?: true
  }

  export type AssetCountAggregateInputType = {
    id?: true
    name?: true
    symbol?: true
    mintAddress?: true
    issuer?: true
    assetType?: true
    referencePriceUsd?: true
    source?: true
    externalId?: true
    createdAt?: true
    _all?: true
  }

  export type AssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Asset to aggregate.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assets
    **/
    _count?: true | AssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetMaxAggregateInputType
  }

  export type GetAssetAggregateType<T extends AssetAggregateArgs> = {
        [P in keyof T & keyof AggregateAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsset[P]>
      : GetScalarType<T[P], AggregateAsset[P]>
  }




  export type AssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithAggregationInput | AssetOrderByWithAggregationInput[]
    by: AssetScalarFieldEnum[] | AssetScalarFieldEnum
    having?: AssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetCountAggregateInputType | true
    _avg?: AssetAvgAggregateInputType
    _sum?: AssetSumAggregateInputType
    _min?: AssetMinAggregateInputType
    _max?: AssetMaxAggregateInputType
  }

  export type AssetGroupByOutputType = {
    id: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId: string | null
    createdAt: Date
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  type GetAssetGroupByPayload<T extends AssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetGroupByOutputType[P]>
            : GetScalarType<T[P], AssetGroupByOutputType[P]>
        }
      >
    >


  export type AssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    symbol?: boolean
    mintAddress?: boolean
    issuer?: boolean
    assetType?: boolean
    referencePriceUsd?: boolean
    source?: boolean
    externalId?: boolean
    createdAt?: boolean
    marketProfiles?: boolean | Asset$marketProfilesArgs<ExtArgs>
    curveConfigs?: boolean | Asset$curveConfigsArgs<ExtArgs>
    launches?: boolean | Asset$launchesArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    symbol?: boolean
    mintAddress?: boolean
    issuer?: boolean
    assetType?: boolean
    referencePriceUsd?: boolean
    source?: boolean
    externalId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    symbol?: boolean
    mintAddress?: boolean
    issuer?: boolean
    assetType?: boolean
    referencePriceUsd?: boolean
    source?: boolean
    externalId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectScalar = {
    id?: boolean
    name?: boolean
    symbol?: boolean
    mintAddress?: boolean
    issuer?: boolean
    assetType?: boolean
    referencePriceUsd?: boolean
    source?: boolean
    externalId?: boolean
    createdAt?: boolean
  }

  export type AssetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "symbol" | "mintAddress" | "issuer" | "assetType" | "referencePriceUsd" | "source" | "externalId" | "createdAt", ExtArgs["result"]["asset"]>
  export type AssetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    marketProfiles?: boolean | Asset$marketProfilesArgs<ExtArgs>
    curveConfigs?: boolean | Asset$curveConfigsArgs<ExtArgs>
    launches?: boolean | Asset$launchesArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AssetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Asset"
    objects: {
      marketProfiles: Prisma.$MarketProfilePayload<ExtArgs>[]
      curveConfigs: Prisma.$CurveConfigPayload<ExtArgs>[]
      launches: Prisma.$LaunchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      symbol: string
      mintAddress: string
      issuer: string
      assetType: $Enums.AssetType
      referencePriceUsd: number
      source: $Enums.AssetSource
      externalId: string | null
      createdAt: Date
    }, ExtArgs["result"]["asset"]>
    composites: {}
  }

  type AssetGetPayload<S extends boolean | null | undefined | AssetDefaultArgs> = $Result.GetResult<Prisma.$AssetPayload, S>

  type AssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AssetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AssetCountAggregateInputType | true
    }

  export interface AssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Asset'], meta: { name: 'Asset' } }
    /**
     * Find zero or one Asset that matches the filter.
     * @param {AssetFindUniqueArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetFindUniqueArgs>(args: SelectSubset<T, AssetFindUniqueArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Asset that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AssetFindUniqueOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetFindFirstArgs>(args?: SelectSubset<T, AssetFindFirstArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Asset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Assets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assets
     * const assets = await prisma.asset.findMany()
     * 
     * // Get first 10 Assets
     * const assets = await prisma.asset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetWithIdOnly = await prisma.asset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetFindManyArgs>(args?: SelectSubset<T, AssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Asset.
     * @param {AssetCreateArgs} args - Arguments to create a Asset.
     * @example
     * // Create one Asset
     * const Asset = await prisma.asset.create({
     *   data: {
     *     // ... data to create a Asset
     *   }
     * })
     * 
     */
    create<T extends AssetCreateArgs>(args: SelectSubset<T, AssetCreateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Assets.
     * @param {AssetCreateManyArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetCreateManyArgs>(args?: SelectSubset<T, AssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assets and returns the data saved in the database.
     * @param {AssetCreateManyAndReturnArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Asset.
     * @param {AssetDeleteArgs} args - Arguments to delete one Asset.
     * @example
     * // Delete one Asset
     * const Asset = await prisma.asset.delete({
     *   where: {
     *     // ... filter to delete one Asset
     *   }
     * })
     * 
     */
    delete<T extends AssetDeleteArgs>(args: SelectSubset<T, AssetDeleteArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Asset.
     * @param {AssetUpdateArgs} args - Arguments to update one Asset.
     * @example
     * // Update one Asset
     * const asset = await prisma.asset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetUpdateArgs>(args: SelectSubset<T, AssetUpdateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Assets.
     * @param {AssetDeleteManyArgs} args - Arguments to filter Assets to delete.
     * @example
     * // Delete a few Assets
     * const { count } = await prisma.asset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetDeleteManyArgs>(args?: SelectSubset<T, AssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetUpdateManyArgs>(args: SelectSubset<T, AssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets and returns the data updated in the database.
     * @param {AssetUpdateManyAndReturnArgs} args - Arguments to update many Assets.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AssetUpdateManyAndReturnArgs>(args: SelectSubset<T, AssetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Asset.
     * @param {AssetUpsertArgs} args - Arguments to update or create a Asset.
     * @example
     * // Update or create a Asset
     * const asset = await prisma.asset.upsert({
     *   create: {
     *     // ... data to create a Asset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Asset we want to update
     *   }
     * })
     */
    upsert<T extends AssetUpsertArgs>(args: SelectSubset<T, AssetUpsertArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCountArgs} args - Arguments to filter Assets to count.
     * @example
     * // Count the number of Assets
     * const count = await prisma.asset.count({
     *   where: {
     *     // ... the filter for the Assets we want to count
     *   }
     * })
    **/
    count<T extends AssetCountArgs>(
      args?: Subset<T, AssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAggregateArgs>(args: Subset<T, AssetAggregateArgs>): Prisma.PrismaPromise<GetAssetAggregateType<T>>

    /**
     * Group by Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetGroupByArgs['orderBy'] }
        : { orderBy?: AssetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Asset model
   */
  readonly fields: AssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Asset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    marketProfiles<T extends Asset$marketProfilesArgs<ExtArgs> = {}>(args?: Subset<T, Asset$marketProfilesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    curveConfigs<T extends Asset$curveConfigsArgs<ExtArgs> = {}>(args?: Subset<T, Asset$curveConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    launches<T extends Asset$launchesArgs<ExtArgs> = {}>(args?: Subset<T, Asset$launchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Asset model
   */
  interface AssetFieldRefs {
    readonly id: FieldRef<"Asset", 'String'>
    readonly name: FieldRef<"Asset", 'String'>
    readonly symbol: FieldRef<"Asset", 'String'>
    readonly mintAddress: FieldRef<"Asset", 'String'>
    readonly issuer: FieldRef<"Asset", 'String'>
    readonly assetType: FieldRef<"Asset", 'AssetType'>
    readonly referencePriceUsd: FieldRef<"Asset", 'Float'>
    readonly source: FieldRef<"Asset", 'AssetSource'>
    readonly externalId: FieldRef<"Asset", 'String'>
    readonly createdAt: FieldRef<"Asset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Asset findUnique
   */
  export type AssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findUniqueOrThrow
   */
  export type AssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findFirst
   */
  export type AssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findFirstOrThrow
   */
  export type AssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findMany
   */
  export type AssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Assets to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset create
   */
  export type AssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to create a Asset.
     */
    data: XOR<AssetCreateInput, AssetUncheckedCreateInput>
  }

  /**
   * Asset createMany
   */
  export type AssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset createManyAndReturn
   */
  export type AssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset update
   */
  export type AssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to update a Asset.
     */
    data: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
    /**
     * Choose, which Asset to update.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset updateMany
   */
  export type AssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
  }

  /**
   * Asset updateManyAndReturn
   */
  export type AssetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to update.
     */
    limit?: number
  }

  /**
   * Asset upsert
   */
  export type AssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The filter to search for the Asset to update in case it exists.
     */
    where: AssetWhereUniqueInput
    /**
     * In case the Asset found by the `where` argument doesn't exist, create a new Asset with this data.
     */
    create: XOR<AssetCreateInput, AssetUncheckedCreateInput>
    /**
     * In case the Asset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
  }

  /**
   * Asset delete
   */
  export type AssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter which Asset to delete.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset deleteMany
   */
  export type AssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assets to delete
     */
    where?: AssetWhereInput
    /**
     * Limit how many Assets to delete.
     */
    limit?: number
  }

  /**
   * Asset.marketProfiles
   */
  export type Asset$marketProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    where?: MarketProfileWhereInput
    orderBy?: MarketProfileOrderByWithRelationInput | MarketProfileOrderByWithRelationInput[]
    cursor?: MarketProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MarketProfileScalarFieldEnum | MarketProfileScalarFieldEnum[]
  }

  /**
   * Asset.curveConfigs
   */
  export type Asset$curveConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    where?: CurveConfigWhereInput
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    cursor?: CurveConfigWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CurveConfigScalarFieldEnum | CurveConfigScalarFieldEnum[]
  }

  /**
   * Asset.launches
   */
  export type Asset$launchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    where?: LaunchWhereInput
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    cursor?: LaunchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * Asset without action
   */
  export type AssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Asset
     */
    omit?: AssetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
  }


  /**
   * Model MarketProfile
   */

  export type AggregateMarketProfile = {
    _count: MarketProfileCountAggregateOutputType | null
    _avg: MarketProfileAvgAggregateOutputType | null
    _sum: MarketProfileSumAggregateOutputType | null
    _min: MarketProfileMinAggregateOutputType | null
    _max: MarketProfileMaxAggregateOutputType | null
  }

  export type MarketProfileAvgAggregateOutputType = {
    initialLiquidityUsd: number | null
    targetLiquidityUsd: number | null
    targetGraduationUsd: number | null
  }

  export type MarketProfileSumAggregateOutputType = {
    initialLiquidityUsd: number | null
    targetLiquidityUsd: number | null
    targetGraduationUsd: number | null
  }

  export type MarketProfileMinAggregateOutputType = {
    id: string | null
    assetId: string | null
    initialLiquidityUsd: number | null
    expectedVolatility: string | null
    riskProfile: $Enums.RiskProfile | null
    targetLiquidityUsd: number | null
    targetGraduationUsd: number | null
    quoteToken: $Enums.QuoteToken | null
    createdAt: Date | null
  }

  export type MarketProfileMaxAggregateOutputType = {
    id: string | null
    assetId: string | null
    initialLiquidityUsd: number | null
    expectedVolatility: string | null
    riskProfile: $Enums.RiskProfile | null
    targetLiquidityUsd: number | null
    targetGraduationUsd: number | null
    quoteToken: $Enums.QuoteToken | null
    createdAt: Date | null
  }

  export type MarketProfileCountAggregateOutputType = {
    id: number
    assetId: number
    initialLiquidityUsd: number
    expectedVolatility: number
    riskProfile: number
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: number
    createdAt: number
    _all: number
  }


  export type MarketProfileAvgAggregateInputType = {
    initialLiquidityUsd?: true
    targetLiquidityUsd?: true
    targetGraduationUsd?: true
  }

  export type MarketProfileSumAggregateInputType = {
    initialLiquidityUsd?: true
    targetLiquidityUsd?: true
    targetGraduationUsd?: true
  }

  export type MarketProfileMinAggregateInputType = {
    id?: true
    assetId?: true
    initialLiquidityUsd?: true
    expectedVolatility?: true
    riskProfile?: true
    targetLiquidityUsd?: true
    targetGraduationUsd?: true
    quoteToken?: true
    createdAt?: true
  }

  export type MarketProfileMaxAggregateInputType = {
    id?: true
    assetId?: true
    initialLiquidityUsd?: true
    expectedVolatility?: true
    riskProfile?: true
    targetLiquidityUsd?: true
    targetGraduationUsd?: true
    quoteToken?: true
    createdAt?: true
  }

  export type MarketProfileCountAggregateInputType = {
    id?: true
    assetId?: true
    initialLiquidityUsd?: true
    expectedVolatility?: true
    riskProfile?: true
    targetLiquidityUsd?: true
    targetGraduationUsd?: true
    quoteToken?: true
    createdAt?: true
    _all?: true
  }

  export type MarketProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketProfile to aggregate.
     */
    where?: MarketProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketProfiles to fetch.
     */
    orderBy?: MarketProfileOrderByWithRelationInput | MarketProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarketProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarketProfiles
    **/
    _count?: true | MarketProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MarketProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MarketProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarketProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarketProfileMaxAggregateInputType
  }

  export type GetMarketProfileAggregateType<T extends MarketProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateMarketProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarketProfile[P]>
      : GetScalarType<T[P], AggregateMarketProfile[P]>
  }




  export type MarketProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketProfileWhereInput
    orderBy?: MarketProfileOrderByWithAggregationInput | MarketProfileOrderByWithAggregationInput[]
    by: MarketProfileScalarFieldEnum[] | MarketProfileScalarFieldEnum
    having?: MarketProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarketProfileCountAggregateInputType | true
    _avg?: MarketProfileAvgAggregateInputType
    _sum?: MarketProfileSumAggregateInputType
    _min?: MarketProfileMinAggregateInputType
    _max?: MarketProfileMaxAggregateInputType
  }

  export type MarketProfileGroupByOutputType = {
    id: string
    assetId: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt: Date
    _count: MarketProfileCountAggregateOutputType | null
    _avg: MarketProfileAvgAggregateOutputType | null
    _sum: MarketProfileSumAggregateOutputType | null
    _min: MarketProfileMinAggregateOutputType | null
    _max: MarketProfileMaxAggregateOutputType | null
  }

  type GetMarketProfileGroupByPayload<T extends MarketProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarketProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarketProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarketProfileGroupByOutputType[P]>
            : GetScalarType<T[P], MarketProfileGroupByOutputType[P]>
        }
      >
    >


  export type MarketProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    initialLiquidityUsd?: boolean
    expectedVolatility?: boolean
    riskProfile?: boolean
    targetLiquidityUsd?: boolean
    targetGraduationUsd?: boolean
    quoteToken?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    curveConfigs?: boolean | MarketProfile$curveConfigsArgs<ExtArgs>
    launches?: boolean | MarketProfile$launchesArgs<ExtArgs>
    _count?: boolean | MarketProfileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketProfile"]>

  export type MarketProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    initialLiquidityUsd?: boolean
    expectedVolatility?: boolean
    riskProfile?: boolean
    targetLiquidityUsd?: boolean
    targetGraduationUsd?: boolean
    quoteToken?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketProfile"]>

  export type MarketProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    initialLiquidityUsd?: boolean
    expectedVolatility?: boolean
    riskProfile?: boolean
    targetLiquidityUsd?: boolean
    targetGraduationUsd?: boolean
    quoteToken?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketProfile"]>

  export type MarketProfileSelectScalar = {
    id?: boolean
    assetId?: boolean
    initialLiquidityUsd?: boolean
    expectedVolatility?: boolean
    riskProfile?: boolean
    targetLiquidityUsd?: boolean
    targetGraduationUsd?: boolean
    quoteToken?: boolean
    createdAt?: boolean
  }

  export type MarketProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assetId" | "initialLiquidityUsd" | "expectedVolatility" | "riskProfile" | "targetLiquidityUsd" | "targetGraduationUsd" | "quoteToken" | "createdAt", ExtArgs["result"]["marketProfile"]>
  export type MarketProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    curveConfigs?: boolean | MarketProfile$curveConfigsArgs<ExtArgs>
    launches?: boolean | MarketProfile$launchesArgs<ExtArgs>
    _count?: boolean | MarketProfileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MarketProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }
  export type MarketProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $MarketProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarketProfile"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
      curveConfigs: Prisma.$CurveConfigPayload<ExtArgs>[]
      launches: Prisma.$LaunchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assetId: string
      initialLiquidityUsd: number
      expectedVolatility: string
      riskProfile: $Enums.RiskProfile
      targetLiquidityUsd: number
      targetGraduationUsd: number
      quoteToken: $Enums.QuoteToken
      createdAt: Date
    }, ExtArgs["result"]["marketProfile"]>
    composites: {}
  }

  type MarketProfileGetPayload<S extends boolean | null | undefined | MarketProfileDefaultArgs> = $Result.GetResult<Prisma.$MarketProfilePayload, S>

  type MarketProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MarketProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MarketProfileCountAggregateInputType | true
    }

  export interface MarketProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarketProfile'], meta: { name: 'MarketProfile' } }
    /**
     * Find zero or one MarketProfile that matches the filter.
     * @param {MarketProfileFindUniqueArgs} args - Arguments to find a MarketProfile
     * @example
     * // Get one MarketProfile
     * const marketProfile = await prisma.marketProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarketProfileFindUniqueArgs>(args: SelectSubset<T, MarketProfileFindUniqueArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MarketProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MarketProfileFindUniqueOrThrowArgs} args - Arguments to find a MarketProfile
     * @example
     * // Get one MarketProfile
     * const marketProfile = await prisma.marketProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarketProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, MarketProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileFindFirstArgs} args - Arguments to find a MarketProfile
     * @example
     * // Get one MarketProfile
     * const marketProfile = await prisma.marketProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarketProfileFindFirstArgs>(args?: SelectSubset<T, MarketProfileFindFirstArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileFindFirstOrThrowArgs} args - Arguments to find a MarketProfile
     * @example
     * // Get one MarketProfile
     * const marketProfile = await prisma.marketProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarketProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, MarketProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MarketProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarketProfiles
     * const marketProfiles = await prisma.marketProfile.findMany()
     * 
     * // Get first 10 MarketProfiles
     * const marketProfiles = await prisma.marketProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const marketProfileWithIdOnly = await prisma.marketProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarketProfileFindManyArgs>(args?: SelectSubset<T, MarketProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MarketProfile.
     * @param {MarketProfileCreateArgs} args - Arguments to create a MarketProfile.
     * @example
     * // Create one MarketProfile
     * const MarketProfile = await prisma.marketProfile.create({
     *   data: {
     *     // ... data to create a MarketProfile
     *   }
     * })
     * 
     */
    create<T extends MarketProfileCreateArgs>(args: SelectSubset<T, MarketProfileCreateArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MarketProfiles.
     * @param {MarketProfileCreateManyArgs} args - Arguments to create many MarketProfiles.
     * @example
     * // Create many MarketProfiles
     * const marketProfile = await prisma.marketProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarketProfileCreateManyArgs>(args?: SelectSubset<T, MarketProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MarketProfiles and returns the data saved in the database.
     * @param {MarketProfileCreateManyAndReturnArgs} args - Arguments to create many MarketProfiles.
     * @example
     * // Create many MarketProfiles
     * const marketProfile = await prisma.marketProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MarketProfiles and only return the `id`
     * const marketProfileWithIdOnly = await prisma.marketProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MarketProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, MarketProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MarketProfile.
     * @param {MarketProfileDeleteArgs} args - Arguments to delete one MarketProfile.
     * @example
     * // Delete one MarketProfile
     * const MarketProfile = await prisma.marketProfile.delete({
     *   where: {
     *     // ... filter to delete one MarketProfile
     *   }
     * })
     * 
     */
    delete<T extends MarketProfileDeleteArgs>(args: SelectSubset<T, MarketProfileDeleteArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MarketProfile.
     * @param {MarketProfileUpdateArgs} args - Arguments to update one MarketProfile.
     * @example
     * // Update one MarketProfile
     * const marketProfile = await prisma.marketProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarketProfileUpdateArgs>(args: SelectSubset<T, MarketProfileUpdateArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MarketProfiles.
     * @param {MarketProfileDeleteManyArgs} args - Arguments to filter MarketProfiles to delete.
     * @example
     * // Delete a few MarketProfiles
     * const { count } = await prisma.marketProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarketProfileDeleteManyArgs>(args?: SelectSubset<T, MarketProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarketProfiles
     * const marketProfile = await prisma.marketProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarketProfileUpdateManyArgs>(args: SelectSubset<T, MarketProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketProfiles and returns the data updated in the database.
     * @param {MarketProfileUpdateManyAndReturnArgs} args - Arguments to update many MarketProfiles.
     * @example
     * // Update many MarketProfiles
     * const marketProfile = await prisma.marketProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MarketProfiles and only return the `id`
     * const marketProfileWithIdOnly = await prisma.marketProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MarketProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, MarketProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MarketProfile.
     * @param {MarketProfileUpsertArgs} args - Arguments to update or create a MarketProfile.
     * @example
     * // Update or create a MarketProfile
     * const marketProfile = await prisma.marketProfile.upsert({
     *   create: {
     *     // ... data to create a MarketProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarketProfile we want to update
     *   }
     * })
     */
    upsert<T extends MarketProfileUpsertArgs>(args: SelectSubset<T, MarketProfileUpsertArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MarketProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileCountArgs} args - Arguments to filter MarketProfiles to count.
     * @example
     * // Count the number of MarketProfiles
     * const count = await prisma.marketProfile.count({
     *   where: {
     *     // ... the filter for the MarketProfiles we want to count
     *   }
     * })
    **/
    count<T extends MarketProfileCountArgs>(
      args?: Subset<T, MarketProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarketProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarketProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarketProfileAggregateArgs>(args: Subset<T, MarketProfileAggregateArgs>): Prisma.PrismaPromise<GetMarketProfileAggregateType<T>>

    /**
     * Group by MarketProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarketProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarketProfileGroupByArgs['orderBy'] }
        : { orderBy?: MarketProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarketProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarketProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarketProfile model
   */
  readonly fields: MarketProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarketProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarketProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    curveConfigs<T extends MarketProfile$curveConfigsArgs<ExtArgs> = {}>(args?: Subset<T, MarketProfile$curveConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    launches<T extends MarketProfile$launchesArgs<ExtArgs> = {}>(args?: Subset<T, MarketProfile$launchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarketProfile model
   */
  interface MarketProfileFieldRefs {
    readonly id: FieldRef<"MarketProfile", 'String'>
    readonly assetId: FieldRef<"MarketProfile", 'String'>
    readonly initialLiquidityUsd: FieldRef<"MarketProfile", 'Float'>
    readonly expectedVolatility: FieldRef<"MarketProfile", 'String'>
    readonly riskProfile: FieldRef<"MarketProfile", 'RiskProfile'>
    readonly targetLiquidityUsd: FieldRef<"MarketProfile", 'Float'>
    readonly targetGraduationUsd: FieldRef<"MarketProfile", 'Float'>
    readonly quoteToken: FieldRef<"MarketProfile", 'QuoteToken'>
    readonly createdAt: FieldRef<"MarketProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MarketProfile findUnique
   */
  export type MarketProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter, which MarketProfile to fetch.
     */
    where: MarketProfileWhereUniqueInput
  }

  /**
   * MarketProfile findUniqueOrThrow
   */
  export type MarketProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter, which MarketProfile to fetch.
     */
    where: MarketProfileWhereUniqueInput
  }

  /**
   * MarketProfile findFirst
   */
  export type MarketProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter, which MarketProfile to fetch.
     */
    where?: MarketProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketProfiles to fetch.
     */
    orderBy?: MarketProfileOrderByWithRelationInput | MarketProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketProfiles.
     */
    cursor?: MarketProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketProfiles.
     */
    distinct?: MarketProfileScalarFieldEnum | MarketProfileScalarFieldEnum[]
  }

  /**
   * MarketProfile findFirstOrThrow
   */
  export type MarketProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter, which MarketProfile to fetch.
     */
    where?: MarketProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketProfiles to fetch.
     */
    orderBy?: MarketProfileOrderByWithRelationInput | MarketProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketProfiles.
     */
    cursor?: MarketProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketProfiles.
     */
    distinct?: MarketProfileScalarFieldEnum | MarketProfileScalarFieldEnum[]
  }

  /**
   * MarketProfile findMany
   */
  export type MarketProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter, which MarketProfiles to fetch.
     */
    where?: MarketProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketProfiles to fetch.
     */
    orderBy?: MarketProfileOrderByWithRelationInput | MarketProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarketProfiles.
     */
    cursor?: MarketProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketProfiles.
     */
    skip?: number
    distinct?: MarketProfileScalarFieldEnum | MarketProfileScalarFieldEnum[]
  }

  /**
   * MarketProfile create
   */
  export type MarketProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a MarketProfile.
     */
    data: XOR<MarketProfileCreateInput, MarketProfileUncheckedCreateInput>
  }

  /**
   * MarketProfile createMany
   */
  export type MarketProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarketProfiles.
     */
    data: MarketProfileCreateManyInput | MarketProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketProfile createManyAndReturn
   */
  export type MarketProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * The data used to create many MarketProfiles.
     */
    data: MarketProfileCreateManyInput | MarketProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketProfile update
   */
  export type MarketProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a MarketProfile.
     */
    data: XOR<MarketProfileUpdateInput, MarketProfileUncheckedUpdateInput>
    /**
     * Choose, which MarketProfile to update.
     */
    where: MarketProfileWhereUniqueInput
  }

  /**
   * MarketProfile updateMany
   */
  export type MarketProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarketProfiles.
     */
    data: XOR<MarketProfileUpdateManyMutationInput, MarketProfileUncheckedUpdateManyInput>
    /**
     * Filter which MarketProfiles to update
     */
    where?: MarketProfileWhereInput
    /**
     * Limit how many MarketProfiles to update.
     */
    limit?: number
  }

  /**
   * MarketProfile updateManyAndReturn
   */
  export type MarketProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * The data used to update MarketProfiles.
     */
    data: XOR<MarketProfileUpdateManyMutationInput, MarketProfileUncheckedUpdateManyInput>
    /**
     * Filter which MarketProfiles to update
     */
    where?: MarketProfileWhereInput
    /**
     * Limit how many MarketProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketProfile upsert
   */
  export type MarketProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the MarketProfile to update in case it exists.
     */
    where: MarketProfileWhereUniqueInput
    /**
     * In case the MarketProfile found by the `where` argument doesn't exist, create a new MarketProfile with this data.
     */
    create: XOR<MarketProfileCreateInput, MarketProfileUncheckedCreateInput>
    /**
     * In case the MarketProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarketProfileUpdateInput, MarketProfileUncheckedUpdateInput>
  }

  /**
   * MarketProfile delete
   */
  export type MarketProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
    /**
     * Filter which MarketProfile to delete.
     */
    where: MarketProfileWhereUniqueInput
  }

  /**
   * MarketProfile deleteMany
   */
  export type MarketProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketProfiles to delete
     */
    where?: MarketProfileWhereInput
    /**
     * Limit how many MarketProfiles to delete.
     */
    limit?: number
  }

  /**
   * MarketProfile.curveConfigs
   */
  export type MarketProfile$curveConfigsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    where?: CurveConfigWhereInput
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    cursor?: CurveConfigWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CurveConfigScalarFieldEnum | CurveConfigScalarFieldEnum[]
  }

  /**
   * MarketProfile.launches
   */
  export type MarketProfile$launchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    where?: LaunchWhereInput
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    cursor?: LaunchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * MarketProfile without action
   */
  export type MarketProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketProfile
     */
    select?: MarketProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketProfile
     */
    omit?: MarketProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketProfileInclude<ExtArgs> | null
  }


  /**
   * Model CurveConfig
   */

  export type AggregateCurveConfig = {
    _count: CurveConfigCountAggregateOutputType | null
    _avg: CurveConfigAvgAggregateOutputType | null
    _sum: CurveConfigSumAggregateOutputType | null
    _min: CurveConfigMinAggregateOutputType | null
    _max: CurveConfigMaxAggregateOutputType | null
  }

  export type CurveConfigAvgAggregateOutputType = {
    initialMarketCapUsd: number | null
    migrationMarketCapUsd: number | null
    tokenSupply: number | null
    tokenBaseDecimals: number | null
  }

  export type CurveConfigSumAggregateOutputType = {
    initialMarketCapUsd: number | null
    migrationMarketCapUsd: number | null
    tokenSupply: number | null
    tokenBaseDecimals: number | null
  }

  export type CurveConfigMinAggregateOutputType = {
    id: string | null
    assetId: string | null
    marketProfileId: string | null
    riskProfile: $Enums.RiskProfile | null
    label: string | null
    rationale: string | null
    initialMarketCapUsd: number | null
    migrationMarketCapUsd: number | null
    tokenSupply: number | null
    tokenBaseDecimals: number | null
    isRecommended: boolean | null
    createdAt: Date | null
  }

  export type CurveConfigMaxAggregateOutputType = {
    id: string | null
    assetId: string | null
    marketProfileId: string | null
    riskProfile: $Enums.RiskProfile | null
    label: string | null
    rationale: string | null
    initialMarketCapUsd: number | null
    migrationMarketCapUsd: number | null
    tokenSupply: number | null
    tokenBaseDecimals: number | null
    isRecommended: boolean | null
    createdAt: Date | null
  }

  export type CurveConfigCountAggregateOutputType = {
    id: number
    assetId: number
    marketProfileId: number
    riskProfile: number
    label: number
    rationale: number
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: number
    migration: number
    liquidityDistribution: number
    score: number
    isRecommended: number
    createdAt: number
    _all: number
  }


  export type CurveConfigAvgAggregateInputType = {
    initialMarketCapUsd?: true
    migrationMarketCapUsd?: true
    tokenSupply?: true
    tokenBaseDecimals?: true
  }

  export type CurveConfigSumAggregateInputType = {
    initialMarketCapUsd?: true
    migrationMarketCapUsd?: true
    tokenSupply?: true
    tokenBaseDecimals?: true
  }

  export type CurveConfigMinAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    riskProfile?: true
    label?: true
    rationale?: true
    initialMarketCapUsd?: true
    migrationMarketCapUsd?: true
    tokenSupply?: true
    tokenBaseDecimals?: true
    isRecommended?: true
    createdAt?: true
  }

  export type CurveConfigMaxAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    riskProfile?: true
    label?: true
    rationale?: true
    initialMarketCapUsd?: true
    migrationMarketCapUsd?: true
    tokenSupply?: true
    tokenBaseDecimals?: true
    isRecommended?: true
    createdAt?: true
  }

  export type CurveConfigCountAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    riskProfile?: true
    label?: true
    rationale?: true
    initialMarketCapUsd?: true
    migrationMarketCapUsd?: true
    tokenSupply?: true
    tokenBaseDecimals?: true
    feeSchedule?: true
    migration?: true
    liquidityDistribution?: true
    score?: true
    isRecommended?: true
    createdAt?: true
    _all?: true
  }

  export type CurveConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CurveConfig to aggregate.
     */
    where?: CurveConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CurveConfigs to fetch.
     */
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CurveConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CurveConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CurveConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CurveConfigs
    **/
    _count?: true | CurveConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CurveConfigAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CurveConfigSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CurveConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CurveConfigMaxAggregateInputType
  }

  export type GetCurveConfigAggregateType<T extends CurveConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateCurveConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCurveConfig[P]>
      : GetScalarType<T[P], AggregateCurveConfig[P]>
  }




  export type CurveConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CurveConfigWhereInput
    orderBy?: CurveConfigOrderByWithAggregationInput | CurveConfigOrderByWithAggregationInput[]
    by: CurveConfigScalarFieldEnum[] | CurveConfigScalarFieldEnum
    having?: CurveConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CurveConfigCountAggregateInputType | true
    _avg?: CurveConfigAvgAggregateInputType
    _sum?: CurveConfigSumAggregateInputType
    _min?: CurveConfigMinAggregateInputType
    _max?: CurveConfigMaxAggregateInputType
  }

  export type CurveConfigGroupByOutputType = {
    id: string
    assetId: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonValue
    migration: JsonValue
    liquidityDistribution: JsonValue
    score: JsonValue
    isRecommended: boolean
    createdAt: Date
    _count: CurveConfigCountAggregateOutputType | null
    _avg: CurveConfigAvgAggregateOutputType | null
    _sum: CurveConfigSumAggregateOutputType | null
    _min: CurveConfigMinAggregateOutputType | null
    _max: CurveConfigMaxAggregateOutputType | null
  }

  type GetCurveConfigGroupByPayload<T extends CurveConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CurveConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CurveConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CurveConfigGroupByOutputType[P]>
            : GetScalarType<T[P], CurveConfigGroupByOutputType[P]>
        }
      >
    >


  export type CurveConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    riskProfile?: boolean
    label?: boolean
    rationale?: boolean
    initialMarketCapUsd?: boolean
    migrationMarketCapUsd?: boolean
    tokenSupply?: boolean
    tokenBaseDecimals?: boolean
    feeSchedule?: boolean
    migration?: boolean
    liquidityDistribution?: boolean
    score?: boolean
    isRecommended?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    simulationRuns?: boolean | CurveConfig$simulationRunsArgs<ExtArgs>
    launches?: boolean | CurveConfig$launchesArgs<ExtArgs>
    _count?: boolean | CurveConfigCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["curveConfig"]>

  export type CurveConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    riskProfile?: boolean
    label?: boolean
    rationale?: boolean
    initialMarketCapUsd?: boolean
    migrationMarketCapUsd?: boolean
    tokenSupply?: boolean
    tokenBaseDecimals?: boolean
    feeSchedule?: boolean
    migration?: boolean
    liquidityDistribution?: boolean
    score?: boolean
    isRecommended?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["curveConfig"]>

  export type CurveConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    riskProfile?: boolean
    label?: boolean
    rationale?: boolean
    initialMarketCapUsd?: boolean
    migrationMarketCapUsd?: boolean
    tokenSupply?: boolean
    tokenBaseDecimals?: boolean
    feeSchedule?: boolean
    migration?: boolean
    liquidityDistribution?: boolean
    score?: boolean
    isRecommended?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["curveConfig"]>

  export type CurveConfigSelectScalar = {
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    riskProfile?: boolean
    label?: boolean
    rationale?: boolean
    initialMarketCapUsd?: boolean
    migrationMarketCapUsd?: boolean
    tokenSupply?: boolean
    tokenBaseDecimals?: boolean
    feeSchedule?: boolean
    migration?: boolean
    liquidityDistribution?: boolean
    score?: boolean
    isRecommended?: boolean
    createdAt?: boolean
  }

  export type CurveConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assetId" | "marketProfileId" | "riskProfile" | "label" | "rationale" | "initialMarketCapUsd" | "migrationMarketCapUsd" | "tokenSupply" | "tokenBaseDecimals" | "feeSchedule" | "migration" | "liquidityDistribution" | "score" | "isRecommended" | "createdAt", ExtArgs["result"]["curveConfig"]>
  export type CurveConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    simulationRuns?: boolean | CurveConfig$simulationRunsArgs<ExtArgs>
    launches?: boolean | CurveConfig$launchesArgs<ExtArgs>
    _count?: boolean | CurveConfigCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CurveConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
  }
  export type CurveConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
  }

  export type $CurveConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CurveConfig"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
      marketProfile: Prisma.$MarketProfilePayload<ExtArgs>
      simulationRuns: Prisma.$SimulationRunPayload<ExtArgs>[]
      launches: Prisma.$LaunchPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assetId: string
      marketProfileId: string
      riskProfile: $Enums.RiskProfile
      label: string
      rationale: string
      initialMarketCapUsd: number
      migrationMarketCapUsd: number
      tokenSupply: number
      tokenBaseDecimals: number
      feeSchedule: Prisma.JsonValue
      migration: Prisma.JsonValue
      liquidityDistribution: Prisma.JsonValue
      score: Prisma.JsonValue
      isRecommended: boolean
      createdAt: Date
    }, ExtArgs["result"]["curveConfig"]>
    composites: {}
  }

  type CurveConfigGetPayload<S extends boolean | null | undefined | CurveConfigDefaultArgs> = $Result.GetResult<Prisma.$CurveConfigPayload, S>

  type CurveConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CurveConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CurveConfigCountAggregateInputType | true
    }

  export interface CurveConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CurveConfig'], meta: { name: 'CurveConfig' } }
    /**
     * Find zero or one CurveConfig that matches the filter.
     * @param {CurveConfigFindUniqueArgs} args - Arguments to find a CurveConfig
     * @example
     * // Get one CurveConfig
     * const curveConfig = await prisma.curveConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CurveConfigFindUniqueArgs>(args: SelectSubset<T, CurveConfigFindUniqueArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CurveConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CurveConfigFindUniqueOrThrowArgs} args - Arguments to find a CurveConfig
     * @example
     * // Get one CurveConfig
     * const curveConfig = await prisma.curveConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CurveConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, CurveConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CurveConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigFindFirstArgs} args - Arguments to find a CurveConfig
     * @example
     * // Get one CurveConfig
     * const curveConfig = await prisma.curveConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CurveConfigFindFirstArgs>(args?: SelectSubset<T, CurveConfigFindFirstArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CurveConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigFindFirstOrThrowArgs} args - Arguments to find a CurveConfig
     * @example
     * // Get one CurveConfig
     * const curveConfig = await prisma.curveConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CurveConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, CurveConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CurveConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CurveConfigs
     * const curveConfigs = await prisma.curveConfig.findMany()
     * 
     * // Get first 10 CurveConfigs
     * const curveConfigs = await prisma.curveConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const curveConfigWithIdOnly = await prisma.curveConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CurveConfigFindManyArgs>(args?: SelectSubset<T, CurveConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CurveConfig.
     * @param {CurveConfigCreateArgs} args - Arguments to create a CurveConfig.
     * @example
     * // Create one CurveConfig
     * const CurveConfig = await prisma.curveConfig.create({
     *   data: {
     *     // ... data to create a CurveConfig
     *   }
     * })
     * 
     */
    create<T extends CurveConfigCreateArgs>(args: SelectSubset<T, CurveConfigCreateArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CurveConfigs.
     * @param {CurveConfigCreateManyArgs} args - Arguments to create many CurveConfigs.
     * @example
     * // Create many CurveConfigs
     * const curveConfig = await prisma.curveConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CurveConfigCreateManyArgs>(args?: SelectSubset<T, CurveConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CurveConfigs and returns the data saved in the database.
     * @param {CurveConfigCreateManyAndReturnArgs} args - Arguments to create many CurveConfigs.
     * @example
     * // Create many CurveConfigs
     * const curveConfig = await prisma.curveConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CurveConfigs and only return the `id`
     * const curveConfigWithIdOnly = await prisma.curveConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CurveConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, CurveConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CurveConfig.
     * @param {CurveConfigDeleteArgs} args - Arguments to delete one CurveConfig.
     * @example
     * // Delete one CurveConfig
     * const CurveConfig = await prisma.curveConfig.delete({
     *   where: {
     *     // ... filter to delete one CurveConfig
     *   }
     * })
     * 
     */
    delete<T extends CurveConfigDeleteArgs>(args: SelectSubset<T, CurveConfigDeleteArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CurveConfig.
     * @param {CurveConfigUpdateArgs} args - Arguments to update one CurveConfig.
     * @example
     * // Update one CurveConfig
     * const curveConfig = await prisma.curveConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CurveConfigUpdateArgs>(args: SelectSubset<T, CurveConfigUpdateArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CurveConfigs.
     * @param {CurveConfigDeleteManyArgs} args - Arguments to filter CurveConfigs to delete.
     * @example
     * // Delete a few CurveConfigs
     * const { count } = await prisma.curveConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CurveConfigDeleteManyArgs>(args?: SelectSubset<T, CurveConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CurveConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CurveConfigs
     * const curveConfig = await prisma.curveConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CurveConfigUpdateManyArgs>(args: SelectSubset<T, CurveConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CurveConfigs and returns the data updated in the database.
     * @param {CurveConfigUpdateManyAndReturnArgs} args - Arguments to update many CurveConfigs.
     * @example
     * // Update many CurveConfigs
     * const curveConfig = await prisma.curveConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CurveConfigs and only return the `id`
     * const curveConfigWithIdOnly = await prisma.curveConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CurveConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, CurveConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CurveConfig.
     * @param {CurveConfigUpsertArgs} args - Arguments to update or create a CurveConfig.
     * @example
     * // Update or create a CurveConfig
     * const curveConfig = await prisma.curveConfig.upsert({
     *   create: {
     *     // ... data to create a CurveConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CurveConfig we want to update
     *   }
     * })
     */
    upsert<T extends CurveConfigUpsertArgs>(args: SelectSubset<T, CurveConfigUpsertArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CurveConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigCountArgs} args - Arguments to filter CurveConfigs to count.
     * @example
     * // Count the number of CurveConfigs
     * const count = await prisma.curveConfig.count({
     *   where: {
     *     // ... the filter for the CurveConfigs we want to count
     *   }
     * })
    **/
    count<T extends CurveConfigCountArgs>(
      args?: Subset<T, CurveConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CurveConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CurveConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CurveConfigAggregateArgs>(args: Subset<T, CurveConfigAggregateArgs>): Prisma.PrismaPromise<GetCurveConfigAggregateType<T>>

    /**
     * Group by CurveConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CurveConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CurveConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CurveConfigGroupByArgs['orderBy'] }
        : { orderBy?: CurveConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CurveConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCurveConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CurveConfig model
   */
  readonly fields: CurveConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CurveConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CurveConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    marketProfile<T extends MarketProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MarketProfileDefaultArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    simulationRuns<T extends CurveConfig$simulationRunsArgs<ExtArgs> = {}>(args?: Subset<T, CurveConfig$simulationRunsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    launches<T extends CurveConfig$launchesArgs<ExtArgs> = {}>(args?: Subset<T, CurveConfig$launchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CurveConfig model
   */
  interface CurveConfigFieldRefs {
    readonly id: FieldRef<"CurveConfig", 'String'>
    readonly assetId: FieldRef<"CurveConfig", 'String'>
    readonly marketProfileId: FieldRef<"CurveConfig", 'String'>
    readonly riskProfile: FieldRef<"CurveConfig", 'RiskProfile'>
    readonly label: FieldRef<"CurveConfig", 'String'>
    readonly rationale: FieldRef<"CurveConfig", 'String'>
    readonly initialMarketCapUsd: FieldRef<"CurveConfig", 'Float'>
    readonly migrationMarketCapUsd: FieldRef<"CurveConfig", 'Float'>
    readonly tokenSupply: FieldRef<"CurveConfig", 'Float'>
    readonly tokenBaseDecimals: FieldRef<"CurveConfig", 'Int'>
    readonly feeSchedule: FieldRef<"CurveConfig", 'Json'>
    readonly migration: FieldRef<"CurveConfig", 'Json'>
    readonly liquidityDistribution: FieldRef<"CurveConfig", 'Json'>
    readonly score: FieldRef<"CurveConfig", 'Json'>
    readonly isRecommended: FieldRef<"CurveConfig", 'Boolean'>
    readonly createdAt: FieldRef<"CurveConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CurveConfig findUnique
   */
  export type CurveConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter, which CurveConfig to fetch.
     */
    where: CurveConfigWhereUniqueInput
  }

  /**
   * CurveConfig findUniqueOrThrow
   */
  export type CurveConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter, which CurveConfig to fetch.
     */
    where: CurveConfigWhereUniqueInput
  }

  /**
   * CurveConfig findFirst
   */
  export type CurveConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter, which CurveConfig to fetch.
     */
    where?: CurveConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CurveConfigs to fetch.
     */
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CurveConfigs.
     */
    cursor?: CurveConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CurveConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CurveConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CurveConfigs.
     */
    distinct?: CurveConfigScalarFieldEnum | CurveConfigScalarFieldEnum[]
  }

  /**
   * CurveConfig findFirstOrThrow
   */
  export type CurveConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter, which CurveConfig to fetch.
     */
    where?: CurveConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CurveConfigs to fetch.
     */
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CurveConfigs.
     */
    cursor?: CurveConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CurveConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CurveConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CurveConfigs.
     */
    distinct?: CurveConfigScalarFieldEnum | CurveConfigScalarFieldEnum[]
  }

  /**
   * CurveConfig findMany
   */
  export type CurveConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter, which CurveConfigs to fetch.
     */
    where?: CurveConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CurveConfigs to fetch.
     */
    orderBy?: CurveConfigOrderByWithRelationInput | CurveConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CurveConfigs.
     */
    cursor?: CurveConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CurveConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CurveConfigs.
     */
    skip?: number
    distinct?: CurveConfigScalarFieldEnum | CurveConfigScalarFieldEnum[]
  }

  /**
   * CurveConfig create
   */
  export type CurveConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a CurveConfig.
     */
    data: XOR<CurveConfigCreateInput, CurveConfigUncheckedCreateInput>
  }

  /**
   * CurveConfig createMany
   */
  export type CurveConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CurveConfigs.
     */
    data: CurveConfigCreateManyInput | CurveConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CurveConfig createManyAndReturn
   */
  export type CurveConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * The data used to create many CurveConfigs.
     */
    data: CurveConfigCreateManyInput | CurveConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CurveConfig update
   */
  export type CurveConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a CurveConfig.
     */
    data: XOR<CurveConfigUpdateInput, CurveConfigUncheckedUpdateInput>
    /**
     * Choose, which CurveConfig to update.
     */
    where: CurveConfigWhereUniqueInput
  }

  /**
   * CurveConfig updateMany
   */
  export type CurveConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CurveConfigs.
     */
    data: XOR<CurveConfigUpdateManyMutationInput, CurveConfigUncheckedUpdateManyInput>
    /**
     * Filter which CurveConfigs to update
     */
    where?: CurveConfigWhereInput
    /**
     * Limit how many CurveConfigs to update.
     */
    limit?: number
  }

  /**
   * CurveConfig updateManyAndReturn
   */
  export type CurveConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * The data used to update CurveConfigs.
     */
    data: XOR<CurveConfigUpdateManyMutationInput, CurveConfigUncheckedUpdateManyInput>
    /**
     * Filter which CurveConfigs to update
     */
    where?: CurveConfigWhereInput
    /**
     * Limit how many CurveConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CurveConfig upsert
   */
  export type CurveConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the CurveConfig to update in case it exists.
     */
    where: CurveConfigWhereUniqueInput
    /**
     * In case the CurveConfig found by the `where` argument doesn't exist, create a new CurveConfig with this data.
     */
    create: XOR<CurveConfigCreateInput, CurveConfigUncheckedCreateInput>
    /**
     * In case the CurveConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CurveConfigUpdateInput, CurveConfigUncheckedUpdateInput>
  }

  /**
   * CurveConfig delete
   */
  export type CurveConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
    /**
     * Filter which CurveConfig to delete.
     */
    where: CurveConfigWhereUniqueInput
  }

  /**
   * CurveConfig deleteMany
   */
  export type CurveConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CurveConfigs to delete
     */
    where?: CurveConfigWhereInput
    /**
     * Limit how many CurveConfigs to delete.
     */
    limit?: number
  }

  /**
   * CurveConfig.simulationRuns
   */
  export type CurveConfig$simulationRunsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    where?: SimulationRunWhereInput
    orderBy?: SimulationRunOrderByWithRelationInput | SimulationRunOrderByWithRelationInput[]
    cursor?: SimulationRunWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SimulationRunScalarFieldEnum | SimulationRunScalarFieldEnum[]
  }

  /**
   * CurveConfig.launches
   */
  export type CurveConfig$launchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    where?: LaunchWhereInput
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    cursor?: LaunchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * CurveConfig without action
   */
  export type CurveConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CurveConfig
     */
    select?: CurveConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CurveConfig
     */
    omit?: CurveConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CurveConfigInclude<ExtArgs> | null
  }


  /**
   * Model SimulationRun
   */

  export type AggregateSimulationRun = {
    _count: SimulationRunCountAggregateOutputType | null
    _min: SimulationRunMinAggregateOutputType | null
    _max: SimulationRunMaxAggregateOutputType | null
  }

  export type SimulationRunMinAggregateOutputType = {
    id: string | null
    curveConfigId: string | null
    createdAt: Date | null
  }

  export type SimulationRunMaxAggregateOutputType = {
    id: string | null
    curveConfigId: string | null
    createdAt: Date | null
  }

  export type SimulationRunCountAggregateOutputType = {
    id: number
    curveConfigId: number
    scenarios: number
    createdAt: number
    _all: number
  }


  export type SimulationRunMinAggregateInputType = {
    id?: true
    curveConfigId?: true
    createdAt?: true
  }

  export type SimulationRunMaxAggregateInputType = {
    id?: true
    curveConfigId?: true
    createdAt?: true
  }

  export type SimulationRunCountAggregateInputType = {
    id?: true
    curveConfigId?: true
    scenarios?: true
    createdAt?: true
    _all?: true
  }

  export type SimulationRunAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SimulationRun to aggregate.
     */
    where?: SimulationRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SimulationRuns to fetch.
     */
    orderBy?: SimulationRunOrderByWithRelationInput | SimulationRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SimulationRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SimulationRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SimulationRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SimulationRuns
    **/
    _count?: true | SimulationRunCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SimulationRunMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SimulationRunMaxAggregateInputType
  }

  export type GetSimulationRunAggregateType<T extends SimulationRunAggregateArgs> = {
        [P in keyof T & keyof AggregateSimulationRun]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSimulationRun[P]>
      : GetScalarType<T[P], AggregateSimulationRun[P]>
  }




  export type SimulationRunGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SimulationRunWhereInput
    orderBy?: SimulationRunOrderByWithAggregationInput | SimulationRunOrderByWithAggregationInput[]
    by: SimulationRunScalarFieldEnum[] | SimulationRunScalarFieldEnum
    having?: SimulationRunScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SimulationRunCountAggregateInputType | true
    _min?: SimulationRunMinAggregateInputType
    _max?: SimulationRunMaxAggregateInputType
  }

  export type SimulationRunGroupByOutputType = {
    id: string
    curveConfigId: string
    scenarios: JsonValue
    createdAt: Date
    _count: SimulationRunCountAggregateOutputType | null
    _min: SimulationRunMinAggregateOutputType | null
    _max: SimulationRunMaxAggregateOutputType | null
  }

  type GetSimulationRunGroupByPayload<T extends SimulationRunGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SimulationRunGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SimulationRunGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SimulationRunGroupByOutputType[P]>
            : GetScalarType<T[P], SimulationRunGroupByOutputType[P]>
        }
      >
    >


  export type SimulationRunSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    curveConfigId?: boolean
    scenarios?: boolean
    createdAt?: boolean
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["simulationRun"]>

  export type SimulationRunSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    curveConfigId?: boolean
    scenarios?: boolean
    createdAt?: boolean
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["simulationRun"]>

  export type SimulationRunSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    curveConfigId?: boolean
    scenarios?: boolean
    createdAt?: boolean
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["simulationRun"]>

  export type SimulationRunSelectScalar = {
    id?: boolean
    curveConfigId?: boolean
    scenarios?: boolean
    createdAt?: boolean
  }

  export type SimulationRunOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "curveConfigId" | "scenarios" | "createdAt", ExtArgs["result"]["simulationRun"]>
  export type SimulationRunInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }
  export type SimulationRunIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }
  export type SimulationRunIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }

  export type $SimulationRunPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SimulationRun"
    objects: {
      curveConfig: Prisma.$CurveConfigPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      curveConfigId: string
      scenarios: Prisma.JsonValue
      createdAt: Date
    }, ExtArgs["result"]["simulationRun"]>
    composites: {}
  }

  type SimulationRunGetPayload<S extends boolean | null | undefined | SimulationRunDefaultArgs> = $Result.GetResult<Prisma.$SimulationRunPayload, S>

  type SimulationRunCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SimulationRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SimulationRunCountAggregateInputType | true
    }

  export interface SimulationRunDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SimulationRun'], meta: { name: 'SimulationRun' } }
    /**
     * Find zero or one SimulationRun that matches the filter.
     * @param {SimulationRunFindUniqueArgs} args - Arguments to find a SimulationRun
     * @example
     * // Get one SimulationRun
     * const simulationRun = await prisma.simulationRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SimulationRunFindUniqueArgs>(args: SelectSubset<T, SimulationRunFindUniqueArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SimulationRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SimulationRunFindUniqueOrThrowArgs} args - Arguments to find a SimulationRun
     * @example
     * // Get one SimulationRun
     * const simulationRun = await prisma.simulationRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SimulationRunFindUniqueOrThrowArgs>(args: SelectSubset<T, SimulationRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SimulationRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunFindFirstArgs} args - Arguments to find a SimulationRun
     * @example
     * // Get one SimulationRun
     * const simulationRun = await prisma.simulationRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SimulationRunFindFirstArgs>(args?: SelectSubset<T, SimulationRunFindFirstArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SimulationRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunFindFirstOrThrowArgs} args - Arguments to find a SimulationRun
     * @example
     * // Get one SimulationRun
     * const simulationRun = await prisma.simulationRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SimulationRunFindFirstOrThrowArgs>(args?: SelectSubset<T, SimulationRunFindFirstOrThrowArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SimulationRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SimulationRuns
     * const simulationRuns = await prisma.simulationRun.findMany()
     * 
     * // Get first 10 SimulationRuns
     * const simulationRuns = await prisma.simulationRun.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const simulationRunWithIdOnly = await prisma.simulationRun.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SimulationRunFindManyArgs>(args?: SelectSubset<T, SimulationRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SimulationRun.
     * @param {SimulationRunCreateArgs} args - Arguments to create a SimulationRun.
     * @example
     * // Create one SimulationRun
     * const SimulationRun = await prisma.simulationRun.create({
     *   data: {
     *     // ... data to create a SimulationRun
     *   }
     * })
     * 
     */
    create<T extends SimulationRunCreateArgs>(args: SelectSubset<T, SimulationRunCreateArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SimulationRuns.
     * @param {SimulationRunCreateManyArgs} args - Arguments to create many SimulationRuns.
     * @example
     * // Create many SimulationRuns
     * const simulationRun = await prisma.simulationRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SimulationRunCreateManyArgs>(args?: SelectSubset<T, SimulationRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SimulationRuns and returns the data saved in the database.
     * @param {SimulationRunCreateManyAndReturnArgs} args - Arguments to create many SimulationRuns.
     * @example
     * // Create many SimulationRuns
     * const simulationRun = await prisma.simulationRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SimulationRuns and only return the `id`
     * const simulationRunWithIdOnly = await prisma.simulationRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SimulationRunCreateManyAndReturnArgs>(args?: SelectSubset<T, SimulationRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SimulationRun.
     * @param {SimulationRunDeleteArgs} args - Arguments to delete one SimulationRun.
     * @example
     * // Delete one SimulationRun
     * const SimulationRun = await prisma.simulationRun.delete({
     *   where: {
     *     // ... filter to delete one SimulationRun
     *   }
     * })
     * 
     */
    delete<T extends SimulationRunDeleteArgs>(args: SelectSubset<T, SimulationRunDeleteArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SimulationRun.
     * @param {SimulationRunUpdateArgs} args - Arguments to update one SimulationRun.
     * @example
     * // Update one SimulationRun
     * const simulationRun = await prisma.simulationRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SimulationRunUpdateArgs>(args: SelectSubset<T, SimulationRunUpdateArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SimulationRuns.
     * @param {SimulationRunDeleteManyArgs} args - Arguments to filter SimulationRuns to delete.
     * @example
     * // Delete a few SimulationRuns
     * const { count } = await prisma.simulationRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SimulationRunDeleteManyArgs>(args?: SelectSubset<T, SimulationRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SimulationRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SimulationRuns
     * const simulationRun = await prisma.simulationRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SimulationRunUpdateManyArgs>(args: SelectSubset<T, SimulationRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SimulationRuns and returns the data updated in the database.
     * @param {SimulationRunUpdateManyAndReturnArgs} args - Arguments to update many SimulationRuns.
     * @example
     * // Update many SimulationRuns
     * const simulationRun = await prisma.simulationRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SimulationRuns and only return the `id`
     * const simulationRunWithIdOnly = await prisma.simulationRun.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SimulationRunUpdateManyAndReturnArgs>(args: SelectSubset<T, SimulationRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SimulationRun.
     * @param {SimulationRunUpsertArgs} args - Arguments to update or create a SimulationRun.
     * @example
     * // Update or create a SimulationRun
     * const simulationRun = await prisma.simulationRun.upsert({
     *   create: {
     *     // ... data to create a SimulationRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SimulationRun we want to update
     *   }
     * })
     */
    upsert<T extends SimulationRunUpsertArgs>(args: SelectSubset<T, SimulationRunUpsertArgs<ExtArgs>>): Prisma__SimulationRunClient<$Result.GetResult<Prisma.$SimulationRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SimulationRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunCountArgs} args - Arguments to filter SimulationRuns to count.
     * @example
     * // Count the number of SimulationRuns
     * const count = await prisma.simulationRun.count({
     *   where: {
     *     // ... the filter for the SimulationRuns we want to count
     *   }
     * })
    **/
    count<T extends SimulationRunCountArgs>(
      args?: Subset<T, SimulationRunCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SimulationRunCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SimulationRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SimulationRunAggregateArgs>(args: Subset<T, SimulationRunAggregateArgs>): Prisma.PrismaPromise<GetSimulationRunAggregateType<T>>

    /**
     * Group by SimulationRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationRunGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SimulationRunGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SimulationRunGroupByArgs['orderBy'] }
        : { orderBy?: SimulationRunGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SimulationRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSimulationRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SimulationRun model
   */
  readonly fields: SimulationRunFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SimulationRun.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SimulationRunClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    curveConfig<T extends CurveConfigDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CurveConfigDefaultArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SimulationRun model
   */
  interface SimulationRunFieldRefs {
    readonly id: FieldRef<"SimulationRun", 'String'>
    readonly curveConfigId: FieldRef<"SimulationRun", 'String'>
    readonly scenarios: FieldRef<"SimulationRun", 'Json'>
    readonly createdAt: FieldRef<"SimulationRun", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SimulationRun findUnique
   */
  export type SimulationRunFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter, which SimulationRun to fetch.
     */
    where: SimulationRunWhereUniqueInput
  }

  /**
   * SimulationRun findUniqueOrThrow
   */
  export type SimulationRunFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter, which SimulationRun to fetch.
     */
    where: SimulationRunWhereUniqueInput
  }

  /**
   * SimulationRun findFirst
   */
  export type SimulationRunFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter, which SimulationRun to fetch.
     */
    where?: SimulationRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SimulationRuns to fetch.
     */
    orderBy?: SimulationRunOrderByWithRelationInput | SimulationRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SimulationRuns.
     */
    cursor?: SimulationRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SimulationRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SimulationRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SimulationRuns.
     */
    distinct?: SimulationRunScalarFieldEnum | SimulationRunScalarFieldEnum[]
  }

  /**
   * SimulationRun findFirstOrThrow
   */
  export type SimulationRunFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter, which SimulationRun to fetch.
     */
    where?: SimulationRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SimulationRuns to fetch.
     */
    orderBy?: SimulationRunOrderByWithRelationInput | SimulationRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SimulationRuns.
     */
    cursor?: SimulationRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SimulationRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SimulationRuns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SimulationRuns.
     */
    distinct?: SimulationRunScalarFieldEnum | SimulationRunScalarFieldEnum[]
  }

  /**
   * SimulationRun findMany
   */
  export type SimulationRunFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter, which SimulationRuns to fetch.
     */
    where?: SimulationRunWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SimulationRuns to fetch.
     */
    orderBy?: SimulationRunOrderByWithRelationInput | SimulationRunOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SimulationRuns.
     */
    cursor?: SimulationRunWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SimulationRuns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SimulationRuns.
     */
    skip?: number
    distinct?: SimulationRunScalarFieldEnum | SimulationRunScalarFieldEnum[]
  }

  /**
   * SimulationRun create
   */
  export type SimulationRunCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * The data needed to create a SimulationRun.
     */
    data: XOR<SimulationRunCreateInput, SimulationRunUncheckedCreateInput>
  }

  /**
   * SimulationRun createMany
   */
  export type SimulationRunCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SimulationRuns.
     */
    data: SimulationRunCreateManyInput | SimulationRunCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SimulationRun createManyAndReturn
   */
  export type SimulationRunCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * The data used to create many SimulationRuns.
     */
    data: SimulationRunCreateManyInput | SimulationRunCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SimulationRun update
   */
  export type SimulationRunUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * The data needed to update a SimulationRun.
     */
    data: XOR<SimulationRunUpdateInput, SimulationRunUncheckedUpdateInput>
    /**
     * Choose, which SimulationRun to update.
     */
    where: SimulationRunWhereUniqueInput
  }

  /**
   * SimulationRun updateMany
   */
  export type SimulationRunUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SimulationRuns.
     */
    data: XOR<SimulationRunUpdateManyMutationInput, SimulationRunUncheckedUpdateManyInput>
    /**
     * Filter which SimulationRuns to update
     */
    where?: SimulationRunWhereInput
    /**
     * Limit how many SimulationRuns to update.
     */
    limit?: number
  }

  /**
   * SimulationRun updateManyAndReturn
   */
  export type SimulationRunUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * The data used to update SimulationRuns.
     */
    data: XOR<SimulationRunUpdateManyMutationInput, SimulationRunUncheckedUpdateManyInput>
    /**
     * Filter which SimulationRuns to update
     */
    where?: SimulationRunWhereInput
    /**
     * Limit how many SimulationRuns to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SimulationRun upsert
   */
  export type SimulationRunUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * The filter to search for the SimulationRun to update in case it exists.
     */
    where: SimulationRunWhereUniqueInput
    /**
     * In case the SimulationRun found by the `where` argument doesn't exist, create a new SimulationRun with this data.
     */
    create: XOR<SimulationRunCreateInput, SimulationRunUncheckedCreateInput>
    /**
     * In case the SimulationRun was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SimulationRunUpdateInput, SimulationRunUncheckedUpdateInput>
  }

  /**
   * SimulationRun delete
   */
  export type SimulationRunDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
    /**
     * Filter which SimulationRun to delete.
     */
    where: SimulationRunWhereUniqueInput
  }

  /**
   * SimulationRun deleteMany
   */
  export type SimulationRunDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SimulationRuns to delete
     */
    where?: SimulationRunWhereInput
    /**
     * Limit how many SimulationRuns to delete.
     */
    limit?: number
  }

  /**
   * SimulationRun without action
   */
  export type SimulationRunDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationRun
     */
    select?: SimulationRunSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SimulationRun
     */
    omit?: SimulationRunOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SimulationRunInclude<ExtArgs> | null
  }


  /**
   * Model Launch
   */

  export type AggregateLaunch = {
    _count: LaunchCountAggregateOutputType | null
    _min: LaunchMinAggregateOutputType | null
    _max: LaunchMaxAggregateOutputType | null
  }

  export type LaunchMinAggregateOutputType = {
    id: string | null
    assetId: string | null
    marketProfileId: string | null
    curveConfigId: string | null
    configAddress: string | null
    poolAddress: string | null
    baseMint: string | null
    quoteMint: string | null
    configTxSignature: string | null
    poolTxSignature: string | null
    status: $Enums.PoolStatus | null
    stage: $Enums.LaunchStage | null
    ownerWallet: string | null
    lastAuthTimestamp: Date | null
    configKeypairSecret: string | null
    baseMintKeypairSecret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LaunchMaxAggregateOutputType = {
    id: string | null
    assetId: string | null
    marketProfileId: string | null
    curveConfigId: string | null
    configAddress: string | null
    poolAddress: string | null
    baseMint: string | null
    quoteMint: string | null
    configTxSignature: string | null
    poolTxSignature: string | null
    status: $Enums.PoolStatus | null
    stage: $Enums.LaunchStage | null
    ownerWallet: string | null
    lastAuthTimestamp: Date | null
    configKeypairSecret: string | null
    baseMintKeypairSecret: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LaunchCountAggregateOutputType = {
    id: number
    assetId: number
    marketProfileId: number
    curveConfigId: number
    configAddress: number
    poolAddress: number
    baseMint: number
    quoteMint: number
    configTxSignature: number
    poolTxSignature: number
    status: number
    stage: number
    ownerWallet: number
    lastAuthTimestamp: number
    configKeypairSecret: number
    baseMintKeypairSecret: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LaunchMinAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    curveConfigId?: true
    configAddress?: true
    poolAddress?: true
    baseMint?: true
    quoteMint?: true
    configTxSignature?: true
    poolTxSignature?: true
    status?: true
    stage?: true
    ownerWallet?: true
    lastAuthTimestamp?: true
    configKeypairSecret?: true
    baseMintKeypairSecret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LaunchMaxAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    curveConfigId?: true
    configAddress?: true
    poolAddress?: true
    baseMint?: true
    quoteMint?: true
    configTxSignature?: true
    poolTxSignature?: true
    status?: true
    stage?: true
    ownerWallet?: true
    lastAuthTimestamp?: true
    configKeypairSecret?: true
    baseMintKeypairSecret?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LaunchCountAggregateInputType = {
    id?: true
    assetId?: true
    marketProfileId?: true
    curveConfigId?: true
    configAddress?: true
    poolAddress?: true
    baseMint?: true
    quoteMint?: true
    configTxSignature?: true
    poolTxSignature?: true
    status?: true
    stage?: true
    ownerWallet?: true
    lastAuthTimestamp?: true
    configKeypairSecret?: true
    baseMintKeypairSecret?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LaunchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Launch to aggregate.
     */
    where?: LaunchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Launches to fetch.
     */
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LaunchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Launches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Launches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Launches
    **/
    _count?: true | LaunchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LaunchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LaunchMaxAggregateInputType
  }

  export type GetLaunchAggregateType<T extends LaunchAggregateArgs> = {
        [P in keyof T & keyof AggregateLaunch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLaunch[P]>
      : GetScalarType<T[P], AggregateLaunch[P]>
  }




  export type LaunchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LaunchWhereInput
    orderBy?: LaunchOrderByWithAggregationInput | LaunchOrderByWithAggregationInput[]
    by: LaunchScalarFieldEnum[] | LaunchScalarFieldEnum
    having?: LaunchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LaunchCountAggregateInputType | true
    _min?: LaunchMinAggregateInputType
    _max?: LaunchMaxAggregateInputType
  }

  export type LaunchGroupByOutputType = {
    id: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress: string | null
    poolAddress: string | null
    baseMint: string | null
    quoteMint: string | null
    configTxSignature: string | null
    poolTxSignature: string | null
    status: $Enums.PoolStatus
    stage: $Enums.LaunchStage
    ownerWallet: string | null
    lastAuthTimestamp: Date | null
    configKeypairSecret: string | null
    baseMintKeypairSecret: string | null
    createdAt: Date
    updatedAt: Date
    _count: LaunchCountAggregateOutputType | null
    _min: LaunchMinAggregateOutputType | null
    _max: LaunchMaxAggregateOutputType | null
  }

  type GetLaunchGroupByPayload<T extends LaunchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LaunchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LaunchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LaunchGroupByOutputType[P]>
            : GetScalarType<T[P], LaunchGroupByOutputType[P]>
        }
      >
    >


  export type LaunchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    curveConfigId?: boolean
    configAddress?: boolean
    poolAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    configTxSignature?: boolean
    poolTxSignature?: boolean
    status?: boolean
    stage?: boolean
    ownerWallet?: boolean
    lastAuthTimestamp?: boolean
    configKeypairSecret?: boolean
    baseMintKeypairSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
    pool?: boolean | Launch$poolArgs<ExtArgs>
    trades?: boolean | Launch$tradesArgs<ExtArgs>
    priceHistory?: boolean | Launch$priceHistoryArgs<ExtArgs>
    liquidityHistory?: boolean | Launch$liquidityHistoryArgs<ExtArgs>
    graduationEvents?: boolean | Launch$graduationEventsArgs<ExtArgs>
    _count?: boolean | LaunchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["launch"]>

  export type LaunchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    curveConfigId?: boolean
    configAddress?: boolean
    poolAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    configTxSignature?: boolean
    poolTxSignature?: boolean
    status?: boolean
    stage?: boolean
    ownerWallet?: boolean
    lastAuthTimestamp?: boolean
    configKeypairSecret?: boolean
    baseMintKeypairSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["launch"]>

  export type LaunchSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    curveConfigId?: boolean
    configAddress?: boolean
    poolAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    configTxSignature?: boolean
    poolTxSignature?: boolean
    status?: boolean
    stage?: boolean
    ownerWallet?: boolean
    lastAuthTimestamp?: boolean
    configKeypairSecret?: boolean
    baseMintKeypairSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["launch"]>

  export type LaunchSelectScalar = {
    id?: boolean
    assetId?: boolean
    marketProfileId?: boolean
    curveConfigId?: boolean
    configAddress?: boolean
    poolAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    configTxSignature?: boolean
    poolTxSignature?: boolean
    status?: boolean
    stage?: boolean
    ownerWallet?: boolean
    lastAuthTimestamp?: boolean
    configKeypairSecret?: boolean
    baseMintKeypairSecret?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LaunchOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "assetId" | "marketProfileId" | "curveConfigId" | "configAddress" | "poolAddress" | "baseMint" | "quoteMint" | "configTxSignature" | "poolTxSignature" | "status" | "stage" | "ownerWallet" | "lastAuthTimestamp" | "configKeypairSecret" | "baseMintKeypairSecret" | "createdAt" | "updatedAt", ExtArgs["result"]["launch"]>
  export type LaunchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
    pool?: boolean | Launch$poolArgs<ExtArgs>
    trades?: boolean | Launch$tradesArgs<ExtArgs>
    priceHistory?: boolean | Launch$priceHistoryArgs<ExtArgs>
    liquidityHistory?: boolean | Launch$liquidityHistoryArgs<ExtArgs>
    graduationEvents?: boolean | Launch$graduationEventsArgs<ExtArgs>
    _count?: boolean | LaunchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LaunchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }
  export type LaunchIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    marketProfile?: boolean | MarketProfileDefaultArgs<ExtArgs>
    curveConfig?: boolean | CurveConfigDefaultArgs<ExtArgs>
  }

  export type $LaunchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Launch"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
      marketProfile: Prisma.$MarketProfilePayload<ExtArgs>
      curveConfig: Prisma.$CurveConfigPayload<ExtArgs>
      pool: Prisma.$PoolPayload<ExtArgs> | null
      trades: Prisma.$TradePayload<ExtArgs>[]
      priceHistory: Prisma.$PriceHistoryPayload<ExtArgs>[]
      liquidityHistory: Prisma.$LiquidityHistoryPayload<ExtArgs>[]
      graduationEvents: Prisma.$GraduationEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      assetId: string
      marketProfileId: string
      curveConfigId: string
      configAddress: string | null
      poolAddress: string | null
      baseMint: string | null
      quoteMint: string | null
      configTxSignature: string | null
      poolTxSignature: string | null
      status: $Enums.PoolStatus
      stage: $Enums.LaunchStage
      /**
       * The base58 wallet public key that first successfully authenticated
       * (via a verified wallet signature — see @elf/solana#verifyOwnershipSignature)
       * against this deployment. Every subsequent config/pool mutation must
       * present a fresh, valid signature from this same wallet. Null only
       * during the brief window inside the first successful request before
       * the owning transaction commits. See docs/security-remediation.md (HIGH-1).
       */
      ownerWallet: string | null
      /**
       * The `authTimestamp` (ms) of the most recently accepted ownership
       * signature for this deployment. A new request must present a strictly
       * greater timestamp, so a captured/leaked signature cannot be replayed
       * against this same resource after it has already been used once.
       */
      lastAuthTimestamp: Date | null
      /**
       * Ephemeral, single-use, base58-encoded. NEVER a user wallet key — see
       * docs/security.md. Persisted only long enough to survive a
       * browser-refresh mid-deployment; cleared once its account is
       * confirmed on-chain.
       */
      configKeypairSecret: string | null
      baseMintKeypairSecret: string | null
      createdAt: Date
      /**
       * Drives staleness detection for `expireStaleLaunchSecrets` (@elf/db) —
       * see docs/security-remediation.md (LOW-5). Prisma sets this
       * automatically on every write to this row.
       */
      updatedAt: Date
    }, ExtArgs["result"]["launch"]>
    composites: {}
  }

  type LaunchGetPayload<S extends boolean | null | undefined | LaunchDefaultArgs> = $Result.GetResult<Prisma.$LaunchPayload, S>

  type LaunchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LaunchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LaunchCountAggregateInputType | true
    }

  export interface LaunchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Launch'], meta: { name: 'Launch' } }
    /**
     * Find zero or one Launch that matches the filter.
     * @param {LaunchFindUniqueArgs} args - Arguments to find a Launch
     * @example
     * // Get one Launch
     * const launch = await prisma.launch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LaunchFindUniqueArgs>(args: SelectSubset<T, LaunchFindUniqueArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Launch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LaunchFindUniqueOrThrowArgs} args - Arguments to find a Launch
     * @example
     * // Get one Launch
     * const launch = await prisma.launch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LaunchFindUniqueOrThrowArgs>(args: SelectSubset<T, LaunchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Launch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchFindFirstArgs} args - Arguments to find a Launch
     * @example
     * // Get one Launch
     * const launch = await prisma.launch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LaunchFindFirstArgs>(args?: SelectSubset<T, LaunchFindFirstArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Launch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchFindFirstOrThrowArgs} args - Arguments to find a Launch
     * @example
     * // Get one Launch
     * const launch = await prisma.launch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LaunchFindFirstOrThrowArgs>(args?: SelectSubset<T, LaunchFindFirstOrThrowArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Launches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Launches
     * const launches = await prisma.launch.findMany()
     * 
     * // Get first 10 Launches
     * const launches = await prisma.launch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const launchWithIdOnly = await prisma.launch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LaunchFindManyArgs>(args?: SelectSubset<T, LaunchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Launch.
     * @param {LaunchCreateArgs} args - Arguments to create a Launch.
     * @example
     * // Create one Launch
     * const Launch = await prisma.launch.create({
     *   data: {
     *     // ... data to create a Launch
     *   }
     * })
     * 
     */
    create<T extends LaunchCreateArgs>(args: SelectSubset<T, LaunchCreateArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Launches.
     * @param {LaunchCreateManyArgs} args - Arguments to create many Launches.
     * @example
     * // Create many Launches
     * const launch = await prisma.launch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LaunchCreateManyArgs>(args?: SelectSubset<T, LaunchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Launches and returns the data saved in the database.
     * @param {LaunchCreateManyAndReturnArgs} args - Arguments to create many Launches.
     * @example
     * // Create many Launches
     * const launch = await prisma.launch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Launches and only return the `id`
     * const launchWithIdOnly = await prisma.launch.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LaunchCreateManyAndReturnArgs>(args?: SelectSubset<T, LaunchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Launch.
     * @param {LaunchDeleteArgs} args - Arguments to delete one Launch.
     * @example
     * // Delete one Launch
     * const Launch = await prisma.launch.delete({
     *   where: {
     *     // ... filter to delete one Launch
     *   }
     * })
     * 
     */
    delete<T extends LaunchDeleteArgs>(args: SelectSubset<T, LaunchDeleteArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Launch.
     * @param {LaunchUpdateArgs} args - Arguments to update one Launch.
     * @example
     * // Update one Launch
     * const launch = await prisma.launch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LaunchUpdateArgs>(args: SelectSubset<T, LaunchUpdateArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Launches.
     * @param {LaunchDeleteManyArgs} args - Arguments to filter Launches to delete.
     * @example
     * // Delete a few Launches
     * const { count } = await prisma.launch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LaunchDeleteManyArgs>(args?: SelectSubset<T, LaunchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Launches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Launches
     * const launch = await prisma.launch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LaunchUpdateManyArgs>(args: SelectSubset<T, LaunchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Launches and returns the data updated in the database.
     * @param {LaunchUpdateManyAndReturnArgs} args - Arguments to update many Launches.
     * @example
     * // Update many Launches
     * const launch = await prisma.launch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Launches and only return the `id`
     * const launchWithIdOnly = await prisma.launch.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LaunchUpdateManyAndReturnArgs>(args: SelectSubset<T, LaunchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Launch.
     * @param {LaunchUpsertArgs} args - Arguments to update or create a Launch.
     * @example
     * // Update or create a Launch
     * const launch = await prisma.launch.upsert({
     *   create: {
     *     // ... data to create a Launch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Launch we want to update
     *   }
     * })
     */
    upsert<T extends LaunchUpsertArgs>(args: SelectSubset<T, LaunchUpsertArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Launches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchCountArgs} args - Arguments to filter Launches to count.
     * @example
     * // Count the number of Launches
     * const count = await prisma.launch.count({
     *   where: {
     *     // ... the filter for the Launches we want to count
     *   }
     * })
    **/
    count<T extends LaunchCountArgs>(
      args?: Subset<T, LaunchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LaunchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Launch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LaunchAggregateArgs>(args: Subset<T, LaunchAggregateArgs>): Prisma.PrismaPromise<GetLaunchAggregateType<T>>

    /**
     * Group by Launch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LaunchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LaunchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LaunchGroupByArgs['orderBy'] }
        : { orderBy?: LaunchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LaunchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLaunchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Launch model
   */
  readonly fields: LaunchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Launch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LaunchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    marketProfile<T extends MarketProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MarketProfileDefaultArgs<ExtArgs>>): Prisma__MarketProfileClient<$Result.GetResult<Prisma.$MarketProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    curveConfig<T extends CurveConfigDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CurveConfigDefaultArgs<ExtArgs>>): Prisma__CurveConfigClient<$Result.GetResult<Prisma.$CurveConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    pool<T extends Launch$poolArgs<ExtArgs> = {}>(args?: Subset<T, Launch$poolArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    trades<T extends Launch$tradesArgs<ExtArgs> = {}>(args?: Subset<T, Launch$tradesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    priceHistory<T extends Launch$priceHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Launch$priceHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    liquidityHistory<T extends Launch$liquidityHistoryArgs<ExtArgs> = {}>(args?: Subset<T, Launch$liquidityHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    graduationEvents<T extends Launch$graduationEventsArgs<ExtArgs> = {}>(args?: Subset<T, Launch$graduationEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Launch model
   */
  interface LaunchFieldRefs {
    readonly id: FieldRef<"Launch", 'String'>
    readonly assetId: FieldRef<"Launch", 'String'>
    readonly marketProfileId: FieldRef<"Launch", 'String'>
    readonly curveConfigId: FieldRef<"Launch", 'String'>
    readonly configAddress: FieldRef<"Launch", 'String'>
    readonly poolAddress: FieldRef<"Launch", 'String'>
    readonly baseMint: FieldRef<"Launch", 'String'>
    readonly quoteMint: FieldRef<"Launch", 'String'>
    readonly configTxSignature: FieldRef<"Launch", 'String'>
    readonly poolTxSignature: FieldRef<"Launch", 'String'>
    readonly status: FieldRef<"Launch", 'PoolStatus'>
    readonly stage: FieldRef<"Launch", 'LaunchStage'>
    readonly ownerWallet: FieldRef<"Launch", 'String'>
    readonly lastAuthTimestamp: FieldRef<"Launch", 'DateTime'>
    readonly configKeypairSecret: FieldRef<"Launch", 'String'>
    readonly baseMintKeypairSecret: FieldRef<"Launch", 'String'>
    readonly createdAt: FieldRef<"Launch", 'DateTime'>
    readonly updatedAt: FieldRef<"Launch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Launch findUnique
   */
  export type LaunchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter, which Launch to fetch.
     */
    where: LaunchWhereUniqueInput
  }

  /**
   * Launch findUniqueOrThrow
   */
  export type LaunchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter, which Launch to fetch.
     */
    where: LaunchWhereUniqueInput
  }

  /**
   * Launch findFirst
   */
  export type LaunchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter, which Launch to fetch.
     */
    where?: LaunchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Launches to fetch.
     */
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Launches.
     */
    cursor?: LaunchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Launches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Launches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Launches.
     */
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * Launch findFirstOrThrow
   */
  export type LaunchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter, which Launch to fetch.
     */
    where?: LaunchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Launches to fetch.
     */
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Launches.
     */
    cursor?: LaunchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Launches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Launches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Launches.
     */
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * Launch findMany
   */
  export type LaunchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter, which Launches to fetch.
     */
    where?: LaunchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Launches to fetch.
     */
    orderBy?: LaunchOrderByWithRelationInput | LaunchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Launches.
     */
    cursor?: LaunchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Launches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Launches.
     */
    skip?: number
    distinct?: LaunchScalarFieldEnum | LaunchScalarFieldEnum[]
  }

  /**
   * Launch create
   */
  export type LaunchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * The data needed to create a Launch.
     */
    data: XOR<LaunchCreateInput, LaunchUncheckedCreateInput>
  }

  /**
   * Launch createMany
   */
  export type LaunchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Launches.
     */
    data: LaunchCreateManyInput | LaunchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Launch createManyAndReturn
   */
  export type LaunchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * The data used to create many Launches.
     */
    data: LaunchCreateManyInput | LaunchCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Launch update
   */
  export type LaunchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * The data needed to update a Launch.
     */
    data: XOR<LaunchUpdateInput, LaunchUncheckedUpdateInput>
    /**
     * Choose, which Launch to update.
     */
    where: LaunchWhereUniqueInput
  }

  /**
   * Launch updateMany
   */
  export type LaunchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Launches.
     */
    data: XOR<LaunchUpdateManyMutationInput, LaunchUncheckedUpdateManyInput>
    /**
     * Filter which Launches to update
     */
    where?: LaunchWhereInput
    /**
     * Limit how many Launches to update.
     */
    limit?: number
  }

  /**
   * Launch updateManyAndReturn
   */
  export type LaunchUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * The data used to update Launches.
     */
    data: XOR<LaunchUpdateManyMutationInput, LaunchUncheckedUpdateManyInput>
    /**
     * Filter which Launches to update
     */
    where?: LaunchWhereInput
    /**
     * Limit how many Launches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Launch upsert
   */
  export type LaunchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * The filter to search for the Launch to update in case it exists.
     */
    where: LaunchWhereUniqueInput
    /**
     * In case the Launch found by the `where` argument doesn't exist, create a new Launch with this data.
     */
    create: XOR<LaunchCreateInput, LaunchUncheckedCreateInput>
    /**
     * In case the Launch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LaunchUpdateInput, LaunchUncheckedUpdateInput>
  }

  /**
   * Launch delete
   */
  export type LaunchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
    /**
     * Filter which Launch to delete.
     */
    where: LaunchWhereUniqueInput
  }

  /**
   * Launch deleteMany
   */
  export type LaunchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Launches to delete
     */
    where?: LaunchWhereInput
    /**
     * Limit how many Launches to delete.
     */
    limit?: number
  }

  /**
   * Launch.pool
   */
  export type Launch$poolArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    where?: PoolWhereInput
  }

  /**
   * Launch.trades
   */
  export type Launch$tradesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    cursor?: TradeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Launch.priceHistory
   */
  export type Launch$priceHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    where?: PriceHistoryWhereInput
    orderBy?: PriceHistoryOrderByWithRelationInput | PriceHistoryOrderByWithRelationInput[]
    cursor?: PriceHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PriceHistoryScalarFieldEnum | PriceHistoryScalarFieldEnum[]
  }

  /**
   * Launch.liquidityHistory
   */
  export type Launch$liquidityHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    where?: LiquidityHistoryWhereInput
    orderBy?: LiquidityHistoryOrderByWithRelationInput | LiquidityHistoryOrderByWithRelationInput[]
    cursor?: LiquidityHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LiquidityHistoryScalarFieldEnum | LiquidityHistoryScalarFieldEnum[]
  }

  /**
   * Launch.graduationEvents
   */
  export type Launch$graduationEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    where?: GraduationEventWhereInput
    orderBy?: GraduationEventOrderByWithRelationInput | GraduationEventOrderByWithRelationInput[]
    cursor?: GraduationEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GraduationEventScalarFieldEnum | GraduationEventScalarFieldEnum[]
  }

  /**
   * Launch without action
   */
  export type LaunchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Launch
     */
    select?: LaunchSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Launch
     */
    omit?: LaunchOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LaunchInclude<ExtArgs> | null
  }


  /**
   * Model Pool
   */

  export type AggregatePool = {
    _count: PoolCountAggregateOutputType | null
    _min: PoolMinAggregateOutputType | null
    _max: PoolMaxAggregateOutputType | null
  }

  export type PoolMinAggregateOutputType = {
    id: string | null
    launchId: string | null
    poolAddress: string | null
    configAddress: string | null
    baseMint: string | null
    quoteMint: string | null
    createdAt: Date | null
  }

  export type PoolMaxAggregateOutputType = {
    id: string | null
    launchId: string | null
    poolAddress: string | null
    configAddress: string | null
    baseMint: string | null
    quoteMint: string | null
    createdAt: Date | null
  }

  export type PoolCountAggregateOutputType = {
    id: number
    launchId: number
    poolAddress: number
    configAddress: number
    baseMint: number
    quoteMint: number
    createdAt: number
    _all: number
  }


  export type PoolMinAggregateInputType = {
    id?: true
    launchId?: true
    poolAddress?: true
    configAddress?: true
    baseMint?: true
    quoteMint?: true
    createdAt?: true
  }

  export type PoolMaxAggregateInputType = {
    id?: true
    launchId?: true
    poolAddress?: true
    configAddress?: true
    baseMint?: true
    quoteMint?: true
    createdAt?: true
  }

  export type PoolCountAggregateInputType = {
    id?: true
    launchId?: true
    poolAddress?: true
    configAddress?: true
    baseMint?: true
    quoteMint?: true
    createdAt?: true
    _all?: true
  }

  export type PoolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pool to aggregate.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pools
    **/
    _count?: true | PoolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PoolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PoolMaxAggregateInputType
  }

  export type GetPoolAggregateType<T extends PoolAggregateArgs> = {
        [P in keyof T & keyof AggregatePool]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePool[P]>
      : GetScalarType<T[P], AggregatePool[P]>
  }




  export type PoolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolWhereInput
    orderBy?: PoolOrderByWithAggregationInput | PoolOrderByWithAggregationInput[]
    by: PoolScalarFieldEnum[] | PoolScalarFieldEnum
    having?: PoolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PoolCountAggregateInputType | true
    _min?: PoolMinAggregateInputType
    _max?: PoolMaxAggregateInputType
  }

  export type PoolGroupByOutputType = {
    id: string
    launchId: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt: Date
    _count: PoolCountAggregateOutputType | null
    _min: PoolMinAggregateOutputType | null
    _max: PoolMaxAggregateOutputType | null
  }

  type GetPoolGroupByPayload<T extends PoolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PoolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PoolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PoolGroupByOutputType[P]>
            : GetScalarType<T[P], PoolGroupByOutputType[P]>
        }
      >
    >


  export type PoolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    launchId?: boolean
    poolAddress?: boolean
    configAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    createdAt?: boolean
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
    snapshots?: boolean | Pool$snapshotsArgs<ExtArgs>
    _count?: boolean | PoolCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pool"]>

  export type PoolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    launchId?: boolean
    poolAddress?: boolean
    configAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    createdAt?: boolean
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pool"]>

  export type PoolSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    launchId?: boolean
    poolAddress?: boolean
    configAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    createdAt?: boolean
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pool"]>

  export type PoolSelectScalar = {
    id?: boolean
    launchId?: boolean
    poolAddress?: boolean
    configAddress?: boolean
    baseMint?: boolean
    quoteMint?: boolean
    createdAt?: boolean
  }

  export type PoolOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "launchId" | "poolAddress" | "configAddress" | "baseMint" | "quoteMint" | "createdAt", ExtArgs["result"]["pool"]>
  export type PoolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
    snapshots?: boolean | Pool$snapshotsArgs<ExtArgs>
    _count?: boolean | PoolCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PoolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type PoolIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    launch?: boolean | LaunchDefaultArgs<ExtArgs>
  }

  export type $PoolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pool"
    objects: {
      launch: Prisma.$LaunchPayload<ExtArgs>
      snapshots: Prisma.$MarketSnapshotPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      launchId: string
      poolAddress: string
      configAddress: string
      baseMint: string
      quoteMint: string
      createdAt: Date
    }, ExtArgs["result"]["pool"]>
    composites: {}
  }

  type PoolGetPayload<S extends boolean | null | undefined | PoolDefaultArgs> = $Result.GetResult<Prisma.$PoolPayload, S>

  type PoolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PoolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PoolCountAggregateInputType | true
    }

  export interface PoolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pool'], meta: { name: 'Pool' } }
    /**
     * Find zero or one Pool that matches the filter.
     * @param {PoolFindUniqueArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PoolFindUniqueArgs>(args: SelectSubset<T, PoolFindUniqueArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Pool that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PoolFindUniqueOrThrowArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PoolFindUniqueOrThrowArgs>(args: SelectSubset<T, PoolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pool that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindFirstArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PoolFindFirstArgs>(args?: SelectSubset<T, PoolFindFirstArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pool that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindFirstOrThrowArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PoolFindFirstOrThrowArgs>(args?: SelectSubset<T, PoolFindFirstOrThrowArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pools that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pools
     * const pools = await prisma.pool.findMany()
     * 
     * // Get first 10 Pools
     * const pools = await prisma.pool.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const poolWithIdOnly = await prisma.pool.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PoolFindManyArgs>(args?: SelectSubset<T, PoolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Pool.
     * @param {PoolCreateArgs} args - Arguments to create a Pool.
     * @example
     * // Create one Pool
     * const Pool = await prisma.pool.create({
     *   data: {
     *     // ... data to create a Pool
     *   }
     * })
     * 
     */
    create<T extends PoolCreateArgs>(args: SelectSubset<T, PoolCreateArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pools.
     * @param {PoolCreateManyArgs} args - Arguments to create many Pools.
     * @example
     * // Create many Pools
     * const pool = await prisma.pool.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PoolCreateManyArgs>(args?: SelectSubset<T, PoolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pools and returns the data saved in the database.
     * @param {PoolCreateManyAndReturnArgs} args - Arguments to create many Pools.
     * @example
     * // Create many Pools
     * const pool = await prisma.pool.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pools and only return the `id`
     * const poolWithIdOnly = await prisma.pool.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PoolCreateManyAndReturnArgs>(args?: SelectSubset<T, PoolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Pool.
     * @param {PoolDeleteArgs} args - Arguments to delete one Pool.
     * @example
     * // Delete one Pool
     * const Pool = await prisma.pool.delete({
     *   where: {
     *     // ... filter to delete one Pool
     *   }
     * })
     * 
     */
    delete<T extends PoolDeleteArgs>(args: SelectSubset<T, PoolDeleteArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Pool.
     * @param {PoolUpdateArgs} args - Arguments to update one Pool.
     * @example
     * // Update one Pool
     * const pool = await prisma.pool.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PoolUpdateArgs>(args: SelectSubset<T, PoolUpdateArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pools.
     * @param {PoolDeleteManyArgs} args - Arguments to filter Pools to delete.
     * @example
     * // Delete a few Pools
     * const { count } = await prisma.pool.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PoolDeleteManyArgs>(args?: SelectSubset<T, PoolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pools
     * const pool = await prisma.pool.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PoolUpdateManyArgs>(args: SelectSubset<T, PoolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pools and returns the data updated in the database.
     * @param {PoolUpdateManyAndReturnArgs} args - Arguments to update many Pools.
     * @example
     * // Update many Pools
     * const pool = await prisma.pool.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pools and only return the `id`
     * const poolWithIdOnly = await prisma.pool.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PoolUpdateManyAndReturnArgs>(args: SelectSubset<T, PoolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Pool.
     * @param {PoolUpsertArgs} args - Arguments to update or create a Pool.
     * @example
     * // Update or create a Pool
     * const pool = await prisma.pool.upsert({
     *   create: {
     *     // ... data to create a Pool
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pool we want to update
     *   }
     * })
     */
    upsert<T extends PoolUpsertArgs>(args: SelectSubset<T, PoolUpsertArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolCountArgs} args - Arguments to filter Pools to count.
     * @example
     * // Count the number of Pools
     * const count = await prisma.pool.count({
     *   where: {
     *     // ... the filter for the Pools we want to count
     *   }
     * })
    **/
    count<T extends PoolCountArgs>(
      args?: Subset<T, PoolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PoolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pool.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PoolAggregateArgs>(args: Subset<T, PoolAggregateArgs>): Prisma.PrismaPromise<GetPoolAggregateType<T>>

    /**
     * Group by Pool.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PoolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PoolGroupByArgs['orderBy'] }
        : { orderBy?: PoolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PoolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPoolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pool model
   */
  readonly fields: PoolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pool.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PoolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    launch<T extends LaunchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LaunchDefaultArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    snapshots<T extends Pool$snapshotsArgs<ExtArgs> = {}>(args?: Subset<T, Pool$snapshotsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pool model
   */
  interface PoolFieldRefs {
    readonly id: FieldRef<"Pool", 'String'>
    readonly launchId: FieldRef<"Pool", 'String'>
    readonly poolAddress: FieldRef<"Pool", 'String'>
    readonly configAddress: FieldRef<"Pool", 'String'>
    readonly baseMint: FieldRef<"Pool", 'String'>
    readonly quoteMint: FieldRef<"Pool", 'String'>
    readonly createdAt: FieldRef<"Pool", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pool findUnique
   */
  export type PoolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool findUniqueOrThrow
   */
  export type PoolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool findFirst
   */
  export type PoolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pools.
     */
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool findFirstOrThrow
   */
  export type PoolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pools.
     */
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool findMany
   */
  export type PoolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pools to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool create
   */
  export type PoolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The data needed to create a Pool.
     */
    data: XOR<PoolCreateInput, PoolUncheckedCreateInput>
  }

  /**
   * Pool createMany
   */
  export type PoolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pools.
     */
    data: PoolCreateManyInput | PoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pool createManyAndReturn
   */
  export type PoolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * The data used to create many Pools.
     */
    data: PoolCreateManyInput | PoolCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pool update
   */
  export type PoolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The data needed to update a Pool.
     */
    data: XOR<PoolUpdateInput, PoolUncheckedUpdateInput>
    /**
     * Choose, which Pool to update.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool updateMany
   */
  export type PoolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pools.
     */
    data: XOR<PoolUpdateManyMutationInput, PoolUncheckedUpdateManyInput>
    /**
     * Filter which Pools to update
     */
    where?: PoolWhereInput
    /**
     * Limit how many Pools to update.
     */
    limit?: number
  }

  /**
   * Pool updateManyAndReturn
   */
  export type PoolUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * The data used to update Pools.
     */
    data: XOR<PoolUpdateManyMutationInput, PoolUncheckedUpdateManyInput>
    /**
     * Filter which Pools to update
     */
    where?: PoolWhereInput
    /**
     * Limit how many Pools to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pool upsert
   */
  export type PoolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The filter to search for the Pool to update in case it exists.
     */
    where: PoolWhereUniqueInput
    /**
     * In case the Pool found by the `where` argument doesn't exist, create a new Pool with this data.
     */
    create: XOR<PoolCreateInput, PoolUncheckedCreateInput>
    /**
     * In case the Pool was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PoolUpdateInput, PoolUncheckedUpdateInput>
  }

  /**
   * Pool delete
   */
  export type PoolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter which Pool to delete.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool deleteMany
   */
  export type PoolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pools to delete
     */
    where?: PoolWhereInput
    /**
     * Limit how many Pools to delete.
     */
    limit?: number
  }

  /**
   * Pool.snapshots
   */
  export type Pool$snapshotsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    where?: MarketSnapshotWhereInput
    orderBy?: MarketSnapshotOrderByWithRelationInput | MarketSnapshotOrderByWithRelationInput[]
    cursor?: MarketSnapshotWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MarketSnapshotScalarFieldEnum | MarketSnapshotScalarFieldEnum[]
  }

  /**
   * Pool without action
   */
  export type PoolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pool
     */
    omit?: PoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
  }


  /**
   * Model MarketSnapshot
   */

  export type AggregateMarketSnapshot = {
    _count: MarketSnapshotCountAggregateOutputType | null
    _avg: MarketSnapshotAvgAggregateOutputType | null
    _sum: MarketSnapshotSumAggregateOutputType | null
    _min: MarketSnapshotMinAggregateOutputType | null
    _max: MarketSnapshotMaxAggregateOutputType | null
  }

  export type MarketSnapshotAvgAggregateOutputType = {
    priceUsd: number | null
    volume24hUsd: number | null
    liquidityUsd: number | null
    quoteReserve: number | null
    baseReserve: number | null
    curveProgress: number | null
    migrationThresholdUsd: number | null
    graduationProgress: number | null
    estimatedSlippageBps: number | null
  }

  export type MarketSnapshotSumAggregateOutputType = {
    priceUsd: number | null
    volume24hUsd: number | null
    liquidityUsd: number | null
    quoteReserve: number | null
    baseReserve: number | null
    curveProgress: number | null
    migrationThresholdUsd: number | null
    graduationProgress: number | null
    estimatedSlippageBps: number | null
  }

  export type MarketSnapshotMinAggregateOutputType = {
    id: string | null
    poolAddress: string | null
    priceUsd: number | null
    volume24hUsd: number | null
    liquidityUsd: number | null
    quoteReserve: number | null
    baseReserve: number | null
    curveProgress: number | null
    migrationThresholdUsd: number | null
    graduationProgress: number | null
    estimatedSlippageBps: number | null
    regime: $Enums.MarketRegime | null
    status: $Enums.PoolStatus | null
    timestamp: Date | null
  }

  export type MarketSnapshotMaxAggregateOutputType = {
    id: string | null
    poolAddress: string | null
    priceUsd: number | null
    volume24hUsd: number | null
    liquidityUsd: number | null
    quoteReserve: number | null
    baseReserve: number | null
    curveProgress: number | null
    migrationThresholdUsd: number | null
    graduationProgress: number | null
    estimatedSlippageBps: number | null
    regime: $Enums.MarketRegime | null
    status: $Enums.PoolStatus | null
    timestamp: Date | null
  }

  export type MarketSnapshotCountAggregateOutputType = {
    id: number
    poolAddress: number
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: number
    regime: number
    status: number
    timestamp: number
    _all: number
  }


  export type MarketSnapshotAvgAggregateInputType = {
    priceUsd?: true
    volume24hUsd?: true
    liquidityUsd?: true
    quoteReserve?: true
    baseReserve?: true
    curveProgress?: true
    migrationThresholdUsd?: true
    graduationProgress?: true
    estimatedSlippageBps?: true
  }

  export type MarketSnapshotSumAggregateInputType = {
    priceUsd?: true
    volume24hUsd?: true
    liquidityUsd?: true
    quoteReserve?: true
    baseReserve?: true
    curveProgress?: true
    migrationThresholdUsd?: true
    graduationProgress?: true
    estimatedSlippageBps?: true
  }

  export type MarketSnapshotMinAggregateInputType = {
    id?: true
    poolAddress?: true
    priceUsd?: true
    volume24hUsd?: true
    liquidityUsd?: true
    quoteReserve?: true
    baseReserve?: true
    curveProgress?: true
    migrationThresholdUsd?: true
    graduationProgress?: true
    estimatedSlippageBps?: true
    regime?: true
    status?: true
    timestamp?: true
  }

  export type MarketSnapshotMaxAggregateInputType = {
    id?: true
    poolAddress?: true
    priceUsd?: true
    volume24hUsd?: true
    liquidityUsd?: true
    quoteReserve?: true
    baseReserve?: true
    curveProgress?: true
    migrationThresholdUsd?: true
    graduationProgress?: true
    estimatedSlippageBps?: true
    regime?: true
    status?: true
    timestamp?: true
  }

  export type MarketSnapshotCountAggregateInputType = {
    id?: true
    poolAddress?: true
    priceUsd?: true
    volume24hUsd?: true
    liquidityUsd?: true
    quoteReserve?: true
    baseReserve?: true
    curveProgress?: true
    migrationThresholdUsd?: true
    graduationProgress?: true
    estimatedSlippageBps?: true
    marketQualityScore?: true
    regime?: true
    status?: true
    timestamp?: true
    _all?: true
  }

  export type MarketSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketSnapshot to aggregate.
     */
    where?: MarketSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketSnapshots to fetch.
     */
    orderBy?: MarketSnapshotOrderByWithRelationInput | MarketSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarketSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarketSnapshots
    **/
    _count?: true | MarketSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MarketSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MarketSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarketSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarketSnapshotMaxAggregateInputType
  }

  export type GetMarketSnapshotAggregateType<T extends MarketSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateMarketSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarketSnapshot[P]>
      : GetScalarType<T[P], AggregateMarketSnapshot[P]>
  }




  export type MarketSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketSnapshotWhereInput
    orderBy?: MarketSnapshotOrderByWithAggregationInput | MarketSnapshotOrderByWithAggregationInput[]
    by: MarketSnapshotScalarFieldEnum[] | MarketSnapshotScalarFieldEnum
    having?: MarketSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarketSnapshotCountAggregateInputType | true
    _avg?: MarketSnapshotAvgAggregateInputType
    _sum?: MarketSnapshotSumAggregateInputType
    _min?: MarketSnapshotMinAggregateInputType
    _max?: MarketSnapshotMaxAggregateInputType
  }

  export type MarketSnapshotGroupByOutputType = {
    id: string
    poolAddress: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp: Date
    _count: MarketSnapshotCountAggregateOutputType | null
    _avg: MarketSnapshotAvgAggregateOutputType | null
    _sum: MarketSnapshotSumAggregateOutputType | null
    _min: MarketSnapshotMinAggregateOutputType | null
    _max: MarketSnapshotMaxAggregateOutputType | null
  }

  type GetMarketSnapshotGroupByPayload<T extends MarketSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarketSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarketSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarketSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], MarketSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type MarketSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolAddress?: boolean
    priceUsd?: boolean
    volume24hUsd?: boolean
    liquidityUsd?: boolean
    quoteReserve?: boolean
    baseReserve?: boolean
    curveProgress?: boolean
    migrationThresholdUsd?: boolean
    graduationProgress?: boolean
    estimatedSlippageBps?: boolean
    marketQualityScore?: boolean
    regime?: boolean
    status?: boolean
    timestamp?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketSnapshot"]>

  export type MarketSnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolAddress?: boolean
    priceUsd?: boolean
    volume24hUsd?: boolean
    liquidityUsd?: boolean
    quoteReserve?: boolean
    baseReserve?: boolean
    curveProgress?: boolean
    migrationThresholdUsd?: boolean
    graduationProgress?: boolean
    estimatedSlippageBps?: boolean
    marketQualityScore?: boolean
    regime?: boolean
    status?: boolean
    timestamp?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketSnapshot"]>

  export type MarketSnapshotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolAddress?: boolean
    priceUsd?: boolean
    volume24hUsd?: boolean
    liquidityUsd?: boolean
    quoteReserve?: boolean
    baseReserve?: boolean
    curveProgress?: boolean
    migrationThresholdUsd?: boolean
    graduationProgress?: boolean
    estimatedSlippageBps?: boolean
    marketQualityScore?: boolean
    regime?: boolean
    status?: boolean
    timestamp?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketSnapshot"]>

  export type MarketSnapshotSelectScalar = {
    id?: boolean
    poolAddress?: boolean
    priceUsd?: boolean
    volume24hUsd?: boolean
    liquidityUsd?: boolean
    quoteReserve?: boolean
    baseReserve?: boolean
    curveProgress?: boolean
    migrationThresholdUsd?: boolean
    graduationProgress?: boolean
    estimatedSlippageBps?: boolean
    marketQualityScore?: boolean
    regime?: boolean
    status?: boolean
    timestamp?: boolean
  }

  export type MarketSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "poolAddress" | "priceUsd" | "volume24hUsd" | "liquidityUsd" | "quoteReserve" | "baseReserve" | "curveProgress" | "migrationThresholdUsd" | "graduationProgress" | "estimatedSlippageBps" | "marketQualityScore" | "regime" | "status" | "timestamp", ExtArgs["result"]["marketSnapshot"]>
  export type MarketSnapshotInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }
  export type MarketSnapshotIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }
  export type MarketSnapshotIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }

  export type $MarketSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarketSnapshot"
    objects: {
      pool: Prisma.$PoolPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poolAddress: string
      priceUsd: number
      volume24hUsd: number
      liquidityUsd: number
      quoteReserve: number
      baseReserve: number
      curveProgress: number
      migrationThresholdUsd: number
      graduationProgress: number
      estimatedSlippageBps: number
      marketQualityScore: Prisma.JsonValue
      regime: $Enums.MarketRegime
      status: $Enums.PoolStatus
      timestamp: Date
    }, ExtArgs["result"]["marketSnapshot"]>
    composites: {}
  }

  type MarketSnapshotGetPayload<S extends boolean | null | undefined | MarketSnapshotDefaultArgs> = $Result.GetResult<Prisma.$MarketSnapshotPayload, S>

  type MarketSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MarketSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MarketSnapshotCountAggregateInputType | true
    }

  export interface MarketSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarketSnapshot'], meta: { name: 'MarketSnapshot' } }
    /**
     * Find zero or one MarketSnapshot that matches the filter.
     * @param {MarketSnapshotFindUniqueArgs} args - Arguments to find a MarketSnapshot
     * @example
     * // Get one MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarketSnapshotFindUniqueArgs>(args: SelectSubset<T, MarketSnapshotFindUniqueArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MarketSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MarketSnapshotFindUniqueOrThrowArgs} args - Arguments to find a MarketSnapshot
     * @example
     * // Get one MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarketSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, MarketSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotFindFirstArgs} args - Arguments to find a MarketSnapshot
     * @example
     * // Get one MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarketSnapshotFindFirstArgs>(args?: SelectSubset<T, MarketSnapshotFindFirstArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotFindFirstOrThrowArgs} args - Arguments to find a MarketSnapshot
     * @example
     * // Get one MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarketSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, MarketSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MarketSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarketSnapshots
     * const marketSnapshots = await prisma.marketSnapshot.findMany()
     * 
     * // Get first 10 MarketSnapshots
     * const marketSnapshots = await prisma.marketSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const marketSnapshotWithIdOnly = await prisma.marketSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarketSnapshotFindManyArgs>(args?: SelectSubset<T, MarketSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MarketSnapshot.
     * @param {MarketSnapshotCreateArgs} args - Arguments to create a MarketSnapshot.
     * @example
     * // Create one MarketSnapshot
     * const MarketSnapshot = await prisma.marketSnapshot.create({
     *   data: {
     *     // ... data to create a MarketSnapshot
     *   }
     * })
     * 
     */
    create<T extends MarketSnapshotCreateArgs>(args: SelectSubset<T, MarketSnapshotCreateArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MarketSnapshots.
     * @param {MarketSnapshotCreateManyArgs} args - Arguments to create many MarketSnapshots.
     * @example
     * // Create many MarketSnapshots
     * const marketSnapshot = await prisma.marketSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarketSnapshotCreateManyArgs>(args?: SelectSubset<T, MarketSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MarketSnapshots and returns the data saved in the database.
     * @param {MarketSnapshotCreateManyAndReturnArgs} args - Arguments to create many MarketSnapshots.
     * @example
     * // Create many MarketSnapshots
     * const marketSnapshot = await prisma.marketSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MarketSnapshots and only return the `id`
     * const marketSnapshotWithIdOnly = await prisma.marketSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MarketSnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, MarketSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MarketSnapshot.
     * @param {MarketSnapshotDeleteArgs} args - Arguments to delete one MarketSnapshot.
     * @example
     * // Delete one MarketSnapshot
     * const MarketSnapshot = await prisma.marketSnapshot.delete({
     *   where: {
     *     // ... filter to delete one MarketSnapshot
     *   }
     * })
     * 
     */
    delete<T extends MarketSnapshotDeleteArgs>(args: SelectSubset<T, MarketSnapshotDeleteArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MarketSnapshot.
     * @param {MarketSnapshotUpdateArgs} args - Arguments to update one MarketSnapshot.
     * @example
     * // Update one MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarketSnapshotUpdateArgs>(args: SelectSubset<T, MarketSnapshotUpdateArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MarketSnapshots.
     * @param {MarketSnapshotDeleteManyArgs} args - Arguments to filter MarketSnapshots to delete.
     * @example
     * // Delete a few MarketSnapshots
     * const { count } = await prisma.marketSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarketSnapshotDeleteManyArgs>(args?: SelectSubset<T, MarketSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarketSnapshots
     * const marketSnapshot = await prisma.marketSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarketSnapshotUpdateManyArgs>(args: SelectSubset<T, MarketSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketSnapshots and returns the data updated in the database.
     * @param {MarketSnapshotUpdateManyAndReturnArgs} args - Arguments to update many MarketSnapshots.
     * @example
     * // Update many MarketSnapshots
     * const marketSnapshot = await prisma.marketSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MarketSnapshots and only return the `id`
     * const marketSnapshotWithIdOnly = await prisma.marketSnapshot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MarketSnapshotUpdateManyAndReturnArgs>(args: SelectSubset<T, MarketSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MarketSnapshot.
     * @param {MarketSnapshotUpsertArgs} args - Arguments to update or create a MarketSnapshot.
     * @example
     * // Update or create a MarketSnapshot
     * const marketSnapshot = await prisma.marketSnapshot.upsert({
     *   create: {
     *     // ... data to create a MarketSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarketSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends MarketSnapshotUpsertArgs>(args: SelectSubset<T, MarketSnapshotUpsertArgs<ExtArgs>>): Prisma__MarketSnapshotClient<$Result.GetResult<Prisma.$MarketSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MarketSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotCountArgs} args - Arguments to filter MarketSnapshots to count.
     * @example
     * // Count the number of MarketSnapshots
     * const count = await prisma.marketSnapshot.count({
     *   where: {
     *     // ... the filter for the MarketSnapshots we want to count
     *   }
     * })
    **/
    count<T extends MarketSnapshotCountArgs>(
      args?: Subset<T, MarketSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarketSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarketSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarketSnapshotAggregateArgs>(args: Subset<T, MarketSnapshotAggregateArgs>): Prisma.PrismaPromise<GetMarketSnapshotAggregateType<T>>

    /**
     * Group by MarketSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarketSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarketSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: MarketSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarketSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarketSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarketSnapshot model
   */
  readonly fields: MarketSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarketSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarketSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pool<T extends PoolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PoolDefaultArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarketSnapshot model
   */
  interface MarketSnapshotFieldRefs {
    readonly id: FieldRef<"MarketSnapshot", 'String'>
    readonly poolAddress: FieldRef<"MarketSnapshot", 'String'>
    readonly priceUsd: FieldRef<"MarketSnapshot", 'Float'>
    readonly volume24hUsd: FieldRef<"MarketSnapshot", 'Float'>
    readonly liquidityUsd: FieldRef<"MarketSnapshot", 'Float'>
    readonly quoteReserve: FieldRef<"MarketSnapshot", 'Float'>
    readonly baseReserve: FieldRef<"MarketSnapshot", 'Float'>
    readonly curveProgress: FieldRef<"MarketSnapshot", 'Float'>
    readonly migrationThresholdUsd: FieldRef<"MarketSnapshot", 'Float'>
    readonly graduationProgress: FieldRef<"MarketSnapshot", 'Float'>
    readonly estimatedSlippageBps: FieldRef<"MarketSnapshot", 'Float'>
    readonly marketQualityScore: FieldRef<"MarketSnapshot", 'Json'>
    readonly regime: FieldRef<"MarketSnapshot", 'MarketRegime'>
    readonly status: FieldRef<"MarketSnapshot", 'PoolStatus'>
    readonly timestamp: FieldRef<"MarketSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MarketSnapshot findUnique
   */
  export type MarketSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter, which MarketSnapshot to fetch.
     */
    where: MarketSnapshotWhereUniqueInput
  }

  /**
   * MarketSnapshot findUniqueOrThrow
   */
  export type MarketSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter, which MarketSnapshot to fetch.
     */
    where: MarketSnapshotWhereUniqueInput
  }

  /**
   * MarketSnapshot findFirst
   */
  export type MarketSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter, which MarketSnapshot to fetch.
     */
    where?: MarketSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketSnapshots to fetch.
     */
    orderBy?: MarketSnapshotOrderByWithRelationInput | MarketSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketSnapshots.
     */
    cursor?: MarketSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketSnapshots.
     */
    distinct?: MarketSnapshotScalarFieldEnum | MarketSnapshotScalarFieldEnum[]
  }

  /**
   * MarketSnapshot findFirstOrThrow
   */
  export type MarketSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter, which MarketSnapshot to fetch.
     */
    where?: MarketSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketSnapshots to fetch.
     */
    orderBy?: MarketSnapshotOrderByWithRelationInput | MarketSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketSnapshots.
     */
    cursor?: MarketSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketSnapshots.
     */
    distinct?: MarketSnapshotScalarFieldEnum | MarketSnapshotScalarFieldEnum[]
  }

  /**
   * MarketSnapshot findMany
   */
  export type MarketSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter, which MarketSnapshots to fetch.
     */
    where?: MarketSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketSnapshots to fetch.
     */
    orderBy?: MarketSnapshotOrderByWithRelationInput | MarketSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarketSnapshots.
     */
    cursor?: MarketSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketSnapshots.
     */
    skip?: number
    distinct?: MarketSnapshotScalarFieldEnum | MarketSnapshotScalarFieldEnum[]
  }

  /**
   * MarketSnapshot create
   */
  export type MarketSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * The data needed to create a MarketSnapshot.
     */
    data: XOR<MarketSnapshotCreateInput, MarketSnapshotUncheckedCreateInput>
  }

  /**
   * MarketSnapshot createMany
   */
  export type MarketSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarketSnapshots.
     */
    data: MarketSnapshotCreateManyInput | MarketSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketSnapshot createManyAndReturn
   */
  export type MarketSnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * The data used to create many MarketSnapshots.
     */
    data: MarketSnapshotCreateManyInput | MarketSnapshotCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketSnapshot update
   */
  export type MarketSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * The data needed to update a MarketSnapshot.
     */
    data: XOR<MarketSnapshotUpdateInput, MarketSnapshotUncheckedUpdateInput>
    /**
     * Choose, which MarketSnapshot to update.
     */
    where: MarketSnapshotWhereUniqueInput
  }

  /**
   * MarketSnapshot updateMany
   */
  export type MarketSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarketSnapshots.
     */
    data: XOR<MarketSnapshotUpdateManyMutationInput, MarketSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which MarketSnapshots to update
     */
    where?: MarketSnapshotWhereInput
    /**
     * Limit how many MarketSnapshots to update.
     */
    limit?: number
  }

  /**
   * MarketSnapshot updateManyAndReturn
   */
  export type MarketSnapshotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * The data used to update MarketSnapshots.
     */
    data: XOR<MarketSnapshotUpdateManyMutationInput, MarketSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which MarketSnapshots to update
     */
    where?: MarketSnapshotWhereInput
    /**
     * Limit how many MarketSnapshots to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketSnapshot upsert
   */
  export type MarketSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * The filter to search for the MarketSnapshot to update in case it exists.
     */
    where: MarketSnapshotWhereUniqueInput
    /**
     * In case the MarketSnapshot found by the `where` argument doesn't exist, create a new MarketSnapshot with this data.
     */
    create: XOR<MarketSnapshotCreateInput, MarketSnapshotUncheckedCreateInput>
    /**
     * In case the MarketSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarketSnapshotUpdateInput, MarketSnapshotUncheckedUpdateInput>
  }

  /**
   * MarketSnapshot delete
   */
  export type MarketSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
    /**
     * Filter which MarketSnapshot to delete.
     */
    where: MarketSnapshotWhereUniqueInput
  }

  /**
   * MarketSnapshot deleteMany
   */
  export type MarketSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketSnapshots to delete
     */
    where?: MarketSnapshotWhereInput
    /**
     * Limit how many MarketSnapshots to delete.
     */
    limit?: number
  }

  /**
   * MarketSnapshot without action
   */
  export type MarketSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketSnapshot
     */
    select?: MarketSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketSnapshot
     */
    omit?: MarketSnapshotOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketSnapshotInclude<ExtArgs> | null
  }


  /**
   * Model Trade
   */

  export type AggregateTrade = {
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  export type TradeAvgAggregateOutputType = {
    tokenAmount: number | null
    quoteAmount: number | null
    priceUsd: number | null
  }

  export type TradeSumAggregateOutputType = {
    tokenAmount: number | null
    quoteAmount: number | null
    priceUsd: number | null
  }

  export type TradeMinAggregateOutputType = {
    id: string | null
    marketId: string | null
    signature: string | null
    trader: string | null
    side: $Enums.TradeSide | null
    tokenAmount: number | null
    quoteAmount: number | null
    priceUsd: number | null
    timestamp: Date | null
  }

  export type TradeMaxAggregateOutputType = {
    id: string | null
    marketId: string | null
    signature: string | null
    trader: string | null
    side: $Enums.TradeSide | null
    tokenAmount: number | null
    quoteAmount: number | null
    priceUsd: number | null
    timestamp: Date | null
  }

  export type TradeCountAggregateOutputType = {
    id: number
    marketId: number
    signature: number
    trader: number
    side: number
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: number
    _all: number
  }


  export type TradeAvgAggregateInputType = {
    tokenAmount?: true
    quoteAmount?: true
    priceUsd?: true
  }

  export type TradeSumAggregateInputType = {
    tokenAmount?: true
    quoteAmount?: true
    priceUsd?: true
  }

  export type TradeMinAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    trader?: true
    side?: true
    tokenAmount?: true
    quoteAmount?: true
    priceUsd?: true
    timestamp?: true
  }

  export type TradeMaxAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    trader?: true
    side?: true
    tokenAmount?: true
    quoteAmount?: true
    priceUsd?: true
    timestamp?: true
  }

  export type TradeCountAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    trader?: true
    side?: true
    tokenAmount?: true
    quoteAmount?: true
    priceUsd?: true
    timestamp?: true
    _all?: true
  }

  export type TradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trade to aggregate.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trades
    **/
    _count?: true | TradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TradeMaxAggregateInputType
  }

  export type GetTradeAggregateType<T extends TradeAggregateArgs> = {
        [P in keyof T & keyof AggregateTrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrade[P]>
      : GetScalarType<T[P], AggregateTrade[P]>
  }




  export type TradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithAggregationInput | TradeOrderByWithAggregationInput[]
    by: TradeScalarFieldEnum[] | TradeScalarFieldEnum
    having?: TradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TradeCountAggregateInputType | true
    _avg?: TradeAvgAggregateInputType
    _sum?: TradeSumAggregateInputType
    _min?: TradeMinAggregateInputType
    _max?: TradeMaxAggregateInputType
  }

  export type TradeGroupByOutputType = {
    id: string
    marketId: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  type GetTradeGroupByPayload<T extends TradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TradeGroupByOutputType[P]>
            : GetScalarType<T[P], TradeGroupByOutputType[P]>
        }
      >
    >


  export type TradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    trader?: boolean
    side?: boolean
    tokenAmount?: boolean
    quoteAmount?: boolean
    priceUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    trader?: boolean
    side?: boolean
    tokenAmount?: boolean
    quoteAmount?: boolean
    priceUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    trader?: boolean
    side?: boolean
    tokenAmount?: boolean
    quoteAmount?: boolean
    priceUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectScalar = {
    id?: boolean
    marketId?: boolean
    signature?: boolean
    trader?: boolean
    side?: boolean
    tokenAmount?: boolean
    quoteAmount?: boolean
    priceUsd?: boolean
    timestamp?: boolean
  }

  export type TradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "marketId" | "signature" | "trader" | "side" | "tokenAmount" | "quoteAmount" | "priceUsd" | "timestamp", ExtArgs["result"]["trade"]>
  export type TradeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type TradeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type TradeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }

  export type $TradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trade"
    objects: {
      market: Prisma.$LaunchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      marketId: string
      signature: string
      trader: string
      side: $Enums.TradeSide
      tokenAmount: number
      quoteAmount: number
      priceUsd: number
      timestamp: Date
    }, ExtArgs["result"]["trade"]>
    composites: {}
  }

  type TradeGetPayload<S extends boolean | null | undefined | TradeDefaultArgs> = $Result.GetResult<Prisma.$TradePayload, S>

  type TradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TradeCountAggregateInputType | true
    }

  export interface TradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trade'], meta: { name: 'Trade' } }
    /**
     * Find zero or one Trade that matches the filter.
     * @param {TradeFindUniqueArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TradeFindUniqueArgs>(args: SelectSubset<T, TradeFindUniqueArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Trade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TradeFindUniqueOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TradeFindUniqueOrThrowArgs>(args: SelectSubset<T, TradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TradeFindFirstArgs>(args?: SelectSubset<T, TradeFindFirstArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TradeFindFirstOrThrowArgs>(args?: SelectSubset<T, TradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Trades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trades
     * const trades = await prisma.trade.findMany()
     * 
     * // Get first 10 Trades
     * const trades = await prisma.trade.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tradeWithIdOnly = await prisma.trade.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TradeFindManyArgs>(args?: SelectSubset<T, TradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Trade.
     * @param {TradeCreateArgs} args - Arguments to create a Trade.
     * @example
     * // Create one Trade
     * const Trade = await prisma.trade.create({
     *   data: {
     *     // ... data to create a Trade
     *   }
     * })
     * 
     */
    create<T extends TradeCreateArgs>(args: SelectSubset<T, TradeCreateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Trades.
     * @param {TradeCreateManyArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TradeCreateManyArgs>(args?: SelectSubset<T, TradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trades and returns the data saved in the database.
     * @param {TradeCreateManyAndReturnArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TradeCreateManyAndReturnArgs>(args?: SelectSubset<T, TradeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Trade.
     * @param {TradeDeleteArgs} args - Arguments to delete one Trade.
     * @example
     * // Delete one Trade
     * const Trade = await prisma.trade.delete({
     *   where: {
     *     // ... filter to delete one Trade
     *   }
     * })
     * 
     */
    delete<T extends TradeDeleteArgs>(args: SelectSubset<T, TradeDeleteArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Trade.
     * @param {TradeUpdateArgs} args - Arguments to update one Trade.
     * @example
     * // Update one Trade
     * const trade = await prisma.trade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TradeUpdateArgs>(args: SelectSubset<T, TradeUpdateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Trades.
     * @param {TradeDeleteManyArgs} args - Arguments to filter Trades to delete.
     * @example
     * // Delete a few Trades
     * const { count } = await prisma.trade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TradeDeleteManyArgs>(args?: SelectSubset<T, TradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TradeUpdateManyArgs>(args: SelectSubset<T, TradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades and returns the data updated in the database.
     * @param {TradeUpdateManyAndReturnArgs} args - Arguments to update many Trades.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TradeUpdateManyAndReturnArgs>(args: SelectSubset<T, TradeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Trade.
     * @param {TradeUpsertArgs} args - Arguments to update or create a Trade.
     * @example
     * // Update or create a Trade
     * const trade = await prisma.trade.upsert({
     *   create: {
     *     // ... data to create a Trade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trade we want to update
     *   }
     * })
     */
    upsert<T extends TradeUpsertArgs>(args: SelectSubset<T, TradeUpsertArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeCountArgs} args - Arguments to filter Trades to count.
     * @example
     * // Count the number of Trades
     * const count = await prisma.trade.count({
     *   where: {
     *     // ... the filter for the Trades we want to count
     *   }
     * })
    **/
    count<T extends TradeCountArgs>(
      args?: Subset<T, TradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TradeAggregateArgs>(args: Subset<T, TradeAggregateArgs>): Prisma.PrismaPromise<GetTradeAggregateType<T>>

    /**
     * Group by Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TradeGroupByArgs['orderBy'] }
        : { orderBy?: TradeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trade model
   */
  readonly fields: TradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    market<T extends LaunchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LaunchDefaultArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trade model
   */
  interface TradeFieldRefs {
    readonly id: FieldRef<"Trade", 'String'>
    readonly marketId: FieldRef<"Trade", 'String'>
    readonly signature: FieldRef<"Trade", 'String'>
    readonly trader: FieldRef<"Trade", 'String'>
    readonly side: FieldRef<"Trade", 'TradeSide'>
    readonly tokenAmount: FieldRef<"Trade", 'Float'>
    readonly quoteAmount: FieldRef<"Trade", 'Float'>
    readonly priceUsd: FieldRef<"Trade", 'Float'>
    readonly timestamp: FieldRef<"Trade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Trade findUnique
   */
  export type TradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findUniqueOrThrow
   */
  export type TradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findFirst
   */
  export type TradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findFirstOrThrow
   */
  export type TradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findMany
   */
  export type TradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trades to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade create
   */
  export type TradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to create a Trade.
     */
    data: XOR<TradeCreateInput, TradeUncheckedCreateInput>
  }

  /**
   * Trade createMany
   */
  export type TradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trade createManyAndReturn
   */
  export type TradeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trade update
   */
  export type TradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to update a Trade.
     */
    data: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
    /**
     * Choose, which Trade to update.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade updateMany
   */
  export type TradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
  }

  /**
   * Trade updateManyAndReturn
   */
  export type TradeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trade upsert
   */
  export type TradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The filter to search for the Trade to update in case it exists.
     */
    where: TradeWhereUniqueInput
    /**
     * In case the Trade found by the `where` argument doesn't exist, create a new Trade with this data.
     */
    create: XOR<TradeCreateInput, TradeUncheckedCreateInput>
    /**
     * In case the Trade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
  }

  /**
   * Trade delete
   */
  export type TradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter which Trade to delete.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade deleteMany
   */
  export type TradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trades to delete
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to delete.
     */
    limit?: number
  }

  /**
   * Trade without action
   */
  export type TradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
  }


  /**
   * Model PriceHistory
   */

  export type AggregatePriceHistory = {
    _count: PriceHistoryCountAggregateOutputType | null
    _avg: PriceHistoryAvgAggregateOutputType | null
    _sum: PriceHistorySumAggregateOutputType | null
    _min: PriceHistoryMinAggregateOutputType | null
    _max: PriceHistoryMaxAggregateOutputType | null
  }

  export type PriceHistoryAvgAggregateOutputType = {
    priceUsd: number | null
  }

  export type PriceHistorySumAggregateOutputType = {
    priceUsd: number | null
  }

  export type PriceHistoryMinAggregateOutputType = {
    id: string | null
    marketId: string | null
    priceUsd: number | null
    source: string | null
    timestamp: Date | null
  }

  export type PriceHistoryMaxAggregateOutputType = {
    id: string | null
    marketId: string | null
    priceUsd: number | null
    source: string | null
    timestamp: Date | null
  }

  export type PriceHistoryCountAggregateOutputType = {
    id: number
    marketId: number
    priceUsd: number
    source: number
    timestamp: number
    _all: number
  }


  export type PriceHistoryAvgAggregateInputType = {
    priceUsd?: true
  }

  export type PriceHistorySumAggregateInputType = {
    priceUsd?: true
  }

  export type PriceHistoryMinAggregateInputType = {
    id?: true
    marketId?: true
    priceUsd?: true
    source?: true
    timestamp?: true
  }

  export type PriceHistoryMaxAggregateInputType = {
    id?: true
    marketId?: true
    priceUsd?: true
    source?: true
    timestamp?: true
  }

  export type PriceHistoryCountAggregateInputType = {
    id?: true
    marketId?: true
    priceUsd?: true
    source?: true
    timestamp?: true
    _all?: true
  }

  export type PriceHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceHistory to aggregate.
     */
    where?: PriceHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceHistories to fetch.
     */
    orderBy?: PriceHistoryOrderByWithRelationInput | PriceHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PriceHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PriceHistories
    **/
    _count?: true | PriceHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PriceHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PriceHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PriceHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PriceHistoryMaxAggregateInputType
  }

  export type GetPriceHistoryAggregateType<T extends PriceHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregatePriceHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePriceHistory[P]>
      : GetScalarType<T[P], AggregatePriceHistory[P]>
  }




  export type PriceHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PriceHistoryWhereInput
    orderBy?: PriceHistoryOrderByWithAggregationInput | PriceHistoryOrderByWithAggregationInput[]
    by: PriceHistoryScalarFieldEnum[] | PriceHistoryScalarFieldEnum
    having?: PriceHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PriceHistoryCountAggregateInputType | true
    _avg?: PriceHistoryAvgAggregateInputType
    _sum?: PriceHistorySumAggregateInputType
    _min?: PriceHistoryMinAggregateInputType
    _max?: PriceHistoryMaxAggregateInputType
  }

  export type PriceHistoryGroupByOutputType = {
    id: string
    marketId: string
    priceUsd: number
    source: string
    timestamp: Date
    _count: PriceHistoryCountAggregateOutputType | null
    _avg: PriceHistoryAvgAggregateOutputType | null
    _sum: PriceHistorySumAggregateOutputType | null
    _min: PriceHistoryMinAggregateOutputType | null
    _max: PriceHistoryMaxAggregateOutputType | null
  }

  type GetPriceHistoryGroupByPayload<T extends PriceHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PriceHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PriceHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PriceHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], PriceHistoryGroupByOutputType[P]>
        }
      >
    >


  export type PriceHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    priceUsd?: boolean
    source?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceHistory"]>

  export type PriceHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    priceUsd?: boolean
    source?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceHistory"]>

  export type PriceHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    priceUsd?: boolean
    source?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["priceHistory"]>

  export type PriceHistorySelectScalar = {
    id?: boolean
    marketId?: boolean
    priceUsd?: boolean
    source?: boolean
    timestamp?: boolean
  }

  export type PriceHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "marketId" | "priceUsd" | "source" | "timestamp", ExtArgs["result"]["priceHistory"]>
  export type PriceHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type PriceHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type PriceHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }

  export type $PriceHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PriceHistory"
    objects: {
      market: Prisma.$LaunchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      marketId: string
      priceUsd: number
      source: string
      timestamp: Date
    }, ExtArgs["result"]["priceHistory"]>
    composites: {}
  }

  type PriceHistoryGetPayload<S extends boolean | null | undefined | PriceHistoryDefaultArgs> = $Result.GetResult<Prisma.$PriceHistoryPayload, S>

  type PriceHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PriceHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PriceHistoryCountAggregateInputType | true
    }

  export interface PriceHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PriceHistory'], meta: { name: 'PriceHistory' } }
    /**
     * Find zero or one PriceHistory that matches the filter.
     * @param {PriceHistoryFindUniqueArgs} args - Arguments to find a PriceHistory
     * @example
     * // Get one PriceHistory
     * const priceHistory = await prisma.priceHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PriceHistoryFindUniqueArgs>(args: SelectSubset<T, PriceHistoryFindUniqueArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PriceHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PriceHistoryFindUniqueOrThrowArgs} args - Arguments to find a PriceHistory
     * @example
     * // Get one PriceHistory
     * const priceHistory = await prisma.priceHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PriceHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, PriceHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryFindFirstArgs} args - Arguments to find a PriceHistory
     * @example
     * // Get one PriceHistory
     * const priceHistory = await prisma.priceHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PriceHistoryFindFirstArgs>(args?: SelectSubset<T, PriceHistoryFindFirstArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PriceHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryFindFirstOrThrowArgs} args - Arguments to find a PriceHistory
     * @example
     * // Get one PriceHistory
     * const priceHistory = await prisma.priceHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PriceHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, PriceHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PriceHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PriceHistories
     * const priceHistories = await prisma.priceHistory.findMany()
     * 
     * // Get first 10 PriceHistories
     * const priceHistories = await prisma.priceHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const priceHistoryWithIdOnly = await prisma.priceHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PriceHistoryFindManyArgs>(args?: SelectSubset<T, PriceHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PriceHistory.
     * @param {PriceHistoryCreateArgs} args - Arguments to create a PriceHistory.
     * @example
     * // Create one PriceHistory
     * const PriceHistory = await prisma.priceHistory.create({
     *   data: {
     *     // ... data to create a PriceHistory
     *   }
     * })
     * 
     */
    create<T extends PriceHistoryCreateArgs>(args: SelectSubset<T, PriceHistoryCreateArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PriceHistories.
     * @param {PriceHistoryCreateManyArgs} args - Arguments to create many PriceHistories.
     * @example
     * // Create many PriceHistories
     * const priceHistory = await prisma.priceHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PriceHistoryCreateManyArgs>(args?: SelectSubset<T, PriceHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PriceHistories and returns the data saved in the database.
     * @param {PriceHistoryCreateManyAndReturnArgs} args - Arguments to create many PriceHistories.
     * @example
     * // Create many PriceHistories
     * const priceHistory = await prisma.priceHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PriceHistories and only return the `id`
     * const priceHistoryWithIdOnly = await prisma.priceHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PriceHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, PriceHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PriceHistory.
     * @param {PriceHistoryDeleteArgs} args - Arguments to delete one PriceHistory.
     * @example
     * // Delete one PriceHistory
     * const PriceHistory = await prisma.priceHistory.delete({
     *   where: {
     *     // ... filter to delete one PriceHistory
     *   }
     * })
     * 
     */
    delete<T extends PriceHistoryDeleteArgs>(args: SelectSubset<T, PriceHistoryDeleteArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PriceHistory.
     * @param {PriceHistoryUpdateArgs} args - Arguments to update one PriceHistory.
     * @example
     * // Update one PriceHistory
     * const priceHistory = await prisma.priceHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PriceHistoryUpdateArgs>(args: SelectSubset<T, PriceHistoryUpdateArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PriceHistories.
     * @param {PriceHistoryDeleteManyArgs} args - Arguments to filter PriceHistories to delete.
     * @example
     * // Delete a few PriceHistories
     * const { count } = await prisma.priceHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PriceHistoryDeleteManyArgs>(args?: SelectSubset<T, PriceHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PriceHistories
     * const priceHistory = await prisma.priceHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PriceHistoryUpdateManyArgs>(args: SelectSubset<T, PriceHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PriceHistories and returns the data updated in the database.
     * @param {PriceHistoryUpdateManyAndReturnArgs} args - Arguments to update many PriceHistories.
     * @example
     * // Update many PriceHistories
     * const priceHistory = await prisma.priceHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PriceHistories and only return the `id`
     * const priceHistoryWithIdOnly = await prisma.priceHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PriceHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, PriceHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PriceHistory.
     * @param {PriceHistoryUpsertArgs} args - Arguments to update or create a PriceHistory.
     * @example
     * // Update or create a PriceHistory
     * const priceHistory = await prisma.priceHistory.upsert({
     *   create: {
     *     // ... data to create a PriceHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PriceHistory we want to update
     *   }
     * })
     */
    upsert<T extends PriceHistoryUpsertArgs>(args: SelectSubset<T, PriceHistoryUpsertArgs<ExtArgs>>): Prisma__PriceHistoryClient<$Result.GetResult<Prisma.$PriceHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PriceHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryCountArgs} args - Arguments to filter PriceHistories to count.
     * @example
     * // Count the number of PriceHistories
     * const count = await prisma.priceHistory.count({
     *   where: {
     *     // ... the filter for the PriceHistories we want to count
     *   }
     * })
    **/
    count<T extends PriceHistoryCountArgs>(
      args?: Subset<T, PriceHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PriceHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PriceHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PriceHistoryAggregateArgs>(args: Subset<T, PriceHistoryAggregateArgs>): Prisma.PrismaPromise<GetPriceHistoryAggregateType<T>>

    /**
     * Group by PriceHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PriceHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PriceHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PriceHistoryGroupByArgs['orderBy'] }
        : { orderBy?: PriceHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PriceHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPriceHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PriceHistory model
   */
  readonly fields: PriceHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PriceHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PriceHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    market<T extends LaunchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LaunchDefaultArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PriceHistory model
   */
  interface PriceHistoryFieldRefs {
    readonly id: FieldRef<"PriceHistory", 'String'>
    readonly marketId: FieldRef<"PriceHistory", 'String'>
    readonly priceUsd: FieldRef<"PriceHistory", 'Float'>
    readonly source: FieldRef<"PriceHistory", 'String'>
    readonly timestamp: FieldRef<"PriceHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PriceHistory findUnique
   */
  export type PriceHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PriceHistory to fetch.
     */
    where: PriceHistoryWhereUniqueInput
  }

  /**
   * PriceHistory findUniqueOrThrow
   */
  export type PriceHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PriceHistory to fetch.
     */
    where: PriceHistoryWhereUniqueInput
  }

  /**
   * PriceHistory findFirst
   */
  export type PriceHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PriceHistory to fetch.
     */
    where?: PriceHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceHistories to fetch.
     */
    orderBy?: PriceHistoryOrderByWithRelationInput | PriceHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceHistories.
     */
    cursor?: PriceHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceHistories.
     */
    distinct?: PriceHistoryScalarFieldEnum | PriceHistoryScalarFieldEnum[]
  }

  /**
   * PriceHistory findFirstOrThrow
   */
  export type PriceHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PriceHistory to fetch.
     */
    where?: PriceHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceHistories to fetch.
     */
    orderBy?: PriceHistoryOrderByWithRelationInput | PriceHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PriceHistories.
     */
    cursor?: PriceHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PriceHistories.
     */
    distinct?: PriceHistoryScalarFieldEnum | PriceHistoryScalarFieldEnum[]
  }

  /**
   * PriceHistory findMany
   */
  export type PriceHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter, which PriceHistories to fetch.
     */
    where?: PriceHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PriceHistories to fetch.
     */
    orderBy?: PriceHistoryOrderByWithRelationInput | PriceHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PriceHistories.
     */
    cursor?: PriceHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PriceHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PriceHistories.
     */
    skip?: number
    distinct?: PriceHistoryScalarFieldEnum | PriceHistoryScalarFieldEnum[]
  }

  /**
   * PriceHistory create
   */
  export type PriceHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a PriceHistory.
     */
    data: XOR<PriceHistoryCreateInput, PriceHistoryUncheckedCreateInput>
  }

  /**
   * PriceHistory createMany
   */
  export type PriceHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PriceHistories.
     */
    data: PriceHistoryCreateManyInput | PriceHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PriceHistory createManyAndReturn
   */
  export type PriceHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many PriceHistories.
     */
    data: PriceHistoryCreateManyInput | PriceHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceHistory update
   */
  export type PriceHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a PriceHistory.
     */
    data: XOR<PriceHistoryUpdateInput, PriceHistoryUncheckedUpdateInput>
    /**
     * Choose, which PriceHistory to update.
     */
    where: PriceHistoryWhereUniqueInput
  }

  /**
   * PriceHistory updateMany
   */
  export type PriceHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PriceHistories.
     */
    data: XOR<PriceHistoryUpdateManyMutationInput, PriceHistoryUncheckedUpdateManyInput>
    /**
     * Filter which PriceHistories to update
     */
    where?: PriceHistoryWhereInput
    /**
     * Limit how many PriceHistories to update.
     */
    limit?: number
  }

  /**
   * PriceHistory updateManyAndReturn
   */
  export type PriceHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * The data used to update PriceHistories.
     */
    data: XOR<PriceHistoryUpdateManyMutationInput, PriceHistoryUncheckedUpdateManyInput>
    /**
     * Filter which PriceHistories to update
     */
    where?: PriceHistoryWhereInput
    /**
     * Limit how many PriceHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PriceHistory upsert
   */
  export type PriceHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the PriceHistory to update in case it exists.
     */
    where: PriceHistoryWhereUniqueInput
    /**
     * In case the PriceHistory found by the `where` argument doesn't exist, create a new PriceHistory with this data.
     */
    create: XOR<PriceHistoryCreateInput, PriceHistoryUncheckedCreateInput>
    /**
     * In case the PriceHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PriceHistoryUpdateInput, PriceHistoryUncheckedUpdateInput>
  }

  /**
   * PriceHistory delete
   */
  export type PriceHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
    /**
     * Filter which PriceHistory to delete.
     */
    where: PriceHistoryWhereUniqueInput
  }

  /**
   * PriceHistory deleteMany
   */
  export type PriceHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PriceHistories to delete
     */
    where?: PriceHistoryWhereInput
    /**
     * Limit how many PriceHistories to delete.
     */
    limit?: number
  }

  /**
   * PriceHistory without action
   */
  export type PriceHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PriceHistory
     */
    select?: PriceHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PriceHistory
     */
    omit?: PriceHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PriceHistoryInclude<ExtArgs> | null
  }


  /**
   * Model LiquidityHistory
   */

  export type AggregateLiquidityHistory = {
    _count: LiquidityHistoryCountAggregateOutputType | null
    _avg: LiquidityHistoryAvgAggregateOutputType | null
    _sum: LiquidityHistorySumAggregateOutputType | null
    _min: LiquidityHistoryMinAggregateOutputType | null
    _max: LiquidityHistoryMaxAggregateOutputType | null
  }

  export type LiquidityHistoryAvgAggregateOutputType = {
    liquidityUsd: number | null
  }

  export type LiquidityHistorySumAggregateOutputType = {
    liquidityUsd: number | null
  }

  export type LiquidityHistoryMinAggregateOutputType = {
    id: string | null
    marketId: string | null
    liquidityUsd: number | null
    timestamp: Date | null
  }

  export type LiquidityHistoryMaxAggregateOutputType = {
    id: string | null
    marketId: string | null
    liquidityUsd: number | null
    timestamp: Date | null
  }

  export type LiquidityHistoryCountAggregateOutputType = {
    id: number
    marketId: number
    liquidityUsd: number
    timestamp: number
    _all: number
  }


  export type LiquidityHistoryAvgAggregateInputType = {
    liquidityUsd?: true
  }

  export type LiquidityHistorySumAggregateInputType = {
    liquidityUsd?: true
  }

  export type LiquidityHistoryMinAggregateInputType = {
    id?: true
    marketId?: true
    liquidityUsd?: true
    timestamp?: true
  }

  export type LiquidityHistoryMaxAggregateInputType = {
    id?: true
    marketId?: true
    liquidityUsd?: true
    timestamp?: true
  }

  export type LiquidityHistoryCountAggregateInputType = {
    id?: true
    marketId?: true
    liquidityUsd?: true
    timestamp?: true
    _all?: true
  }

  export type LiquidityHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiquidityHistory to aggregate.
     */
    where?: LiquidityHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiquidityHistories to fetch.
     */
    orderBy?: LiquidityHistoryOrderByWithRelationInput | LiquidityHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LiquidityHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiquidityHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiquidityHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LiquidityHistories
    **/
    _count?: true | LiquidityHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LiquidityHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LiquidityHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LiquidityHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LiquidityHistoryMaxAggregateInputType
  }

  export type GetLiquidityHistoryAggregateType<T extends LiquidityHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateLiquidityHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLiquidityHistory[P]>
      : GetScalarType<T[P], AggregateLiquidityHistory[P]>
  }




  export type LiquidityHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LiquidityHistoryWhereInput
    orderBy?: LiquidityHistoryOrderByWithAggregationInput | LiquidityHistoryOrderByWithAggregationInput[]
    by: LiquidityHistoryScalarFieldEnum[] | LiquidityHistoryScalarFieldEnum
    having?: LiquidityHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LiquidityHistoryCountAggregateInputType | true
    _avg?: LiquidityHistoryAvgAggregateInputType
    _sum?: LiquidityHistorySumAggregateInputType
    _min?: LiquidityHistoryMinAggregateInputType
    _max?: LiquidityHistoryMaxAggregateInputType
  }

  export type LiquidityHistoryGroupByOutputType = {
    id: string
    marketId: string
    liquidityUsd: number
    timestamp: Date
    _count: LiquidityHistoryCountAggregateOutputType | null
    _avg: LiquidityHistoryAvgAggregateOutputType | null
    _sum: LiquidityHistorySumAggregateOutputType | null
    _min: LiquidityHistoryMinAggregateOutputType | null
    _max: LiquidityHistoryMaxAggregateOutputType | null
  }

  type GetLiquidityHistoryGroupByPayload<T extends LiquidityHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LiquidityHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LiquidityHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LiquidityHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], LiquidityHistoryGroupByOutputType[P]>
        }
      >
    >


  export type LiquidityHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    liquidityUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["liquidityHistory"]>

  export type LiquidityHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    liquidityUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["liquidityHistory"]>

  export type LiquidityHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    liquidityUsd?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["liquidityHistory"]>

  export type LiquidityHistorySelectScalar = {
    id?: boolean
    marketId?: boolean
    liquidityUsd?: boolean
    timestamp?: boolean
  }

  export type LiquidityHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "marketId" | "liquidityUsd" | "timestamp", ExtArgs["result"]["liquidityHistory"]>
  export type LiquidityHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type LiquidityHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type LiquidityHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }

  export type $LiquidityHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LiquidityHistory"
    objects: {
      market: Prisma.$LaunchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      marketId: string
      liquidityUsd: number
      timestamp: Date
    }, ExtArgs["result"]["liquidityHistory"]>
    composites: {}
  }

  type LiquidityHistoryGetPayload<S extends boolean | null | undefined | LiquidityHistoryDefaultArgs> = $Result.GetResult<Prisma.$LiquidityHistoryPayload, S>

  type LiquidityHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LiquidityHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LiquidityHistoryCountAggregateInputType | true
    }

  export interface LiquidityHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LiquidityHistory'], meta: { name: 'LiquidityHistory' } }
    /**
     * Find zero or one LiquidityHistory that matches the filter.
     * @param {LiquidityHistoryFindUniqueArgs} args - Arguments to find a LiquidityHistory
     * @example
     * // Get one LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LiquidityHistoryFindUniqueArgs>(args: SelectSubset<T, LiquidityHistoryFindUniqueArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LiquidityHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LiquidityHistoryFindUniqueOrThrowArgs} args - Arguments to find a LiquidityHistory
     * @example
     * // Get one LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LiquidityHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, LiquidityHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LiquidityHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryFindFirstArgs} args - Arguments to find a LiquidityHistory
     * @example
     * // Get one LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LiquidityHistoryFindFirstArgs>(args?: SelectSubset<T, LiquidityHistoryFindFirstArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LiquidityHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryFindFirstOrThrowArgs} args - Arguments to find a LiquidityHistory
     * @example
     * // Get one LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LiquidityHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, LiquidityHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LiquidityHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LiquidityHistories
     * const liquidityHistories = await prisma.liquidityHistory.findMany()
     * 
     * // Get first 10 LiquidityHistories
     * const liquidityHistories = await prisma.liquidityHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const liquidityHistoryWithIdOnly = await prisma.liquidityHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LiquidityHistoryFindManyArgs>(args?: SelectSubset<T, LiquidityHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LiquidityHistory.
     * @param {LiquidityHistoryCreateArgs} args - Arguments to create a LiquidityHistory.
     * @example
     * // Create one LiquidityHistory
     * const LiquidityHistory = await prisma.liquidityHistory.create({
     *   data: {
     *     // ... data to create a LiquidityHistory
     *   }
     * })
     * 
     */
    create<T extends LiquidityHistoryCreateArgs>(args: SelectSubset<T, LiquidityHistoryCreateArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LiquidityHistories.
     * @param {LiquidityHistoryCreateManyArgs} args - Arguments to create many LiquidityHistories.
     * @example
     * // Create many LiquidityHistories
     * const liquidityHistory = await prisma.liquidityHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LiquidityHistoryCreateManyArgs>(args?: SelectSubset<T, LiquidityHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LiquidityHistories and returns the data saved in the database.
     * @param {LiquidityHistoryCreateManyAndReturnArgs} args - Arguments to create many LiquidityHistories.
     * @example
     * // Create many LiquidityHistories
     * const liquidityHistory = await prisma.liquidityHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LiquidityHistories and only return the `id`
     * const liquidityHistoryWithIdOnly = await prisma.liquidityHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LiquidityHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, LiquidityHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LiquidityHistory.
     * @param {LiquidityHistoryDeleteArgs} args - Arguments to delete one LiquidityHistory.
     * @example
     * // Delete one LiquidityHistory
     * const LiquidityHistory = await prisma.liquidityHistory.delete({
     *   where: {
     *     // ... filter to delete one LiquidityHistory
     *   }
     * })
     * 
     */
    delete<T extends LiquidityHistoryDeleteArgs>(args: SelectSubset<T, LiquidityHistoryDeleteArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LiquidityHistory.
     * @param {LiquidityHistoryUpdateArgs} args - Arguments to update one LiquidityHistory.
     * @example
     * // Update one LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LiquidityHistoryUpdateArgs>(args: SelectSubset<T, LiquidityHistoryUpdateArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LiquidityHistories.
     * @param {LiquidityHistoryDeleteManyArgs} args - Arguments to filter LiquidityHistories to delete.
     * @example
     * // Delete a few LiquidityHistories
     * const { count } = await prisma.liquidityHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LiquidityHistoryDeleteManyArgs>(args?: SelectSubset<T, LiquidityHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LiquidityHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LiquidityHistories
     * const liquidityHistory = await prisma.liquidityHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LiquidityHistoryUpdateManyArgs>(args: SelectSubset<T, LiquidityHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LiquidityHistories and returns the data updated in the database.
     * @param {LiquidityHistoryUpdateManyAndReturnArgs} args - Arguments to update many LiquidityHistories.
     * @example
     * // Update many LiquidityHistories
     * const liquidityHistory = await prisma.liquidityHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LiquidityHistories and only return the `id`
     * const liquidityHistoryWithIdOnly = await prisma.liquidityHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LiquidityHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, LiquidityHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LiquidityHistory.
     * @param {LiquidityHistoryUpsertArgs} args - Arguments to update or create a LiquidityHistory.
     * @example
     * // Update or create a LiquidityHistory
     * const liquidityHistory = await prisma.liquidityHistory.upsert({
     *   create: {
     *     // ... data to create a LiquidityHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LiquidityHistory we want to update
     *   }
     * })
     */
    upsert<T extends LiquidityHistoryUpsertArgs>(args: SelectSubset<T, LiquidityHistoryUpsertArgs<ExtArgs>>): Prisma__LiquidityHistoryClient<$Result.GetResult<Prisma.$LiquidityHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LiquidityHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryCountArgs} args - Arguments to filter LiquidityHistories to count.
     * @example
     * // Count the number of LiquidityHistories
     * const count = await prisma.liquidityHistory.count({
     *   where: {
     *     // ... the filter for the LiquidityHistories we want to count
     *   }
     * })
    **/
    count<T extends LiquidityHistoryCountArgs>(
      args?: Subset<T, LiquidityHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LiquidityHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LiquidityHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LiquidityHistoryAggregateArgs>(args: Subset<T, LiquidityHistoryAggregateArgs>): Prisma.PrismaPromise<GetLiquidityHistoryAggregateType<T>>

    /**
     * Group by LiquidityHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiquidityHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LiquidityHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LiquidityHistoryGroupByArgs['orderBy'] }
        : { orderBy?: LiquidityHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LiquidityHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLiquidityHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LiquidityHistory model
   */
  readonly fields: LiquidityHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LiquidityHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LiquidityHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    market<T extends LaunchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LaunchDefaultArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LiquidityHistory model
   */
  interface LiquidityHistoryFieldRefs {
    readonly id: FieldRef<"LiquidityHistory", 'String'>
    readonly marketId: FieldRef<"LiquidityHistory", 'String'>
    readonly liquidityUsd: FieldRef<"LiquidityHistory", 'Float'>
    readonly timestamp: FieldRef<"LiquidityHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LiquidityHistory findUnique
   */
  export type LiquidityHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter, which LiquidityHistory to fetch.
     */
    where: LiquidityHistoryWhereUniqueInput
  }

  /**
   * LiquidityHistory findUniqueOrThrow
   */
  export type LiquidityHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter, which LiquidityHistory to fetch.
     */
    where: LiquidityHistoryWhereUniqueInput
  }

  /**
   * LiquidityHistory findFirst
   */
  export type LiquidityHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter, which LiquidityHistory to fetch.
     */
    where?: LiquidityHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiquidityHistories to fetch.
     */
    orderBy?: LiquidityHistoryOrderByWithRelationInput | LiquidityHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiquidityHistories.
     */
    cursor?: LiquidityHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiquidityHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiquidityHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiquidityHistories.
     */
    distinct?: LiquidityHistoryScalarFieldEnum | LiquidityHistoryScalarFieldEnum[]
  }

  /**
   * LiquidityHistory findFirstOrThrow
   */
  export type LiquidityHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter, which LiquidityHistory to fetch.
     */
    where?: LiquidityHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiquidityHistories to fetch.
     */
    orderBy?: LiquidityHistoryOrderByWithRelationInput | LiquidityHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiquidityHistories.
     */
    cursor?: LiquidityHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiquidityHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiquidityHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiquidityHistories.
     */
    distinct?: LiquidityHistoryScalarFieldEnum | LiquidityHistoryScalarFieldEnum[]
  }

  /**
   * LiquidityHistory findMany
   */
  export type LiquidityHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter, which LiquidityHistories to fetch.
     */
    where?: LiquidityHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiquidityHistories to fetch.
     */
    orderBy?: LiquidityHistoryOrderByWithRelationInput | LiquidityHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LiquidityHistories.
     */
    cursor?: LiquidityHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiquidityHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiquidityHistories.
     */
    skip?: number
    distinct?: LiquidityHistoryScalarFieldEnum | LiquidityHistoryScalarFieldEnum[]
  }

  /**
   * LiquidityHistory create
   */
  export type LiquidityHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a LiquidityHistory.
     */
    data: XOR<LiquidityHistoryCreateInput, LiquidityHistoryUncheckedCreateInput>
  }

  /**
   * LiquidityHistory createMany
   */
  export type LiquidityHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LiquidityHistories.
     */
    data: LiquidityHistoryCreateManyInput | LiquidityHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LiquidityHistory createManyAndReturn
   */
  export type LiquidityHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many LiquidityHistories.
     */
    data: LiquidityHistoryCreateManyInput | LiquidityHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LiquidityHistory update
   */
  export type LiquidityHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a LiquidityHistory.
     */
    data: XOR<LiquidityHistoryUpdateInput, LiquidityHistoryUncheckedUpdateInput>
    /**
     * Choose, which LiquidityHistory to update.
     */
    where: LiquidityHistoryWhereUniqueInput
  }

  /**
   * LiquidityHistory updateMany
   */
  export type LiquidityHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LiquidityHistories.
     */
    data: XOR<LiquidityHistoryUpdateManyMutationInput, LiquidityHistoryUncheckedUpdateManyInput>
    /**
     * Filter which LiquidityHistories to update
     */
    where?: LiquidityHistoryWhereInput
    /**
     * Limit how many LiquidityHistories to update.
     */
    limit?: number
  }

  /**
   * LiquidityHistory updateManyAndReturn
   */
  export type LiquidityHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * The data used to update LiquidityHistories.
     */
    data: XOR<LiquidityHistoryUpdateManyMutationInput, LiquidityHistoryUncheckedUpdateManyInput>
    /**
     * Filter which LiquidityHistories to update
     */
    where?: LiquidityHistoryWhereInput
    /**
     * Limit how many LiquidityHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LiquidityHistory upsert
   */
  export type LiquidityHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the LiquidityHistory to update in case it exists.
     */
    where: LiquidityHistoryWhereUniqueInput
    /**
     * In case the LiquidityHistory found by the `where` argument doesn't exist, create a new LiquidityHistory with this data.
     */
    create: XOR<LiquidityHistoryCreateInput, LiquidityHistoryUncheckedCreateInput>
    /**
     * In case the LiquidityHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LiquidityHistoryUpdateInput, LiquidityHistoryUncheckedUpdateInput>
  }

  /**
   * LiquidityHistory delete
   */
  export type LiquidityHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
    /**
     * Filter which LiquidityHistory to delete.
     */
    where: LiquidityHistoryWhereUniqueInput
  }

  /**
   * LiquidityHistory deleteMany
   */
  export type LiquidityHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiquidityHistories to delete
     */
    where?: LiquidityHistoryWhereInput
    /**
     * Limit how many LiquidityHistories to delete.
     */
    limit?: number
  }

  /**
   * LiquidityHistory without action
   */
  export type LiquidityHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiquidityHistory
     */
    select?: LiquidityHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LiquidityHistory
     */
    omit?: LiquidityHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LiquidityHistoryInclude<ExtArgs> | null
  }


  /**
   * Model GraduationEvent
   */

  export type AggregateGraduationEvent = {
    _count: GraduationEventCountAggregateOutputType | null
    _min: GraduationEventMinAggregateOutputType | null
    _max: GraduationEventMaxAggregateOutputType | null
  }

  export type GraduationEventMinAggregateOutputType = {
    id: string | null
    marketId: string | null
    signature: string | null
    timestamp: Date | null
  }

  export type GraduationEventMaxAggregateOutputType = {
    id: string | null
    marketId: string | null
    signature: string | null
    timestamp: Date | null
  }

  export type GraduationEventCountAggregateOutputType = {
    id: number
    marketId: number
    signature: number
    finalState: number
    timestamp: number
    _all: number
  }


  export type GraduationEventMinAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    timestamp?: true
  }

  export type GraduationEventMaxAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    timestamp?: true
  }

  export type GraduationEventCountAggregateInputType = {
    id?: true
    marketId?: true
    signature?: true
    finalState?: true
    timestamp?: true
    _all?: true
  }

  export type GraduationEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraduationEvent to aggregate.
     */
    where?: GraduationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraduationEvents to fetch.
     */
    orderBy?: GraduationEventOrderByWithRelationInput | GraduationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GraduationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraduationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraduationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GraduationEvents
    **/
    _count?: true | GraduationEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GraduationEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GraduationEventMaxAggregateInputType
  }

  export type GetGraduationEventAggregateType<T extends GraduationEventAggregateArgs> = {
        [P in keyof T & keyof AggregateGraduationEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGraduationEvent[P]>
      : GetScalarType<T[P], AggregateGraduationEvent[P]>
  }




  export type GraduationEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GraduationEventWhereInput
    orderBy?: GraduationEventOrderByWithAggregationInput | GraduationEventOrderByWithAggregationInput[]
    by: GraduationEventScalarFieldEnum[] | GraduationEventScalarFieldEnum
    having?: GraduationEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GraduationEventCountAggregateInputType | true
    _min?: GraduationEventMinAggregateInputType
    _max?: GraduationEventMaxAggregateInputType
  }

  export type GraduationEventGroupByOutputType = {
    id: string
    marketId: string
    signature: string
    finalState: JsonValue
    timestamp: Date
    _count: GraduationEventCountAggregateOutputType | null
    _min: GraduationEventMinAggregateOutputType | null
    _max: GraduationEventMaxAggregateOutputType | null
  }

  type GetGraduationEventGroupByPayload<T extends GraduationEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GraduationEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GraduationEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GraduationEventGroupByOutputType[P]>
            : GetScalarType<T[P], GraduationEventGroupByOutputType[P]>
        }
      >
    >


  export type GraduationEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    finalState?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graduationEvent"]>

  export type GraduationEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    finalState?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graduationEvent"]>

  export type GraduationEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    marketId?: boolean
    signature?: boolean
    finalState?: boolean
    timestamp?: boolean
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["graduationEvent"]>

  export type GraduationEventSelectScalar = {
    id?: boolean
    marketId?: boolean
    signature?: boolean
    finalState?: boolean
    timestamp?: boolean
  }

  export type GraduationEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "marketId" | "signature" | "finalState" | "timestamp", ExtArgs["result"]["graduationEvent"]>
  export type GraduationEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type GraduationEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }
  export type GraduationEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    market?: boolean | LaunchDefaultArgs<ExtArgs>
  }

  export type $GraduationEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GraduationEvent"
    objects: {
      market: Prisma.$LaunchPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      marketId: string
      signature: string
      finalState: Prisma.JsonValue
      timestamp: Date
    }, ExtArgs["result"]["graduationEvent"]>
    composites: {}
  }

  type GraduationEventGetPayload<S extends boolean | null | undefined | GraduationEventDefaultArgs> = $Result.GetResult<Prisma.$GraduationEventPayload, S>

  type GraduationEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GraduationEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GraduationEventCountAggregateInputType | true
    }

  export interface GraduationEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GraduationEvent'], meta: { name: 'GraduationEvent' } }
    /**
     * Find zero or one GraduationEvent that matches the filter.
     * @param {GraduationEventFindUniqueArgs} args - Arguments to find a GraduationEvent
     * @example
     * // Get one GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GraduationEventFindUniqueArgs>(args: SelectSubset<T, GraduationEventFindUniqueArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GraduationEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GraduationEventFindUniqueOrThrowArgs} args - Arguments to find a GraduationEvent
     * @example
     * // Get one GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GraduationEventFindUniqueOrThrowArgs>(args: SelectSubset<T, GraduationEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GraduationEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventFindFirstArgs} args - Arguments to find a GraduationEvent
     * @example
     * // Get one GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GraduationEventFindFirstArgs>(args?: SelectSubset<T, GraduationEventFindFirstArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GraduationEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventFindFirstOrThrowArgs} args - Arguments to find a GraduationEvent
     * @example
     * // Get one GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GraduationEventFindFirstOrThrowArgs>(args?: SelectSubset<T, GraduationEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GraduationEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GraduationEvents
     * const graduationEvents = await prisma.graduationEvent.findMany()
     * 
     * // Get first 10 GraduationEvents
     * const graduationEvents = await prisma.graduationEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const graduationEventWithIdOnly = await prisma.graduationEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GraduationEventFindManyArgs>(args?: SelectSubset<T, GraduationEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GraduationEvent.
     * @param {GraduationEventCreateArgs} args - Arguments to create a GraduationEvent.
     * @example
     * // Create one GraduationEvent
     * const GraduationEvent = await prisma.graduationEvent.create({
     *   data: {
     *     // ... data to create a GraduationEvent
     *   }
     * })
     * 
     */
    create<T extends GraduationEventCreateArgs>(args: SelectSubset<T, GraduationEventCreateArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GraduationEvents.
     * @param {GraduationEventCreateManyArgs} args - Arguments to create many GraduationEvents.
     * @example
     * // Create many GraduationEvents
     * const graduationEvent = await prisma.graduationEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GraduationEventCreateManyArgs>(args?: SelectSubset<T, GraduationEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GraduationEvents and returns the data saved in the database.
     * @param {GraduationEventCreateManyAndReturnArgs} args - Arguments to create many GraduationEvents.
     * @example
     * // Create many GraduationEvents
     * const graduationEvent = await prisma.graduationEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GraduationEvents and only return the `id`
     * const graduationEventWithIdOnly = await prisma.graduationEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GraduationEventCreateManyAndReturnArgs>(args?: SelectSubset<T, GraduationEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GraduationEvent.
     * @param {GraduationEventDeleteArgs} args - Arguments to delete one GraduationEvent.
     * @example
     * // Delete one GraduationEvent
     * const GraduationEvent = await prisma.graduationEvent.delete({
     *   where: {
     *     // ... filter to delete one GraduationEvent
     *   }
     * })
     * 
     */
    delete<T extends GraduationEventDeleteArgs>(args: SelectSubset<T, GraduationEventDeleteArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GraduationEvent.
     * @param {GraduationEventUpdateArgs} args - Arguments to update one GraduationEvent.
     * @example
     * // Update one GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GraduationEventUpdateArgs>(args: SelectSubset<T, GraduationEventUpdateArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GraduationEvents.
     * @param {GraduationEventDeleteManyArgs} args - Arguments to filter GraduationEvents to delete.
     * @example
     * // Delete a few GraduationEvents
     * const { count } = await prisma.graduationEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GraduationEventDeleteManyArgs>(args?: SelectSubset<T, GraduationEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GraduationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GraduationEvents
     * const graduationEvent = await prisma.graduationEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GraduationEventUpdateManyArgs>(args: SelectSubset<T, GraduationEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GraduationEvents and returns the data updated in the database.
     * @param {GraduationEventUpdateManyAndReturnArgs} args - Arguments to update many GraduationEvents.
     * @example
     * // Update many GraduationEvents
     * const graduationEvent = await prisma.graduationEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GraduationEvents and only return the `id`
     * const graduationEventWithIdOnly = await prisma.graduationEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GraduationEventUpdateManyAndReturnArgs>(args: SelectSubset<T, GraduationEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GraduationEvent.
     * @param {GraduationEventUpsertArgs} args - Arguments to update or create a GraduationEvent.
     * @example
     * // Update or create a GraduationEvent
     * const graduationEvent = await prisma.graduationEvent.upsert({
     *   create: {
     *     // ... data to create a GraduationEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GraduationEvent we want to update
     *   }
     * })
     */
    upsert<T extends GraduationEventUpsertArgs>(args: SelectSubset<T, GraduationEventUpsertArgs<ExtArgs>>): Prisma__GraduationEventClient<$Result.GetResult<Prisma.$GraduationEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GraduationEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventCountArgs} args - Arguments to filter GraduationEvents to count.
     * @example
     * // Count the number of GraduationEvents
     * const count = await prisma.graduationEvent.count({
     *   where: {
     *     // ... the filter for the GraduationEvents we want to count
     *   }
     * })
    **/
    count<T extends GraduationEventCountArgs>(
      args?: Subset<T, GraduationEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GraduationEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GraduationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GraduationEventAggregateArgs>(args: Subset<T, GraduationEventAggregateArgs>): Prisma.PrismaPromise<GetGraduationEventAggregateType<T>>

    /**
     * Group by GraduationEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GraduationEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GraduationEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GraduationEventGroupByArgs['orderBy'] }
        : { orderBy?: GraduationEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GraduationEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGraduationEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GraduationEvent model
   */
  readonly fields: GraduationEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GraduationEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GraduationEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    market<T extends LaunchDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LaunchDefaultArgs<ExtArgs>>): Prisma__LaunchClient<$Result.GetResult<Prisma.$LaunchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GraduationEvent model
   */
  interface GraduationEventFieldRefs {
    readonly id: FieldRef<"GraduationEvent", 'String'>
    readonly marketId: FieldRef<"GraduationEvent", 'String'>
    readonly signature: FieldRef<"GraduationEvent", 'String'>
    readonly finalState: FieldRef<"GraduationEvent", 'Json'>
    readonly timestamp: FieldRef<"GraduationEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GraduationEvent findUnique
   */
  export type GraduationEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter, which GraduationEvent to fetch.
     */
    where: GraduationEventWhereUniqueInput
  }

  /**
   * GraduationEvent findUniqueOrThrow
   */
  export type GraduationEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter, which GraduationEvent to fetch.
     */
    where: GraduationEventWhereUniqueInput
  }

  /**
   * GraduationEvent findFirst
   */
  export type GraduationEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter, which GraduationEvent to fetch.
     */
    where?: GraduationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraduationEvents to fetch.
     */
    orderBy?: GraduationEventOrderByWithRelationInput | GraduationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraduationEvents.
     */
    cursor?: GraduationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraduationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraduationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraduationEvents.
     */
    distinct?: GraduationEventScalarFieldEnum | GraduationEventScalarFieldEnum[]
  }

  /**
   * GraduationEvent findFirstOrThrow
   */
  export type GraduationEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter, which GraduationEvent to fetch.
     */
    where?: GraduationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraduationEvents to fetch.
     */
    orderBy?: GraduationEventOrderByWithRelationInput | GraduationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GraduationEvents.
     */
    cursor?: GraduationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraduationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraduationEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GraduationEvents.
     */
    distinct?: GraduationEventScalarFieldEnum | GraduationEventScalarFieldEnum[]
  }

  /**
   * GraduationEvent findMany
   */
  export type GraduationEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter, which GraduationEvents to fetch.
     */
    where?: GraduationEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GraduationEvents to fetch.
     */
    orderBy?: GraduationEventOrderByWithRelationInput | GraduationEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GraduationEvents.
     */
    cursor?: GraduationEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GraduationEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GraduationEvents.
     */
    skip?: number
    distinct?: GraduationEventScalarFieldEnum | GraduationEventScalarFieldEnum[]
  }

  /**
   * GraduationEvent create
   */
  export type GraduationEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * The data needed to create a GraduationEvent.
     */
    data: XOR<GraduationEventCreateInput, GraduationEventUncheckedCreateInput>
  }

  /**
   * GraduationEvent createMany
   */
  export type GraduationEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GraduationEvents.
     */
    data: GraduationEventCreateManyInput | GraduationEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GraduationEvent createManyAndReturn
   */
  export type GraduationEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * The data used to create many GraduationEvents.
     */
    data: GraduationEventCreateManyInput | GraduationEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GraduationEvent update
   */
  export type GraduationEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * The data needed to update a GraduationEvent.
     */
    data: XOR<GraduationEventUpdateInput, GraduationEventUncheckedUpdateInput>
    /**
     * Choose, which GraduationEvent to update.
     */
    where: GraduationEventWhereUniqueInput
  }

  /**
   * GraduationEvent updateMany
   */
  export type GraduationEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GraduationEvents.
     */
    data: XOR<GraduationEventUpdateManyMutationInput, GraduationEventUncheckedUpdateManyInput>
    /**
     * Filter which GraduationEvents to update
     */
    where?: GraduationEventWhereInput
    /**
     * Limit how many GraduationEvents to update.
     */
    limit?: number
  }

  /**
   * GraduationEvent updateManyAndReturn
   */
  export type GraduationEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * The data used to update GraduationEvents.
     */
    data: XOR<GraduationEventUpdateManyMutationInput, GraduationEventUncheckedUpdateManyInput>
    /**
     * Filter which GraduationEvents to update
     */
    where?: GraduationEventWhereInput
    /**
     * Limit how many GraduationEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GraduationEvent upsert
   */
  export type GraduationEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * The filter to search for the GraduationEvent to update in case it exists.
     */
    where: GraduationEventWhereUniqueInput
    /**
     * In case the GraduationEvent found by the `where` argument doesn't exist, create a new GraduationEvent with this data.
     */
    create: XOR<GraduationEventCreateInput, GraduationEventUncheckedCreateInput>
    /**
     * In case the GraduationEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GraduationEventUpdateInput, GraduationEventUncheckedUpdateInput>
  }

  /**
   * GraduationEvent delete
   */
  export type GraduationEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
    /**
     * Filter which GraduationEvent to delete.
     */
    where: GraduationEventWhereUniqueInput
  }

  /**
   * GraduationEvent deleteMany
   */
  export type GraduationEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GraduationEvents to delete
     */
    where?: GraduationEventWhereInput
    /**
     * Limit how many GraduationEvents to delete.
     */
    limit?: number
  }

  /**
   * GraduationEvent without action
   */
  export type GraduationEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GraduationEvent
     */
    select?: GraduationEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GraduationEvent
     */
    omit?: GraduationEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GraduationEventInclude<ExtArgs> | null
  }


  /**
   * Model IndexerCursor
   */

  export type AggregateIndexerCursor = {
    _count: IndexerCursorCountAggregateOutputType | null
    _min: IndexerCursorMinAggregateOutputType | null
    _max: IndexerCursorMaxAggregateOutputType | null
  }

  export type IndexerCursorMinAggregateOutputType = {
    poolAddress: string | null
    lastSignature: string | null
    lastIndexedAt: Date | null
  }

  export type IndexerCursorMaxAggregateOutputType = {
    poolAddress: string | null
    lastSignature: string | null
    lastIndexedAt: Date | null
  }

  export type IndexerCursorCountAggregateOutputType = {
    poolAddress: number
    lastSignature: number
    lastIndexedAt: number
    _all: number
  }


  export type IndexerCursorMinAggregateInputType = {
    poolAddress?: true
    lastSignature?: true
    lastIndexedAt?: true
  }

  export type IndexerCursorMaxAggregateInputType = {
    poolAddress?: true
    lastSignature?: true
    lastIndexedAt?: true
  }

  export type IndexerCursorCountAggregateInputType = {
    poolAddress?: true
    lastSignature?: true
    lastIndexedAt?: true
    _all?: true
  }

  export type IndexerCursorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IndexerCursor to aggregate.
     */
    where?: IndexerCursorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerCursors to fetch.
     */
    orderBy?: IndexerCursorOrderByWithRelationInput | IndexerCursorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IndexerCursorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerCursors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerCursors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IndexerCursors
    **/
    _count?: true | IndexerCursorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IndexerCursorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IndexerCursorMaxAggregateInputType
  }

  export type GetIndexerCursorAggregateType<T extends IndexerCursorAggregateArgs> = {
        [P in keyof T & keyof AggregateIndexerCursor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIndexerCursor[P]>
      : GetScalarType<T[P], AggregateIndexerCursor[P]>
  }




  export type IndexerCursorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IndexerCursorWhereInput
    orderBy?: IndexerCursorOrderByWithAggregationInput | IndexerCursorOrderByWithAggregationInput[]
    by: IndexerCursorScalarFieldEnum[] | IndexerCursorScalarFieldEnum
    having?: IndexerCursorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IndexerCursorCountAggregateInputType | true
    _min?: IndexerCursorMinAggregateInputType
    _max?: IndexerCursorMaxAggregateInputType
  }

  export type IndexerCursorGroupByOutputType = {
    poolAddress: string
    lastSignature: string | null
    lastIndexedAt: Date
    _count: IndexerCursorCountAggregateOutputType | null
    _min: IndexerCursorMinAggregateOutputType | null
    _max: IndexerCursorMaxAggregateOutputType | null
  }

  type GetIndexerCursorGroupByPayload<T extends IndexerCursorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IndexerCursorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IndexerCursorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IndexerCursorGroupByOutputType[P]>
            : GetScalarType<T[P], IndexerCursorGroupByOutputType[P]>
        }
      >
    >


  export type IndexerCursorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    poolAddress?: boolean
    lastSignature?: boolean
    lastIndexedAt?: boolean
  }, ExtArgs["result"]["indexerCursor"]>

  export type IndexerCursorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    poolAddress?: boolean
    lastSignature?: boolean
    lastIndexedAt?: boolean
  }, ExtArgs["result"]["indexerCursor"]>

  export type IndexerCursorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    poolAddress?: boolean
    lastSignature?: boolean
    lastIndexedAt?: boolean
  }, ExtArgs["result"]["indexerCursor"]>

  export type IndexerCursorSelectScalar = {
    poolAddress?: boolean
    lastSignature?: boolean
    lastIndexedAt?: boolean
  }

  export type IndexerCursorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"poolAddress" | "lastSignature" | "lastIndexedAt", ExtArgs["result"]["indexerCursor"]>

  export type $IndexerCursorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IndexerCursor"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      poolAddress: string
      lastSignature: string | null
      lastIndexedAt: Date
    }, ExtArgs["result"]["indexerCursor"]>
    composites: {}
  }

  type IndexerCursorGetPayload<S extends boolean | null | undefined | IndexerCursorDefaultArgs> = $Result.GetResult<Prisma.$IndexerCursorPayload, S>

  type IndexerCursorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IndexerCursorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IndexerCursorCountAggregateInputType | true
    }

  export interface IndexerCursorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IndexerCursor'], meta: { name: 'IndexerCursor' } }
    /**
     * Find zero or one IndexerCursor that matches the filter.
     * @param {IndexerCursorFindUniqueArgs} args - Arguments to find a IndexerCursor
     * @example
     * // Get one IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IndexerCursorFindUniqueArgs>(args: SelectSubset<T, IndexerCursorFindUniqueArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IndexerCursor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IndexerCursorFindUniqueOrThrowArgs} args - Arguments to find a IndexerCursor
     * @example
     * // Get one IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IndexerCursorFindUniqueOrThrowArgs>(args: SelectSubset<T, IndexerCursorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IndexerCursor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorFindFirstArgs} args - Arguments to find a IndexerCursor
     * @example
     * // Get one IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IndexerCursorFindFirstArgs>(args?: SelectSubset<T, IndexerCursorFindFirstArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IndexerCursor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorFindFirstOrThrowArgs} args - Arguments to find a IndexerCursor
     * @example
     * // Get one IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IndexerCursorFindFirstOrThrowArgs>(args?: SelectSubset<T, IndexerCursorFindFirstOrThrowArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IndexerCursors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IndexerCursors
     * const indexerCursors = await prisma.indexerCursor.findMany()
     * 
     * // Get first 10 IndexerCursors
     * const indexerCursors = await prisma.indexerCursor.findMany({ take: 10 })
     * 
     * // Only select the `poolAddress`
     * const indexerCursorWithPoolAddressOnly = await prisma.indexerCursor.findMany({ select: { poolAddress: true } })
     * 
     */
    findMany<T extends IndexerCursorFindManyArgs>(args?: SelectSubset<T, IndexerCursorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IndexerCursor.
     * @param {IndexerCursorCreateArgs} args - Arguments to create a IndexerCursor.
     * @example
     * // Create one IndexerCursor
     * const IndexerCursor = await prisma.indexerCursor.create({
     *   data: {
     *     // ... data to create a IndexerCursor
     *   }
     * })
     * 
     */
    create<T extends IndexerCursorCreateArgs>(args: SelectSubset<T, IndexerCursorCreateArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IndexerCursors.
     * @param {IndexerCursorCreateManyArgs} args - Arguments to create many IndexerCursors.
     * @example
     * // Create many IndexerCursors
     * const indexerCursor = await prisma.indexerCursor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IndexerCursorCreateManyArgs>(args?: SelectSubset<T, IndexerCursorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IndexerCursors and returns the data saved in the database.
     * @param {IndexerCursorCreateManyAndReturnArgs} args - Arguments to create many IndexerCursors.
     * @example
     * // Create many IndexerCursors
     * const indexerCursor = await prisma.indexerCursor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IndexerCursors and only return the `poolAddress`
     * const indexerCursorWithPoolAddressOnly = await prisma.indexerCursor.createManyAndReturn({
     *   select: { poolAddress: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IndexerCursorCreateManyAndReturnArgs>(args?: SelectSubset<T, IndexerCursorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IndexerCursor.
     * @param {IndexerCursorDeleteArgs} args - Arguments to delete one IndexerCursor.
     * @example
     * // Delete one IndexerCursor
     * const IndexerCursor = await prisma.indexerCursor.delete({
     *   where: {
     *     // ... filter to delete one IndexerCursor
     *   }
     * })
     * 
     */
    delete<T extends IndexerCursorDeleteArgs>(args: SelectSubset<T, IndexerCursorDeleteArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IndexerCursor.
     * @param {IndexerCursorUpdateArgs} args - Arguments to update one IndexerCursor.
     * @example
     * // Update one IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IndexerCursorUpdateArgs>(args: SelectSubset<T, IndexerCursorUpdateArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IndexerCursors.
     * @param {IndexerCursorDeleteManyArgs} args - Arguments to filter IndexerCursors to delete.
     * @example
     * // Delete a few IndexerCursors
     * const { count } = await prisma.indexerCursor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IndexerCursorDeleteManyArgs>(args?: SelectSubset<T, IndexerCursorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IndexerCursors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IndexerCursors
     * const indexerCursor = await prisma.indexerCursor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IndexerCursorUpdateManyArgs>(args: SelectSubset<T, IndexerCursorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IndexerCursors and returns the data updated in the database.
     * @param {IndexerCursorUpdateManyAndReturnArgs} args - Arguments to update many IndexerCursors.
     * @example
     * // Update many IndexerCursors
     * const indexerCursor = await prisma.indexerCursor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IndexerCursors and only return the `poolAddress`
     * const indexerCursorWithPoolAddressOnly = await prisma.indexerCursor.updateManyAndReturn({
     *   select: { poolAddress: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IndexerCursorUpdateManyAndReturnArgs>(args: SelectSubset<T, IndexerCursorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IndexerCursor.
     * @param {IndexerCursorUpsertArgs} args - Arguments to update or create a IndexerCursor.
     * @example
     * // Update or create a IndexerCursor
     * const indexerCursor = await prisma.indexerCursor.upsert({
     *   create: {
     *     // ... data to create a IndexerCursor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IndexerCursor we want to update
     *   }
     * })
     */
    upsert<T extends IndexerCursorUpsertArgs>(args: SelectSubset<T, IndexerCursorUpsertArgs<ExtArgs>>): Prisma__IndexerCursorClient<$Result.GetResult<Prisma.$IndexerCursorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IndexerCursors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorCountArgs} args - Arguments to filter IndexerCursors to count.
     * @example
     * // Count the number of IndexerCursors
     * const count = await prisma.indexerCursor.count({
     *   where: {
     *     // ... the filter for the IndexerCursors we want to count
     *   }
     * })
    **/
    count<T extends IndexerCursorCountArgs>(
      args?: Subset<T, IndexerCursorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IndexerCursorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IndexerCursor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IndexerCursorAggregateArgs>(args: Subset<T, IndexerCursorAggregateArgs>): Prisma.PrismaPromise<GetIndexerCursorAggregateType<T>>

    /**
     * Group by IndexerCursor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerCursorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IndexerCursorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IndexerCursorGroupByArgs['orderBy'] }
        : { orderBy?: IndexerCursorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IndexerCursorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIndexerCursorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IndexerCursor model
   */
  readonly fields: IndexerCursorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IndexerCursor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IndexerCursorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IndexerCursor model
   */
  interface IndexerCursorFieldRefs {
    readonly poolAddress: FieldRef<"IndexerCursor", 'String'>
    readonly lastSignature: FieldRef<"IndexerCursor", 'String'>
    readonly lastIndexedAt: FieldRef<"IndexerCursor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IndexerCursor findUnique
   */
  export type IndexerCursorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter, which IndexerCursor to fetch.
     */
    where: IndexerCursorWhereUniqueInput
  }

  /**
   * IndexerCursor findUniqueOrThrow
   */
  export type IndexerCursorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter, which IndexerCursor to fetch.
     */
    where: IndexerCursorWhereUniqueInput
  }

  /**
   * IndexerCursor findFirst
   */
  export type IndexerCursorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter, which IndexerCursor to fetch.
     */
    where?: IndexerCursorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerCursors to fetch.
     */
    orderBy?: IndexerCursorOrderByWithRelationInput | IndexerCursorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IndexerCursors.
     */
    cursor?: IndexerCursorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerCursors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerCursors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IndexerCursors.
     */
    distinct?: IndexerCursorScalarFieldEnum | IndexerCursorScalarFieldEnum[]
  }

  /**
   * IndexerCursor findFirstOrThrow
   */
  export type IndexerCursorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter, which IndexerCursor to fetch.
     */
    where?: IndexerCursorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerCursors to fetch.
     */
    orderBy?: IndexerCursorOrderByWithRelationInput | IndexerCursorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IndexerCursors.
     */
    cursor?: IndexerCursorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerCursors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerCursors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IndexerCursors.
     */
    distinct?: IndexerCursorScalarFieldEnum | IndexerCursorScalarFieldEnum[]
  }

  /**
   * IndexerCursor findMany
   */
  export type IndexerCursorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter, which IndexerCursors to fetch.
     */
    where?: IndexerCursorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerCursors to fetch.
     */
    orderBy?: IndexerCursorOrderByWithRelationInput | IndexerCursorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IndexerCursors.
     */
    cursor?: IndexerCursorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerCursors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerCursors.
     */
    skip?: number
    distinct?: IndexerCursorScalarFieldEnum | IndexerCursorScalarFieldEnum[]
  }

  /**
   * IndexerCursor create
   */
  export type IndexerCursorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * The data needed to create a IndexerCursor.
     */
    data: XOR<IndexerCursorCreateInput, IndexerCursorUncheckedCreateInput>
  }

  /**
   * IndexerCursor createMany
   */
  export type IndexerCursorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IndexerCursors.
     */
    data: IndexerCursorCreateManyInput | IndexerCursorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IndexerCursor createManyAndReturn
   */
  export type IndexerCursorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * The data used to create many IndexerCursors.
     */
    data: IndexerCursorCreateManyInput | IndexerCursorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IndexerCursor update
   */
  export type IndexerCursorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * The data needed to update a IndexerCursor.
     */
    data: XOR<IndexerCursorUpdateInput, IndexerCursorUncheckedUpdateInput>
    /**
     * Choose, which IndexerCursor to update.
     */
    where: IndexerCursorWhereUniqueInput
  }

  /**
   * IndexerCursor updateMany
   */
  export type IndexerCursorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IndexerCursors.
     */
    data: XOR<IndexerCursorUpdateManyMutationInput, IndexerCursorUncheckedUpdateManyInput>
    /**
     * Filter which IndexerCursors to update
     */
    where?: IndexerCursorWhereInput
    /**
     * Limit how many IndexerCursors to update.
     */
    limit?: number
  }

  /**
   * IndexerCursor updateManyAndReturn
   */
  export type IndexerCursorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * The data used to update IndexerCursors.
     */
    data: XOR<IndexerCursorUpdateManyMutationInput, IndexerCursorUncheckedUpdateManyInput>
    /**
     * Filter which IndexerCursors to update
     */
    where?: IndexerCursorWhereInput
    /**
     * Limit how many IndexerCursors to update.
     */
    limit?: number
  }

  /**
   * IndexerCursor upsert
   */
  export type IndexerCursorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * The filter to search for the IndexerCursor to update in case it exists.
     */
    where: IndexerCursorWhereUniqueInput
    /**
     * In case the IndexerCursor found by the `where` argument doesn't exist, create a new IndexerCursor with this data.
     */
    create: XOR<IndexerCursorCreateInput, IndexerCursorUncheckedCreateInput>
    /**
     * In case the IndexerCursor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IndexerCursorUpdateInput, IndexerCursorUncheckedUpdateInput>
  }

  /**
   * IndexerCursor delete
   */
  export type IndexerCursorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
    /**
     * Filter which IndexerCursor to delete.
     */
    where: IndexerCursorWhereUniqueInput
  }

  /**
   * IndexerCursor deleteMany
   */
  export type IndexerCursorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IndexerCursors to delete
     */
    where?: IndexerCursorWhereInput
    /**
     * Limit how many IndexerCursors to delete.
     */
    limit?: number
  }

  /**
   * IndexerCursor without action
   */
  export type IndexerCursorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerCursor
     */
    select?: IndexerCursorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IndexerCursor
     */
    omit?: IndexerCursorOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AssetScalarFieldEnum: {
    id: 'id',
    name: 'name',
    symbol: 'symbol',
    mintAddress: 'mintAddress',
    issuer: 'issuer',
    assetType: 'assetType',
    referencePriceUsd: 'referencePriceUsd',
    source: 'source',
    externalId: 'externalId',
    createdAt: 'createdAt'
  };

  export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum]


  export const MarketProfileScalarFieldEnum: {
    id: 'id',
    assetId: 'assetId',
    initialLiquidityUsd: 'initialLiquidityUsd',
    expectedVolatility: 'expectedVolatility',
    riskProfile: 'riskProfile',
    targetLiquidityUsd: 'targetLiquidityUsd',
    targetGraduationUsd: 'targetGraduationUsd',
    quoteToken: 'quoteToken',
    createdAt: 'createdAt'
  };

  export type MarketProfileScalarFieldEnum = (typeof MarketProfileScalarFieldEnum)[keyof typeof MarketProfileScalarFieldEnum]


  export const CurveConfigScalarFieldEnum: {
    id: 'id',
    assetId: 'assetId',
    marketProfileId: 'marketProfileId',
    riskProfile: 'riskProfile',
    label: 'label',
    rationale: 'rationale',
    initialMarketCapUsd: 'initialMarketCapUsd',
    migrationMarketCapUsd: 'migrationMarketCapUsd',
    tokenSupply: 'tokenSupply',
    tokenBaseDecimals: 'tokenBaseDecimals',
    feeSchedule: 'feeSchedule',
    migration: 'migration',
    liquidityDistribution: 'liquidityDistribution',
    score: 'score',
    isRecommended: 'isRecommended',
    createdAt: 'createdAt'
  };

  export type CurveConfigScalarFieldEnum = (typeof CurveConfigScalarFieldEnum)[keyof typeof CurveConfigScalarFieldEnum]


  export const SimulationRunScalarFieldEnum: {
    id: 'id',
    curveConfigId: 'curveConfigId',
    scenarios: 'scenarios',
    createdAt: 'createdAt'
  };

  export type SimulationRunScalarFieldEnum = (typeof SimulationRunScalarFieldEnum)[keyof typeof SimulationRunScalarFieldEnum]


  export const LaunchScalarFieldEnum: {
    id: 'id',
    assetId: 'assetId',
    marketProfileId: 'marketProfileId',
    curveConfigId: 'curveConfigId',
    configAddress: 'configAddress',
    poolAddress: 'poolAddress',
    baseMint: 'baseMint',
    quoteMint: 'quoteMint',
    configTxSignature: 'configTxSignature',
    poolTxSignature: 'poolTxSignature',
    status: 'status',
    stage: 'stage',
    ownerWallet: 'ownerWallet',
    lastAuthTimestamp: 'lastAuthTimestamp',
    configKeypairSecret: 'configKeypairSecret',
    baseMintKeypairSecret: 'baseMintKeypairSecret',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LaunchScalarFieldEnum = (typeof LaunchScalarFieldEnum)[keyof typeof LaunchScalarFieldEnum]


  export const PoolScalarFieldEnum: {
    id: 'id',
    launchId: 'launchId',
    poolAddress: 'poolAddress',
    configAddress: 'configAddress',
    baseMint: 'baseMint',
    quoteMint: 'quoteMint',
    createdAt: 'createdAt'
  };

  export type PoolScalarFieldEnum = (typeof PoolScalarFieldEnum)[keyof typeof PoolScalarFieldEnum]


  export const MarketSnapshotScalarFieldEnum: {
    id: 'id',
    poolAddress: 'poolAddress',
    priceUsd: 'priceUsd',
    volume24hUsd: 'volume24hUsd',
    liquidityUsd: 'liquidityUsd',
    quoteReserve: 'quoteReserve',
    baseReserve: 'baseReserve',
    curveProgress: 'curveProgress',
    migrationThresholdUsd: 'migrationThresholdUsd',
    graduationProgress: 'graduationProgress',
    estimatedSlippageBps: 'estimatedSlippageBps',
    marketQualityScore: 'marketQualityScore',
    regime: 'regime',
    status: 'status',
    timestamp: 'timestamp'
  };

  export type MarketSnapshotScalarFieldEnum = (typeof MarketSnapshotScalarFieldEnum)[keyof typeof MarketSnapshotScalarFieldEnum]


  export const TradeScalarFieldEnum: {
    id: 'id',
    marketId: 'marketId',
    signature: 'signature',
    trader: 'trader',
    side: 'side',
    tokenAmount: 'tokenAmount',
    quoteAmount: 'quoteAmount',
    priceUsd: 'priceUsd',
    timestamp: 'timestamp'
  };

  export type TradeScalarFieldEnum = (typeof TradeScalarFieldEnum)[keyof typeof TradeScalarFieldEnum]


  export const PriceHistoryScalarFieldEnum: {
    id: 'id',
    marketId: 'marketId',
    priceUsd: 'priceUsd',
    source: 'source',
    timestamp: 'timestamp'
  };

  export type PriceHistoryScalarFieldEnum = (typeof PriceHistoryScalarFieldEnum)[keyof typeof PriceHistoryScalarFieldEnum]


  export const LiquidityHistoryScalarFieldEnum: {
    id: 'id',
    marketId: 'marketId',
    liquidityUsd: 'liquidityUsd',
    timestamp: 'timestamp'
  };

  export type LiquidityHistoryScalarFieldEnum = (typeof LiquidityHistoryScalarFieldEnum)[keyof typeof LiquidityHistoryScalarFieldEnum]


  export const GraduationEventScalarFieldEnum: {
    id: 'id',
    marketId: 'marketId',
    signature: 'signature',
    finalState: 'finalState',
    timestamp: 'timestamp'
  };

  export type GraduationEventScalarFieldEnum = (typeof GraduationEventScalarFieldEnum)[keyof typeof GraduationEventScalarFieldEnum]


  export const IndexerCursorScalarFieldEnum: {
    poolAddress: 'poolAddress',
    lastSignature: 'lastSignature',
    lastIndexedAt: 'lastIndexedAt'
  };

  export type IndexerCursorScalarFieldEnum = (typeof IndexerCursorScalarFieldEnum)[keyof typeof IndexerCursorScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'AssetType'
   */
  export type EnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType'>
    


  /**
   * Reference to a field of type 'AssetType[]'
   */
  export type ListEnumAssetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'AssetSource'
   */
  export type EnumAssetSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetSource'>
    


  /**
   * Reference to a field of type 'AssetSource[]'
   */
  export type ListEnumAssetSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AssetSource[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'RiskProfile'
   */
  export type EnumRiskProfileFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskProfile'>
    


  /**
   * Reference to a field of type 'RiskProfile[]'
   */
  export type ListEnumRiskProfileFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskProfile[]'>
    


  /**
   * Reference to a field of type 'QuoteToken'
   */
  export type EnumQuoteTokenFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuoteToken'>
    


  /**
   * Reference to a field of type 'QuoteToken[]'
   */
  export type ListEnumQuoteTokenFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuoteToken[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'PoolStatus'
   */
  export type EnumPoolStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PoolStatus'>
    


  /**
   * Reference to a field of type 'PoolStatus[]'
   */
  export type ListEnumPoolStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PoolStatus[]'>
    


  /**
   * Reference to a field of type 'LaunchStage'
   */
  export type EnumLaunchStageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LaunchStage'>
    


  /**
   * Reference to a field of type 'LaunchStage[]'
   */
  export type ListEnumLaunchStageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LaunchStage[]'>
    


  /**
   * Reference to a field of type 'MarketRegime'
   */
  export type EnumMarketRegimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MarketRegime'>
    


  /**
   * Reference to a field of type 'MarketRegime[]'
   */
  export type ListEnumMarketRegimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MarketRegime[]'>
    


  /**
   * Reference to a field of type 'TradeSide'
   */
  export type EnumTradeSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeSide'>
    


  /**
   * Reference to a field of type 'TradeSide[]'
   */
  export type ListEnumTradeSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeSide[]'>
    
  /**
   * Deep Input Types
   */


  export type AssetWhereInput = {
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    id?: StringFilter<"Asset"> | string
    name?: StringFilter<"Asset"> | string
    symbol?: StringFilter<"Asset"> | string
    mintAddress?: StringFilter<"Asset"> | string
    issuer?: StringFilter<"Asset"> | string
    assetType?: EnumAssetTypeFilter<"Asset"> | $Enums.AssetType
    referencePriceUsd?: FloatFilter<"Asset"> | number
    source?: EnumAssetSourceFilter<"Asset"> | $Enums.AssetSource
    externalId?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    marketProfiles?: MarketProfileListRelationFilter
    curveConfigs?: CurveConfigListRelationFilter
    launches?: LaunchListRelationFilter
  }

  export type AssetOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    symbol?: SortOrder
    mintAddress?: SortOrder
    issuer?: SortOrder
    assetType?: SortOrder
    referencePriceUsd?: SortOrder
    source?: SortOrder
    externalId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    marketProfiles?: MarketProfileOrderByRelationAggregateInput
    curveConfigs?: CurveConfigOrderByRelationAggregateInput
    launches?: LaunchOrderByRelationAggregateInput
  }

  export type AssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    name?: StringFilter<"Asset"> | string
    symbol?: StringFilter<"Asset"> | string
    mintAddress?: StringFilter<"Asset"> | string
    issuer?: StringFilter<"Asset"> | string
    assetType?: EnumAssetTypeFilter<"Asset"> | $Enums.AssetType
    referencePriceUsd?: FloatFilter<"Asset"> | number
    source?: EnumAssetSourceFilter<"Asset"> | $Enums.AssetSource
    externalId?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    marketProfiles?: MarketProfileListRelationFilter
    curveConfigs?: CurveConfigListRelationFilter
    launches?: LaunchListRelationFilter
  }, "id">

  export type AssetOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    symbol?: SortOrder
    mintAddress?: SortOrder
    issuer?: SortOrder
    assetType?: SortOrder
    referencePriceUsd?: SortOrder
    source?: SortOrder
    externalId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AssetCountOrderByAggregateInput
    _avg?: AssetAvgOrderByAggregateInput
    _max?: AssetMaxOrderByAggregateInput
    _min?: AssetMinOrderByAggregateInput
    _sum?: AssetSumOrderByAggregateInput
  }

  export type AssetScalarWhereWithAggregatesInput = {
    AND?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    OR?: AssetScalarWhereWithAggregatesInput[]
    NOT?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Asset"> | string
    name?: StringWithAggregatesFilter<"Asset"> | string
    symbol?: StringWithAggregatesFilter<"Asset"> | string
    mintAddress?: StringWithAggregatesFilter<"Asset"> | string
    issuer?: StringWithAggregatesFilter<"Asset"> | string
    assetType?: EnumAssetTypeWithAggregatesFilter<"Asset"> | $Enums.AssetType
    referencePriceUsd?: FloatWithAggregatesFilter<"Asset"> | number
    source?: EnumAssetSourceWithAggregatesFilter<"Asset"> | $Enums.AssetSource
    externalId?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
  }

  export type MarketProfileWhereInput = {
    AND?: MarketProfileWhereInput | MarketProfileWhereInput[]
    OR?: MarketProfileWhereInput[]
    NOT?: MarketProfileWhereInput | MarketProfileWhereInput[]
    id?: StringFilter<"MarketProfile"> | string
    assetId?: StringFilter<"MarketProfile"> | string
    initialLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    expectedVolatility?: StringFilter<"MarketProfile"> | string
    riskProfile?: EnumRiskProfileFilter<"MarketProfile"> | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    targetGraduationUsd?: FloatFilter<"MarketProfile"> | number
    quoteToken?: EnumQuoteTokenFilter<"MarketProfile"> | $Enums.QuoteToken
    createdAt?: DateTimeFilter<"MarketProfile"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    curveConfigs?: CurveConfigListRelationFilter
    launches?: LaunchListRelationFilter
  }

  export type MarketProfileOrderByWithRelationInput = {
    id?: SortOrder
    assetId?: SortOrder
    initialLiquidityUsd?: SortOrder
    expectedVolatility?: SortOrder
    riskProfile?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
    quoteToken?: SortOrder
    createdAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
    curveConfigs?: CurveConfigOrderByRelationAggregateInput
    launches?: LaunchOrderByRelationAggregateInput
  }

  export type MarketProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MarketProfileWhereInput | MarketProfileWhereInput[]
    OR?: MarketProfileWhereInput[]
    NOT?: MarketProfileWhereInput | MarketProfileWhereInput[]
    assetId?: StringFilter<"MarketProfile"> | string
    initialLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    expectedVolatility?: StringFilter<"MarketProfile"> | string
    riskProfile?: EnumRiskProfileFilter<"MarketProfile"> | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    targetGraduationUsd?: FloatFilter<"MarketProfile"> | number
    quoteToken?: EnumQuoteTokenFilter<"MarketProfile"> | $Enums.QuoteToken
    createdAt?: DateTimeFilter<"MarketProfile"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    curveConfigs?: CurveConfigListRelationFilter
    launches?: LaunchListRelationFilter
  }, "id">

  export type MarketProfileOrderByWithAggregationInput = {
    id?: SortOrder
    assetId?: SortOrder
    initialLiquidityUsd?: SortOrder
    expectedVolatility?: SortOrder
    riskProfile?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
    quoteToken?: SortOrder
    createdAt?: SortOrder
    _count?: MarketProfileCountOrderByAggregateInput
    _avg?: MarketProfileAvgOrderByAggregateInput
    _max?: MarketProfileMaxOrderByAggregateInput
    _min?: MarketProfileMinOrderByAggregateInput
    _sum?: MarketProfileSumOrderByAggregateInput
  }

  export type MarketProfileScalarWhereWithAggregatesInput = {
    AND?: MarketProfileScalarWhereWithAggregatesInput | MarketProfileScalarWhereWithAggregatesInput[]
    OR?: MarketProfileScalarWhereWithAggregatesInput[]
    NOT?: MarketProfileScalarWhereWithAggregatesInput | MarketProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarketProfile"> | string
    assetId?: StringWithAggregatesFilter<"MarketProfile"> | string
    initialLiquidityUsd?: FloatWithAggregatesFilter<"MarketProfile"> | number
    expectedVolatility?: StringWithAggregatesFilter<"MarketProfile"> | string
    riskProfile?: EnumRiskProfileWithAggregatesFilter<"MarketProfile"> | $Enums.RiskProfile
    targetLiquidityUsd?: FloatWithAggregatesFilter<"MarketProfile"> | number
    targetGraduationUsd?: FloatWithAggregatesFilter<"MarketProfile"> | number
    quoteToken?: EnumQuoteTokenWithAggregatesFilter<"MarketProfile"> | $Enums.QuoteToken
    createdAt?: DateTimeWithAggregatesFilter<"MarketProfile"> | Date | string
  }

  export type CurveConfigWhereInput = {
    AND?: CurveConfigWhereInput | CurveConfigWhereInput[]
    OR?: CurveConfigWhereInput[]
    NOT?: CurveConfigWhereInput | CurveConfigWhereInput[]
    id?: StringFilter<"CurveConfig"> | string
    assetId?: StringFilter<"CurveConfig"> | string
    marketProfileId?: StringFilter<"CurveConfig"> | string
    riskProfile?: EnumRiskProfileFilter<"CurveConfig"> | $Enums.RiskProfile
    label?: StringFilter<"CurveConfig"> | string
    rationale?: StringFilter<"CurveConfig"> | string
    initialMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    migrationMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    tokenSupply?: FloatFilter<"CurveConfig"> | number
    tokenBaseDecimals?: IntFilter<"CurveConfig"> | number
    feeSchedule?: JsonFilter<"CurveConfig">
    migration?: JsonFilter<"CurveConfig">
    liquidityDistribution?: JsonFilter<"CurveConfig">
    score?: JsonFilter<"CurveConfig">
    isRecommended?: BoolFilter<"CurveConfig"> | boolean
    createdAt?: DateTimeFilter<"CurveConfig"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    marketProfile?: XOR<MarketProfileScalarRelationFilter, MarketProfileWhereInput>
    simulationRuns?: SimulationRunListRelationFilter
    launches?: LaunchListRelationFilter
  }

  export type CurveConfigOrderByWithRelationInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    riskProfile?: SortOrder
    label?: SortOrder
    rationale?: SortOrder
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
    feeSchedule?: SortOrder
    migration?: SortOrder
    liquidityDistribution?: SortOrder
    score?: SortOrder
    isRecommended?: SortOrder
    createdAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
    marketProfile?: MarketProfileOrderByWithRelationInput
    simulationRuns?: SimulationRunOrderByRelationAggregateInput
    launches?: LaunchOrderByRelationAggregateInput
  }

  export type CurveConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CurveConfigWhereInput | CurveConfigWhereInput[]
    OR?: CurveConfigWhereInput[]
    NOT?: CurveConfigWhereInput | CurveConfigWhereInput[]
    assetId?: StringFilter<"CurveConfig"> | string
    marketProfileId?: StringFilter<"CurveConfig"> | string
    riskProfile?: EnumRiskProfileFilter<"CurveConfig"> | $Enums.RiskProfile
    label?: StringFilter<"CurveConfig"> | string
    rationale?: StringFilter<"CurveConfig"> | string
    initialMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    migrationMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    tokenSupply?: FloatFilter<"CurveConfig"> | number
    tokenBaseDecimals?: IntFilter<"CurveConfig"> | number
    feeSchedule?: JsonFilter<"CurveConfig">
    migration?: JsonFilter<"CurveConfig">
    liquidityDistribution?: JsonFilter<"CurveConfig">
    score?: JsonFilter<"CurveConfig">
    isRecommended?: BoolFilter<"CurveConfig"> | boolean
    createdAt?: DateTimeFilter<"CurveConfig"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    marketProfile?: XOR<MarketProfileScalarRelationFilter, MarketProfileWhereInput>
    simulationRuns?: SimulationRunListRelationFilter
    launches?: LaunchListRelationFilter
  }, "id">

  export type CurveConfigOrderByWithAggregationInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    riskProfile?: SortOrder
    label?: SortOrder
    rationale?: SortOrder
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
    feeSchedule?: SortOrder
    migration?: SortOrder
    liquidityDistribution?: SortOrder
    score?: SortOrder
    isRecommended?: SortOrder
    createdAt?: SortOrder
    _count?: CurveConfigCountOrderByAggregateInput
    _avg?: CurveConfigAvgOrderByAggregateInput
    _max?: CurveConfigMaxOrderByAggregateInput
    _min?: CurveConfigMinOrderByAggregateInput
    _sum?: CurveConfigSumOrderByAggregateInput
  }

  export type CurveConfigScalarWhereWithAggregatesInput = {
    AND?: CurveConfigScalarWhereWithAggregatesInput | CurveConfigScalarWhereWithAggregatesInput[]
    OR?: CurveConfigScalarWhereWithAggregatesInput[]
    NOT?: CurveConfigScalarWhereWithAggregatesInput | CurveConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CurveConfig"> | string
    assetId?: StringWithAggregatesFilter<"CurveConfig"> | string
    marketProfileId?: StringWithAggregatesFilter<"CurveConfig"> | string
    riskProfile?: EnumRiskProfileWithAggregatesFilter<"CurveConfig"> | $Enums.RiskProfile
    label?: StringWithAggregatesFilter<"CurveConfig"> | string
    rationale?: StringWithAggregatesFilter<"CurveConfig"> | string
    initialMarketCapUsd?: FloatWithAggregatesFilter<"CurveConfig"> | number
    migrationMarketCapUsd?: FloatWithAggregatesFilter<"CurveConfig"> | number
    tokenSupply?: FloatWithAggregatesFilter<"CurveConfig"> | number
    tokenBaseDecimals?: IntWithAggregatesFilter<"CurveConfig"> | number
    feeSchedule?: JsonWithAggregatesFilter<"CurveConfig">
    migration?: JsonWithAggregatesFilter<"CurveConfig">
    liquidityDistribution?: JsonWithAggregatesFilter<"CurveConfig">
    score?: JsonWithAggregatesFilter<"CurveConfig">
    isRecommended?: BoolWithAggregatesFilter<"CurveConfig"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CurveConfig"> | Date | string
  }

  export type SimulationRunWhereInput = {
    AND?: SimulationRunWhereInput | SimulationRunWhereInput[]
    OR?: SimulationRunWhereInput[]
    NOT?: SimulationRunWhereInput | SimulationRunWhereInput[]
    id?: StringFilter<"SimulationRun"> | string
    curveConfigId?: StringFilter<"SimulationRun"> | string
    scenarios?: JsonFilter<"SimulationRun">
    createdAt?: DateTimeFilter<"SimulationRun"> | Date | string
    curveConfig?: XOR<CurveConfigScalarRelationFilter, CurveConfigWhereInput>
  }

  export type SimulationRunOrderByWithRelationInput = {
    id?: SortOrder
    curveConfigId?: SortOrder
    scenarios?: SortOrder
    createdAt?: SortOrder
    curveConfig?: CurveConfigOrderByWithRelationInput
  }

  export type SimulationRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SimulationRunWhereInput | SimulationRunWhereInput[]
    OR?: SimulationRunWhereInput[]
    NOT?: SimulationRunWhereInput | SimulationRunWhereInput[]
    curveConfigId?: StringFilter<"SimulationRun"> | string
    scenarios?: JsonFilter<"SimulationRun">
    createdAt?: DateTimeFilter<"SimulationRun"> | Date | string
    curveConfig?: XOR<CurveConfigScalarRelationFilter, CurveConfigWhereInput>
  }, "id">

  export type SimulationRunOrderByWithAggregationInput = {
    id?: SortOrder
    curveConfigId?: SortOrder
    scenarios?: SortOrder
    createdAt?: SortOrder
    _count?: SimulationRunCountOrderByAggregateInput
    _max?: SimulationRunMaxOrderByAggregateInput
    _min?: SimulationRunMinOrderByAggregateInput
  }

  export type SimulationRunScalarWhereWithAggregatesInput = {
    AND?: SimulationRunScalarWhereWithAggregatesInput | SimulationRunScalarWhereWithAggregatesInput[]
    OR?: SimulationRunScalarWhereWithAggregatesInput[]
    NOT?: SimulationRunScalarWhereWithAggregatesInput | SimulationRunScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SimulationRun"> | string
    curveConfigId?: StringWithAggregatesFilter<"SimulationRun"> | string
    scenarios?: JsonWithAggregatesFilter<"SimulationRun">
    createdAt?: DateTimeWithAggregatesFilter<"SimulationRun"> | Date | string
  }

  export type LaunchWhereInput = {
    AND?: LaunchWhereInput | LaunchWhereInput[]
    OR?: LaunchWhereInput[]
    NOT?: LaunchWhereInput | LaunchWhereInput[]
    id?: StringFilter<"Launch"> | string
    assetId?: StringFilter<"Launch"> | string
    marketProfileId?: StringFilter<"Launch"> | string
    curveConfigId?: StringFilter<"Launch"> | string
    configAddress?: StringNullableFilter<"Launch"> | string | null
    poolAddress?: StringNullableFilter<"Launch"> | string | null
    baseMint?: StringNullableFilter<"Launch"> | string | null
    quoteMint?: StringNullableFilter<"Launch"> | string | null
    configTxSignature?: StringNullableFilter<"Launch"> | string | null
    poolTxSignature?: StringNullableFilter<"Launch"> | string | null
    status?: EnumPoolStatusFilter<"Launch"> | $Enums.PoolStatus
    stage?: EnumLaunchStageFilter<"Launch"> | $Enums.LaunchStage
    ownerWallet?: StringNullableFilter<"Launch"> | string | null
    lastAuthTimestamp?: DateTimeNullableFilter<"Launch"> | Date | string | null
    configKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    baseMintKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    createdAt?: DateTimeFilter<"Launch"> | Date | string
    updatedAt?: DateTimeFilter<"Launch"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    marketProfile?: XOR<MarketProfileScalarRelationFilter, MarketProfileWhereInput>
    curveConfig?: XOR<CurveConfigScalarRelationFilter, CurveConfigWhereInput>
    pool?: XOR<PoolNullableScalarRelationFilter, PoolWhereInput> | null
    trades?: TradeListRelationFilter
    priceHistory?: PriceHistoryListRelationFilter
    liquidityHistory?: LiquidityHistoryListRelationFilter
    graduationEvents?: GraduationEventListRelationFilter
  }

  export type LaunchOrderByWithRelationInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    curveConfigId?: SortOrder
    configAddress?: SortOrderInput | SortOrder
    poolAddress?: SortOrderInput | SortOrder
    baseMint?: SortOrderInput | SortOrder
    quoteMint?: SortOrderInput | SortOrder
    configTxSignature?: SortOrderInput | SortOrder
    poolTxSignature?: SortOrderInput | SortOrder
    status?: SortOrder
    stage?: SortOrder
    ownerWallet?: SortOrderInput | SortOrder
    lastAuthTimestamp?: SortOrderInput | SortOrder
    configKeypairSecret?: SortOrderInput | SortOrder
    baseMintKeypairSecret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
    marketProfile?: MarketProfileOrderByWithRelationInput
    curveConfig?: CurveConfigOrderByWithRelationInput
    pool?: PoolOrderByWithRelationInput
    trades?: TradeOrderByRelationAggregateInput
    priceHistory?: PriceHistoryOrderByRelationAggregateInput
    liquidityHistory?: LiquidityHistoryOrderByRelationAggregateInput
    graduationEvents?: GraduationEventOrderByRelationAggregateInput
  }

  export type LaunchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    curveConfigId?: string
    AND?: LaunchWhereInput | LaunchWhereInput[]
    OR?: LaunchWhereInput[]
    NOT?: LaunchWhereInput | LaunchWhereInput[]
    assetId?: StringFilter<"Launch"> | string
    marketProfileId?: StringFilter<"Launch"> | string
    configAddress?: StringNullableFilter<"Launch"> | string | null
    poolAddress?: StringNullableFilter<"Launch"> | string | null
    baseMint?: StringNullableFilter<"Launch"> | string | null
    quoteMint?: StringNullableFilter<"Launch"> | string | null
    configTxSignature?: StringNullableFilter<"Launch"> | string | null
    poolTxSignature?: StringNullableFilter<"Launch"> | string | null
    status?: EnumPoolStatusFilter<"Launch"> | $Enums.PoolStatus
    stage?: EnumLaunchStageFilter<"Launch"> | $Enums.LaunchStage
    ownerWallet?: StringNullableFilter<"Launch"> | string | null
    lastAuthTimestamp?: DateTimeNullableFilter<"Launch"> | Date | string | null
    configKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    baseMintKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    createdAt?: DateTimeFilter<"Launch"> | Date | string
    updatedAt?: DateTimeFilter<"Launch"> | Date | string
    asset?: XOR<AssetScalarRelationFilter, AssetWhereInput>
    marketProfile?: XOR<MarketProfileScalarRelationFilter, MarketProfileWhereInput>
    curveConfig?: XOR<CurveConfigScalarRelationFilter, CurveConfigWhereInput>
    pool?: XOR<PoolNullableScalarRelationFilter, PoolWhereInput> | null
    trades?: TradeListRelationFilter
    priceHistory?: PriceHistoryListRelationFilter
    liquidityHistory?: LiquidityHistoryListRelationFilter
    graduationEvents?: GraduationEventListRelationFilter
  }, "id" | "curveConfigId">

  export type LaunchOrderByWithAggregationInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    curveConfigId?: SortOrder
    configAddress?: SortOrderInput | SortOrder
    poolAddress?: SortOrderInput | SortOrder
    baseMint?: SortOrderInput | SortOrder
    quoteMint?: SortOrderInput | SortOrder
    configTxSignature?: SortOrderInput | SortOrder
    poolTxSignature?: SortOrderInput | SortOrder
    status?: SortOrder
    stage?: SortOrder
    ownerWallet?: SortOrderInput | SortOrder
    lastAuthTimestamp?: SortOrderInput | SortOrder
    configKeypairSecret?: SortOrderInput | SortOrder
    baseMintKeypairSecret?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LaunchCountOrderByAggregateInput
    _max?: LaunchMaxOrderByAggregateInput
    _min?: LaunchMinOrderByAggregateInput
  }

  export type LaunchScalarWhereWithAggregatesInput = {
    AND?: LaunchScalarWhereWithAggregatesInput | LaunchScalarWhereWithAggregatesInput[]
    OR?: LaunchScalarWhereWithAggregatesInput[]
    NOT?: LaunchScalarWhereWithAggregatesInput | LaunchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Launch"> | string
    assetId?: StringWithAggregatesFilter<"Launch"> | string
    marketProfileId?: StringWithAggregatesFilter<"Launch"> | string
    curveConfigId?: StringWithAggregatesFilter<"Launch"> | string
    configAddress?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    poolAddress?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    baseMint?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    quoteMint?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    configTxSignature?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    poolTxSignature?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    status?: EnumPoolStatusWithAggregatesFilter<"Launch"> | $Enums.PoolStatus
    stage?: EnumLaunchStageWithAggregatesFilter<"Launch"> | $Enums.LaunchStage
    ownerWallet?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    lastAuthTimestamp?: DateTimeNullableWithAggregatesFilter<"Launch"> | Date | string | null
    configKeypairSecret?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    baseMintKeypairSecret?: StringNullableWithAggregatesFilter<"Launch"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Launch"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Launch"> | Date | string
  }

  export type PoolWhereInput = {
    AND?: PoolWhereInput | PoolWhereInput[]
    OR?: PoolWhereInput[]
    NOT?: PoolWhereInput | PoolWhereInput[]
    id?: StringFilter<"Pool"> | string
    launchId?: StringFilter<"Pool"> | string
    poolAddress?: StringFilter<"Pool"> | string
    configAddress?: StringFilter<"Pool"> | string
    baseMint?: StringFilter<"Pool"> | string
    quoteMint?: StringFilter<"Pool"> | string
    createdAt?: DateTimeFilter<"Pool"> | Date | string
    launch?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
    snapshots?: MarketSnapshotListRelationFilter
  }

  export type PoolOrderByWithRelationInput = {
    id?: SortOrder
    launchId?: SortOrder
    poolAddress?: SortOrder
    configAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    createdAt?: SortOrder
    launch?: LaunchOrderByWithRelationInput
    snapshots?: MarketSnapshotOrderByRelationAggregateInput
  }

  export type PoolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    launchId?: string
    poolAddress?: string
    AND?: PoolWhereInput | PoolWhereInput[]
    OR?: PoolWhereInput[]
    NOT?: PoolWhereInput | PoolWhereInput[]
    configAddress?: StringFilter<"Pool"> | string
    baseMint?: StringFilter<"Pool"> | string
    quoteMint?: StringFilter<"Pool"> | string
    createdAt?: DateTimeFilter<"Pool"> | Date | string
    launch?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
    snapshots?: MarketSnapshotListRelationFilter
  }, "id" | "launchId" | "poolAddress">

  export type PoolOrderByWithAggregationInput = {
    id?: SortOrder
    launchId?: SortOrder
    poolAddress?: SortOrder
    configAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    createdAt?: SortOrder
    _count?: PoolCountOrderByAggregateInput
    _max?: PoolMaxOrderByAggregateInput
    _min?: PoolMinOrderByAggregateInput
  }

  export type PoolScalarWhereWithAggregatesInput = {
    AND?: PoolScalarWhereWithAggregatesInput | PoolScalarWhereWithAggregatesInput[]
    OR?: PoolScalarWhereWithAggregatesInput[]
    NOT?: PoolScalarWhereWithAggregatesInput | PoolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pool"> | string
    launchId?: StringWithAggregatesFilter<"Pool"> | string
    poolAddress?: StringWithAggregatesFilter<"Pool"> | string
    configAddress?: StringWithAggregatesFilter<"Pool"> | string
    baseMint?: StringWithAggregatesFilter<"Pool"> | string
    quoteMint?: StringWithAggregatesFilter<"Pool"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Pool"> | Date | string
  }

  export type MarketSnapshotWhereInput = {
    AND?: MarketSnapshotWhereInput | MarketSnapshotWhereInput[]
    OR?: MarketSnapshotWhereInput[]
    NOT?: MarketSnapshotWhereInput | MarketSnapshotWhereInput[]
    id?: StringFilter<"MarketSnapshot"> | string
    poolAddress?: StringFilter<"MarketSnapshot"> | string
    priceUsd?: FloatFilter<"MarketSnapshot"> | number
    volume24hUsd?: FloatFilter<"MarketSnapshot"> | number
    liquidityUsd?: FloatFilter<"MarketSnapshot"> | number
    quoteReserve?: FloatFilter<"MarketSnapshot"> | number
    baseReserve?: FloatFilter<"MarketSnapshot"> | number
    curveProgress?: FloatFilter<"MarketSnapshot"> | number
    migrationThresholdUsd?: FloatFilter<"MarketSnapshot"> | number
    graduationProgress?: FloatFilter<"MarketSnapshot"> | number
    estimatedSlippageBps?: FloatFilter<"MarketSnapshot"> | number
    marketQualityScore?: JsonFilter<"MarketSnapshot">
    regime?: EnumMarketRegimeFilter<"MarketSnapshot"> | $Enums.MarketRegime
    status?: EnumPoolStatusFilter<"MarketSnapshot"> | $Enums.PoolStatus
    timestamp?: DateTimeFilter<"MarketSnapshot"> | Date | string
    pool?: XOR<PoolScalarRelationFilter, PoolWhereInput>
  }

  export type MarketSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    poolAddress?: SortOrder
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
    marketQualityScore?: SortOrder
    regime?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    pool?: PoolOrderByWithRelationInput
  }

  export type MarketSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MarketSnapshotWhereInput | MarketSnapshotWhereInput[]
    OR?: MarketSnapshotWhereInput[]
    NOT?: MarketSnapshotWhereInput | MarketSnapshotWhereInput[]
    poolAddress?: StringFilter<"MarketSnapshot"> | string
    priceUsd?: FloatFilter<"MarketSnapshot"> | number
    volume24hUsd?: FloatFilter<"MarketSnapshot"> | number
    liquidityUsd?: FloatFilter<"MarketSnapshot"> | number
    quoteReserve?: FloatFilter<"MarketSnapshot"> | number
    baseReserve?: FloatFilter<"MarketSnapshot"> | number
    curveProgress?: FloatFilter<"MarketSnapshot"> | number
    migrationThresholdUsd?: FloatFilter<"MarketSnapshot"> | number
    graduationProgress?: FloatFilter<"MarketSnapshot"> | number
    estimatedSlippageBps?: FloatFilter<"MarketSnapshot"> | number
    marketQualityScore?: JsonFilter<"MarketSnapshot">
    regime?: EnumMarketRegimeFilter<"MarketSnapshot"> | $Enums.MarketRegime
    status?: EnumPoolStatusFilter<"MarketSnapshot"> | $Enums.PoolStatus
    timestamp?: DateTimeFilter<"MarketSnapshot"> | Date | string
    pool?: XOR<PoolScalarRelationFilter, PoolWhereInput>
  }, "id">

  export type MarketSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    poolAddress?: SortOrder
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
    marketQualityScore?: SortOrder
    regime?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
    _count?: MarketSnapshotCountOrderByAggregateInput
    _avg?: MarketSnapshotAvgOrderByAggregateInput
    _max?: MarketSnapshotMaxOrderByAggregateInput
    _min?: MarketSnapshotMinOrderByAggregateInput
    _sum?: MarketSnapshotSumOrderByAggregateInput
  }

  export type MarketSnapshotScalarWhereWithAggregatesInput = {
    AND?: MarketSnapshotScalarWhereWithAggregatesInput | MarketSnapshotScalarWhereWithAggregatesInput[]
    OR?: MarketSnapshotScalarWhereWithAggregatesInput[]
    NOT?: MarketSnapshotScalarWhereWithAggregatesInput | MarketSnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarketSnapshot"> | string
    poolAddress?: StringWithAggregatesFilter<"MarketSnapshot"> | string
    priceUsd?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    volume24hUsd?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    liquidityUsd?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    quoteReserve?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    baseReserve?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    curveProgress?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    migrationThresholdUsd?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    graduationProgress?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    estimatedSlippageBps?: FloatWithAggregatesFilter<"MarketSnapshot"> | number
    marketQualityScore?: JsonWithAggregatesFilter<"MarketSnapshot">
    regime?: EnumMarketRegimeWithAggregatesFilter<"MarketSnapshot"> | $Enums.MarketRegime
    status?: EnumPoolStatusWithAggregatesFilter<"MarketSnapshot"> | $Enums.PoolStatus
    timestamp?: DateTimeWithAggregatesFilter<"MarketSnapshot"> | Date | string
  }

  export type TradeWhereInput = {
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    id?: StringFilter<"Trade"> | string
    marketId?: StringFilter<"Trade"> | string
    signature?: StringFilter<"Trade"> | string
    trader?: StringFilter<"Trade"> | string
    side?: EnumTradeSideFilter<"Trade"> | $Enums.TradeSide
    tokenAmount?: FloatFilter<"Trade"> | number
    quoteAmount?: FloatFilter<"Trade"> | number
    priceUsd?: FloatFilter<"Trade"> | number
    timestamp?: DateTimeFilter<"Trade"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }

  export type TradeOrderByWithRelationInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    trader?: SortOrder
    side?: SortOrder
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
    timestamp?: SortOrder
    market?: LaunchOrderByWithRelationInput
  }

  export type TradeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    signature?: string
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    marketId?: StringFilter<"Trade"> | string
    trader?: StringFilter<"Trade"> | string
    side?: EnumTradeSideFilter<"Trade"> | $Enums.TradeSide
    tokenAmount?: FloatFilter<"Trade"> | number
    quoteAmount?: FloatFilter<"Trade"> | number
    priceUsd?: FloatFilter<"Trade"> | number
    timestamp?: DateTimeFilter<"Trade"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }, "id" | "signature">

  export type TradeOrderByWithAggregationInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    trader?: SortOrder
    side?: SortOrder
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
    timestamp?: SortOrder
    _count?: TradeCountOrderByAggregateInput
    _avg?: TradeAvgOrderByAggregateInput
    _max?: TradeMaxOrderByAggregateInput
    _min?: TradeMinOrderByAggregateInput
    _sum?: TradeSumOrderByAggregateInput
  }

  export type TradeScalarWhereWithAggregatesInput = {
    AND?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    OR?: TradeScalarWhereWithAggregatesInput[]
    NOT?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trade"> | string
    marketId?: StringWithAggregatesFilter<"Trade"> | string
    signature?: StringWithAggregatesFilter<"Trade"> | string
    trader?: StringWithAggregatesFilter<"Trade"> | string
    side?: EnumTradeSideWithAggregatesFilter<"Trade"> | $Enums.TradeSide
    tokenAmount?: FloatWithAggregatesFilter<"Trade"> | number
    quoteAmount?: FloatWithAggregatesFilter<"Trade"> | number
    priceUsd?: FloatWithAggregatesFilter<"Trade"> | number
    timestamp?: DateTimeWithAggregatesFilter<"Trade"> | Date | string
  }

  export type PriceHistoryWhereInput = {
    AND?: PriceHistoryWhereInput | PriceHistoryWhereInput[]
    OR?: PriceHistoryWhereInput[]
    NOT?: PriceHistoryWhereInput | PriceHistoryWhereInput[]
    id?: StringFilter<"PriceHistory"> | string
    marketId?: StringFilter<"PriceHistory"> | string
    priceUsd?: FloatFilter<"PriceHistory"> | number
    source?: StringFilter<"PriceHistory"> | string
    timestamp?: DateTimeFilter<"PriceHistory"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }

  export type PriceHistoryOrderByWithRelationInput = {
    id?: SortOrder
    marketId?: SortOrder
    priceUsd?: SortOrder
    source?: SortOrder
    timestamp?: SortOrder
    market?: LaunchOrderByWithRelationInput
  }

  export type PriceHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PriceHistoryWhereInput | PriceHistoryWhereInput[]
    OR?: PriceHistoryWhereInput[]
    NOT?: PriceHistoryWhereInput | PriceHistoryWhereInput[]
    marketId?: StringFilter<"PriceHistory"> | string
    priceUsd?: FloatFilter<"PriceHistory"> | number
    source?: StringFilter<"PriceHistory"> | string
    timestamp?: DateTimeFilter<"PriceHistory"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }, "id">

  export type PriceHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    marketId?: SortOrder
    priceUsd?: SortOrder
    source?: SortOrder
    timestamp?: SortOrder
    _count?: PriceHistoryCountOrderByAggregateInput
    _avg?: PriceHistoryAvgOrderByAggregateInput
    _max?: PriceHistoryMaxOrderByAggregateInput
    _min?: PriceHistoryMinOrderByAggregateInput
    _sum?: PriceHistorySumOrderByAggregateInput
  }

  export type PriceHistoryScalarWhereWithAggregatesInput = {
    AND?: PriceHistoryScalarWhereWithAggregatesInput | PriceHistoryScalarWhereWithAggregatesInput[]
    OR?: PriceHistoryScalarWhereWithAggregatesInput[]
    NOT?: PriceHistoryScalarWhereWithAggregatesInput | PriceHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PriceHistory"> | string
    marketId?: StringWithAggregatesFilter<"PriceHistory"> | string
    priceUsd?: FloatWithAggregatesFilter<"PriceHistory"> | number
    source?: StringWithAggregatesFilter<"PriceHistory"> | string
    timestamp?: DateTimeWithAggregatesFilter<"PriceHistory"> | Date | string
  }

  export type LiquidityHistoryWhereInput = {
    AND?: LiquidityHistoryWhereInput | LiquidityHistoryWhereInput[]
    OR?: LiquidityHistoryWhereInput[]
    NOT?: LiquidityHistoryWhereInput | LiquidityHistoryWhereInput[]
    id?: StringFilter<"LiquidityHistory"> | string
    marketId?: StringFilter<"LiquidityHistory"> | string
    liquidityUsd?: FloatFilter<"LiquidityHistory"> | number
    timestamp?: DateTimeFilter<"LiquidityHistory"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }

  export type LiquidityHistoryOrderByWithRelationInput = {
    id?: SortOrder
    marketId?: SortOrder
    liquidityUsd?: SortOrder
    timestamp?: SortOrder
    market?: LaunchOrderByWithRelationInput
  }

  export type LiquidityHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LiquidityHistoryWhereInput | LiquidityHistoryWhereInput[]
    OR?: LiquidityHistoryWhereInput[]
    NOT?: LiquidityHistoryWhereInput | LiquidityHistoryWhereInput[]
    marketId?: StringFilter<"LiquidityHistory"> | string
    liquidityUsd?: FloatFilter<"LiquidityHistory"> | number
    timestamp?: DateTimeFilter<"LiquidityHistory"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }, "id">

  export type LiquidityHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    marketId?: SortOrder
    liquidityUsd?: SortOrder
    timestamp?: SortOrder
    _count?: LiquidityHistoryCountOrderByAggregateInput
    _avg?: LiquidityHistoryAvgOrderByAggregateInput
    _max?: LiquidityHistoryMaxOrderByAggregateInput
    _min?: LiquidityHistoryMinOrderByAggregateInput
    _sum?: LiquidityHistorySumOrderByAggregateInput
  }

  export type LiquidityHistoryScalarWhereWithAggregatesInput = {
    AND?: LiquidityHistoryScalarWhereWithAggregatesInput | LiquidityHistoryScalarWhereWithAggregatesInput[]
    OR?: LiquidityHistoryScalarWhereWithAggregatesInput[]
    NOT?: LiquidityHistoryScalarWhereWithAggregatesInput | LiquidityHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LiquidityHistory"> | string
    marketId?: StringWithAggregatesFilter<"LiquidityHistory"> | string
    liquidityUsd?: FloatWithAggregatesFilter<"LiquidityHistory"> | number
    timestamp?: DateTimeWithAggregatesFilter<"LiquidityHistory"> | Date | string
  }

  export type GraduationEventWhereInput = {
    AND?: GraduationEventWhereInput | GraduationEventWhereInput[]
    OR?: GraduationEventWhereInput[]
    NOT?: GraduationEventWhereInput | GraduationEventWhereInput[]
    id?: StringFilter<"GraduationEvent"> | string
    marketId?: StringFilter<"GraduationEvent"> | string
    signature?: StringFilter<"GraduationEvent"> | string
    finalState?: JsonFilter<"GraduationEvent">
    timestamp?: DateTimeFilter<"GraduationEvent"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }

  export type GraduationEventOrderByWithRelationInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    finalState?: SortOrder
    timestamp?: SortOrder
    market?: LaunchOrderByWithRelationInput
  }

  export type GraduationEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    signature?: string
    AND?: GraduationEventWhereInput | GraduationEventWhereInput[]
    OR?: GraduationEventWhereInput[]
    NOT?: GraduationEventWhereInput | GraduationEventWhereInput[]
    marketId?: StringFilter<"GraduationEvent"> | string
    finalState?: JsonFilter<"GraduationEvent">
    timestamp?: DateTimeFilter<"GraduationEvent"> | Date | string
    market?: XOR<LaunchScalarRelationFilter, LaunchWhereInput>
  }, "id" | "signature">

  export type GraduationEventOrderByWithAggregationInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    finalState?: SortOrder
    timestamp?: SortOrder
    _count?: GraduationEventCountOrderByAggregateInput
    _max?: GraduationEventMaxOrderByAggregateInput
    _min?: GraduationEventMinOrderByAggregateInput
  }

  export type GraduationEventScalarWhereWithAggregatesInput = {
    AND?: GraduationEventScalarWhereWithAggregatesInput | GraduationEventScalarWhereWithAggregatesInput[]
    OR?: GraduationEventScalarWhereWithAggregatesInput[]
    NOT?: GraduationEventScalarWhereWithAggregatesInput | GraduationEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GraduationEvent"> | string
    marketId?: StringWithAggregatesFilter<"GraduationEvent"> | string
    signature?: StringWithAggregatesFilter<"GraduationEvent"> | string
    finalState?: JsonWithAggregatesFilter<"GraduationEvent">
    timestamp?: DateTimeWithAggregatesFilter<"GraduationEvent"> | Date | string
  }

  export type IndexerCursorWhereInput = {
    AND?: IndexerCursorWhereInput | IndexerCursorWhereInput[]
    OR?: IndexerCursorWhereInput[]
    NOT?: IndexerCursorWhereInput | IndexerCursorWhereInput[]
    poolAddress?: StringFilter<"IndexerCursor"> | string
    lastSignature?: StringNullableFilter<"IndexerCursor"> | string | null
    lastIndexedAt?: DateTimeFilter<"IndexerCursor"> | Date | string
  }

  export type IndexerCursorOrderByWithRelationInput = {
    poolAddress?: SortOrder
    lastSignature?: SortOrderInput | SortOrder
    lastIndexedAt?: SortOrder
  }

  export type IndexerCursorWhereUniqueInput = Prisma.AtLeast<{
    poolAddress?: string
    AND?: IndexerCursorWhereInput | IndexerCursorWhereInput[]
    OR?: IndexerCursorWhereInput[]
    NOT?: IndexerCursorWhereInput | IndexerCursorWhereInput[]
    lastSignature?: StringNullableFilter<"IndexerCursor"> | string | null
    lastIndexedAt?: DateTimeFilter<"IndexerCursor"> | Date | string
  }, "poolAddress">

  export type IndexerCursorOrderByWithAggregationInput = {
    poolAddress?: SortOrder
    lastSignature?: SortOrderInput | SortOrder
    lastIndexedAt?: SortOrder
    _count?: IndexerCursorCountOrderByAggregateInput
    _max?: IndexerCursorMaxOrderByAggregateInput
    _min?: IndexerCursorMinOrderByAggregateInput
  }

  export type IndexerCursorScalarWhereWithAggregatesInput = {
    AND?: IndexerCursorScalarWhereWithAggregatesInput | IndexerCursorScalarWhereWithAggregatesInput[]
    OR?: IndexerCursorScalarWhereWithAggregatesInput[]
    NOT?: IndexerCursorScalarWhereWithAggregatesInput | IndexerCursorScalarWhereWithAggregatesInput[]
    poolAddress?: StringWithAggregatesFilter<"IndexerCursor"> | string
    lastSignature?: StringNullableWithAggregatesFilter<"IndexerCursor"> | string | null
    lastIndexedAt?: DateTimeWithAggregatesFilter<"IndexerCursor"> | Date | string
  }

  export type AssetCreateInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileCreateNestedManyWithoutAssetInput
    curveConfigs?: CurveConfigCreateNestedManyWithoutAssetInput
    launches?: LaunchCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileUncheckedCreateNestedManyWithoutAssetInput
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutAssetInput
    launches?: LaunchUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUpdateManyWithoutAssetNestedInput
    curveConfigs?: CurveConfigUpdateManyWithoutAssetNestedInput
    launches?: LaunchUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUncheckedUpdateManyWithoutAssetNestedInput
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutAssetNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateManyInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
  }

  export type AssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketProfileCreateInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutMarketProfilesInput
    curveConfigs?: CurveConfigCreateNestedManyWithoutMarketProfileInput
    launches?: LaunchCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileUncheckedCreateInput = {
    id?: string
    assetId: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutMarketProfileInput
    launches?: LaunchUncheckedCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutMarketProfilesNestedInput
    curveConfigs?: CurveConfigUpdateManyWithoutMarketProfileNestedInput
    launches?: LaunchUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutMarketProfileNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileCreateManyInput = {
    id?: string
    assetId: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
  }

  export type MarketProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CurveConfigCreateInput = {
    id?: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutCurveConfigsInput
    marketProfile: MarketProfileCreateNestedOneWithoutCurveConfigsInput
    simulationRuns?: SimulationRunCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUncheckedCreateInput = {
    id?: string
    assetId: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    simulationRuns?: SimulationRunUncheckedCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchUncheckedCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutCurveConfigsNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutCurveConfigsNestedInput
    simulationRuns?: SimulationRunUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    simulationRuns?: SimulationRunUncheckedUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigCreateManyInput = {
    id?: string
    assetId: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
  }

  export type CurveConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CurveConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunCreateInput = {
    id?: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    curveConfig: CurveConfigCreateNestedOneWithoutSimulationRunsInput
  }

  export type SimulationRunUncheckedCreateInput = {
    id?: string
    curveConfigId: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SimulationRunUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfig?: CurveConfigUpdateOneRequiredWithoutSimulationRunsNestedInput
  }

  export type SimulationRunUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunCreateManyInput = {
    id?: string
    curveConfigId: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SimulationRunUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchCreateInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchCreateManyInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LaunchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolCreateInput = {
    id?: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
    launch: LaunchCreateNestedOneWithoutPoolInput
    snapshots?: MarketSnapshotCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateInput = {
    id?: string
    launchId: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
    snapshots?: MarketSnapshotUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    launch?: LaunchUpdateOneRequiredWithoutPoolNestedInput
    snapshots?: MarketSnapshotUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    launchId?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: MarketSnapshotUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type PoolCreateManyInput = {
    id?: string
    launchId: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
  }

  export type PoolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    launchId?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotCreateInput = {
    id?: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
    pool: PoolCreateNestedOneWithoutSnapshotsInput
  }

  export type MarketSnapshotUncheckedCreateInput = {
    id?: string
    poolAddress: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
  }

  export type MarketSnapshotUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUpdateOneRequiredWithoutSnapshotsNestedInput
  }

  export type MarketSnapshotUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotCreateManyInput = {
    id?: string
    poolAddress: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
  }

  export type MarketSnapshotUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeCreateInput = {
    id?: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
    market: LaunchCreateNestedOneWithoutTradesInput
  }

  export type TradeUncheckedCreateInput = {
    id?: string
    marketId: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
  }

  export type TradeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    market?: LaunchUpdateOneRequiredWithoutTradesNestedInput
  }

  export type TradeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeCreateManyInput = {
    id?: string
    marketId: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
  }

  export type TradeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryCreateInput = {
    id?: string
    priceUsd: number
    source: string
    timestamp: Date | string
    market: LaunchCreateNestedOneWithoutPriceHistoryInput
  }

  export type PriceHistoryUncheckedCreateInput = {
    id?: string
    marketId: string
    priceUsd: number
    source: string
    timestamp: Date | string
  }

  export type PriceHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    market?: LaunchUpdateOneRequiredWithoutPriceHistoryNestedInput
  }

  export type PriceHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryCreateManyInput = {
    id?: string
    marketId: string
    priceUsd: number
    source: string
    timestamp: Date | string
  }

  export type PriceHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryCreateInput = {
    id?: string
    liquidityUsd: number
    timestamp: Date | string
    market: LaunchCreateNestedOneWithoutLiquidityHistoryInput
  }

  export type LiquidityHistoryUncheckedCreateInput = {
    id?: string
    marketId: string
    liquidityUsd: number
    timestamp: Date | string
  }

  export type LiquidityHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    market?: LaunchUpdateOneRequiredWithoutLiquidityHistoryNestedInput
  }

  export type LiquidityHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryCreateManyInput = {
    id?: string
    marketId: string
    liquidityUsd: number
    timestamp: Date | string
  }

  export type LiquidityHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventCreateInput = {
    id?: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
    market: LaunchCreateNestedOneWithoutGraduationEventsInput
  }

  export type GraduationEventUncheckedCreateInput = {
    id?: string
    marketId: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type GraduationEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    market?: LaunchUpdateOneRequiredWithoutGraduationEventsNestedInput
  }

  export type GraduationEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventCreateManyInput = {
    id?: string
    marketId: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type GraduationEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketId?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerCursorCreateInput = {
    poolAddress: string
    lastSignature?: string | null
    lastIndexedAt?: Date | string
  }

  export type IndexerCursorUncheckedCreateInput = {
    poolAddress: string
    lastSignature?: string | null
    lastIndexedAt?: Date | string
  }

  export type IndexerCursorUpdateInput = {
    poolAddress?: StringFieldUpdateOperationsInput | string
    lastSignature?: NullableStringFieldUpdateOperationsInput | string | null
    lastIndexedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerCursorUncheckedUpdateInput = {
    poolAddress?: StringFieldUpdateOperationsInput | string
    lastSignature?: NullableStringFieldUpdateOperationsInput | string | null
    lastIndexedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerCursorCreateManyInput = {
    poolAddress: string
    lastSignature?: string | null
    lastIndexedAt?: Date | string
  }

  export type IndexerCursorUpdateManyMutationInput = {
    poolAddress?: StringFieldUpdateOperationsInput | string
    lastSignature?: NullableStringFieldUpdateOperationsInput | string | null
    lastIndexedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerCursorUncheckedUpdateManyInput = {
    poolAddress?: StringFieldUpdateOperationsInput | string
    lastSignature?: NullableStringFieldUpdateOperationsInput | string | null
    lastIndexedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type EnumAssetSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetSource | EnumAssetSourceFieldRefInput<$PrismaModel>
    in?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetSourceFilter<$PrismaModel> | $Enums.AssetSource
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MarketProfileListRelationFilter = {
    every?: MarketProfileWhereInput
    some?: MarketProfileWhereInput
    none?: MarketProfileWhereInput
  }

  export type CurveConfigListRelationFilter = {
    every?: CurveConfigWhereInput
    some?: CurveConfigWhereInput
    none?: CurveConfigWhereInput
  }

  export type LaunchListRelationFilter = {
    every?: LaunchWhereInput
    some?: LaunchWhereInput
    none?: LaunchWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MarketProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CurveConfigOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LaunchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    symbol?: SortOrder
    mintAddress?: SortOrder
    issuer?: SortOrder
    assetType?: SortOrder
    referencePriceUsd?: SortOrder
    source?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetAvgOrderByAggregateInput = {
    referencePriceUsd?: SortOrder
  }

  export type AssetMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    symbol?: SortOrder
    mintAddress?: SortOrder
    issuer?: SortOrder
    assetType?: SortOrder
    referencePriceUsd?: SortOrder
    source?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    symbol?: SortOrder
    mintAddress?: SortOrder
    issuer?: SortOrder
    assetType?: SortOrder
    referencePriceUsd?: SortOrder
    source?: SortOrder
    externalId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetSumOrderByAggregateInput = {
    referencePriceUsd?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type EnumAssetSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetSource | EnumAssetSourceFieldRefInput<$PrismaModel>
    in?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetSourceWithAggregatesFilter<$PrismaModel> | $Enums.AssetSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetSourceFilter<$PrismaModel>
    _max?: NestedEnumAssetSourceFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumRiskProfileFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileFilter<$PrismaModel> | $Enums.RiskProfile
  }

  export type EnumQuoteTokenFilter<$PrismaModel = never> = {
    equals?: $Enums.QuoteToken | EnumQuoteTokenFieldRefInput<$PrismaModel>
    in?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    not?: NestedEnumQuoteTokenFilter<$PrismaModel> | $Enums.QuoteToken
  }

  export type AssetScalarRelationFilter = {
    is?: AssetWhereInput
    isNot?: AssetWhereInput
  }

  export type MarketProfileCountOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    initialLiquidityUsd?: SortOrder
    expectedVolatility?: SortOrder
    riskProfile?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
    quoteToken?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketProfileAvgOrderByAggregateInput = {
    initialLiquidityUsd?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
  }

  export type MarketProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    initialLiquidityUsd?: SortOrder
    expectedVolatility?: SortOrder
    riskProfile?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
    quoteToken?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketProfileMinOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    initialLiquidityUsd?: SortOrder
    expectedVolatility?: SortOrder
    riskProfile?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
    quoteToken?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketProfileSumOrderByAggregateInput = {
    initialLiquidityUsd?: SortOrder
    targetLiquidityUsd?: SortOrder
    targetGraduationUsd?: SortOrder
  }

  export type EnumRiskProfileWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel> | $Enums.RiskProfile
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskProfileFilter<$PrismaModel>
    _max?: NestedEnumRiskProfileFilter<$PrismaModel>
  }

  export type EnumQuoteTokenWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuoteToken | EnumQuoteTokenFieldRefInput<$PrismaModel>
    in?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    not?: NestedEnumQuoteTokenWithAggregatesFilter<$PrismaModel> | $Enums.QuoteToken
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuoteTokenFilter<$PrismaModel>
    _max?: NestedEnumQuoteTokenFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type MarketProfileScalarRelationFilter = {
    is?: MarketProfileWhereInput
    isNot?: MarketProfileWhereInput
  }

  export type SimulationRunListRelationFilter = {
    every?: SimulationRunWhereInput
    some?: SimulationRunWhereInput
    none?: SimulationRunWhereInput
  }

  export type SimulationRunOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CurveConfigCountOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    riskProfile?: SortOrder
    label?: SortOrder
    rationale?: SortOrder
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
    feeSchedule?: SortOrder
    migration?: SortOrder
    liquidityDistribution?: SortOrder
    score?: SortOrder
    isRecommended?: SortOrder
    createdAt?: SortOrder
  }

  export type CurveConfigAvgOrderByAggregateInput = {
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
  }

  export type CurveConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    riskProfile?: SortOrder
    label?: SortOrder
    rationale?: SortOrder
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
    isRecommended?: SortOrder
    createdAt?: SortOrder
  }

  export type CurveConfigMinOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    riskProfile?: SortOrder
    label?: SortOrder
    rationale?: SortOrder
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
    isRecommended?: SortOrder
    createdAt?: SortOrder
  }

  export type CurveConfigSumOrderByAggregateInput = {
    initialMarketCapUsd?: SortOrder
    migrationMarketCapUsd?: SortOrder
    tokenSupply?: SortOrder
    tokenBaseDecimals?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type CurveConfigScalarRelationFilter = {
    is?: CurveConfigWhereInput
    isNot?: CurveConfigWhereInput
  }

  export type SimulationRunCountOrderByAggregateInput = {
    id?: SortOrder
    curveConfigId?: SortOrder
    scenarios?: SortOrder
    createdAt?: SortOrder
  }

  export type SimulationRunMaxOrderByAggregateInput = {
    id?: SortOrder
    curveConfigId?: SortOrder
    createdAt?: SortOrder
  }

  export type SimulationRunMinOrderByAggregateInput = {
    id?: SortOrder
    curveConfigId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumPoolStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PoolStatus | EnumPoolStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoolStatusFilter<$PrismaModel> | $Enums.PoolStatus
  }

  export type EnumLaunchStageFilter<$PrismaModel = never> = {
    equals?: $Enums.LaunchStage | EnumLaunchStageFieldRefInput<$PrismaModel>
    in?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    not?: NestedEnumLaunchStageFilter<$PrismaModel> | $Enums.LaunchStage
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PoolNullableScalarRelationFilter = {
    is?: PoolWhereInput | null
    isNot?: PoolWhereInput | null
  }

  export type TradeListRelationFilter = {
    every?: TradeWhereInput
    some?: TradeWhereInput
    none?: TradeWhereInput
  }

  export type PriceHistoryListRelationFilter = {
    every?: PriceHistoryWhereInput
    some?: PriceHistoryWhereInput
    none?: PriceHistoryWhereInput
  }

  export type LiquidityHistoryListRelationFilter = {
    every?: LiquidityHistoryWhereInput
    some?: LiquidityHistoryWhereInput
    none?: LiquidityHistoryWhereInput
  }

  export type GraduationEventListRelationFilter = {
    every?: GraduationEventWhereInput
    some?: GraduationEventWhereInput
    none?: GraduationEventWhereInput
  }

  export type TradeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PriceHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LiquidityHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GraduationEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LaunchCountOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    curveConfigId?: SortOrder
    configAddress?: SortOrder
    poolAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    configTxSignature?: SortOrder
    poolTxSignature?: SortOrder
    status?: SortOrder
    stage?: SortOrder
    ownerWallet?: SortOrder
    lastAuthTimestamp?: SortOrder
    configKeypairSecret?: SortOrder
    baseMintKeypairSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LaunchMaxOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    curveConfigId?: SortOrder
    configAddress?: SortOrder
    poolAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    configTxSignature?: SortOrder
    poolTxSignature?: SortOrder
    status?: SortOrder
    stage?: SortOrder
    ownerWallet?: SortOrder
    lastAuthTimestamp?: SortOrder
    configKeypairSecret?: SortOrder
    baseMintKeypairSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LaunchMinOrderByAggregateInput = {
    id?: SortOrder
    assetId?: SortOrder
    marketProfileId?: SortOrder
    curveConfigId?: SortOrder
    configAddress?: SortOrder
    poolAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    configTxSignature?: SortOrder
    poolTxSignature?: SortOrder
    status?: SortOrder
    stage?: SortOrder
    ownerWallet?: SortOrder
    lastAuthTimestamp?: SortOrder
    configKeypairSecret?: SortOrder
    baseMintKeypairSecret?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumPoolStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PoolStatus | EnumPoolStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoolStatusWithAggregatesFilter<$PrismaModel> | $Enums.PoolStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPoolStatusFilter<$PrismaModel>
    _max?: NestedEnumPoolStatusFilter<$PrismaModel>
  }

  export type EnumLaunchStageWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LaunchStage | EnumLaunchStageFieldRefInput<$PrismaModel>
    in?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    not?: NestedEnumLaunchStageWithAggregatesFilter<$PrismaModel> | $Enums.LaunchStage
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLaunchStageFilter<$PrismaModel>
    _max?: NestedEnumLaunchStageFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type LaunchScalarRelationFilter = {
    is?: LaunchWhereInput
    isNot?: LaunchWhereInput
  }

  export type MarketSnapshotListRelationFilter = {
    every?: MarketSnapshotWhereInput
    some?: MarketSnapshotWhereInput
    none?: MarketSnapshotWhereInput
  }

  export type MarketSnapshotOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PoolCountOrderByAggregateInput = {
    id?: SortOrder
    launchId?: SortOrder
    poolAddress?: SortOrder
    configAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    createdAt?: SortOrder
  }

  export type PoolMaxOrderByAggregateInput = {
    id?: SortOrder
    launchId?: SortOrder
    poolAddress?: SortOrder
    configAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    createdAt?: SortOrder
  }

  export type PoolMinOrderByAggregateInput = {
    id?: SortOrder
    launchId?: SortOrder
    poolAddress?: SortOrder
    configAddress?: SortOrder
    baseMint?: SortOrder
    quoteMint?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumMarketRegimeFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketRegime | EnumMarketRegimeFieldRefInput<$PrismaModel>
    in?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    not?: NestedEnumMarketRegimeFilter<$PrismaModel> | $Enums.MarketRegime
  }

  export type PoolScalarRelationFilter = {
    is?: PoolWhereInput
    isNot?: PoolWhereInput
  }

  export type MarketSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    poolAddress?: SortOrder
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
    marketQualityScore?: SortOrder
    regime?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
  }

  export type MarketSnapshotAvgOrderByAggregateInput = {
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
  }

  export type MarketSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    poolAddress?: SortOrder
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
    regime?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
  }

  export type MarketSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    poolAddress?: SortOrder
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
    regime?: SortOrder
    status?: SortOrder
    timestamp?: SortOrder
  }

  export type MarketSnapshotSumOrderByAggregateInput = {
    priceUsd?: SortOrder
    volume24hUsd?: SortOrder
    liquidityUsd?: SortOrder
    quoteReserve?: SortOrder
    baseReserve?: SortOrder
    curveProgress?: SortOrder
    migrationThresholdUsd?: SortOrder
    graduationProgress?: SortOrder
    estimatedSlippageBps?: SortOrder
  }

  export type EnumMarketRegimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketRegime | EnumMarketRegimeFieldRefInput<$PrismaModel>
    in?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    not?: NestedEnumMarketRegimeWithAggregatesFilter<$PrismaModel> | $Enums.MarketRegime
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMarketRegimeFilter<$PrismaModel>
    _max?: NestedEnumMarketRegimeFilter<$PrismaModel>
  }

  export type EnumTradeSideFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideFilter<$PrismaModel> | $Enums.TradeSide
  }

  export type TradeCountOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    trader?: SortOrder
    side?: SortOrder
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type TradeAvgOrderByAggregateInput = {
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
  }

  export type TradeMaxOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    trader?: SortOrder
    side?: SortOrder
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type TradeMinOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    trader?: SortOrder
    side?: SortOrder
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type TradeSumOrderByAggregateInput = {
    tokenAmount?: SortOrder
    quoteAmount?: SortOrder
    priceUsd?: SortOrder
  }

  export type EnumTradeSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideWithAggregatesFilter<$PrismaModel> | $Enums.TradeSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeSideFilter<$PrismaModel>
    _max?: NestedEnumTradeSideFilter<$PrismaModel>
  }

  export type PriceHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    priceUsd?: SortOrder
    source?: SortOrder
    timestamp?: SortOrder
  }

  export type PriceHistoryAvgOrderByAggregateInput = {
    priceUsd?: SortOrder
  }

  export type PriceHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    priceUsd?: SortOrder
    source?: SortOrder
    timestamp?: SortOrder
  }

  export type PriceHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    priceUsd?: SortOrder
    source?: SortOrder
    timestamp?: SortOrder
  }

  export type PriceHistorySumOrderByAggregateInput = {
    priceUsd?: SortOrder
  }

  export type LiquidityHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    liquidityUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type LiquidityHistoryAvgOrderByAggregateInput = {
    liquidityUsd?: SortOrder
  }

  export type LiquidityHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    liquidityUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type LiquidityHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    liquidityUsd?: SortOrder
    timestamp?: SortOrder
  }

  export type LiquidityHistorySumOrderByAggregateInput = {
    liquidityUsd?: SortOrder
  }

  export type GraduationEventCountOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    finalState?: SortOrder
    timestamp?: SortOrder
  }

  export type GraduationEventMaxOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    timestamp?: SortOrder
  }

  export type GraduationEventMinOrderByAggregateInput = {
    id?: SortOrder
    marketId?: SortOrder
    signature?: SortOrder
    timestamp?: SortOrder
  }

  export type IndexerCursorCountOrderByAggregateInput = {
    poolAddress?: SortOrder
    lastSignature?: SortOrder
    lastIndexedAt?: SortOrder
  }

  export type IndexerCursorMaxOrderByAggregateInput = {
    poolAddress?: SortOrder
    lastSignature?: SortOrder
    lastIndexedAt?: SortOrder
  }

  export type IndexerCursorMinOrderByAggregateInput = {
    poolAddress?: SortOrder
    lastSignature?: SortOrder
    lastIndexedAt?: SortOrder
  }

  export type MarketProfileCreateNestedManyWithoutAssetInput = {
    create?: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput> | MarketProfileCreateWithoutAssetInput[] | MarketProfileUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketProfileCreateOrConnectWithoutAssetInput | MarketProfileCreateOrConnectWithoutAssetInput[]
    createMany?: MarketProfileCreateManyAssetInputEnvelope
    connect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
  }

  export type CurveConfigCreateNestedManyWithoutAssetInput = {
    create?: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput> | CurveConfigCreateWithoutAssetInput[] | CurveConfigUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutAssetInput | CurveConfigCreateOrConnectWithoutAssetInput[]
    createMany?: CurveConfigCreateManyAssetInputEnvelope
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
  }

  export type LaunchCreateNestedManyWithoutAssetInput = {
    create?: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput> | LaunchCreateWithoutAssetInput[] | LaunchUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutAssetInput | LaunchCreateOrConnectWithoutAssetInput[]
    createMany?: LaunchCreateManyAssetInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type MarketProfileUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput> | MarketProfileCreateWithoutAssetInput[] | MarketProfileUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketProfileCreateOrConnectWithoutAssetInput | MarketProfileCreateOrConnectWithoutAssetInput[]
    createMany?: MarketProfileCreateManyAssetInputEnvelope
    connect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
  }

  export type CurveConfigUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput> | CurveConfigCreateWithoutAssetInput[] | CurveConfigUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutAssetInput | CurveConfigCreateOrConnectWithoutAssetInput[]
    createMany?: CurveConfigCreateManyAssetInputEnvelope
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
  }

  export type LaunchUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput> | LaunchCreateWithoutAssetInput[] | LaunchUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutAssetInput | LaunchCreateOrConnectWithoutAssetInput[]
    createMany?: LaunchCreateManyAssetInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumAssetTypeFieldUpdateOperationsInput = {
    set?: $Enums.AssetType
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumAssetSourceFieldUpdateOperationsInput = {
    set?: $Enums.AssetSource
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MarketProfileUpdateManyWithoutAssetNestedInput = {
    create?: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput> | MarketProfileCreateWithoutAssetInput[] | MarketProfileUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketProfileCreateOrConnectWithoutAssetInput | MarketProfileCreateOrConnectWithoutAssetInput[]
    upsert?: MarketProfileUpsertWithWhereUniqueWithoutAssetInput | MarketProfileUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: MarketProfileCreateManyAssetInputEnvelope
    set?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    disconnect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    delete?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    connect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    update?: MarketProfileUpdateWithWhereUniqueWithoutAssetInput | MarketProfileUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: MarketProfileUpdateManyWithWhereWithoutAssetInput | MarketProfileUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: MarketProfileScalarWhereInput | MarketProfileScalarWhereInput[]
  }

  export type CurveConfigUpdateManyWithoutAssetNestedInput = {
    create?: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput> | CurveConfigCreateWithoutAssetInput[] | CurveConfigUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutAssetInput | CurveConfigCreateOrConnectWithoutAssetInput[]
    upsert?: CurveConfigUpsertWithWhereUniqueWithoutAssetInput | CurveConfigUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: CurveConfigCreateManyAssetInputEnvelope
    set?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    disconnect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    delete?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    update?: CurveConfigUpdateWithWhereUniqueWithoutAssetInput | CurveConfigUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: CurveConfigUpdateManyWithWhereWithoutAssetInput | CurveConfigUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
  }

  export type LaunchUpdateManyWithoutAssetNestedInput = {
    create?: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput> | LaunchCreateWithoutAssetInput[] | LaunchUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutAssetInput | LaunchCreateOrConnectWithoutAssetInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutAssetInput | LaunchUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: LaunchCreateManyAssetInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutAssetInput | LaunchUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutAssetInput | LaunchUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type MarketProfileUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput> | MarketProfileCreateWithoutAssetInput[] | MarketProfileUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketProfileCreateOrConnectWithoutAssetInput | MarketProfileCreateOrConnectWithoutAssetInput[]
    upsert?: MarketProfileUpsertWithWhereUniqueWithoutAssetInput | MarketProfileUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: MarketProfileCreateManyAssetInputEnvelope
    set?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    disconnect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    delete?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    connect?: MarketProfileWhereUniqueInput | MarketProfileWhereUniqueInput[]
    update?: MarketProfileUpdateWithWhereUniqueWithoutAssetInput | MarketProfileUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: MarketProfileUpdateManyWithWhereWithoutAssetInput | MarketProfileUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: MarketProfileScalarWhereInput | MarketProfileScalarWhereInput[]
  }

  export type CurveConfigUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput> | CurveConfigCreateWithoutAssetInput[] | CurveConfigUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutAssetInput | CurveConfigCreateOrConnectWithoutAssetInput[]
    upsert?: CurveConfigUpsertWithWhereUniqueWithoutAssetInput | CurveConfigUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: CurveConfigCreateManyAssetInputEnvelope
    set?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    disconnect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    delete?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    update?: CurveConfigUpdateWithWhereUniqueWithoutAssetInput | CurveConfigUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: CurveConfigUpdateManyWithWhereWithoutAssetInput | CurveConfigUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
  }

  export type LaunchUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput> | LaunchCreateWithoutAssetInput[] | LaunchUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutAssetInput | LaunchCreateOrConnectWithoutAssetInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutAssetInput | LaunchUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: LaunchCreateManyAssetInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutAssetInput | LaunchUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutAssetInput | LaunchUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type AssetCreateNestedOneWithoutMarketProfilesInput = {
    create?: XOR<AssetCreateWithoutMarketProfilesInput, AssetUncheckedCreateWithoutMarketProfilesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutMarketProfilesInput
    connect?: AssetWhereUniqueInput
  }

  export type CurveConfigCreateNestedManyWithoutMarketProfileInput = {
    create?: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput> | CurveConfigCreateWithoutMarketProfileInput[] | CurveConfigUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutMarketProfileInput | CurveConfigCreateOrConnectWithoutMarketProfileInput[]
    createMany?: CurveConfigCreateManyMarketProfileInputEnvelope
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
  }

  export type LaunchCreateNestedManyWithoutMarketProfileInput = {
    create?: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput> | LaunchCreateWithoutMarketProfileInput[] | LaunchUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutMarketProfileInput | LaunchCreateOrConnectWithoutMarketProfileInput[]
    createMany?: LaunchCreateManyMarketProfileInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type CurveConfigUncheckedCreateNestedManyWithoutMarketProfileInput = {
    create?: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput> | CurveConfigCreateWithoutMarketProfileInput[] | CurveConfigUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutMarketProfileInput | CurveConfigCreateOrConnectWithoutMarketProfileInput[]
    createMany?: CurveConfigCreateManyMarketProfileInputEnvelope
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
  }

  export type LaunchUncheckedCreateNestedManyWithoutMarketProfileInput = {
    create?: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput> | LaunchCreateWithoutMarketProfileInput[] | LaunchUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutMarketProfileInput | LaunchCreateOrConnectWithoutMarketProfileInput[]
    createMany?: LaunchCreateManyMarketProfileInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type EnumRiskProfileFieldUpdateOperationsInput = {
    set?: $Enums.RiskProfile
  }

  export type EnumQuoteTokenFieldUpdateOperationsInput = {
    set?: $Enums.QuoteToken
  }

  export type AssetUpdateOneRequiredWithoutMarketProfilesNestedInput = {
    create?: XOR<AssetCreateWithoutMarketProfilesInput, AssetUncheckedCreateWithoutMarketProfilesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutMarketProfilesInput
    upsert?: AssetUpsertWithoutMarketProfilesInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutMarketProfilesInput, AssetUpdateWithoutMarketProfilesInput>, AssetUncheckedUpdateWithoutMarketProfilesInput>
  }

  export type CurveConfigUpdateManyWithoutMarketProfileNestedInput = {
    create?: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput> | CurveConfigCreateWithoutMarketProfileInput[] | CurveConfigUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutMarketProfileInput | CurveConfigCreateOrConnectWithoutMarketProfileInput[]
    upsert?: CurveConfigUpsertWithWhereUniqueWithoutMarketProfileInput | CurveConfigUpsertWithWhereUniqueWithoutMarketProfileInput[]
    createMany?: CurveConfigCreateManyMarketProfileInputEnvelope
    set?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    disconnect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    delete?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    update?: CurveConfigUpdateWithWhereUniqueWithoutMarketProfileInput | CurveConfigUpdateWithWhereUniqueWithoutMarketProfileInput[]
    updateMany?: CurveConfigUpdateManyWithWhereWithoutMarketProfileInput | CurveConfigUpdateManyWithWhereWithoutMarketProfileInput[]
    deleteMany?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
  }

  export type LaunchUpdateManyWithoutMarketProfileNestedInput = {
    create?: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput> | LaunchCreateWithoutMarketProfileInput[] | LaunchUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutMarketProfileInput | LaunchCreateOrConnectWithoutMarketProfileInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutMarketProfileInput | LaunchUpsertWithWhereUniqueWithoutMarketProfileInput[]
    createMany?: LaunchCreateManyMarketProfileInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutMarketProfileInput | LaunchUpdateWithWhereUniqueWithoutMarketProfileInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutMarketProfileInput | LaunchUpdateManyWithWhereWithoutMarketProfileInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type CurveConfigUncheckedUpdateManyWithoutMarketProfileNestedInput = {
    create?: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput> | CurveConfigCreateWithoutMarketProfileInput[] | CurveConfigUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: CurveConfigCreateOrConnectWithoutMarketProfileInput | CurveConfigCreateOrConnectWithoutMarketProfileInput[]
    upsert?: CurveConfigUpsertWithWhereUniqueWithoutMarketProfileInput | CurveConfigUpsertWithWhereUniqueWithoutMarketProfileInput[]
    createMany?: CurveConfigCreateManyMarketProfileInputEnvelope
    set?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    disconnect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    delete?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    connect?: CurveConfigWhereUniqueInput | CurveConfigWhereUniqueInput[]
    update?: CurveConfigUpdateWithWhereUniqueWithoutMarketProfileInput | CurveConfigUpdateWithWhereUniqueWithoutMarketProfileInput[]
    updateMany?: CurveConfigUpdateManyWithWhereWithoutMarketProfileInput | CurveConfigUpdateManyWithWhereWithoutMarketProfileInput[]
    deleteMany?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
  }

  export type LaunchUncheckedUpdateManyWithoutMarketProfileNestedInput = {
    create?: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput> | LaunchCreateWithoutMarketProfileInput[] | LaunchUncheckedCreateWithoutMarketProfileInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutMarketProfileInput | LaunchCreateOrConnectWithoutMarketProfileInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutMarketProfileInput | LaunchUpsertWithWhereUniqueWithoutMarketProfileInput[]
    createMany?: LaunchCreateManyMarketProfileInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutMarketProfileInput | LaunchUpdateWithWhereUniqueWithoutMarketProfileInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutMarketProfileInput | LaunchUpdateManyWithWhereWithoutMarketProfileInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type AssetCreateNestedOneWithoutCurveConfigsInput = {
    create?: XOR<AssetCreateWithoutCurveConfigsInput, AssetUncheckedCreateWithoutCurveConfigsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutCurveConfigsInput
    connect?: AssetWhereUniqueInput
  }

  export type MarketProfileCreateNestedOneWithoutCurveConfigsInput = {
    create?: XOR<MarketProfileCreateWithoutCurveConfigsInput, MarketProfileUncheckedCreateWithoutCurveConfigsInput>
    connectOrCreate?: MarketProfileCreateOrConnectWithoutCurveConfigsInput
    connect?: MarketProfileWhereUniqueInput
  }

  export type SimulationRunCreateNestedManyWithoutCurveConfigInput = {
    create?: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput> | SimulationRunCreateWithoutCurveConfigInput[] | SimulationRunUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: SimulationRunCreateOrConnectWithoutCurveConfigInput | SimulationRunCreateOrConnectWithoutCurveConfigInput[]
    createMany?: SimulationRunCreateManyCurveConfigInputEnvelope
    connect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
  }

  export type LaunchCreateNestedManyWithoutCurveConfigInput = {
    create?: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput> | LaunchCreateWithoutCurveConfigInput[] | LaunchUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutCurveConfigInput | LaunchCreateOrConnectWithoutCurveConfigInput[]
    createMany?: LaunchCreateManyCurveConfigInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type SimulationRunUncheckedCreateNestedManyWithoutCurveConfigInput = {
    create?: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput> | SimulationRunCreateWithoutCurveConfigInput[] | SimulationRunUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: SimulationRunCreateOrConnectWithoutCurveConfigInput | SimulationRunCreateOrConnectWithoutCurveConfigInput[]
    createMany?: SimulationRunCreateManyCurveConfigInputEnvelope
    connect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
  }

  export type LaunchUncheckedCreateNestedManyWithoutCurveConfigInput = {
    create?: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput> | LaunchCreateWithoutCurveConfigInput[] | LaunchUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutCurveConfigInput | LaunchCreateOrConnectWithoutCurveConfigInput[]
    createMany?: LaunchCreateManyCurveConfigInputEnvelope
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type AssetUpdateOneRequiredWithoutCurveConfigsNestedInput = {
    create?: XOR<AssetCreateWithoutCurveConfigsInput, AssetUncheckedCreateWithoutCurveConfigsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutCurveConfigsInput
    upsert?: AssetUpsertWithoutCurveConfigsInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutCurveConfigsInput, AssetUpdateWithoutCurveConfigsInput>, AssetUncheckedUpdateWithoutCurveConfigsInput>
  }

  export type MarketProfileUpdateOneRequiredWithoutCurveConfigsNestedInput = {
    create?: XOR<MarketProfileCreateWithoutCurveConfigsInput, MarketProfileUncheckedCreateWithoutCurveConfigsInput>
    connectOrCreate?: MarketProfileCreateOrConnectWithoutCurveConfigsInput
    upsert?: MarketProfileUpsertWithoutCurveConfigsInput
    connect?: MarketProfileWhereUniqueInput
    update?: XOR<XOR<MarketProfileUpdateToOneWithWhereWithoutCurveConfigsInput, MarketProfileUpdateWithoutCurveConfigsInput>, MarketProfileUncheckedUpdateWithoutCurveConfigsInput>
  }

  export type SimulationRunUpdateManyWithoutCurveConfigNestedInput = {
    create?: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput> | SimulationRunCreateWithoutCurveConfigInput[] | SimulationRunUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: SimulationRunCreateOrConnectWithoutCurveConfigInput | SimulationRunCreateOrConnectWithoutCurveConfigInput[]
    upsert?: SimulationRunUpsertWithWhereUniqueWithoutCurveConfigInput | SimulationRunUpsertWithWhereUniqueWithoutCurveConfigInput[]
    createMany?: SimulationRunCreateManyCurveConfigInputEnvelope
    set?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    disconnect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    delete?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    connect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    update?: SimulationRunUpdateWithWhereUniqueWithoutCurveConfigInput | SimulationRunUpdateWithWhereUniqueWithoutCurveConfigInput[]
    updateMany?: SimulationRunUpdateManyWithWhereWithoutCurveConfigInput | SimulationRunUpdateManyWithWhereWithoutCurveConfigInput[]
    deleteMany?: SimulationRunScalarWhereInput | SimulationRunScalarWhereInput[]
  }

  export type LaunchUpdateManyWithoutCurveConfigNestedInput = {
    create?: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput> | LaunchCreateWithoutCurveConfigInput[] | LaunchUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutCurveConfigInput | LaunchCreateOrConnectWithoutCurveConfigInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutCurveConfigInput | LaunchUpsertWithWhereUniqueWithoutCurveConfigInput[]
    createMany?: LaunchCreateManyCurveConfigInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutCurveConfigInput | LaunchUpdateWithWhereUniqueWithoutCurveConfigInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutCurveConfigInput | LaunchUpdateManyWithWhereWithoutCurveConfigInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type SimulationRunUncheckedUpdateManyWithoutCurveConfigNestedInput = {
    create?: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput> | SimulationRunCreateWithoutCurveConfigInput[] | SimulationRunUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: SimulationRunCreateOrConnectWithoutCurveConfigInput | SimulationRunCreateOrConnectWithoutCurveConfigInput[]
    upsert?: SimulationRunUpsertWithWhereUniqueWithoutCurveConfigInput | SimulationRunUpsertWithWhereUniqueWithoutCurveConfigInput[]
    createMany?: SimulationRunCreateManyCurveConfigInputEnvelope
    set?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    disconnect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    delete?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    connect?: SimulationRunWhereUniqueInput | SimulationRunWhereUniqueInput[]
    update?: SimulationRunUpdateWithWhereUniqueWithoutCurveConfigInput | SimulationRunUpdateWithWhereUniqueWithoutCurveConfigInput[]
    updateMany?: SimulationRunUpdateManyWithWhereWithoutCurveConfigInput | SimulationRunUpdateManyWithWhereWithoutCurveConfigInput[]
    deleteMany?: SimulationRunScalarWhereInput | SimulationRunScalarWhereInput[]
  }

  export type LaunchUncheckedUpdateManyWithoutCurveConfigNestedInput = {
    create?: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput> | LaunchCreateWithoutCurveConfigInput[] | LaunchUncheckedCreateWithoutCurveConfigInput[]
    connectOrCreate?: LaunchCreateOrConnectWithoutCurveConfigInput | LaunchCreateOrConnectWithoutCurveConfigInput[]
    upsert?: LaunchUpsertWithWhereUniqueWithoutCurveConfigInput | LaunchUpsertWithWhereUniqueWithoutCurveConfigInput[]
    createMany?: LaunchCreateManyCurveConfigInputEnvelope
    set?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    disconnect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    delete?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    connect?: LaunchWhereUniqueInput | LaunchWhereUniqueInput[]
    update?: LaunchUpdateWithWhereUniqueWithoutCurveConfigInput | LaunchUpdateWithWhereUniqueWithoutCurveConfigInput[]
    updateMany?: LaunchUpdateManyWithWhereWithoutCurveConfigInput | LaunchUpdateManyWithWhereWithoutCurveConfigInput[]
    deleteMany?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
  }

  export type CurveConfigCreateNestedOneWithoutSimulationRunsInput = {
    create?: XOR<CurveConfigCreateWithoutSimulationRunsInput, CurveConfigUncheckedCreateWithoutSimulationRunsInput>
    connectOrCreate?: CurveConfigCreateOrConnectWithoutSimulationRunsInput
    connect?: CurveConfigWhereUniqueInput
  }

  export type CurveConfigUpdateOneRequiredWithoutSimulationRunsNestedInput = {
    create?: XOR<CurveConfigCreateWithoutSimulationRunsInput, CurveConfigUncheckedCreateWithoutSimulationRunsInput>
    connectOrCreate?: CurveConfigCreateOrConnectWithoutSimulationRunsInput
    upsert?: CurveConfigUpsertWithoutSimulationRunsInput
    connect?: CurveConfigWhereUniqueInput
    update?: XOR<XOR<CurveConfigUpdateToOneWithWhereWithoutSimulationRunsInput, CurveConfigUpdateWithoutSimulationRunsInput>, CurveConfigUncheckedUpdateWithoutSimulationRunsInput>
  }

  export type AssetCreateNestedOneWithoutLaunchesInput = {
    create?: XOR<AssetCreateWithoutLaunchesInput, AssetUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutLaunchesInput
    connect?: AssetWhereUniqueInput
  }

  export type MarketProfileCreateNestedOneWithoutLaunchesInput = {
    create?: XOR<MarketProfileCreateWithoutLaunchesInput, MarketProfileUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: MarketProfileCreateOrConnectWithoutLaunchesInput
    connect?: MarketProfileWhereUniqueInput
  }

  export type CurveConfigCreateNestedOneWithoutLaunchesInput = {
    create?: XOR<CurveConfigCreateWithoutLaunchesInput, CurveConfigUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: CurveConfigCreateOrConnectWithoutLaunchesInput
    connect?: CurveConfigWhereUniqueInput
  }

  export type PoolCreateNestedOneWithoutLaunchInput = {
    create?: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
    connectOrCreate?: PoolCreateOrConnectWithoutLaunchInput
    connect?: PoolWhereUniqueInput
  }

  export type TradeCreateNestedManyWithoutMarketInput = {
    create?: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput> | TradeCreateWithoutMarketInput[] | TradeUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMarketInput | TradeCreateOrConnectWithoutMarketInput[]
    createMany?: TradeCreateManyMarketInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type PriceHistoryCreateNestedManyWithoutMarketInput = {
    create?: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput> | PriceHistoryCreateWithoutMarketInput[] | PriceHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: PriceHistoryCreateOrConnectWithoutMarketInput | PriceHistoryCreateOrConnectWithoutMarketInput[]
    createMany?: PriceHistoryCreateManyMarketInputEnvelope
    connect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
  }

  export type LiquidityHistoryCreateNestedManyWithoutMarketInput = {
    create?: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput> | LiquidityHistoryCreateWithoutMarketInput[] | LiquidityHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: LiquidityHistoryCreateOrConnectWithoutMarketInput | LiquidityHistoryCreateOrConnectWithoutMarketInput[]
    createMany?: LiquidityHistoryCreateManyMarketInputEnvelope
    connect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
  }

  export type GraduationEventCreateNestedManyWithoutMarketInput = {
    create?: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput> | GraduationEventCreateWithoutMarketInput[] | GraduationEventUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: GraduationEventCreateOrConnectWithoutMarketInput | GraduationEventCreateOrConnectWithoutMarketInput[]
    createMany?: GraduationEventCreateManyMarketInputEnvelope
    connect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
  }

  export type PoolUncheckedCreateNestedOneWithoutLaunchInput = {
    create?: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
    connectOrCreate?: PoolCreateOrConnectWithoutLaunchInput
    connect?: PoolWhereUniqueInput
  }

  export type TradeUncheckedCreateNestedManyWithoutMarketInput = {
    create?: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput> | TradeCreateWithoutMarketInput[] | TradeUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMarketInput | TradeCreateOrConnectWithoutMarketInput[]
    createMany?: TradeCreateManyMarketInputEnvelope
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
  }

  export type PriceHistoryUncheckedCreateNestedManyWithoutMarketInput = {
    create?: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput> | PriceHistoryCreateWithoutMarketInput[] | PriceHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: PriceHistoryCreateOrConnectWithoutMarketInput | PriceHistoryCreateOrConnectWithoutMarketInput[]
    createMany?: PriceHistoryCreateManyMarketInputEnvelope
    connect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
  }

  export type LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput = {
    create?: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput> | LiquidityHistoryCreateWithoutMarketInput[] | LiquidityHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: LiquidityHistoryCreateOrConnectWithoutMarketInput | LiquidityHistoryCreateOrConnectWithoutMarketInput[]
    createMany?: LiquidityHistoryCreateManyMarketInputEnvelope
    connect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
  }

  export type GraduationEventUncheckedCreateNestedManyWithoutMarketInput = {
    create?: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput> | GraduationEventCreateWithoutMarketInput[] | GraduationEventUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: GraduationEventCreateOrConnectWithoutMarketInput | GraduationEventCreateOrConnectWithoutMarketInput[]
    createMany?: GraduationEventCreateManyMarketInputEnvelope
    connect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
  }

  export type EnumPoolStatusFieldUpdateOperationsInput = {
    set?: $Enums.PoolStatus
  }

  export type EnumLaunchStageFieldUpdateOperationsInput = {
    set?: $Enums.LaunchStage
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AssetUpdateOneRequiredWithoutLaunchesNestedInput = {
    create?: XOR<AssetCreateWithoutLaunchesInput, AssetUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: AssetCreateOrConnectWithoutLaunchesInput
    upsert?: AssetUpsertWithoutLaunchesInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutLaunchesInput, AssetUpdateWithoutLaunchesInput>, AssetUncheckedUpdateWithoutLaunchesInput>
  }

  export type MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput = {
    create?: XOR<MarketProfileCreateWithoutLaunchesInput, MarketProfileUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: MarketProfileCreateOrConnectWithoutLaunchesInput
    upsert?: MarketProfileUpsertWithoutLaunchesInput
    connect?: MarketProfileWhereUniqueInput
    update?: XOR<XOR<MarketProfileUpdateToOneWithWhereWithoutLaunchesInput, MarketProfileUpdateWithoutLaunchesInput>, MarketProfileUncheckedUpdateWithoutLaunchesInput>
  }

  export type CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput = {
    create?: XOR<CurveConfigCreateWithoutLaunchesInput, CurveConfigUncheckedCreateWithoutLaunchesInput>
    connectOrCreate?: CurveConfigCreateOrConnectWithoutLaunchesInput
    upsert?: CurveConfigUpsertWithoutLaunchesInput
    connect?: CurveConfigWhereUniqueInput
    update?: XOR<XOR<CurveConfigUpdateToOneWithWhereWithoutLaunchesInput, CurveConfigUpdateWithoutLaunchesInput>, CurveConfigUncheckedUpdateWithoutLaunchesInput>
  }

  export type PoolUpdateOneWithoutLaunchNestedInput = {
    create?: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
    connectOrCreate?: PoolCreateOrConnectWithoutLaunchInput
    upsert?: PoolUpsertWithoutLaunchInput
    disconnect?: PoolWhereInput | boolean
    delete?: PoolWhereInput | boolean
    connect?: PoolWhereUniqueInput
    update?: XOR<XOR<PoolUpdateToOneWithWhereWithoutLaunchInput, PoolUpdateWithoutLaunchInput>, PoolUncheckedUpdateWithoutLaunchInput>
  }

  export type TradeUpdateManyWithoutMarketNestedInput = {
    create?: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput> | TradeCreateWithoutMarketInput[] | TradeUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMarketInput | TradeCreateOrConnectWithoutMarketInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutMarketInput | TradeUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: TradeCreateManyMarketInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutMarketInput | TradeUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutMarketInput | TradeUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type PriceHistoryUpdateManyWithoutMarketNestedInput = {
    create?: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput> | PriceHistoryCreateWithoutMarketInput[] | PriceHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: PriceHistoryCreateOrConnectWithoutMarketInput | PriceHistoryCreateOrConnectWithoutMarketInput[]
    upsert?: PriceHistoryUpsertWithWhereUniqueWithoutMarketInput | PriceHistoryUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: PriceHistoryCreateManyMarketInputEnvelope
    set?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    disconnect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    delete?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    connect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    update?: PriceHistoryUpdateWithWhereUniqueWithoutMarketInput | PriceHistoryUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: PriceHistoryUpdateManyWithWhereWithoutMarketInput | PriceHistoryUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: PriceHistoryScalarWhereInput | PriceHistoryScalarWhereInput[]
  }

  export type LiquidityHistoryUpdateManyWithoutMarketNestedInput = {
    create?: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput> | LiquidityHistoryCreateWithoutMarketInput[] | LiquidityHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: LiquidityHistoryCreateOrConnectWithoutMarketInput | LiquidityHistoryCreateOrConnectWithoutMarketInput[]
    upsert?: LiquidityHistoryUpsertWithWhereUniqueWithoutMarketInput | LiquidityHistoryUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: LiquidityHistoryCreateManyMarketInputEnvelope
    set?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    disconnect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    delete?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    connect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    update?: LiquidityHistoryUpdateWithWhereUniqueWithoutMarketInput | LiquidityHistoryUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: LiquidityHistoryUpdateManyWithWhereWithoutMarketInput | LiquidityHistoryUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: LiquidityHistoryScalarWhereInput | LiquidityHistoryScalarWhereInput[]
  }

  export type GraduationEventUpdateManyWithoutMarketNestedInput = {
    create?: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput> | GraduationEventCreateWithoutMarketInput[] | GraduationEventUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: GraduationEventCreateOrConnectWithoutMarketInput | GraduationEventCreateOrConnectWithoutMarketInput[]
    upsert?: GraduationEventUpsertWithWhereUniqueWithoutMarketInput | GraduationEventUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: GraduationEventCreateManyMarketInputEnvelope
    set?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    disconnect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    delete?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    connect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    update?: GraduationEventUpdateWithWhereUniqueWithoutMarketInput | GraduationEventUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: GraduationEventUpdateManyWithWhereWithoutMarketInput | GraduationEventUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: GraduationEventScalarWhereInput | GraduationEventScalarWhereInput[]
  }

  export type PoolUncheckedUpdateOneWithoutLaunchNestedInput = {
    create?: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
    connectOrCreate?: PoolCreateOrConnectWithoutLaunchInput
    upsert?: PoolUpsertWithoutLaunchInput
    disconnect?: PoolWhereInput | boolean
    delete?: PoolWhereInput | boolean
    connect?: PoolWhereUniqueInput
    update?: XOR<XOR<PoolUpdateToOneWithWhereWithoutLaunchInput, PoolUpdateWithoutLaunchInput>, PoolUncheckedUpdateWithoutLaunchInput>
  }

  export type TradeUncheckedUpdateManyWithoutMarketNestedInput = {
    create?: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput> | TradeCreateWithoutMarketInput[] | TradeUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: TradeCreateOrConnectWithoutMarketInput | TradeCreateOrConnectWithoutMarketInput[]
    upsert?: TradeUpsertWithWhereUniqueWithoutMarketInput | TradeUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: TradeCreateManyMarketInputEnvelope
    set?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    disconnect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    delete?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    connect?: TradeWhereUniqueInput | TradeWhereUniqueInput[]
    update?: TradeUpdateWithWhereUniqueWithoutMarketInput | TradeUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: TradeUpdateManyWithWhereWithoutMarketInput | TradeUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: TradeScalarWhereInput | TradeScalarWhereInput[]
  }

  export type PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput = {
    create?: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput> | PriceHistoryCreateWithoutMarketInput[] | PriceHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: PriceHistoryCreateOrConnectWithoutMarketInput | PriceHistoryCreateOrConnectWithoutMarketInput[]
    upsert?: PriceHistoryUpsertWithWhereUniqueWithoutMarketInput | PriceHistoryUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: PriceHistoryCreateManyMarketInputEnvelope
    set?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    disconnect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    delete?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    connect?: PriceHistoryWhereUniqueInput | PriceHistoryWhereUniqueInput[]
    update?: PriceHistoryUpdateWithWhereUniqueWithoutMarketInput | PriceHistoryUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: PriceHistoryUpdateManyWithWhereWithoutMarketInput | PriceHistoryUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: PriceHistoryScalarWhereInput | PriceHistoryScalarWhereInput[]
  }

  export type LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput = {
    create?: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput> | LiquidityHistoryCreateWithoutMarketInput[] | LiquidityHistoryUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: LiquidityHistoryCreateOrConnectWithoutMarketInput | LiquidityHistoryCreateOrConnectWithoutMarketInput[]
    upsert?: LiquidityHistoryUpsertWithWhereUniqueWithoutMarketInput | LiquidityHistoryUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: LiquidityHistoryCreateManyMarketInputEnvelope
    set?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    disconnect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    delete?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    connect?: LiquidityHistoryWhereUniqueInput | LiquidityHistoryWhereUniqueInput[]
    update?: LiquidityHistoryUpdateWithWhereUniqueWithoutMarketInput | LiquidityHistoryUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: LiquidityHistoryUpdateManyWithWhereWithoutMarketInput | LiquidityHistoryUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: LiquidityHistoryScalarWhereInput | LiquidityHistoryScalarWhereInput[]
  }

  export type GraduationEventUncheckedUpdateManyWithoutMarketNestedInput = {
    create?: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput> | GraduationEventCreateWithoutMarketInput[] | GraduationEventUncheckedCreateWithoutMarketInput[]
    connectOrCreate?: GraduationEventCreateOrConnectWithoutMarketInput | GraduationEventCreateOrConnectWithoutMarketInput[]
    upsert?: GraduationEventUpsertWithWhereUniqueWithoutMarketInput | GraduationEventUpsertWithWhereUniqueWithoutMarketInput[]
    createMany?: GraduationEventCreateManyMarketInputEnvelope
    set?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    disconnect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    delete?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    connect?: GraduationEventWhereUniqueInput | GraduationEventWhereUniqueInput[]
    update?: GraduationEventUpdateWithWhereUniqueWithoutMarketInput | GraduationEventUpdateWithWhereUniqueWithoutMarketInput[]
    updateMany?: GraduationEventUpdateManyWithWhereWithoutMarketInput | GraduationEventUpdateManyWithWhereWithoutMarketInput[]
    deleteMany?: GraduationEventScalarWhereInput | GraduationEventScalarWhereInput[]
  }

  export type LaunchCreateNestedOneWithoutPoolInput = {
    create?: XOR<LaunchCreateWithoutPoolInput, LaunchUncheckedCreateWithoutPoolInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutPoolInput
    connect?: LaunchWhereUniqueInput
  }

  export type MarketSnapshotCreateNestedManyWithoutPoolInput = {
    create?: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput> | MarketSnapshotCreateWithoutPoolInput[] | MarketSnapshotUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: MarketSnapshotCreateOrConnectWithoutPoolInput | MarketSnapshotCreateOrConnectWithoutPoolInput[]
    createMany?: MarketSnapshotCreateManyPoolInputEnvelope
    connect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
  }

  export type MarketSnapshotUncheckedCreateNestedManyWithoutPoolInput = {
    create?: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput> | MarketSnapshotCreateWithoutPoolInput[] | MarketSnapshotUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: MarketSnapshotCreateOrConnectWithoutPoolInput | MarketSnapshotCreateOrConnectWithoutPoolInput[]
    createMany?: MarketSnapshotCreateManyPoolInputEnvelope
    connect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
  }

  export type LaunchUpdateOneRequiredWithoutPoolNestedInput = {
    create?: XOR<LaunchCreateWithoutPoolInput, LaunchUncheckedCreateWithoutPoolInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutPoolInput
    upsert?: LaunchUpsertWithoutPoolInput
    connect?: LaunchWhereUniqueInput
    update?: XOR<XOR<LaunchUpdateToOneWithWhereWithoutPoolInput, LaunchUpdateWithoutPoolInput>, LaunchUncheckedUpdateWithoutPoolInput>
  }

  export type MarketSnapshotUpdateManyWithoutPoolNestedInput = {
    create?: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput> | MarketSnapshotCreateWithoutPoolInput[] | MarketSnapshotUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: MarketSnapshotCreateOrConnectWithoutPoolInput | MarketSnapshotCreateOrConnectWithoutPoolInput[]
    upsert?: MarketSnapshotUpsertWithWhereUniqueWithoutPoolInput | MarketSnapshotUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: MarketSnapshotCreateManyPoolInputEnvelope
    set?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    disconnect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    delete?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    connect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    update?: MarketSnapshotUpdateWithWhereUniqueWithoutPoolInput | MarketSnapshotUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: MarketSnapshotUpdateManyWithWhereWithoutPoolInput | MarketSnapshotUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: MarketSnapshotScalarWhereInput | MarketSnapshotScalarWhereInput[]
  }

  export type MarketSnapshotUncheckedUpdateManyWithoutPoolNestedInput = {
    create?: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput> | MarketSnapshotCreateWithoutPoolInput[] | MarketSnapshotUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: MarketSnapshotCreateOrConnectWithoutPoolInput | MarketSnapshotCreateOrConnectWithoutPoolInput[]
    upsert?: MarketSnapshotUpsertWithWhereUniqueWithoutPoolInput | MarketSnapshotUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: MarketSnapshotCreateManyPoolInputEnvelope
    set?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    disconnect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    delete?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    connect?: MarketSnapshotWhereUniqueInput | MarketSnapshotWhereUniqueInput[]
    update?: MarketSnapshotUpdateWithWhereUniqueWithoutPoolInput | MarketSnapshotUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: MarketSnapshotUpdateManyWithWhereWithoutPoolInput | MarketSnapshotUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: MarketSnapshotScalarWhereInput | MarketSnapshotScalarWhereInput[]
  }

  export type PoolCreateNestedOneWithoutSnapshotsInput = {
    create?: XOR<PoolCreateWithoutSnapshotsInput, PoolUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: PoolCreateOrConnectWithoutSnapshotsInput
    connect?: PoolWhereUniqueInput
  }

  export type EnumMarketRegimeFieldUpdateOperationsInput = {
    set?: $Enums.MarketRegime
  }

  export type PoolUpdateOneRequiredWithoutSnapshotsNestedInput = {
    create?: XOR<PoolCreateWithoutSnapshotsInput, PoolUncheckedCreateWithoutSnapshotsInput>
    connectOrCreate?: PoolCreateOrConnectWithoutSnapshotsInput
    upsert?: PoolUpsertWithoutSnapshotsInput
    connect?: PoolWhereUniqueInput
    update?: XOR<XOR<PoolUpdateToOneWithWhereWithoutSnapshotsInput, PoolUpdateWithoutSnapshotsInput>, PoolUncheckedUpdateWithoutSnapshotsInput>
  }

  export type LaunchCreateNestedOneWithoutTradesInput = {
    create?: XOR<LaunchCreateWithoutTradesInput, LaunchUncheckedCreateWithoutTradesInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutTradesInput
    connect?: LaunchWhereUniqueInput
  }

  export type EnumTradeSideFieldUpdateOperationsInput = {
    set?: $Enums.TradeSide
  }

  export type LaunchUpdateOneRequiredWithoutTradesNestedInput = {
    create?: XOR<LaunchCreateWithoutTradesInput, LaunchUncheckedCreateWithoutTradesInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutTradesInput
    upsert?: LaunchUpsertWithoutTradesInput
    connect?: LaunchWhereUniqueInput
    update?: XOR<XOR<LaunchUpdateToOneWithWhereWithoutTradesInput, LaunchUpdateWithoutTradesInput>, LaunchUncheckedUpdateWithoutTradesInput>
  }

  export type LaunchCreateNestedOneWithoutPriceHistoryInput = {
    create?: XOR<LaunchCreateWithoutPriceHistoryInput, LaunchUncheckedCreateWithoutPriceHistoryInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutPriceHistoryInput
    connect?: LaunchWhereUniqueInput
  }

  export type LaunchUpdateOneRequiredWithoutPriceHistoryNestedInput = {
    create?: XOR<LaunchCreateWithoutPriceHistoryInput, LaunchUncheckedCreateWithoutPriceHistoryInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutPriceHistoryInput
    upsert?: LaunchUpsertWithoutPriceHistoryInput
    connect?: LaunchWhereUniqueInput
    update?: XOR<XOR<LaunchUpdateToOneWithWhereWithoutPriceHistoryInput, LaunchUpdateWithoutPriceHistoryInput>, LaunchUncheckedUpdateWithoutPriceHistoryInput>
  }

  export type LaunchCreateNestedOneWithoutLiquidityHistoryInput = {
    create?: XOR<LaunchCreateWithoutLiquidityHistoryInput, LaunchUncheckedCreateWithoutLiquidityHistoryInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutLiquidityHistoryInput
    connect?: LaunchWhereUniqueInput
  }

  export type LaunchUpdateOneRequiredWithoutLiquidityHistoryNestedInput = {
    create?: XOR<LaunchCreateWithoutLiquidityHistoryInput, LaunchUncheckedCreateWithoutLiquidityHistoryInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutLiquidityHistoryInput
    upsert?: LaunchUpsertWithoutLiquidityHistoryInput
    connect?: LaunchWhereUniqueInput
    update?: XOR<XOR<LaunchUpdateToOneWithWhereWithoutLiquidityHistoryInput, LaunchUpdateWithoutLiquidityHistoryInput>, LaunchUncheckedUpdateWithoutLiquidityHistoryInput>
  }

  export type LaunchCreateNestedOneWithoutGraduationEventsInput = {
    create?: XOR<LaunchCreateWithoutGraduationEventsInput, LaunchUncheckedCreateWithoutGraduationEventsInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutGraduationEventsInput
    connect?: LaunchWhereUniqueInput
  }

  export type LaunchUpdateOneRequiredWithoutGraduationEventsNestedInput = {
    create?: XOR<LaunchCreateWithoutGraduationEventsInput, LaunchUncheckedCreateWithoutGraduationEventsInput>
    connectOrCreate?: LaunchCreateOrConnectWithoutGraduationEventsInput
    upsert?: LaunchUpsertWithoutGraduationEventsInput
    connect?: LaunchWhereUniqueInput
    update?: XOR<XOR<LaunchUpdateToOneWithWhereWithoutGraduationEventsInput, LaunchUpdateWithoutGraduationEventsInput>, LaunchUncheckedUpdateWithoutGraduationEventsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumAssetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeFilter<$PrismaModel> | $Enums.AssetType
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumAssetSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetSource | EnumAssetSourceFieldRefInput<$PrismaModel>
    in?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetSourceFilter<$PrismaModel> | $Enums.AssetSource
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetType | EnumAssetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetType[] | ListEnumAssetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetTypeWithAggregatesFilter<$PrismaModel> | $Enums.AssetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetTypeFilter<$PrismaModel>
    _max?: NestedEnumAssetTypeFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumAssetSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AssetSource | EnumAssetSourceFieldRefInput<$PrismaModel>
    in?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.AssetSource[] | ListEnumAssetSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumAssetSourceWithAggregatesFilter<$PrismaModel> | $Enums.AssetSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAssetSourceFilter<$PrismaModel>
    _max?: NestedEnumAssetSourceFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRiskProfileFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileFilter<$PrismaModel> | $Enums.RiskProfile
  }

  export type NestedEnumQuoteTokenFilter<$PrismaModel = never> = {
    equals?: $Enums.QuoteToken | EnumQuoteTokenFieldRefInput<$PrismaModel>
    in?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    not?: NestedEnumQuoteTokenFilter<$PrismaModel> | $Enums.QuoteToken
  }

  export type NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel> | $Enums.RiskProfile
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskProfileFilter<$PrismaModel>
    _max?: NestedEnumRiskProfileFilter<$PrismaModel>
  }

  export type NestedEnumQuoteTokenWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuoteToken | EnumQuoteTokenFieldRefInput<$PrismaModel>
    in?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuoteToken[] | ListEnumQuoteTokenFieldRefInput<$PrismaModel>
    not?: NestedEnumQuoteTokenWithAggregatesFilter<$PrismaModel> | $Enums.QuoteToken
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuoteTokenFilter<$PrismaModel>
    _max?: NestedEnumQuoteTokenFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumPoolStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PoolStatus | EnumPoolStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoolStatusFilter<$PrismaModel> | $Enums.PoolStatus
  }

  export type NestedEnumLaunchStageFilter<$PrismaModel = never> = {
    equals?: $Enums.LaunchStage | EnumLaunchStageFieldRefInput<$PrismaModel>
    in?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    not?: NestedEnumLaunchStageFilter<$PrismaModel> | $Enums.LaunchStage
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPoolStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PoolStatus | EnumPoolStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoolStatus[] | ListEnumPoolStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoolStatusWithAggregatesFilter<$PrismaModel> | $Enums.PoolStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPoolStatusFilter<$PrismaModel>
    _max?: NestedEnumPoolStatusFilter<$PrismaModel>
  }

  export type NestedEnumLaunchStageWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LaunchStage | EnumLaunchStageFieldRefInput<$PrismaModel>
    in?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    notIn?: $Enums.LaunchStage[] | ListEnumLaunchStageFieldRefInput<$PrismaModel>
    not?: NestedEnumLaunchStageWithAggregatesFilter<$PrismaModel> | $Enums.LaunchStage
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLaunchStageFilter<$PrismaModel>
    _max?: NestedEnumLaunchStageFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumMarketRegimeFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketRegime | EnumMarketRegimeFieldRefInput<$PrismaModel>
    in?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    not?: NestedEnumMarketRegimeFilter<$PrismaModel> | $Enums.MarketRegime
  }

  export type NestedEnumMarketRegimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MarketRegime | EnumMarketRegimeFieldRefInput<$PrismaModel>
    in?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MarketRegime[] | ListEnumMarketRegimeFieldRefInput<$PrismaModel>
    not?: NestedEnumMarketRegimeWithAggregatesFilter<$PrismaModel> | $Enums.MarketRegime
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMarketRegimeFilter<$PrismaModel>
    _max?: NestedEnumMarketRegimeFilter<$PrismaModel>
  }

  export type NestedEnumTradeSideFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideFilter<$PrismaModel> | $Enums.TradeSide
  }

  export type NestedEnumTradeSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideWithAggregatesFilter<$PrismaModel> | $Enums.TradeSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeSideFilter<$PrismaModel>
    _max?: NestedEnumTradeSideFilter<$PrismaModel>
  }

  export type MarketProfileCreateWithoutAssetInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    curveConfigs?: CurveConfigCreateNestedManyWithoutMarketProfileInput
    launches?: LaunchCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileUncheckedCreateWithoutAssetInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutMarketProfileInput
    launches?: LaunchUncheckedCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileCreateOrConnectWithoutAssetInput = {
    where: MarketProfileWhereUniqueInput
    create: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput>
  }

  export type MarketProfileCreateManyAssetInputEnvelope = {
    data: MarketProfileCreateManyAssetInput | MarketProfileCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type CurveConfigCreateWithoutAssetInput = {
    id?: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    marketProfile: MarketProfileCreateNestedOneWithoutCurveConfigsInput
    simulationRuns?: SimulationRunCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUncheckedCreateWithoutAssetInput = {
    id?: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    simulationRuns?: SimulationRunUncheckedCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchUncheckedCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigCreateOrConnectWithoutAssetInput = {
    where: CurveConfigWhereUniqueInput
    create: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput>
  }

  export type CurveConfigCreateManyAssetInputEnvelope = {
    data: CurveConfigCreateManyAssetInput | CurveConfigCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type LaunchCreateWithoutAssetInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutAssetInput = {
    id?: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutAssetInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput>
  }

  export type LaunchCreateManyAssetInputEnvelope = {
    data: LaunchCreateManyAssetInput | LaunchCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type MarketProfileUpsertWithWhereUniqueWithoutAssetInput = {
    where: MarketProfileWhereUniqueInput
    update: XOR<MarketProfileUpdateWithoutAssetInput, MarketProfileUncheckedUpdateWithoutAssetInput>
    create: XOR<MarketProfileCreateWithoutAssetInput, MarketProfileUncheckedCreateWithoutAssetInput>
  }

  export type MarketProfileUpdateWithWhereUniqueWithoutAssetInput = {
    where: MarketProfileWhereUniqueInput
    data: XOR<MarketProfileUpdateWithoutAssetInput, MarketProfileUncheckedUpdateWithoutAssetInput>
  }

  export type MarketProfileUpdateManyWithWhereWithoutAssetInput = {
    where: MarketProfileScalarWhereInput
    data: XOR<MarketProfileUpdateManyMutationInput, MarketProfileUncheckedUpdateManyWithoutAssetInput>
  }

  export type MarketProfileScalarWhereInput = {
    AND?: MarketProfileScalarWhereInput | MarketProfileScalarWhereInput[]
    OR?: MarketProfileScalarWhereInput[]
    NOT?: MarketProfileScalarWhereInput | MarketProfileScalarWhereInput[]
    id?: StringFilter<"MarketProfile"> | string
    assetId?: StringFilter<"MarketProfile"> | string
    initialLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    expectedVolatility?: StringFilter<"MarketProfile"> | string
    riskProfile?: EnumRiskProfileFilter<"MarketProfile"> | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFilter<"MarketProfile"> | number
    targetGraduationUsd?: FloatFilter<"MarketProfile"> | number
    quoteToken?: EnumQuoteTokenFilter<"MarketProfile"> | $Enums.QuoteToken
    createdAt?: DateTimeFilter<"MarketProfile"> | Date | string
  }

  export type CurveConfigUpsertWithWhereUniqueWithoutAssetInput = {
    where: CurveConfigWhereUniqueInput
    update: XOR<CurveConfigUpdateWithoutAssetInput, CurveConfigUncheckedUpdateWithoutAssetInput>
    create: XOR<CurveConfigCreateWithoutAssetInput, CurveConfigUncheckedCreateWithoutAssetInput>
  }

  export type CurveConfigUpdateWithWhereUniqueWithoutAssetInput = {
    where: CurveConfigWhereUniqueInput
    data: XOR<CurveConfigUpdateWithoutAssetInput, CurveConfigUncheckedUpdateWithoutAssetInput>
  }

  export type CurveConfigUpdateManyWithWhereWithoutAssetInput = {
    where: CurveConfigScalarWhereInput
    data: XOR<CurveConfigUpdateManyMutationInput, CurveConfigUncheckedUpdateManyWithoutAssetInput>
  }

  export type CurveConfigScalarWhereInput = {
    AND?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
    OR?: CurveConfigScalarWhereInput[]
    NOT?: CurveConfigScalarWhereInput | CurveConfigScalarWhereInput[]
    id?: StringFilter<"CurveConfig"> | string
    assetId?: StringFilter<"CurveConfig"> | string
    marketProfileId?: StringFilter<"CurveConfig"> | string
    riskProfile?: EnumRiskProfileFilter<"CurveConfig"> | $Enums.RiskProfile
    label?: StringFilter<"CurveConfig"> | string
    rationale?: StringFilter<"CurveConfig"> | string
    initialMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    migrationMarketCapUsd?: FloatFilter<"CurveConfig"> | number
    tokenSupply?: FloatFilter<"CurveConfig"> | number
    tokenBaseDecimals?: IntFilter<"CurveConfig"> | number
    feeSchedule?: JsonFilter<"CurveConfig">
    migration?: JsonFilter<"CurveConfig">
    liquidityDistribution?: JsonFilter<"CurveConfig">
    score?: JsonFilter<"CurveConfig">
    isRecommended?: BoolFilter<"CurveConfig"> | boolean
    createdAt?: DateTimeFilter<"CurveConfig"> | Date | string
  }

  export type LaunchUpsertWithWhereUniqueWithoutAssetInput = {
    where: LaunchWhereUniqueInput
    update: XOR<LaunchUpdateWithoutAssetInput, LaunchUncheckedUpdateWithoutAssetInput>
    create: XOR<LaunchCreateWithoutAssetInput, LaunchUncheckedCreateWithoutAssetInput>
  }

  export type LaunchUpdateWithWhereUniqueWithoutAssetInput = {
    where: LaunchWhereUniqueInput
    data: XOR<LaunchUpdateWithoutAssetInput, LaunchUncheckedUpdateWithoutAssetInput>
  }

  export type LaunchUpdateManyWithWhereWithoutAssetInput = {
    where: LaunchScalarWhereInput
    data: XOR<LaunchUpdateManyMutationInput, LaunchUncheckedUpdateManyWithoutAssetInput>
  }

  export type LaunchScalarWhereInput = {
    AND?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
    OR?: LaunchScalarWhereInput[]
    NOT?: LaunchScalarWhereInput | LaunchScalarWhereInput[]
    id?: StringFilter<"Launch"> | string
    assetId?: StringFilter<"Launch"> | string
    marketProfileId?: StringFilter<"Launch"> | string
    curveConfigId?: StringFilter<"Launch"> | string
    configAddress?: StringNullableFilter<"Launch"> | string | null
    poolAddress?: StringNullableFilter<"Launch"> | string | null
    baseMint?: StringNullableFilter<"Launch"> | string | null
    quoteMint?: StringNullableFilter<"Launch"> | string | null
    configTxSignature?: StringNullableFilter<"Launch"> | string | null
    poolTxSignature?: StringNullableFilter<"Launch"> | string | null
    status?: EnumPoolStatusFilter<"Launch"> | $Enums.PoolStatus
    stage?: EnumLaunchStageFilter<"Launch"> | $Enums.LaunchStage
    ownerWallet?: StringNullableFilter<"Launch"> | string | null
    lastAuthTimestamp?: DateTimeNullableFilter<"Launch"> | Date | string | null
    configKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    baseMintKeypairSecret?: StringNullableFilter<"Launch"> | string | null
    createdAt?: DateTimeFilter<"Launch"> | Date | string
    updatedAt?: DateTimeFilter<"Launch"> | Date | string
  }

  export type AssetCreateWithoutMarketProfilesInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    curveConfigs?: CurveConfigCreateNestedManyWithoutAssetInput
    launches?: LaunchCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutMarketProfilesInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutAssetInput
    launches?: LaunchUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutMarketProfilesInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutMarketProfilesInput, AssetUncheckedCreateWithoutMarketProfilesInput>
  }

  export type CurveConfigCreateWithoutMarketProfileInput = {
    id?: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutCurveConfigsInput
    simulationRuns?: SimulationRunCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUncheckedCreateWithoutMarketProfileInput = {
    id?: string
    assetId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    simulationRuns?: SimulationRunUncheckedCreateNestedManyWithoutCurveConfigInput
    launches?: LaunchUncheckedCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigCreateOrConnectWithoutMarketProfileInput = {
    where: CurveConfigWhereUniqueInput
    create: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput>
  }

  export type CurveConfigCreateManyMarketProfileInputEnvelope = {
    data: CurveConfigCreateManyMarketProfileInput | CurveConfigCreateManyMarketProfileInput[]
    skipDuplicates?: boolean
  }

  export type LaunchCreateWithoutMarketProfileInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutMarketProfileInput = {
    id?: string
    assetId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutMarketProfileInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput>
  }

  export type LaunchCreateManyMarketProfileInputEnvelope = {
    data: LaunchCreateManyMarketProfileInput | LaunchCreateManyMarketProfileInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithoutMarketProfilesInput = {
    update: XOR<AssetUpdateWithoutMarketProfilesInput, AssetUncheckedUpdateWithoutMarketProfilesInput>
    create: XOR<AssetCreateWithoutMarketProfilesInput, AssetUncheckedCreateWithoutMarketProfilesInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutMarketProfilesInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutMarketProfilesInput, AssetUncheckedUpdateWithoutMarketProfilesInput>
  }

  export type AssetUpdateWithoutMarketProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUpdateManyWithoutAssetNestedInput
    launches?: LaunchUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutMarketProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutAssetNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type CurveConfigUpsertWithWhereUniqueWithoutMarketProfileInput = {
    where: CurveConfigWhereUniqueInput
    update: XOR<CurveConfigUpdateWithoutMarketProfileInput, CurveConfigUncheckedUpdateWithoutMarketProfileInput>
    create: XOR<CurveConfigCreateWithoutMarketProfileInput, CurveConfigUncheckedCreateWithoutMarketProfileInput>
  }

  export type CurveConfigUpdateWithWhereUniqueWithoutMarketProfileInput = {
    where: CurveConfigWhereUniqueInput
    data: XOR<CurveConfigUpdateWithoutMarketProfileInput, CurveConfigUncheckedUpdateWithoutMarketProfileInput>
  }

  export type CurveConfigUpdateManyWithWhereWithoutMarketProfileInput = {
    where: CurveConfigScalarWhereInput
    data: XOR<CurveConfigUpdateManyMutationInput, CurveConfigUncheckedUpdateManyWithoutMarketProfileInput>
  }

  export type LaunchUpsertWithWhereUniqueWithoutMarketProfileInput = {
    where: LaunchWhereUniqueInput
    update: XOR<LaunchUpdateWithoutMarketProfileInput, LaunchUncheckedUpdateWithoutMarketProfileInput>
    create: XOR<LaunchCreateWithoutMarketProfileInput, LaunchUncheckedCreateWithoutMarketProfileInput>
  }

  export type LaunchUpdateWithWhereUniqueWithoutMarketProfileInput = {
    where: LaunchWhereUniqueInput
    data: XOR<LaunchUpdateWithoutMarketProfileInput, LaunchUncheckedUpdateWithoutMarketProfileInput>
  }

  export type LaunchUpdateManyWithWhereWithoutMarketProfileInput = {
    where: LaunchScalarWhereInput
    data: XOR<LaunchUpdateManyMutationInput, LaunchUncheckedUpdateManyWithoutMarketProfileInput>
  }

  export type AssetCreateWithoutCurveConfigsInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileCreateNestedManyWithoutAssetInput
    launches?: LaunchCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutCurveConfigsInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileUncheckedCreateNestedManyWithoutAssetInput
    launches?: LaunchUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutCurveConfigsInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutCurveConfigsInput, AssetUncheckedCreateWithoutCurveConfigsInput>
  }

  export type MarketProfileCreateWithoutCurveConfigsInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutMarketProfilesInput
    launches?: LaunchCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileUncheckedCreateWithoutCurveConfigsInput = {
    id?: string
    assetId: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    launches?: LaunchUncheckedCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileCreateOrConnectWithoutCurveConfigsInput = {
    where: MarketProfileWhereUniqueInput
    create: XOR<MarketProfileCreateWithoutCurveConfigsInput, MarketProfileUncheckedCreateWithoutCurveConfigsInput>
  }

  export type SimulationRunCreateWithoutCurveConfigInput = {
    id?: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SimulationRunUncheckedCreateWithoutCurveConfigInput = {
    id?: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SimulationRunCreateOrConnectWithoutCurveConfigInput = {
    where: SimulationRunWhereUniqueInput
    create: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput>
  }

  export type SimulationRunCreateManyCurveConfigInputEnvelope = {
    data: SimulationRunCreateManyCurveConfigInput | SimulationRunCreateManyCurveConfigInput[]
    skipDuplicates?: boolean
  }

  export type LaunchCreateWithoutCurveConfigInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutCurveConfigInput = {
    id?: string
    assetId: string
    marketProfileId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutCurveConfigInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput>
  }

  export type LaunchCreateManyCurveConfigInputEnvelope = {
    data: LaunchCreateManyCurveConfigInput | LaunchCreateManyCurveConfigInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithoutCurveConfigsInput = {
    update: XOR<AssetUpdateWithoutCurveConfigsInput, AssetUncheckedUpdateWithoutCurveConfigsInput>
    create: XOR<AssetCreateWithoutCurveConfigsInput, AssetUncheckedCreateWithoutCurveConfigsInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutCurveConfigsInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutCurveConfigsInput, AssetUncheckedUpdateWithoutCurveConfigsInput>
  }

  export type AssetUpdateWithoutCurveConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUpdateManyWithoutAssetNestedInput
    launches?: LaunchUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutCurveConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUncheckedUpdateManyWithoutAssetNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type MarketProfileUpsertWithoutCurveConfigsInput = {
    update: XOR<MarketProfileUpdateWithoutCurveConfigsInput, MarketProfileUncheckedUpdateWithoutCurveConfigsInput>
    create: XOR<MarketProfileCreateWithoutCurveConfigsInput, MarketProfileUncheckedCreateWithoutCurveConfigsInput>
    where?: MarketProfileWhereInput
  }

  export type MarketProfileUpdateToOneWithWhereWithoutCurveConfigsInput = {
    where?: MarketProfileWhereInput
    data: XOR<MarketProfileUpdateWithoutCurveConfigsInput, MarketProfileUncheckedUpdateWithoutCurveConfigsInput>
  }

  export type MarketProfileUpdateWithoutCurveConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutMarketProfilesNestedInput
    launches?: LaunchUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileUncheckedUpdateWithoutCurveConfigsInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    launches?: LaunchUncheckedUpdateManyWithoutMarketProfileNestedInput
  }

  export type SimulationRunUpsertWithWhereUniqueWithoutCurveConfigInput = {
    where: SimulationRunWhereUniqueInput
    update: XOR<SimulationRunUpdateWithoutCurveConfigInput, SimulationRunUncheckedUpdateWithoutCurveConfigInput>
    create: XOR<SimulationRunCreateWithoutCurveConfigInput, SimulationRunUncheckedCreateWithoutCurveConfigInput>
  }

  export type SimulationRunUpdateWithWhereUniqueWithoutCurveConfigInput = {
    where: SimulationRunWhereUniqueInput
    data: XOR<SimulationRunUpdateWithoutCurveConfigInput, SimulationRunUncheckedUpdateWithoutCurveConfigInput>
  }

  export type SimulationRunUpdateManyWithWhereWithoutCurveConfigInput = {
    where: SimulationRunScalarWhereInput
    data: XOR<SimulationRunUpdateManyMutationInput, SimulationRunUncheckedUpdateManyWithoutCurveConfigInput>
  }

  export type SimulationRunScalarWhereInput = {
    AND?: SimulationRunScalarWhereInput | SimulationRunScalarWhereInput[]
    OR?: SimulationRunScalarWhereInput[]
    NOT?: SimulationRunScalarWhereInput | SimulationRunScalarWhereInput[]
    id?: StringFilter<"SimulationRun"> | string
    curveConfigId?: StringFilter<"SimulationRun"> | string
    scenarios?: JsonFilter<"SimulationRun">
    createdAt?: DateTimeFilter<"SimulationRun"> | Date | string
  }

  export type LaunchUpsertWithWhereUniqueWithoutCurveConfigInput = {
    where: LaunchWhereUniqueInput
    update: XOR<LaunchUpdateWithoutCurveConfigInput, LaunchUncheckedUpdateWithoutCurveConfigInput>
    create: XOR<LaunchCreateWithoutCurveConfigInput, LaunchUncheckedCreateWithoutCurveConfigInput>
  }

  export type LaunchUpdateWithWhereUniqueWithoutCurveConfigInput = {
    where: LaunchWhereUniqueInput
    data: XOR<LaunchUpdateWithoutCurveConfigInput, LaunchUncheckedUpdateWithoutCurveConfigInput>
  }

  export type LaunchUpdateManyWithWhereWithoutCurveConfigInput = {
    where: LaunchScalarWhereInput
    data: XOR<LaunchUpdateManyMutationInput, LaunchUncheckedUpdateManyWithoutCurveConfigInput>
  }

  export type CurveConfigCreateWithoutSimulationRunsInput = {
    id?: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutCurveConfigsInput
    marketProfile: MarketProfileCreateNestedOneWithoutCurveConfigsInput
    launches?: LaunchCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUncheckedCreateWithoutSimulationRunsInput = {
    id?: string
    assetId: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    launches?: LaunchUncheckedCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigCreateOrConnectWithoutSimulationRunsInput = {
    where: CurveConfigWhereUniqueInput
    create: XOR<CurveConfigCreateWithoutSimulationRunsInput, CurveConfigUncheckedCreateWithoutSimulationRunsInput>
  }

  export type CurveConfigUpsertWithoutSimulationRunsInput = {
    update: XOR<CurveConfigUpdateWithoutSimulationRunsInput, CurveConfigUncheckedUpdateWithoutSimulationRunsInput>
    create: XOR<CurveConfigCreateWithoutSimulationRunsInput, CurveConfigUncheckedCreateWithoutSimulationRunsInput>
    where?: CurveConfigWhereInput
  }

  export type CurveConfigUpdateToOneWithWhereWithoutSimulationRunsInput = {
    where?: CurveConfigWhereInput
    data: XOR<CurveConfigUpdateWithoutSimulationRunsInput, CurveConfigUncheckedUpdateWithoutSimulationRunsInput>
  }

  export type CurveConfigUpdateWithoutSimulationRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutCurveConfigsNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutCurveConfigsNestedInput
    launches?: LaunchUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateWithoutSimulationRunsInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    launches?: LaunchUncheckedUpdateManyWithoutCurveConfigNestedInput
  }

  export type AssetCreateWithoutLaunchesInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileCreateNestedManyWithoutAssetInput
    curveConfigs?: CurveConfigCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutLaunchesInput = {
    id?: string
    name: string
    symbol: string
    mintAddress: string
    issuer: string
    assetType: $Enums.AssetType
    referencePriceUsd: number
    source: $Enums.AssetSource
    externalId?: string | null
    createdAt?: Date | string
    marketProfiles?: MarketProfileUncheckedCreateNestedManyWithoutAssetInput
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutLaunchesInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutLaunchesInput, AssetUncheckedCreateWithoutLaunchesInput>
  }

  export type MarketProfileCreateWithoutLaunchesInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutMarketProfilesInput
    curveConfigs?: CurveConfigCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileUncheckedCreateWithoutLaunchesInput = {
    id?: string
    assetId: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
    curveConfigs?: CurveConfigUncheckedCreateNestedManyWithoutMarketProfileInput
  }

  export type MarketProfileCreateOrConnectWithoutLaunchesInput = {
    where: MarketProfileWhereUniqueInput
    create: XOR<MarketProfileCreateWithoutLaunchesInput, MarketProfileUncheckedCreateWithoutLaunchesInput>
  }

  export type CurveConfigCreateWithoutLaunchesInput = {
    id?: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutCurveConfigsInput
    marketProfile: MarketProfileCreateNestedOneWithoutCurveConfigsInput
    simulationRuns?: SimulationRunCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigUncheckedCreateWithoutLaunchesInput = {
    id?: string
    assetId: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
    simulationRuns?: SimulationRunUncheckedCreateNestedManyWithoutCurveConfigInput
  }

  export type CurveConfigCreateOrConnectWithoutLaunchesInput = {
    where: CurveConfigWhereUniqueInput
    create: XOR<CurveConfigCreateWithoutLaunchesInput, CurveConfigUncheckedCreateWithoutLaunchesInput>
  }

  export type PoolCreateWithoutLaunchInput = {
    id?: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
    snapshots?: MarketSnapshotCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutLaunchInput = {
    id?: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
    snapshots?: MarketSnapshotUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolCreateOrConnectWithoutLaunchInput = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
  }

  export type TradeCreateWithoutMarketInput = {
    id?: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
  }

  export type TradeUncheckedCreateWithoutMarketInput = {
    id?: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
  }

  export type TradeCreateOrConnectWithoutMarketInput = {
    where: TradeWhereUniqueInput
    create: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput>
  }

  export type TradeCreateManyMarketInputEnvelope = {
    data: TradeCreateManyMarketInput | TradeCreateManyMarketInput[]
    skipDuplicates?: boolean
  }

  export type PriceHistoryCreateWithoutMarketInput = {
    id?: string
    priceUsd: number
    source: string
    timestamp: Date | string
  }

  export type PriceHistoryUncheckedCreateWithoutMarketInput = {
    id?: string
    priceUsd: number
    source: string
    timestamp: Date | string
  }

  export type PriceHistoryCreateOrConnectWithoutMarketInput = {
    where: PriceHistoryWhereUniqueInput
    create: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput>
  }

  export type PriceHistoryCreateManyMarketInputEnvelope = {
    data: PriceHistoryCreateManyMarketInput | PriceHistoryCreateManyMarketInput[]
    skipDuplicates?: boolean
  }

  export type LiquidityHistoryCreateWithoutMarketInput = {
    id?: string
    liquidityUsd: number
    timestamp: Date | string
  }

  export type LiquidityHistoryUncheckedCreateWithoutMarketInput = {
    id?: string
    liquidityUsd: number
    timestamp: Date | string
  }

  export type LiquidityHistoryCreateOrConnectWithoutMarketInput = {
    where: LiquidityHistoryWhereUniqueInput
    create: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput>
  }

  export type LiquidityHistoryCreateManyMarketInputEnvelope = {
    data: LiquidityHistoryCreateManyMarketInput | LiquidityHistoryCreateManyMarketInput[]
    skipDuplicates?: boolean
  }

  export type GraduationEventCreateWithoutMarketInput = {
    id?: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type GraduationEventUncheckedCreateWithoutMarketInput = {
    id?: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type GraduationEventCreateOrConnectWithoutMarketInput = {
    where: GraduationEventWhereUniqueInput
    create: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput>
  }

  export type GraduationEventCreateManyMarketInputEnvelope = {
    data: GraduationEventCreateManyMarketInput | GraduationEventCreateManyMarketInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithoutLaunchesInput = {
    update: XOR<AssetUpdateWithoutLaunchesInput, AssetUncheckedUpdateWithoutLaunchesInput>
    create: XOR<AssetCreateWithoutLaunchesInput, AssetUncheckedCreateWithoutLaunchesInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutLaunchesInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutLaunchesInput, AssetUncheckedUpdateWithoutLaunchesInput>
  }

  export type AssetUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUpdateManyWithoutAssetNestedInput
    curveConfigs?: CurveConfigUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    mintAddress?: StringFieldUpdateOperationsInput | string
    issuer?: StringFieldUpdateOperationsInput | string
    assetType?: EnumAssetTypeFieldUpdateOperationsInput | $Enums.AssetType
    referencePriceUsd?: FloatFieldUpdateOperationsInput | number
    source?: EnumAssetSourceFieldUpdateOperationsInput | $Enums.AssetSource
    externalId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfiles?: MarketProfileUncheckedUpdateManyWithoutAssetNestedInput
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type MarketProfileUpsertWithoutLaunchesInput = {
    update: XOR<MarketProfileUpdateWithoutLaunchesInput, MarketProfileUncheckedUpdateWithoutLaunchesInput>
    create: XOR<MarketProfileCreateWithoutLaunchesInput, MarketProfileUncheckedCreateWithoutLaunchesInput>
    where?: MarketProfileWhereInput
  }

  export type MarketProfileUpdateToOneWithWhereWithoutLaunchesInput = {
    where?: MarketProfileWhereInput
    data: XOR<MarketProfileUpdateWithoutLaunchesInput, MarketProfileUncheckedUpdateWithoutLaunchesInput>
  }

  export type MarketProfileUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutMarketProfilesNestedInput
    curveConfigs?: CurveConfigUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileUncheckedUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutMarketProfileNestedInput
  }

  export type CurveConfigUpsertWithoutLaunchesInput = {
    update: XOR<CurveConfigUpdateWithoutLaunchesInput, CurveConfigUncheckedUpdateWithoutLaunchesInput>
    create: XOR<CurveConfigCreateWithoutLaunchesInput, CurveConfigUncheckedCreateWithoutLaunchesInput>
    where?: CurveConfigWhereInput
  }

  export type CurveConfigUpdateToOneWithWhereWithoutLaunchesInput = {
    where?: CurveConfigWhereInput
    data: XOR<CurveConfigUpdateWithoutLaunchesInput, CurveConfigUncheckedUpdateWithoutLaunchesInput>
  }

  export type CurveConfigUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutCurveConfigsNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutCurveConfigsNestedInput
    simulationRuns?: SimulationRunUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateWithoutLaunchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    simulationRuns?: SimulationRunUncheckedUpdateManyWithoutCurveConfigNestedInput
  }

  export type PoolUpsertWithoutLaunchInput = {
    update: XOR<PoolUpdateWithoutLaunchInput, PoolUncheckedUpdateWithoutLaunchInput>
    create: XOR<PoolCreateWithoutLaunchInput, PoolUncheckedCreateWithoutLaunchInput>
    where?: PoolWhereInput
  }

  export type PoolUpdateToOneWithWhereWithoutLaunchInput = {
    where?: PoolWhereInput
    data: XOR<PoolUpdateWithoutLaunchInput, PoolUncheckedUpdateWithoutLaunchInput>
  }

  export type PoolUpdateWithoutLaunchInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: MarketSnapshotUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutLaunchInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    snapshots?: MarketSnapshotUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type TradeUpsertWithWhereUniqueWithoutMarketInput = {
    where: TradeWhereUniqueInput
    update: XOR<TradeUpdateWithoutMarketInput, TradeUncheckedUpdateWithoutMarketInput>
    create: XOR<TradeCreateWithoutMarketInput, TradeUncheckedCreateWithoutMarketInput>
  }

  export type TradeUpdateWithWhereUniqueWithoutMarketInput = {
    where: TradeWhereUniqueInput
    data: XOR<TradeUpdateWithoutMarketInput, TradeUncheckedUpdateWithoutMarketInput>
  }

  export type TradeUpdateManyWithWhereWithoutMarketInput = {
    where: TradeScalarWhereInput
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyWithoutMarketInput>
  }

  export type TradeScalarWhereInput = {
    AND?: TradeScalarWhereInput | TradeScalarWhereInput[]
    OR?: TradeScalarWhereInput[]
    NOT?: TradeScalarWhereInput | TradeScalarWhereInput[]
    id?: StringFilter<"Trade"> | string
    marketId?: StringFilter<"Trade"> | string
    signature?: StringFilter<"Trade"> | string
    trader?: StringFilter<"Trade"> | string
    side?: EnumTradeSideFilter<"Trade"> | $Enums.TradeSide
    tokenAmount?: FloatFilter<"Trade"> | number
    quoteAmount?: FloatFilter<"Trade"> | number
    priceUsd?: FloatFilter<"Trade"> | number
    timestamp?: DateTimeFilter<"Trade"> | Date | string
  }

  export type PriceHistoryUpsertWithWhereUniqueWithoutMarketInput = {
    where: PriceHistoryWhereUniqueInput
    update: XOR<PriceHistoryUpdateWithoutMarketInput, PriceHistoryUncheckedUpdateWithoutMarketInput>
    create: XOR<PriceHistoryCreateWithoutMarketInput, PriceHistoryUncheckedCreateWithoutMarketInput>
  }

  export type PriceHistoryUpdateWithWhereUniqueWithoutMarketInput = {
    where: PriceHistoryWhereUniqueInput
    data: XOR<PriceHistoryUpdateWithoutMarketInput, PriceHistoryUncheckedUpdateWithoutMarketInput>
  }

  export type PriceHistoryUpdateManyWithWhereWithoutMarketInput = {
    where: PriceHistoryScalarWhereInput
    data: XOR<PriceHistoryUpdateManyMutationInput, PriceHistoryUncheckedUpdateManyWithoutMarketInput>
  }

  export type PriceHistoryScalarWhereInput = {
    AND?: PriceHistoryScalarWhereInput | PriceHistoryScalarWhereInput[]
    OR?: PriceHistoryScalarWhereInput[]
    NOT?: PriceHistoryScalarWhereInput | PriceHistoryScalarWhereInput[]
    id?: StringFilter<"PriceHistory"> | string
    marketId?: StringFilter<"PriceHistory"> | string
    priceUsd?: FloatFilter<"PriceHistory"> | number
    source?: StringFilter<"PriceHistory"> | string
    timestamp?: DateTimeFilter<"PriceHistory"> | Date | string
  }

  export type LiquidityHistoryUpsertWithWhereUniqueWithoutMarketInput = {
    where: LiquidityHistoryWhereUniqueInput
    update: XOR<LiquidityHistoryUpdateWithoutMarketInput, LiquidityHistoryUncheckedUpdateWithoutMarketInput>
    create: XOR<LiquidityHistoryCreateWithoutMarketInput, LiquidityHistoryUncheckedCreateWithoutMarketInput>
  }

  export type LiquidityHistoryUpdateWithWhereUniqueWithoutMarketInput = {
    where: LiquidityHistoryWhereUniqueInput
    data: XOR<LiquidityHistoryUpdateWithoutMarketInput, LiquidityHistoryUncheckedUpdateWithoutMarketInput>
  }

  export type LiquidityHistoryUpdateManyWithWhereWithoutMarketInput = {
    where: LiquidityHistoryScalarWhereInput
    data: XOR<LiquidityHistoryUpdateManyMutationInput, LiquidityHistoryUncheckedUpdateManyWithoutMarketInput>
  }

  export type LiquidityHistoryScalarWhereInput = {
    AND?: LiquidityHistoryScalarWhereInput | LiquidityHistoryScalarWhereInput[]
    OR?: LiquidityHistoryScalarWhereInput[]
    NOT?: LiquidityHistoryScalarWhereInput | LiquidityHistoryScalarWhereInput[]
    id?: StringFilter<"LiquidityHistory"> | string
    marketId?: StringFilter<"LiquidityHistory"> | string
    liquidityUsd?: FloatFilter<"LiquidityHistory"> | number
    timestamp?: DateTimeFilter<"LiquidityHistory"> | Date | string
  }

  export type GraduationEventUpsertWithWhereUniqueWithoutMarketInput = {
    where: GraduationEventWhereUniqueInput
    update: XOR<GraduationEventUpdateWithoutMarketInput, GraduationEventUncheckedUpdateWithoutMarketInput>
    create: XOR<GraduationEventCreateWithoutMarketInput, GraduationEventUncheckedCreateWithoutMarketInput>
  }

  export type GraduationEventUpdateWithWhereUniqueWithoutMarketInput = {
    where: GraduationEventWhereUniqueInput
    data: XOR<GraduationEventUpdateWithoutMarketInput, GraduationEventUncheckedUpdateWithoutMarketInput>
  }

  export type GraduationEventUpdateManyWithWhereWithoutMarketInput = {
    where: GraduationEventScalarWhereInput
    data: XOR<GraduationEventUpdateManyMutationInput, GraduationEventUncheckedUpdateManyWithoutMarketInput>
  }

  export type GraduationEventScalarWhereInput = {
    AND?: GraduationEventScalarWhereInput | GraduationEventScalarWhereInput[]
    OR?: GraduationEventScalarWhereInput[]
    NOT?: GraduationEventScalarWhereInput | GraduationEventScalarWhereInput[]
    id?: StringFilter<"GraduationEvent"> | string
    marketId?: StringFilter<"GraduationEvent"> | string
    signature?: StringFilter<"GraduationEvent"> | string
    finalState?: JsonFilter<"GraduationEvent">
    timestamp?: DateTimeFilter<"GraduationEvent"> | Date | string
  }

  export type LaunchCreateWithoutPoolInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutPoolInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutPoolInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutPoolInput, LaunchUncheckedCreateWithoutPoolInput>
  }

  export type MarketSnapshotCreateWithoutPoolInput = {
    id?: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
  }

  export type MarketSnapshotUncheckedCreateWithoutPoolInput = {
    id?: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
  }

  export type MarketSnapshotCreateOrConnectWithoutPoolInput = {
    where: MarketSnapshotWhereUniqueInput
    create: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput>
  }

  export type MarketSnapshotCreateManyPoolInputEnvelope = {
    data: MarketSnapshotCreateManyPoolInput | MarketSnapshotCreateManyPoolInput[]
    skipDuplicates?: boolean
  }

  export type LaunchUpsertWithoutPoolInput = {
    update: XOR<LaunchUpdateWithoutPoolInput, LaunchUncheckedUpdateWithoutPoolInput>
    create: XOR<LaunchCreateWithoutPoolInput, LaunchUncheckedCreateWithoutPoolInput>
    where?: LaunchWhereInput
  }

  export type LaunchUpdateToOneWithWhereWithoutPoolInput = {
    where?: LaunchWhereInput
    data: XOR<LaunchUpdateWithoutPoolInput, LaunchUncheckedUpdateWithoutPoolInput>
  }

  export type LaunchUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type MarketSnapshotUpsertWithWhereUniqueWithoutPoolInput = {
    where: MarketSnapshotWhereUniqueInput
    update: XOR<MarketSnapshotUpdateWithoutPoolInput, MarketSnapshotUncheckedUpdateWithoutPoolInput>
    create: XOR<MarketSnapshotCreateWithoutPoolInput, MarketSnapshotUncheckedCreateWithoutPoolInput>
  }

  export type MarketSnapshotUpdateWithWhereUniqueWithoutPoolInput = {
    where: MarketSnapshotWhereUniqueInput
    data: XOR<MarketSnapshotUpdateWithoutPoolInput, MarketSnapshotUncheckedUpdateWithoutPoolInput>
  }

  export type MarketSnapshotUpdateManyWithWhereWithoutPoolInput = {
    where: MarketSnapshotScalarWhereInput
    data: XOR<MarketSnapshotUpdateManyMutationInput, MarketSnapshotUncheckedUpdateManyWithoutPoolInput>
  }

  export type MarketSnapshotScalarWhereInput = {
    AND?: MarketSnapshotScalarWhereInput | MarketSnapshotScalarWhereInput[]
    OR?: MarketSnapshotScalarWhereInput[]
    NOT?: MarketSnapshotScalarWhereInput | MarketSnapshotScalarWhereInput[]
    id?: StringFilter<"MarketSnapshot"> | string
    poolAddress?: StringFilter<"MarketSnapshot"> | string
    priceUsd?: FloatFilter<"MarketSnapshot"> | number
    volume24hUsd?: FloatFilter<"MarketSnapshot"> | number
    liquidityUsd?: FloatFilter<"MarketSnapshot"> | number
    quoteReserve?: FloatFilter<"MarketSnapshot"> | number
    baseReserve?: FloatFilter<"MarketSnapshot"> | number
    curveProgress?: FloatFilter<"MarketSnapshot"> | number
    migrationThresholdUsd?: FloatFilter<"MarketSnapshot"> | number
    graduationProgress?: FloatFilter<"MarketSnapshot"> | number
    estimatedSlippageBps?: FloatFilter<"MarketSnapshot"> | number
    marketQualityScore?: JsonFilter<"MarketSnapshot">
    regime?: EnumMarketRegimeFilter<"MarketSnapshot"> | $Enums.MarketRegime
    status?: EnumPoolStatusFilter<"MarketSnapshot"> | $Enums.PoolStatus
    timestamp?: DateTimeFilter<"MarketSnapshot"> | Date | string
  }

  export type PoolCreateWithoutSnapshotsInput = {
    id?: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
    launch: LaunchCreateNestedOneWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutSnapshotsInput = {
    id?: string
    launchId: string
    poolAddress: string
    configAddress: string
    baseMint: string
    quoteMint: string
    createdAt?: Date | string
  }

  export type PoolCreateOrConnectWithoutSnapshotsInput = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutSnapshotsInput, PoolUncheckedCreateWithoutSnapshotsInput>
  }

  export type PoolUpsertWithoutSnapshotsInput = {
    update: XOR<PoolUpdateWithoutSnapshotsInput, PoolUncheckedUpdateWithoutSnapshotsInput>
    create: XOR<PoolCreateWithoutSnapshotsInput, PoolUncheckedCreateWithoutSnapshotsInput>
    where?: PoolWhereInput
  }

  export type PoolUpdateToOneWithWhereWithoutSnapshotsInput = {
    where?: PoolWhereInput
    data: XOR<PoolUpdateWithoutSnapshotsInput, PoolUncheckedUpdateWithoutSnapshotsInput>
  }

  export type PoolUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    launch?: LaunchUpdateOneRequiredWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutSnapshotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    launchId?: StringFieldUpdateOperationsInput | string
    poolAddress?: StringFieldUpdateOperationsInput | string
    configAddress?: StringFieldUpdateOperationsInput | string
    baseMint?: StringFieldUpdateOperationsInput | string
    quoteMint?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchCreateWithoutTradesInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutTradesInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutTradesInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutTradesInput, LaunchUncheckedCreateWithoutTradesInput>
  }

  export type LaunchUpsertWithoutTradesInput = {
    update: XOR<LaunchUpdateWithoutTradesInput, LaunchUncheckedUpdateWithoutTradesInput>
    create: XOR<LaunchCreateWithoutTradesInput, LaunchUncheckedCreateWithoutTradesInput>
    where?: LaunchWhereInput
  }

  export type LaunchUpdateToOneWithWhereWithoutTradesInput = {
    where?: LaunchWhereInput
    data: XOR<LaunchUpdateWithoutTradesInput, LaunchUncheckedUpdateWithoutTradesInput>
  }

  export type LaunchUpdateWithoutTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutTradesInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchCreateWithoutPriceHistoryInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutPriceHistoryInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutPriceHistoryInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutPriceHistoryInput, LaunchUncheckedCreateWithoutPriceHistoryInput>
  }

  export type LaunchUpsertWithoutPriceHistoryInput = {
    update: XOR<LaunchUpdateWithoutPriceHistoryInput, LaunchUncheckedUpdateWithoutPriceHistoryInput>
    create: XOR<LaunchCreateWithoutPriceHistoryInput, LaunchUncheckedCreateWithoutPriceHistoryInput>
    where?: LaunchWhereInput
  }

  export type LaunchUpdateToOneWithWhereWithoutPriceHistoryInput = {
    where?: LaunchWhereInput
    data: XOR<LaunchUpdateWithoutPriceHistoryInput, LaunchUncheckedUpdateWithoutPriceHistoryInput>
  }

  export type LaunchUpdateWithoutPriceHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutPriceHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchCreateWithoutLiquidityHistoryInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutLiquidityHistoryInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    graduationEvents?: GraduationEventUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutLiquidityHistoryInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutLiquidityHistoryInput, LaunchUncheckedCreateWithoutLiquidityHistoryInput>
  }

  export type LaunchUpsertWithoutLiquidityHistoryInput = {
    update: XOR<LaunchUpdateWithoutLiquidityHistoryInput, LaunchUncheckedUpdateWithoutLiquidityHistoryInput>
    create: XOR<LaunchCreateWithoutLiquidityHistoryInput, LaunchUncheckedCreateWithoutLiquidityHistoryInput>
    where?: LaunchWhereInput
  }

  export type LaunchUpdateToOneWithWhereWithoutLiquidityHistoryInput = {
    where?: LaunchWhereInput
    data: XOR<LaunchUpdateWithoutLiquidityHistoryInput, LaunchUncheckedUpdateWithoutLiquidityHistoryInput>
  }

  export type LaunchUpdateWithoutLiquidityHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutLiquidityHistoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchCreateWithoutGraduationEventsInput = {
    id?: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    asset: AssetCreateNestedOneWithoutLaunchesInput
    marketProfile: MarketProfileCreateNestedOneWithoutLaunchesInput
    curveConfig: CurveConfigCreateNestedOneWithoutLaunchesInput
    pool?: PoolCreateNestedOneWithoutLaunchInput
    trades?: TradeCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryCreateNestedManyWithoutMarketInput
  }

  export type LaunchUncheckedCreateWithoutGraduationEventsInput = {
    id?: string
    assetId: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pool?: PoolUncheckedCreateNestedOneWithoutLaunchInput
    trades?: TradeUncheckedCreateNestedManyWithoutMarketInput
    priceHistory?: PriceHistoryUncheckedCreateNestedManyWithoutMarketInput
    liquidityHistory?: LiquidityHistoryUncheckedCreateNestedManyWithoutMarketInput
  }

  export type LaunchCreateOrConnectWithoutGraduationEventsInput = {
    where: LaunchWhereUniqueInput
    create: XOR<LaunchCreateWithoutGraduationEventsInput, LaunchUncheckedCreateWithoutGraduationEventsInput>
  }

  export type LaunchUpsertWithoutGraduationEventsInput = {
    update: XOR<LaunchUpdateWithoutGraduationEventsInput, LaunchUncheckedUpdateWithoutGraduationEventsInput>
    create: XOR<LaunchCreateWithoutGraduationEventsInput, LaunchUncheckedCreateWithoutGraduationEventsInput>
    where?: LaunchWhereInput
  }

  export type LaunchUpdateToOneWithWhereWithoutGraduationEventsInput = {
    where?: LaunchWhereInput
    data: XOR<LaunchUpdateWithoutGraduationEventsInput, LaunchUncheckedUpdateWithoutGraduationEventsInput>
  }

  export type LaunchUpdateWithoutGraduationEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutGraduationEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type MarketProfileCreateManyAssetInput = {
    id?: string
    initialLiquidityUsd: number
    expectedVolatility: string
    riskProfile: $Enums.RiskProfile
    targetLiquidityUsd: number
    targetGraduationUsd: number
    quoteToken: $Enums.QuoteToken
    createdAt?: Date | string
  }

  export type CurveConfigCreateManyAssetInput = {
    id?: string
    marketProfileId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
  }

  export type LaunchCreateManyAssetInput = {
    id?: string
    marketProfileId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MarketProfileUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUpdateManyWithoutMarketProfileNestedInput
    launches?: LaunchUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    curveConfigs?: CurveConfigUncheckedUpdateManyWithoutMarketProfileNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutMarketProfileNestedInput
  }

  export type MarketProfileUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    initialLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    expectedVolatility?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    targetLiquidityUsd?: FloatFieldUpdateOperationsInput | number
    targetGraduationUsd?: FloatFieldUpdateOperationsInput | number
    quoteToken?: EnumQuoteTokenFieldUpdateOperationsInput | $Enums.QuoteToken
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CurveConfigUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfile?: MarketProfileUpdateOneRequiredWithoutCurveConfigsNestedInput
    simulationRuns?: SimulationRunUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    simulationRuns?: SimulationRunUncheckedUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CurveConfigCreateManyMarketProfileInput = {
    id?: string
    assetId: string
    riskProfile: $Enums.RiskProfile
    label: string
    rationale: string
    initialMarketCapUsd: number
    migrationMarketCapUsd: number
    tokenSupply: number
    tokenBaseDecimals: number
    feeSchedule: JsonNullValueInput | InputJsonValue
    migration: JsonNullValueInput | InputJsonValue
    liquidityDistribution: JsonNullValueInput | InputJsonValue
    score: JsonNullValueInput | InputJsonValue
    isRecommended?: boolean
    createdAt?: Date | string
  }

  export type LaunchCreateManyMarketProfileInput = {
    id?: string
    assetId: string
    curveConfigId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CurveConfigUpdateWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutCurveConfigsNestedInput
    simulationRuns?: SimulationRunUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    simulationRuns?: SimulationRunUncheckedUpdateManyWithoutCurveConfigNestedInput
    launches?: LaunchUncheckedUpdateManyWithoutCurveConfigNestedInput
  }

  export type CurveConfigUncheckedUpdateManyWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    label?: StringFieldUpdateOperationsInput | string
    rationale?: StringFieldUpdateOperationsInput | string
    initialMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    migrationMarketCapUsd?: FloatFieldUpdateOperationsInput | number
    tokenSupply?: FloatFieldUpdateOperationsInput | number
    tokenBaseDecimals?: IntFieldUpdateOperationsInput | number
    feeSchedule?: JsonNullValueInput | InputJsonValue
    migration?: JsonNullValueInput | InputJsonValue
    liquidityDistribution?: JsonNullValueInput | InputJsonValue
    score?: JsonNullValueInput | InputJsonValue
    isRecommended?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchUpdateWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    curveConfig?: CurveConfigUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateManyWithoutMarketProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    curveConfigId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunCreateManyCurveConfigInput = {
    id?: string
    scenarios: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type LaunchCreateManyCurveConfigInput = {
    id?: string
    assetId: string
    marketProfileId: string
    configAddress?: string | null
    poolAddress?: string | null
    baseMint?: string | null
    quoteMint?: string | null
    configTxSignature?: string | null
    poolTxSignature?: string | null
    status?: $Enums.PoolStatus
    stage?: $Enums.LaunchStage
    ownerWallet?: string | null
    lastAuthTimestamp?: Date | string | null
    configKeypairSecret?: string | null
    baseMintKeypairSecret?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SimulationRunUpdateWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunUncheckedUpdateWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SimulationRunUncheckedUpdateManyWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    scenarios?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LaunchUpdateWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutLaunchesNestedInput
    marketProfile?: MarketProfileUpdateOneRequiredWithoutLaunchesNestedInput
    pool?: PoolUpdateOneWithoutLaunchNestedInput
    trades?: TradeUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUncheckedUpdateOneWithoutLaunchNestedInput
    trades?: TradeUncheckedUpdateManyWithoutMarketNestedInput
    priceHistory?: PriceHistoryUncheckedUpdateManyWithoutMarketNestedInput
    liquidityHistory?: LiquidityHistoryUncheckedUpdateManyWithoutMarketNestedInput
    graduationEvents?: GraduationEventUncheckedUpdateManyWithoutMarketNestedInput
  }

  export type LaunchUncheckedUpdateManyWithoutCurveConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    marketProfileId?: StringFieldUpdateOperationsInput | string
    configAddress?: NullableStringFieldUpdateOperationsInput | string | null
    poolAddress?: NullableStringFieldUpdateOperationsInput | string | null
    baseMint?: NullableStringFieldUpdateOperationsInput | string | null
    quoteMint?: NullableStringFieldUpdateOperationsInput | string | null
    configTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    poolTxSignature?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    stage?: EnumLaunchStageFieldUpdateOperationsInput | $Enums.LaunchStage
    ownerWallet?: NullableStringFieldUpdateOperationsInput | string | null
    lastAuthTimestamp?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    configKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    baseMintKeypairSecret?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeCreateManyMarketInput = {
    id?: string
    signature: string
    trader: string
    side: $Enums.TradeSide
    tokenAmount: number
    quoteAmount: number
    priceUsd: number
    timestamp: Date | string
  }

  export type PriceHistoryCreateManyMarketInput = {
    id?: string
    priceUsd: number
    source: string
    timestamp: Date | string
  }

  export type LiquidityHistoryCreateManyMarketInput = {
    id?: string
    liquidityUsd: number
    timestamp: Date | string
  }

  export type GraduationEventCreateManyMarketInput = {
    id?: string
    signature: string
    finalState: JsonNullValueInput | InputJsonValue
    timestamp: Date | string
  }

  export type TradeUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    trader?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    tokenAmount?: FloatFieldUpdateOperationsInput | number
    quoteAmount?: FloatFieldUpdateOperationsInput | number
    priceUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryUncheckedUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PriceHistoryUncheckedUpdateManyWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryUncheckedUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiquidityHistoryUncheckedUpdateManyWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventUncheckedUpdateWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GraduationEventUncheckedUpdateManyWithoutMarketInput = {
    id?: StringFieldUpdateOperationsInput | string
    signature?: StringFieldUpdateOperationsInput | string
    finalState?: JsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotCreateManyPoolInput = {
    id?: string
    priceUsd: number
    volume24hUsd: number
    liquidityUsd: number
    quoteReserve: number
    baseReserve: number
    curveProgress: number
    migrationThresholdUsd: number
    graduationProgress: number
    estimatedSlippageBps: number
    marketQualityScore: JsonNullValueInput | InputJsonValue
    regime: $Enums.MarketRegime
    status: $Enums.PoolStatus
    timestamp?: Date | string
  }

  export type MarketSnapshotUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotUncheckedUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketSnapshotUncheckedUpdateManyWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    priceUsd?: FloatFieldUpdateOperationsInput | number
    volume24hUsd?: FloatFieldUpdateOperationsInput | number
    liquidityUsd?: FloatFieldUpdateOperationsInput | number
    quoteReserve?: FloatFieldUpdateOperationsInput | number
    baseReserve?: FloatFieldUpdateOperationsInput | number
    curveProgress?: FloatFieldUpdateOperationsInput | number
    migrationThresholdUsd?: FloatFieldUpdateOperationsInput | number
    graduationProgress?: FloatFieldUpdateOperationsInput | number
    estimatedSlippageBps?: FloatFieldUpdateOperationsInput | number
    marketQualityScore?: JsonNullValueInput | InputJsonValue
    regime?: EnumMarketRegimeFieldUpdateOperationsInput | $Enums.MarketRegime
    status?: EnumPoolStatusFieldUpdateOperationsInput | $Enums.PoolStatus
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}