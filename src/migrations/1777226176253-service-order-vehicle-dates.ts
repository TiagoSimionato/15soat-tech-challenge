import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceOrderVehicleDates1777226176253 implements MigrationInterface {
    name = 'ServiceOrderVehicleDates1777226176253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_arrived_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "vehicle_delivered_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_delivered_at"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "vehicle_arrived_at"`);
    }

}
