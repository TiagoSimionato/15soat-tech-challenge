import { MigrationInterface, QueryRunner } from "typeorm";

export class  CreatePartsTable1783537054221 implements MigrationInterface {
    name = 'CreatePartsTable1783537054221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_requested_service_part" ("id" SERIAL NOT NULL, "part_id" integer, "requested_service_id" integer, CONSTRAINT "UQ_e73070d4267611aa2a99e86d333" UNIQUE ("part_id", "requested_service_id"), CONSTRAINT "PK_986412c4be8e65ef50f53696749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_parts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_1338fd251355c1745867a51c3a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_parts_by_service" ("id" SERIAL NOT NULL, "service_id" integer, "part_id" integer, CONSTRAINT "PK_748f59d2446b92fa94cedf071e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service_part" ADD CONSTRAINT "FK_cc9b73016602fd21c8ad01674ce" FOREIGN KEY ("part_id") REFERENCES "tb_parts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service_part" ADD CONSTRAINT "FK_152c6451d5150e4172023415840" FOREIGN KEY ("requested_service_id") REFERENCES "tb_requested_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_parts_by_service" ADD CONSTRAINT "FK_904d40df35f525ad4efa9317429" FOREIGN KEY ("service_id") REFERENCES "tb_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_parts_by_service" ADD CONSTRAINT "FK_28332b7411841ccca78cee0070f" FOREIGN KEY ("part_id") REFERENCES "tb_parts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_parts_by_service" DROP CONSTRAINT "FK_28332b7411841ccca78cee0070f"`);
        await queryRunner.query(`ALTER TABLE "tb_parts_by_service" DROP CONSTRAINT "FK_904d40df35f525ad4efa9317429"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service_part" DROP CONSTRAINT "FK_152c6451d5150e4172023415840"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service_part" DROP CONSTRAINT "FK_cc9b73016602fd21c8ad01674ce"`);
        await queryRunner.query(`DROP TABLE "tb_parts_by_service"`);
        await queryRunner.query(`DROP TABLE "tb_parts"`);
        await queryRunner.query(`DROP TABLE "tb_requested_service_part"`);
    }

}
