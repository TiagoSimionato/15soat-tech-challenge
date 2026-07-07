import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceTables1774195040954 implements MigrationInterface {
    name = 'CreateServiceTables1774195040954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_resources_by_service" ("id" SERIAL NOT NULL, "min_quantity" integer NOT NULL, "service_id" integer, "resource_id" integer, CONSTRAINT "PK_9ddf4f283cc99c6023959ff5bbb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_service_item" ("id" SERIAL NOT NULL, "amount" integer NOT NULL, "stock_id" integer, "requested_service_id" integer, CONSTRAINT "PK_cfab541f574449a957ffd8bff34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tb_requested_service" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "started_at" TIMESTAMP NOT NULL, "finished_at" TIMESTAMP NOT NULL, "cost" numeric NOT NULL, "service_id" integer, "service_order_id" integer, CONSTRAINT "REL_106f18b0929a67813bc8d80562" UNIQUE ("service_id"), CONSTRAINT "PK_d0e7490a2f51e1e0d46debe11c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tb_service_order_status_enum" AS ENUM('APPROVED', 'CANCELED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "tb_service_order" ("id" SERIAL NOT NULL, "status" "public"."tb_service_order_status_enum" NOT NULL, "budget" numeric NOT NULL, "cost" numeric NOT NULL, "user_id" integer, "vehicle_id" integer, CONSTRAINT "PK_3a86526569def5e5604e9bb2597" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" ADD CONSTRAINT "FK_f337f0ec913468151ec49fbe766" FOREIGN KEY ("service_id") REFERENCES "tb_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" ADD CONSTRAINT "FK_f108c6fffd6ae3e733122918428" FOREIGN KEY ("resource_id") REFERENCES "tb_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "FK_7286afcf5adc0ddd735310c7e2d" FOREIGN KEY ("stock_id") REFERENCES "tb_stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" ADD CONSTRAINT "FK_1600d16c6c18cbe94151e6c6786" FOREIGN KEY ("requested_service_id") REFERENCES "tb_requested_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "FK_106f18b0929a67813bc8d80562f" FOREIGN KEY ("service_id") REFERENCES "tb_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD CONSTRAINT "FK_408b5d5fd38a9f70da24ea748c4" FOREIGN KEY ("service_order_id") REFERENCES "tb_service_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD CONSTRAINT "FK_519e634da723889f665f828780f" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD CONSTRAINT "FK_840cfd01b99f87bf68f8c466636" FOREIGN KEY ("vehicle_id") REFERENCES "tb_vehicle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP CONSTRAINT "FK_840cfd01b99f87bf68f8c466636"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP CONSTRAINT "FK_519e634da723889f665f828780f"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "FK_408b5d5fd38a9f70da24ea748c4"`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP CONSTRAINT "FK_106f18b0929a67813bc8d80562f"`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "FK_1600d16c6c18cbe94151e6c6786"`);
        await queryRunner.query(`ALTER TABLE "tb_service_item" DROP CONSTRAINT "FK_7286afcf5adc0ddd735310c7e2d"`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" DROP CONSTRAINT "FK_f108c6fffd6ae3e733122918428"`);
        await queryRunner.query(`ALTER TABLE "tb_resources_by_service" DROP CONSTRAINT "FK_f337f0ec913468151ec49fbe766"`);
        await queryRunner.query(`DROP TABLE "tb_service_order"`);
        await queryRunner.query(`DROP TABLE "tb_requested_service"`);
        await queryRunner.query(`DROP TABLE "tb_service_item"`);
        await queryRunner.query(`DROP TABLE "tb_resources_by_service"`);
    }

}
