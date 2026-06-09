import { inject, provide, ref } from 'vue'

export const DASHBOARD_MODALS_KEY = Symbol('dashboardModals')

/**
 * Dashboard modal open state (details + view-all participants).
 * Provided by DashboardView; consumed by RiskStatsSection / ParticipantsPanel.
 */
export function useDashboardModals() {
  const detailsOpen = ref(false)

  const participantsViewAllOpen = ref(false)
  const participantsViewAllMode = ref('risk')
  const participantsViewAllInitialFilter = ref('all')

  function openDetailsModal() {
    detailsOpen.value = true
  }

  function openParticipantsViewAll(mode, initialFilter = 'all') {
    participantsViewAllMode.value = mode
    participantsViewAllInitialFilter.value = initialFilter
    participantsViewAllOpen.value = true
  }

  const api = {
    detailsOpen,
    participantsViewAllOpen,
    participantsViewAllMode,
    participantsViewAllInitialFilter,
    openDetailsModal,
    openParticipantsViewAll,
  }

  return api
}

export function provideDashboardModals() {
  const modals = useDashboardModals()
  provide(DASHBOARD_MODALS_KEY, modals)
  return modals
}

export function useDashboardModalsInject() {
  const modals = inject(DASHBOARD_MODALS_KEY)
  if (!modals) {
    throw new Error('useDashboardModalsInject() must be used within DashboardView')
  }
  return modals
}
