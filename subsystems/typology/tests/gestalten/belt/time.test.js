import { specimen, time } from "@vivalence/typology";

specimen.describe("time", () => {
  specimen.it("a moment ages through every unit", () => {
    const now = new Date("2026-06-22T12:00:00.000Z");
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const ago = (milliseconds) => new Date(now.getTime() - milliseconds);

    specimen.expect(time.since(now, now)).toBe("now");
    specimen.expect(time.since(ago(30 * SECOND), now)).toBe("now");
    specimen.expect(time.since(ago(5 * MINUTE), now)).toBe("5m");
    specimen.expect(time.since(ago(59 * MINUTE), now)).toBe("59m");
    specimen.expect(time.since(ago(90 * MINUTE), now)).toBe("1h");
    specimen.expect(time.since(ago(5 * HOUR), now)).toBe("5h");
    specimen.expect(time.since(ago(26 * HOUR), now)).toBe("1d");
    specimen.expect(time.since(ago(3 * DAY), now)).toBe("3d");
    specimen.expect(time.since(ago(10 * DAY), now)).toBe("1w");
    specimen.expect(time.since(ago(40 * DAY), now)).toBe("1mo");
    specimen.expect(time.since(ago(400 * DAY), now)).toBe("1y");

    specimen.expect(time.since(new Date(now.getTime() + MINUTE), now)).toBe("now");
    specimen.expect(time.since(null, now)).toBe("");
    specimen.expect(time.since(ago(2 * MINUTE).toISOString(), now)).toBe("2m");
  });

  specimen.it("a day buckets itself against today", () => {
    const now = new Date("2026-06-22T12:00:00.000Z");
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    const ago = (milliseconds) => new Date(now.getTime() - milliseconds);

    specimen.expect(time.bucket(ago(3 * HOUR), now)).toBe("today");
    specimen.expect(time.bucket(ago(2 * DAY), now)).toBe("earlier");
    specimen.expect(time.sameDay(ago(1 * HOUR), now)).toBe(true);
    specimen.expect(time.sameDay(ago(2 * DAY), now)).toBe(false);
  });
});
