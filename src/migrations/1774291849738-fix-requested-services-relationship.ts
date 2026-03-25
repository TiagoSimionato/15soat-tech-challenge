import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRequestedServicesRelationship1774291849738 implements MigrationInterface {
    name = 'FixRequestedServicesRelationship1774291849738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "FK_106f18b0929a67813bc8d80562f"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "REL_106f18b0929a67813bc8d80562"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "FK_106f18b0929a67813bc8d80562f" FOREIGN KEY ("service_id") REFERENCES "tb_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "FK_106f18b0929a67813bc8d80562f"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "REL_106f18b0929a67813bc8d80562" UNIQUE ("service_id")`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "FK_106f18b0929a67813bc8d80562f" FOREIGN KEY ("service_id") REFERENCES "tb_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
