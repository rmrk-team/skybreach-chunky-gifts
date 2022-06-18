module.exports = class Init1655558242814 {
  name = 'Init1655558242814'

  async up(db) {
    await db.query(`CREATE TABLE "plot_bought" ("id" character varying NOT NULL, "plot_id" integer NOT NULL, "buyer" text NOT NULL, "referrer" text NOT NULL, "bought_with_credits" boolean NOT NULL, "txn_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, "block_hash" text NOT NULL, "roll_block_number" integer NOT NULL, "roll_block_hash" text, "seed" text, "roll" numeric, CONSTRAINT "PK_1fa9f0b29a04e186a2d6f77f614" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_74531847f843732d0563ee2276" ON "plot_bought" ("plot_id") `)
    await db.query(`CREATE INDEX "IDX_1acc8d7e6c0cec9aacabef13f6" ON "plot_bought" ("buyer") `)
    await db.query(`CREATE INDEX "IDX_c3bc5bcedf84004faf2f68e868" ON "plot_bought" ("txn_hash") `)
    await db.query(`CREATE INDEX "IDX_0c14fd789e7dc725a8eb904433" ON "plot_bought" ("created_at") `)
    await db.query(`CREATE INDEX "IDX_c1ef1273fff18c122c0ea749cd" ON "plot_bought" ("block_number") `)
    await db.query(`CREATE INDEX "IDX_b309907f17c897c408076ffa09" ON "plot_bought" ("roll_block_hash") `)
    await db.query(`CREATE INDEX "IDX_2f7a55b4d8b9b00b8a2374f547" ON "plot_bought" ("roll") `)
  }

  async down(db) {
    await db.query(`DROP TABLE "plot_bought"`)
    await db.query(`DROP INDEX "public"."IDX_74531847f843732d0563ee2276"`)
    await db.query(`DROP INDEX "public"."IDX_1acc8d7e6c0cec9aacabef13f6"`)
    await db.query(`DROP INDEX "public"."IDX_c3bc5bcedf84004faf2f68e868"`)
    await db.query(`DROP INDEX "public"."IDX_0c14fd789e7dc725a8eb904433"`)
    await db.query(`DROP INDEX "public"."IDX_c1ef1273fff18c122c0ea749cd"`)
    await db.query(`DROP INDEX "public"."IDX_b309907f17c897c408076ffa09"`)
    await db.query(`DROP INDEX "public"."IDX_2f7a55b4d8b9b00b8a2374f547"`)
  }
}
