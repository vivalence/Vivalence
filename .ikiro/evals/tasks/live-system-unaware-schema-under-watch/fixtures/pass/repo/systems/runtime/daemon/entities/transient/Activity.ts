import { VirtualEntity } from "../base/VirtualEntity.ts";

export class ActivityEntity extends VirtualEntity {
  status = "IDLE";
  steps: unknown[] = [];
  note?: string;
}
