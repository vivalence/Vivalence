import { Migration } from '@mikro-orm/migrations';

export class Migration20251002170746 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`Topography__temp_alter\` (\`id\` text not null, \`slug\` text not null default '', \`type\` text null, \`name\` text null, \`description\` text null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`traits\` json not null default "[]", \`data\` json not null default [object Object], \`annotations\` json not null default '[]', \`constraints\` json not null default '[]', primary key (\`id\`));`);
    this.addSql(`insert into \`Topography__temp_alter\` select \`id\`, \`slug\`, \`type\`, \`name\`, \`description\`, \`created_at\`, \`updated_at\`, \`traits\`, \`data\`, \`annotations\`, \`constraints\` from \`Topography\`;`);
    this.addSql(`drop table \`Topography\`;`);
    this.addSql(`alter table \`Topography__temp_alter\` rename to \`Topography\`;`);
    this.addSql(`create unique index \`Topography_slug_unique\` on \`Topography\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
