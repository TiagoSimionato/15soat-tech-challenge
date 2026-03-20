import { MigrationInterface, QueryRunner } from "typeorm";

export class TbVehicle1774027101996 implements MigrationInterface {
    name = 'TbVehicle1774027101996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_vehicle" ("id" SERIAL NOT NULL, "year" integer NOT NULL, "brand" character varying NOT NULL, "model" character varying NOT NULL, "plate" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_0142e8a7093ab73d8c9db0f6084" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tb_vehicle" ADD CONSTRAINT "FK_07163603701846792583de66b6c" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_vehicle" DROP CONSTRAINT "FK_07163603701846792583de66b6c"`);
        await queryRunner.query(`DROP TABLE "tb_vehicle"`);
    }

}
