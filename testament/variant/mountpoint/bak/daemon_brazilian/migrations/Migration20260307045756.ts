import { Migration } from "@mikro-orm/migrations";

export class Migration20260307045756 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(
      `create table \`Product__temp_alter\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`type\` text check (\`type\` in ('MODAL', 'MESSAGE', 'SIGNAL')) not null default 'MODAL', \`status\` text check (\`status\` in ('PENDING', 'ACTIVE', 'DONE', 'ERROR')) not null default 'PENDING', \`position\` integer not null, \`data\` json not null, \`session\` text not null, \`producer\` text not null, \`commissioner\` text not null, constraint \`Product_session_foreign\` foreign key(\`session\`) references \`Session\`(\`id\`) on update cascade, constraint \`Product_producer_foreign\` foreign key(\`producer\`) references \`Mode\`(\`id\`) on update cascade, constraint \`Product_commissioner_foreign\` foreign key(\`commissioner\`) references \`Mode\`(\`id\`) on update cascade, primary key (\`id\`));`,
    );
    this.addSql(
      `insert into \`Product__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`type\`, \`status\`, \`position\`, \`data\`, \`session\`, \`producer\`, \`commissioner\` from \`Product\`;`,
    );
    this.addSql(`drop table \`Product\`;`);
    this.addSql(`alter table \`Product__temp_alter\` rename to \`Product\`;`);
    this.addSql(`create index \`Product_session_index\` on \`Product\` (\`session\`);`);
    this.addSql(`create index \`Product_producer_index\` on \`Product\` (\`producer\`);`);
    this.addSql(`create index \`Product_commissioner_index\` on \`Product\` (\`commissioner\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }
}
