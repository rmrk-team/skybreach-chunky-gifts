import { SubstrateEvmProcessor } from "@subsquid/substrate-evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { CHAIN_NODE, contract } from "./utils/land-market-contract";
import * as landMarket from "./types/landMarket";
import * as rolls from "./utils/rolls-map";
import { PlotsBought } from "./model";
import { calcucateSeed } from "./utils/seed-calculator";

const processor = new SubstrateEvmProcessor("moonriver-substrate");

processor.setBatchSize(500);
processor.setBlockRange({ from: 2039880 });

processor.setDataSource({
  chain: CHAIN_NODE,
  archive: lookupArchive("moonriver")[0].url,
});

processor.setTypesBundle("moonbeam");

processor.addEvmLogHandler(
  contract.address,
  {
    filter: [
      landMarket.events["PlotsBought(uint256[],address,address,bool)"].topic,
    ],
  },
  async (ctx) => {
    const { substrate, store, txHash } = ctx;
    const event =
      landMarket.events["PlotsBought(uint256[],address,address,bool)"].decode(
        ctx
      );
    const plotIds = event.plotIds.map((id) => id.toNumber());
    const rollBlock = substrate.block.height + rolls.ROLL_BLOCK_DELAY;
    const boughtEvent = new PlotsBought({
      id: substrate.event.id,
      plotIds: plotIds,
      buyer: event.buyer,
      referrer: event.referrer,
      boughtWithCredits: event.boughtWithCredits,
      txnHash: txHash,
      createdAt: new Date(substrate.block.timestamp),
      blockNumber: substrate.block.height,
      blockHash: substrate.block.hash,
      rollBlockNumber: rollBlock,
    });
    rolls.setRollId(rollBlock, boughtEvent.id);
    await store.save(boughtEvent);
  }
);

processor.addPreHook(async (ctx) => {
  const { block, store } = ctx;
  if (rolls.isQueueEmpty()) {
    rolls.fillRollBlocks();
  }
  const rollIds = rolls.getRollIds(block.height);
  if (rollIds) {
    let currentSeed: string | undefined;
    const events = await Promise.all(
      rollIds.map(async (rollId) => {
        const boughtEvent = await store.get(PlotsBought, rollId);
        if (boughtEvent) {
          boughtEvent.rollBlockHash = block.hash
          if (!currentSeed)
            currentSeed = calcucateSeed(boughtEvent.blockHash,boughtEvent.rollBlockHash)
          boughtEvent.seed = currentSeed
          return boughtEvent;
        } else 
          throw new Error(`Not found event - ${rollId}`);
      })
    );
    store.save(events);
  }
});

processor.run();
