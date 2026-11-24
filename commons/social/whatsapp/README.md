# @commons/service/whatsapp

One WhatsApp number of Meta's Cloud API. Hosted, the service owns the webhook Meta delivers to.
Consumed by a mode, it yields the messages of the addresses that mode names and sends text back.

The service is transport. It knows an address, never a user or a thread. The mode that consumes it
(`@commons/bot/personal`) owns the turn.

## how a message travels

1. A phone writes to the bot's number.
2. Meta POSTs the delivery to the callback URL, signed with the app secret.
3. `attachment.js` checks the signature over the exact bytes, queues the payload, answers 200.
4. The consuming mode pulls the queue through `provider.messages(signal, addresses)`. A sender
   outside `addresses` is dropped before anything is fetched.
5. The mode writes a Turn and asks its harness. The answer leaves through `provider.send`.

The hook is the same path on every instance:

```
<runtime origin>/attached/process/service/service/whatsapp/webhook
```

It needs no login. A GET with the right verify word answers Meta's challenge, any other GET is 403.
A POST without a valid signature is 403.

## the module

`service.viva.js` exports four things. The runtime reads each for a different job.

| export | file | job |
|---|---|---|
| `manifest` | `service.viva.js` | type `service`, slug `whatsapp`, traits `ATTACHED` · `EXPOSED` |
| `attachment` | `attachment.js` | the routes it serves without login, when hosted |
| `aperture` | `aperture.js` | the routes it serves behind a login, when hosted |
| `provider` | `provider.js` | the API a consuming mode calls |

### hosted: the attachment

`ATTACHED` means the runtime mounts the module's `attachment` vector under
`/attached/process/service/service/<slug>`. Every attached service gets `/status` and
`/manifest`; ours adds `/webhook`, answering by HTTP
method. It reads `secrets.app` and `secrets.verify` off the hosted entry's mask.

```js
// commons/social/whatsapp/attachment.js:36
export const attachment = new Vector().open("/webhook", (ctx) => answer[ctx.request.method](ctx));
```

A module that is consumed and never hosted serves no route: its webhook does not exist.

### consumed: the provider

A mode names the service under `consume`. The runtime calls `provider(service)` with that entry's
mask and hands the result to the mode as `ctx.providers.<key>`, the key being the one under
`consume`.

| member | signature | effect |
|---|---|---|
| `messages` | `async *(signal, addresses)` | yields one `Message` per delivery from a sender in `addresses`, until `signal` aborts |
| `send` | `(address, text)` | sends text, in pieces of 4096; returns Meta's answers, each with a `wamid` |
| `typing` | `(message)` | marks the heard message read and shows typing dots, about 25 s |
| `quote` | `(text)` | the text as a WhatsApp quote, a string |
| `format` | a string | the markup rules, handed to the model as a system section |

It reads `statics.graph`, `statics.number` and `secrets.token` off the consumed entry's mask.

### what comes out: a Message

`messages` yields the platform-blind shape of `commons/social/schematics.js`. A second platform
yields the same shape, so the mode never learns Meta's.

```js
{
  platform: "whatsapp",
  id: "wamid.HBgN",
  from: "4915100000000",
  name: "Finn",
  at: 1732440000,
  parts: [{ type: "text", text: "oi" }],
}
```

`parts` are typology parts: text, image, audio, video, document. A kind we do not carry, and a
media fetch that failed, is an `alien` part holding Meta's own block. A reply or a reaction adds
`about: { id, act }`, naming the earlier message.

### how a mode uses it

`@commons/bot/personal` pulls at boot, one loop per platform it names:

```js
// commons/social/personal/boot.js:17
(signal) => modeDie.providers[platform].messages(signal, Object.keys(mode.statics.users)),
```

Each `Message` becomes a Turn (`received.js`). Every assistant Turn in a thread a messenger spoke
in is sent back by the mode's twitch:

```js
// commons/social/personal/twitch.js:21
await ctx.providers[platform].send(from, said(turn));
```

The mode never fetches Graph itself and never sees a token.

### the two halves meet in the number

Meta stamps every delivery with the number it was sent to. Each consuming mode's provider registers
its number, with its own queue, when it is built. The hook sorts each delivery into the queue of
the number it names; a delivery for a number no bot here serves is answered 200 and dropped.

```js
// commons/social/whatsapp/provider.js:6
export const numbers = new Map();
```

So the recipe writes each fact once: the hosted entry holds the app (`app` · `verify`), each
consumed entry holds one number (`graph` · `number` · `token`). Who may write to a bot is a second,
separate match, on the sender: the mode's `users`.

### managing Meta: the aperture

`EXPOSED` mounts the module's `aperture` under the runtime, behind a login:
`/runtime/<slug>/service/whatsapp`. Every route speaks to Graph through `graph.js`, with the mask
of the number it is asked about.

