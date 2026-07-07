import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersRoles1773760869362 implements MigrationInterface {
  name = 'CreateUsersRoles1773760869362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tb_role (authority) VALUES ('ADMIN')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM tb_role r WHERE r.authority = 'ADMIN'`);
  }
}
