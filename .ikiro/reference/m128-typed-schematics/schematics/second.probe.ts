import * as m0 from "../../../../subsystems/typology/schematics/scalars/index.js";
import * as m1 from "../../../../subsystems/typology/schematics/scalars/mime.js";
import * as m2 from "../../../../subsystems/typology/schematics/scalars/temporal.js";
import * as m3 from "../../../../subsystems/typology/schematics/scalars/url.js";
import * as m4 from "../../../../subsystems/typology/schematics/primitives/auth.js";
import * as m5 from "../../../../subsystems/typology/schematics/primitives/connection.js";
import * as m6 from "../../../../subsystems/typology/schematics/primitives/contexts.js";
import * as m7 from "../../../../subsystems/typology/schematics/primitives/controller.js";
import * as m8 from "../../../../subsystems/typology/schematics/primitives/conversation.js";
import * as m9 from "../../../../subsystems/typology/schematics/primitives/credentials.js";
import * as m10 from "../../../../subsystems/typology/schematics/primitives/environment.js";
import * as m11 from "../../../../subsystems/typology/schematics/primitives/hallucination.js";
import * as m12 from "../../../../subsystems/typology/schematics/primitives/harness.js";
import * as m13 from "../../../../subsystems/typology/schematics/primitives/home.js";
import * as m14 from "../../../../subsystems/typology/schematics/primitives/instance.ts";
import * as m15 from "../../../../subsystems/typology/schematics/primitives/kernel.js";
import * as m16 from "../../../../subsystems/typology/schematics/primitives/label.js";
import * as m17 from "../../../../subsystems/typology/schematics/primitives/manifest.js";
import * as m18 from "../../../../subsystems/typology/schematics/primitives/signatures.js";
import * as m19 from "../../../../subsystems/typology/schematics/primitives/theme.js";
import * as m20 from "../../../../subsystems/typology/schematics/primitives/track.js";
import * as m21 from "../../../../subsystems/typology/schematics/entities/activity.js";
import * as m22 from "../../../../subsystems/typology/schematics/entities/base.js";
import * as m23 from "../../../../subsystems/typology/schematics/entities/buffer.js";
import * as m24 from "../../../../subsystems/typology/schematics/entities/daemon.js";
import * as m25 from "../../../../subsystems/typology/schematics/entities/file.js";
import * as m26 from "../../../../subsystems/typology/schematics/entities/intent.js";
import * as m27 from "../../../../subsystems/typology/schematics/entities/literal.js";
import * as m28 from "../../../../subsystems/typology/schematics/entities/mode.js";
import * as m29 from "../../../../subsystems/typology/schematics/entities/note.js";
import * as m30 from "../../../../subsystems/typology/schematics/entities/surface.js";
import * as m31 from "../../../../subsystems/typology/schematics/entities/symbol.js";
import * as m32 from "../../../../subsystems/typology/schematics/entities/terminal.js";
import * as m33 from "../../../../subsystems/typology/schematics/entities/thread.js";
import * as m34 from "../../../../subsystems/typology/schematics/entities/turn.js";
import * as m35 from "../../../../subsystems/typology/schematics/entities/user.js";
import * as m36 from "../../../../subsystems/typology/schematics/prototypes/bundle.js";
import * as m37 from "../../../../subsystems/typology/schematics/prototypes/index.js";
import * as m38 from "../../../../subsystems/typology/schematics/prototypes/signatures.js";
import * as m39 from "../../../../subsystems/typology/schematics/prototypes/yield.js";
import * as m40 from "../../../../subsystems/typology/schematics/traits/aimed.js";
import * as m41 from "../../../../subsystems/typology/schematics/traits/conversational.js";
import * as m42 from "../../../../subsystems/typology/schematics/traits/docked.js";
import * as m43 from "../../../../subsystems/typology/schematics/traits/harnessed.js";
import * as m44 from "../../../../subsystems/typology/schematics/traits/index.js";
import * as m45 from "../../../../subsystems/typology/schematics/traits/masked.js";
import * as m46 from "../../../../subsystems/typology/schematics/traits/overwrite.js";
import * as m47 from "../../../../subsystems/typology/schematics/traits/primed.js";
import * as m48 from "../../../../subsystems/typology/schematics/traits/queueing.js";
import * as m49 from "../../../../subsystems/typology/schematics/traits/rendered.js";
import * as m50 from "../../../../subsystems/typology/schematics/traits/themed.js";
import * as m51 from "../../../../subsystems/typology/schematics/traits/tooled.js";
import type { Static, StaticDecode, TSchema } from "typebox";
type IsAny<T> = 0 extends 1 & T ? true : false;
type Inside<T, Depth extends 0[] = []> = IsAny<T> extends true ? true
  : Depth["length"] extends 8 ? false
  : T extends (...args: never[]) => unknown ? false
  : T extends readonly (infer Item)[] ? Inside<Item, [...Depth, 0]>
  : T extends object ? (true extends { [Key in keyof T]: Inside<T[Key], [...Depth, 0]> }[keyof T] ? true : false)
  : false;
type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
type Where<T, At extends string = "", Depth extends 0[] = []> = IsAny<T> extends true ? `${At} any`
  : IsUnknown<T> extends true ? `${At} unknown`
  : Depth["length"] extends 8 ? never
  : T extends (...args: never[]) => unknown ? never
  : T extends readonly (infer Item)[] ? Where<Item, `${At}[]`, [...Depth, 0]>
  : T extends object
    ? { [Key in keyof T]-?: Where<Exclude<T[Key], undefined>, `${At}.${Key & string}`, [...Depth, 0]> }[keyof T]
  : never;
