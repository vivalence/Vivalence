import { Migration } from "@mikro-orm/migrations";

export class Migration20260304001406 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Literal__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`annotation\` json not null, \`data\` json not null, \`traits\` json not null default '[]', primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Literal__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`slug\`, \`annotation\`, \`data\`, \`traits\` from \`Literal\`;`,
    );
    this.addSql(`drop table \`Literal\`;`);
    this.addSql(`alter table \`Literal__temp_alter\` rename to \`Literal\`;`);
    this.addSql(`create unique index \`Literal_slug_unique\` on \`Literal\` (\`slug\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }
}
