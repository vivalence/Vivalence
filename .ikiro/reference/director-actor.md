# director · actor — two reference systems, as built

Study of the two HTTP references named in `.ikiro/quests/m126-facutly-unfolding.org:276`.
Only the two URLs were taken from the quest. Nothing else of the quest or of
`.ikiro/reference/` was read.

- `https://github.com/NickTikhonov/shuo` — tarball of `HEAD`, pulled 2026-11-24
- `https://github.com/KoljaB/RealtimeVoiceChat` — tarball of `HEAD`, pulled 2026-11-24

How to read this file:

- Every `path:n` is a path inside the named repository at that tarball.
- Code fences are quoted from the source: log calls and docstrings dropped, long statements
  wrapped at 100 chars, no token changed.
- Every JSON block is **derived from the code, not captured**. Nothing here was run: both
  systems need paid keys or a CUDA box. The one JSON shape that the source itself writes to
  disk is the shuo trace (`shuo/tracer.py:124`); the wire messages are the literal dicts the
  source sends. State snapshots are the in-memory objects written out as JSON by me.
- Neither repository uses the words "director" or "actor". The mapping in §1 and §4 is my
  reading. Everything else is what the code does.

## 1. the problem space

A spoken conversation has two parties sharing one channel, and neither waits for a prompt.
Both systems solve the same five problems.

1. **When is the user's turn over?** Silence alone is ambiguous: a pause inside a sentence
   and a pause after it look the same for the first few hundred milliseconds.
2. **Latency.** The reply must start within a conversational gap. The reply pipeline
   (LLM first token, then TTS first audio) costs more than that gap unless it streams and
   unless something starts early.
3. **Barge-in.** The user talks over the reply. Everything in flight must stop: generation,
   synthesis, and audio already buffered at the far end.
4. **Staleness.** Work started for an input that has since changed must never reach the ear.
5. **Memory under interruption.** What goes into history when the reply was cut?

Both split the work in two roles.

- One role **decides**: it watches the input stream and the clock, and emits a small set of
  commands: start a reply for this text, stop the reply. It produces no content. This is
  what I read as the **director**.
- One role **performs**: it owns the LLM → TTS → playback chain for one reply, owns the
  resources of that chain, and reports back one fact: done. This is what I read as the
  **actor**.

The two repositories sit at opposite ends of how much the director knows.

- shuo: the director is a pure function of 30 statements. Turn detection is bought
  (Deepgram Flux). The director only routes.
- RealtimeVoiceChat: the director is turn detection. It predicts the end of the turn,
  starts the actor **before** the turn has ended, and holds the actor's output back until
  the turn is confirmed.

## 2. shuo

### 2.1 architecture

```
Twilio WS ──media──▶ read_twilio ─┐
Deepgram Flux ──TurnInfo──────────┼─▶ event_queue ─▶ process_event(state, event)
Agent ──playback done─────────────┘                        │
                                                    (state', actions)
                                                           │
                         ┌─────────────────────────────────┼──────────────────────┐
                         ▼                                 ▼                      ▼
                  FeedFluxAction                  StartAgentTurnAction    ResetAgentTurnAction
                  flux.send(bytes)                agent.start_turn(text)  agent.cancel_turn()
```

One `asyncio.Queue` per call. Three producers push events into it. One loop pops, runs the
pure function, performs the actions. The loop is the only writer of `state`.

```python
# shuo/conversation.py:98
        while True:
            event = await event_queue.get()
            if isinstance(event, StreamStartEvent):
                stream_sid = event.stream_sid
                await flux.start()
                await tts_pool.start()
                agent = Agent(
                    websocket=websocket,
                    stream_sid=event.stream_sid,
                    on_done=lambda: event_queue.put_nowait(AgentTurnDoneEvent()),
                    tts_pool=tts_pool,
                    tracer=tracer,
                )
            old_phase = state.phase
            state, actions = process_event(state, event)
            for action in actions:
                if isinstance(action, FeedFluxAction):
                    await flux.send(action.audio_bytes)
                elif isinstance(action, StartAgentTurnAction):
                    if agent:
                        await agent.start_turn(action.transcript)
                elif isinstance(action, ResetAgentTurnAction):
                    if agent:
                        await agent.cancel_turn()
            if isinstance(event, StreamStopEvent):
                break
```

### 2.2 types

All frozen dataclasses (`shuo/types.py`).

```python
# shuo/types.py:19
class Phase(Enum):
    LISTENING = auto()    # Waiting for user / user speaking
    RESPONDING = auto()   # Agent active (LLM -> TTS -> Playback)

@dataclass(frozen=True)
class AppState:
    phase: Phase = Phase.LISTENING
    stream_sid: Optional[str] = None
```

Events, the director's input:

