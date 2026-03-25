import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueServiceItem1774380322625 implements MigrationInterface {
    name = 'AddUniqueServiceItem1774380322625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd" UNIQUE ("stock_id", "requested_service_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd"`);
    }

}
