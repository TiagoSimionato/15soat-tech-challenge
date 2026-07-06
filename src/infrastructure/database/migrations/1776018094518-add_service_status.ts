import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceStatus1776018094518 implements MigrationInterface {
    name = 'AddServiceStatus1776018094518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."tb_service_order_status_enum" RENAME TO "tb_service_order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tb_service_order_status_enum" AS ENUM('APPROVED', 'CANCELED', 'FINALIZADA', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ALTER COLUMN "status" TYPE "public"."tb_service_order_status_enum" USING "status"::"text"::"public"."tb_service_order_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tb_service_order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tb_service_order_status_enum_old" AS ENUM('APPROVED', 'CANCELED', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ALTER COLUMN "status" TYPE "public"."tb_service_order_status_enum_old" USING "status"::"text"::"public"."tb_service_order_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."tb_service_order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tb_service_order_status_enum_old" RENAME TO "tb_service_order_status_enum"`);
    }

}