type Shown<T> = [T] extends [never] ? "none" : T;
type Verdict<T> = IsAny<T> extends true ? "any"
  : T extends (...args: never[]) => unknown ? "function"
  : T extends { cast: unknown; faults: unknown }
    ? (T extends TSchema
      ? (IsAny<Static<T>> extends true ? "holds any"
        : unknown extends Static<T> ? "holds unknown"
        : [Where<Static<T>>] extends [never] ? (Static<T> extends StaticDecode<T> ? "typed" : "typed, decodes")
        : Where<Static<T>>)
      : "schematic, no schema")
  : Inside<T> extends true ? "value, any inside"
  : "value";

export const r0: Verdict<ReturnType<typeof m1.type>> = "?";
export const r1: Verdict<ReturnType<typeof m1.code>> = "?";
export const r2: Verdict<ReturnType<typeof m1.viva>> = "?";
export const r3: Verdict<ReturnType<typeof m1.of>> = "?";
export const r4: Verdict<ReturnType<typeof m1.extension>> = "?";
export const r5: Verdict<ReturnType<typeof m3.url>> = "?";
export const r6: Verdict<ReturnType<typeof m6.optional>> = "?";
export const r7: Verdict<ReturnType<typeof m6.of>> = "?";
export const r8: Verdict<ReturnType<typeof m10.environment>> = "?";
export const r9: Shown<Where<Static<typeof m11.Request>["system"], ".system">> = "?";
export const r10: Shown<Where<Static<typeof m11.Request>["turns"], ".turns">> = "?";
export const r11: Shown<Where<Static<typeof m11.Request>["tools"], ".tools">> = "?";
export const r12: Shown<Where<Static<typeof m11.Request>["settings"], ".settings">> = "?";
export const r13: Shown<Where<Static<typeof m11.Request>["output"], ".output">> = "?";
export const r14: Shown<Where<Static<typeof m11.Request>["cache"], ".cache">> = "?";
export const r15: Shown<Where<Static<typeof m11.Response>["condition"], ".condition">> = "?";
export const r16: Shown<Where<Static<typeof m11.Response>["product"], ".product">> = "?";
export const r17: Shown<Where<Static<typeof m11.Response>["turns"], ".turns">> = "?";
export const r18: Shown<Where<Static<typeof m11.Response>["meta"], ".meta">> = "?";
export const r19: Shown<Where<Static<typeof m14.DaemonMask>["manifest"], ".manifest">> = "?";
export const r20: Shown<Where<Static<typeof m14.DaemonMask>["mountpoint"], ".mountpoint">> = "?";
export const r21: Shown<Where<Static<typeof m14.DaemonMask>["statics"], ".statics">> = "?";
export const r22: Shown<Where<Static<typeof m14.DaemonMask>["reference"], ".reference">> = "?";
export const r23: Shown<Where<Static<typeof m14.DaemonMask>["url"], ".url">> = "?";
export const r24: Shown<Where<Static<typeof m14.DaemonMask>["attach"], ".attach">> = "?";
export const r25: Shown<Where<Static<typeof m14.DaemonMask>["modes"], ".modes">> = "?";
export const r26: Shown<Where<Static<typeof m14.DaemonMask>["consume"], ".consume">> = "?";
export const r27: Shown<Where<Static<typeof m14.DaemonMask>["hallucinators"], ".hallucinators">> = "?";
export const r28: Shown<Where<Static<typeof m14.InstanceMask>["manifest"], ".manifest">> = "?";
export const r29: Shown<Where<Static<typeof m14.InstanceMask>["environment"], ".environment">> = "?";
export const r30: Shown<Where<Static<typeof m14.InstanceMask>["runtime"], ".runtime">> = "?";
export const r31: Shown<Where<Static<typeof m14.InstanceMask>["lighthouse"], ".lighthouse">> = "?";
export const r32: Shown<Where<Static<typeof m14.InstanceMask>["clients"], ".clients">> = "?";
export const r33: Shown<Where<Static<typeof m14.InstanceMask>["datamap"], ".datamap">> = "?";
export const r34: Shown<Where<Static<typeof m14.InstanceMask>["services"], ".services">> = "?";
export const r35: Shown<Where<Static<typeof m14.InstanceMask>["daemons"], ".daemons">> = "?";
export const r36: Shown<Where<Static<typeof m14.InstanceMask>["telemetry"], ".telemetry">> = "?";
export const r37: Verdict<ReturnType<typeof m19.leaf>> = "?";
export const r38: Verdict<ReturnType<typeof m38.Signature>> = "?";
export const r39: Verdict<ReturnType<typeof m38.Signal>> = "?";
export const r40: Verdict<ReturnType<typeof m38.Path>> = "?";
export const r41: Verdict<ReturnType<typeof m38.FilePath>> = "?";
export const r42: Verdict<ReturnType<typeof m38.Url>> = "?";
export const r43: Verdict<ReturnType<typeof m38.Action>> = "?";
export const r44: Verdict<ReturnType<typeof m38.Pattern>> = "?";
export const r45: Verdict<ReturnType<typeof m46.overwrite>> = "?";
