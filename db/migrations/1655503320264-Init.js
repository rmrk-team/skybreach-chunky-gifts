module.exports = class Init1655503320264 {
  name = 'Init1655503320264'

  async up(db) {
    await db.query(`CREATE TABLE "plots_bought" ("id" character varying NOT NULL, "plot_ids" integer array, "buyer" text NOT NULL, "referrer" text NOT NULL, "bought_with_credits" boolean NOT NULL, "txn_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, "block_hash" text NOT NULL, "roll_block_number" integer NOT NULL, "roll_block_hash" text, "seed" text, CONSTRAINT "PK_3f525bafd88d4f48c77781b3d9e" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_217367846fd6c83eeed0c925da" ON "plots_bought" ("buyer") `)
    await db.query(`CREATE INDEX "IDX_558ea4eec706d0fd54a2f278d7" ON "plots_bought" ("txn_hash") `)
    await db.query(`CREATE INDEX "IDX_e06c1fb6d7c8869ee16e321774" ON "plots_bought" ("created_at") `)
    await db.query(`CREATE INDEX "IDX_8dde004d66f36b1459aec62ca6" ON "plots_bought" ("block_number") `)
    await db.query(`CREATE INDEX "IDX_8d25bb28e74abff77cce5c808c" ON "plots_bought" ("roll_block_hash") `)
  }

  async down(db) {
    await db.query(`DROP TABLE "plots_bought"`)
    await db.query(`DROP INDEX "public"."IDX_217367846fd6c83eeed0c925da"`)
    await db.query(`DROP INDEX "public"."IDX_558ea4eec706d0fd54a2f278d7"`)
    await db.query(`DROP INDEX "public"."IDX_e06c1fb6d7c8869ee16e321774"`)
    await db.query(`DROP INDEX "public"."IDX_8dde004d66f36b1459aec62ca6"`)
    await db.query(`DROP INDEX "public"."IDX_8d25bb28e74abff77cce5c808c"`)
  }
}