```python
# shuo/types.py:40
class StreamStartEvent:      stream_sid: str
class StreamStopEvent:       pass
class MediaEvent:            audio_bytes: bytes
class FluxStartOfTurnEvent:  pass
class FluxEndOfTurnEvent:    transcript: str
class AgentTurnDoneEvent:    pass
```

Actions, the director's output:

```python
# shuo/types.py:87
class FeedFluxAction:        audio_bytes: bytes
class StartAgentTurnAction:  transcript: str
class ResetAgentTurnAction:  pass
```

What the types leave out, read off the source:

- `AppState` holds no history, no transcript, no turn counter. History lives in
  `LLMService._history` (`shuo/services/llm.py:40`), reached through the actor.
- No event and no action carries a turn id. Staleness is handled inside the actor by one
  boolean, `Agent._active` (`shuo/agent.py:66`), checked at the top of every callback.

### 2.3 the director

```python
# shuo/state.py:22
def process_event(state: AppState, event: Event) -> Tuple[AppState, List[Action]]:
    if isinstance(event, StreamStartEvent):
        return replace(state, stream_sid=event.stream_sid, phase=Phase.LISTENING), []

    if isinstance(event, StreamStopEvent):
        actions: List[Action] = []
        if state.phase == Phase.RESPONDING:
            actions.append(ResetAgentTurnAction())
        return state, actions

    if isinstance(event, MediaEvent):
        return state, [FeedFluxAction(audio_bytes=event.audio_bytes)]

    if isinstance(event, FluxEndOfTurnEvent):
        if event.transcript and state.phase == Phase.LISTENING:
            new_state = replace(state, phase=Phase.RESPONDING)
            return new_state, [StartAgentTurnAction(transcript=event.transcript)]
        return state, []

    if isinstance(event, FluxStartOfTurnEvent):
        if state.phase == Phase.RESPONDING:
            return replace(state, phase=Phase.LISTENING), [ResetAgentTurnAction()]
        return state, []

    if isinstance(event, AgentTurnDoneEvent):
        if state.phase == Phase.RESPONDING:
            return replace(state, phase=Phase.LISTENING), []
        return state, []

    return state, []
```

The whole transition relation:

```
(LISTENING,  FluxEndOfTurn(t), t != "")  → (RESPONDING, [StartAgentTurn(t)])
(RESPONDING, FluxStartOfTurn)            → (LISTENING,  [ResetAgentTurn])
(RESPONDING, AgentTurnDone)              → (LISTENING,  [])
(RESPONDING, StreamStop)                 → (RESPONDING, [ResetAgentTurn])
(any,        Media(b))                   → (same,       [FeedFlux(b)])
(any,        StreamStart(sid))           → (LISTENING,  [])            stream_sid := sid
everything else                          → (same,       [])
```

Consequences that are in the code, not in the README:

- Audio is fed to Flux in both phases (`shuo/state.py:41`). The ear never closes. This is
  what makes barge-in possible: Flux hears the user while the reply plays.
- `FluxEndOfTurn` in `RESPONDING` is dropped with its transcript (`shuo/state.py:45`).
- The suite is 24 tests over this one function, no I/O (`tests/test_update.py`), grouped as
  stream lifecycle, media routing, end of turn, start of turn, agent done, complete flows,
  edge cases.

### 2.4 the actor

`Agent` (`shuo/agent.py:34`) owns three things with three lifetimes.

```
LLMService   one per call    keeps history across turns
TTSService   one per turn    taken from TTSPool, already connected
AudioPlayer  one per turn    created in start_turn
```

The chain is four callbacks, each guarded by `_active`:

```python
# shuo/agent.py:158
    async def _on_llm_token(self, token: str) -> None:
        if not self._active or not self._tts:
            return
        await self._tts.send(token)

    async def _on_llm_done(self) -> None:
        if not self._active or not self._tts:
            return
        await self._tts.flush()

    async def _on_tts_audio(self, audio_base64: str) -> None:
        if not self._active or not self._player:
            return
        await self._player.send_chunk(audio_base64)

    async def _on_tts_done(self) -> None:
        if not self._active or not self._player:
            return
        self._player.mark_tts_done()

    def _on_playback_done(self) -> None:
        if not self._active:
            return
        self._active = False
        self._tts = None
        self._player = None
        self._on_done()
```

Cancel runs upstream to downstream, and ends with a command to the far end:

```python
# shuo/agent.py:126
    async def cancel_turn(self) -> None:
        if not self._active:
            return
        self._active = False
        self._tracer.cancel_turn(self._turn)
        await self._llm.cancel()
        if self._tts:
            await self._tts.cancel()
            self._tts = None
        if self._player:
            if self._player.is_playing:
                await self._player.stop_and_clear()
            self._player = None
```

`stop_and_clear` sends `{"event": "clear", "streamSid": …}` to Twilio
(`shuo/services/player.py:148`), which drops audio Twilio has buffered but not yet played.

