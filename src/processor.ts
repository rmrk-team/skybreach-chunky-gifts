import {
  BatchContext,
  BatchProcessorItem,
  EvmLogEvent,
  SubstrateBatchProcessor,
} from '@subsquid/substrate-processor';
import { lookupArchive } from '@subsquid/archive-registry';
import * as landSalesAbi from './abi/landSales';
import * as landSalesOldAbi from './abi/landSaleOld';
import * as rolls from './utils/rolls-queue';
import { PlotBought, Plot } from './model';
import { calcucateSeed, mulberry32 } from './utils/seed-calculator';
import { config } from './contract';
import { Store, TypeormDatabase } from '@subsquid/typeorm-store';
import { EntitiesManager } from './utils/EntittyManager';
import { AddressZero } from '@ethersproject/constants';

export interface EvmEvent {
  data: string;
  topics: string[];
}

export const LAND_SALE_EVENTS = {
  primarySale: landSalesAbi.events['PlotsBought(uint256[],address,address,bool)'],
};

export const LAND_SALE_EVENTS_OLD = {
  primarySale: landSalesOldAbi.events['PlotsBought(uint256[],address,address,bool)'],
};

const database = new TypeormDatabase();
const processor = new SubstrateBatchProcessor()
  .setBlockRange({ from: config.BLOCK_RANGE_FROM })
  .setDataSource({
    chain: config.CHAIN_NODE,
    archive: lookupArchive(config.NETWORK, { release: 'FireSquid' }),
  })
  .setTypesBundle('moonbeam')
  .addEvmLog(config.CONTRACT_OLD_ADDRESS, {
    filter: [Object.values(LAND_SALE_EVENTS_OLD).map((event) => event.topic)],
  })
  .addEvmLog(config.CONTRACT_ADDRESS, {
    filter: [Object.values(LAND_SALE_EVENTS).map((event) => event.topic)],
  });

type Item = BatchProcessorItem<typeof processor>;
export type Context = BatchContext<Store, Item>;

export type ListenedEvents = keyof typeof LAND_SALE_EVENTS | keyof typeof LAND_SALE_EVENTS_OLD;

export type Decoder<T extends ListenedEvents> =
  | typeof LAND_SALE_EVENTS[T]['decode']
  | typeof LAND_SALE_EVENTS_OLD[T]['decode'];

export type DecoderReturnValue<T extends ListenedEvents> = ReturnType<Decoder<T>>;

// There is a problem, that typings do not match what is currently returned, so we have to check log property
export function getArgs(
  ev: EvmLogEvent | (Omit<EvmLogEvent, 'args'> & { args: { log: EvmLogEvent['args'] } }),
): EvmEvent {
  if ('log' in ev.args) {
    return ev.args.log;
  }

  return ev.args;
}

export function getTopic(ev: EvmLogEvent): string {
  return getArgs(ev).topics[0];
}

export type EvmLogEventWithTimestamp = EvmLogEvent & {
  timestamp: number;
  hash: string;
  blockNumber: number;
};

export type TemporaryCache = {
  plots: EntitiesManager<Plot>;
  landSales: EntitiesManager<PlotBought>;
};

type PrefetcherContext = {
  ctx: Context;
  originalEvent: EvmLogEventWithTimestamp;
  emContext: TemporaryCache;
};

export type Prefetcher<E extends ListenedEvents, R = void> = (
  ctx: PrefetcherContext,
  event: DecoderReturnValue<E>,
) => R;

export const prefetchPrimarySaleEvents: Prefetcher<'primarySale'> = (
  { emContext },
  primarySalesEvent,
) => {
  emContext.landSales.addPrefetchItemId(primarySalesEvent.plotIds.map((plot) => plot.toString()));
};

type HandlerContext<T> = {
  ctx: Context;
  originalEvent: EvmLogEventWithTimestamp;
  emContext: TemporaryCache;
};

export type Handler<E extends ListenedEvents, A = Record<string, unknown>, R = void> = (
  ctx: HandlerContext<A>,
  event: DecoderReturnValue<E>,
) => Promise<R>;

type Processor<T extends ListenedEvents> = {
  decode: Decoder<T>;
  process: Handler<T>;
  preparePrefetch: Prefetcher<T>;
};

