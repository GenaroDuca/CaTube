import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarUrlToUser1761606255878 implements MigrationInterface {
    name = 'AddAvatarUrlToUser1761606255878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar_url\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar_url\``);
    }

}
