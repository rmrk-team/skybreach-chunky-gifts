import { IsNull } from 'typeorm';
import { Plot } from '../model';
import { Store } from '@subsquid/typeorm-store';

export const ROLL_BLOCK_DELAY = 7200;

export const rollBlocks = new Set<number>();
let filling = false;

export async function fillRollBlocks(store: Store, plotsEm: IterableIterator<Plot>) {
  filling = true;
  const nonFinalized = await store.find(Plot, {
    where: {
      rollBlockHash: IsNull(),
    },
  });
  const nonFinalizedPlots = [
    ...nonFinalized,
    ...[...plotsEm].filter((plot) => !plot.rollBlockHash),
  ];
  if (nonFinalizedPlots) {
    nonFinalizedPlots.forEach((plot) => {
      rollBlocks.add(plot.rollBlockNumber);
    });
    console.log(`Found ${nonFinalizedPlots.length} unrolled plots`);
  }

  filling = false;
}

export const isFilling = () => filling;
