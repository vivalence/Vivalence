import { Migration } from '@mikro-orm/migrations';

export class Migration20250916173521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Identity\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null, \`authentication\` json not null default "{}", primary key (\`id\`));`);
    this.addSql(`create unique index \`Identity_slug_unique\` on \`Identity\` (\`slug\`);`);

    this.addSql(`create table \`Shard\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null, \`type\` text not null, \`url\` text not null, \`identity\` text not null, constraint \`Shard_identity_foreign\` foreign key(\`identity\`) references \`Identity\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create unique index \`Shard_slug_unique\` on \`Shard\` (\`slug\`);`);
    this.addSql(`create index \`Shard_identity_index\` on \`Shard\` (\`identity\`);`);
  }

}
