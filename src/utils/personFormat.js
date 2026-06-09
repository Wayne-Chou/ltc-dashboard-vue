
export function formatPersonLine(person, t) {
  const gender =
    person.Gender === 0
      ? t('dashboard.female')
      : person.Gender === 1
        ? t('dashboard.male')
        : t('dashboard.riskLabel.unknown')
  const name = person.Name || t('dashboard.riskLabel.unknown')
  const age = person.Age ?? t('dashboard.riskLabel.unknown')
  return `${name} (${age}${t('dashboard.yearsOld')}, ${gender})`
}
