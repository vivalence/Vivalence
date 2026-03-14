import { Migration } from "@mikro-orm/migrations";

export class Migration20260304043710 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table \`Literal\` add column \`rank\` integer null;`);
  }
}
