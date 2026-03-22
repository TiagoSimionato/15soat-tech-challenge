import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTbUserRoles1774201133299 implements MigrationInterface {
    name = 'FixTbUserRoles1774201133299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_5b42a0e538a5e4a710510730a01"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_015052c46f7c1bb2e656131bc31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b42a0e538a5e4a710510730a0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_015052c46f7c1bb2e656131bc3"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_8b96950622f2361862c32ca05d1"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_015052c46f7c1bb2e656131bc31" PRIMARY KEY ("tbRoleId")`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP COLUMN "tbUserId"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_015052c46f7c1bb2e656131bc31"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP COLUMN "tbRoleId"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_6837ba4c6781d1331e36bfab12f" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD "role_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_6837ba4c6781d1331e36bfab12f"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_d11d3086fb5780a8d3bde1b97f4" PRIMARY KEY ("user_id", "role_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_6837ba4c6781d1331e36bfab12" ON "tb_user_role" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bbb332ee61edbb0a3182885ab7" ON "tb_user_role" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_6837ba4c6781d1331e36bfab12f" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_bbb332ee61edbb0a3182885ab7a" FOREIGN KEY ("role_id") REFERENCES "tb_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_bbb332ee61edbb0a3182885ab7a"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_6837ba4c6781d1331e36bfab12f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbb332ee61edbb0a3182885ab7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6837ba4c6781d1331e36bfab12"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_d11d3086fb5780a8d3bde1b97f4"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_6837ba4c6781d1331e36bfab12f" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_6837ba4c6781d1331e36bfab12f"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD "tbRoleId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_015052c46f7c1bb2e656131bc31" PRIMARY KEY ("tbRoleId")`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD "tbUserId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "PK_015052c46f7c1bb2e656131bc31"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "PK_8b96950622f2361862c32ca05d1" PRIMARY KEY ("tbUserId", "tbRoleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_015052c46f7c1bb2e656131bc3" ON "tb_user_role" ("tbRoleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5b42a0e538a5e4a710510730a0" ON "tb_user_role" ("tbUserId") `);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_015052c46f7c1bb2e656131bc31" FOREIGN KEY ("tbRoleId") REFERENCES "tb_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_5b42a0e538a5e4a710510730a01" FOREIGN KEY ("tbUserId") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
