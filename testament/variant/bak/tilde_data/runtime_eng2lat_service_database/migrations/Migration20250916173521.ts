import { Migration } from '@mikro-orm/migrations';

export class Migration20250916173521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Symbol\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`traits\` text not null default "[]", \`data\` json not null, \`ancestor\` text null, constraint \`Symbol_ancestor_foreign\` foreign key(\`ancestor\`) references \`Symbol\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Symbol_ancestor_index\` on \`Symbol\` (\`ancestor\`);`);
    this.addSql(`create unique index \`Symbol_slug_unique\` on \`Symbol\` (\`slug\`);`);

    this.addSql(`create table \`Unit\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`slug\` text not null default '', \`name\` text null, \`description\` text null, \`annotation\` json not null, \`data\` json not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`Unit_slug_unique\` on \`Unit\` (\`slug\`);`);

    this.addSql(`create table \`_SymbolToUnit\` (\`symbol_entity_id\` text not null, \`unit_entity_id\` text not null, constraint \`_SymbolToUnit_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`_SymbolToUnit_unit_entity_id_foreign\` foreign key(\`unit_entity_id\`) references \`Unit\`(\`id\`) on delete cascade on update cascade, primary key (\`symbol_entity_id\`, \`unit_entity_id\`));`);
    this.addSql(`create index \`_SymbolToUnit_symbol_entity_id_index\` on \`_SymbolToUnit\` (\`symbol_entity_id\`);`);
    this.addSql(`create index \`_SymbolToUnit_unit_entity_id_index\` on \`_SymbolToUnit\` (\`unit_entity_id\`);`);

    this.addSql(`create table \`User\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`roles\` json not null default ["USER"], \`config\` json not null, primary key (\`id\`));`);

    this.addSql(`create table \`Memory\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user\` text not null, \`unit\` text null, \`symbol\` text null, \`driver\` text check (\`driver\` in ('BAYESIAN', 'BOOLEAN', 'AGENTIC')) not null default 'BAYESIAN', \`type\` text check (\`type\` in ('INDIVIDUAL', 'RELATIONAL')) not null default 'INDIVIDUAL', \`status\` text check (\`status\` in ('UNTOUCHED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED')) not null default 'UNKNOWN', \`state\` json not null, \`history\` json not null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, \`lastAt\` datetime not null, constraint \`Memory_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_unit_foreign\` foreign key(\`unit\`) references \`Unit\`(\`id\`) on delete cascade on update cascade, constraint \`Memory_symbol_foreign\` foreign key(\`symbol\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Memory_user_index\` on \`Memory\` (\`user\`);`);
    this.addSql(`create index \`Memory_unit_index\` on \`Memory\` (\`unit\`);`);
    this.addSql(`create index \`Memory_symbol_index\` on \`Memory\` (\`symbol\`);`);

    this.addSql(`create table \`Intent\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user\` text not null, \`traits\` json not null default [], \`data\` json not null, constraint \`Intent_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Intent_user_index\` on \`Intent\` (\`user\`);`);

    this.addSql(`create table \`Session\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user\` text not null, \`traits\` json not null default "[]", \`intent\` text not null, \`state\` json not null, \`history\` json not null, constraint \`Session_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Session_intent_foreign\` foreign key(\`intent\`) references \`Intent\`(\`id\`) on delete cascade on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Session_user_index\` on \`Session\` (\`user\`);`);
    this.addSql(`create index \`Session_intent_index\` on \`Session\` (\`intent\`);`);

    this.addSql(`create table \`Exercise\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user\` text not null, \`status\` text check (\`status\` in ('PENDING', 'PROCESSING', 'DONE', 'ERROR')) not null default 'PENDING', \`index\` integer not null default 0, \`instruction\` json not null, \`producer\` json not null, \`session\` text null, \`game\` text null, \`tactic\` text null, \`strategy\` text null, constraint \`Exercise_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Exercise_session_foreign\` foreign key(\`session\`) references \`Session\`(\`id\`) on delete set null on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Exercise_user_index\` on \`Exercise\` (\`user\`);`);
    this.addSql(`create index \`Exercise_session_index\` on \`Exercise\` (\`session\`);`);

    this.addSql(`create table \`Play\` (\`id\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`user\` text not null, \`unit\` text null, \`symbol\` text null, \`game\` text null, \`tactic\` text null, \`strategy\` text null, \`memory\` text not null, \`exercise\` text not null, \`signal\` json not null, \`debrief\` json null, \`nextIn\` integer not null default 0.0, \`nextAt\` datetime not null, constraint \`Play_user_foreign\` foreign key(\`user\`) references \`User\`(\`id\`) on delete cascade on update cascade, constraint \`Play_unit_foreign\` foreign key(\`unit\`) references \`Unit\`(\`id\`) on delete cascade on update cascade, constraint \`Play_symbol_foreign\` foreign key(\`symbol\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, constraint \`Play_memory_foreign\` foreign key(\`memory\`) references \`Memory\`(\`id\`) on update cascade, constraint \`Play_exercise_foreign\` foreign key(\`exercise\`) references \`Exercise\`(\`id\`) on update cascade, primary key (\`id\`));`);
    this.addSql(`create index \`Play_user_index\` on \`Play\` (\`user\`);`);
    this.addSql(`create index \`Play_unit_index\` on \`Play\` (\`unit\`);`);
    this.addSql(`create index \`Play_symbol_index\` on \`Play\` (\`symbol\`);`);
    this.addSql(`create index \`Play_memory_index\` on \`Play\` (\`memory\`);`);
    this.addSql(`create index \`Play_exercise_index\` on \`Play\` (\`exercise\`);`);

    this.addSql(`create table \`_ExerciseToUnit\` (\`exercise_entity_id\` text not null, \`unit_entity_id\` text not null, constraint \`_ExerciseToUnit_exercise_entity_id_foreign\` foreign key(\`exercise_entity_id\`) references \`Exercise\`(\`id\`) on delete cascade on update cascade, constraint \`_ExerciseToUnit_unit_entity_id_foreign\` foreign key(\`unit_entity_id\`) references \`Unit\`(\`id\`) on delete cascade on update cascade, primary key (\`exercise_entity_id\`, \`unit_entity_id\`));`);
    this.addSql(`create index \`_ExerciseToUnit_exercise_entity_id_index\` on \`_ExerciseToUnit\` (\`exercise_entity_id\`);`);
    this.addSql(`create index \`_ExerciseToUnit_unit_entity_id_index\` on \`_ExerciseToUnit\` (\`unit_entity_id\`);`);

    this.addSql(`create table \`_ExerciseToSymbol\` (\`exercise_entity_id\` text not null, \`symbol_entity_id\` text not null, constraint \`_ExerciseToSymbol_exercise_entity_id_foreign\` foreign key(\`exercise_entity_id\`) references \`Exercise\`(\`id\`) on delete cascade on update cascade, constraint \`_ExerciseToSymbol_symbol_entity_id_foreign\` foreign key(\`symbol_entity_id\`) references \`Symbol\`(\`id\`) on delete cascade on update cascade, primary key (\`exercise_entity_id\`, \`symbol_entity_id\`));`);
    this.addSql(`create index \`_ExerciseToSymbol_exercise_entity_id_index\` on \`_ExerciseToSymbol\` (\`exercise_entity_id\`);`);
    this.addSql(`create index \`_ExerciseToSymbol_symbol_entity_id_index\` on \`_ExerciseToSymbol\` (\`symbol_entity_id\`);`);
  }

}
