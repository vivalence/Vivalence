class Component extends DCLogic {
  parse(line) {
    const spans = [];
    const re = /\[(\w+)\|([^\]]*)\]/g;
    let at = 0, m;
    while ((m = re.exec(line))) {
      if (m.index > at) spans.push({ c: "i", t: line.slice(at, m.index) });
      spans.push({ c: m[1] === "P" ? "P b" : m[1], t: m[2] });
      at = re.lastIndex;
    }
    if (at < line.length) spans.push({ c: "i", t: line.slice(at) });
    return { spans };
  }
  renderVals() {
    const W = 96;
    const top = "[bd|┌" + "─".repeat(W) + "┐]";
    const mid = "[bd|│][sk|" + " ".repeat(W) + "][bd|│]";
    const bot = "[bd|└" + "─".repeat(W) + "┘]";
    const lines = [
      "[m|next]    [inv| on 3f9a ] [m|fresh]",
      "",
      "[m|model]   [inv| 1 gpt-image-2 openai ]   [P|2] flux.2-pro [m|black-forest-labs]   [P|3] gemini-2.5-flash-image [m|google]",
      "",
      "[m|aspect]  [m|1:1] [inv| 3:2 ] [m|2:3]  [bd|16:9]",
      "",
      "[m|count]   [inv| 1 ] [m|2]  [m|4]",
      "",
      "[m|refs]    ▣ wash-sample.jpg [inv| style ]   ▣ fox-photo.png [inv| subject ]   [P|+]",
      "",
      top, mid, mid, mid, mid, mid, mid, mid, mid, mid, mid, mid, mid, bot,
      "",
      "[sk| a1c0 ] [sk| 7d55 ]   [sk| 2e8f ] [inv| 3f9a ] [sk| 8c01 ]",
      "",
      "[P|›] make the tail bushier[inv| ]",
    ];
    return { lines: lines.map((l) => this.parse(l)) };
  }
}
