import { SubstrateEvmProcessor } from "@subsquid/substrate-evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { CHAIN_NODE, contract } from "./utils/land-market-contract";
import * as landMarket from "./types/landMarket";
import * as rolls from "./utils/rolls-queue";
import { PlotBought } from "./model";
import { calcucateSeed, mulberry32 } from "./utils/seed-calculator";

const processor = new SubstrateEvmProcessor("moonriver-substrate")

processor.setBatchSize(500)
processor.setBlockRange({ from: 2039880 })

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
    const evmEvent =
      landMarket.events["PlotsBought(uint256[],address,address,bool)"].decode(
        ctx
      );
    const rollBlock = substrate.block.height + rolls.ROLL_BLOCK_DELAY
    rolls.rollBlocks.add(rollBlock)
    const plotBoughts = evmEvent.plotIds.map((plotId) => 
      new PlotBought({
        id: `${substrate.event.id}-${plotId}`,
        plotId: plotId.toNumber(),
        buyer: evmEvent.buyer,
        referrer: evmEvent.referrer,
        boughtWithCredits: evmEvent.boughtWithCredits,
        txnHash: txHash,
        createdAt: new Date(substrate.block.timestamp),
        blockNumber: substrate.block.height,
        blockHash: substrate.block.hash,
        rollBlockNumber: rollBlock,
      })
    )
    await store.save(plotBoughts)
  }
);

processor.addPreHook(async (ctx) => {
  const { block, store } = ctx;
  if (rolls.isQueueEmpty()) {
    rolls.fillRollBlocks();
  }  
  if (rolls.rollBlocks.has(block.height)) {
    const events = await store.find(PlotBought,{
      where: {
        rollBlockNumber: block.height
      }
    })
    events.forEach(async (boughtEvent) => {
          boughtEvent.rollBlockHash = block.hash;
          const seed = calcucateSeed(
              boughtEvent.blockHash,
              boughtEvent.rollBlockHash,
              boughtEvent.plotId
            );
          boughtEvent.seed = '0x'+seed.toString(16)
          boughtEvent.roll = mulberry32(seed)()
          return boughtEvent;
        }
    );
    store.save(events);
    rolls.rollBlocks.delete(block.height)
  }
});

processor.run()