The player paces: one chunk per 20 ms, 10 ms idle poll, done when the index reaches the end
and TTS has said it is finished (`shuo/services/player.py:111`). "Done" therefore means
handed to Twilio, 20 ms apart. It is not a report from the ear.

History under interruption:

```python
# shuo/services/llm.py:53
    async def start(self, user_message: str) -> None:
        if self._running:
            await self.cancel()
        self._history.append({"role": "user", "content": user_message})
        self._running = True
        self._task = asyncio.create_task(self._generate())
# shuo/services/llm.py:105
            if self._running and assistant_response:
                self._history.append({"role": "assistant", "content": assistant_response})
                await self._on_done()
        except asyncio.CancelledError:
            if assistant_response:
                self._history.append({"role": "assistant", "content": assistant_response + "..."})
            raise
```

- The user turn enters history when the reply starts.
- A cut reply enters history as the text **generated** so far plus `"..."`. The player's
  position is not consulted, so history can hold words the user never heard.
- If the LLM had already finished and the cut came during playback, history holds the whole
  reply with no marker.

The latency device is the pool: one ElevenLabs socket kept connected ahead of need, thrown
away after 8 s idle, refilled in the background (`shuo/services/tts_pool.py:55`,
`shuo/conversation.py:57`).

### 2.5 snapshots

A turn with a barge-in, as the loop sees it. Derived; `Media` events elided.

```json
[
  {
    "event": { "type": "StreamStartEvent", "stream_sid": "MZ8a3b1f" },
    "state": { "phase": "LISTENING", "stream_sid": "MZ8a3b1f" },
    "actions": []
  },
  {
    "event": { "type": "FluxStartOfTurnEvent" },
    "state": { "phase": "LISTENING", "stream_sid": "MZ8a3b1f" },
    "actions": []
  },
  {
    "event": { "type": "FluxEndOfTurnEvent", "transcript": "Hey, how's it going?" },
    "state": { "phase": "RESPONDING", "stream_sid": "MZ8a3b1f" },
    "actions": [{ "type": "StartAgentTurnAction", "transcript": "Hey, how's it going?" }]
  },
  {
    "event": { "type": "FluxStartOfTurnEvent" },
    "state": { "phase": "LISTENING", "stream_sid": "MZ8a3b1f" },
    "actions": [{ "type": "ResetAgentTurnAction" }]
  },
  {
    "event": { "type": "FluxEndOfTurnEvent", "transcript": "Actually, wait." },
    "state": { "phase": "RESPONDING", "stream_sid": "MZ8a3b1f" },
    "actions": [{ "type": "StartAgentTurnAction", "transcript": "Actually, wait." }]
  },
  {
    "event": { "type": "AgentTurnDoneEvent" },
    "state": { "phase": "LISTENING", "stream_sid": "MZ8a3b1f" },
    "actions": []
  }
]
```

History after those six steps, by `shuo/services/llm.py:58` and `:111`. The reply texts are
invented:

```json
[
  { "role": "user", "content": "Hey, how's it going?" },
  { "role": "assistant", "content": "Pretty good! I was just..." },
  { "role": "user", "content": "Actually, wait." },
  { "role": "assistant", "content": "Sure, take your time." }
]
```

The trace file, `/tmp/shuo/<stream_sid>.json`. The shape is the source's own
(`shuo/tracer.py:124`); the numbers are invented. Spans and markers are milliseconds from
the turn's start. A cancelled turn has every open span closed at the cancel instant.

```json
{
  "call_id": "MZ8a3b1f",
  "turns": [
    {
      "turn": 1,
      "transcript": "Hey, how's it going?",
      "cancelled": true,
      "spans": [
        { "name": "tts_pool", "start_ms": 0.1, "end_ms": 0.4 },
        { "name": "llm", "start_ms": 0.5, "end_ms": 912.0 },
        { "name": "tts", "start_ms": 231.7, "end_ms": 912.0 },
        { "name": "player", "start_ms": 418.2, "end_ms": 912.0 }
      ],
      "markers": [
        { "name": "llm_first_token", "time_ms": 231.7 },
        { "name": "tts_first_audio", "time_ms": 418.2 }
      ]
    }
  ]
}
```

Wire, Twilio side (`shuo/services/twilio_client.py:50`, `shuo/services/player.py:137`):

```json
{ "event": "start", "start": { "streamSid": "MZ8a3b1f" } }
{ "event": "media", "media": { "payload": "<base64 mulaw 8kHz>" } }
{ "event": "stop" }
```

```json
{ "event": "media", "streamSid": "MZ8a3b1f", "media": { "payload": "<base64 mulaw 8kHz>" } }
{ "event": "clear", "streamSid": "MZ8a3b1f" }
```

## 3. RealtimeVoiceChat

### 3.1 architecture

One process, one user at a time: the STT recorder and the pipeline manager are created once
on `app.state` and each websocket rebinds their callbacks (`code/server.py:897`).

