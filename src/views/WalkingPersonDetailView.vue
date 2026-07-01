<script setup>
import WalkingPersonChartsSection from '@/components/walking/person/WalkingPersonChartsSection.vue'
import WalkingPersonHeadline from '@/components/walking/person/WalkingPersonHeadline.vue'
import WalkingPersonHeader from '@/components/walking/person/WalkingPersonHeader.vue'
import WalkingPersonRecordList from '@/components/walking/person/WalkingPersonRecordList.vue'
import WalkingPersonTrendSummary from '@/components/walking/person/WalkingPersonTrendSummary.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const personDataMap = {
  1: {
    Name: '王○明',
    Age: 72,
    Gender: 1,
    headline: {
      badge: '持續改善',
      title: '步行能力穩定進步',
      desc: '最近三次檢測顯示步行速度持續提升，跌倒風險逐步下降',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 8.5, risk: -12.3 },
    records: [
      { date: '2025/01/12', risk: '低風險', riskColor: '#198754', gait: 82 },
      { date: '2025/02/08', risk: '偏低', riskColor: '#28a745', gait: 85 },
      { date: '2025/03/15', risk: '中風險', riskColor: '#ffc107', gait: 90 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 93 },
    ],
    gaitData: [82, 85, 90, 93],
    riskData: [35, 28, 32, 18],
  },
  2: {
    Name: '李○華',
    Age: 68,
    Gender: 0,
    headline: {
      badge: '狀況穩定',
      title: '步行能力維持良好',
      desc: '近期檢測顯示步行速度與跌倒風險皆維持穩定區間',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 1.2, risk: -2.0 },
    records: [
      { date: '2025/01/12', risk: '偏低', riskColor: '#28a745', gait: 95 },
      { date: '2025/02/08', risk: '偏低', riskColor: '#28a745', gait: 96 },
      { date: '2025/03/15', risk: '低風險', riskColor: '#198754', gait: 97 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 96 },
    ],
    gaitData: [95, 96, 97, 96],
    riskData: [20, 19, 17, 18],
  },
  3: {
    Name: '張○強',
    Age: 75,
    Gender: 1,
    headline: {
      badge: '需要留意',
      title: '跌倒風險略有上升',
      desc: '近期步行速度下降，建議增加追蹤頻率並安排進一步評估',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'watch',
    },
    trend: { gait: -6.5, risk: 9.8 },
    records: [
      { date: '2025/01/12', risk: '中風險', riskColor: '#ffc107', gait: 75 },
      { date: '2025/02/08', risk: '中風險', riskColor: '#ffc107', gait: 72 },
      { date: '2025/03/15', risk: '高風險', riskColor: '#fd7e14', gait: 68 },
      { date: '2025/04/02', risk: '高危險', riskColor: '#dc3545', gait: 65 },
    ],
    gaitData: [75, 72, 68, 65],
    riskData: [38, 42, 48, 55],
  },
  4: {
    Name: '陳○美',
    Age: 70,
    Gender: 0,
    headline: {
      badge: '表現優異',
      title: '步行能力表現良好',
      desc: '各項指標皆維持低風險區間，建議持續保持目前運動習慣',
      rangeText: '2025/01/12 ~ 2025/04/02',
      status: 'good',
    },
    trend: { gait: 3.1, risk: -5.5 },
    records: [
      { date: '2025/01/12', risk: '低風險', riskColor: '#198754', gait: 100 },
      { date: '2025/02/08', risk: '低風險', riskColor: '#198754', gait: 102 },
      { date: '2025/03/15', risk: '低風險', riskColor: '#198754', gait: 103 },
      { date: '2025/04/02', risk: '低風險', riskColor: '#198754', gait: 104 },
    ],
    gaitData: [100, 102, 103, 104],
    riskData: [10, 9, 8, 7],
  },
}

const personId = computed(() => Number(route.params.id))
const personData = computed(() => personDataMap[personId.value] ?? personDataMap[1])

const genderLabel = computed(() => (personData.value.Gender === 1 ? '男' : '女'))

const selectedIndices = ref([])

const chartLabels = ['2025/01', '2025/02', '2025/03', '2025/04']

function goBack() {
  router.back()
}

function resetSelectedIndices() {
  selectedIndices.value = personData.value.records.map((_, index) => index)
}

function toggleRecord(index) {
  if (selectedIndices.value.includes(index)) {
    selectedIndices.value = selectedIndices.value.filter((item) => item !== index)
  } else {
    selectedIndices.value = [...selectedIndices.value, index]
  }
}

function selectAllRecords() {
  selectedIndices.value = personData.value.records.map((_, index) => index)
}

function unselectAllRecords() {
  selectedIndices.value = []
}

watch(personId, () => {
  resetSelectedIndices()
})

onMounted(() => {
  document.body.classList.add('app')
  resetSelectedIndices()
})

onBeforeUnmount(() => {
  document.body.classList.remove('app')
})
</script>

<template>
  <div class="container app-shell">
    <header class="patient-header">
      <WalkingPersonHeader
        :name="personData.Name"
        :gender-label="genderLabel"
        :age="personData.Age"
        :person-id="personId"
        @back="goBack"
      />

      <WalkingPersonHeadline :headline="personData.headline" />

      <WalkingPersonTrendSummary :trend="personData.trend" />
    </header>

    <main class="report">
      <div class="layout">
        <div class="layout-left">
          <WalkingPersonRecordList
            :records="personData.records"
            :selected-indices="selectedIndices"
            @toggle="toggleRecord"
            @select-all="selectAllRecords"
            @unselect-all="unselectAllRecords"
          />
        </div>

        <div class="layout-right">
          <WalkingPersonChartsSection
            :key="personId"
            :gait-data="personData.gaitData"
            :risk-data="personData.riskData"
            :chart-labels="chartLabels"
          />
        </div>
      </div>
    </main>
  </div>
</template>
