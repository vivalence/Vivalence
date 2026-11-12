<!-- limit: 16000 chars · printed 11-17 by walk-11-17/faculties.probe.js, JSON.stringify(x, null, 2), whole; recorded wire, no network -->
=== dialogue · stream · anthropic
[
  {
    "event": "/turn/open",
    "turn": {
      "role": "assistant"
    }
  },
  {
    "event": "/part/open",
    "index": 0,
    "part": {
      "type": "thinking",
      "text": "",
      "signature": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "text": "weighing"
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "signature": "signature-1"
    }
  },
  {
    "event": "/part/close",
    "index": 0
  },
  {
    "event": "/part/open",
    "index": 1,
    "part": {
      "type": "text",
      "text": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 1,
    "delta": {
      "text": "let me look that up"
    }
  },
  {
    "event": "/part/close",
    "index": 1
  },
  {
    "event": "/part/open",
    "index": 2,
    "part": {
      "type": "tool_use",
      "id": "toolu-1",
      "name": "lookup",
      "input": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 2,
    "delta": {
      "input": "{\"query\":"
    }
  },
  {
    "event": "/part/delta",
    "index": 2,
    "delta": {
      "input": "\"casa\"}"
    }
  },
  {
    "event": "/part/close",
    "index": 2
  },
  {
    "event": "/turn/close",
    "meta": {
      "state": "tools",
      "usage": {
        "output_tokens": 29
      },
      "provider": {
        "stop_reason": "tool_use"
      }
    }
  },
  null,
  null
]
=== dialogue · stream · openrouter
[
  {
    "event": "/turn/open",
    "turn": {
      "role": "assistant"
    }
  },
  {
    "event": "/part/open",
    "index": 0,
    "part": {
      "type": "thinking",
      "text": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "text": "weighing"
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "text": " cognates"
    }
  },
  {
    "event": "/part/close",
    "index": 0
  },
  {
    "event": "/part/open",
    "index": 1,
    "part": {
      "type": "text",
      "text": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 1,
    "delta": {
      "text": "let me look that up"
    }
  },
  {
    "event": "/part/close",
    "index": 1
  },
  {
    "event": "/part/open",
    "index": 2,
    "part": {
      "type": "tool_use",
      "id": "call-1",
      "name": "lookup",
      "input": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 2,
    "delta": {
      "input": "{\"query\":"
    }
  },
  {
    "event": "/part/delta",
    "index": 2,
    "delta": {
      "input": "\"casa\"}"
    }
  },
  {
    "event": "/part/close",
    "index": 2
  },
  {
    "event": "/turn/close",
    "meta": {
      "state": "tools",
      "usage": {
        "prompt_tokens": 11,
        "completion_tokens": 29
      },
      "provider": {
        "finish_reason": "tool_calls",
        "model": "openai/gpt-5.1"
      }
    }
  }
]
=== dialogue · render · anthropic
{
  "role": "assistant",
  "parts": [
    {
      "type": "text",
      "text": "considering the word"
    },
    {
      "type": "thinking",
      "text": "weighing cognates",
      "signature": "signature-1"
    },
    {
      "type": "tool_use",
      "id": "toolu-1",
      "name": "lookup",
      "input": {
        "query": "casa"
      }
    },
    {
      "type": "alien",
      "dialect": "anthropic",
      "block": {
        "type": "web_search_result",
        "url": "https://example.test"
      }
    }
  ],
  "meta": {
    "state": "tools",
    "usage": {
      "input_tokens": 11,
      "output_tokens": 29
    },
    "provider": {
      "stop_reason": "tool_use",
      "model": "claude-opus-4-6"
    }
  }
}
=== dialogue · render · openrouter
{
  "role": "assistant",
  "parts": [
    {
      "type": "thinking",
      "text": "weighing cognates"
    },
    {
      "type": "text",
      "text": "considering the word"
    },
    {
      "type": "tool_use",
      "id": "call-1",
      "name": "lookup",
      "input": {
        "query": "casa"
      }
    }
  ],
  "meta": {
    "state": "tools",
    "usage": {
      "prompt_tokens": 11,
      "completion_tokens": 29
    },
    "provider": {
      "finish_reason": "tool_calls",
      "model": "openai/gpt-5.1"
    }
  }
}
=== dialogue · stream · the belt's loop
[
  {
    "event": "/turn/open",
    "turn": {
      "role": "assistant"
    }
  },
  {
    "event": "/part/open",
    "index": 0,
    "part": {
      "type": "tool_use",
      "id": "use-1",
      "name": "lookup",
      "input": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "input": "{\"query\":"
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "input": "\"casa\"}"
    }
  },
  {
    "event": "/part/close",
    "index": 0
  },
  {
    "event": "/turn/close",
    "meta": {
      "state": "tools"
    }
  },
  {
    "event": "/tool/call",
    "id": "use-1",
    "name": "lookup",
    "input": {
      "query": "casa"
    }
  },
  {
    "event": "/tool/yield",
    "id": "use-1",
    "result": {
      "condition": "NOMINAL",
      "output": {
        "message": "casa means house",
        "literal": [
          {
            "id": "literal-1"
          }
        ]
      }
    }
  },
  {
    "event": "/turn/full",
    "turn": {
      "role": "user",
      "parts": [
        {
          "type": "tool_result",
          "id": "use-1",
          "condition": "NOMINAL",
          "output": {
            "message": "casa means house",
            "literal": [
              {
                "id": "literal-1"
              }
            ]
          }
        }
      ]
    }
  },
  {
    "event": "/turn/open",
    "turn": {
      "role": "assistant"
    }
  },
  {
    "event": "/part/open",
    "index": 0,
    "part": {
      "type": "text",
      "text": ""
    }
  },
  {
    "event": "/part/delta",
    "index": 0,
    "delta": {
      "text": "casa means house"
    }
  },
  {
    "event": "/part/close",
    "index": 0
  },
  {
    "event": "/turn/close",
    "meta": {
      "state": "complete"
    }
  },
  {
    "event": "/response/close",
    "meta": {
      "state": "complete",
      "rounds": 2
    }
  }
]
=== object · render · the belt
{
  "open": null,
  "condition": "NOMINAL",
  "turns": [
    {
      "role": "assistant",
      "parts": [
        {
          "type": "object",
          "data": {
            "verdict": "casa",
            "grade": 0.5
          }
        }
      ],
      "meta": {
        "state": "complete"
      }
    }
  ],
  "output": {
    "object": {
      "verdict": "casa",
      "grade": 0.5
    }
  },
  "meta": {
    "state": "complete",
    "rounds": 1
  }
}
=== verbatim · stream · deepgram nova-3
[
  {
    "event": "/turn/open",
    "turn": {
      "role": "user"
    }
  },
  {
    "event": "/verbatim/partial",
    "transcript": "ciao a"
  },
  {
    "event": "/verbatim/final",
    "transcript": "ciao a tutti",
    "words": [
      {
        "word": "ciao",
        "start": 0,
        "end": 0.3,
        "confidence": 0.97,
        "language": "it"
      }
    ]
  },
  {
    "event": "/turn/close"
  }
]
=== verbatim · stream · deepgram flux
[
  {
    "event": "/turn/open",
    "turn": {
      "role": "user"
    }
  },
  {
    "event": "/verbatim/partial",
    "transcript": "so"
  },
  {
    "event": "/verbatim/partial",
    "transcript": "so the"
  },
  {
    "event": "/verbatim/eager",
    "transcript": "so the plan"
  },
  {
    "event": "/verbatim/resume"
  },
  {
    "event": "/verbatim/final",
    "transcript": "so the plan is simple",
    "words": [
      {
        "word": "so",
        "confidence": 0.9
      }
    ]
  },
  {
    "event": "/turn/close"
  }
]
=== speech · stream · elevenlabs
[
  {
    "event": "/audio/packet",
    "audio": "AAAAAAAAAAAAAAAAAAAAAA==",
    "rate": 16000,
    "codec": "pcm_16000",
    "pts": 0
  },
  {
    "event": "/audio/packet",
    "audio": "AAAAAAAAAAAAAAAAAAAAAA==",
    "rate": 16000,
    "codec": "pcm_16000",
    "pts": 0.0005
  }
]
=== picture · render · openrouter
{
  "images": [
    {
      "type": "image",
      "media": "image/png",
      "data": "iVBORw0KGgo"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 4160,
    "total_tokens": 4172,
    "cost": 0.04
  }
}
=== choice · render · openrouter
{
  "same": {
    "yes": 0.03,
    "partly": 0.96,
    "no": 0.01
  },
  "grade": [
    0.01,
    0.97,
    0.02
  ],
  "ok": 0.97
}
=== verdicts
nova /turn/open valid · /verbatim/partial valid · /verbatim/final valid · /turn/close valid
flux /turn/open valid · /verbatim/partial valid · /verbatim/partial valid · /verbatim/eager valid · /verbatim/resume valid · /verbatim/final valid · /turn/close valid
speech /audio/packet valid · /audio/packet valid
faculties offered: ["verbatim:stream","speech:stream+render","dialogue:render+stream","choice:render","picture:render"]