```
browser ──binary PCM + 8-byte header──▶ process_incoming_data ─▶ audio_chunks (max 50)
                                                                      │
                                              AudioInputProcessor.process_chunk_queue
                                              48k→16k, dropped while `interrupted`
                                                                      │
                                              TranscriptionProcessor (RealtimeSTT recorder)
                                                │ partial text        │ silence start/stop
                                                ▼                     ▼
                                        TurnDetection           silence monitor thread
                                        sets the silence        fires on the clock
                                        duration
                                                │
                              TranscriptionCallbacks  (code/server.py:517)
                                │ prepare_generation(text) · check_abort(text) · abort
                                ▼
                              SpeechPipelineManager   (code/speech_pipeline_manager.py:113)
                                request worker → LLM worker → quick-TTS worker → final-TTS worker
                                                                      │
                                              RunningGeneration.audio_chunks
                                                                      │
                              send_tts_chunks, gated by callbacks.tts_to_client
                                                                      │
browser ◀──JSON {type, content}── message_queue ◀─────────────────────┘
```

Four asyncio tasks per socket (`code/server.py:912`), plus seven threads its own source
starts: request worker, LLM worker, quick-TTS worker, final-TTS worker, the silence monitor,
the turn-detection text worker, and one abort worker per socket. Coordination is
`threading.Event` pairs and flags on shared objects. There is no central state value and no
single writer.

### 3.2 turn detection: the silence duration is a computed value

The recorder ends a turn when silence has lasted `post_speech_silence_duration`. That number
is rewritten on every new partial transcript.

```python
# code/turndetect.py:438  (inside _text_worker, one pass per partial)
            matches = find_matching_texts(self.texts_without_punctuation)
            ...
            whisper_suggested_pause = avg_pause
            prob_complete = self.get_completion_probability(cleaned_for_model)
            sentence_finished_model_pause = interpolate_detection(prob_complete)
            weight_towards_whisper = 0.65
            weighted_pause = (weight_towards_whisper * whisper_suggested_pause +
                             (1 - weight_towards_whisper) * sentence_finished_model_pause)
            final_pause = weighted_pause * self.detection_speed
            if contains_ellipses:
                final_pause += 0.2
            min_pause = self.pipeline_latency + self.pipeline_latency_overhead
            if final_pause < min_pause:
                final_pause = min_pause
            self.suggest_time(final_pause, processed_text)
```

Two signals, both about the text, none about the audio:

- **Punctuation the STT model put at the end of the partial.** Seconds, at speed 0
  (`code/turndetect.py:270`): `...` 2.3 · `.` 0.39 · `!` 0.35 · `?` 0.33 · none 1.25.
  Averaged over the recent partials that are equal apart from their ending punctuation
  (`code/turndetect.py:88`), because the STT model flickers between `.` and `...` on the
  same words.
- **A DistilBERT classifier**, `KoljaB/SentenceFinishedClassification`, giving the
  probability that the sentence is complete, mapped linearly: probability 0 → 1.0 s,
  probability 1 → 0.0 s (`code/turndetect.py:18`). An LRU of 256 texts caches it.

The floor is the point of the design: the silence wait is never shorter than the measured
reply latency plus 0.1 s. The latency is measured at boot: LLM time to first sentence plus
TTS time to first audio (`code/speech_pipeline_manager.py:214`, `code/server.py:131`).

The STT model is primed to emit that punctuation
(`code/transcribe.py:50`):

```python
    "initial_prompt_realtime": (
        "The sky is blue. When the sky... She walked home. "
        "Because he... Today is sunny. If only I..."
    ),
```

A worked value, with the classifier output assumed at 0.9 and the latency assumed at 0.5 s:

```json
{
  "text": "How are you?",
  "whisper_suggested_pause": 0.33,
  "prob_complete": 0.9,
  "sentence_finished_model_pause": 0.1,
  "weighted_pause": 0.2495,
  "detection_speed": 0.5,
  "final_pause_before_floor": 0.12475,
  "min_pause": 0.6,
  "post_speech_silence_duration": 0.6
}
```

### 3.3 the director starts the actor before the turn ends

Two triggers call `potential_sentence_end(text)`, which is
`TranscriptionCallbacks.on_potential_sentence` → `prepare_generation(text)`
(`code/server.py:635`).

Trigger one, on text: a partial that ends in `.`, `!` or `?` and has been seen three times
within 0.2 s, compared by similarity above 0.96 on the last five words
(`code/transcribe.py:469`, constants at `:90` and `:92`). A partial ending in `...` never
triggers here.

Trigger two, on the clock (`code/transcribe.py:241`, a thread polling every 1 ms):

