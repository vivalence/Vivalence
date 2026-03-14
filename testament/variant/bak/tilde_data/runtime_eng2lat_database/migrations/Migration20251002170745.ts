import { Migration } from '@mikro-orm/migrations';

export class Migration20251002170745 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`Module\` add column \`data\` json not null default [object Object];`);

    this.addSql(`alter table \`Topography\` add column \`data\` json not null default [object Object];`);

    this.addSql(`alter table \`Valence\` add column \`data\` json not null default [object Object];`);
  }

}
