import { IsNull } from 'typeorm';
import { Plot } from '../model';
import { Store } from '@subsquid/typeorm-store';

export const ROLL_BLOCK_DELAY = 7200;

export const rollBlocks = new Set<number>();
let filled = false;

export async function fillRollBlocks(store: Store) {
  const nonFinalized = await store.find(Plot, {
    where: {
      rollBlockHash: IsNull(),
    },
  });
  if (nonFinalized) {
    nonFinalized.forEach((plot) => {
      rollBlocks.add(plot.rollBlockNumber);
    });
    filled = true;
    console.log(`Found ${nonFinalized.length} unrolled plots`);
  }
}

export const isQueueEmpty = () => !filled;