```python
# code/transcribe.py:250
                    silence_waiting_time = self._get_recorder_param(
                        "post_speech_silence_duration", 0.0
                    )
                    time_since_silence = time.time() - speech_end_silence_start
                    latest_pipe_start_time = (
                        silence_waiting_time
                        - self.pipeline_latency
                        - self._PIPELINE_RESERVE_TIME_MS
                    )
                    potential_sentence_end_time = latest_pipe_start_time
                    if potential_sentence_end_time < self._MIN_POTENTIAL_END_DETECTION_TIME_MS:
                        potential_sentence_end_time = self._MIN_POTENTIAL_END_DETECTION_TIME_MS
                    ...
                    if time_since_silence > potential_sentence_end_time:
                        current_text = self.realtime_text if self.realtime_text else ""
                        self.detect_potential_sentence_end(
                            current_text, force_yield=True, force_ellipses=True
                        )
```

The instants inside one silence of length `W = post_speech_silence_duration`, with latency
`L`, in seconds from silence start:

```
max(W − L − 0.02, 0.02)   forced potential sentence → the actor starts
max(W − 0.35, 0.15)       "hot": potential_full_transcription_callback
W − 0.25                  on_tts_allowed_to_synthesize
W                         recorder stops → before_final_sentence → the turn is committed
```

So the latest start of the reply pipeline is timed so that its first audio exists when the
silence expires. If speech resumes, silence start resets to 0 and none of the later instants
fire.

A text is yielded once: `potential_sentences_yielded` holds what was already sent and is
cleared when the generation ends or the turn is finalized (`code/transcribe.py:541`, `:391`).

### 3.4 speculation is hidden behind one gate

The actor synthesizes into `RunningGeneration.audio_chunks` as soon as it can. The sender
forwards nothing until the director opens the gate.

```python
# code/server.py:444  (send_tts_chunks, one pass per 1 ms)
            if not callbacks.tts_to_client:
                continue
            if not app.state.SpeechPipelineManager.running_generation:
                continue
            if app.state.SpeechPipelineManager.running_generation.abortion_started:
                continue
            ...
            if not (
                app.state.SpeechPipelineManager.running_generation.quick_answer_first_chunk_ready
            ):
                continue
            chunk = None
            try:
                chunk = app.state.SpeechPipelineManager.running_generation.audio_chunks.get_nowait()
            except Empty:
                final_expected = (
                    app.state.SpeechPipelineManager.running_generation.quick_answer_provided
                )
                audio_final_finished = (
                    app.state.SpeechPipelineManager.running_generation.audio_final_finished
                )
                if not final_expected or audio_final_finished:
                    callbacks.send_final_assistant_answer()
                    app.state.SpeechPipelineManager.running_generation = None
                    callbacks.tts_chunk_sent = False
                    callbacks.reset_state()
                continue
            base64_chunk = app.state.Upsampler.get_base64_chunk(chunk)
            message_queue.put_nowait({
                "type": "tts_chunk",
                "content": base64_chunk
            })
```

The gate opens in exactly one callback, the commit of the turn:

```python
# code/server.py:664
    def on_before_final(self, audio: bytes, txt: str):
        self.user_finished_turn = True
        self.user_interrupted = False
        if self.app.state.SpeechPipelineManager.is_valid_gen():
            self.app.state.SpeechPipelineManager.running_generation.tts_quick_allowed_event.set()
        if not self.app.state.AudioInputProcessor.interrupted:
            self.app.state.AudioInputProcessor.interrupted = True
            self.interruption_time = time.time()
        self.tts_to_client = True
        user_request_content = (
            self.final_transcription if self.final_transcription else self.partial_transcription
        )
        self.message_queue.put_nowait({
            "type": "final_user_request",
            "content": user_request_content
        })
        if self.app.state.SpeechPipelineManager.is_valid_gen():
            if (
                self.app.state.SpeechPipelineManager.running_generation.quick_answer
                and not self.user_interrupted
            ):
                self.assistant_answer = (
                    self.app.state.SpeechPipelineManager.running_generation.quick_answer
                )
                self.message_queue.put_nowait({
                    "type": "partial_assistant_answer",
                    "content": self.assistant_answer
                })
        self.app.state.SpeechPipelineManager.history.append(
            {"role": "user", "content": user_request_content}
        )
```

Also read off this callback:

- The user turn enters history at commit, not at the speculative start. The text put in
  history is the transcript at commit; the text the generation was built from is the
  potential sentence from earlier.
- `AudioInputProcessor.interrupted = True` stops audio reaching the transcriber
  (`code/audio_in.py:201`). It is released 1 s after the first reply chunk is sent
  (`code/server.py:355`) or after 2 s (`code/server.py:400`). The ear is closed across the
  start of the reply.
- `tts_quick_allowed_event` is set here and by the sender, and the worker that would wait on
  it sets `allowed_to_speak = True` unconditionally (`code/speech_pipeline_manager.py:594`).

### 3.5 staleness: a speculative reply dies when the text moves

Every partial transcript is compared against the text the running generation was built from.

