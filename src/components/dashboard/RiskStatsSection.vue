<script setup>
import { useDashboardDataInject } from '@/composables/useDashboardData'
import { useDashboardModalsInject } from '@/composables/useDashboardModals'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { riskStats, hasNoData } = useDashboardDataInject()
const { openDetailsModal } = useDashboardModalsInject()
</script>

<template>
  <div class="mb-4 hide-on-all compare-hide">
    <h5 id="risk" class="fw-bold text-dark mb-3 d-flex align-items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="me-2 text-primary"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span>{{ t('dashboard.riskStats') }}</span>
    </h5>

    <div v-if="hasNoData" class="alert alert-secondary text-center">
      {{ t('dashboard.noRecord') }}
    </div>

    <template v-else>
      <div class="alert-box mb-4 p-3 hide-on-all">
        <div class="d-flex align-items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="me-2 text-warn"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h6 class="fw-bold text-warn mb-0">{{ t('dashboard.alertList') }}</h6>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <p class="fw-semibold text-warn mb-1">{{ t('dashboard.degenerateWarning') }}</p>
            <ul id="degenerateList" class="ms-4 text-secondary">
              <li>
                <span>{{ t('dashboard.walkDeclineLabel') }}</span>
                <span class="val">{{ riskStats.alertGaitSpeed }}</span>
                <span>{{ t('dashboard.unitPeople') }}</span>
              </li>
              <li>
                <span>{{ t('dashboard.sitStandDeclineLabel') }}</span>
                <span class="val">{{ riskStats.alertChairSecond }}</span>
                <span>{{ t('dashboard.unitPeople') }}</span>
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <p class="fw-semibold text-warn mb-1">{{ t('dashboard.highRiskGroup') }}</p>
            <ul id="levelList" class="ms-4 text-secondary">
              <li>
                <span>{{ t('dashboard.vivifrailAFull') }}</span>
                <span class="val">{{ riskStats.alertA }}</span>
                <span>{{ t('dashboard.unitPeople') }}</span>
              </li>
              <li>
                <span>{{ t('dashboard.vivifrailBFull') }}</span>
                <span class="val">{{ riskStats.alertB }}</span>
                <span>{{ t('dashboard.unitPeople') }}</span>
              </li>
              <li class="d-flex justify-content-between flex-wrap align-items-start gap-2">
                <span>
                  <span>{{ t('dashboard.vivifrailCFull') }}</span>
                  <span class="val">{{ riskStats.alertC }}</span>
                  <span>{{ t('dashboard.unitPeople') }}</span>
                </span>
                <button
                  type="button"
                  class="btn btn-warning btn-sm d-inline-flex align-items-center mt-2"
                  @click="openDetailsModal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="me-1"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{{ t('dashboard.viewDetails') }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div
            class="risk-box p-3"
            style="border-left: 4px solid #6f42c1; background-color: #f3e9fa"
          >
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="fw-bold mb-0 text-purple">{{ t('dashboard.walkDecline') }}</h6>
              <div id="degenerateGaitSpeedTotal" class="fs-3 fw-bold text-purple">
                {{ riskStats.gaitSpeedDeclineCount }}
              </div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div
                id="progressGaitSpeed"
                class="progress-bar bg-purple"
                :style="{ width: riskStats.progressGaitSpeed }"
              />
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div
            class="risk-box p-3"
            style="border-left: 4px solid #0dcaf0; background-color: #e8f8fc"
          >
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="fw-bold mb-0 text-info">{{ t('dashboard.sitStandIncrease') }}</h6>
              <div id="degenerateChairTotal" class="fs-3 fw-bold text-info">
                {{ riskStats.chairSecondIncreaseCount }}
              </div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div
                id="progressChair"
                class="progress-bar bg-info"
                :style="{ width: riskStats.progressChair }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-4">
        <div class="col-md-3">
          <div class="risk-box risk-red p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="fw-bold text-danger mb-0">{{ t('dashboard.levelA') }}</h6>
                <p class="small text-danger mb-0">{{ t('dashboard.levelADesc') }}</p>
              </div>
              <div id="riskA" class="fs-3 fw-bold text-danger">{{ riskStats.countA }}</div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div id="progressA" class="progress-bar bg-danger" :style="{ width: riskStats.progressA }" />
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="risk-box risk-yellow p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="fw-bold text-warn mb-0">{{ t('dashboard.levelB') }}</h6>
                <p class="small text-warn mb-0">{{ t('dashboard.levelBDesc') }}</p>
              </div>
              <div id="riskB" class="fs-3 fw-bold text-warn">{{ riskStats.countB }}</div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div id="progressB" class="progress-bar bg-warn" :style="{ width: riskStats.progressB }" />
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="risk-box risk-blue p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="fw-bold text-primary mb-0">{{ t('dashboard.levelC') }}</h6>
                <p class="small text-primary mb-0">{{ t('dashboard.levelCDesc') }}</p>
              </div>
              <div id="riskC" class="fs-3 fw-bold text-primary">{{ riskStats.countC }}</div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div id="progressC" class="progress-bar bg-primary" :style="{ width: riskStats.progressC }" />
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="risk-box risk-green p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="fw-bold text-success mb-0">{{ t('dashboard.levelD') }}</h6>
                <p class="small text-success mb-0">{{ t('dashboard.levelDDesc') }}</p>
              </div>
              <div id="riskD" class="fs-3 fw-bold text-success">{{ riskStats.countD }}</div>
            </div>
            <div class="mt-2 progress rounded-pill">
              <div id="progressD" class="progress-bar bg-success" :style="{ width: riskStats.progressD }" />
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
