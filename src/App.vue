<template>
  <main class="app-root">
    <aside class="panel">
      <div class="panel-title">
        <img class="panel-logo" src="/logo.svg" alt="xhs-img logo" />
        <h1>xhs-img</h1>
        <a
          class="panel-github"
          href="https://github.com/llds66/xhs-img"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          title="GitHub 仓库"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 .5C5.649.5.5 5.649.5 12c0 5.094 3.301 9.417 7.88 10.942.576.106.788-.25.788-.557 0-.274-.01-1-.016-1.962-3.206.697-3.882-1.544-3.882-1.544-.525-1.333-1.282-1.687-1.282-1.687-1.048-.717.08-.703.08-.703 1.16.081 1.771 1.191 1.771 1.191 1.03 1.765 2.704 1.255 3.364.96.105-.747.404-1.255.734-1.544-2.56-.291-5.251-1.28-5.251-5.698 0-1.258.45-2.286 1.189-3.092-.119-.292-.515-1.466.113-3.056 0 0 .97-.31 3.179 1.181A11.06 11.06 0 0112 6.086c.978.005 1.964.133 2.884.39 2.207-1.492 3.175-1.182 3.175-1.182.63 1.59.234 2.764.116 3.056.74.806 1.188 1.834 1.188 3.092 0 4.429-2.694 5.403-5.262 5.688.416.358.787 1.065.787 2.146 0 1.55-.014 2.801-.014 3.183 0 .309.208.669.794.555C20.202 21.414 23.5 17.092 23.5 12 23.5 5.649 18.351.5 12 .5z"
            />
          </svg>
        </a>
      </div>

      <div class="editor-toolbar">
        <div class="toolbar-row">
          <button class="tool-btn" :class="{ active: editor?.isActive('paragraph') }" @click="setParagraph">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 7h9a4 4 0 010 8H9M9 7v12" />
            </svg>
            正文
          </button>
          <button
            class="tool-btn"
            :class="{ active: editor?.isActive('heading', { level: 1 }) }"
            @click="toggleHeading(1)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5v14M12 5v14M5 12h7M16 7h3M16 12h3M16 17h3" />
            </svg>
            标题
          </button>
          <button class="tool-btn" :class="{ active: editor?.isActive('bold') }" @click="toggleBold">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5h5a3 3 0 010 6H8zm0 6h6a3 3 0 010 6H8z" />
            </svg>
            加粗
          </button>
          <div class="color-tool" :class="{ active: isSelectedColorActive }">
            <button class="tool-btn color-btn" @click="applyColor">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 17h14M7 14l5-9 5 9M10.5 11h3" />
              </svg>
              颜色
            </button>
            <input v-model="selectedColor" class="color-input" type="color" title="选择颜色" />
          </div>
        </div>
        <div class="toolbar-row">
          <button class="tool-btn" :disabled="!canUndo" @click="undoAction">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7L5 11l4 4M5 11h8a6 6 0 010 12h-1" />
            </svg>
            撤销
          </button>
          <button class="tool-btn" @click="insertPageBreak">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6h8l4 4v8H6zM14 6v4h4M4 16h16" />
            </svg>
            新建页面
          </button>
        </div>
      </div>
      <div class="author-config">
        <label class="author-label" for="authorName">作者</label>
        <input
          id="authorName"
          v-model="authorName"
          class="author-input"
          type="text"
          maxlength="24"
          placeholder="请输入页脚作者"
        />
      </div>

      <div ref="editorRef" :class="['editor', { 'editor-locating': isLocating }]">
        <EditorContent v-if="editor" :editor="editor" />
      </div>

      <div class="editor-meta">
        <p class="locate-hint">{{ locateHint }}</p>
        <p class="word-count">字数 {{ characterCount }}</p>
      </div>
    </aside>

    <section class="preview">
      <div class="preview-toolbar">
        <span class="preview-indicator">{{ currentPage + 1 }} / {{ pages.length || 1 }}</span>
        <div class="preview-export-actions">
          <button class="export-btn" :disabled="isExporting || !pages.length" @click="exportCurrentPng">
            {{ isExporting ? "导出中..." : "导出当前页" }}
          </button>
          <button class="export-btn" :disabled="isExporting || !pages.length" @click="exportAllPng">
            {{ isExporting ? "导出中..." : "导出全部（ZIP）" }}
          </button>
        </div>
      </div>
      <p v-if="exportProgress" class="export-progress">{{ exportProgress }}</p>

      <div class="preview-stage">
        <button class="nav-icon nav-left" :disabled="currentPage <= 0" @click="goPrev" aria-label="上一页">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 5.5L8 12l6.5 6.5" />
          </svg>
        </button>

        <XhsPage
          v-if="currentBlocks"
          :blocks="currentBlocks"
          :author-name="authorName"
          :page-number="currentPage + 1"
          :total-pages="pages.length"
        />

        <button
          class="nav-icon nav-right"
          :disabled="currentPage >= pages.length - 1"
          @click="goNext"
          aria-label="下一页"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.5 5.5L16 12l-6.5 6.5" />
          </svg>
        </button>
      </div>
    </section>

    <section class="export-stage" aria-hidden="true">
      <div v-for="(page, index) in pages" :key="`export-${index}`" :ref="(el) => setExportRef(el, index)">
        <XhsPage :blocks="page" :author-name="authorName" :page-number="index + 1" :total-pages="pages.length" />
      </div>
    </section>

    <footer class="site-footer">
      <a class="site-footer-link" href="https://llds.me" target="_blank" rel="noopener noreferrer">@LsAng</a>
    </footer>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import MarkdownIt from "markdown-it";
