module.exports = class Init1656750709640 {
  name = 'Init1656750709640'

  async up(db) {
    await db.query(`CREATE TABLE "plot" ("id" character varying NOT NULL, "owner" text NOT NULL, "firstblock_number" integer NOT NULL, "firstblock_hash" text NOT NULL, "roll_block_number" integer NOT NULL, "roll_block_hash" text, "seed" text, "roll" numeric, CONSTRAINT "PK_7c22bdc3280a3a5610c63159883" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_1702fa1d2c5e53abe8ce06c119" ON "plot" ("owner") `)
    await db.query(`CREATE INDEX "IDX_9fe2694e9fe5b895f45645ab3a" ON "plot" ("firstblock_number") `)
    await db.query(`CREATE INDEX "IDX_d39bf704907adc4e729644ed58" ON "plot" ("roll") `)
    await db.query(`CREATE TABLE "plot_bought" ("id" character varying NOT NULL, "buyer" text NOT NULL, "referrer" text NOT NULL, "bought_with_credits" boolean NOT NULL, "txn_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, "plot_id" character varying NOT NULL, CONSTRAINT "PK_1fa9f0b29a04e186a2d6f77f614" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_74531847f843732d0563ee2276" ON "plot_bought" ("plot_id") `)
    await db.query(`CREATE INDEX "IDX_1acc8d7e6c0cec9aacabef13f6" ON "plot_bought" ("buyer") `)
    await db.query(`CREATE INDEX "IDX_c3bc5bcedf84004faf2f68e868" ON "plot_bought" ("txn_hash") `)
    await db.query(`CREATE INDEX "IDX_0c14fd789e7dc725a8eb904433" ON "plot_bought" ("created_at") `)
    await db.query(`ALTER TABLE "plot_bought" ADD CONSTRAINT "FK_74531847f843732d0563ee22765" FOREIGN KEY ("plot_id") REFERENCES "plot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "plot"`)
    await db.query(`DROP INDEX "public"."IDX_1702fa1d2c5e53abe8ce06c119"`)
    await db.query(`DROP INDEX "public"."IDX_9fe2694e9fe5b895f45645ab3a"`)
    await db.query(`DROP INDEX "public"."IDX_d39bf704907adc4e729644ed58"`)
    await db.query(`DROP TABLE "plot_bought"`)
    await db.query(`DROP INDEX "public"."IDX_74531847f843732d0563ee2276"`)
    await db.query(`DROP INDEX "public"."IDX_1acc8d7e6c0cec9aacabef13f6"`)
    await db.query(`DROP INDEX "public"."IDX_c3bc5bcedf84004faf2f68e868"`)
    await db.query(`DROP INDEX "public"."IDX_0c14fd789e7dc725a8eb904433"`)
    await db.query(`ALTER TABLE "plot_bought" DROP CONSTRAINT "FK_74531847f843732d0563ee22765"`)
  }
}
