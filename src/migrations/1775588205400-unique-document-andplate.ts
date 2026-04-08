import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueDocumentAndplate1775588205400 implements MigrationInterface {
    name = 'UniqueDocumentAndplate1775588205400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_user" ADD CONSTRAINT "UQ_a62df7e065506ee77674e5e7723" UNIQUE ("document")`);
        await queryRunner.query(`ALTER TABLE "tb_vehicle" ADD CONSTRAINT "UQ_1faf627016d07d5a00c6286f510" UNIQUE ("plate")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tb_vehicle" DROP CONSTRAINT "UQ_1faf627016d07d5a00c6286f510"`);
        await queryRunner.query(`ALTER TABLE "tb_user" DROP CONSTRAINT "UQ_a62df7e065506ee77674e5e7723"`);
    }

}
