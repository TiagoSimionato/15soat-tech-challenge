import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStockResources1794833863632 implements MigrationInterface {
    name = 'RemoveStockResources1794833863632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" DROP CONSTRAINT "FK_f108c6fffd6ae3e733122918428"`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "FK_7286afcf5adc0ddd735310c7e2d"`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" ALTER COLUMN "resource_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd"`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ALTER COLUMN "stock_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd" UNIQUE ("stock_id", "requested_service_id")`);
        await queryRunner.query(`DROP TABLE "tb_stock"`);
        await queryRunner.query(`DROP TABLE "tb_resource"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd"`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ALTER COLUMN "stock_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "UQ_e5798cb5dfc13f15409aeefffdd" UNIQUE ("stock_id", "requested_service_id")`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" ALTER COLUMN "resource_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "FK_7286afcf5adc0ddd735310c7e2d" FOREIGN KEY ("stock_id") REFERENCES "tb_stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" ADD CONSTRAINT "FK_f108c6fffd6ae3e733122918428" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`
            CREATE TABLE "tb_resource" (
                id serial4 NOT NULL,
                "name" varchar NOT NULL,
                "type" "tb_resource_type_enum" NOT NULL,
                "cost" numeric NOT NULL,
                unit "tb_resource_unit_enum" NOT NULL,
                CONSTRAINT "PK_tb_resource_id" PRIMARY KEY (id)
            );
        `);
        await queryRunner.query(`
            CREATE TABLE tb_stock (
                id serial4 NOT NULL,
                amount int4 NOT NULL,
                resource_id int4 NOT NULL,
                CONSTRAINT "PK_tb_stock_id" PRIMARY KEY (id),
                CONSTRAINT "UQ_tb_stock_resource_id" UNIQUE (resource_id),
                CONSTRAINT "FK_066a007c56b4be4646b6020b108" FOREIGN KEY (resource_id) REFERENCES tb_resource(id) ON DELETE CASCADE
            );
        `);
    }
}
