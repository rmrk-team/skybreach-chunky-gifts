import { getRepository, IsNull } from "typeorm"
import { PlotBought } from "../model"

export const ROLL_BLOCK_DELAY = 7200;

export var rollBlocks = new Set<number> 
var filled = false

export async function fillRollBlocks() {
  const nonFinalized = await getRepository(PlotBought).find({
    where: {
      rollBlockHash: IsNull(),
    }
  })

  nonFinalized.forEach((event_) => {
    rollBlocks.add(event_.rollBlockNumber)
  });
  filled = true;
  console.log(`Found ${nonFinalized.length} unfinilized events`)
}

export const isQueueEmpty = () => !filled
