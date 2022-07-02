import { SubstrateEvmProcessor } from "@subsquid/substrate-evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { CHAIN_NODE, contract } from "./utils/land-market-contract";
import * as landMarket from "./types/landMarket";
import * as rolls from "./utils/rolls-queue";
import { PlotBought, Plot } from "./model";
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
      landMarket.events["PlotsBought(uint256[],address,address,bool)"].decode(ctx);
    const rollBlock = substrate.block.height + rolls.ROLL_BLOCK_DELAY
    rolls.rollBlocks.add(rollBlock)
    let plotBoughts: Array<PlotBought> = []
    let plotEnities: Array<Plot> = []
    for (const plotId of evmEvent.plotIds) {
      const plotIdStr = String(plotId)
      let plot = await store.get(Plot,plotIdStr)
      if (!plot) {
        plot = new Plot({
          id: plotIdStr,
          owner: evmEvent.buyer,
          firstblockNumber:substrate.block.height,
          firstblockHash: substrate.block.hash,
          rollBlockNumber: rollBlock
        })
      }
      else {
        plot.owner = evmEvent.buyer
      }
      const sale = new PlotBought({
        id: `${substrate.event.id}-${plotId}`,
        plot: plot,
        buyer: evmEvent.buyer,
        referrer: evmEvent.referrer,
        boughtWithCredits: evmEvent.boughtWithCredits,
        txnHash: txHash,
        createdAt: new Date(substrate.block.timestamp),
        blockNumber: substrate.block.height,
      })
      plotEnities.push(plot)
      plotBoughts.push(sale)
    }
    await store.save(plotEnities)
    await store.save(plotBoughts)
  }
);

processor.addPreHook(async (ctx) => {
  const { block, store } = ctx;
  if (rolls.isQueueEmpty()) {
    rolls.fillRollBlocks();
  }  
  if (rolls.rollBlocks.has(block.height)) {
    const plots = await store.find(Plot,{
      where: {
        rollBlockNumber: block.height
      }
    })
    plots.forEach(async (plot) => {
          plot.rollBlockHash = block.hash;
          const seed = calcucateSeed(
              plot.firstblockHash,
              plot.rollBlockHash,
              Number(plot.id)
            );
          plot.seed = '0x'+seed.toString(16)
          plot.roll = mulberry32(seed)()
        }
    );
    await store.save(plots);
    rolls.rollBlocks.delete(block.height)
  }
});

processor.run()
