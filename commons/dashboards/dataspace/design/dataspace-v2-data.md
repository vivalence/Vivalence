# Dataspace v2 — designer data pack

Pulled 2026-09-22 off the live `droneaid` instance (`http://localhost:2501/daemon/droneaid`, runtime `--watch`, assembly domain mounted). Wire shapes are verbatim responses. Where the wire could not be reached (beef's own userspace rows, turns), rows come from read-only sqlite and are marked so. Screenshots (item 10) not delivered — anima's pane bar was collapsed and driving it by automation was a rabbit hole; beef can grab them.

Numbered sections follow the request.

## 1. `/datamap` — verbatim strip

`GET /daemon/droneaid/datamap` = `shard.datamap.strip(die.datamap.introspect())`. Note what the strip DROPS: primary key, `createdAt`/`updatedAt` (`onCreate`/`onUpdate`) and any `persist:false` prop. `activity` is a VirtualEntity so its `id/createdAt/updatedAt` survive as plain columns. `mode.traits`/`intent.traits` are `EnumArrayType` (comma-text on disk); every other `traits` is `JsonType`.

```json
{
 "user": {
  "properties": {
   "threads": {
    "kind": "1:m",
    "target": "thread",
    "mappedBy": "user"
   }
  },
  "columns": {
   "roles": {
    "type": "JsonType"
   },
   "config": {
    "type": "JsonType"
   }
  }
 },
 "turn": {
  "properties": {
   "parent": {
    "kind": "m:1",
    "target": "turn",
    "owner": true,
    "nullable": true
   },
   "children": {
    "kind": "1:m",
    "target": "turn",
    "mappedBy": "parent"
   },
   "thread": {
    "kind": "m:1",
    "target": "thread",
    "owner": true
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true,
    "nullable": true
   }
  },
  "columns": {
   "role": {
    "type": "string"
   },
   "parts": {
    "type": "JsonType"
   },
   "meta": {
    "type": "JsonType",
    "nullable": true
   }
  }
 },
 "thread": {
  "properties": {
   "user": {
    "kind": "m:1",
    "target": "user",
    "owner": true
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true
   },
   "intent": {
    "kind": "m:1",
    "target": "intent",
    "owner": true,
    "nullable": true
   },
   "buffers": {
    "kind": "1:m",
    "target": "buffer",
    "mappedBy": "thread"
   },
   "turns": {
    "kind": "1:m",
    "target": "turn",
    "mappedBy": "thread"
   },
   "parent": {
    "kind": "m:1",
    "target": "thread",
    "owner": true,
    "nullable": true
   },
   "children": {
    "kind": "1:m",
    "target": "thread",
    "mappedBy": "parent"
   }
  },
  "columns": {
   "phase": {
    "type": "string"
   },
   "traits": {
    "type": "JsonType"
   },
   "trait": {
    "type": "JsonType"
   },
   "counter": {
    "type": "integer"
   },
   "cursor": {
    "type": "integer"
   }
  }
 },
 "symbol": {
  "properties": {
   "literals": {
    "kind": "m:n",
    "target": "literal",
    "owner": true
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true,
    "nullable": true
   }
  },
  "columns": {
   "slug": {
    "type": "string"
   },
   "traits": {
    "type": "JsonType"
   },
   "trait": {
    "type": "JsonType"
   }
  }
 },
 "mode": {
  "properties": {
   "intents": {
    "kind": "1:m",
    "target": "intent",
    "mappedBy": "mode"
   },
   "buffers": {
    "kind": "1:m",
    "target": "buffer",
    "mappedBy": "mode"
   },
   "turns": {
    "kind": "1:m",
    "target": "turn",
    "mappedBy": "mode"
   },
   "literals": {
    "kind": "1:m",
    "target": "literal",
    "mappedBy": "mode"
   },
   "symbols": {
    "kind": "1:m",
    "target": "symbol",
    "mappedBy": "mode"
   }
  },
  "columns": {
   "type": {
    "type": "string"
   },
   "slug": {
    "type": "string"
   },
   "name": {
    "type": "string",
    "nullable": true
   },
   "description": {
    "type": "string",
    "nullable": true
   },
   "installed": {
    "type": "string"
   },
   "version": {
    "type": "string",
    "nullable": true
   },
   "traits": {
    "type": "EnumArrayType"
   }
  }
 },
 "literal": {
  "properties": {
   "symbols": {
    "kind": "m:n",
    "target": "symbol",
    "mappedBy": "literals"
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true,
    "nullable": true
   },
   "uses": {
    "kind": "m:n",
    "target": "literal",
    "owner": true
   },
   "in": {
    "kind": "m:n",
    "target": "literal",
    "mappedBy": "uses"
   }
  },
  "columns": {
   "slug": {
    "type": "string"
   },
   "traits": {
    "type": "JsonType"
   },
   "trait": {
    "type": "JsonType"
   },
   "symbol": {
    "type": "JsonType"
   },
   "ontology": {
    "type": "string"
   }
  }
 },
 "intent": {
  "properties": {
   "user": {
    "kind": "m:1",
    "target": "user",
    "owner": true
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true
   }
  },
  "columns": {
   "slug": {
    "type": "string"
   },
   "name": {
    "type": "string",
    "nullable": true
   },
   "description": {
    "type": "string",
    "nullable": true
   },
   "traits": {
    "type": "EnumArrayType"
   },
   "trait": {
    "type": "JsonType"
   }
  }
 },
 "buffer": {
  "properties": {
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true
   },
   "thread": {
    "kind": "m:1",
    "target": "thread",
    "owner": true,
    "nullable": true
   },
   "literals": {
    "kind": "m:n",
    "target": "literal",
    "owner": true
   },
   "symbols": {
    "kind": "m:n",
    "target": "symbol",
    "owner": true
   }
  },
  "columns": {
   "status": {
    "type": "string"
   },
   "data": {
    "type": "JsonType"
   },
   "view": {
    "type": "JsonType",
    "nullable": true
   },
   "index": {
    "type": "integer"
   },
   "traits": {
    "type": "JsonType"
   },
   "trait": {
    "type": "JsonType"
   }
  }
 },
 "activity": {
  "properties": {
   "user": {
    "kind": "m:1",
    "target": "user",
    "owner": true
   },
   "mode": {
    "kind": "m:1",
    "target": "mode",
    "owner": true
   },
   "thread": {
    "kind": "m:1",
    "target": "thread",
    "owner": true,
    "nullable": true
   },
   "buffer": {
    "kind": "m:1",
    "target": "buffer",
    "owner": true,
    "nullable": true
   },
   "turn": {
    "kind": "m:1",
    "target": "turn",
    "owner": true,
    "nullable": true
   }
  },
  "columns": {
   "id": {
    "type": "string"
   },
   "createdAt": {
    "type": "Date"
   },
   "updatedAt": {
    "type": "Date"
   },
   "type": {
    "type": "string"
   },
   "status": {
    "type": "string"
   },
   "error": {
    "type": "JsonType",
    "nullable": true
   },
   "steps": {
    "type": "JsonType"
   }
  }
 }
}
```

## 2. `/metadata/aperture` — folded to paths

Full strip is 68 450 bytes; folded here to `path [methods] flags` (191 leaves). `[*]` = an `open()` leaf with no method dispatcher (wildcard). `input/output/yields/feeds` = the signature slots present on the leaf. The three `/mode/domain/assembly/*` doors are the same handlers slurped into the daemon root (`/part`, `/step` …). Entity doors are minted by ONE factory, `shard.datamap.repository`, so every entity has the identical 12 POST verbs + `GET /subscribe`, except `activity` whose `only:` strips it to the five reads and adds `/:id/stdout` (yields) + `/:id/stdin/<SIGNAL>`.

```text
/part  [*] input
/step  [*] input
/placement  [*] input
/sequence  [*] input
/move  [*] input
/resolve  [*] input
/bom  [*] input
/closure  [*] input
/tree  [*] input output
/retract  [*] input
/literals  [*] input
/geometry  [*] input
/mode/domain/assembly/status  [*]
/mode/domain/assembly/manifest  [*]
/mode/domain/assembly/part  [*] input
/mode/domain/assembly/step  [*] input
/mode/domain/assembly/placement  [*] input
/mode/domain/assembly/sequence  [*] input
/mode/domain/assembly/move  [*] input
/mode/domain/assembly/resolve  [*] input
/mode/domain/assembly/bom  [*] input
/mode/domain/assembly/closure  [*] input
/mode/domain/assembly/tree  [*] input output
/mode/domain/assembly/retract  [*] input
/mode/domain/assembly/literals  [*] input
/mode/domain/assembly/geometry  [*] input
/mode/domain/assembly/metadata/manifest  [*]
/mode/domain/assembly/metadata/aperture  [*]
/mode/domain/assembly/metadata/statics  [*]
/mode/domain/assembly/metadata/mountpoint  [*]
/mode/topology/part/status  [*]
/mode/topology/part/manifest  [*]
/mode/topology/part/metadata/manifest  [*]
/mode/topology/part/metadata/aperture  [*]
/mode/topology/part/metadata/statics  [*]
/mode/topology/part/metadata/mountpoint  [*]
/mode/topology/placement/status  [*]
/mode/topology/placement/manifest  [*]
/mode/topology/placement/metadata/manifest  [*]
/mode/topology/placement/metadata/aperture  [*]
/mode/topology/placement/metadata/statics  [*]
/mode/topology/placement/metadata/mountpoint  [*]
/mode/topology/step/status  [*]
/mode/topology/step/manifest  [*]
/mode/topology/step/metadata/manifest  [*]
/mode/topology/step/metadata/aperture  [*]
/mode/topology/step/metadata/statics  [*]
/mode/topology/step/metadata/mountpoint  [*]
/mode/topography/model/status  [*]
/mode/topography/model/manifest  [*]
/mode/topography/model/freight  [*]
/mode/topography/model/metadata/manifest  [*]
/mode/topography/model/metadata/aperture  [*]
/mode/topography/model/metadata/statics  [*]
/mode/topography/model/metadata/mountpoint  [*]
/mode/topography/model/metadata/freight  [*]
/mode/editor/import/status  [*]
/mode/editor/import/manifest  [*]
/mode/editor/import/parse  [*] yields
/mode/editor/import/commit  [*] input yields
/mode/editor/import/revert  [*] input output
/mode/editor/import/tree  [*] input output
/mode/editor/import/freight  [*]
/mode/editor/import/metadata/manifest  [*]
/mode/editor/import/metadata/aperture  [*]
/mode/editor/import/metadata/statics  [*]
/mode/editor/import/metadata/mountpoint  [*]
/mode/editor/import/metadata/application  [*]
/mode/editor/import/metadata/freight  [*]
/mode/dashboard/dataspace/status  [*]
/mode/dashboard/dataspace/manifest  [*]
/mode/dashboard/dataspace/metadata/manifest  [*]
/mode/dashboard/dataspace/metadata/aperture  [*]
/mode/dashboard/dataspace/metadata/statics  [*]
/mode/dashboard/dataspace/metadata/mountpoint  [*]
/mode/dashboard/dataspace/metadata/application  [*]
/datamap  [*]
/entities/literal/find  [POST]
/entities/literal/findOne  [POST]
/entities/literal/findOneOrFail  [POST]
/entities/literal/findAndCount  [POST]
/entities/literal/count  [POST]
/entities/literal/create  [POST]
/entities/literal/upsert  [POST]
/entities/literal/ensure  [POST]
/entities/literal/updateOne  [POST]
/entities/literal/update  [POST]
/entities/literal/removeOne  [POST]
/entities/literal/remove  [POST]
/entities/literal/subscribe  [GET]
/entities/symbol/find  [POST]
/entities/symbol/findOne  [POST]
/entities/symbol/findOneOrFail  [POST]
/entities/symbol/findAndCount  [POST]
/entities/symbol/count  [POST]
/entities/symbol/create  [POST]
/entities/symbol/upsert  [POST]
/entities/symbol/ensure  [POST]
/entities/symbol/updateOne  [POST]
/entities/symbol/update  [POST]
/entities/symbol/removeOne  [POST]
/entities/symbol/remove  [POST]
/entities/symbol/subscribe  [GET]
/entities/mode/find  [POST]
/entities/mode/findOne  [POST]
/entities/mode/findOneOrFail  [POST]
/entities/mode/findAndCount  [POST]
/entities/mode/count  [POST]
/entities/mode/create  [POST]
/entities/mode/upsert  [POST]
/entities/mode/ensure  [POST]
/entities/mode/updateOne  [POST]
/entities/mode/update  [POST]
/entities/mode/removeOne  [POST]
/entities/mode/remove  [POST]
/entities/mode/subscribe  [GET]
/userspace/handshake  [*]
/userspace/entities/intent/find  [POST]
/userspace/entities/intent/findOne  [POST]
/userspace/entities/intent/findOneOrFail  [POST]
/userspace/entities/intent/findAndCount  [POST]
/userspace/entities/intent/count  [POST]
/userspace/entities/intent/create  [POST]
/userspace/entities/intent/upsert  [POST]
/userspace/entities/intent/ensure  [POST]
/userspace/entities/intent/updateOne  [POST]
/userspace/entities/intent/update  [POST]
/userspace/entities/intent/removeOne  [POST]
/userspace/entities/intent/remove  [POST]
/userspace/entities/intent/subscribe  [GET]
/userspace/entities/thread/find  [POST]
/userspace/entities/thread/findOne  [POST]
/userspace/entities/thread/findOneOrFail  [POST]
/userspace/entities/thread/findAndCount  [POST]
/userspace/entities/thread/count  [POST]
/userspace/entities/thread/create  [POST]
/userspace/entities/thread/upsert  [POST]
/userspace/entities/thread/ensure  [POST]
/userspace/entities/thread/updateOne  [POST]
/userspace/entities/thread/update  [POST]
/userspace/entities/thread/removeOne  [POST]
/userspace/entities/thread/remove  [POST]
/userspace/entities/thread/subscribe  [GET]
/userspace/entities/buffer/find  [POST]
/userspace/entities/buffer/findOne  [POST]
/userspace/entities/buffer/findOneOrFail  [POST]
/userspace/entities/buffer/findAndCount  [POST]
/userspace/entities/buffer/count  [POST]
/userspace/entities/buffer/create  [POST]
/userspace/entities/buffer/upsert  [POST]
/userspace/entities/buffer/ensure  [POST]
/userspace/entities/buffer/updateOne  [POST]
/userspace/entities/buffer/update  [POST]
/userspace/entities/buffer/removeOne  [POST]
/userspace/entities/buffer/remove  [POST]
/userspace/entities/buffer/subscribe  [GET]
/userspace/entities/turn/find  [POST]
/userspace/entities/turn/findOne  [POST]
/userspace/entities/turn/findOneOrFail  [POST]
/userspace/entities/turn/findAndCount  [POST]
/userspace/entities/turn/count  [POST]
/userspace/entities/turn/create  [POST]
/userspace/entities/turn/upsert  [POST]
/userspace/entities/turn/ensure  [POST]
/userspace/entities/turn/updateOne  [POST]
/userspace/entities/turn/update  [POST]
/userspace/entities/turn/removeOne  [POST]
/userspace/entities/turn/remove  [POST]
/userspace/entities/turn/subscribe  [GET]
/userspace/entities/activity/find  [POST]
/userspace/entities/activity/findOne  [POST]
/userspace/entities/activity/findOneOrFail  [POST]
/userspace/entities/activity/findAndCount  [POST]
/userspace/entities/activity/count  [POST]
/userspace/entities/activity/subscribe  [GET]
/userspace/entities/activity/:id/stdout  [*] yields
/userspace/entities/activity/:id/stdin/SIGTERM  [*]
/userspace/entities/activity/:id/stdin/SIGSTOP  [*]
/userspace/entities/activity/:id/stdin/SIGCONT  [*]
/userspace/entities/activity/:id/stdin/SIGKILL  [*]
/modes/:type/:method  [*]
/cargo  [*]
/metadata/manifest  [*]
/metadata/statics  [*]
/metadata/cargo  [*]
/metadata/datamap  [*]
/metadata/aperture  [*]
/metadata/cortex  [*]
/metadata/modes  [*]
/cortex/render  [*]
/cortex/stream  [*]
```

One raw leaf, so the strip's node shape is seen once (`/userspace/entities/activity/:id/stdout`):

```json
{
 "branches": {},
 "effect": {
  "yields": {
   "type": "object",
   "required": [
    "span",
    "trace",
    "path",
    "verb",
    "at"
   ],
   "properties": {
    "span": {
     "type": "integer"
    },
    "trace": {
     "anyOf": [
      {
       "type": "integer"
      },
      {
       "type": "null"
      }
     ]
    },
    "path": {
     "type": "string"
    },
    "verb": {
     "type": "string"
    },
    "at": {
     "type": "number"
    },
    "data": {}
   },
   "description": "One stdout mark as it crosses a wire; verb is open, Verb is the folding subset. Example: { \"span\": 7, \"trace\": 3, \"path\": \"/hallucination\", \"verb\": \"open\", \"at\": 12.5 }"
  }
 }
}
```

`user`, `identity`, `daemon` have NO doors on a daemon (`POST /entities/user/count` → 404). They live in the multiplayer lighthouse (`Identity`, `Daemon` tables in `service_multiplayer/multiplayer.viva.db`) and on the daemon only as `User` reached through `thread.user`.

## 3. Row samples (wire shape)

### literal — `POST /entities/literal/findAndCount {where:{}, options:{limit:30, orderBy:{slug:'asc'}}}` → `[rows, 61]`

Four `part` rows (note `antenna_4`: a part with only LABELED+SEQUENCED — a placement's `ref` minted it bare) then three `placement` rows fetched with `populate:['mode']` so one relation is expanded (owner = the importer mode). `mode` unpopulated is the bare id string. `symbol` is the folded symbol map, `{part:true}` for a single segment.

```json
[
 {
  "id": "01a0c87e-95b5-742e-9b7e-88d33f2ca923",
  "createdAt": "2026-09-22T09:42:14.197Z",
  "updatedAt": "2026-09-22T09:42:14.197Z",
  "slug": "antenna",
  "trait": {
   "LABELED": {
    "name": "Antenna"
   },
   "SOURCED": {
    "file": "DRONEAID_model_latest.blend",
    "object": "Antenna.00",
    "scale": 0.05
   },
   "MODELED": {
    "file": "parts/antenna.glb",
    "tris": 380,
    "bbox": [
     0.00263,
     0.05998,
     0.00263
    ]
   },
   "COUNTED": {
    "qty": 1
   },
   "SEQUENCED": {
    "steps": []
   }
  },
  "symbol": {
   "part": true
  },
  "ontology": "part",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "traits": [
   "LABELED",
   "SOURCED",
   "MODELED",
   "COUNTED",
   "SEQUENCED"
  ]
 },
 {
  "id": "01a0c87e-95b8-72d1-a033-dc124f679147",
  "createdAt": "2026-09-22T09:42:14.200Z",
  "updatedAt": "2026-09-22T09:42:14.200Z",
  "slug": "antenna_2",
  "trait": {
   "LABELED": {
    "name": "Antenna"
   },
   "SOURCED": {
    "file": "DRONEAID_model_latest.blend",
    "object": "Antenna.01",
    "scale": 0.05
   },
   "MODELED": {
    "file": "parts/antenna_2.glb",
    "tris": 632,
    "bbox": [
     0.00256,
     0.05853,
     0.01529
    ]
   },
   "COUNTED": {
    "qty": 1
   },
   "SEQUENCED": {
    "steps": []
   }
  },
  "symbol": {
   "part": true
  },
  "ontology": "part",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "traits": [
   "LABELED",
   "SOURCED",
   "MODELED",
   "COUNTED",
   "SEQUENCED"
  ]
 },
 {
  "id": "01a0c87e-95ba-71c2-a618-70bc12993d27",
  "createdAt": "2026-09-22T09:42:14.202Z",
  "updatedAt": "2026-09-22T09:42:14.202Z",
  "slug": "antenna_3",
  "trait": {
   "LABELED": {
    "name": "Antenna"
   },
   "SOURCED": {
    "file": "DRONEAID_model_latest.blend",
    "object": "Antenna.02",
    "scale": 0.05
   },
   "MODELED": {
    "file": "parts/antenna_3.glb",
    "tris": 444,
    "bbox": [
     0.01157,
     0.06718,
     0.01157
    ]
   },
   "COUNTED": {
    "qty": 1
   },
   "SEQUENCED": {
    "steps": []
   }
  },
  "symbol": {
   "part": true
  },
  "ontology": "part",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "traits": [
   "LABELED",
   "SOURCED",
   "MODELED",
   "COUNTED",
   "SEQUENCED"
  ]
 },
 {
  "id": "01a0c87e-95cf-7171-ab13-9d10b53e4046",
  "createdAt": "2026-09-22T09:42:14.223Z",
  "updatedAt": "2026-09-22T09:42:14.223Z",
  "slug": "antenna_4",
  "trait": {
   "LABELED": {
    "name": "Antenna"
   },
   "SEQUENCED": {
    "steps": []
   }
  },
  "symbol": {
   "part": true
  },
  "ontology": "part",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "traits": [
   "LABELED",
   "SEQUENCED"
  ]
 }
]
```
```json
[
 {
  "id": "01a0c87e-95d3-75d9-8972-5824c40ae537",
  "createdAt": "2026-09-22T09:42:14.227Z",
  "updatedAt": "2026-09-22T09:42:14.227Z",
  "slug": "droneaid_model_latest.antenna_4",
  "trait": {
   "LABELED": {
    "name": "Antenna"
   },
   "PLACED": {
    "layer": "droneaid_model_latest",
    "name": "antenna_4",
    "ref": "antenna_4"
   }
  },
  "symbol": {
   "placement": true
  },
  "ontology": "placement",
  "mode": {
   "id": "01a0c507-4f75-74cc-909c-aa3031e775d1",
   "slug": "import",
   "type": "editor"
  },
  "traits": [
   "LABELED",
   "PLACED"
  ]
 },
 {
  "id": "01a0c87e-95dc-755c-871a-22307062e5a9",
  "createdAt": "2026-09-22T09:42:14.236Z",
  "updatedAt": "2026-09-22T09:42:14.236Z",
  "slug": "droneaid_model_latest.camera_2",
  "trait": {
   "LABELED": {
    "name": "Camera"
   },
   "PLACED": {
    "layer": "droneaid_model_latest",
    "name": "camera_2",
    "ref": "camera_2"
   }
  },
  "symbol": {
   "placement": true
  },
  "ontology": "placement",
  "mode": {
   "id": "01a0c507-4f75-74cc-909c-aa3031e775d1",
   "slug": "import",
   "type": "editor"
  },
  "traits": [
   "LABELED",
   "PLACED"
  ]
 },
 {
  "id": "01a0c87e-95e4-77ef-ba0f-72357822f756",
  "createdAt": "2026-09-22T09:42:14.244Z",
  "updatedAt": "2026-09-22T09:42:14.244Z",
  "slug": "droneaid_model_latest.components",
  "trait": {
   "LABELED": {
    "name": "Components"
   },
   "PLACED": {
    "layer": "droneaid_model_latest",
    "name": "components",
    "ref": "components"
   }
  },
  "symbol": {
   "placement": true
  },
  "ontology": "placement",
  "mode": {
   "id": "01a0c507-4f75-74cc-909c-aa3031e775d1",
   "slug": "import",
   "type": "editor"
  },
  "traits": [
   "LABELED",
   "PLACED"
  ]
 }
]
```

On-disk column types for the same table (sqlite, `Literal`): `trait json`, `symbol json default '{}'`, `traits json default '[]'`, `ontology text default ''`, `mode_id text null`, `created_at datetime` — but mikro's sqlite driver writes epoch-ms INTEGERS into `created_at` (e.g. `1790070602694`).

### symbol — `POST /entities/symbol/findAndCount` → `[rows, 71]`

Three full rows, then the slug list of the page. Every symbol on this daemon is `mode: null` (declared by topologies, unowned) and carries `ONTOLOGICAL` + `LABELED`; the two roots add `TOPOGRAPHICAL`.

```json
[
 {
  "id": "01a0c507-4f8d-747f-9722-f7924787d439",
  "createdAt": "2026-09-21T17:33:05.805Z",
  "updatedAt": "2026-09-21T17:33:05.805Z",
  "slug": "assembly",
  "traits": [
   "ONTOLOGICAL",
   "LABELED",
   "TOPOGRAPHICAL"
  ],
  "trait": {
   "ONTOLOGICAL": {},
   "LABELED": {
    "name": "Assembly",
    "description": "A composed product state — a layer stack of nodes and joints, its steps in order. Core ontological dimension."
   },
   "TOPOGRAPHICAL": {}
  },
  "mode": null
 },
 {
  "id": "01a0c507-4f82-770a-ac23-679a42bd5050",
  "createdAt": "2026-09-21T17:33:05.794Z",
  "updatedAt": "2026-09-21T17:33:05.794Z",
  "slug": "component",
  "traits": [
   "ONTOLOGICAL",
   "LABELED",
   "TOPOGRAPHICAL"
  ],
  "trait": {
   "ONTOLOGICAL": {},
   "LABELED": {
    "name": "Component",
    "description": "One part type — a thing with geometry that never contains another model. Core ontological dimension."
   },
   "TOPOGRAPHICAL": {}
  },
  "mode": null
 },
 {
  "id": "01a0c507-4fa2-70ee-b133-bbfb9c40388e",
  "createdAt": "2026-09-21T17:33:05.826Z",
  "updatedAt": "2026-09-21T17:33:05.826Z",
  "slug": "family.antenna",
  "traits": [
   "ONTOLOGICAL",
   "LABELED"
  ],
  "trait": {
   "ONTOLOGICAL": {},
   "LABELED": {
    "name": "Antenna",
    "description": "VTX and RX antennas, the pigtail."
   }
  },
  "mode": null
 }
]
```
```text
assembly               ONTOLOGICAL,LABELED,TOPOGRAPHICAL
component              ONTOLOGICAL,LABELED,TOPOGRAPHICAL
family.antenna         ONTOLOGICAL,LABELED
family.arm             ONTOLOGICAL,LABELED
family.bolt.m2         ONTOLOGICAL,LABELED
family.bolt.m3         ONTOLOGICAL,LABELED
family.cable           ONTOLOGICAL,LABELED
family.camera          ONTOLOGICAL,LABELED
family.computer        ONTOLOGICAL,LABELED
family.connector       ONTOLOGICAL,LABELED
family.esc             ONTOLOGICAL,LABELED
family.fc              ONTOLOGICAL,LABELED
family.grommet         ONTOLOGICAL,LABELED
family.jig             ONTOLOGICAL,LABELED
family.motor           ONTOLOGICAL,LABELED
family.mount           ONTOLOGICAL,LABELED
family.nut             ONTOLOGICAL,LABELED
family.pad             ONTOLOGICAL,LABELED
family.plate           ONTOLOGICAL,LABELED
family.propeller       ONTOLOGICAL,LABELED
family.rx              ONTOLOGICAL,LABELED
family.standoff        ONTOLOGICAL,LABELED
family.sticker         ONTOLOGICAL,LABELED
family.strap           ONTOLOGICAL,LABELED
family.vtx             ONTOLOGICAL,LABELED
family.zip_tie         ONTOLOGICAL,LABELED
joint.adhesive         ONTOLOGICAL,LABELED
joint.bolted           ONTOLOGICAL,LABELED
joint.plugged          ONTOLOGICAL,LABELED
joint.pressed          ONTOLOGICAL,LABELED
```
### mode — `POST /entities/mode/findAndCount` → `[rows, 7]` (description elided)

`installed` is a content HASH string, not a boolean (the typology descriptor lies). `traits` comes back as a json array on the wire although the column is comma-text (`EXPOSED,TOOLING`).

```json
[
 {
  "id": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "createdAt": "2026-09-21T17:33:05.782Z",
  "updatedAt": "2026-09-21T17:33:05.782Z",
  "type": "dashboard",
  "slug": "dataspace",
  "name": "Dataspace",
  "installed": "9387dc5e",
  "version": "0.1.0",
  "traits": [
   "APPLICATION",
   "STANDALONE"
  ]
 },
 {
  "id": "01a0c507-4f69-74a4-87dd-49ffa029e062",
  "createdAt": "2026-09-21T17:33:05.769Z",
  "updatedAt": "2026-09-22T09:35:31.095Z",
  "type": "domain",
  "slug": "assembly",
  "name": "Assembly",
  "installed": "9387dc5e",
  "version": "0.0.1",
  "traits": [
   "EXPOSED",
   "TOOLING"
  ]
 },
 {
  "id": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "createdAt": "2026-09-21T17:33:05.781Z",
  "updatedAt": "2026-09-22T06:41:17.088Z",
  "type": "editor",
  "slug": "import",
  "name": "Import",
  "installed": "9387dc5e",
  "version": "0.1.0",
  "traits": [
   "MOUNTED",
   "APPLICATION",
   "STANDALONE",
   "EXPOSED"
  ]
 },
 {
  "id": "01a0c507-4f73-74a0-86a5-1c5b174f9850",
  "createdAt": "2026-09-21T17:33:05.779Z",
  "updatedAt": "2026-09-22T09:35:36.270Z",
  "type": "topography",
  "slug": "model",
  "name": "DroneAid model",
  "installed": "7ed791c2",
  "version": "0.0.0",
  "traits": [
   "DATASET",
   "FRAUGHT"
  ]
 },
 {
  "id": "01a0c878-6f1d-742e-b465-ad1e92746c61",
  "createdAt": "2026-09-22T09:35:31.101Z",
  "updatedAt": "2026-09-22T09:35:31.101Z",
  "type": "topology",
  "slug": "part",
  "name": "Parts",
  "installed": "df77ec35",
  "version": "0.0.1",
  "traits": [
   "DATASET"
  ]
 },
 {
  "id": "01a0c878-6f20-72e7-bccc-eab1c83cd072",
  "createdAt": "2026-09-22T09:35:31.104Z",
  "updatedAt": "2026-09-22T09:35:31.104Z",
  "type": "topology",
  "slug": "placement",
  "name": "Placements",
  "installed": "26dd52c0",
  "version": "0.0.1",
  "traits": [
   "DATASET"
  ]
 },
 {
  "id": "01a0c507-4f72-7510-8372-78e006010f07",
  "createdAt": "2026-09-21T17:33:05.778Z",
  "updatedAt": "2026-09-21T17:33:05.778Z",
  "type": "topology",
  "slug": "step",
  "name": "Steps",
  "installed": "71acd583",
  "version": "0.0.1",
  "traits": [
   "DATASET"
  ]
 }
]
```
### intent — 0 rows on this daemon

`POST /userspace/entities/intent/findAndCount {}` → `[[],0]`. Columns per datamap: `slug name? description? traits(EnumArray) trait(Json)`; relations `user m:1`, `mode m:1`.

### thread — 2 rows, beef's user (read-only sqlite; wire shape shown by the probe below)

```json
[
 {
  "id": "01a0c885-bbc6-76f1-84c9-f737d436164d",
  "created_at": 1790070602694,
  "updated_at": 1790070604513,
  "user": "01a0c4a4-861a-73de-854c-6c2b92626832",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "intent": null,
  "phase": "manual",
  "traits": "[]",
  "trait": "{}",
  "counter": 1,
  "cursor": 0,
  "parent": null
 },
 {
  "id": "01a0c8af-458f-758d-a351-f69ffee6157a",
  "created_at": 1790073324943,
  "updated_at": 1790073326438,
  "user": "01a0c4a4-861a-73de-854c-6c2b92626832",
  "mode": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "intent": null,
  "phase": "manual",
  "traits": "[]",
  "trait": "{}",
  "counter": 1,
  "cursor": 0,
  "parent": null
 }
]
```

Wire shape of a thread, `findOne` with `populate:['buffers','mode']` (probe user's own row, since deleted). `user` is a bare id when not populated; `mode` expands to the full Mode row; `buffers` is an array of Buffer rows each carrying `mode` as an id and NO back-reference `thread` (the cycle is cut at serialization).

```json
{
 "id": "01a0c8c0-6f1f-70c2-8735-81e67d3e59d4",
 "createdAt": "2026-09-22T10:54:09.695Z",
 "updatedAt": "2026-09-22T10:54:28.621Z",
 "user": "01a0c8bf-5a05-72da-ac44-0c59f14e03a1",
 "mode": {
  "id": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "createdAt": "2026-09-21T17:33:05.782Z",
  "updatedAt": "2026-09-21T17:33:05.782Z",
  "type": "dashboard",
  "slug": "dataspace",
  "name": "Dataspace",
  "description": "Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.",
  "installed": "9387dc5e",
  "version": "0.1.0",
  "traits": [
   "APPLICATION",
   "STANDALONE"
  ]
 },
 "intent": null,
 "phase": "manual",
 "traits": [
  "LABELED",
  "INTELLIGENT"
 ],
 "trait": {
  "INTELLIGENT": {
   "effort": "low"
  }
 },
 "counter": 0,
 "cursor": 0,
 "parent": null,
 "buffers": []
}
```
### buffer — 2 rows, beef's user (sqlite; `data` truncated to 600 chars — the importer's job log is 10 KB+)

```json
[
 {
  "id": "01a0c885-c2e1-7546-8a0c-43a630d2d47a",
  "created_at": 1790070604513,
  "updated_at": 1790073316833,
  "status": "PENDING",
  "data": "{\"jobs\":[{\"id\":\"flg0in\",\"name\":\"DRONEAID_model_latest.blend\",\"extension\":\"blend\",\"bytes\":4278416,\"state\":\"parsed\",\"progress\":60,\"log\":[{\"t\":\"00:00.00\",\"lvl\":\"SNIFF\",\"msg\":\"magic bytes matched BLEND — extension trusted\"},{\"t\":\"00:00.01\",\"lvl\":\"OK\",\"msg\":\"route: blend → blender → glTF 2.0 per object\"},{\"t\":\"00:00.01\",\"lvl\":\"OK\",\"msg\":\"4.1 MB landed on the intake\"},{\"t\":\"00:00.01\",\"lvl\":\"WORK\",\"msg\":\"decoding with blender headless — blend → blender → glTF 2.0 per object\"},{\"t\":\"00:02.10\",\"lvl\":\"OK\",\"msg\":\"blender 5.2.2 LTS · 30 mesh(es) · 4 material(s) · 70,600 triangles\"},{\"t\":\"00:02.10\",\"lvl\":\"…[12352 chars]",
  "view": null,
  "index": 0,
  "traits": "[\"LABELED\"]",
  "trait": "{\"LABELED\":{\"name\":\"import #0\"}}",
  "mode": "01a0c507-4f75-74cc-909c-aa3031e775d1",
  "thread": "01a0c885-bbc6-76f1-84c9-f737d436164d"
 },
 {
  "id": "01a0c8af-4b66-72ce-8f2b-e27487898174",
  "created_at": 1790073326438,
  "updated_at": 1790073326438,
  "status": "PENDING",
  "data": "{}",
  "view": null,
  "index": 0,
  "traits": "[\"LABELED\"]",
  "trait": "{\"LABELED\":{\"name\":\"dataspace #0\"}}",
  "mode": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "thread": "01a0c8af-458f-758d-a351-f69ffee6157a"
 }
]
```

Cyclic populate on the wire: `POST /userspace/entities/buffer/findOne {where:{id}, options:{populate:['thread','thread.buffers','mode']}}` — the buffer's thread's buffers contains the SAME buffer again, as a fresh object (no `$ref`, cut one level deeper). This is the shape `cast()` walks into the identity map.

```json
{
 "id": "01a0c8c1-27af-70d2-8145-b2f4ddf77878",
 "createdAt": "2026-09-22T10:54:56.943Z",
 "updatedAt": "2026-09-22T10:54:56.943Z",
 "status": "PENDING",
 "data": {
  "hello": "world"
 },
 "view": null,
 "index": 0,
 "traits": [
  "LABELED"
 ],
 "trait": {
  "LABELED": {
   "name": "dataspace #0"
  }
 },
 "mode": {
  "id": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "createdAt": "2026-09-21T17:33:05.782Z",
  "updatedAt": "2026-09-21T17:33:05.782Z",
  "type": "dashboard",
  "slug": "dataspace",
  "name": "Dataspace",
  "description": "Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.",
  "installed": "9387dc5e",
  "version": "0.1.0",
  "traits": [
   "APPLICATION",
   "STANDALONE"
  ]
 },
 "thread": {
  "id": "01a0c8c1-277b-736f-8c15-6d00c746e86a",
  "createdAt": "2026-09-22T10:54:56.891Z",
  "updatedAt": "2026-09-22T10:54:56.943Z",
  "user": "01a0c8bf-5a05-72da-ac44-0c59f14e03a1",
  "mode": "01a0c507-4f76-7543-8c19-ab18231bd033",
  "intent": null,
  "phase": "manual",
  "traits": [],
  "trait": {},
  "counter": 1,
  "cursor": 0,
  "parent": null,
  "buffers": [
   {
    "id": "01a0c8c1-27af-70d2-8145-b2f4ddf77878",
    "createdAt": "2026-09-22T10:54:56.943Z",
    "updatedAt": "2026-09-22T10:54:56.943Z",
    "status": "PENDING",
    "data": {
     "hello": "world"
    },
    "view": null,
    "index": 0,
    "traits": [
     "LABELED"
    ],
    "trait": {
     "LABELED": {
      "name": "dataspace #0"
     }
    },
    "mode": "01a0c507-4f76-7543-8c19-ab18231bd033"
   }
  ]
 }
}
```
### turn — droneaid has 0; two real rows from `hello-world` (sqlite; `parts` truncated to 700 chars)

```json
[
 {
  "id": "01a0af2b-7953-70df-aba7-ab36e2cae10a",
  "created_at": 1789645257043,
  "updated_at": 1789645257043,
  "role": "assistant",
  "parts": "[{\"type\":\"thinking\",\"text\":\"I should look up the etymology of \\\"boat\\\" on Wikipedia.\\n\\n\",\"signature\":\"EpoCCpABCBEYAipAx+rl0iNeIw0XeWWmbKC5H9C5rYt6pCJSmxCPyzmOpGfjtYtUb4mNtj9mNiddt/nfsr00IxwN+ltl8cKe3D8CkTIPY2xhdWRlLXNvbm5ldC01OABCCHRoaW5raW5nWiQyMjU4ZWM0My1mMzdlLTQzYTctYjcwMy1hMGYwZWM3NTI3YzioAa2jr9UGEgwXAigBVaoeXqIO5xMaDEJWPNoU5IQo8rfoWCIwMYG9+K53XDY0yD6NN+B9z0reejdZkUFrUc7wwwNEese81x3D4SiiwPGLm5V3T3LlKjfYDCbizj6S1/SwoY9GGZi9sypEmU/04pX1VDI3vJL1Rjy9pbIFjIf6CZzE1hPA4nN4dRw5dHlhGAE=\"},{\"type\":\"tool_use\",\"id\":\"toolu_017Ju7tL55NoJMzMpkRkXbWc\",\"name\":\"web_search\",\"input\":{\"query\":\"Boat etymology\"}}]",
  "meta": "{\"state\":\"tools\",\"usage\":{\"input_tokens\":136652,\"cache_creation_input_tokens\":0,\"cache_read_input_tokens\":11689,\"output_tokens\":72,\"output_tokens_details\":{\"thinking_tokens\":19}},\"provider\":{\"stop_reason\":\"tool_use\"}}",
  "parent": "e0a69f7c-1631-4caf-86cc-0fdab6f7ed6e",
  "thread": "01a0a502-14dc-71ee-b6d7-3096b969c322",
  "mode": "01a0808e-7dc9-74ef-a92d-c45e53b36435"
 },
 {
  "id": "01a0af2b-7953-70df-aba7-af0b0d7da1a0",
  "created_at": 1789645257043,
  "updated_at": 1789645257063,
  "role": "user",
  "parts": "[{\"type\":\"tool_result\",\"id\":\"toolu_017Ju7tL55NoJMzMpkRkXbWc\",\"output\":{\"results\":[{\"title\":\"Coxswain\",\"url\":\"https://en.wikipedia.org/wiki/Coxswain\",\"snippet\":\"person in charge of a boat, particularly its navigation and steering. The etymology of the word gives a literal meaning of \\\"boat servant\\\" since it comes\"},{\"title\":\"List of state and territory name etymologies of the United States\",\"url\":\"https://en.wikipedia.org/wiki/List_of_state_and_territory_name_etymologies_of_the_United_States\",\"snippet\":\"Online Etymology Dictionary. Retrieved 2007-02-24. \\\"Georgia\\\". Behindthename.com. Retrieved 2007-02-24. Harper, Douglas. \\\"George\\\". Online Etymology Dictionary\"},{\"title\":\"Etymology of Lond…[2192 chars]",
  "meta": null,
  "parent": "01a0af2b-7953-70df-aba7-ab36e2cae10a",
  "thread": "01a0a502-14dc-71ee-b6d7-3096b969c322",
  "mode": "01a0808e-7dc9-74ef-a92d-c45e53b36435"
 }
]
```

`parts` is the hallucination packet list: `{type:'thinking'|'text'|'tool_use'|'tool_result', …}`; `meta` carries `{state, usage, provider}` on assistant turns and is `null` on user turns. `parent` chains turns; the first assistant turn's parent is the seed id.

### activity — 0 live. VirtualEntity, no table

Shape per datamap: columns `id createdAt updatedAt type status error? steps(Json)`; relations `user mode thread? buffer? turn?`. Doors: reads only + `/:id/stdout` (SSE of `controller.Record`) + `/:id/stdin/{SIGTERM,SIGSTOP,SIGCONT,SIGKILL}` returning `controller.toJSON()`.

## 4. Totals and user scope

`POST …/count {where:{}}` per entity on droneaid (beef's user for userspace):

```text
literal 61 (part 25 · placement 36 · step 0)
symbol 71
mode 7
intent 0
thread 2
buffer 2
turn 0
activity 0
user/identity/daemon — no door (404)
```

**Which entities are user-filtered and how.** `aperture/userspace.js`: `intent` rides the ORM filter param only; `thread` gets `datamap.scope(ctx => ({user}))`; `buffer` and `turn` get `scope(ctx => ({thread:{user}}))`; `activity` gets `scope({user})`. `scoped()` in the datamap shard MERGES `ctx.scope` INTO `input.where` (and into `input.data` for create), so the client cannot escape: the probe user asking `find {where:{user:<beef's id>}}` got `[]`, and `removeOne` on a buffer it did not own failed with the merged where visible in the error:

```text
BufferEntity not found ({
  thread: { user: '01a0c8bf-5a05-72da-ac44-0c59f14e03a1' },
  id: 'None'
})
```

Kernel entities (`/entities/literal|symbol|mode`) are UNSCOPED and unauthenticated past the Bearer: any user sees and can write every row.

## 5. Typology descriptors — trait blocks

Only `thread` declares per-trait schemas in typology. `literal`/`symbol`/`mode` descriptors have `traits: v.array(v.string())` and `trait: v.record(...)` — no per-trait shape. The per-trait shapes for kernel rows live in the DOMAIN (`~/.viva/registry/assembly/domain/assembly/schematics.js` → `TRAITS`), which is what a trait editor must read for literals.

`subsystems/typology/schematics/entities/thread.js`:

```js
import { v } from "../v.js";
import { Tier, Tune } from "../primitives/hallucination.js";

// thread.trait.INTELLIGENT — the thread's intelligence dial. Read through
// v.thread.trait(row, "INTELLIGENT"): claim-gated (traits includes the name), validated,
// cast; projected field-by-field at the harness: tune → policy, effort → settings.
// Absent fields mean "the mode decides".
const INTELLIGENT = v.object({
  tune: v.union([Tier, Tune]).optional(),
  effort: v.enum(["none", "low", "medium", "high"]).optional(),
  rounds: v.integer({ minimum: 1, maximum: 50 }).optional(),
  thinking: v.boolean().optional(),
});

const VOCAL = v.object({
  language: v.string().optional(),
  tune: v.union([Tier, Tune]).optional(),
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v.boolean().optional(),
});

export const ThreadDescriptor = {
  $id: "Thread",
  own: {
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
    cursor: v.integer().default(0).optional(),
    counter: v.integer().default(0).optional(),
  },
  relations: {
    user: () => v.rel(v.user()).optional(),
    mode: () => v.rel(v.mode()).optional(),
    intent: () => v.rel(v.intent()).optional(),
    parent: () => v.rel(v.thread()).optional(),
    children: () => v.array(v.thread()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  traits: { INTELLIGENT, VOCAL },
  narrowable: ["trait"],
};

```
`subsystems/typology/schematics/entities/literal.js`:

```js
import { v } from "../v.js";

export const LiteralDescriptor = {
  $id: "Literal",
  own: {
    slug: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
    symbol: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    symbols: () => v.array(v.symbol()).optional(),
    mode: () => v.mode().optional(),
  },
  narrowable: ["trait", "symbol"],
};

```
`subsystems/typology/schematics/entities/symbol.js`:

```js
import { v } from "../v.js";

export const SymbolDescriptor = {
  $id: "Symbol",
  own: {
    slug: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    literals: () => v.array(v.literal()).optional(),
    mode: () => v.mode().optional(),
  },
  narrowable: ["trait"],
};

```
`subsystems/typology/schematics/entities/mode.js`:

```js
import { v } from "../v.js";

export const ModeDescriptor = {
  $id: "Mode",
  own: {
    slug: v.string().optional(),
    type: v.string().optional(),
    name: v.string().optional(),
    description: v.string().optional(),
    version: v.string().optional(),
    installed: v.boolean().optional(),
    traits: v.array(v.string()).optional(),
  },
  relations: {
    intents: () => v.array(v.intent()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
    literals: () => v.array(v.literal()).optional(),
    symbols: () => v.array(v.symbol()).optional(),
  },
  narrowable: ["traits"],
};

```

Assembly domain: ontology→allowed-traits table and the trait enum with payload comments (`entities/kernel/Literal.ts`):

```js

// what a literal of each ontology may carry, and what it is to the fold — read by the writer,
// rendered by a harness, restated by a mode that draws a form from it
//   traits  the traits a literal of this ontology may carry — mint refuses any other
//   layer   placements may name it as their layer: a part's own, or a step of one
//   stack   a part is a layer stack — its own layer, then its SEQUENCED steps, weakest first
export const ONTOLOGIES = {
  part: { traits: ["LABELED", "SOURCED", "MODELED", "PARAMETRIC", "COUNTED", "SEQUENCED"], layer: true, stack: true },
  placement: { traits: ["LABELED", "PLACED", "JOINED"], layer: false, stack: false },
  step: { traits: ["LABELED", "INSTRUCTED", "PREPARED"], layer: true, stack: false },
};
// …
export const TRAITS = { LABELED, SOURCED, MODELED, PARAMETRIC, COUNTED, SEQUENCED, PLACED, JOINED, INSTRUCTED, PREPARED };
```
```ts
export enum LiteralTraitsEnum {
  LABELED = "LABELED", // { name, description? }
  // part
  SOURCED = "SOURCED", // { file, object?, scale?, url?, credit? } — the Blender round trip
  MODELED = "MODELED", // { file, tris?, bbox? } — a GLB on the freight, metres, Y-up
  PARAMETRIC = "PARAMETRIC", // { generator, params } — geometry generated at read
  COUNTED = "COUNTED", // { qty } — the kit. what makes a part a thing you order
  SEQUENCED = "SEQUENCED", // { steps: [slug] } — the layer stack, weakest first
  // placement
  PLACED = "PLACED", // { layer, name, parent?, ref, translation?, rotation?, scale?, active?, params? }
  JOINED = "JOINED", // { joins: [PATH], torque? } — what this fastener's placement holds
  // step
  INSTRUCTED = "INSTRUCTED", // { text, warn?, images? }
  PREPARED = "PREPARED", // { parts?: { slug: qty }, tools?: [symbol] }
}
```

The per-trait `v.object` shapes (`LABELED SOURCED MODELED PARAMETRIC COUNTED SEQUENCED PLACED JOINED INSTRUCTED PREPARED`), `schematics.js:26-92`:

```js
export const TORQUES = ["loose", "snug", "tight"];

export const PATH = v.string().desc('A placement\'s path inside a folded stack — names joined by "/", a grafted part prefixing its own. Example: "motor.0/propeller.0"');

export const GENERATOR = v.object({
  generator: v.string().desc('A key in generators/. Example: "fastener.bolt"'),
  params: v.record(v.string(), v.any()).desc('What the generator takes. Example: { thread: "M3", length: 16 } '),
}).desc('Geometry generated at read from a generator and its params. Example: { generator: "fastener.bolt", params: { thread: "M3", length: 16 } }');

// the trait payloads, by trait — what a literal of an ontology carries under trait[TRAIT]
export const LABELED = v.object({
  name: v.string().desc('A name for eyes. Example: "Bolt, short"'),
  description: v.string().optional().desc('One line more. Example: "M3x16"'),
}).desc('A name and, optionally, a description. Example: { name: "Motor arm" }');

export const SOURCED = v.object({
  file: v.string().desc('The file the geometry came from. Example: "DRONEAID_model_latest.blend"'),
  object: v.string().optional().desc('The object inside that file. Example: "Frame_Bottom"'),
  scale: v.number().optional().desc("Metres per unit of the source, applied at embed — the round trip's factor. Example: 0.05"),
  url: v.string().optional().desc('Where the source lives. Example: "https://example.org/pt10.step"'),
  credit: v.string().optional().desc('Who made it. Example: "Partizan"'),
}).desc('Where a part\'s geometry came from — the back-pointer for the Blender round trip. Example: { file: "model.blend", object: "Frame_Bottom", scale: 0.05 }');

export const MODELED = v.object({
  file: v.string().desc('Freight path of the GLB, metres, Y-up. Example: "parts/bottom_plate.glb"'),
  tris: v.integer().optional().desc("Triangle count. Example: 2160"),
  bbox: VEC3.optional().desc("Size of the bounding box in metres, x y z. Example: [0.2823, 0.002, 0.097]"),
}).desc('A part\'s own geometry as a file on the freight. A part that has only an interior carries none. Example: { file: "parts/arm.glb", tris: 80, bbox: [0.1263, 0.0075, 0.1729] }');

export const PARAMETRIC = GENERATOR;

export const COUNTED = v.object({
  qty: v.integer().desc("How many the kit ships. What the build uses is bom(), derived. Example: 6"),
}).desc("The kit's count of a part — what says it is a thing you order. Example: { qty: 6 }");

export const SEQUENCED = v.object({
  steps: v.array(v.string()).desc('Step slugs, weakest first — the layer stack. Example: ["frame.01", "frame.02"]'),
}).desc('A part\'s steps in order. Example: { steps: ["frame.01"] }');

export const PLACED = v.object({
  layer: v.string().desc('The slug of the layer this placement belongs to — a part\'s own layer, or a step of it. Example: "motor"'),
  name: v.string().desc('Its name among the siblings under the same parent, in the same layer. Instances number from 0. Example: "propeller.0"'),
  parent: PATH.optional().desc('The path of the placement above it in this same layer; absent at the layer\'s root. Example: "housing.0"'),
  ref: v.string().desc('The slug of the part it places. Never absent — a placement that places nothing is not a placement. Example: "propeller"'),
  translation: VEC3.optional().desc("Metres, Y-up, in the parent's frame. Example: [0.0053, 0.0097, 0.0007]"),
  rotation: QUAT.optional().desc("Quaternion xyzw. Example: [0, 0, 0, 1]"),
  scale: VEC3.optional().desc("Per axis. Example: [1, 1, 1]"),
  active: v.boolean().optional().desc("false removes it from this layer on — how a step takes something away. Example: false"),
  params: v.record(v.string(), v.any()).optional().desc("Overrides the part's generator params for this one occurrence — a cable's route. Example: { route: [[0, 0, 0], [0.1, 0, 0]] }"),
}).desc('One occurrence of a part: which layer it is in, what it places, where. The same layer, parent and name again is an over — only what changes. Example: { layer: "motor", name: "propeller.0", ref: "propeller", translation: [0, 0.022, 0] }');

export const JOINED = v.object({
  joins: v.array(PATH).desc('The placements this one holds together, by their paths in the fold. Example: ["bottom_plate.0", "arm.0"]'),
  torque: v.enum(TORQUES).optional().desc('How far it is done up; a later layer tightens. Example: "loose"'),
}).desc('What a fastener\'s placement holds. Which kind of joint it is, is a joint.* symbol on the literal. Example: { joins: ["bottom_plate.0", "arm.0"], torque: "loose" }');

export const INSTRUCTED = v.object({
  text: v.array(v.string()).desc('The instruction, one sentence per entry. Example: ["Place one arm at the appropriate position on top."]'),
  warn: v.array(v.string()).optional().desc('Warnings, said before the instruction. Example: ["Don\'t tighten it yet! Leave it loose."]'),
  images: v.array(v.string()).optional().desc('Freight paths. Example: ["manual/cf5a470bc835.webp"]'),
}).desc('What a step tells the builder. Example: { text: ["Thread the 16mm bolt."], warn: ["Leave it loose."] }');

export const PREPARED = v.object({
  parts: v.record(v.string(), v.integer()).optional().desc('Part slug → how many to lay out. Example: { bolt_m3_16: 6, arm: 4 }'),
  tools: v.array(v.string()).optional().desc('tool.* symbols. Example: ["tool.hex_2_0"]'),
}).desc('The manual\'s Prepare block, authored; bom() is the check. Example: { parts: { arm: 4 }, tools: ["tool.hex_2_0"] }');

```

Mode traits enum (`runtime/daemon/entities/daemon/Mode.ts`): `BOOTED APPLICATION STANDALONE TOPOGRAPHICAL TOPOLOGICAL DATASET DATASINK HARNESSED CONVERSATIONAL AGENTIC TOOLING EMITTER GENERATIVE EXPOSED INTENTED FRAUGHT MOUNTED` + deprecated `CHAOSMONKEY BUFFERED SELFEVIDENT TOOLED`. Thread: `MASKED AIMED QUEUEING LABELED` (+ `INTELLIGENT`/`VOCAL` shapes above, claim-gated). Thread phase CHECK: `inert manual continuous escort stream`. Buffer status CHECK: `PENDING ACTIVE DONE ERROR STALE` (a lowercase `pending` fails the CHECK with a 500; `READY` fails validation with a 400).

## 6. `/subscribe` SSE trace

Two listeners (`GET /userspace/entities/thread/subscribe`, `…/buffer/subscribe`, header `authorization: Bearer`, response `text/event-stream`), then create thread → create buffer → updateOne thread → removeOne buffer → removeOne thread. Lines are `data: {op, entity}` followed by a blank line. Observed: a buffer create ARRIVES on the thread stream as a thread `update` (the thread's `counter` moved), with `mode` POPULATED in that event but bare in the delete; buffer events carry `user` stamped flat (the reactive shard adds it for the filter). No `create` for the thread in this run because it was created before the listener attached; the earlier run shows `update`+`delete` on thread.

```text
12:54:56.N thread data: {"op":"update","entity":{"id":"01a0c8c1-277b-736f-8c15-6d00c746e86a","createdAt":"2026-09-22T10:54:56.891Z","updatedAt":"2026-09-22T10:54:56.943Z","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1","mode":{"id":"01a0c507-4f76-7543-8c19-ab18231bd033","createdAt":"2026-09-21T17:33:05.782Z","updatedAt":"2026-09-21T17:33:05.782Z","type":"dashboard","slug":"dataspace","name":"Dataspace","description":"Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.","installed":"9387dc5e","version":"0.1.0","traits":["APPLICATION","STANDALONE"]},"intent":null,"phase":"manual","traits":[],"trait":{},"counter":1,"cursor":0,"parent":null}}

12:54:57.N thread data: {"op":"delete","entity":{"id":"01a0c8c1-277b-736f-8c15-6d00c746e86a","createdAt":"2026-09-22T10:54:56.891Z","updatedAt":"2026-09-22T10:54:56.943Z","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1","mode":"01a0c507-4f76-7543-8c19-ab18231bd033","intent":null,"phase":"manual","traits":[],"trait":{},"counter":1,"cursor":0,"parent":null}}

12:54:56.N buffer data: {"op":"create","entity":{"id":"01a0c8c1-27af-70d2-8145-b2f4ddf77878","literals":[],"symbols":[],"createdAt":"2026-09-22T10:54:56.943Z","updatedAt":"2026-09-22T10:54:56.943Z","status":"PENDING","data":{"hello":"world"},"view":null,"index":0,"traits":["LABELED"],"trait":{"LABELED":{"name":"dataspace #0"}},"mode":{"id":"01a0c507-4f76-7543-8c19-ab18231bd033","createdAt":"2026-09-21T17:33:05.782Z","updatedAt":"2026-09-21T17:33:05.782Z","type":"dashboard","slug":"dataspace","name":"Dataspace","description":"Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.","installed":"9387dc5e","version":"0.1.0","traits":["APPLICATION","STANDALONE"]},"thread":{"id":"01a0c8c1-277b-736f-8c15-6d00c746e86a","createdAt":"2026-09-22T10:54:56.891Z","updatedAt":"2026-09-22T10:54:56.943Z","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1","mode":{"id":"01a0c507-4f76-7543-8c19-ab18231bd033","createdAt":"2026-09-21T17:33:05.782Z","updatedAt":"2026-09-21T17:33:05.782Z","type":"dashboard","slug":"dataspace","name":"Dataspace","description":"Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.","installed":"9387dc5e","version":"0.1.0","traits":["APPLICATION","STANDALONE"]},"intent":null,"phase":"manual","traits":[],"trait":{},"counter":1,"cursor":0,"parent":null},"user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1"}}

12:54:57.N buffer data: {"op":"delete","entity":{"id":"01a0c8c1-27af-70d2-8145-b2f4ddf77878","createdAt":"2026-09-22T10:54:56.943Z","updatedAt":"2026-09-22T10:54:56.943Z","status":"PENDING","data":{"hello":"world"},"view":null,"index":0,"traits":["LABELED"],"trait":{"LABELED":{"name":"dataspace #0"}},"mode":"01a0c507-4f76-7543-8c19-ab18231bd033","thread":"01a0c8c1-277b-736f-8c15-6d00c746e86a","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1"}}

12:54:28.N thread data: {"op":"update","entity":{"id":"01a0c8c0-6f1f-70c2-8735-81e67d3e59d4","createdAt":"2026-09-22T10:54:09.695Z","updatedAt":"2026-09-22T10:54:28.621Z","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1","mode":"01a0c507-4f76-7543-8c19-ab18231bd033","intent":null,"phase":"manual","traits":["LABELED","INTELLIGENT"],"trait":{"INTELLIGENT":{"effort":"low"}},"counter":0,"cursor":0,"parent":null}}

12:54:28.N thread data: {"op":"delete","entity":{"id":"01a0c8c0-6f1f-70c2-8735-81e67d3e59d4","createdAt":"2026-09-22T10:54:09.695Z","updatedAt":"2026-09-22T10:54:28.621Z","user":"01a0c8bf-5a05-72da-ac44-0c59f14e03a1","mode":"01a0c507-4f76-7543-8c19-ab18231bd033","intent":null,"phase":"manual","traits":["LABELED","INTELLIGENT"],"trait":{"INTELLIGENT":{"effort":"low"}},"counter":0,"cursor":0,"parent":null}}
```
## 7. `sets` and the assembly barrel

```ts
  network: { identity, daemon },
  daemon: { user, mode },
  kernel: { literal, symbol },
  userspace: { intent, thread, turn, buffer },
  transient: { activity },
};

```
Assembly domain barrel `~/.viva/registry/assembly/domain/assembly/assembly.viva.js` (entities · schematics · aperture · tools · manifest):

```js
export * from "./entities/index.js";
export * as schematics from "./schematics.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";

export const manifest = {
  type: "domain",
  slug: "assembly",
  name: "Assembly",
  description:
    "Parts, placements and steps as literals — the one TOPOGRAPHICAL symbol says which. " +
    "A part is what a thing IS; a placement is one occurrence of it under a layer and always places something; a step is one layer of change. " +
    "A part's interior is the placements that name it as their layer; the repository is the only writer and folds a stack into a glTF-shaped tree. " +
    "Doors over the repository for the App; the tools every assembly mode's agent shares, minting under the caller's mode.",
  version: "0.0.1",
  traits: ["EXPOSED", "TOOLING"],
};

```
`/metadata/modes` for the daemon (what a catalog's mode tier shows):

```json
[
 {
  "type": "domain",
  "slug": "assembly",
  "name": "Assembly",
  "traits": [
   "EXPOSED",
   "TOOLING"
  ],
  "metadata": "/daemon/droneaid/mode/domain/assembly/metadata"
 },
 {
  "type": "topology",
  "slug": "part",
  "name": "Parts",
  "traits": [
   "DATASET"
  ],
  "metadata": "/daemon/droneaid/mode/topology/part/metadata"
 },
 {
  "type": "topology",
  "slug": "placement",
  "name": "Placements",
  "traits": [
   "DATASET"
  ],
  "metadata": "/daemon/droneaid/mode/topology/placement/metadata"
 },
 {
  "type": "topology",
  "slug": "step",
  "name": "Steps",
  "traits": [
   "DATASET"
  ],
  "metadata": "/daemon/droneaid/mode/topology/step/metadata"
 },
 {
  "type": "topography",
  "slug": "model",
  "name": "DroneAid model",
  "traits": [
   "DATASET",
   "FRAUGHT"
  ],
  "metadata": "/daemon/droneaid/mode/topography/model/metadata"
 },
 {
  "type": "editor",
  "slug": "import",
  "name": "Import",
  "traits": [
   "MOUNTED",
   "APPLICATION",
   "STANDALONE",
   "EXPOSED"
  ],
  "metadata": "/daemon/droneaid/mode/editor/import/metadata"
 },
 {
  "type": "dashboard",
  "slug": "dataspace",
  "name": "Dataspace",
  "traits": [
   "APPLICATION",
   "STANDALONE"
  ],
  "metadata": "/daemon/droneaid/mode/dashboard/dataspace/metadata"
 }
]
```
## 8. Operator grammar — measured, not assumed

`sanitize()` allow-list (options), verbatim:

```js
export const ALLOWED = new Set([
  "populate",
  "orderBy",
  "limit",
  "offset",
  "fields",
  "exclude",
  "onConflictFields",
  "onConflictAction",
  "onConflictExcludeFields",
]);

export function sanitize(options = {}) {
  const safe = {};
  for (const key of Object.keys(options)) {
    if (ALLOWED.has(key)) safe[key] = options[key];
  }
  return safe;
}
```
`resolveTraits` (only wraps `find`/`findOne`, NOT `count`/`findAndCount`), verbatim:

```ts
  find(where, opts?) {
    return super.find(this.resolveTraits(where), opts);
  }

  findOne(where, opts?) {
    return super.findOne(this.resolveTraits(where), opts);
  }

  resolveTraits(where) {
    if (!where?.traits) return where;
    const { traits, ...rest } = where;

    const spec =
      typeof traits === "string"
        ? { $contains: [traits] }
        : Array.isArray(traits)
          ? { $contains: traits }
          : traits;

    const col = `\`${this.entityName.charAt(0).toLowerCase()}0\`.traits`;
    const has = (t) => ({ [raw(`${col} LIKE ?`, [`%${t}%`])]: [] });
    const hasNot = (t) => ({ [raw(`${col} NOT LIKE ?`, [`%${t}%`])]: [] });

    const conds = [
      ...(spec.$contains ?? []).map(has),
```
Probes against `/entities/literal` on droneaid:

```text
where / options                                   → result
{ontology: "placement"}   count                  → 36
{slug: {$like: "%arm%"}}  count                  → 5
{ontology: {$in: ["part","step"]}} count          → 25
{$or: [{ontology:"part"},{ontology:"step"}]} count → 25
{createdAt: {$gt: "2020-01-01"}} count            → 0   (created_at is epoch-ms INTEGER on disk; string compare)
{traits: ["PLACED"]}      find  fields:[slug,traits] → 2 rows (resolveTraits → LIKE '%PLACED%')
{traits: ["PLACED"]}      count                  → 0   (count skips resolveTraits; mikro treats array as $contains json)
{traits: {$contains:["PLACED"]}} count           → 500 "select … `l0`.`traits` @> '[\"PLACED\"]' - SQLITE_ERROR: unrecognized token: \"@\""
{traits: {$none: ["PLACED"]}} count              → 500 "The operator \"none\" is not permitted"
options.populate: ["nope"]                       → 400 {"code":"VALIDATION","message":"Entity 'LiteralEntity' does not have property 'nope'"}
options.fields: ["slug","ontology"]              → 200 [{"id":…,"slug":"frame_star","ontology":"part"}]  (id always rides along)
options.filters / cache (not allow-listed)       → 200, silently dropped
data.status "pending" on buffer create           → 500 SQLITE_CONSTRAINT: CHECK constraint failed: status
data.status "READY" on buffer updateOne          → 400 "Trying to set BufferEntity.status of type 'string' to 'READY' of type 'string'"

```
So: mikro's `$like $in $or $gt $ne $nin $eq …` reach sqlite untouched on scalars; the `traits` sugar (`string | string[] | {$contains,$overlap,$none}`) is trustworthy on `find`/`findOne` ONLY. A v2 query builder should route trait claims through `find`, and take its counts from `findAndCount` with the same where — or the runtime gets one line (`count`/`findAndCount` wrapped like `find`).

## 9. Client stack and the current Svelte

`systems/anima/src/typology/prototypes/dataspace.js` (whole file):

```js
import { RemoteEntityManager, Vector, shape, shard } from "@vivalence/typology";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

// ugly retarded slop
export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, seed }) {
    this.connection = connection;
    this.em = new RemoteEntityManager(connection, {});

    for (const dossier of entities) {
      const repository = dossier.repository(dossier, this);

      const boot = new Vector()
        .use(shard.context.attach("dossier", dossier))
        .use(shard.context.attach("repository", repository))
        .use(shard.context.attach("dataspace", this));

      if (seed) seed(boot);
      if (dossier.boot) boot.slurp(dossier.boot);

      for (const fn of dossier.use ?? []) boot.use(fn);
      boot.affect(async () => {});

      const integrate = shape.selbstbestimmt(boot, strategy);
      if (repository.manage) this.em.register(dossier.name, repository, integrate);
      else repository.integrate = integrate;

      this.schemas.set(dossier.name, dossier);
      this[dossier.name] = repository;
    }
  }

  async init() {
    if (!this.connection) return;
    this.datamap = await this.connection.call("/datamap");
    this.em.schema = this.datamap;
  }

  async populate(names = []) {
    await Promise.all(
      names
        .filter((name) => this.em.repositoryMap[name])
        .map((name) => this.em.repositoryMap[name].find()),
    );
  }

  fork() {
    return this.em.fork();
  }
}

```
`subsystems/typology/prototypes/entity-manager.js` — `integrate`/`resolve`/`cast` (lines 120–215):

```js
  // first-sight passes through cast (relation walk) then runs the registered
  // integrator. Re-sight is just cast. The claim is synchronous so a nested
  // integrate on the same id (e.g. a child back-referencing its parent)
  // observes the parent as already-installed and does not re-fire.
  async integrate(name, raw, kind) {
    if (!raw?.id) return raw;
    const mapKey = this.key(name, raw.id);
    if (this.installed.has(mapKey)) return this.merge(name, raw, kind);
    this.installed.add(mapKey);
    try {
      const entity = await this.cast(name, raw, kind);
      const install = this.integrators[name];
      if (install) await install(entity, raw);
      return entity;
    } catch (error) {
      this.installed.delete(mapKey);
      throw error;
    }
  }

  async disintegrate(name, id) {
    this.drop(name, id);
  }

  async resolve(name, reference) {
    if (reference == null) return null;
    if (typeof reference === "string") return this.identity(name, reference) ?? reference;
    if (reference.id) {
      const repository = this.repositoryMap[name];
      if (!repository) return reference;
      return await repository.merge(reference);
    }
    return reference;
  }

  async cast(name, raw, kind) {
    const props = this.schema[name]?.properties;

    // Resolve relation refs into a fresh payload BEFORE merging. The reactive
    // store only ever sees fully-upgraded entity references, so any computed
    // filters fire on the final shape — not on pre-resolution string ids.
    const resolved = props ? { ...raw } : raw;
    if (props) {
      for (const [field, spec] of Object.entries(props)) {
        if (!spec.target || raw[field] == null) continue;
        if (spec.kind === "m:1") {
          resolved[field] = await this.resolve(spec.target, raw[field]);
        }
        if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(raw[field])) {
          resolved[field] = await Promise.all(raw[field].map((item) => this.resolve(spec.target, item)));
        }
      }
    }

    const entity = this.merge(name, resolved, kind);
    if (!props) return entity;

    for (const [field, spec] of Object.entries(props)) {
      if (spec.kind !== "1:m" || !spec.mappedBy) continue;
      const childRepo = this.repositoryMap[spec.target];
      if (!childRepo) continue;
      const mappedBy = spec.mappedBy;
      const hadExplicitArray = Array.isArray(resolved[field]);

      // When the parent cast received an explicit children array, enforce
      // the inverse on each child so the reactive collection agrees with
      // the explicit intake.
      if (hadExplicitArray) {
        for (const child of resolved[field]) {
          if (child && typeof child === "object" && child[mappedBy] !== entity) {
            child[mappedBy] = entity;
          }
        }
        this.refreshStore(spec.target);
      }

      if (!entity["$" + field]) {
        entity["$" + field] = computed(childRepo.$entities, (entities) =>
          entities.filter((child) =>
            child[mappedBy] === entity ||
            child[mappedBy]?.id === entity.id ||
            child[mappedBy] === entity.id,
          ),
        );
      }

      // Only route reads through the computed when the parent wasn't seeded
      // with an explicit array — otherwise preserve the direct assignment
      // merge() just made from `resolved[field]`.
      if (!hadExplicitArray) {
        Object.defineProperty(entity, field, {
          get() { return entity["$" + field].get(); },
          set() {},
          configurable: true,
        });
      }
```
`subsystems/typology/prototypes/remote-repository.js` — queries and subscribe (lines 69–206):

```js
  async find(where = {}, options = {}) {
    const local = this.$entities.get();
    if (this.persisted && local.length > 0) {
      this.revalidating = this.connection
        .call("/find", { where, options })
        .then((fresh) => this.epoch(async () => {
          const freshIds = new Set(fresh.map((r) => r.id));
          for (const e of this.$entities.get()) {
            if (!freshIds.has(e.id)) this.drop(e.id);
          }
          await Promise.all(fresh.map((raw) => this.cast(raw)));
        }))
        .catch((e) => console.error("[repo] revalidate", e));
      return this.epoch(() =>
        Promise.all(local.filter((e) => object.match(e, where)).map((e) => this.cast(e))),
      );
    }
    const results = await this.connection.call("/find", { where, options });
    return this.epoch(() => Promise.all(results.map((raw) => this.cast(raw))));
  }

  findOneLocal(where = {}) {
    return this.$entities.get().find((e) => object.match(e, where)) ?? null;
  }

  async findOne(where = {}, options = {}) {
    const local = this.findOneLocal(where);
    if (local) return local;
    const result = await this.connection.call("/findOne", { where, options });
    return result ? await this.cast(result) : null;
  }

  async findAndCount(where = {}, options = {}) {
    const [entities, count] = await this.connection.call("/findAndCount", { where, options });
    return [await this.epoch(() => Promise.all(entities.map((raw) => this.cast(raw)))), count];
  }

  async count(where = {}, options = {}) {
    return this.connection.call("/count", { where, options });
  }

  // ── mutations ────────────────────────────────────────────────────

  async create(data = {}) {
    const result = await this.connection.call("/create", { data });
    return await this.merge(result);
  }

  async upsert(data = {}) {
    const result = await this.connection.call("/upsert", { data });
    return await this.merge(result);
  }

  async ensure(data = {}) {
    const result = await this.connection.call("/ensure", { data });
    return await this.merge(result);
  }

  async updateOne(where = {}, data = {}) {
    const result = await this.connection.call("/updateOne", { where, data });
    return await this.merge(result);
  }

  async update(where = {}, data = {}) {
    const results = await this.connection.call("/update", { where, data });
    return this.epoch(() => Promise.all(results.map((r) => this.merge(r))));
  }

  async removeOne(where = {}) {
    await this.connection.call("/removeOne", { where });
    if (where.id) this.drop(where.id);
  }

  async remove(where = {}) {
    const { ids } = await this.connection.call("/remove", { where });
    for (const id of ids) this.drop(id);
  }

  // ── subscription ─────────────────────────────────────────────────

  subscribe(where = {}, callback) {
    const repo = this;
    const options = {
      headers: { "x-filter": JSON.stringify(where) },
      body: { where },
      resumed: () => {
        repo.find(where).catch((error) => console.warn(`[probe] resync failed`, error));
      },
    };

    const handle = async (event) => {
      if (event.op === "delete") {
        repo.drop(event.entity?.id ?? event.entity);
        if (callback) callback(null, event);
      } else {
        const merged = await repo.merge(event.entity);
        if (callback) callback(merged, event);
      }
    };

    const unsubscribe = this.connection.subscribe("/subscribe", handle, options);
    this.subscriptions.add(unsubscribe);
    const teardown = () => {
      unsubscribe();
      this.subscriptions.delete(unsubscribe);
    };
    return teardown;
  }

  // ── identity ─────────────────────────────────────────────────────

  async merge(raw) {
    if (!raw) return null;
    const result = await this.entityManager.integrate(this.managedName, raw, this.kind);
    this.store();
    return result;
  }

  async cast(raw) {
    return this.merge(raw);
  }

  drop(id) {
    this.entityManager.drop(this.managedName, id);
    this.store();
  }

  store() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, this.encode(this.$entities.get()));
    } catch (error) {
      // persistence is best-effort: quota/availability failures must not break the
      // in-memory store. Logged, never silent.
      console.warn(`[repo] persist failed @ ${this.storageKey}`, error);
    }
  }
}
```
What `cast()` PRODUCES for a thread row on the client (the dossier adds the rest): an instance of `Thread` with `$mode` atom + `mode` getter, `$buffers`/`$turns` computeds filtering the buffer/turn stores by back-reference, `daemon` attached, `traits` mutated to include `LABELED` on first sight. `Buffer` (anima `entities/buffer.js`) holds `$data $view $traits $trait` atoms behind plain getters/setters — this is why the dashboard's `plain()` strips `$` keys and reads prototype getters. `Turn` is a bare class (`role parts meta thread mode parent`).

`commons/dashboards/dataspace/Dashboard.svelte` — script and markup (lines 1–597; the 400-line `<style>` block omitted, it is token-driven `var(--colors-skeleton-*)` with 9 literal hexes all in the echarts palette). `Dashboard.graph.bak.svelte` is a dead 458-line echarts graph variant, not pasted.

```svelte
<script>
  import { Section, Chip, skins, Canvas, stage, Json } from "@vivalence/drapes";
  const { Filter } = skins;

  stage.use(stage.tree, stage.tooltip, stage.renderer);

  const { terminal } = $props();
  const daemon = terminal.daemon;

  const NODE_COLOR = {
    string: "#87B56A",
    number: "#1EBCB5",
    bigint: "#1EBCB5",
    boolean: "#D4A054",
    branch: "#7E8DC8",
    empty: "#5b6b77",
  };

  function hierarchy(value, name) {
    if (value !== null && typeof value === "object") {
      const pairs = Array.isArray(value)
        ? value.map((item, index) => [String(index), item])
        : Object.entries(value);
      const label = Array.isArray(value) ? `${name} [${pairs.length}]` : name;
      return {
        name: label,
        itemStyle: { color: NODE_COLOR.branch, borderColor: NODE_COLOR.branch },
        children: pairs.map(([key, child]) => hierarchy(child, key)),
      };
    }
    const color = NODE_COLOR[typeof value] ?? NODE_COLOR.empty;
    return { name: `${name}: ${value}`, itemStyle: { color, borderColor: color } };
  }

  function treeOptions(root, layout, depth) {
    const orthogonal = layout !== "radial";
    return {
      tooltip: { trigger: "item", triggerOn: "mousemove", formatter: (params) => params.name },
      series: [{
        type: "tree",
        data: [root],
        layout: orthogonal ? "orthogonal" : "radial",
        orient: orthogonal ? "LR" : undefined,
        top: orthogonal ? "1%" : "10%",
        bottom: orthogonal ? "1%" : "10%",
        left: orthogonal ? "16%" : "10%",
        right: orthogonal ? "24%" : "10%",
        symbol: "circle",
        symbolSize: 6,
        roam: true,
        expandAndCollapse: true,
        initialTreeDepth: depth,
        label: orthogonal
          ? {
              position: "top",
              align: "center",
              verticalAlign: "bottom",
              fontSize: 10,
              fontFamily: "monospace",
              color: "#dbe7ee",
              distance: 4,
            }
          : { fontSize: 9, fontFamily: "monospace", color: "#dbe7ee" },
        leaves: orthogonal
          ? { label: { position: "right", align: "left", verticalAlign: "middle", distance: 6 } }
          : {},
        lineStyle: { color: "#3a4a58", width: 1, curveness: orthogonal ? 0.4 : 0.2 },
        emphasis: { focus: "descendant", lineStyle: { width: 1.5 } },
        animationDuration: 300,
        animationDurationUpdate: 300,
      }],
    };
  }

  function initGraph(container) {
    const chart = stage.chart(container);
    chart.setOption(treeOptions(hierarchy(detail, activeKey), graphLayout, graphExpanded ? 99 : 2));
    return { resize: () => chart.resize(), dispose: () => chart.dispose() };
  }

  const shortId = (id) => String(id).slice(0, 8);

  const field = (path) => {
    const keys = path.split(".");
    return (row) => keys.reduce((value, key) => (value == null ? value : value[key]), row);
  };

  const column = (label, get, width = 180) => ({ label, get, pill: false, width });
  const chip = (label, get, width = 130) => ({ label, get, pill: true, width });

  const IDENTIFY = {
    mode: (row) => row.slug,
    thread: (row) => row.phase ?? shortId(row.id),
    buffer: (row) => `${row.status ?? "?"}#${row.index ?? "?"}`,
  };
  const identify = (target, name) => (IDENTIFY[name] ?? ((row) => shortId(row.id)))(target);
  const relation = (name, width = 170) =>
    column(name, (row) => {
      const target = row[name];
      if (target == null) return null;
      return typeof target === "object" ? identify(target, name) : shortId(target);
    }, width);

  // TODO: derive ENTITIES and SORTABLE from `daemon.datamap` (mikro metadata, already
  // on the client via `/datamap`) instead of hand-listing columns. Trait sub-columns
  // cannot come from that surface — `trait` is one json column there — so a per-domain
  // column override would ride alongside the derived scalars.
  //
  // Prior, language-learning specific literal/symbol entries (kept for reference):
  //   {
  //     key: "literal",
  //     options: { orderBy: { rank: "asc" } },
  //     populate: [],
  //     columns: [
  //       column("slug", field("slug"), 230),
  //       chip("ontology", field("ontology"), 140),
  //       column("known", field("trait.TRANSLATED.known"), 260),
  //       column("learning", field("trait.TRANSLATED.learning"), 260),
  //       column("rank", field("rank"), 70),
  //       column("traits", field("traits"), 360),
  //       column("symbol", field("symbol"), 320),
  //     ],
  //   },
  //   {
  //     key: "symbol",
  //     options: { orderBy: { slug: "asc" } },
  //     populate: [],
  //     columns: [
  //       column("slug", field("slug"), 260),
  //       column("label", field("trait.LABELED.name"), 240),
  //       column("traits", field("traits"), 340),
  //     ],
  //   },
  const ENTITIES = [
    {
      key: "literal",
      options: { orderBy: { slug: "asc" } },
      populate: [],
      columns: [
        column("slug", field("slug"), 230),
        chip("ontology", field("ontology"), 140),
        column("traits", field("traits"), 360),
        column("trait", field("trait"), 320),
        column("symbol", field("symbol"), 320),
      ],
    },
    {
      key: "symbol",
      options: { orderBy: { slug: "asc" } },
      populate: [],
      columns: [
        column("slug", field("slug"), 260),
        column("traits", field("traits"), 340),
        column("trait", field("trait"), 320),
      ],
    },
    {
      key: "mode",
      options: { orderBy: { type: "asc", slug: "asc" } },
      populate: [],
      columns: [
        chip("type", field("type"), 150),
        column("slug", field("slug"), 220),
        chip("installed", field("installed"), 100),
        column("traits", field("traits"), 520),
      ],
    },
    {
      key: "intent",
      options: {},
      populate: [],
      columns: [relation("mode", 220)],
    },
    {
      key: "thread",
      options: {},
      populate: ["mode"],
      columns: [
        chip("phase", field("phase"), 150),
        column("counter", field("counter"), 90),
        column("cursor", field("cursor"), 90),
        relation("mode"),
        column("traits", field("traits"), 260),
      ],
    },
    {
      key: "buffer",
      options: { orderBy: { index: "asc" } },
      populate: ["mode", "thread"],
      columns: [
        chip("status", field("status"), 140),
        column("index", field("index"), 70),
        relation("mode"),
        relation("thread"),
      ],
    },
    {
      key: "turn",
      options: {},
      populate: ["mode", "thread"],
      columns: [
        chip("role", field("role"), 120),
        column("parts", (row) => (row.parts ?? []).length, 80),
        relation("thread"),
        relation("mode"),
      ],
    },
  ];

  const PAGE_SIZES = [100, 250, 500, 1000];
  const ROW_HEIGHT = 28;
  const OVERSCAN = 8;
  // TODO: derive from the datamap's scalar properties. Prior set carried "rank" after "slug".
  const SORTABLE = new Set([
    "slug", "ontology", "type", "installed",
    "status", "index", "phase", "counter", "cursor", "role",
  ]);

  let activeKey = $state("literal");
  let request = $state({ status: "loading", rows: [], total: 0 });
  let query = $state("");
  let selected = $state(null);
  let detailView = $state("fields");
  let openFields = $state(new Set());
  let graphLayout = $state("LR");
  let graphExpanded = $state(false);
  let limit = $state(250);
  let offset = $state(0);
  let sortKey = $state("slug"); // prior default: "rank"
  let sortDir = $state("asc");

  let scrollEl = $state(null);
  let scrollTop = $state(0);
  let viewportHeight = $state(600);

  function applyDefaultSort(entityKey) {
    const order = ENTITIES.find((entity) => entity.key === entityKey)?.options.orderBy;
    const first = order ? Object.keys(order)[0] : null;
    sortKey = first;
    sortDir = first ? order[first] : "asc";
  }

  function sortBy(label) {
    if (!SORTABLE.has(label)) return;
    if (sortKey === label) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = label;
      sortDir = "asc";
    }
    offset = 0;
  }

  function pickEntity(key) {
    activeKey = key;
    offset = 0;
    query = "";
    applyDefaultSort(key);
  }

  function setLimit(next) {
    limit = next;
    offset = 0;
  }

  function page(direction) {
    offset = Math.max(0, offset + direction * limit);
  }

  function select(row) {
    if (selected?.id === row.id) {
      selected = null;
      return;
    }
    selected = row;
    openFields = new Set();
    detailView = "fields";
    console.log(`[dataspace] ${activeKey}`, {
      entity: row,
      ownKeys: Object.keys(row),
      readable: [...readableKeys(row)],
      plain: plain(row),
    });
  }

  function toggleField(name) {
    const next = new Set(openFields);
    next.has(name) ? next.delete(name) : next.add(name);
    openFields = next;
  }

  function scalarText(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  const isStore = (value) =>
    value && typeof value === "object" &&
    typeof value.subscribe === "function" && typeof value.get === "function";

  const isEntityRef = (value) =>
    value && typeof value === "object" && !Array.isArray(value) &&
    !(value instanceof Date) && value.constructor !== Object && "id" in value;

  const reference = (value) => (value.slug ? { id: value.id, slug: value.slug } : { id: value.id });

  function readableKeys(object) {
    const keys = new Set();
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(object))) {
      if (key === "constructor") continue;
      if (typeof descriptor.value === "function") continue;
      keys.add(key);
    }
    let proto = Object.getPrototypeOf(object);
    while (proto && proto !== Object.prototype) {
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (descriptor.get) keys.add(key);
      }
      proto = Object.getPrototypeOf(proto);
    }
    return keys;
  }

  function plain(value, seen = new WeakSet(), depth = 0) {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value.toISOString();
    const type = typeof value;
    if (type === "function" || isStore(value)) return undefined;
    if (type !== "object") return value;
    if (value instanceof Set || value instanceof Map) return undefined;
    if (seen.has(value)) return "[circular]";
    if (depth > 24) return undefined;
    seen.add(value);
    if (Array.isArray(value)) {
      const mapped = value.map((item) => (isEntityRef(item) ? reference(item) : plain(item, seen, depth + 1)));
      seen.delete(value);
      return mapped;
    }
    const out = {};
    for (const key of readableKeys(value)) {
      if (key.startsWith("$")) continue;
      let raw;
      try {
        raw = value[key];
      } catch {
        continue;
      }
      if (typeof raw === "function" || isStore(raw)) continue;
      if (isEntityRef(raw)) {
        out[key] = reference(raw);
        continue;
      }
      const rendered = plain(raw, seen, depth + 1);
      if (rendered !== undefined) out[key] = rendered;
    }
    seen.delete(value);
    return out;
  }

  const active = $derived(ENTITIES.find((entity) => entity.key === activeKey));

  const indexed = $derived(
    request.rows.map((row) => ({ row, hay: JSON.stringify(row).toLowerCase() })),
  );
  const shown = $derived.by(() => {
    if (query.length === 0) return request.rows;
    const needle = query.toLowerCase();
    return indexed.filter((entry) => entry.hay.includes(needle)).map((entry) => entry.row);
  });

  const rowCount = $derived(shown.length);
  const visibleCount = $derived(Math.ceil(viewportHeight / ROW_HEIGHT));
  const maxStart = $derived(Math.max(0, rowCount - visibleCount));
  const startIndex = $derived(
    Math.min(maxStart, Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)),
  );
  const endIndex = $derived(Math.min(rowCount, startIndex + visibleCount + OVERSCAN * 2));
  const windowed = $derived(shown.slice(startIndex, endIndex));
  const padTop = $derived(startIndex * ROW_HEIGHT);
  const padBottom = $derived(Math.max(0, (rowCount - endIndex) * ROW_HEIGHT));
  const lastPage = $derived(offset + limit >= request.total);
  const template = $derived(active.columns.map((column) => `${column.width}px`).join(" "));
  const gridWidth = $derived(active.columns.reduce((sum, column) => sum + column.width, 0));
  const detail = $derived(selected ? plain(selected) : null);

  function leaves(value) {
    const parts = [];
    const walk = (node) => {
      for (const [key, inner] of Object.entries(node)) {
        if (inner !== null && typeof inner === "object") walk(inner);
        else parts.push(`${key}=${inner}`);
      }
    };
    walk(value);
    return parts.join("  ");
  }

  function tooltip(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  }

  $effect(() => {
    const key = active.key;
    const pageLimit = limit;
    const pageOffset = offset;
    selected = null;
    scrollTop = 0;
    if (scrollEl) scrollEl.scrollTop = 0;
    request = { status: "loading", rows: [], total: 0 };
    daemon.entities[key]
      .findAndCount({}, {
        populate: active.populate,
        orderBy: sortKey ? { [sortKey]: sortDir } : undefined,
        limit: pageLimit,
        offset: pageOffset,
      })
      .then(([rows, total]) => activeKey === key && (request = { status: "ready", rows, total }))
      .catch((error) =>
        activeKey === key &&
        (request = { status: "error", message: String(error?.message ?? error), rows: [], total: 0 }),
      );
  });
