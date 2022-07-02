import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {PlotBought} from "./plotBought.model"

@Entity_()
export class Plot {
  constructor(props?: Partial<Plot>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @Column_("text", {nullable: false})
  owner!: string

  @OneToMany_(() => PlotBought, e => e.plot)
  sales!: PlotBought[]

  @Index_()
  @Column_("int4", {nullable: false})
  firstblockNumber!: number

  @Column_("text", {nullable: false})
  firstblockHash!: string

  @Column_("int4", {nullable: false})
  rollBlockNumber!: number

  @Column_("text", {nullable: true})
  rollBlockHash!: string | undefined | null

  @Column_("text", {nullable: true})
  seed!: string | undefined | null

  @Index_()
  @Column_("numeric", {nullable: true})
  roll!: number | undefined | null
}