import XhsPage from "./components/XhsPage.vue";
import { ColorMark } from "./editor/colorMark";
import { parseMarkdownToBlocks } from "./parser/markdown";
import { paginateBlocks } from "./paginator";
import sampleMarkdown from "../content/post.md?raw";

const md = new MarkdownIt({ html: true, breaks: false });
const initialMarkdown = sampleMarkdown.trimEnd();

const currentPage = ref(0);
const isExporting = ref(false);
const exportProgress = ref("");
const exportPageRefs = ref([]);
const editorRef = ref(null);
const isLocating = ref(false);
const locateHint = ref("定位：第 1 页");
const markdownText = ref(sampleMarkdown);
const authorName = ref("©LsAng");
const selectedColor = ref("#1fd18f");
const pageMetas = ref([]);
const canUndo = ref(false);
const skipLocateFromPageWatch = ref(false);
const lastTextSelection = ref(null);
let locatingTimer = null;
let toPngFn = null;
let JSZipCtor = null;

const ensureExportDeps = async () => {
  if (!toPngFn) {
    const { toPng } = await import("html-to-image");
    toPngFn = toPng;
  }

  if (!JSZipCtor) {
    const { default: JSZip } = await import("jszip");
    JSZipCtor = JSZip;
  }
};

const escapeHtml = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const serializeNodeToMarkdown = (node) => {
  if (!node) return "";
  if (node.type === "text") {
    const rawText = node.text ?? "";
    const boldMark = node.marks?.some((mark) => mark.type === "bold");
    const colorMark = node.marks?.find((mark) => mark.type === "colorMark" && mark.attrs?.color);
    let text = rawText;

    if (colorMark) {
      const color = escapeHtml(colorMark.attrs.color);
      text = `<span data-color="${color}" style="color:${color}">${escapeHtml(rawText)}</span>`;
    }

    if (boldMark) text = `**${text}**`;
    return text;
  }
  if (node.type === "paragraph") {
    const text = (node.content ?? []).map(serializeNodeToMarkdown).join("");
    return text.trim().length > 0 ? `${text}\n\n` : "";
  }
  if (node.type === "heading") {
    const headingLevel = node.attrs?.level ?? 1;
    const prefix = "#".repeat(Math.min(6, headingLevel));
    const text = (node.content ?? []).map(serializeNodeToMarkdown).join("");
    return `${prefix} ${text}\n\n`;
  }
  if (node.type === "horizontalRule") return "---\n\n";
  return (node.content ?? []).map(serializeNodeToMarkdown).join("");
};

