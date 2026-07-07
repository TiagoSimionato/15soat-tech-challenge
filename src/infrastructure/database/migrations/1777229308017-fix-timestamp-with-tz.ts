import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTimestampWithTz1777229308017 implements MigrationInterface {
    name = 'FixTimestampWithTz1777229308017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "started_at"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "started_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "finished_at"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "finished_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_arrived_at"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_arrived_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_delivered_at"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_delivered_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_delivered_at"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_delivered_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_arrived_at"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_arrived_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "finished_at"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "finished_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "started_at"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "started_at" TIMESTAMP`);
    }

}
