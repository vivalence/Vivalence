<!-- writer: agent · folded from auto-memory 09-23 (m69 2.4) · reference, unbudgeted -->
# mail · chat · calendar provider entities — wire shapes

Fetched from the canonical docs (not recalled) for m53 T2/T6. Verbatim field names.

**The law:** every family has **one RFC identity, N provider identities, and one provider cursor**. Chat is the exception — no RFC identity at all, so a chat slug must stay provider-scoped.

| family | RFC identity | provider ids | cursor |
|---|---|---|---|
| email | `Message-ID` | IMAP `UID` · gmail `id`+`threadId` · graph `id`+`conversationId` | `UIDVALIDITY`+`UIDNEXT`+`MODSEQ` · `historyId` · `@odata.deltaLink` |
| chat | — | `wamid.…` · `chat.id`+`message_id` · `channel`+`ts` | `update_id` offset · webhook · cursor |
| calendar | `iCalUID` / `UID` | gmail `id` · graph `id`+`changeKey` | `syncToken` · `deltaLink` · CalDAV sync-token/CTag |

**IMAP/SMTP (RFC 5322/3501):** `ENVELOPE(date subject from sender reply-to to cc bcc in-reply-to message-id)` · `BODYSTRUCTURE` · `FLAGS \Seen \Answered \Flagged \Deleted \Draft` + keywords · `UID` · `INTERNALDATE` · `RFC822.SIZE` · `MODSEQ`.

**Gmail** `users.messages.get`: `Message {id, threadId, labelIds[], snippet, historyId, internalDate, payload, sizeEstimate, raw}` · `MessagePart {partId, mimeType, filename, headers[{name,value}], body, parts[]}` · `MessagePartBody {attachmentId, size, data}` (base64url, NOT decoded).

**Graph** `message`: `id changeKey conversationId conversationIndex internetMessageId internetMessageHeaders[] subject body{contentType,content} bodyPreview uniqueBody from sender toRecipients[] ccRecipients[] bccRecipients[] replyTo[] receivedDateTime sentDateTime createdDateTime lastModifiedDateTime isRead isDraft hasAttachments importance inferenceClassification categories[] flag parentFolderId webLink attachments[]`.

**Proton: NO public API.** The Bridge is a local proxy — IMAP `127.0.0.1:1143`, SMTP `127.0.0.1:1025`, STARTTLS, bridge-generated password. So a `proton/*` service is a PRESET over the shared IMAP/SMTP belt with **zero** vendor faculties; gmail and outlook earn faculties (calendar, contacts, labels, push), proton does not. ([proton.me/support/why-you-need-bridge](https://proton.me/support/why-you-need-bridge))

**Telegram** `Update {update_id, message|edited_message|channel_post|…}` → `Message {message_id, message_thread_id, from:User, sender_chat, date, chat:Chat, reply_to_message, quote, via_bot, edit_date, media_group_id, text, entities[], caption, photo[], document, audio, voice, video, sticker, contact, location, poll, …}`; `Chat {id, type, title, username, first_name, last_name, is_forum}`; media = `file_id` → `getFile` → temporary `file_path`.

**WhatsApp Cloud** webhook envelope: `{object, entry[{id, changes[{value:{messaging_product, metadata{display_phone_number, phone_number_id}, contacts[{profile{name}, wa_id}], messages[{from, id, timestamp, type, context{from,id}, text{body} | image{caption,mime_type,sha256,id} | document{caption,filename,mime_type,sha256,id} | audio{mime_type,sha256,id,voice} | location{latitude,longitude,name,address} | reaction{message_id,emoji}}], statuses[{id, status, timestamp, recipient_id, conversation{id,origin{type}}, pricing{…}}]}}]}]}`. Reply = `context.id`. Media = id → `GET /{media-id}` → expiring URL.

**Slack** message: `{type, subtype, channel, channel_type, user, text, ts, event_ts, thread_ts, team, blocks[], attachments[], files[], bot_id, app_id, client_msg_id, edited{user,ts}, hidden, deleted_ts, is_starred, pinned_to[], reactions[{name,count,users[]}]}`. `ts` IS the id, the sort key and (as `thread_ts`) the thread key; `subtype` carries a lot (`channel_join`, `message_changed`, `message_deleted`, `bot_message`, `file_share`).

**Google Calendar** `Event`: `{kind, etag, id, iCalUID, sequence, status, htmlLink, created, updated, summary, description, location, colorId, creator, organizer, start/end{date|dateTime,timeZone}, endTimeUnspecified, recurrence:["RRULE:…"], recurringEventId, originalStartTime, transparency, visibility, attendees[{email,displayName,optional,responseStatus,comment}], conferenceData, reminders{useDefault,overrides[]}, extendedProperties{private,shared}, eventType, attachments[]}`.

**Graph** `event`: `{id, changeKey, iCalUId, seriesMasterId, type ∈ singleInstance|occurrence|exception|seriesMaster, subject, body, bodyPreview, start/end:dateTimeTimeZone, isAllDay, originalStart, recurrence:patternedRecurrence{pattern{type,interval,dayOfMonth,daysOfWeek,index,month},range{…}}, cancelledOccurrences[], attendees[{type,status{response,time},emailAddress}], organizer, location, locations[], isOnlineMeeting, onlineMeeting{joinUrl}, responseStatus, showAs, sensitivity, importance, reminderMinutesBeforeStart, webLink}`.

**CalDAV / RFC 5545** `VEVENT`: `UID DTSTAMP DTSTART[;VALUE=DATE][;TZID=] DTEND|DURATION SUMMARY DESCRIPTION LOCATION RRULE RDATE EXDATE RECURRENCE-ID SEQUENCE STATUS TRANSP CLASS CATEGORIES ATTACH ORGANIZER ATTENDEE;PARTSTAT=;ROLE=;RSVP=;CUTYPE= VALARM`. Transport: `REPORT calendar-query`, ETag per resource, sync-token per collection.

**Six design consequences** (all written into `.ikiro/quests/done/m53.v4-mail+calendar.org`; the live column map sits in `.ikiro/quests/m53-vcompany.org ** providers`):
1. `external:{id}` is too thin — needs `{account, id, thread, etag}`; `external.thread` is the VENDOR's grouping, never the threading edge.
2. the sync cursor is per-ACCOUNT — not a literal, not a static; it has no home yet.
3. flags are a SET (`labelIds[]` · IMAP keywords · `categories[]`) → symbols, not trait fields.
4. bodies differ at the wire (base64url MIME parts · rendered HTML · BODYSTRUCTURE walk) — `{text, html}` is the normalizer's product.
5. media is TWO-STEP with expiring URLs everywhere → download at arrival into freight, never lazily.
6. recurrence: Google + CalDAV speak RRULE text, Graph speaks structured `patternedRecurrence` — store the RRULE, translate Graph in its own service.

Related: `project_m53_v4_mail_calendar` · `project_m53_vcompany`.
