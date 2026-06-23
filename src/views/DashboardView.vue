<script setup>
import AssessmentCardList from '@/components/dashboard/AssessmentCardList.vue'
import CompareView from '@/components/dashboard/compare/CompareView.vue'
import DetailsModal from '@/components/dashboard/DetailsModal.vue'
import ParticipantsPanel from '@/components/dashboard/ParticipantsPanel.vue'
import ParticipantsViewAllModal from '@/components/dashboard/ParticipantsViewAllModal.vue'
import RiskStatsSection from '@/components/dashboard/RiskStatsSection.vue'
import SummarySection from '@/components/dashboard/SummarySection.vue'
import TrendChartsSection from '@/components/dashboard/TrendChartsSection.vue'
import LocationMapSection from '@/components/dashboard/LocationMapSection.vue'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { COMPARE_INJECTION_KEY, useCompareMode } from '@/composables/useCompareMode'
import { DASHBOARD_INJECTION_KEY, useDashboardData } from '@/composables/useDashboardData'
import { provideDashboardModals } from '@/composables/useDashboardModals'
import { provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const dashboard = useDashboardData()
const compare = useCompareMode(dashboard)
provide(DASHBOARD_INJECTION_KEY, dashboard)
provide(COMPARE_INJECTION_KEY, compare)

const {
  detailsOpen,
  participantsViewAllOpen,
  participantsViewAllMode,
  participantsViewAllInitialFilter,
} = provideDashboardModals()

const { sites, error, showRegionSections, selectRegion } = dashboard

function onSelectPerson(person) {
  if (!person?.Number) return
  router.push({
    name: 'person-detail',
    params: { id: String(person.Number) },
    query: {
      region: String(route.query.region || '0'),
      returnUrl: encodeURIComponent(route.fullPath),
    },
  })
}
</script>

<template>
  <DashboardLayout
    :sites="sites"
    :show-region-sections="showRegionSections"
    :error="error"
    @select-region="selectRegion"
  >
    <div id="appView" class="app-view">
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error.message || String(error) }}
      </div>

      <CompareView
        v-else-if="compare.isCompareMode"
        :key="compare.compareViewKey"
      />

      <div
        v-else
        id="default-view"
        class="default-view"
        :key="compare.defaultViewKey"
      >
        <SummarySection />

        <template v-if="showRegionSections">
          <AssessmentCardList />
          <RiskStatsSection />
          <TrendChartsSection />
          <ParticipantsPanel @select-person="onSelectPerson" />
          <LocationMapSection />
        </template>

        <LocationMapSection v-else />
      </div>
    </div>

    <template v-if="compare.showHideOnAllNav && showRegionSections && !error">
      <DetailsModal v-model="detailsOpen" />
      <ParticipantsViewAllModal
        v-model="participantsViewAllOpen"
        :mode="participantsViewAllMode"
        :initial-filter="participantsViewAllInitialFilter"
        @select-person="onSelectPerson"
      />
    </template>
  </DashboardLayout>
</template>
