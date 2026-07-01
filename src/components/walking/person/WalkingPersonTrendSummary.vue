<script setup>
defineProps({
  trend: {
    type: Object,
    required: true,
  },
})

function trendTone(value, invert = false) {
  const isPositive = invert ? value < 0 : value > 0
  const isNegative = invert ? value > 0 : value < 0
  if (isPositive) return 'tone-good'
  if (isNegative) return 'tone-watch'
  return 'tone-neutral'
}

function formatTrendValue(value) {
  const abs = Math.abs(value).toFixed(1)
  if (value > 0) return `↑ ${abs}%`
  if (value < 0) return `↓ ${abs}%`
  return `${abs}%`
}
</script>

<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">
          <i class="fa-solid fa-wand-magic-sparkles" />
          <span>評估變化重點摘要</span>
        </h2>
        <div class="panel-hint">已選擇 4 筆評估紀錄，比較分析以最近兩筆為準</div>
      </div>
    </div>
    <div class="panel-body">
      <div id="trendSummary">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="trend-card" :class="trendTone(trend.gait)">
              <div class="trend-card-title">步行速度</div>
              <div class="trend-card-value">{{ formatTrendValue(trend.gait) }}</div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="trend-card" :class="trendTone(trend.risk, true)">
              <div class="trend-card-title">AI 跌倒風險</div>
              <div class="trend-card-value">{{ formatTrendValue(trend.risk) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