</script>

{#snippet valueCell(value, isPill)}
  {#if value === null || value === undefined || value === ""}
    <span class="muted">—</span>
  {:else if Array.isArray(value)}
    {#if value.length === 0}
      <span class="muted">—</span>
    {:else}
      <span class="pills">{#each value as item}<span class="pill">{item}</span>{/each}</span>
    {/if}
  {:else if typeof value === "object"}
    <span class="leaves">{leaves(value)}</span>
  {:else if isPill}
    <span class="pill solo">{value}</span>
  {:else}
    <span class="text">{value}</span>
  {/if}
{/snippet}

{#snippet fieldRow(name, value)}
  {#if value !== null && typeof value === "object"}
    <div class="field">
      <button class="field-head" type="button" onclick={() => toggleField(name)}>
        <span class="field-arrow" class:open={openFields.has(name)}>▸</span>
        <span class="field-name">{name}</span>
        <span class="field-kind">
          {Array.isArray(value) ? `[ ${value.length} ]` : `{ ${Object.keys(value).length} }`}
        </span>
      </button>
      {#if openFields.has(name)}
        <div class="field-json"><Json {value} /></div>
      {/if}
    </div>
  {:else}
    <div class="field scalar">
      <span class="field-name">{name}</span>
      <span class="field-value">{scalarText(value)}</span>
    </div>
  {/if}
{/snippet}

<div class="dataspace">
  <div class="tabs">
    {#each ENTITIES as entity}
      <Chip
        label={entity.key}
        active={entity.key === activeKey}
        onclick={() => pickEntity(entity.key)}
      />
    {/each}
  </div>

  <div class="body">
    <div class="toolbar">
      <Section label={activeKey} count={request.total} rule={false} />
      <div class="toolbar-right">
        <Filter bind:query />
        <div class="pager">
          <div class="page-sizes">
            {#each PAGE_SIZES as size}
              <button class="page-size" class:on={limit === size} onclick={() => setLimit(size)}>{size}</button>
            {/each}
          </div>
          <button class="page-nav" disabled={offset === 0} onclick={() => page(-1)}>‹</button>
          <span class="page-info">
            {request.total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, request.total)} / {request.total}
          </span>
          <button class="page-nav" disabled={lastPage} onclick={() => page(1)}>›</button>
        </div>
      </div>
    </div>

    <div
      class="table-scroll"
      bind:this={scrollEl}
      bind:clientHeight={viewportHeight}
      onscroll={() => (scrollTop = scrollEl.scrollTop)}
    >
      {#if request.status === "loading"}
        <div class="notice">loading…</div>
      {:else if request.status === "error"}
        <div class="notice error">{request.message}</div>
      {:else if shown.length === 0}
        <div class="notice">no rows</div>
      {:else}
        <div class="grid" style="width: {gridWidth}px">
          <div class="grid-head" style="grid-template-columns: {template}">
            {#each active.columns as heading}
              <div
                class="grid-hcell"
                class:sortable={SORTABLE.has(heading.label)}
                onclick={() => sortBy(heading.label)}
              >
                <span class="hcell-label">{heading.label}</span>
                {#if SORTABLE.has(heading.label)}
                  <span
                    class="chevron"
                    class:active={sortKey === heading.label}
                    class:desc={sortKey === heading.label && sortDir === "desc"}
                  >▾</span>
                {/if}
              </div>
            {/each}
          </div>
          {#if padTop > 0}
            <div class="grid-spacer" style="height: {padTop}px"></div>
          {/if}
          {#each windowed as row (row.id)}
            <div
              class="grid-row"
              class:selected={selected?.id === row.id}
              style="grid-template-columns: {template}"
              onclick={() => select(row)}
            >
              {#each active.columns as datum}
                {@const value = datum.get(row)}
                <div class="grid-cell" title={tooltip(value)}>{@render valueCell(value, datum.pill)}</div>
              {/each}
            </div>
          {/each}
          {#if padBottom > 0}
            <div class="grid-spacer" style="height: {padBottom}px"></div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if selected}
    <div class="detail">
      <div class="detail-head">
        <span class="detail-title">{activeKey} · {selected.slug ?? shortId(selected.id)}</span>
        <div class="detail-views">
          {#each ["fields", "graph"] as mode}
            <button class="detail-view" class:on={detailView === mode} onclick={() => (detailView = mode)}>
              {mode}
            </button>
          {/each}
        </div>
        <button class="detail-close" onclick={() => (selected = null)}>×</button>
      </div>
      <div class="detail-body">
        {#if detailView === "fields"}
          <div class="detail-fields">
            {#each Object.entries(detail) as [name, value] (name)}
              {@render fieldRow(name, value)}
            {/each}
          </div>
        {:else}
          <div class="graph-view">
            <div class="graph-bar">
              <div class="graph-layouts">
                {#each ["LR", "radial"] as layout}
                  <button class="graph-btn" class:on={graphLayout === layout} onclick={() => (graphLayout = layout)}>
                    {layout}
                  </button>
                {/each}
              </div>
              <button class="graph-btn" class:on={graphExpanded} onclick={() => (graphExpanded = !graphExpanded)}>
                expand all
              </button>
            </div>
            <div class="graph-canvas">
              {#key `${selected.id}:${graphLayout}:${graphExpanded}`}
                <Canvas init={initGraph} />
              {/key}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
```
`commons/dashboards/dataspace/dataspace.viva.js`:

```js
import { App, v } from "@vivalence/typology";

const manifest = {
  type: "dashboard",
  slug: "dataspace",
  name: "Dataspace",
  description: "Live dataspace viewer. Literal corpus map, retention landscape, trace timeline.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

const application = new App("Dashboard.svelte");

export { manifest, application };

```
## 10. Screenshots

Not delivered (see top). Theme tokens the current file uses: `--colors-skeleton-0-surface`, `--colors-skeleton-1-boundary`, and the drapes `Chip · Section · skins.Filter · Json · Canvas · stage` components; anima's live theme was `nordic`.

## Nice-to-haves

- **`persist()` dump** — no live caller in anima (`grep '\.persist()' systems/anima/src` → 0), so localStorage holds no repository cache. Its encoder collapses `m:1` to `{id}` and `1:m`/`m:n` to `[{id}]` and drops non-plain objects.
- **Dag.svelte** — not run.
- **IDENTIFY successors** (how to name a foreign row in a relation cell), beef's call but the data says: `mode` → `type/slug`; `thread` → `trait.LABELED.name` when LABELED else `phase · shortId`; `buffer` → `trait.LABELED.name` (the runtime stamps `"<mode> #<index>"` at create) else `status#index`; `turn` → `role · parts.length · shortId`; `literal` → `slug` (`trait.LABELED.name` as tooltip); `symbol` → `slug`; `user` → `shortId` (User has no name column: `roles`, `config` only); `activity` → `type · status`.
