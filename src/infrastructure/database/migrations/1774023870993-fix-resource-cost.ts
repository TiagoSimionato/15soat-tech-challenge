import { MigrationInterface, QueryRunner } from "typeorm";

export class FixResourceCost1774023870993 implements MigrationInterface {
    name = 'FixResourceCost1774023870993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_stock" DROP CONSTRAINT "FK_tb_resource_id"`);
        await queryRunner.query(`ALTER TYPE "public"."tb_user_legalnature_enum" RENAME TO "tb_user_legalnature_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tb_user_legal_nature_enum" AS ENUM('PF', 'PJ')`);
        await queryRunner.query(`ALTER TABLE "tb_user" ALTER COLUMN "legal_nature" TYPE "public"."tb_user_legal_nature_enum" USING "legal_nature"::"text"::"public"."tb_user_legal_nature_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tb_user_legalnature_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."tb_resource_type_enum" AS ENUM('P', 'S')`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "type" "public"."tb_resource_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "cost"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "cost" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE TYPE "public"."tb_resource_unit_enum" AS ENUM('L', 'ML', 'U')`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "unit" "public"."tb_resource_unit_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ALTER COLUMN "resource_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ADD CONSTRAINT "FK_066a007c56b4be4646b6020b108" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_stock" DROP CONSTRAINT "FK_066a007c56b4be4646b6020b108"`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ALTER COLUMN "resource_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "unit"`);
        await queryRunner.query(`DROP TYPE "public"."tb_resource_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "unit" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "cost"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "cost" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."tb_resource_type_enum"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."tb_user_legalnature_enum_old" AS ENUM('PF', 'PJ')`);
        await queryRunner.query(`ALTER TABLE "tb_user" ALTER COLUMN "legal_nature" TYPE "public"."tb_user_legalnature_enum_old" USING "legal_nature"::"text"::"public"."tb_user_legalnature_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."tb_user_legal_nature_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tb_user_legalnature_enum_old" RENAME TO "tb_user_legalnature_enum"`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ADD CONSTRAINT "FK_tb_resource_id" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
