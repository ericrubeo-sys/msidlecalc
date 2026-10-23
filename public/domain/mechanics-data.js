// Publication confidence is separate from implementation and live-game accuracy.
export const MECHANICS_DATA_VERSION = 'msi-guide-2026-10-15-claims-4';
const source = {
  url: 'https://maplestoryidle.nexon.com/en/guide', title: 'MapleStory : Idle RPG Additional Information',
  language: 'en', publishedOrUpdatedOn: '2026-10-15', accessedOn: '2026-10-22',
  game: 'MapleStory : Idle RPG', region: 'English guide; server applicability not identified', build: null,
};
const rule = (id, section, claim, variables, units, stacking, order, cap, contexts, exceptions, unresolved) => ({
  id, source: { ...source, section }, evidenceType: 'officialPublishedRule', exactSupportedClaim: claim,
  variables, units, stacking, order, cap,
  rounding: 'Not specified in reviewed guide; IEEE-754 arithmetic is not a game rounding claim.',
  contexts, exceptions, unresolved,
  confidence: { publication: 'High: official rendered publication verified', implementation: 'synthetic-fixtures-only', empirical: 'not-validated', prediction: 'not-established' },
});
const records = [
  rule('MSI-G15-UNITS', 'Battle §1.1', 'Battle calculations convert 1,000 internal units to 100%.',
    ['displayed percent', 'internal permille', 'fraction'], '100%=1000 permille=1 fraction', 'not applicable', 'normalize exactly once', null,
    ['published battle rate representation'], ['does not identify stacking'], ['UI precision and rounding']),
  rule('MSI-G15-ATTRIBUTE-ORDER', 'Battle §1.1', 'Attack, Defense, Max HP, Max MP and Main Stat add flat values, apply applicable percentage multipliers, then Skill percentage multipliers, then Skill flat values.',
    ['flat sum F', 'aggregated ordinary multiplier M', 'aggregated Skill multiplier S', 'Skill flat sum K'], 'F,K: points; M,S: complete factors',
    'F,K additive; percentage-stage grouping separately established', '(F*M)*S+K', null,
    ['listed families at verified source stage'], ['does not convert attributes to Attack/Stat Prop. Damage'], ['percentage-source grouping', 'source transfer', 'rounding']),
  rule('MSI-G15-FINAL-DAMAGE', 'Battle §1.1', 'Independent Final Damage source effects multiply; 20% and 30% yield a 1.56 multiplier.',
    ['source bonus r_i', 'aggregate multiplier T'], 'r_i: bonus fractions; T: complete factor', 'product(1+r_i)', 'replace sources then reaggregate; exact inverse T/(1+old)*(1+new)', null,
    ['independent effects at same source stage'], ['full multiplier is not source bonus'], ['rounded-total inverse', 'source identity/scope']),
  rule('MSI-G15-REMAINING-CAP', 'Battle §1.1–1.2', 'Damage Taken Decrease, Defense Penetration, Decreased Cooldown (%) and Attack Speed use current+(cap-current)*(added/cap). Their caps are 95%,100%,100%,150%.',
    ['source rate x_i', 'cap C', 'aggregate T'], 'absolute fractional rates, e.g.30%=.3 even at cap1.5', 'C*(1-product(1-x_i/C))', 'replace identified sources before reaggregation',
    { damageTakenDecrease: .95, defensePenetration: 1, decreasedCooldownPercent: 1, attackSpeed: 1.5 },
    ['four named families'], ['saturated inverse non-identifiable'], ['display rounding', 'near-cap conditioning', 'source eligibility']),
  rule('MSI-G15-DEFENSE', 'Battle §1.3', 'Ordinary damage uses 5000/(post-penetration target Defense+6000).',
    ['target Defense D', 'effective penetration p'], 'D: points; p: fraction', 'penetration already aggregated', '5000/(D*(1-p)+6000)', null,
    ['eligible ordinary attack-based damage'], ['fixed/target-HP/special attacks may bypass stages'], ['target Defense', 'rounding', 'exceptions']),
  rule('MSI-G15-DAMAGE-ORDER', 'Battle §1.3', 'Applicable damage factors precede content-specific adjustment; the skill coefficient follows that adjustment.',
    ['Attack', 'applicable target/damage/critical/range/status/final factors', 'content adjustment', 'skill coefficient'], 'Attack:points; factors:complete multipliers',
    'distinct named factors stay distinct', 'ordinary factors -> content adjustment -> skill coefficient', null,
    ['eligible ordinary attacks'], ['special attacks may bypass stages'], ['skill effects/cadence', 'joint outcome distribution', 'rounding']),
  rule('MSI-G15-CRITICAL', 'Battle §1.3; Stat Dictionary; Battle §4.2', 'Critical Rate controls critical chance and Critical Damage applies on critical hits; the explicit100% weighting limit is scoped to PvP adjustment.',
    ['effective critical event', 'critical multiplier'], 'probability and complete multiplier', 'evaluate final outcomes before expectation', 'critical branch before context transform', null,
    ['critical-capable eligible attacks'], ['PvP limit is not ordinary-PvE overflow rule'], ['ordinary overflow/resistance', 'range distribution', 'eligibility']),
  rule('MSI-G15-CONTEXT', 'Battle §2.1', 'Named Zakum/Horntail Boss/Guild Raid content has square-root-based adjustment; Guild Training has cube-root-based adjustment.',
    ['pre-context damage', 'mode adjustment', 'skill coefficient'], 'profile-specific', 'no generic Boss profile', 'transform outcomes then weight; coefficient afterward', null,
    ['named publication scopes, not enabled profiles'], ['root prose does not establish constants/eligibility'], ['Chapter Breakthrough', 'complete Arena rules', 'named-mode formulas/rounding']),
  rule('MSI-G15-PVP-LEVEL', 'Battle §4.2: Level-Based Adjustment', 'Each gained defender level reduces received damage relative to previous level: Arena/World Arena31–60 by0.5%,61–100 by1.3%,after100 by1.5%; Colosseum31–60 by0.5%,61–70 by1.3%,71–100 by1.5%,after100 by2.5%. Korean guide resolves the English100+ boundary wording.',
    ['integer defender levels before/after', 'per-transition reduction r'], 'levels and fractional reduction per transition', 'derived recurrence product(1-r); reciprocal for lost levels',
    'isolated defender-level factor; full PvP needs other receiver/context inputs', null,
    ['relative defender-level change at levels>=30 in named PvP modes'], ['no attacker-level scaling or complete Arena result'],
    ['absolute anchor<=30 unspecified', 'rounding', 'live verification', 'regional/build applicability not established']),
];
records.find(({ id }) => id === 'MSI-G15-CONTEXT').confidence.implementation = 'named-profiles-not-implemented';
records.find(({ id }) => id === 'MSI-G15-CRITICAL').confidence.implementation = 'explicit-outcome-arithmetic-only; effective-chance-not-inferred';
records.find(({ id }) => id === 'MSI-G15-PVP-LEVEL').confidence.implementation = 'isolated-relative-level-factor-fixtures-only';
const pvpLevel = records.find(({ id }) => id === 'MSI-G15-PVP-LEVEL');
pvpLevel.corroboratingSources = [{ ...source, url: 'https://maplestoryidle.nexon.com/ko/guide',
  title: '메이플 키우기 추가 정보', language: 'ko', section: '전투 시스템 안내 §4.2',
  region: 'Korean guide; cross-language corroboration, shared server/build applicability not established',
  supportedClaim: '61~100 and71~100 are followed by100 레벨 이후 (after level100); next band begins with gained level101.',
}];
pvpLevel.translationResolution = 'English100+ is interpreted as after100 using same-date Korean explicit wording; only isolated relative level factor resolved.';
pvpLevel.confidence.prediction = 'not-established; no controlled live-game validation';
const trigger = rule('MSI-Q22-TRIGGERS', 'Developer Q&A: attack versus strike', 'On-attack checks occur once per skill use; on-strike checks occur per eligible hit. Additional/continuous damage are excluded from the described triggers.',
  ['skill uses', 'eligible hits', 'trigger probability'], 'events and probabilities', 'trigger-specific', 'eligible event then check', null,
  ['described trigger definitions'], ['additional/continuous damage excluded'], ['complete skill catalog', 'cooldown', 'uptime', 'rotation']);
trigger.source.url = 'https://maplestoryidle.nexon.com/en/qna';
trigger.source.title = 'MapleStory : Idle RPG Developer Q&A';
trigger.source.publishedOrUpdatedOn = null;
trigger.confidence.implementation = 'not-implemented';
records.push(trigger);
const deepFreeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
};
export const CLAIMS = deepFreeze(Object.fromEntries(records.map(record => [record.id, record])));
export function getClaim(id) {
  if (!Object.hasOwn(CLAIMS, id)) throw new RangeError('Unknown mechanics claim.');
  return CLAIMS[id];
}
