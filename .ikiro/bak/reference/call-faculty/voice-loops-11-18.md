<!-- writer: agent (opus, high), 2026-11-18 · limit: 16000 chars -->
# voice loops: shuo · RealtimeVoiceChat · ours, 11-18

Trigger: /"if we don't use a straight call faculty from a provider, then I need an update on my mental model of how we implement that ourselves. Especially when we make it performance."/

`shuo` = github.com/NickTikhonov/shuo. `RVC` = github.com/KoljaB/RealtimeVoiceChat, under `code/`. Both read from tarballs at HEAD on 11-18; nothing run. Their paths are repo-relative.

## 1 · ours, stage by stage

- **mic, browser**: `getUserMedia({ audio: true })`, no AEC flags, so browser defaults (`systems/ghost/subjects/app/prototypes/box/device/microphone/microphone.js:93`). 1024-sample frames (`microphone/worklet.js:1`) at `context.sampleRate` (`microphone.js:118`).
- **mic, tty**: `ffmpeg -f avfoundation`, 16 kHz f32le, no echo cancellation (`microphone.js:21-31`).
- **level VAD**: threshold 0.02 · rise 100 ms · fall 600 ms (`microphone.js:8-10`, `:207-225`). Only the UI reads it.
- **client → runtime**: mic frames merged with `/audio/played` pts into `harness.call.stream` (`systems/ghost/gestalten/commands/content/call.js:52-53`).
- **route**: attending (loads the thread's turns) → persisting → `shard.hal.call` (`systems/runtime/subjects/mode/traits/harnessed.js:153-158`, `:297-305`).
- **organs**: mind tier = `policy.tier ?? "fast"` (`subsystems/typology/gestalten/shard/hal.js:101`). A native `call` faculty wins, else `cascade(ear, mind, mouth)` is derived (`subsystems/typology/prototypes/cortex.js:113-115`, `:146-151`). `commons/hallucinators` has no native call provider today.
- **converse** wraps the faculty and runs the tool rounds (`subsystems/typology/gestalten/belt/hallucinate.js:253-286`).
- **ear = Scribe realtime WS**: `commit_strategy=turn_prediction` (`commons/hallucinators/elevenlabs/provider/index.js:237-245`). `language_code` only when exactly 1 language is set (`index.js:111-112`).
- **turn end decided by Scribe, server-side**: `committed_transcript` becomes `/turn/close` (`index.js:74-78`). We hold no threshold or VAD of our own.
- **partials**: become `/part/draft`. The first non-empty one opens the user turn (`index.js:54-59`, `:69-72`).
- **mind start**: only on the commit; an ear `/turn/close` calls `answer()` (`subsystems/typology/gestalten/belt/cascade.js:81-83`). No speculation.
- **mind and mouth start together**: `soma.merge` pulls both streams in `reply` (`cascade.js:6-23`).
- **text → TTS**: each text `/part/delta` is enqueued raw, no clause chunking (`cascade.js:13`).
- **mouth = ElevenLabs `stream-input` WS, one per reply** (`index.js:161-176`). Deltas go with `try_trigger_generation: true` (`index.js:180-185`). End is `text: ""` (`index.js:189`). Never `flush: true` mid-stream.
- **audio back**: `pcm_16000` `/audio/packet`, pts counted in samples (`index.js:194-205`). Then `speaker.play` (`call.js:55`), a 1600-sample jitter prime (`speaker/speaker.js:7`).
- **barge-in**: an ear `/turn/open` calls `speaking.abort("interrupted")` (`cascade.js:78-79`). That needs a non-empty partial, so it is gated on a transcript, not a VAD.
- **abort**: `AbortSignal.any` closes both the mind and mouth sockets (`cascade.js:46-47`, `index.js:166`). The reply seals with `meta.state: "interrupted"` (`cascade.js:24-29`). The client flushes its speaker (`call.js:56-58`).
- **cut-off point lost**: the client keeps `heard[turnId] = speaker.played` in its own state only (`call.js:57`). `/audio/played` reaches the cascade but `feeding` has no case for it (`cascade.js:59-69`). History holds the whole generated text, including what was never heard.
- **tool rounds**: run serially (`hallucinate.js:123-128`, `:274-277`). Results come back as `/turn/full`. That fires `answer()` again, which opens a fresh mouth socket (`cascade.js:65-67`). Nothing fills the silence while a tool runs.
- **polish**: repairs each sealed user turn. It is off the mind's path but holds the stream's end (`hal.js:4-50`, `:106`).
- **storage**: one `Turn` entity per open/close, flushed on seal (`harnessed.js:169-208`). The client also merges turns (`call.js:62-64`).
- **tests**: tool round `subsystems/typology/tests/call.conversation.test.js:142` · barge-in `:151` · route `systems/runtime/tests/call.integration.test.js:43`.

### his mental model, sentence by sentence

- "a speech-to-text capability where we dictate": **yes, corrected.** It is the same Scribe faculty. In a call it is always on, it DECIDES when the turn ends (`index.js:240`) and it triggers barge-in (`cascade.js:78`).
- "sent to a model which responds in text and with tool calls": **yes.** The mind gets the committed transcript only, never partials (`cascade.js:81-83`). Tools run serially between rounds (`hallucinate.js:126`).
- "the text is sent to a text-to-speech model which is sent to our user": **yes.** Token by token, no chunking on our side (`cascade.js:13`). ElevenLabs buffers on its server. 16 kHz PCM back.
- "all of this interruption": **yes, one mechanism.** User speech opens an ear turn, one AbortController kills mind and mouth, the client flushes. It needs a recognised word, not just sound.
- **what it misses**:
  - every stage is serial: endpoint → mind TTFT → TTS buffer → audio
  - nothing overlaps the user's silence
  - the mind is never told where it was cut off

## 2 · shuo (`shuo/`)

- **shape**: `process_event(state, event) → (state, actions)`, LISTENING ⇄ RESPONDING (`shuo/state.py:22-60`). One asyncio queue per call (`shuo/conversation.py:53`, `:98-138`).
- **transport**: Twilio WS, mulaw 8 kHz both ways (`shuo/services/flux.py:66-70`, `shuo/services/tts.py:59-63`). EU endpoints pinned (`flux.py:56-60`).
- **STT + turn end**: Deepgram Flux `flux-general-en`, one always-on WS (`flux.py:66-71`). `EndOfTurn` (with transcript) starts the agent; `StartOfTurn` = barge-in (`flux.py:131-139`, `state.py:44-53`). No local VAD, no silence constant.
- **mind**: Groq `llama-3.3-70b-versatile`, `max_tokens` 500, no tools, only on `EndOfTurn` (`shuo/services/llm.py:33-36`, `:87-93`).
- **text → TTS**: each token sent at once with `try_trigger_generation` (`agent.py:158-170`). `flush: true` when the LLM ends (`agent.py:172-177`, `tts.py:107-119`). Model `eleven_turbo_v2_5`, `ulaw_8000` (`tts.py:59-63`).
- **warm TTS pool**: 1 pre-connected socket, TTL 8 s, refilled in the background (`conversation.py:57`, `shuo/services/tts_pool.py:77-109`, `:132-163`).
- **player**: one chunk per 20 ms; barge-in sends Twilio `clear` (`shuo/services/player.py:111-124`, `:148-154`).
- **interruption**: cancels LLM → TTS → player (`agent.py:126-149`). History keeps the generated text + `"..."`, not the played text (`llm.py:109-112`).
- **echo**: none in code; the handset does it (I).
- **numbers**: their measured LLM TTFT, 30 runs: groq llama-3.3-70b avg 98 ms (75–134) · gpt-4o-mini 367 ms · gpt-5-mini 777 ms (`scripts/llm-full.txt:1`). TTS first audio is logged per turn (`agent.py:184-191`), not published.

## 3 · RealtimeVoiceChat (`code/`)

- **client**: `echoCancellation` + `noiseSuppression`, 24 kHz ideal (`static/app.js:96-100`). 2048-sample batches with an 8-byte header: ms timestamp and an `isTTSPlaying` flag (`static/app.js:35-61`).
- **server audio**: assumes 48 kHz in, resamples to 16 kHz (`audio_in.py:21`, `:145`). TTS 24 kHz upsampled to 48 kHz (`upsample_overlap.py:54`).
- **STT**: RealtimeSTT, Whisper `base.en` for realtime and final (`transcribe.py:28-30`).
- **VAD**: Silero 0.05 + WebRTC 3 (`transcribe.py:32-33`). Base silence 0.7 s, overridden by turn detection (`transcribe.py:34`, `:320-336`).
- **turn detection**: DistilBERT `SentenceFinishedClassification` scores each partial for "complete" (`turndetect.py:13`, `:218-219`). Pause per ending, in seconds (`turndetect.py:269-286`):

  | ending | fast | slow |
  |---+---+---|
  | `.` | 0.39 | 0.9 |
  | `?` | 0.33 | 0.8 |
  | `!` | 0.35 | 0.8 |
  | none | 1.25 | 1.9 |
  | `...` | 2.3 | 3.0 |

- **pause formula**: (0.65·ending pause + 0.35·(1−p)) × speed (0.5 fast to 1.7 slow). `...` adds 0.2 s. Floor = measured LLM+TTS latency + 0.1 s (`turndetect.py:478-496`, `server.py:131`).
- **speed knob**: the user sets it, 0–100 (`server.py:309-315`).
- **speculative start**: `prepare_generation` fires when a punctuated partial is stable 3× in 0.2 s (`transcribe.py:88-93`, `:469-561`, `server.py:635-646`). It also fires at silence ≥ wait − pipeline latency − 20 ms (`transcribe.py:253-284`).
- **audio held until the real end**: LLM and quick TTS run early. `tts_to_client` is set only in `on_before_final` (`server.py:664-691`). TTS may synthesise from wait − 0.25 s (`transcribe.py:286-290`).
- **speculation abort**: on each new partial, the last 5 words are compared. Similarity ≥ 0.95 keeps the generation, below that it aborts and restarts (`speech_pipeline_manager.py:160`, `:442-529`, `server.py:594-621`).
- **quick answer**: the first clause, ended by `. ! ? , ; : -` with ≥ 10 alphanumeric characters, goes to TTS first; the rest follows (`text_context.py:28`, `:33-70`, `speech_pipeline_manager.py:394-402`, `:643-700`).
- **playout hold**: 2 on-time chunks or 0.5 s buffered (`audio_module.py:336`). Kokoro pauses 0.3 s at a comma and 0.6 s at a sentence (`audio_module.py:24`).
- **engines**: local Kokoro/Coqui/Orpheus (`server.py:31-33`). Ollama Mistral-Small-24B, prewarmed, TTFT measured at boot, no tools (`server.py:37-39`, `llm_module.py:485`, `speech_pipeline_manager.py:171`, `:214`).
- **barge-in**: VAD `on_recording_start` while the client reports playing → `stop_tts`, abort, `tts_interruption` (`server.py:774-814`, `audio_in.py:66`).
- **echo**: browser AEC (`app.js:98-100`). The mic is NOT fed to STT from turn end until 1 s after the first TTS chunk (`server.py:684-688`, `:355-374`, `:400-403`, `audio_in.py:201`).
- **history on interrupt**: the generated quick + final text, not the played text (`server.py:826-858`).
- **concurrency**: threads + Events (`speech_pipeline_manager.py:163-193`). Its pipeline lives on `app.state`, so one conversation per server (I).
- **numbers**: the README publishes none. The constants put most turn ends at the floor; a trailing `...` takes ~1.1 s on fast (I).

## 4 · latency budget: the user stops → first audio byte plays

M = measured by us · T = measured by them · C = vendor claim · I = inferred from code.

| stage | ours | shuo | RVC |
|---+---+---+---|
| mic packet | ≤64 ms I | 20 ms I | 85 ms I |
| endpoint | 295 ms after clip end, 1 run M | Flux, unpublished | ≥ LLM+TTS+0.1 s I |
| mind TTFT | haiku no-think 749–1162 ms M · gemini fast 4445–4821 ms M | 98 ms T | hidden in silence I |
| TTS socket | per reply, overlaps mind · 665 ms M (Scribe proxy) | 0 warm I | local |
| TTS first audio | ~100 ms C + buffer till text end I | buffer till flush I | first clause + ≤0.5 s I |
| playout | 1600-sample prime I | 20 ms drip I | worklet |
| **total** | **~1.5–2.5 s haiku · >5 s gemini I** | **sub-second I** | **≈ endpoint I** |

- No end-to-end call has been timed (`dictate-performance-11-18.org`: "not measured: … a call").
- The mind numbers come from the polish probes (`timing-11-18/none.txt`, `polish.txt`).

## 5 · techniques we lack, ranked for a tutor

Learners pause mid-sentence; EN/ES mix both ways.

1. **Speculative mind, audio held until the commit.**
   - RVC: `server.py:635-646` · `transcribe.py:253-290` · `speech_pipeline_manager.py:442-529`.
   - Ours: `cascade.js:73-91`. Start a held `answer()` on a stable `/part/draft` (`index.js:72`). On `/turn/close`, release it if the last 5 words match at ≥ 0.95, else restart.
   - Gain: hides 0.75–4.8 s of mind TTFT (M). Cost: tokens burned on speculations that a learner's pause aborts.
2. **A patience knob + endpointing that knows when a sentence is complete.**
   - RVC: `turndetect.py:255-296`, `:478-496` · `server.py:309-315`.
   - Ours: Scribe tunables at `index.js:239-241` (if it has any), or a `CONVERSATIONAL` setting.
   - Gain: fewer cut-off learners (quality). RVC's classifier is English-only (`turndetect.py:13`).
3. **A non-reasoning, low-TTFT mind.**
   - shuo: `llm.py:87-93` + `scripts/llm-full.txt:1`. RVC: `speech_pipeline_manager.py:171`.
   - Ours: `hal.js:101` resolves `"fast"` = gemini with mandatory reasoning (`timing-11-18/hallucinators.txt`).
   - Gain: up to ~4 s (M).
4. **Clause-level flush to TTS.**
   - RVC: `text_context.py:28-70`. shuo: `agent.py:172-177`.
   - Ours: `index.js:180-190`. Send `flush: true` at the first `, . ? !`, or a short `chunk_length_schedule`.
   - Gain: first audio at the first clause, not at text end (I, probe). Biggest for short replies.
5. **A warm TTS socket.**
   - shuo: `tts_pool.py:77-109`.
   - Ours: `index.js:161-176`. Open the next socket while the user speaks.
   - Gain: up to ~0.6 s once #1 or #3 makes the mind faster than the handshake (I).
6. **Local VAD ducking on barge-in.**
   - RVC: `server.py:774-814`. shuo: `flux.py:138`.
   - Ours: `call.js:56`. Duck on the `$speaking` rise (`microphone.js:213-215`, 100 ms) instead of waiting ~650 ms for a partial (M).
   - Gain: ~0.5 s faster cut. A duck, not a flush, so a learner's "sí" or "mm" does not kill the reply.
7. **Echo gating.**
   - RVC: `server.py:684-688` + `app.js:98-100`.
   - Ours: the tty mic at `microphone.js:21-31` has no AEC; browser constraints at `microphone.js:93`.
   - Gain: no self-interruption on speakers (I, probe).

## 6 · what we do that they don't

- **tools mid-call**: results re-enter as `/turn/full` (`hallucinate.js:274-277`, `cascade.js:65-67`, test `call.conversation.test.js:142`). Neither has tools.
- **stored turns**: Turn entities with `meta.state: "interrupted"` (`harnessed.js:169-208`). Theirs live in memory.
- **swappable organs**: one selector per organ, and a native `call` takes the slot when present (`cortex.js:146-151`, test `call.conversation.test.js:126`).
- **multilingual ear**: auto-detect when 0 or ≥2 languages (`index.js:111-112`). shuo is `flux-general-en`; RVC is `base.en`.
- **played position on the wire**: `Audio.Played` pts (`subsystems/typology/schematics/primitives/hallucination.js:421-423`, `call.js:28-33`). They both store generated text. We are one `case` away from cutting history to what was heard (`cascade.js:61-69`).
- **polish**: user-turn repair runs beside the call (`hal.js:4-50`).
- **one grammar**: turn/part/audio packets (`hallucination.js:442`); dictation, dialogue and call share `soma.pour`.

## 7 · open questions only a live probe settles

- **Scribe `turn_prediction`**: commit latency on natural speech? False commits when a learner pauses? Any tunables?
- **ElevenLabs `stream-input`**: is `try_trigger_generation` honoured? First-audio delay at 40 / 120 / 300 chars without a flush? Does a mid-stream `flush: true` work on the ledger's model?
- **the call's mind**: which model does `hal.js:101` resolve to on his ledger? Its TTFT and reasoning setting?
- **end to end on a real call**: user stops → first audio; barge-in → silence.
- **tty**: does ffplay output reach the avfoundation mic and open an ear turn?
- **browser frames**: sent at `context.sampleRate` (`microphone.js:118`) into a `pcm_16000` socket (`index.js:239`) with `sample_rate` per chunk (`index.js:40`). Does Scribe resample?
- **backchannels**: do "sí" or "ajá" barge in, and how often?
- **tools**: how long is the silence during a tool round, and does the second mouth socket add its handshake?
