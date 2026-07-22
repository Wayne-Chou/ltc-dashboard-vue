<script setup>
import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const note = ref('')
const saved = ref(false)
let savedTimer = null

function saveNote() {
 
  console.log('TODO: 串接後端儲存備註 API', note.value)
  saved.value = true
  if (savedTimer) {
    clearTimeout(savedTimer)
  }
  savedTimer = setTimeout(() => {
    saved.value = false
    savedTimer = null
  }, 2000)
}

onUnmounted(() => {
  if (savedTimer) {
    clearTimeout(savedTimer)
  }
})
</script>

<template>
  <section class="panel person-note-panel">
    <div class="panel-header">
      <h2 class="panel-title mb-0">
        <i class="fa-solid fa-note-sticky" />
        <span>{{ t('personDetail.note.title') }}</span>
      </h2>
    </div>
    <div class="panel-body">
      <textarea
        v-model="note"
        class="form-control person-note-textarea"
        rows="5"
        :placeholder="t('personDetail.note.placeholder')"
      />
      <div class="d-flex align-items-center gap-2 mt-3">
        <button type="button" class="btn btn-primary" @click="saveNote">
          {{ t('personDetail.note.save') }}
        </button>
        <span v-if="saved" class="text-success small fw-semibold">
          {{ t('personDetail.note.saved') }}
        </span>
      </div>
    </div>
  </section>
</template>
