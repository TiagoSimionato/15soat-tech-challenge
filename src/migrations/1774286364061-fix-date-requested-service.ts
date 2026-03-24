import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDateRequestedService1774286364061 implements MigrationInterface {
    name = 'FixDateRequestedService1774286364061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ALTER COLUMN "started_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ALTER COLUMN "finished_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ALTER COLUMN "finished_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ALTER COLUMN "started_at" SET NOT NULL`);
    }

}
