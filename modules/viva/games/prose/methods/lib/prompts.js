export const ProvisioningPrompt = {
  // provider: { api: "openai", model: "gpt-4o-2024-08-06" },
  provider: { api: "openai", model: "gpt-4o-mini-2024-07-18" },
  schema: {
    title: "Prose",
    type: "object",
    properties: {
      planning: {
        title: "Planning",
        description: `1. summarize the task. 2. define markers of high quality and task success. 3. plan the prose structure.`,
        type: "string",
      },
      prose: {
        title: "Prose",
        description: `The prose to be generated. HTML formatted, using the tailwind css typography helper class .prose.

Available HTML elements in prose blocks:
- Headings: <h1>Main Title</h1> to <h4>Sub-sub-heading</h4>
- Paragraphs: <p>Regular text content goes here.</p>
- Links: <a href="#">Clickable text</a>
- Lists: 
  <ul>
    <li>Unordered item</li>
  </ul>
  <ol>
    <li>Ordered item</li>
  </ol>
- Blockquotes: <blockquote>Quoted content</blockquote>
- Inline code: <code>function()</code>
- Code blocks: 
  <pre><code>
  function example() {
    return 'Hello, World!';
  }
  </code></pre>
- Strong/Bold: <strong>Important text</strong>
- Emphasis/Italic: <em>Emphasized text</em>
- Tables:
  <table>
    <thead><tr><th>Header</th></tr></thead>
    <tbody><tr><td>Cell</td></tr></tbody>
  </table>
- Horizontal rule: <hr>`,
        type: "string",
      },
    },
    required: ["planning", "prose"],
    additionalProperties: false,
  },
  template: `### Instructions
You are an expert teacher generating educational content. Create prose in HTML format, optimized for Tailwind CSS typography.

Your content will be rendered within a <article class="prose">{YOUR PROSE}</article> element, so only provide the inner HTML.
<article class="prose>{prose}</article>. you generate {prose}. not article.prose.

You are given an goal that you must follow. The goal is a specific objective that the prose must achieve. You must generate prose that satisfies this goal. the ultimate goal is educational.

you are also given a set of constraints that you must follow. The constraints are about the specific topic, aspect, topic or theme that is to be covered in the prose. You must generate prose that satisfies these constraints.

<GOAL>
{{goal}}
</GOAL>

<CONSTRAINTS>
Don't give any additional advice or further instructions to the reader. Dont moralize or be preachy. 
{{#constraints}}
{{.}}
{{/constraints}}
</CONSTRAINTS>
`,
};
