function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function ceilPositive(value) {
  const n = Math.ceil(value);
  return n > 0 ? n : 0;
}

/**
 * Weighted attendance:
 * - Present: 1
 * - Late: 1
 * - On-Duty: 1
 * - Half-Day: 0.5
 * - Absent: 0
 */
function buildAttendanceSummaryFromCounts(counts, targetPercentage = 75) {
  const present = toNumber(counts.Present);
  const absent = toNumber(counts.Absent);
  const late = toNumber(counts.Late);
  const onDuty = toNumber(counts['On-Duty']);
  const halfDay = toNumber(counts['Half-Day']);

  const total = present + absent + late + onDuty + halfDay;
  const attendedUnits = present + late + onDuty + (halfDay * 0.5);

  const target = toNumber(targetPercentage, 75);
  const targetRatio = target / 100;

  const percentage = total > 0 ? (attendedUnits / total) * 100 : 0;

  // n such that (attended + n)/(total + n) >= target
  // n >= (target*total - attended) / (1 - target)
  let classesNeededToReachTarget = 0;
  if (total > 0 && targetRatio < 1) {
    const needed = ((targetRatio * total) - attendedUnits) / (1 - targetRatio);
    classesNeededToReachTarget = ceilPositive(needed);
  }

  // m such that attended/(total + m) >= target => m <= attended/target - total
  let classesCanMissAndStayAtTarget = 0;
  if (total > 0 && targetRatio > 0) {
    const canMiss = Math.floor((attendedUnits / targetRatio) - total);
    classesCanMissAndStayAtTarget = canMiss > 0 ? canMiss : 0;
  }

  return {
    targetPercentage: target,
    counts: { present, absent, late, onDuty, halfDay, total },
    attendedUnits,
    percentage: Number(percentage.toFixed(1)),
    classesNeededToReachTarget,
    classesCanMissAndStayAtTarget,
  };
}

module.exports = {
  buildAttendanceSummaryFromCounts,
};

