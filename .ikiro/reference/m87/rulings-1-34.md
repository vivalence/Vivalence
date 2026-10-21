# drained 10-22 whole from .ikiro/quests/m87-buffer-view-file.org (quest tidy); nothing reworded · limit: none (reference content)

| Q | his ruling, verbatim | built as (10-20) |
|---+----------------------+------------------|
| 1 rows or values | /"it's for sure an entity. Yes, it's an entity."/ · /"we can run all kinds of like things like validating that artifacts are still in place"/ | =ViewEntity=; the patrol (law 10) |
| 2 identity | /"Don't forget about the slug."/ · /"if we work on a markdown file, we don't want to create a new artifact every time"/ | row id is identity; =slug=; =hash= = current bytes; update mutates in place — both entities |
| 3 history | /"let's not fucking over-engineer that. […] an artifact as it changes still is the single artifact"/ | latest only; the old file pruned |
| 4 mime per row | /"the artifact does not say something about how it's consumed. It only says what it is. […] one hash per artifact."/ | one row = one mime = one hash; a dom view and a tty view = two rows, one slug |
| 5 source in the row | /"we don't fucking bloat the database with the raw content. […] artifact is the way that we interface with the disk."/ | bytes on disk by =mount=; a buffer's =data= is state, never a file's bytes |
| 6 where the file lives | /"per mode."/ · /"the mode that is mounted in the terminal when the asset gets created is the one that owns it"/ | written into =mode.mountpoint=; owner = the terminal's seated mode |
| 7 relations | /"Mode is the owner, so turn buffer consumers […] Thread doesn't need it."/ | =view.mode= m:1 mandatory; no thread on View |
| 8 parts | /"artifacts are not parts. They just dangle off the turn. […] the parts are the intermediary steps of the agents"/ | a turn's buffers render after its parts |
| 9 the model's verbs | /"The tools are the new meta, the artifacts are the new meta. […] update, create, read, delete, list"/ | =view_*= for code · =buffer_create · buffer_update= for state and content |
| 10 which one shows | /"just render the most recently updated that we can display"/ · /"prefer […] rendered bundled artifacts over plain static ones"/ · /"a rendered trait on buffer makes actually sense"/ | =RENDERED: { cell, frame }= pins; else compiled-then-latest (m95 lock 10) |
| 11 moving bytes | /"we want the artifact to be independent of the cargo handling. […] the inverse of what freight does"/ | two acts: a trait lands the file; a repository records it |
| 12 compile | /"the paladin does the actual implementation. And the cargo is a surface and interface layer."/ | =mode.files.compile= = paladin's bundler into the mountpoint |
| 13 one trait or two | /"let's go really dumb and call it file set and file sync. […] All of this ocean speak freight and shit was funny, but I think it's past its prime."/ | =FILESET= (read) · =FILESINK= (write) |
| 14 the attached route | /"as soon as a file is imported into the system, it is exposed to the system as an artifact."/ | by row: =/attached/view/:id= · =/attached/buffer/:id= |
| 15 accept | /"How the fuck should the runtime be able to decide what a client can accept? […] Of course it's the client."/ | a renderer table per client; =accept= derived |
| 16 the export | /"artifactual is a good solution"/ · /"Actually, we call it mount."/ | =export const views= =[{slug, mount, mime, presents?}]=, trait =RENDERER=; =target · schema= on a row SUPERSEDED by 27 · 28 |
| 17 the cell's data | /"No, I don't want a dedicated cell entity. That is overkill."/ · /"A buffer is the state space between an artifact and its consumer."/ | no Cell; the buffer is the state; =buffer.views= SUPERSEDED by 27 · 30 |
| 17b the place | /"we can just display it in either place and we need controls to switch"/ | the client decides; chess inline or framed from one buffer → =surface.place= (28) |
| 18 target | /"the target is optional and it's more of a constraint"/ | SUPERSEDED by 28 |
| 19 the surface | /"receive and compile being file sync, but catalog really is file set"/ · /"Generative unchanged"/ | =mode.files.receive · compile= (FILESINK) · FILESET reads |
| 20 old data | /"we drop everything that we have"/ | the migration drops =buffer.bundle=; no re-mint |
| 21 turn ↔ buffer (10-17) | /"1 m:n obviously."/ | =buffer.turns= owner =buffer_turns=; chess: every turn adds itself |
| 22 the file's path (10-17) | /"we want to record the full mountpoint of the artifact. obviously."/ | =mount= absolute on both entities; a re-rooted mountpoint → =MISSING=, re-index |
| 23 two mimes, one slug (10-17) | /"a model can't revise a compiled artifact. […] Ancestry."/ · /"upstream and downstream is fine."/ | =upstream ⟷ downstream= on View; =view_update= on a source recompiles its downstream |
| 24 law 9 holds (10-17) | /"the law holds. propose a rework."/ | a repository records; FILESINK moves; =/files/receive · /files/compile= expose; =mime= rides the compile request (closes the =mimeOf(.mjs)= hole) |
| 25 generated code (10-17) | /"7 permitted."/ | a model-written =vnd.vivalence.*= row runs with =terminal.dispatch=; integrity proves bytes, trust is the mode's |
| 26 client modes (10-20) | /"no artifacts on client modes. client modes dont render anything today. they have limited functionality like transport keymaps and wire into repling"/ | the client =register= carries =keymap · repling=, never =views= |
| 27 one buffer per mode (10-20) | /"A modes artifact is always displaying the modes buffer, one buffer per mode. We decide if we process the content based on the mime."/ · /"I don't like that we don't have dedicated types for this. I think it's 1 degree of freedom too much."/ | =export const buffer= once (today's 17 =v.buffer(= declarations, =App= opened); no schema on a row |
| 28 surface (10-20) | /"the buffer is no longer in the terminal […] place is its own prop. But I don't like it being a top-level prop. […] it's called surface. Surface.place"/ | =default(target, { terminal, buffer, surface })= (m95 lock 11) |
| 29 content (10-20) | /"Those are still artifacts. Those are just, well, stateless. […] the turn having artifacts does make sense."/ | SUPERSEDED by 31: content is a buffer visiting a file |
| 30 two entities (10-20) | /"b"/ | no relation between View and Buffer; the views are rows; one loader |
| 31 the buffer visits a file (10-20) | /"What if we consider markdown content PNGs, JPEGs […] to be buffers instead of artifacts? And the artifacts are really renderers?"/ · /"we're serving one of them from the disk and the other one from SQL"/ · /"I like A better a lot. I like that it's similar to Emacs. That gives me trust."/ | law 1 · 2: =Buffer= = =mime · data · mount=; =View= = code only; REJECTED B: View absorbs state, the word buffer dies |
| 32 the name (10-20) | /"then artifact is misnamed."/ · /"View entity"/ · /"RENDERER trait"/ | =View= (=v.view= · =export const views= · =mode.views= · =/attached/view/:id= · =view_*= · =/views= · =/buffer/view=); the mode trait =RENDERER=; rows 1–29 and the intent say artifact for today's View |
| 33 the client's table (10-20) | /"we're gonna continue to call it a renderer, because it's one coherent […] one system. It's a render pipeline. […] we pick renderers for buffers, and what we pick is a view. […] when a mode creates something that renders buffers, then we call that renderers, or renderer."/ · /"Keep renderer."/ | =RENDERERS= · =renderer(buffer, client)= stay; one pipeline: the client picks a renderer for a buffer, what it picks is a View, a mode that ships Views carries =RENDERER= |
| 34 FILESET stays (10-20) | /"Yeah, right. I don't think we can do without that."/ | a mode declares its data directory; FILESET mounts it as =mode.files=; FILESINK writes; FILESINK is his word (13 · 19 · 34), FILESINK was my transcription |
