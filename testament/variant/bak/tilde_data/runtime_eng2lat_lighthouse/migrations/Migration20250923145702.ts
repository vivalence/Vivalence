import { Migration } from '@mikro-orm/migrations';

export class Migration20250923145702 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`Identity__temp_alter\` (\`id\` text not null default 'sql:uuid()', \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null, \`authentication\` json not null default "{}", primary key (\`id\`));`);
    this.addSql(`insert into \`Identity__temp_alter\` select * from \`Identity\`;`);
    this.addSql(`drop table \`Identity\`;`);
    this.addSql(`alter table \`Identity__temp_alter\` rename to \`Identity\`;`);
    this.addSql(`create unique index \`Identity_slug_unique\` on \`Identity\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(`create table \`Runtime__temp_alter\` (\`id\` text not null default 'sql:uuid()', \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null, \`url\` text not null, primary key (\`id\`));`);
    this.addSql(`insert into \`Runtime__temp_alter\` select * from \`Runtime\`;`);
    this.addSql(`drop table \`Runtime\`;`);
    this.addSql(`alter table \`Runtime__temp_alter\` rename to \`Runtime\`;`);
    this.addSql(`create unique index \`Runtime_slug_unique\` on \`Runtime\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
