
export function getRiskCategory(risk) {
  if (risk > 50) return "high";
  if (risk > 30) return "slightlyHigh";
  if (risk > 17.5) return "medium";
  if (risk > 5) return "slightlyLow";
  return "low";
}

export function mergeAllVIVIFRAIL(assessments) {
  const merged = { A: [], B: [], C: [], D: [] };

  assessments.forEach((item) => {
    ["A", "B", "C", "D"].forEach((level) => {
      if (item.VIVIFRAIL?.[level]) {
        merged[level] = merged[level].concat(item.VIVIFRAIL[level]);
      }
    });
  });

  return merged;
}

export function flattenRiskData(vivifrail) {
  const result = [];

  Object.values(vivifrail).forEach((group) => {
    group.forEach((person) =>
      result.push({ ...person, Level: person.Level || "" }),
    );
  });

  const riskOrder = ["high", "slightlyHigh", "medium", "slightlyLow", "low"];
  result.sort((a, b) => {
    const aCategory = getRiskCategory(a.Risk);
    const bCategory = getRiskCategory(b.Risk);
    return riskOrder.indexOf(aCategory) - riskOrder.indexOf(bCategory);
  });

  return result;
}

export function flattenLevelData(assessments) {
  const levels = ["A", "B", "C", "D"];
  const result = [];

  assessments.forEach((item) => {
    levels.forEach((level) => {
      item.VIVIFRAIL?.[level]?.forEach((person) => {
        result.push({ ...person, Level: level });
      });
    });
  });

  return result;
}

export function mergePersonsByName(persons, mode = "risk") {
  const mergedMap = {};

  persons.forEach((person) => {
    if (!mergedMap[person.Name]) {
      mergedMap[person.Name] = {
        latest: person,
        mergedCount: 0,
        riskCounts: {
          high: 0,
          slightlyHigh: 0,
          medium: 0,
          slightlyLow: 0,
          low: 0,
        },
        levelCounts: { A: 0, B: 0, C: 0, D: 0 },
      };
    }

    const entry = mergedMap[person.Name];
    entry.mergedCount += 1;

    if (mode === "risk") {
      const category = getRiskCategory(person.Risk);
      entry.riskCounts[category] = (entry.riskCounts[category] || 0) + 1;
    } else {
      entry.levelCounts[person.Level] =
        (entry.levelCounts[person.Level] || 0) + 1;
    }

    if (!entry.latest.Date || person.Date > entry.latest.Date) {
      entry.latest = person;
    }
  });

  return Object.values(mergedMap).map((entry) => ({
    ...entry.latest,
    mergedCount: entry.mergedCount,
    riskCounts: entry.riskCounts,
    levelCounts: entry.levelCounts,
  }));
}
