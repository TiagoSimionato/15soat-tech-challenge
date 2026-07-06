import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServices1774025854870 implements MigrationInterface {
    name = 'CreateServices1774025854870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_services" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "cost" numeric NOT NULL, CONSTRAINT "PK_4fcdc1d1c4d27dda11f2b5e7a58" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tb_services"`);
    }

}
