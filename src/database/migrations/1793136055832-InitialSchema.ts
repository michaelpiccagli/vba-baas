import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793136055832 implements MigrationInterface {
    name = 'InitialSchema1793136055832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gateway_accounts\` (\`id\` varchar(36) NOT NULL, \`gatewayUserId\` varchar(255) NOT NULL, \`personType\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`tradingName\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`document\` varchar(255) NOT NULL, \`codigoCliente\` int NOT NULL, \`chaveLoja\` varchar(255) NOT NULL, \`accessToken\` text NOT NULL, \`tokenType\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`merchantId\` varchar(36) NULL, UNIQUE INDEX \`REL_b6bd457617ca0845375f3042d6\` (\`merchantId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`merchants\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`document\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_7682193bcf281285d0a459c4b1\` (\`email\`), UNIQUE INDEX \`IDX_8963517ae7681f1cd57347a99b\` (\`document\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`checkouts\` (\`id\` varchar(36) NOT NULL, \`externalReference\` varchar(255) NOT NULL, \`amount\` int NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'PENDING', \`description\` varchar(255) NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`merchantId\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_5d47c024e5216e3d7b6a7c9f82\` (\`externalReference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`webhook_events\` (\`id\` varchar(36) NOT NULL, \`gatewayTransactionId\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`event\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_767feef9c88a41b8f69e862c69\` (\`gatewayTransactionId\`, \`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`webhook_subscriptions\` (\`id\` varchar(36) NOT NULL, \`gatewayWebhookId\` varchar(255) NOT NULL, \`event\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`secret\` varchar(255) NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`merchantId\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_3eea1a1ae7cddeabc891697221\` (\`gatewayWebhookId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transactions\` (\`id\` varchar(36) NOT NULL, \`gatewayTransactionId\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`denialReason\` varchar(255) NULL, \`amount\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`externalReference\` varchar(255) NOT NULL, \`cardBrand\` varchar(255) NULL, \`installments\` int NULL, \`feePercent\` decimal(5,2) NULL, \`feeAmount\` int NULL, \`netAmount\` int NULL, \`txid\` varchar(255) NULL, \`emv\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`checkoutId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`gateway_accounts\` ADD CONSTRAINT \`FK_b6bd457617ca0845375f3042d62\` FOREIGN KEY (\`merchantId\`) REFERENCES \`merchants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`checkouts\` ADD CONSTRAINT \`FK_07cd7540750c8b813f9c57debb2\` FOREIGN KEY (\`merchantId\`) REFERENCES \`merchants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`webhook_subscriptions\` ADD CONSTRAINT \`FK_915896eb765a4bd2f7e12c1bc2f\` FOREIGN KEY (\`merchantId\`) REFERENCES \`merchants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_950d1ca9be7f252a0e9eca1da1e\` FOREIGN KEY (\`checkoutId\`) REFERENCES \`checkouts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_950d1ca9be7f252a0e9eca1da1e\``);
        await queryRunner.query(`ALTER TABLE \`webhook_subscriptions\` DROP FOREIGN KEY \`FK_915896eb765a4bd2f7e12c1bc2f\``);
        await queryRunner.query(`ALTER TABLE \`checkouts\` DROP FOREIGN KEY \`FK_07cd7540750c8b813f9c57debb2\``);
        await queryRunner.query(`ALTER TABLE \`gateway_accounts\` DROP FOREIGN KEY \`FK_b6bd457617ca0845375f3042d62\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
        await queryRunner.query(`DROP INDEX \`IDX_3eea1a1ae7cddeabc891697221\` ON \`webhook_subscriptions\``);
        await queryRunner.query(`DROP TABLE \`webhook_subscriptions\``);
        await queryRunner.query(`DROP INDEX \`IDX_767feef9c88a41b8f69e862c69\` ON \`webhook_events\``);
        await queryRunner.query(`DROP TABLE \`webhook_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_5d47c024e5216e3d7b6a7c9f82\` ON \`checkouts\``);
        await queryRunner.query(`DROP TABLE \`checkouts\``);
        await queryRunner.query(`DROP INDEX \`IDX_8963517ae7681f1cd57347a99b\` ON \`merchants\``);
        await queryRunner.query(`DROP INDEX \`IDX_7682193bcf281285d0a459c4b1\` ON \`merchants\``);
        await queryRunner.query(`DROP TABLE \`merchants\``);
        await queryRunner.query(`DROP INDEX \`REL_b6bd457617ca0845375f3042d6\` ON \`gateway_accounts\``);
        await queryRunner.query(`DROP TABLE \`gateway_accounts\``);
    }

}