```python
# code/server.py:606
    def on_partial(self, txt: str):
        self.final_assistant_answer_sent = False
        self.final_transcription = ""
        self.partial_transcription = txt
        self.message_queue.put_nowait({"type": "partial_user_request", "content": txt})
        self.abort_text = txt
        self.abort_request_event.set()
# code/server.py:594
    def _abort_worker(self):
        while True:
            was_set = self.abort_request_event.wait(timeout=0.1)
            if was_set:
                self.abort_request_event.clear()
                if self.last_abort_text != self.abort_text:
                    self.last_abort_text = self.abort_text
                    self.app.state.SpeechPipelineManager.check_abort(
                        self.abort_text, False, "on_partial"
                    )
```

```python
# code/speech_pipeline_manager.py:501  (inside check_abort)
                        if self.running_generation.text is None:
                            similarity = 0.0
                        else:
                            similarity = self.text_similarity.calculate_similarity(
                                self.running_generation.text, txt
                            )
                    ...
                    if similarity >= 0.95:
                        return False # No abort needed
                    self.abort_generation(
                        wait_for_completion=wait_for_finish, timeout=7.0, reason=...
                    )
```

Similarity is on the last five words (`TextSimilarity(focus='end', n_words=5)`,
`code/speech_pipeline_manager.py:160`). At or above 0.95 the speculation is kept, below it is
aborted and the next potential sentence starts a fresh generation with a new id.

The request worker in front of `prepare` does three things
(`code/speech_pipeline_manager.py:229`): drops a request whose text equals the previous
one's within 2 s, drains the queue and keeps only the newest, and blocks while an abort is in
progress.

### 3.6 the actor

One generation is one mutable object.

```python
# code/speech_pipeline_manager.py:66
class RunningGeneration:
    def __init__(self, id: int):
        self.id: int = id
        self.text: Optional[str] = None
        self.timestamp = time.time()
        self.llm_generator = None
        self.llm_finished: bool = False
        self.llm_finished_event = threading.Event()
        self.llm_aborted: bool = False
        self.quick_answer: str = ""
        self.quick_answer_provided: bool = False
        self.quick_answer_first_chunk_ready: bool = False
        self.quick_answer_overhang: str = ""
        self.tts_quick_started: bool = False
        self.tts_quick_allowed_event = threading.Event()
        self.audio_chunks = Queue()
        self.audio_quick_finished: bool = False
        self.audio_quick_aborted: bool = False
        self.tts_quick_finished_event = threading.Event()
        self.abortion_started: bool = False
        self.tts_final_finished_event = threading.Event()
        self.tts_final_started: bool = False
        self.audio_final_aborted: bool = False
        self.audio_final_finished: bool = False
        self.final_answer: str = ""
        self.completed: bool = False
```

The reply is cut in two to get the first audio out early.

1. **LLM worker** reads the token stream until `TextContext.get_context` finds a first
   clause: a prefix ending at one of `. ! ? , ; : \n - 。 、`, at least 6 characters, at most
   120, at least 10 alphanumerics (`code/text_context.py:28`, `:33`). That prefix is
   `quick_answer`, the remainder already read is `quick_answer_overhang`. The worker then
   **stops reading** and leaves the generator open
   (`code/speech_pipeline_manager.py:394`–`404`).
2. **Quick-TTS worker** synthesizes `quick_answer` as one string, with the small stream
   chunk size 8 (`code/audio_module.py:28`). Chunks are held back until two arrive faster
   than real time or 0.5 s of audio is buffered, then released (`code/audio_module.py:336`).
3. **Final-TTS worker** waits for the quick phase to finish unaborted, then feeds TTS from a
   generator that yields the overhang and then **resumes the same LLM generator**
   (`code/speech_pipeline_manager.py:687`), into the same `audio_chunks` queue, with stream
   chunk size 30.

Stopping is a handshake per worker: a request event, a finished event, a 5 s wait.

```python
# code/speech_pipeline_manager.py:871  (process_abort_generation, under abort_lock)
            current_gen_obj.abortion_started = True
            self.abort_block_event.clear()
            self.abort_completed_event.clear()
            self.stop_everything_event.set()
            is_llm_potentially_active = (
                self.llm_generation_active or self.generator_ready_event.is_set()
            )
            if is_llm_potentially_active:
                self.stop_llm_request_event.set()
                self.generator_ready_event.set()
                stopped = self.stop_llm_finished_event.wait(timeout=5.0)
                ...
                self.llm.cancel_generation()
            ...  # same for tts_quick, then tts_final
            if (
                self.running_generation is not None
                and self.running_generation.id == current_gen_obj.id
            ):
                if (
                    current_gen_obj.llm_generator
                    and hasattr(current_gen_obj.llm_generator, 'close')
                ):
                    current_gen_obj.llm_generator.close()
                self.running_generation = None
            self.generator_ready_event.clear()
            self.llm_answer_ready_event.clear()
            self.abort_completed_event.set()
            self.abort_block_event.set()
```

