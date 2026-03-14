import { Migration } from '@mikro-orm/migrations';

export class Migration20260307045952 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Dimension\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default '', \`data\` json not null default [object Object], \`ancestor\` text null, constraint \`Dimension_ancestor_foreign\` foreign key(\`ancestor\`) references \`Dimension\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Dimension_ancestor_index\` on \`Dimension\` (\`ancestor\`);`);
    this.addSql(`create unique index \`Dimension_ancestor_slug_unique\` on \`Dimension\` (\`ancestor\`, \`slug\`);`);

    this.addSql(`create table \`Literal\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`annotation\` json not null, \`data\` json not null, \`traits\` json not null default '[]', \`rank\` integer null, primary key (\`id\`));`);
    this.addSql(`create unique index \`Literal_slug_unique\` on \`Literal\` (\`slug\`);`);

    this.addSql(`create table \`Mode\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`type\` text not null, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default '', \`installed\` integer not null default false, primary key (\`id\`));`);
    this.addSql(`create unique index \`Mode_slug_type_unique\` on \`Mode\` (\`slug\`, \`type\`);`);

    this.addSql(`create table \`Subject\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`dimensions\` json not null default '[]', \`relations\` json not null default '[]', primary key (\`id\`));`);
    this.addSql(`create unique index \`Subject_slug_unique\` on \`Subject\` (\`slug\`);`);

    this.addSql(`create table \`Symbol\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`name\` text null, \`description\` text null, \`data\` json not null, \`ancestor_id\` text null, \`traits\` json not null default '[]', constraint \`Symbol_ancestor_id_foreign\` foreign key(\`ancestor_id\`) references \`Symbol\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Symbol_ancestor_id_index\` on \`Symbol\` (\`ancestor_id\`);`);
    this.addSql(`create unique index \`Symbol_slug_unique\` on \`Symbol\` (\`slug\`);`);

    this.addSql(`create table \`symbol_literals\` (\`symbol_entity_id\` text not null, \`literal_entity_id\` text not null, constraint \`symbol_literals_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`symbol_literals_literal_entity_id_foreign\` foreign key(\`literal_entity_id\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, primary key (\`symbol_entity_id\`, \`literal_entity_id\`));`);
    this.addSql(`create index \`symbol_literals_symbol_entity_id_index\` on \`symbol_literals\` (\`symbol_entity_id\`);`);
    this.addSql(`create index \`symbol_literals_literal_entity_id_index\` on \`symbol_literals\` (\`literal_entity_id\`);`);

    this.addSql(`create table \`User\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`roles\` json not null default ["USER"], \`config\` json not null, primary key (\`id\`));`);

    this.addSql(`create table \`Session\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`traits\` json not null default "[]", \`data\` json not null, \`counter\` integer not null default 0, \`cursor\` integer not null default 0, constraint \`Session_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Session_user_index\` on \`Session\` (\`user\`);`);

    this.addSql(`create table \`Product\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`type\` text check (\`type\` in ('MODAL', 'MESSAGE', 'SIGNAL')) not null default 'MODAL', \`status\` text check (\`status\` in ('PENDING', 'ACTIVE', 'DONE', 'ERROR')) not null default 'PENDING', \`position\` integer not null, \`data\` json not null, \`session\` text not null, \`producer\` text not null, \`commissioner\` text not null, constraint \`Product_session_foreign\` foreign key(\`session\`) references \`Session\`(\`id\`) on update cascade, constraint \`Product_producer_foreign\` foreign key(\`producer\`) references \`Mode\`(\`id\`) on update cascade, constraint \`Product_commissioner_foreign\` foreign key(\`commissioner\`) references \`Mode\`(\`id\`) on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Product_session_index\` on \`Product\` (\`session\`);`);
    this.addSql(`create index \`Product_producer_index\` on \`Product\` (\`producer\`);`);
    this.addSql(`create index \`Product_commissioner_index\` on \`Product\` (\`commissioner\`);`);

    this.addSql(`create table \`symbol_products\` (\`symbol_entity_id\` text not null, \`product_entity_id\` text not null, constraint \`symbol_products_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`symbol_products_product_entity_id_foreign\` foreign key(\`product_entity_id\`) references \`Product\`(\`id\`) on delete cascade on update cascade, primary key (\`symbol_entity_id\`, \`product_entity_id\`));`);
    this.addSql(`create index \`symbol_products_symbol_entity_id_index\` on \`symbol_products\` (\`symbol_entity_id\`);`);
    this.addSql(`create index \`symbol_products_product_entity_id_index\` on \`symbol_products\` (\`product_entity_id\`);`);

    this.addSql(`create table \`literal_products\` (\`literal_entity_id\` text not null, \`product_entity_id\` text not null, constraint \`literal_products_literal_entity_id_foreign\` foreign key(\`literal_entity_id\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, constraint \`literal_products_product_entity_id_foreign\` foreign key(\`product_entity_id\`) references \`Product\`(\`id\`) on delete cascade on update cascade, primary key (\`literal_entity_id\`, \`product_entity_id\`));`);
    this.addSql(`create index \`literal_products_literal_entity_id_index\` on \`literal_products\` (\`literal_entity_id\`);`);
    this.addSql(`create index \`literal_products_product_entity_id_index\` on \`literal_products\` (\`product_entity_id\`);`);

    this.addSql(`create table \`Memory\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`literal\` text not null, \`driver\` text check (\`driver\` in ('BAYESIAN', 'BOOLEAN', 'AGENTIC')) not null default 'BAYESIAN', \`type\` text check (\`type\` in ('INDIVIDUAL')) not null default 'INDIVIDUAL', \`status\` text check (\`status\` in ('UNTOUCHED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED')) not null default 'UNKNOWN', \`state\` json not null, \`history\` json not null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, \`lastAt\` datetime not null, constraint \`Memory_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_literal_foreign\` foreign key(\`literal\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Memory_user_index\` on \`Memory\` (\`user\`);`);
    this.addSql(`create index \`Memory_literal_index\` on \`Memory\` (\`literal\`);`);

    this.addSql(`create table \`Play\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`literal\` text null, \`symbol\` text null, \`product\` text not null, \`producer\` text not null, \`commissioner\` text not null, \`memory\` text not null, \`signal\` json not null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, constraint \`Play_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Play_literal_foreign\` foreign key(\`literal\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, constraint \`Play_symbol_foreign\` foreign key(\`symbol\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`Play_product_foreign\` foreign key(\`product\`) references \`Product\`(\`id\`) on update cascade, constraint \`Play_producer_foreign\` foreign key(\`producer\`) references \`Mode\`(\`id\`) on update cascade, constraint \`Play_commissioner_foreign\` foreign key(\`commissioner\`) references \`Mode\`(\`id\`) on update cascade, constraint \`Play_memory_foreign\` foreign key(\`memory\`) references \`Memory\`(\`id\`) on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Play_user_index\` on \`Play\` (\`user\`);`);
    this.addSql(`create index \`Play_literal_index\` on \`Play\` (\`literal\`);`);
    this.addSql(`create index \`Play_symbol_index\` on \`Play\` (\`symbol\`);`);
    this.addSql(`create index \`Play_product_index\` on \`Play\` (\`product\`);`);
    this.addSql(`create index \`Play_producer_index\` on \`Play\` (\`producer\`);`);
    this.addSql(`create index \`Play_commissioner_index\` on \`Play\` (\`commissioner\`);`);
    this.addSql(`create index \`Play_memory_index\` on \`Play\` (\`memory\`);`);

    this.addSql(`create table \`Valence\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`type\` text check (\`type\` in ('SELFEVIDENT', 'APPLICATIVE')) not null default 'SELFEVIDENT', \`traits\` text not null default '', \`name\` text null, \`description\` text null, \`data\` json not null default [object Object], \`docs\` text null, \`mode\` text not null, constraint \`Valence_mode_foreign\` foreign key(\`mode\`) references \`Mode\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Valence_mode_index\` on \`Valence\` (\`mode\`);`);
    this.addSql(`create unique index \`Valence_slug_mode_unique\` on \`Valence\` (\`slug\`, \`mode\`);`);
  }

}