| route | input | effect |
|---|---|---|
| `/numbers` | `{}` | returns the phone number ids this instance serves |
| `/state` | `{ number }` | returns Meta's record of a number: its status and its webhook URLs |
| `/token` | `{ number }` | returns Meta's record of a number's Graph token: validity, expiry and scopes |
| `/claim` | `{ number, hook }` | sets the webhook URL Meta delivers a number's messages to |

A number no bot here serves is refused. `/claim` writes the number's own override and leaves the
app's callback alone. Meta calls the hook during the write, so it must already answer.

### what the service does not do

It does not claim its webhook by itself at boot, and it does not touch the app's callback, the
subscribed fields or the account's subscription. It also logs no delivery.

## what Meta holds

Four things live at Meta, each made once in the dashboard at https://developers.facebook.com/apps.

| thing | where in the dashboard | what we read from it |
|---|---|---|
| the app | App settings → Basic | the app secret |
| the messaging account | WhatsApp → API Setup | must be subscribed to the app |
| a phone number | WhatsApp → API Setup | the phone number id |
| a token | API Setup (24 h) or Business settings → System users (permanent) | the Graph token |

One app holds ONE callback URL. Whoever saved last hears every delivery of every number of the
app; the other instance is deaf. A number can carry its own override, which is how dev and prod
share one app, see dev setup.

## variables

All five sit in the instance's `.env`. The recipe names them, never their values.

| variable | what it is | read by |
|---|---|---|
| `SECRET_VIVA_WHATSAPP_APP` | the Meta app's secret. Meta signs every delivery with it | the hook's POST |
| `SECRET_VIVA_WHATSAPP_VERIFY` | a word we invent. Meta repeats it when it checks the callback | the hook's GET |
| `SECRET_VIVA_WHATSAPP_TOKEN` | the Graph API token of the number | every send, every media fetch |
| `VIVA_WHATSAPP_NUMBER_ID` | the phone number id Meta gives the number, never the number itself | every send |
| `VIVA_WHATSAPP_OWNER` | dead since `statics.users`. Nothing reads it | nothing |

## the recipe

The service appears twice, because it does two jobs.

Hosted, at the top level of the instance. This is the webhook:

```jsonc
// instance.viva.jsonc
{
  "services": [
    {
      "manifest": { "type": "service", "slug": "whatsapp" },
      "module": "@commons/service/whatsapp",
      "secrets": {
        "app": "${SECRET_VIVA_WHATSAPP_APP}",
        "verify": "${SECRET_VIVA_WHATSAPP_VERIFY}"
      }
    }
  ]
}
```

Consumed, inside the mode that speaks through it. This is the sender:

```jsonc
// instance.viva.jsonc
{
  "runtime": {
    "modes": [
      {
        "module": "@commons/bot/personal",
        "statics": { "users": { "4915100000000": "beef" } },
        "consume": {
          "whatsapp": {
            "module": "@commons/service/whatsapp",
            "statics": {
              "graph": "https://graph.facebook.com/v26.0",
              "number": "${VIVA_WHATSAPP_NUMBER_ID}"
            },
            "secrets": { "token": "${SECRET_VIVA_WHATSAPP_TOKEN}" }
          }
        }
      }
    ]
  }
}
```

| key | meaning |
|---|---|
| `statics.users` (mode) | WhatsApp address → user slug of the instance. Digits only, with country code. Only these senders are heard |
| `statics.platforms` (mode) | which consumed services the mode pulls. Default `["whatsapp"]` |
| `statics.idle` (mode) | seconds of silence after which the next message opens a new thread. Default `21600` (6 h) |
| `statics.graph` (service) | the Graph API base with its version |
| `statics.number` (service) | the phone number id |

The five variables also need their rows under the recipe's `environment.properties`, or the
instance refuses them.

## prod setup

Prod uses a real business number and a token that never expires.

1. Verify the business in Meta Business settings. Ours sent only after the business read
   `verified` and the number's name `APPROVED`.
2. Add the number in WhatsApp → API Setup and register it. Its display name must be approved.
3. Make a system user in Business settings → System users, give it the app and the messaging
   account, and generate a token with `whatsapp_business_messaging` and
   `whatsapp_business_management`. Choose "never expires".
4. Write the five variables into the instance's `.env`, and the two recipe entries above.
   On our Coolify host the env table is the source and `.env` its output: a row written only into
   `.env` dies on the next deploy.
5. Boot. Check the hook from outside before touching Meta:

   ```sh
   curl -s -o /dev/null -w '%{http_code}\n' \
     'https://runtime.s4y.vivalence.com/attached/process/service/service/whatsapp/webhook?hub.verify_token=wrong'
   ```

   It prints `403`. A `404` means the image has no service or the recipe has no `services` entry.
