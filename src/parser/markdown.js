import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  breaks: false
});

const inlineTokensToRuns = (inlineToken) => {
  if (!inlineToken || !inlineToken.children) return [];
  const runs = [];
  let strongDepth = 0;
  const colorStack = [];

  for (const child of inlineToken.children) {
    if (child.type === "strong_open") {
      strongDepth += 1;
      continue;
    }
    if (child.type === "strong_close") {
      strongDepth = Math.max(0, strongDepth - 1);
      continue;
    }
    if (child.type === "html_inline") {
      const openSpanMatch = child.content.match(/^<span\b([^>]*)>/i);
      if (openSpanMatch) {
        const attrs = openSpanMatch[1] ?? "";
        const colorMatch =
          attrs.match(/\bdata-color=(['"])(.*?)\1/i) ||
          attrs.match(/\bcolor\s*:\s*([^;"']+)/i);
        colorStack.push(colorMatch?.[2] || colorMatch?.[1] || null);
        continue;
      }

      if (/^<\/span>/i.test(child.content)) {
        if (colorStack.length > 0) colorStack.pop();
        continue;
      }
    }
    if (child.type === "text") {
      runs.push({
        text: child.content,
        strong: strongDepth > 0,
        color: colorStack[colorStack.length - 1] || null
      });
    }
  }

  return runs;
};

export const parseMarkdownToBlocks = (markdownText) => {
  const tokens = md.parse(markdownText, {});
  const blocks = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === "hr") {
      blocks.push({ type: "pageBreak" });
      continue;
    }

    if (token.type === "heading_open") {
      const level = Number(token.tag.replace("h", ""));
      const inlineToken = tokens[index + 1];
      if (inlineToken?.type === "inline") {
        blocks.push({
          type: level === 1 ? "title" : "subtitle",
          runs: inlineTokensToRuns(inlineToken)
        });
      }
      continue;
    }

    if (token.type === "paragraph_open") {
      const inlineToken = tokens[index + 1];
      if (inlineToken?.type === "inline") {
        blocks.push({
          type: "paragraph",
          runs: inlineTokensToRuns(inlineToken)
        });
      }
    }
  }

  return blocks.filter((block) => {
    if (block.type === "pageBreak") return true;
    return block.runs && block.runs.some((run) => run.text.trim().length > 0);
  });
};
