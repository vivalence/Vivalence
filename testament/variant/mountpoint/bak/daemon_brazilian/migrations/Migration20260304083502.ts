import { Migration } from "@mikro-orm/migrations";

export class Migration20260304083502 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);

    this.addSql(
      `create table \`Symbol__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`name\` text null, \`description\` text null, \`data\` json not null, \`ancestor_id\` text null, \`traits\` json not null default '[]', constraint \`Symbol_ancestor_id_foreign\` foreign key(\`ancestor_id\`) references \`Symbol\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Symbol__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`name\`, \`description\`, \`data\`, \`ancestor_id\`, \`traits\` from \`Symbol\`;`,
    );
    this.addSql(`drop table \`Symbol\`;`);
    this.addSql(`alter table \`Symbol__temp_alter\` rename to \`Symbol\`;`);
    this.addSql(`create index \`Symbol_ancestor_id_index\` on \`Symbol\` (\`ancestor_id\`);`);
    this.addSql(`create unique index \`Symbol_slug_unique\` on \`Symbol\` (\`slug\`);`);

    this.addSql(`drop index \`Memory_symbol_index\`;`);
    this.addSql(
      `create table \`Memory__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`literal\` text not null, \`driver\` text check (\`driver\` in ('BAYESIAN', 'BOOLEAN', 'AGENTIC')) not null default 'BAYESIAN', \`type\` text check (\`type\` in ('INDIVIDUAL', 'RELATIONAL')) not null default 'INDIVIDUAL', \`status\` text check (\`status\` in ('UNTOUCHED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED')) not null default 'UNKNOWN', \`state\` json not null, \`history\` json not null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, \`lastAt\` datetime not null, constraint \`Memory_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_literal_foreign\` foreign key(\`literal\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Memory__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`user\`, \`literal\`, \`driver\`, \`type\`, \`status\`, \`state\`, \`history\`, \`nextIn\`, \`nextAt\`, \`lastAt\` from \`Memory\`;`,
    );
    this.addSql(`drop table \`Memory\`;`);
    this.addSql(`alter table \`Memory__temp_alter\` rename to \`Memory\`;`);
    this.addSql(`create index \`Memory_user_index\` on \`Memory\` (\`user\`);`);
    this.addSql(`create index \`Memory_literal_index\` on \`Memory\` (\`literal\`);`);

    this.addSql(`pragma foreign_keys = on;`);
  }
}
