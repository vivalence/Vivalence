import { Migration } from "@mikro-orm/migrations";

export class Migration20260303184426 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Valence__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`type\` text check (\`type\` in ('SELFEVIDENT', 'APPLICATIVE')) not null default 'SELFEVIDENT', \`traits\` text not null default '', \`name\` text null, \`description\` text null, \`data\` json not null default [object Object], \`docs\` text null, \`mode\` text null, constraint \`Valence_mode_foreign\` foreign key(\`mode\`) references \`Mode\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Valence__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`type\`, \`traits\`, \`name\`, \`description\`, \`data\`, \`docs\`, \`mode\` from \`Valence\`;`,
    );
    this.addSql(`drop table \`Valence\`;`);
    this.addSql(`alter table \`Valence__temp_alter\` rename to \`Valence\`;`);
    this.addSql(`create index \`Valence_mode_index\` on \`Valence\` (\`mode\`);`);
    this.addSql(
      `create unique index \`Valence_slug_mode_unique\` on \`Valence\` (\`slug\`, \`mode\`);`,
    );
    this.addSql(`pragma foreign_keys = on;`);
  }
}