export const handlePrimarySaleEvents: Handler<'primarySale'> = async (
  handlerContext,
  primarySalesEvent,
) => {
  const { emContext, originalEvent } = handlerContext;

  const { boughtWithCredits, buyer, referrer, plotIds } = primarySalesEvent;
  for (const plotId of plotIds) {
    const rollBlock = originalEvent.blockNumber + rolls.ROLL_BLOCK_DELAY;
    rolls.rollBlocks.add(rollBlock);
    const plot = await emContext.plots.getOrCreate(
      plotId.toString(),
      () =>
        new Plot({
          id: plotId.toString(),
          owner: buyer,
          firstblockNumber: originalEvent.blockNumber,
          firstblockHash: originalEvent.hash,
          rollBlockNumber: rollBlock,
        }),
    );

    plot.owner = buyer;

    const plotIdStr = plotId.toString();
    emContext.landSales.add(
      new PlotBought({
        id: `${plotIdStr}-${originalEvent.evmTxHash}`,
        plot,
        buyer,
        referrer: referrer || AddressZero,
        boughtWithCredits,
        txnHash: originalEvent.evmTxHash,
        createdAt: new Date(),
        blockNumber: originalEvent.blockNumber,
      }),
    );
  }
};

export const getEventProcessor = (
  ctx: Context,
  topic: string,
): Processor<ListenedEvents> | null => {
  switch (true) {
    case [LAND_SALE_EVENTS.primarySale.topic, LAND_SALE_EVENTS_OLD.primarySale.topic].includes(
      topic,
    ):
      return {
        decode:
          LAND_SALE_EVENTS.primarySale.topic === topic
            ? LAND_SALE_EVENTS.primarySale.decode
            : LAND_SALE_EVENTS_OLD.primarySale.decode,
        preparePrefetch: prefetchPrimarySaleEvents,
        // Processor type is not that wide to include also optional additional ctx.
        // Don't think it's worth it to over-engineer this part
        process: handlePrimarySaleEvents as Handler<'primarySale'>,
      };
    default:
      ctx.log.error({ topic }, 'Unexpected event met');
      return null;
  }
};

async function processBatches(ctx: Context) {
  const landSaleEvents: EvmLogEventWithTimestamp[] = [];

  const emCtx: TemporaryCache = {
    plots: new EntitiesManager(Plot, ctx),
    landSales: new EntitiesManager(PlotBought, ctx),
  };

  // Let's batch events we are interested in
  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.name === 'EVM.Log') {
        const topic = getTopic(item.event);

        if (
          [...Object.values(LAND_SALE_EVENTS), ...Object.values(LAND_SALE_EVENTS_OLD)]
            .map((e) => e.topic)
            .includes(topic)
        ) {
          landSaleEvents.push({
            ...item.event,
            timestamp: block.header.timestamp,
            hash: block.header.hash,
            blockNumber: block.header.height,
          });
        }
      }
    }
  }

  await preparePrefetchItems(emCtx, ctx, landSaleEvents);
  await saveEntities(emCtx, ctx, landSaleEvents);
}

const saveEntities = async (
  em: TemporaryCache,
  ctx: Context,
  landSaleEvents: EvmLogEventWithTimestamp[],
) => {
  for (const landSaleEvent of landSaleEvents) {
    const topic = getTopic(landSaleEvent);

    const eventHandler = getEventProcessor(ctx, topic);
    if (eventHandler) {
      const { decode, process } = eventHandler;
      const decodedEvent = decode(getArgs(landSaleEvent));
      await process({ ctx, emContext: em, originalEvent: landSaleEvent }, decodedEvent);
    }
  }

  await em.plots.saveAll();
  await em.landSales.saveAll();
};

async function preparePrefetchItems(
  em: TemporaryCache,
  ctx: Context,
  landSaleEvents: EvmLogEventWithTimestamp[],
) {
  for (const landSaleEvent of landSaleEvents) {
    const topic = getTopic(landSaleEvent);
    const eventHandler = getEventProcessor(ctx, topic);

    if (rolls.isQueueEmpty()) {
      await rolls.fillRollBlocks(ctx.store);
    }
    if (rolls.rollBlocks.has(landSaleEvent.blockNumber)) {
      const plots = await ctx.store.find(Plot, {
        where: {
          rollBlockNumber: landSaleEvent.blockNumber,
        },
      });
      plots.forEach((plot) => {
        plot.rollBlockHash = landSaleEvent.hash;
        const seed = calcucateSeed(plot.firstblockHash, plot.rollBlockHash, Number(plot.id));
        plot.seed = '0x' + seed.toString(16);
        plot.roll = mulberry32(seed)();
      });
      await ctx.store.save(plots);
      rolls.rollBlocks.delete(landSaleEvent.blockNumber);
    }

    if (eventHandler) {
      const { decode, preparePrefetch } = eventHandler;
      const decodedEvent = decode(getArgs(landSaleEvent));
      preparePrefetch({ ctx, emContext: em, originalEvent: landSaleEvent }, decodedEvent);
    }
  }

  await em.plots.prefetchEntities();
  await em.landSales.prefetchEntities();
}

processor.run(database, processBatches);
