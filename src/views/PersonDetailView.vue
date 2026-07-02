<script setup>
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/chartOverlay.css'
import PersonDetailChartCard from '@/components/person/PersonDetailChartCard.vue'
import PersonRecordList from '@/components/person/PersonRecordList.vue'
import PersonReportHeadline from '@/components/person/PersonReportHeadline.vue'
import PersonTrendSummary from '@/components/person/PersonTrendSummary.vue'
import { usePersonDetail } from '@/composables/usePersonDetail'
import { genderText } from '@/utils/personDetail'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const recordListRef = ref(null)

const {
  loading,
  error,
  notFound,
  profile,
  personId,
  displayedRecords,
  selectedIndices,
  selectedAssessments,
  trend,
  headline,
  headlineClinicalStatus,
  hasChartData,
  comparePanelHint,
  recordPanelHint,
  toggleRecord,
  selectAllRecords,
  unselectAllRecords,
  setDateRange,
  clearDateFilter,
  goBack,
} = usePersonDetail()

const charts = [
  {
    chartType: 'sitStand',
    canvasId: 'sitStandChartCanvas',
    titleKey: 'personDetail.sitStandTrend',
    hintKey: 'personDetail.suggestSit',
    marginBottom: true,
  },
  {
    chartType: 'balance',
    canvasId: 'balanceChartCanvas',
    titleKey: 'personDetail.suggestBalance',
    hintKey: 'personDetail.suggestBalance',
    marginBottom: true,
  },
  {
    chartType: 'gait',
    canvasId: 'gaitChartCanvas',
    titleKey: 'personDetail.gaitTrend',
    hintKey: 'personDetail.suggestGait',
    marginBottom: true,
  },
  {
    chartType: 'risk',
    canvasId: 'riskChartCanvas',
    titleKey: 'personDetail.aiFallRisk',
    hintKey: '',
    marginBottom: false,
  },
]

function onRangeSelected({ start, end }) {
  setDateRange(start, end)
}

function onClearDates() {
  clearDateFilter()
}

onMounted(() => {
  document.body.classList.add('app')

  void nextTick(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })
  })
})

onUnmounted(() => {
  document.body.classList.remove('app')
})
</script>

<template>
  <div class="container app-shell">
    <header v-if="loading" class="patient-header text-center py-5">
      <p class="mb-0">{{ t('common.loading') }}</p>
    </header>

    <div v-else-if="notFound" class="text-center mt-5 py-5">
      <p class="text-danger fs-5">{{ t('personDetail.notFound') }}</p>
      <button type="button" class="btn btn-secondary" @click="goBack">
        {{ t('personDetail.back') }}
      </button>
    </div>

    <div v-else-if="error" class="alert alert-danger m-4" role="alert">
      {{ error.message || String(error) }}
      <button type="button" class="btn btn-secondary ms-2" @click="goBack">
        {{ t('personDetail.back') }}
      </button>
    </div>

    <template v-else-if="profile">
      <header class="patient-header">
        <div class="patient-header-top">
          <div class="back-action">
            <button
              id="personDetailBackBtn"
              type="button"
              class="custom-back-btn"
              @click="goBack"
            >
              <div class="icon-circle">
                <i class="fa-solid fa-arrow-left" />
              </div>
              <span>{{ t('personDetail.back') }}</span>
            </button>
          </div>
          <div class="patient-title">
            <div class="patient-name">
              <i class="fa-solid fa-user-injured" />
              <h1 id="personName">{{ profile.Name }}</h1>
            </div>
          </div>
        </div>

        <div id="personInfo" class="patient-meta">
          <div class="meta-item">
            <div class="meta-label">{{ t('personDetail.gender') }}</div>
            <div class="meta-value">{{ genderText(profile.Gender, t) }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">{{ t('personDetail.age') }}</div>
            <div class="meta-value">{{ profile.Age }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">{{ t('personDetail.serialNumber') }}</div>
            <div class="meta-value">{{ profile.Number }}</div>
          </div>
        </div>

        <PersonReportHeadline
          :headline="headline"
          :clinical-status="headlineClinicalStatus"
        />

        <section class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">
                <i class="fa-solid fa-wand-magic-sparkles" />
                <span>{{ t('personDetail.panelTrendSummary') }}</span>
              </h2>
              <div class="panel-hint">{{ comparePanelHint }}</div>
            </div>
          </div>
          <div class="panel-body">
            <PersonTrendSummary :trend="trend" />
          </div>
        </section>
      </header>

      <main class="report">
        <div class="layout">
          <div class="layout-left">
            <PersonRecordList
              ref="recordListRef"
              :key="personId"
              :records="displayedRecords"
              :selected-indices="selectedIndices"
              :record-panel-hint="recordPanelHint"
              @toggle="toggleRecord"
              @select-all="selectAllRecords"
              @unselect-all="unselectAllRecords"
              @range-selected="onRangeSelected"
              @clear-dates="onClearDates"
            />
          </div>

          <div class="layout-right">
            <section class="panel">
              <div class="panel-header">
                <div>
                  <h2 class="panel-title">
                    <i class="fa-solid fa-chart-line" />
                    <span>{{ t('personDetail.panelTrendChart') }}</span>
                  </h2>
                </div>
              </div>

              <div class="panel-body">
                <PersonDetailChartCard
                  v-for="chart in charts"
                  :key="chart.canvasId"
                  :chart-type="chart.chartType"
                  :canvas-id="chart.canvasId"
                  :title-key="chart.titleKey"
                  :hint-key="chart.hintKey"
                  :margin-bottom="chart.marginBottom"
                  :assessments="selectedAssessments"
                  :has-no-data="!hasChartData"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
