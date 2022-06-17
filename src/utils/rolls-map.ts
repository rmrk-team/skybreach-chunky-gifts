import { getRepository, IsNull } from "typeorm";
import { PlotsBought } from "../model";

export const ROLL_BLOCK_DELAY = 7200;

var rollBlocks = new Map<number, Array<string>>();
var filled = false;

export async function fillRollBlocks() {
  const nonFinalized = await getRepository(PlotsBought).find({
    where: {
      rollBlockHash: IsNull(),
    },
  });

  nonFinalized.forEach((event_) => {
    setRollId(event_.rollBlockNumber, event_.id);
  });
  filled = true;
  console.log(`Found ${nonFinalized.length} unfinilized events`);
}

export const getRollIds = (key: number) => rollBlocks.get(key);
export const setRollId = (key: number, val: string) => {
  const currRollIds = rollBlocks.get(key);
  if (currRollIds) currRollIds.push(val);
  else rollBlocks.set(key, [val]);
};
export const isQueueEmpty = () => !filled;
