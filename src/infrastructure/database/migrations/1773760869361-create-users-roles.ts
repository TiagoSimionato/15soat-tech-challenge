import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersRoles1773760869361 implements MigrationInterface {
    name = 'CreateUsersRoles1773760869361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_role" ("id" SERIAL NOT NULL, "authority" character varying NOT NULL, CONSTRAINT "PK_b0ff0398cf8c3dcf30ba3b17ad4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_73b9d65d3c93dcf253eaa9b5570" UNIQUE ("username"), CONSTRAINT "PK_1943338f8f00e074a3c5bb48d5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_user_role" ("tbUserId" integer NOT NULL, "tbRoleId" integer NOT NULL, CONSTRAINT "PK_8b96950622f2361862c32ca05d1" PRIMARY KEY ("tbUserId", "tbRoleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b42a0e538a5e4a710510730a0" ON "tb_user_role" ("tbUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_015052c46f7c1bb2e656131bc3" ON "tb_user_role" ("tbRoleId") `);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_5b42a0e538a5e4a710510730a01" FOREIGN KEY ("tbUserId") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" ADD CONSTRAINT "FK_015052c46f7c1bb2e656131bc31" FOREIGN KEY ("tbRoleId") REFERENCES "tb_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_015052c46f7c1bb2e656131bc31"`);
        await queryRunner.query(`ALTER TABLE "tb_user_role" DROP CONSTRAINT "FK_5b42a0e538a5e4a710510730a01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_015052c46f7c1bb2e656131bc3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b42a0e538a5e4a710510730a0"`);
        await queryRunner.query(`DROP TABLE "tb_user_role"`);
        await queryRunner.query(`DROP TABLE "tb_user"`);
        await queryRunner.query(`DROP TABLE "tb_role"`);
    }

}
