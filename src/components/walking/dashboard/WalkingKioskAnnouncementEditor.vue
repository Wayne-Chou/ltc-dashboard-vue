<script setup>
defineProps({
  announcementTitle: {
    type: String,
    default: '',
  },
  announcementContent: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:announcementTitle',
  'update:announcementContent',
  'save',
])

function onTitleInput(event) {
  emit('update:announcementTitle', event.target.value)
}

function onContentInput(event) {
  emit('update:announcementContent', event.target.value)
}
</script>

<template>
  <section id="kiosk" class="mb-4">
    <div
      style="
        background: #fff;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
      "
    >
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-2"
        style="background: #334155; color: #fff; padding: 16px 24px"
      >
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-display" style="font-size: 1.25rem" />
          <span class="fw-bold">一體機公告編輯</span>
        </div>
        <span class="small" style="color: #cbd5e1"
          >編輯後按確認，將顯示於裝置畫面</span
        >
      </div>

      <div style="padding: 24px">
        <div class="row g-4 mb-4">
          <div class="col-12 col-md-6">
            <div
              class="d-flex justify-content-between align-items-center mb-2"
            >
              <label for="announcementTitle" class="small text-muted mb-0"
                >公告標題</label
              >
              <span class="small text-muted"
                >{{ announcementTitle.length }} / 50</span
              >
            </div>
            <input
              id="announcementTitle"
              :value="announcementTitle"
              type="text"
              maxlength="50"
              placeholder="請輸入公告標題"
              class="form-control"
              style="
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                border-radius: 10px;
              "
              @input="onTitleInput"
              @focus="$event.target.style.borderColor = '#3b82f6'"
              @blur="$event.target.style.borderColor = '#e2e8f0'"
            />
          </div>

          <div class="col-12 col-md-6">
            <div
              class="d-flex justify-content-between align-items-center mb-2"
            >
              <label
                for="announcementContent"
                class="small text-muted mb-0"
                >公告內容</label
              >
              <span class="small text-muted"
                >{{ announcementContent.length }} / 50</span
              >
            </div>
            <input
              id="announcementContent"
              :value="announcementContent"
              type="text"
              maxlength="50"
              placeholder="請輸入公告內容"
              class="form-control"
              style="
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                border-radius: 10px;
              "
              @input="onContentInput"
              @focus="$event.target.style.borderColor = '#3b82f6'"
              @blur="$event.target.style.borderColor = '#e2e8f0'"
            />
          </div>
        </div>

        <button
          type="button"
          class="btn d-inline-flex align-items-center gap-2"
          style="
            background: #334155;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 10px 20px;
          "
          @click="emit('save')"
        >
          <i class="bi bi-send" />
          <span>儲存並套用</span>
        </button>

        <div style="margin-top: 24px">
          <div
            style="
              padding-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 16px;
            "
          >
            <span
              style="
                background: #e2e8f0;
                color: #475569;
                font-size: 0.75rem;
                padding: 3px 10px;
                border-radius: 99px;
              "
            >
              裝置顯示預覽
            </span>
          </div>

          <div
            style="
              background: #fff;
              border: 1px solid #cbd5e1;
              padding: 28px 30px;
              
            "
          >
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
              <div
                style="
                  width: 42px;
                  height: 42px;
                  background: #3b82f6;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                "
              >
                <i class="bi bi-megaphone-fill" style="font-size: 1.1rem; color: #fff;" />
              </div>
              <div>
                <span
                  style="
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 2px;
                    color: #3b82f6;
                    margin-bottom: 3px;
                  "
                >
                  最新消息
                </span>
                <h3
                  style="
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1.4;
                  "
                >
                  {{ announcementTitle || '（標題將顯示於此）' }}
                </h3>
              </div>
            </div>
            <div style="height: 1px; background: #cbd5e1; margin-bottom: 18px;" />
            <div>
              <p
                style="
                  font-size: 0.95rem;
                  color: #64748b;
                  line-height: 1.8;
                  margin: 0;
                "
              >
                {{ announcementContent || '（內容將顯示於此）' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
