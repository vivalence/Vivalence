const DATE = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])";
const TIME = "(?:[01]\\d|2[0-3]):[0-5]\\d:(?:[0-5]\\d|60)(?:\\.\\d+)?";
const OFFSET = "(?:[+-](?:[01]\\d|2[0-3]):[0-5]\\d)";
const ZONEPART = "[A-Za-z_.][A-Za-z0-9_.+\\-]*";
const ZONE = `\\[!?(?:${ZONEPART}(?:/${ZONEPART})*|${OFFSET})\\]`;
const TAGS = "(?:\\[!?[a-z_][a-z0-9_\\-]*=[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\\])*";

export const PLAIN_DATETIME = `^${DATE}T${TIME}${TAGS}$`;
export const ZONED = `^${DATE}T${TIME}(?:Z|${OFFSET})${ZONE}${TAGS}$`;

export const TITLES = {
  datetime: "RFC 9557 date-time without an offset",
  zoned: "RFC 9557 date-time with an offset and a zone",
};
