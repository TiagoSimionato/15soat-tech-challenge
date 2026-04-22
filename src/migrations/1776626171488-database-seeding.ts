import { MigrationInterface, QueryRunner } from "typeorm";

export class DatabaseSeeding1776626171488 implements MigrationInterface {
    name = 'DatabaseSeeding1776626171488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO tb_user (id, name, username, password, document, legal_nature) 
            VALUES 
            (1, 'Admin', 'admin', '$2b$10$OaeUDMnhVauytTC8n9bm0OFUobDEGkS9in1F7eRCSyzqlXvlzJgfK', '84310979068', 'PF')
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_user_id_seq', (SELECT MAX(id) FROM tb_user));`).catch(() => {});

        await queryRunner.query(`INSERT INTO tb_user_role (user_id, role_id) VALUES (1, 1)`).catch(() => {});


        await queryRunner.query(`
            INSERT INTO tb_vehicle (id, year, brand, model, plate, user_id) 
            VALUES (1, 2018, 'Honda', 'Civic', 'ABV-1234', 1)
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_vehicle_id_seq', (SELECT MAX(id) FROM tb_vehicle));`).catch(() => {});

        await queryRunner.query(`
            INSERT INTO tb_resource (id, name, type, cost, unit) 
            VALUES 
            (1, 'Óleo de Motor 5W30', 'S', 45.50, 'L'),
            (2, 'Filtro de Óleo', 'P', 25.00, 'U'),
            (3, 'Pastilha de Freio Dianteiro', 'P', 120.00, 'U')
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_resource_id_seq', (SELECT MAX(id) FROM tb_resource));`).catch(() => {});

        await queryRunner.query(`
            INSERT INTO tb_stock (id, amount, resource_id) 
            VALUES 
            (1, 100, 1),
            (2, 50, 2),
            (3, 20, 3)
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_stock_id_seq', (SELECT MAX(id) FROM tb_stock));`).catch(() => {});

        await queryRunner.query(`
            INSERT INTO tb_services (id, name, cost) 
            VALUES 
            (1, 'Troca de Óleo Completa', 80.00),
            (2, 'Troca de Pastilhas de Freio', 100.00),
            (3, 'Alinhamento e Balanceamento', 150.00),
            (4, 'Revisão Geral', 250.00)
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_services_id_seq', (SELECT MAX(id) FROM tb_services));`).catch(() => {});

        await queryRunner.query(`
            INSERT INTO tb_resources_by_service (id, min_quantity, service_id, resource_id) 
            VALUES 
            (1, 4, 1, 1), -- 4L de Óleo na Troca de Óleo
            (2, 1, 1, 2), -- 1 Filtro de Óleo na Troca de Óleo
            (3, 1, 2, 3)  -- 1 Jogo de Pastilhas na Troca de Pastilhas
            ON CONFLICT (id) DO NOTHING;
        `);
        await queryRunner.query(`SELECT setval('tb_resources_by_service_id_seq', (SELECT MAX(id) FROM tb_resources_by_service));`).catch(() => {});
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM tb_user_role WHERE user_id = 1 AND role_id = 1;`);
        await queryRunner.query(`DELETE FROM tb_resources_by_service WHERE id IN (1, 2, 3);`);
        await queryRunner.query(`DELETE FROM tb_services WHERE id IN (1, 2, 3, 4);`);
        await queryRunner.query(`DELETE FROM tb_stock WHERE id IN (1, 2, 3);`);
        await queryRunner.query(`DELETE FROM tb_resource WHERE id IN (1, 2, 3);`);
        await queryRunner.query(`DELETE FROM tb_vehicle WHERE id = 1;`);
        await queryRunner.query(`DELETE FROM tb_user WHERE id = 1;`);
    }

}
