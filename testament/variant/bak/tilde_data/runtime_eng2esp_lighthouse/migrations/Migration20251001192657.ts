import { Migration } from '@mikro-orm/migrations';

export class Migration20251001192657 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Identity\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`authentication\` json not null default "{}", primary key (\`id\`));`);
    this.addSql(`create unique index \`Identity_slug_unique\` on \`Identity\` (\`slug\`);`);

    this.addSql(`create table \`Runtime\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`url\` text not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`Runtime_slug_unique\` on \`Runtime\` (\`slug\`);`);
  }

}
