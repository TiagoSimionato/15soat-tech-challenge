import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStockTable1774024988981 implements MigrationInterface {
    name = 'FixStockTable1774024988981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_stock" DROP CONSTRAINT "FK_066a007c56b4be4646b6020b108"`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ALTER COLUMN "resource_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ADD CONSTRAINT "FK_066a007c56b4be4646b6020b108" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_stock" DROP CONSTRAINT "FK_066a007c56b4be4646b6020b108"`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ALTER COLUMN "resource_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_stock" ADD CONSTRAINT "FK_066a007c56b4be4646b6020b108" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
