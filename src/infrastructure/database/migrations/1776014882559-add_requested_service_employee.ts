import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestedServiceEmployee1776014882559 implements MigrationInterface {
    name = 'AddRequestedServiceEmployee1776014882559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "employee_id" integer`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "FK_0aff298922a62e251165f4dffcf" FOREIGN KEY ("employee_id") REFERENCES "tb_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "FK_0aff298922a62e251165f4dffcf"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "employee_id"`);
    }

}
