<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  genderLabel: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  personId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['back'])
</script>

<template>
  <div class="patient-header-top">
      <div class="back-action">
        <button
          id="personDetailBackBtn"
          type="button"
          class="custom-back-btn"
          @click="emit('back')"
        >
          <div class="icon-circle">
            <i class="fa-solid fa-arrow-left" />
          </div>
          <span>返回</span>
        </button>
      </div>
      <div class="patient-title">
        <div class="patient-name">
          <i class="fa-solid fa-user-injured" />
          <h1 id="personName">{{ name }}</h1>
        </div>
      </div>
    </div>

    <div id="personInfo" class="patient-meta">
      <div class="meta-item">
        <div class="meta-label">性別</div>
        <div class="meta-value">{{ genderLabel }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">年齡</div>
        <div class="meta-value">{{ age }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">編號</div>
        <div class="meta-value">{{ personId }}</div>
      </div>
    </div>
</template>
