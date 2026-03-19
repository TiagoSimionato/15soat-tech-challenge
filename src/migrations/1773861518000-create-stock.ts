import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStock1773861518000 implements MigrationInterface {
    name = 'CreateStock1773861518000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_stock" (
                "id" SERIAL NOT NULL,
                "amount" integer NOT NULL,
                "resource_id" integer NOT NULL,
                CONSTRAINT "PK_tb_stock_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tb_stock_resource_id" UNIQUE ("resource_id"),
                CONSTRAINT "FK_tb_resource_id" FOREIGN KEY ("resource_id")
                    REFERENCES tb_resource("id")
                    ON DELETE CASCADE
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tb_stock"`);
    }

}