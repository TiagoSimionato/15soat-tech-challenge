import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDocument1773940822572 implements MigrationInterface {
    name = 'AddUserDocument1773940822572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_user" ADD "document" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."tb_user_legalnature_enum" AS ENUM('PF', 'PJ')`);
        await queryRunner.query(`ALTER TABLE "tb_user" ADD "legal_nature" "public"."tb_user_legalnature_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "cost"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "cost" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_resource" DROP COLUMN "cost"`);
        await queryRunner.query(`ALTER TABLE "tb_resource" ADD "cost" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "legal_nature"`);
        await queryRunner.query(`DROP TYPE "public"."tb_user_legalnature_enum"`);
        await queryRunner.query(`ALTER TABLE "tb_user" DROP COLUMN "document"`);
    }

}
