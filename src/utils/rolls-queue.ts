import { getRepository, IsNull } from "typeorm"
import { Plot, PlotBought } from "../model"

export const ROLL_BLOCK_DELAY = 7200;

export var rollBlocks = new Set<number> 
var filled = false

export async function fillRollBlocks() {
  const nonFinalized = await getRepository(Plot).find({
    where: {
      rollBlockHash: IsNull(),
    }
  })
  nonFinalized.forEach((plot) => {
    rollBlocks.add(plot.rollBlockNumber)
  })
  filled = true
  console.log(`Found ${nonFinalized.length} unrolled plots`)
}

export const isQueueEmpty = () => !filled
