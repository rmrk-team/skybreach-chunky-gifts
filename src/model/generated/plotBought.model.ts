import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Plot} from "./plot.model"

@Entity_()
export class PlotBought {
  constructor(props?: Partial<PlotBought>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Plot, {nullable: false})
  plot!: Plot

  @Index_()
  @Column_("text", {nullable: false})
  buyer!: string

  @Column_("text", {nullable: false})
  referrer!: string

  @Column_("bool", {nullable: false})
  boughtWithCredits!: boolean

  @Index_()
  @Column_("text", {nullable: false})
  txnHash!: string

  @Index_()
  @Column_("timestamp with time zone", {nullable: false})
  createdAt!: Date

  @Column_("int4", {nullable: false})
  blockNumber!: number
}