const getPageMetasFromDoc = (docNode) => {
  if (!docNode) return [];
  const metas = [];
  let pageStartPos = null;
  let pageEndPos = null;
  let hasContent = false;

  docNode.forEach((node, offset) => {
    const startPos = offset + 1;
    const endPos = startPos + node.nodeSize - 1;

    if (node.type.name === "horizontalRule") {
      if (hasContent && pageStartPos !== null && pageEndPos !== null) {
        metas.push({ startPos: pageStartPos, endPos: pageEndPos });
      }
      pageStartPos = null;
      pageEndPos = null;
      hasContent = false;
      return;
    }

    if (pageStartPos === null) pageStartPos = startPos;
    pageEndPos = endPos;
    if ((node.textContent ?? "").trim().length > 0) hasContent = true;
  });

  if (hasContent && pageStartPos !== null && pageEndPos !== null) {
    metas.push({ startPos: pageStartPos, endPos: pageEndPos });
  }

  return metas;
};

const getPageIndexByPos = (pos, metas) => {
  if (!metas.length) return 0;
  for (let index = 0; index < metas.length; index += 1) {
    const meta = metas[index];
    if (pos >= meta.startPos && pos <= meta.endPos) return index;
  }
  if (pos < metas[0].startPos) return 0;
  return metas.length - 1;
};

const updateLocateHint = (pageIndex) => {
  locateHint.value = `定位：第 ${pageIndex + 1} 页`;
};

const updateDerivedStateFromEditor = (editorInstance) => {
  const currentMarkdown = serializeNodeToMarkdown(editorInstance.getJSON()).trimEnd();
  markdownText.value = currentMarkdown;
  pageMetas.value = getPageMetasFromDoc(editorInstance.state.doc);
  canUndo.value = editorInstance.can().undo() && currentMarkdown !== initialMarkdown;

  const { from, to, empty } = editorInstance.state.selection;
  if (!empty) {
    lastTextSelection.value = { from, to };
  }
};

const syncFromScroll = () => {
  if (!editor.value || !editorRef.value || isLocating.value) return;
  const metas = pageMetas.value;
  if (!metas.length) return;

  const rect = editorRef.value.getBoundingClientRect();
  const pos = editor.value.view.posAtCoords({
    left: rect.left + 20,
    top: rect.top + 24
  });
  if (!pos?.pos) return;

  const pageIndex = getPageIndexByPos(pos.pos, metas);
  updateLocateHint(pageIndex);
  if (currentPage.value !== pageIndex) {
    skipLocateFromPageWatch.value = true;
    currentPage.value = pageIndex;
  }
};

const attachScrollListener = () => {
  if (!editorRef.value) return;
  editorRef.value.removeEventListener("scroll", syncFromScroll);
  editorRef.value.addEventListener("scroll", syncFromScroll, { passive: true });
};

const editor = useEditor({
  extensions: [StarterKit, ColorMark],
  content: md.render(sampleMarkdown),
  autofocus: false,
  onCreate: ({ editor: editorInstance }) => {
    updateDerivedStateFromEditor(editorInstance);
    nextTick(attachScrollListener);
  },
  onUpdate: ({ editor: editorInstance }) => {
    updateDerivedStateFromEditor(editorInstance);
    nextTick(attachScrollListener);
  },
  onSelectionUpdate: ({ editor: editorInstance }) => {
    if (isLocating.value) return;
    const metas = pageMetas.value;
    if (!metas.length) return;

    const { from, to, empty } = editorInstance.state.selection;
    if (!empty) {
      lastTextSelection.value = { from, to };
    }

    const pageIndex = getPageIndexByPos(from, metas);
    updateLocateHint(pageIndex);
    if (currentPage.value !== pageIndex) {
      skipLocateFromPageWatch.value = true;
      currentPage.value = pageIndex;
    }
    canUndo.value = editorInstance.can().undo() && markdownText.value !== initialMarkdown;
  }
});

const toggleHeading = (level) => {
  if (!editor.value) return;
  editor.value.chain().focus().toggleHeading({ level }).run();
};

const undoAction = () => {
  if (!editor.value || !canUndo.value) return;
  editor.value.chain().focus().undo().run();
};

const toggleBold = () => {
  if (!editor.value) return;
  editor.value.chain().focus().toggleBold().run();
};

const applyColor = () => {
  if (!editor.value) return;
  if (editor.value.isActive("colorMark", { color: selectedColor.value })) {
    editor.value.chain().focus().unsetColorMark().run();
    return;
  }
  editor.value.chain().focus().setColorMark(selectedColor.value).run();
};

const setParagraph = () => {
  if (!editor.value) return;
  editor.value.chain().focus().setParagraph().run();
};

