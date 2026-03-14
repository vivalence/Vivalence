import { Migration } from '@mikro-orm/migrations';

export class Migration20251001192658 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Dimension\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default "[]", \`data\` json not null default [object Object], \`ancestor\` text null, constraint \`Dimension_ancestor_foreign\` foreign key(\`ancestor\`) references \`Dimension\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Dimension_ancestor_index\` on \`Dimension\` (\`ancestor\`);`);
    this.addSql(`create unique index \`Dimension_slug_unique\` on \`Dimension\` (\`slug\`);`);

    this.addSql(`create table \`Literal\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`annotation\` json not null, \`data\` json not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`Literal_slug_unique\` on \`Literal\` (\`slug\`);`);

    this.addSql(`create table \`Module\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`type\` text not null, \`traits\` text not null default "[]", primary key (\`id\`));`);
    this.addSql(`create unique index \`Module_slug_type_unique\` on \`Module\` (\`slug\`, \`type\`);`);

    this.addSql(`create table \`Symbol\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default "[]", \`data\` json not null, \`ancestor\` text null, constraint \`Symbol_ancestor_foreign\` foreign key(\`ancestor\`) references \`Symbol\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Symbol_ancestor_index\` on \`Symbol\` (\`ancestor\`);`);
    this.addSql(`create unique index \`Symbol_slug_unique\` on \`Symbol\` (\`slug\`);`);

    this.addSql(`create table \`_SymbolToLiteral\` (\`symbol_entity_id\` text not null, \`literal_entity_id\` text not null, constraint \`_SymbolToLiteral_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`_SymbolToLiteral_literal_entity_id_foreign\` foreign key(\`literal_entity_id\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, primary key (\`symbol_entity_id\`, \`literal_entity_id\`));`);
    this.addSql(`create index \`_SymbolToLiteral_symbol_entity_id_index\` on \`_SymbolToLiteral\` (\`symbol_entity_id\`);`);
    this.addSql(`create index \`_SymbolToLiteral_literal_entity_id_index\` on \`_SymbolToLiteral\` (\`literal_entity_id\`);`);

    this.addSql(`create table \`User\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`roles\` json not null default ["USER"], \`config\` json not null, primary key (\`id\`));`);

    this.addSql(`create table \`Memory\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`literal\` text null, \`symbol\` text null, \`driver\` text check (\`driver\` in ('BAYESIAN', 'BOOLEAN', 'AGENTIC')) not null default 'BAYESIAN', \`type\` text check (\`type\` in ('INDIVIDUAL', 'RELATIONAL')) not null default 'INDIVIDUAL', \`status\` text check (\`status\` in ('UNTOUCHED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED')) not null default 'UNKNOWN', \`state\` json not null, \`history\` json not null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, \`lastAt\` datetime not null, constraint \`Memory_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_literal_foreign\` foreign key(\`literal\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_symbol_foreign\` foreign key(\`symbol\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Memory_user_index\` on \`Memory\` (\`user\`);`);
    this.addSql(`create index \`Memory_literal_index\` on \`Memory\` (\`literal\`);`);
    this.addSql(`create index \`Memory_symbol_index\` on \`Memory\` (\`symbol\`);`);

    this.addSql(`create table \`Intent\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`traits\` json not null default [], \`data\` json not null, constraint \`Intent_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Intent_user_index\` on \`Intent\` (\`user\`);`);

    this.addSql(`create table \`Session\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`traits\` json not null default "[]", \`intent\` text not null, \`state\` json not null, \`history\` json not null, constraint \`Session_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Session_intent_foreign\` foreign key(\`intent\`) references \`Intent\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Session_user_index\` on \`Session\` (\`user\`);`);
    this.addSql(`create index \`Session_intent_index\` on \`Session\` (\`intent\`);`);

    this.addSql(`create table \`Exercise\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`status\` text check (\`status\` in ('PENDING', 'PROCESSING', 'DONE', 'ERROR')) not null default 'PENDING', \`index\` integer not null default 0, \`instruction\` json not null, \`producer\` json not null, \`session\` text null, \`game\` text null, \`tactic\` text null, \`strategy\` text null, constraint \`Exercise_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Exercise_session_foreign\` foreign key(\`session\`) references \`Session\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Exercise_user_index\` on \`Exercise\` (\`user\`);`);
    this.addSql(`create index \`Exercise_session_index\` on \`Exercise\` (\`session\`);`);

    this.addSql(`create table \`Play\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`user\` text not null, \`literal\` text null, \`symbol\` text null, \`game\` text null, \`tactic\` text null, \`strategy\` text null, \`memory\` text not null, \`exercise\` text not null, \`signal\` json not null, \`debrief\` json null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, constraint \`Play_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Play_literal_foreign\` foreign key(\`literal\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, constraint \`Play_symbol_foreign\` foreign key(\`symbol\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`Play_memory_foreign\` foreign key(\`memory\`) references \`Memory\`(\`id\`) on update cascade, constraint \`Play_exercise_foreign\` foreign key(\`exercise\`) references \`Exercise\`(\`id\`) on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Play_user_index\` on \`Play\` (\`user\`);`);
    this.addSql(`create index \`Play_literal_index\` on \`Play\` (\`literal\`);`);
    this.addSql(`create index \`Play_symbol_index\` on \`Play\` (\`symbol\`);`);
    this.addSql(`create index \`Play_memory_index\` on \`Play\` (\`memory\`);`);
    this.addSql(`create index \`Play_exercise_index\` on \`Play\` (\`exercise\`);`);

    this.addSql(`create table \`_ExerciseToSymbol\` (\`exercise_entity_id\` text not null, \`symbol_entity_id\` text not null, constraint \`_ExerciseToSymbol_exercise_entity_id_foreign\` foreign key(\`exercise_entity_id\`) references \`Exercise\`(\`id\`) on delete cascade on update cascade, constraint \`_ExerciseToSymbol_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, primary key (\`exercise_entity_id\`, \`symbol_entity_id\`));`);
    this.addSql(`create index \`_ExerciseToSymbol_exercise_entity_id_index\` on \`_ExerciseToSymbol\` (\`exercise_entity_id\`);`);
    this.addSql(`create index \`_ExerciseToSymbol_symbol_entity_id_index\` on \`_ExerciseToSymbol\` (\`symbol_entity_id\`);`);

    this.addSql(`create table \`_ExerciseToLiteral\` (\`exercise_entity_id\` text not null, \`literal_entity_id\` text not null, constraint \`_ExerciseToLiteral_exercise_entity_id_foreign\` foreign key(\`exercise_entity_id\`) references \`Exercise\`(\`id\`) on delete cascade on update cascade, constraint \`_ExerciseToLiteral_literal_entity_id_foreign\` foreign key(\`literal_entity_id\`) references \`Literal\`(\`id\`) on delete cascade on update cascade, primary key (\`exercise_entity_id\`, \`literal_entity_id\`));`);
    this.addSql(`create index \`_ExerciseToLiteral_exercise_entity_id_index\` on \`_ExerciseToLiteral\` (\`exercise_entity_id\`);`);
    this.addSql(`create index \`_ExerciseToLiteral_literal_entity_id_index\` on \`_ExerciseToLiteral\` (\`literal_entity_id\`);`);

    this.addSql(`create table \`Valence\` (\`id\` text not null, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime not null default CURRENT_TIMESTAMP, \`slug\` text not null, \`docs\` text not null, \`resolve\` json not null default "{}", \`module\` text null, constraint \`Valence_module_foreign\` foreign key(\`module\`) references \`Module\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Valence_module_index\` on \`Valence\` (\`module\`);`);
    this.addSql(`create unique index \`Valence_slug_module_unique\` on \`Valence\` (\`slug\`, \`module\`);`);
  }

}
