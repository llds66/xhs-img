import { CAPACITY } from "../constants/layout";

const blockCapacity = (type) => {
  if (type === "title") return CAPACITY.title;
  if (type === "subtitle") return CAPACITY.subtitle;
  return CAPACITY.paragraph;
};

const estimateLines = (block) => {
  const text = block.runs.map((run) => run.text).join("");
  const capacity = blockCapacity(block.type);
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / capacity));
};

const splitRunsByCharLimit = (runs, charLimit) => {
  const parts = [];
  let current = [];
  let currentLength = 0;

  const flush = () => {
    if (current.length > 0) {
      parts.push(current);
      current = [];
      currentLength = 0;
    }
  };

  for (const run of runs) {
    let remaining = run.text;
    while (remaining.length > 0) {
      const available = charLimit - currentLength;
      if (available <= 0) {
        flush();
      }
      const nextChunkLength = Math.max(1, Math.min(remaining.length, charLimit - currentLength));
      const chunk = remaining.slice(0, nextChunkLength);
      current.push({ text: chunk, strong: run.strong });
      currentLength += chunk.length;
      remaining = remaining.slice(nextChunkLength);

      if (currentLength >= charLimit) {
        flush();
      }
    }
  }

  flush();
  return parts;
};

const splitBlock = (block) => {
  const capacity = blockCapacity(block.type);
  const maxChars = capacity * 2;
  const textLength = block.runs.map((run) => run.text).join("").length;
  if (textLength <= maxChars) return [block];

  return splitRunsByCharLimit(block.runs, maxChars).map((runs) => ({
    type: block.type,
    runs
  }));
};

export const paginateBlocks = (blocks, options = {}) => {
  if (options.pageBreakOnly) {
    const manualPages = [];
    let currentPage = [];

    for (const block of blocks) {
      if (block.type === "pageBreak") {
        if (currentPage.length > 0) {
          manualPages.push(currentPage);
          currentPage = [];
        }
        continue;
      }
      currentPage.push(block);
    }

    if (currentPage.length > 0) {
      manualPages.push(currentPage);
    }

    return manualPages;
  }

  const maxLinesPerPage = options.maxLinesPerPage ?? 12;
  const pages = [];
  let currentPage = [];
  let currentLines = 0;

  const pushPageIfNeeded = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentLines = 0;
    }
  };

  for (const block of blocks) {
    if (block.type === "pageBreak") {
      pushPageIfNeeded();
      continue;
    }

    const fragments = splitBlock(block);
    for (const fragment of fragments) {
      const lines = estimateLines(fragment);
      if (currentLines + lines > maxLinesPerPage && currentPage.length > 0) {
        pushPageIfNeeded();
      }
      currentPage.push(fragment);
      currentLines += lines;
    }
  }

  pushPageIfNeeded();
  return pages;
};
