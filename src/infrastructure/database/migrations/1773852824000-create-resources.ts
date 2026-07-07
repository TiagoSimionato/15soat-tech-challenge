import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResources1773852824000 implements MigrationInterface {
    name = 'CreateResources1773852824000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_resource" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "type" character varying NOT NULL,
                "cost" numeric(10,2) NOT NULL,
                "unit" character varying NOT NULL,
                CONSTRAINT "PK_tb_resource_id" PRIMARY KEY ("id")
            )`);        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tb_resource"`);
    }

}