`abortion_started` is the single flag every reader checks first; `is_valid_gen()` is
`running_generation is not None and not abortion_started`
(`code/speech_pipeline_manager.py:219`).

The `"finish"` request exists and does nothing (`code/speech_pipeline_manager.py:264`).

### 3.7 barge-in

The trigger is the recorder's voice activity starting a recording while the **client**
reports it is playing. The client reports that twice: as JSON `tts_start` / `tts_stop`, and
as bit 0 of the flags word on every audio packet.

```python
# code/server.py:774
    def on_recording_start(self):
        if self.tts_client_playing:
            self.tts_to_client = False
            self.user_interrupted = True
            self.send_final_assistant_answer(forced=True)
            self.tts_chunk_sent = False
            self.message_queue.put_nowait({
                "type": "stop_tts",
                "content": ""
            })
            self.abort_generations("on_recording_start, user interrupts, TTS Playing")
            self.message_queue.put_nowait({
                "type": "tts_interruption",
                "content": ""
            })
```

Order: close the gate, write history, tell the far end to drop its buffer, abort the actor,
tell the far end again.

History under interruption (`code/server.py:816`): `send_final_assistant_answer(forced=True)`
takes `quick_answer + final_answer`, which is the text **handed to TTS** so far, collapses
whitespace, sends it as `final_assistant_answer` and appends it as the assistant turn. No
marker for the cut. As in shuo, the playback position is not consulted.

### 3.8 wire

Upstream binary, one packet (`code/server.py:260`, `code/static/app.js:57`):

```
bytes 0–3   uint32 big-endian   client timestamp, ms
bytes 4–7   uint32 big-endian   flags; bit 0 = isTTSPlaying
bytes 8–    int16 PCM, taken as 48 kHz, resampled 3:1 to 16 kHz
```

Upstream JSON (`code/server.py:297`):

```json
{ "type": "tts_start" }
{ "type": "tts_stop" }
{ "type": "clear_history" }
{ "type": "set_speed", "speed": 35 }
```

Downstream JSON, the seven types the server sends:

```json
{ "type": "partial_user_request", "content": "How are" }
{ "type": "final_user_request", "content": "How are you?" }
{ "type": "partial_assistant_answer", "content": "I'm doing well," }
{ "type": "tts_chunk", "content": "<base64 PCM>" }
{ "type": "final_assistant_answer", "content": "I'm doing well, thanks for asking." }
{ "type": "stop_tts", "content": "" }
{ "type": "tts_interruption", "content": "" }
```

### 3.9 snapshots

One generation at three instants. Derived. Events are shown as their `is_set()`, queues as
their length, the generator as a tag. Texts invented.

Speculating: the user said "How are you?" and is 0.1 s into the silence. The actor is
synthesizing, the gate is shut.

```json
{
  "callbacks": {
    "tts_to_client": false,
    "tts_client_playing": false,
    "tts_chunk_sent": false,
    "user_interrupted": false,
    "user_finished_turn": false,
    "partial_transcription": "How are you?",
    "final_transcription": "",
    "assistant_answer": "I'm doing well,"
  },
  "audio_input": { "interrupted": false },
  "recorder": { "post_speech_silence_duration": 0.6 },
  "running_generation": {
    "id": 7,
    "text": "How are you?",
    "llm_generator": "<open>",
    "llm_finished": true,
    "llm_aborted": false,
    "quick_answer": "I'm doing well,",
    "quick_answer_provided": true,
    "quick_answer_first_chunk_ready": true,
    "quick_answer_overhang": " thanks",
    "tts_quick_started": true,
    "audio_chunks": 4,
    "audio_quick_finished": false,
    "audio_quick_aborted": false,
    "abortion_started": false,
    "tts_final_started": false,
    "audio_final_aborted": false,
    "audio_final_finished": false,
    "final_answer": "",
    "completed": false
  },
  "history": []
}
```

Committed: silence reached 0.6 s, `on_before_final` ran, the sender is draining.

```json
{
  "callbacks": {
    "tts_to_client": true,
    "tts_client_playing": true,
    "tts_chunk_sent": true,
    "user_interrupted": false,
    "user_finished_turn": true,
    "partial_transcription": "How are you?",
    "final_transcription": "How are you?",
    "assistant_answer": "I'm doing well, thanks for"
  },
  "audio_input": { "interrupted": true },
  "recorder": { "post_speech_silence_duration": 0.6 },
  "running_generation": {
    "id": 7,
    "text": "How are you?",
    "llm_generator": "<open>",
    "llm_finished": true,
    "llm_aborted": false,
    "quick_answer": "I'm doing well,",
    "quick_answer_provided": true,
    "quick_answer_first_chunk_ready": true,
    "quick_answer_overhang": " thanks",
    "tts_quick_started": true,
    "audio_chunks": 2,
    "audio_quick_finished": true,
    "audio_quick_aborted": false,
    "abortion_started": false,
    "tts_final_started": true,
    "audio_final_aborted": false,
    "audio_final_finished": false,
    "final_answer": " thanks for",
    "completed": false
  },
  "history": [{ "role": "user", "content": "How are you?" }]
}
```

