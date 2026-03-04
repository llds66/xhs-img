<template>
  <article class="xhs-page">
    <div class="grid-overlay" />

    <section class="content-wrap">
      <div
        v-for="(block, idx) in blocks"
        :key="`${block.type}-${idx}`"
        :class="['block', `block-${block.type}`]"
      >
        <template v-for="(run, runIndex) in block.runs" :key="`${idx}-${runIndex}`">
          <span :class="[run.strong ? 'run-strong' : 'run-normal']" :style="run.color ? { color: run.color } : null">{{
            run.text
          }}</span>
        </template>
      </div>
    </section>

    <footer class="footer">
      <span class="author">{{ authorName }}</span>
      <span class="pager">
        <span class="pager-current">{{ pageNumber.toString().padStart(2, "0") }}</span>
        <span class="pager-separator">/</span>
        <span class="pager-total">{{ totalPages.toString().padStart(2, "0") }}</span>
      </span>
    </footer>
  </article>
</template>

<script setup>
defineProps({
  blocks: {
    type: Array,
    required: true
  },
  authorName: {
    type: String,
    default: "©LsAng"
  },
  pageNumber: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
});
</script>
