import { Migration } from '@mikro-orm/migrations';

export class Migration20250916183303 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Runtime\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null, \`url\` text not null, \`identity\` text not null, constraint \`Runtime_identity_foreign\` foreign key(\`identity\`) references \`Identity\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create unique index \`Runtime_slug_unique\` on \`Runtime\` (\`slug\`);`);
    this.addSql(`create index \`Runtime_identity_index\` on \`Runtime\` (\`identity\`);`);

    this.addSql(`drop table if exists \`Shard\`;`);
  }

}