Barged in: the user spoke while the client was playing; `on_recording_start` has returned.

```json
{
  "callbacks": {
    "tts_to_client": false,
    "tts_client_playing": true,
    "tts_chunk_sent": false,
    "user_interrupted": true,
    "user_finished_turn": true,
    "partial_transcription": "How are you?",
    "final_transcription": "How are you?",
    "assistant_answer": "I'm doing well, thanks for",
    "final_assistant_answer": "I'm doing well, thanks for",
    "final_assistant_answer_sent": true
  },
  "audio_input": { "interrupted": false },
  "running_generation": null,
  "history": [
    { "role": "user", "content": "How are you?" },
    { "role": "assistant", "content": "I'm doing well, thanks for" }
  ]
}
```

`tts_client_playing` stays true until the client's `tts_stop` arrives, which it sends on
receiving `stop_tts` (`code/static/app.js:260`).

### 3.10 the routines, in order

A turn that completes:

1. Audio packets arrive, are resampled, fed to the recorder.
2. Each changed partial: `partial_user_request` is sent, the abort check is queued, the
   silence duration is recomputed.
3. A punctuated partial holds for three sightings, or the silence clock reaches
   `W − L − 0.02`: `prepare_generation(text)`.
4. Request worker: `check_abort(text)`, new `RunningGeneration`, `llm.generate`, wake the
   LLM worker.
5. LLM worker cuts `quick_answer`, wakes quick TTS, stops reading.
6. Quick TTS fills `audio_chunks`. Final TTS takes over the generator when quick is done.
7. Silence reaches `W`: `on_before_final` opens the gate, sends `final_user_request`,
   appends the user turn, closes the ear.
8. The sender drains `audio_chunks` as `tts_chunk`; 1 s after the first chunk the ear
   reopens.
9. The queue is empty and the final phase is finished: `final_assistant_answer`, the
   assistant turn is appended, `running_generation = None`, `reset_state()`.

A speculation that is thrown away: steps 1 to 6, then the user keeps talking. Silence start
resets, the gate never opens, the next partial differs, `check_abort` aborts generation 7,
and step 3 fires again later for generation 8.

A barge-in: after step 8, recording starts while `tts_client_playing`: §3.7.

## 4. the two side by side

Numbers and symbols only. ✓ present, ✗ absent.

| | shuo | RealtimeVoiceChat |
|---|---|---|
| director is a pure function | ✓ | ✗ |
| director state fields | 2 | 16 |
| commands to the actor | 2 | 3 |
| turn end decided in-process | ✗ | ✓ |
| actor started before turn end | ✗ | ✓ |
| output gate between actor and ear | ✗ | ✓ |
| stale-work test on input text | ✗ | ✓ |
| generation id | ✗ | ✓ |
| ear open while replying | ✓ | ✗ |
| far-end buffer cleared on barge-in | ✓ | ✓ |
| reply split for first audio | ✗ | ✓ |
| history marks a cut reply | ✓ | ✗ |
| history uses playback position | ✗ | ✗ |
| director suite without I/O, tests | 24 | 0 |
| threads started by own source | 1 | 7 |

Counted from: `AppState` (`shuo/types.py:25`) and `TranscriptionCallbacks.reset_state` plus
`tts_client_playing` (`code/server.py:568`, `:545`); commands `start_turn`, `cancel_turn`
against `prepare_generation`, `check_abort`, `abort_generation`; "ear open" for
RealtimeVoiceChat is ✗ for the window of §3.4 only.

What each role holds, in both:

```
director                                  actor
────────                                  ─────
the phase, or the gate                    the LLM stream
the clock (RVC only)                      the TTS connection
the input text so far (RVC only)          the audio queue and its pacing
                                          the history (shuo)
emits: start(text) · stop                 emits: done · partial text (RVC)
never touches audio out                   never decides whether it may speak
```

Where the two disagree on ownership: shuo puts history inside the actor
(`shuo/services/llm.py:40`); RealtimeVoiceChat puts it on the pipeline manager and has the
director write both turns into it (`code/server.py:713`, `:858`).

The three mechanisms that exist only in RealtimeVoiceChat form one unit, and each needs the
other two:

- starting early (§3.3) produces work that may be wrong,
- so the output is gated until commit (§3.4),
- and the input is re-checked against the work on every change (§3.5).

The one mechanism that exists only in shuo is the shape of the director itself: every
decision is a value `(state, event) → (state, actions)`, so the full behaviour is the table
in §2.3 and is tested without a socket.