const insertPageBreak = () => {
  if (!editor.value) return;
  editor.value.chain().focus().setHorizontalRule().run();
};

const pages = computed(() => {
  const blocks = parseMarkdownToBlocks(markdownText.value);
  return paginateBlocks(blocks, { pageBreakOnly: true });
});

const characterCount = computed(() => {
  if (!editor.value) return 0;
  return editor.value.state.doc.textContent.replace(/\s/g, "").length;
});

const isSelectedColorActive = computed(() => {
  if (!editor.value) return false;
  return editor.value.isActive("colorMark", { color: selectedColor.value });
});

watch(selectedColor, (nextColor) => {
  if (!editor.value) return;

  const { from, to, empty } = editor.value.state.selection;
  const targetRange = empty ? lastTextSelection.value : { from, to };
  if (!targetRange || targetRange.from === targetRange.to) return;

  editor.value.chain().focus().setTextSelection(targetRange).setColorMark(nextColor).run();
});

const currentBlocks = computed(() => pages.value[currentPage.value] ?? null);

const locateEditorToCurrentPage = () => {
  if (!editor.value || !editorRef.value) return;
  const metas = pageMetas.value;
  if (!metas.length) return;

  const target = metas[Math.min(currentPage.value, metas.length - 1)];
  if (!target) return;

  isLocating.value = true;
  editor.value.commands.setTextSelection(target.startPos);

  const containerRect = editorRef.value.getBoundingClientRect();
  const targetCoords = editor.value.view.coordsAtPos(target.startPos);
  const offset = targetCoords.top - containerRect.top;
  editorRef.value.scrollTop += offset - 24;
  updateLocateHint(currentPage.value);

  if (locatingTimer) window.clearTimeout(locatingTimer);
  locatingTimer = window.setTimeout(() => {
    isLocating.value = false;
  }, 420);
};

watch(
  pages,
  (nextPages) => {
    if (nextPages.length === 0) {
      currentPage.value = 0;
      locateHint.value = "定位：无可预览内容";
      return;
    }
    if (currentPage.value > nextPages.length - 1) {
      currentPage.value = nextPages.length - 1;
    }
  },
  { immediate: true }
);

watch(
  currentPage,
  async () => {
    if (skipLocateFromPageWatch.value) {
      skipLocateFromPageWatch.value = false;
      return;
    }
    await nextTick();
    attachScrollListener();
    locateEditorToCurrentPage();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (locatingTimer) window.clearTimeout(locatingTimer);
  editorRef.value?.removeEventListener("scroll", syncFromScroll);
  editor.value?.destroy();
});

const goPrev = () => {
  if (currentPage.value > 0) currentPage.value -= 1;
};

const goNext = () => {
  if (currentPage.value < pages.value.length - 1) currentPage.value += 1;
};

const setExportRef = (element, index) => {
  if (element) exportPageRefs.value[index] = element;
};

const downloadDataUrl = (dataUrl, fileName) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const exportAllPng = async () => {
  if (!pages.value.length || isExporting.value) return;
  isExporting.value = true;
  exportProgress.value = `打包中 0/${pages.value.length}`;
  await nextTick();

  try {
    await ensureExportDeps();
    const zip = new JSZipCtor();
    for (let index = 0; index < pages.value.length; index += 1) {
      const wrapper = exportPageRefs.value[index];
      const node = wrapper?.firstElementChild;
      if (!node) continue;

      const dataUrl = await toPngFn(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#040506"
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      zip.file(`${String(index + 1).padStart(2, "0")}.png`, blob);
      exportProgress.value = `打包中 ${index + 1}/${pages.value.length}`;
    }

    exportProgress.value = "正在生成 ZIP...";
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "xhs-pages.zip");
  } finally {
    isExporting.value = false;
    exportProgress.value = "";
  }
};

const exportCurrentPng = async () => {
  if (!pages.value.length || isExporting.value) return;
  isExporting.value = true;
  await nextTick();

  try {
    await ensureExportDeps();
    const index = currentPage.value;
    const wrapper = exportPageRefs.value[index];
    const node = wrapper?.firstElementChild;
    if (!node) return;

    const dataUrl = await toPngFn(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#040506"
    });

    downloadDataUrl(dataUrl, `${String(index + 1).padStart(2, "0")}.png`);
  } finally {
    isExporting.value = false;
  }
};
</script>
