import { Migration } from '@mikro-orm/migrations';

export class Migration20260314124952 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`Identity__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`authentication\` json not null default '{}', primary key (\`id\`));`);
    this.addSql(`insert into \`Identity__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`authentication\` from \`Identity\`;`);
    this.addSql(`drop table \`Identity\`;`);
    this.addSql(`alter table \`Identity__temp_alter\` rename to \`Identity\`;`);
    this.addSql(`create unique index \`Identity_slug_unique\` on \`Identity\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
