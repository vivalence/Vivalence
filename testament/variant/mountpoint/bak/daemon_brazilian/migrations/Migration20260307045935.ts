import { Migration } from "@mikro-orm/migrations";

export class Migration20260307045935 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Dimension__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default '', \`data\` json not null default [object Object], \`ancestor\` text null, constraint \`Dimension_ancestor_foreign\` foreign key(\`ancestor\`) references \`Dimension\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Dimension__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`name\`, \`description\`, \`traits\`, \`data\`, \`ancestor\` from \`Dimension\`;`,
    );
    this.addSql(`drop table \`Dimension\`;`);
    this.addSql(`alter table \`Dimension__temp_alter\` rename to \`Dimension\`;`);
    this.addSql(`create index \`Dimension_ancestor_index\` on \`Dimension\` (\`ancestor\`);`);
    this.addSql(
      `create unique index \`Dimension_ancestor_slug_unique\` on \`Dimension\` (\`ancestor\`, \`slug\`);`,
    );
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Literal__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`annotation\` json not null, \`data\` json not null, \`traits\` json not null default '[]', \`rank\` integer null, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Literal__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`annotation\`, \`data\`, \`traits\`, \`rank\` from \`Literal\`;`,
    );
    this.addSql(`drop table \`Literal\`;`);
    this.addSql(`alter table \`Literal__temp_alter\` rename to \`Literal\`;`);
    this.addSql(`create unique index \`Literal_slug_unique\` on \`Literal\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Mode__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`type\` text not null, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default '', \`installed\` integer not null default false, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Mode__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`type\`, \`slug\`, \`name\`, \`description\`, \`traits\`, \`installed\` from \`Mode\`;`,
    );
    this.addSql(`drop table \`Mode\`;`);
    this.addSql(`alter table \`Mode__temp_alter\` rename to \`Mode\`;`);
    this.addSql(`create unique index \`Mode_slug_type_unique\` on \`Mode\` (\`slug\`, \`type\`);`);
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(
      `create table \`User__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`roles\` json not null default ["USER"], \`config\` json not null, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`User__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`roles\`, \`config\` from \`User\`;`,
    );
    this.addSql(`drop table \`User\`;`);
    this.addSql(`alter table \`User__temp_alter\` rename to \`User\`;`);
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Session__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`traits\` json not null default "[]", \`data\` json not null, \`counter\` integer not null default 0, \`cursor\` integer not null default 0, constraint \`Session_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Session__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`user\`, \`traits\`, \`data\`, \`counter\`, \`cursor\` from \`Session\`;`,
    );
    this.addSql(`drop table \`Session\`;`);
    this.addSql(`alter table \`Session__temp_alter\` rename to \`Session\`;`);
    this.addSql(`create index \`Session_user_index\` on \`Session\` (\`user\`);`);
    this.addSql(`pragma foreign_keys = on;pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Valence__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`type\` text check (\`type\` in ('SELFEVIDENT', 'APPLICATIVE')) not null default 'SELFEVIDENT', \`traits\` text not null default '', \`name\` text null, \`description\` text null, \`data\` json not null default [object Object], \`docs\` text null, \`mode\` text not null, constraint \`Valence_mode_foreign\` foreign key(\`mode\`) references \`Mode\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`,
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