6. In the dashboard, WhatsApp → Configuration: paste the callback URL and the verify word, press
   "Verify and save". Meta calls the hook once; it must already answer.
7. Subscribe the webhook field `messages`. It is the only one the code reads.
8. Send one text from a phone listed in `users`. The answer arrives on the phone and both turns
   show in the thread.

Prod's callback:

```
https://runtime.s4y.vivalence.com/attached/process/service/service/whatsapp/webhook
```

## dev setup

Dev uses the test number Meta gives every app, and the temporary token of the API Setup page.

1. WhatsApp → API Setup: copy the test number's phone number id and "Generate access token".
   Ours read under two hours of life, not the 24 the page names. After that every send answers
   401 and a new one is pasted.
2. Add your own phone under "To" as a recipient. A test number writes only to listed recipients.
3. A test number cannot write first. Send its `hello_world` template once from the page, answer it
   from the phone; that opens the 24 h window in which free text is allowed.
4. Write the variables into `~/.viva/instances/<slug>/.env`. The watcher does not restart on a
   change of `.env`: restart the runtime.
5. Give the local runtime a public address:

   ```sh
   cloudflared tunnel --url "http://[::1]:2501"
   ```

   All of `:2501` is public while it runs. The URL is new on every run.
6. Write the tunnel's hook onto the test number, never onto the app. The app's callback stays
   prod's; the number's own override wins for that number only.

   ```sh
   curl -s -X POST "https://graph.facebook.com/v26.0/$VIVA_WHATSAPP_NUMBER_ID" \
     -H "authorization: Bearer $SECRET_VIVA_WHATSAPP_TOKEN" \
     -H 'content-type: application/json' \
     -d '{"webhook_configuration":{"override_callback_uri":"<tunnel>/attached/process/service/service/whatsapp/webhook","verify_token":"<verify word>"}}'
   ```

   It answers `{"success":true}`. Meta calls the hook during the write, so the runtime and the
   tunnel are up first. The temporary token is allowed to write it. Repeat on every new tunnel.

   Read back, the number shows both, and `phone_number` is the one Meta delivers to:

   ```json
   {
     "webhook_configuration": {
       "phone_number": "<tunnel>/attached/process/service/service/whatsapp/webhook",
       "application": "https://runtime.s4y.vivalence.com/attached/process/service/service/whatsapp/webhook"
     }
   }
   ```

Never press "Verify and save" in the dashboard with a tunnel URL: that moves the app's callback and
prod goes deaf. Without the override the test number delivers to prod, which answers from the
prod number.

## reading Meta's side

Everything the dashboard shows can be read with the token, from inside the instance so no secret
leaves it. `$APP` is the app id, `$ACCOUNT` the messaging account id.

| question | call |
|---|---|
| is the token valid, when does it expire | `GET /debug_token?input_token=$TOKEN` |
| is the number able to send | `GET /$NUMBER_ID?fields=status,name_status,account_mode,quality_rating,webhook_configuration` |
| is the account subscribed to the app | `GET /$ACCOUNT/subscribed_apps` |
| where does Meta deliver, which fields | `GET /$APP/subscriptions?access_token=$APP\|$APP_SECRET` |

A number that works reads `status CONNECTED`, `name_status APPROVED`, `account_mode LIVE`.
The last call also proves the app secret: a wrong one is refused.

## what went wrong for us

| what we saw | cause |
|---|---|
| "The callback URL or verify token couldn't be validated" | the hook answered 404: the running image was older than the service |
| prod heard nothing, every check on prod green | the app's callback still named the dev tunnel |
| 403 `131005` on send | the token; a new one worked, the exact lack unread |
| 400 `131037` on every send | a 555 number sends only once its display name is `APPROVED` |
| the account delivered nothing | it was never subscribed: `POST /$ACCOUNT/subscribed_apps` |
| the runtime listened and answered nothing | new code booted on an old recipe without `statics.users` |
| a send outside the 24 h window | Graph refuses free text; only a template opens a chat |

The runtime logs no delivery, accepted or refused. A deaf hook and an idle one look the same in the
log: read Meta's side, or look for the Turn.

The dashboard warns that an unpublished app receives only test webhooks. Ours delivered real
messages regardless.

## limits

- The queue is memory. A restart between the 200 and the pull loses what was queued.
- One queue per module: a second consuming mode would take messages from the first.
- Media is held whole as base64 inside the message.
- A text longer than 4096 characters is sent in pieces.

## docs

- Cloud API, get started: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Webhooks overview: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview
- The `messages` webhook: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages
- Graph API versions: https://developers.facebook.com/docs/graph-api/changelog/versions
