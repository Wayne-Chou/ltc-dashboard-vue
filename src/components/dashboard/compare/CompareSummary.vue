<script setup>
import CompareControls from '@/components/dashboard/compare/CompareControls.vue'
import { useCompareModeInject } from '@/composables/useCompareMode'
import { computed } from 'vue'

const compare = useCompareModeInject()
const summary = computed(() => compare.compareSummary)
</script>

<template>
  <div id="compareSummary" class="compare-summary-container">
    <div class="compare-summary-header">
      <div class="title">比較結果分析</div>
    </div>

    <CompareControls />

    <div class="compare-mode-title">
      <i class="fa-solid fa-code-compare" />
      <span id="compareModeResultTitle">{{ summary.title }}</span>
    </div>

    <div v-if="summary.ranking.length" id="compareRanking" class="compare-ranking">
      <div
        v-for="(entry, index) in summary.ranking"
        :key="entry.id"
        class="ranking-badge"
      >
        <span class="rank">
          <i class="fa-solid" :class="index === 0 ? 'fa-trophy' : 'fa-medal'" />
          #{{ index + 1 }}
        </span>
        <span class="name">{{ entry.site }}</span>
        <span class="score">
          <i class="fa-solid fa-crown" /> {{ entry.score }} 項領先
        </span>
      </div>
    </div>

    <div id="compareSummaryContent" class="compare-grid">
      <template v-if="summary.kind === 'empty-range'">
        <div class="metric-card empty">
          <div class="metric-empty-icon">
            <i class="fa-solid fa-calendar-xmark" />
          </div>
          <div class="metric-empty-title">所選日期區間無資料</div>
          <div class="metric-empty-desc">請調整日期</div>
        </div>
      </template>

      <template v-else-if="summary.kind === 'empty-metrics'">
        <div class="metric-card empty">
          <div class="metric-empty-title">尚無足夠指標可比較</div>
          <div class="metric-empty-desc">請確認各據點於所選區間皆有資料</div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="card in summary.cards"
          :key="card.key"
          class="metric-card"
          :class="card.cardClass"
        >
          <div class="metric-header">
            <div class="icon">
              <i class="fa-solid" :class="card.icon" />
            </div>
            <div class="label">{{ card.label }}</div>
          </div>

          <div class="metric-body">
            <div class="metric-top">
              <div class="metric-site">{{ card.topSiteText }}</div>
              <div
                v-if="card.badgeText"
                class="metric-badge"
                :class="{ neutral: card.badgeNeutral }"
              >
                {{ card.badgeText }}
              </div>
            </div>

            <div class="metric-values-list">
              <div class="metric-value-row" :class="card.aClass">
                <span :title="card.aDatesTitle">{{ card.aSite }}（比較組）</span>
                <strong>{{ card.aValue }}{{ card.unitText }}</strong>
                <em>{{ card.aTimeLabel }}</em>
              </div>
              <div class="metric-value-row" :class="card.bClass">
                <span :title="card.bDatesTitle">{{ card.bSite }}（對照組）</span>
                <strong>{{ card.bValue }}{{ card.unitText }}</strong>
                <em>{{ card.bTimeLabel }}</em>
              </div>
            </div>

            <div class="metric-time">
              <i class="fa-solid fa-calendar-days" />
              {{ card.bestTimeText }}
            </div>
            <div class="metric-time">
              <i class="fa-solid fa-calendar-days" />
              {{ card.worstTimeText }}
            </div>
            <div class="metric-compare">{{ card.compareText }}</div>
          </div>

          <div class="metric-footer">
            <div class="metric-diff">
              <span class="diff-value">{{ card.diffText }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
