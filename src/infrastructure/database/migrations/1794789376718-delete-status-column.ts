import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteStatusColumn1794789376718 implements MigrationInterface {
    name = 'DeleteStatusColumn1794789376718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_requested_service" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."tb_service_order_status_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tb_service_order_status_enum" AS ENUM('APROVADO', 'CANCELADO', 'ENTREGUE', 'PENDENTE')`);
        await queryRunner.query(`ALTER TABLE "tb_service_order" ADD "status" "public"."tb_service_order_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tb_requested_service" ADD "status" character varying NOT NULL`);
    }

}
