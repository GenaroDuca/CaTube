import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarCamposPrivacidad1764352753197 implements MigrationInterface {
    name = 'AgregarCamposPrivacidad1764352753197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`channels\` ADD \`is_hidden\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`is_private\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`is_private\``);
        await queryRunner.query(`ALTER TABLE \`channels\` DROP COLUMN \`is_hidden\``);
    }
}