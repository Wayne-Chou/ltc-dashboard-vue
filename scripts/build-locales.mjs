import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LANG as dashboardLang } from '../legacy/src/js/common/lang.js'
import { LANG_DATA as loginLang } from '../legacy/src/js/login/lang.js'
import { LANG as personDetailLang } from '../legacy/src/js/personDetail/lang.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '../src/i18n/locales')

const vueExtras = {
  zh: {
    common: {
      loading: '載入中…',
      appTitle: 'LTC 儀表板',
      anonymous: '匿名',
    },
    login: {
      showPassword: '顯示',
      hidePassword: '隱藏',
    },
    dashboard: {
      langKo: '한국어',
      title: '儀表板',
      placeholder: '儀表板頁面',
      sitesCount: '場域數量',
      assessmentsCount: '評估筆數',
      sitesCountLine: '場域數量：{count}',
      assessmentsCountLine: '評估筆數：{count}',
      selectedCount: '已選 {count} 筆',
      selectedCountWrap: '（{text}）',
      pageUnit: '頁',
      testDate: '鑑測日期',
      testDateLine: '鑑測日期：{date}',
      toggleSidebar: '切換側邊欄',
      riskHighDanger: '危險',
      riskSlightlyHigh: '高',
    },
  },
  en: {
    common: {
      loading: 'Loading…',
      appTitle: 'LTC Dashboard',
      anonymous: 'Anonymous',
    },
    login: {
      showPassword: 'Show',
      hidePassword: 'Hide',
    },
    dashboard: {
      langKo: '한국어',
      title: 'Dashboard',
      placeholder: 'Dashboard',
      sitesCount: 'Sites',
      assessmentsCount: 'Assessments',
      sitesCountLine: 'Sites: {count}',
      assessmentsCountLine: 'Assessments: {count}',
      selectedCount: '{count} selected',
      selectedCountWrap: '({text})',
      pageUnit: '',
      testDate: 'Test date',
      testDateLine: 'Test date: {date}',
      toggleSidebar: 'Toggle sidebar',
      riskHighDanger: 'Danger',
      riskSlightlyHigh: 'High',
    },
  },
  ja: {
    common: {
      loading: '読み込み中…',
      appTitle: 'LTC ダッシュボード',
      anonymous: '匿名',
    },
    login: {
      showPassword: '表示',
      hidePassword: '非表示',
    },
    dashboard: {
      langKo: '한국어',
      title: 'ダッシュボード',
      placeholder: 'ダッシュボード',
      sitesCount: '施設数',
      assessmentsCount: '評価件数',
      sitesCountLine: '施設数：{count}',
      assessmentsCountLine: '評価件数：{count}',
      selectedCount: '{count} 件選択中',
      selectedCountWrap: '（{text}）',
      pageUnit: '',
      testDate: '検査日',
      testDateLine: '検査日：{date}',
      toggleSidebar: 'サイドバー切替',
      riskHighDanger: '危険',
      riskSlightlyHigh: '高い',
    },
  },
  ko: {
    common: {
      loading: '로딩 중…',
      appTitle: 'LTC 대시보드',
      anonymous: '익명',
    },
    login: {
      showPassword: '표시',
      hidePassword: '숨기기',
    },
    dashboard: {
      title: '대시보드',
      placeholder: '대시보드',
      sitesCount: '시설 수',
      assessmentsCount: '평가 건수',
      sitesCountLine: '시설 수: {count}',
      assessmentsCountLine: '평가 건수: {count}',
      selectedCount: '{count}건 선택됨',
      selectedCountWrap: '({text})',
      pageUnit: '',
      testDate: '검사일',
      testDateLine: '검사일: {date}',
      toggleSidebar: '사이드바 전환',
      riskHighDanger: '위험',
      riskSlightlyHigh: '높은',
      langKo: '한국어',
      dashboardTitle: 'AI 골격 감지 낙상 예방 그룹 대시보드',
      language: '언어',
      langZh: '繁體中文',
      langEn: 'ENGLISH',
      langJa: '日本語',
      logout: '로그아웃',
      navSummary: '검사 통계 요약',
      navRisk: '위험 등급 통계',
      navTrend: '그룹 변화 추세',
      navStatus: '참가자 상태',
      navLocation: '검사 거점 분포',
      historyAverageTable: '역대 검사 평균 성적표',
      selectAll: '전체 선택',
      unselectAll: '선택 해제',
      riskStats: '위험 등급 통계',
      alertList: '경고 목록',
      walkDeclineLabel: '보행 속도 감소:',
      sitStandDeclineLabel: '기립 속도 감소:',
      vivifrailAFull: 'A등급 장애자:',
      vivifrailBFull: 'B등급 허약자:',
      vivifrailCFull: 'C등급 허약 전기자:',
      levelA: 'A 등급',
      levelADesc: '장애자 (SPPB=0-3점)',
      levelB: 'B 등급',
      levelBDesc: '허약자 (SPPB=4-6점)',
      levelC: 'C 등급',
      levelCDesc: '허약 전기자 (SPPB=7-9점)',
      levelD: 'D 등급',
      levelDDesc: '건강자 (SPPB=10-12점)',
      status: '참가자 상태',
      sortByRisk: 'AI 낙상 위험 등급별 정렬',
      sortByVivifrail: 'Vivifrail 등급별 정렬',
      riskHigh: '높음',
      riskMedium: '가운데',
      riskSlightlyLow: '약간 낮음',
      riskLow: '낮음',
      selectRisk: '위험 선택',
      selectLevel: '등급 선택',
      levelAFull: 'A등급 장애자',
      levelBFull: 'B등급 허약자',
      levelCFull: 'C등급 허약 전기자',
      levelDFull: 'D등급 건강자',
      unitPeople: '명',
      companyName: 'FongAI Co., Ltd.',
    },
  },
}

function deepMerge(target, source) {
  const output = { ...target }
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = deepMerge(output[key] || {}, value)
    } else {
      output[key] = value
    }
  }
  return output
}

function buildLocale(code) {
  const base = {
    login: { ...(loginLang[code] || loginLang.en || {}) },
    dashboard: { ...(dashboardLang[code] || dashboardLang.en || {}) },
    personDetail: { ...(personDetailLang[code] || personDetailLang.en || {}) },
  }
  const extras = vueExtras[code] || vueExtras.en
  const merged = deepMerge(base, extras)

  if (code !== 'en') {
    const enMerged = buildLocale('en')
    return deepMerge(enMerged, merged)
  }

  return merged
}

for (const code of ['zh', 'en', 'ja', 'ko']) {
  const content = `${JSON.stringify(buildLocale(code), null, 2)}\n`
  writeFileSync(join(localesDir, `${code}.json`), content, 'utf8')
  console.log(`Wrote ${code}.json`)
}
