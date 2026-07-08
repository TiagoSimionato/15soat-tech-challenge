import { MigrationInterface, QueryRunner } from "typeorm";

export class DatabaseSeeding1783543996000 implements MigrationInterface {
    name = 'DatabaseSeeding1783543996000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO tb_parts (id, name) 
            VALUES 
            (1, 'Óleo do motor'),
            (2, 'Óleo da direção hidráulica'),
            (3, 'Óleo da transmissão'),
            (4, 'Pastilhas de freio dianteiras'),
			(5, 'Pastilhas de freio traseiras'),
			(6, 'Alinhamento dianteiro'),
			(7, 'Alinhamento das quatro rodas'),
			(8, 'Regulagem dos faróis')
            ON CONFLICT (id) DO NOTHING;
        `);

        await queryRunner.query(`
            INSERT INTO tb_parts_by_service (id, service_id, part_id) 
            VALUES 
            (1, 1, 1), -- Troca de óleo no Motor
            (2, 1, 2), -- Troca de óleo da direção hidráulica
            (3, 2, 4),  -- Troca de Pastilhas de freio dianteiras
			(4, 2, 5), -- Troca de Pastilhas de freio traseiras
            (5, 3, 6), -- Alinhamento dianteiro
            (6, 3, 7),  -- Alinhamento das quatro rodas
			(7, 3, 8) -- Regulagem dos faróis
            ON CONFLICT (id) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM tb_parts WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);`);
        await queryRunner.query(`DELETE FROM tb_parts_by_service WHERE id IN (1, 2, 3, 4, 5, 6, 7);`);
    }

}
