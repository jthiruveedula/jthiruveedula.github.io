#!/usr/bin/env node
/**
 * Keep the GitHub Project board in step with the repository.
 *
 * The board is derived, not hand-maintained: everything except two deliberate
 * exceptions is read off the issue/PR itself.
 *
 *   Status   from state        open -> Todo, closed/merged -> Done
 *   Release  from milestone    "v7.2 — visual primacy" -> v7.2
 *   Area     from labels       area:dataviz -> dataviz
 *   Outcome  from state        merged/closed-completed -> Shipped
 *
 * `OUTCOME_OVERRIDES` is the only hand-written part, and it exists because state
 * cannot express intent. A closed issue is not always shipped work: #120 closed
 * with zero code because the behaviour already existed, and #111 was replaced by a
 * later PR. Recording either as "Shipped" would assert work that never happened,
 * which is precisely what a board is supposed to prevent.
 *
 * Requires the `project` scope:  gh auth refresh -s project
 *
 *   node scripts/project-sync.mjs            # apply
 *   node scripts/project-sync.mjs --dry-run  # print the plan, touch nothing
 *   node scripts/project-sync.mjs --only 123 # a single issue/PR, for CI
 */
import { execFileSync } from 'node:child_process'

const OWNER = 'jthiruveedula'
const REPO = 'jthiruveedula/jthiruveedula.github.io'
const PROJECT = '4'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const ONLY = (() => {
  const i = argv.indexOf('--only')
  return i === -1 ? null : Number(argv[i + 1])
})()

const sh = (args, { allowFail = false } = {}) => {
  try {
    return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (err) {
    if (allowFail) return null
    throw new Error(`gh ${args.join(' ')}\n${(err.stderr || '').toString().trim()}`)
  }
}
const json = (args) => JSON.parse(sh(args) || 'null')

/** State cannot express intent; these two closed without shipping what they asked for. */
const OUTCOME_OVERRIDES = {
  111: 'Superseded', //  replaced by #114 before it ever merged
  120: 'Already satisfied', //  closed with zero code — the animation already existed
}

const FIELDS = [
  { name: 'Release', options: ['v6.0', 'v7.0', 'v7.1', 'v7.2'] },
  { name: 'Area', options: ['design', 'dataviz', 'imagery', 'motion', 'a11y', 'ci'] },
  { name: 'Outcome', options: ['Shipped', 'Already satisfied', 'Superseded', 'In flight'] },
]

/** Milestone title -> Release option. Falls back to the leading vN.N if unlisted. */
function releaseOf(milestoneTitle) {
  if (!milestoneTitle) return null
  const m = /^v(\d+\.\d+)/.exec(milestoneTitle)
  return m ? `v${m[1]}` : null
}

/** First `area:*` label wins; a card has one home even when the work touched several. */
function areaOf(labels) {
  const hit = (labels ?? []).map((l) => l.name).find((n) => n.startsWith('area:'))
  if (hit) return hit.slice('area:'.length)
  return 'design'
}

function outcomeOf(item) {
  if (OUTCOME_OVERRIDES[item.number]) return OUTCOME_OVERRIDES[item.number]
  if (item.state === 'OPEN') return 'In flight'
  // A PR that closed without merging shipped nothing.
  if (item.isPr && !item.merged) return 'Superseded'
  return 'Shipped'
}

const statusOf = (item) => (item.state === 'OPEN' ? 'Todo' : 'Done')

// ── Gather the repo side ───────────────────────────────────────────────
const rawIssues = json([
  'issue', 'list', '-R', REPO, '--state', 'all', '--limit', '200',
  '--json', 'number,title,state,labels,milestone',
])
const rawPrs = json([
  'pr', 'list', '-R', REPO, '--state', 'all', '--limit', '200',
  '--json', 'number,title,state,labels,milestone,mergedAt',
])

const all = [
  ...rawIssues.map((i) => ({ ...i, isPr: false })),
  ...rawPrs.map((p) => ({ ...p, isPr: true, merged: Boolean(p.mergedAt) })),
]
  // Only things that carry a milestone belong on this board — that is what makes it
  // the redesign arc rather than every ticket the repo has ever had.
  .filter((i) => i.milestone && releaseOf(i.milestone.title))
  .filter((i) => (ONLY ? i.number === ONLY : true))
  .map((i) => ({
    number: i.number,
    title: i.title,
    isPr: i.isPr,
    merged: i.merged,
    state: i.state === 'MERGED' ? 'CLOSED' : i.state,
    release: releaseOf(i.milestone.title),
    area: areaOf(i.labels),
  }))
  .map((i) => ({ ...i, outcome: outcomeOf(i), status: statusOf(i) }))
  .sort((a, b) => a.number - b.number)

console.log(`${DRY ? 'PLAN' : 'SYNC'} · project ${PROJECT} · ${all.length} item(s)\n`)
for (const i of all) {
  console.log(`  #${String(i.number).padEnd(4)} ${i.release.padEnd(5)} ${i.area.padEnd(8)} ${i.status.padEnd(5)} ${i.outcome}`)
}
if (DRY) {
  console.log('\nRe-run without --dry-run to apply.')
  process.exit(0)
}
if (!all.length) {
  console.log('\nNothing to sync.')
  process.exit(0)
}

// ── Fields ─────────────────────────────────────────────────────────────
const projectId = json(['project', 'view', PROJECT, '--owner', OWNER, '--format', 'json']).id
let fields = json(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json']).fields

for (const spec of FIELDS) {
  const found = fields.find((f) => f.name === spec.name)
  if (!found) {
    sh(['project', 'field-create', PROJECT, '--owner', OWNER, '--name', spec.name,
        '--data-type', 'SINGLE_SELECT', '--single-select-options', spec.options.join(',')])
    console.log(`\n  field ${spec.name} — created`)
    continue
  }
  // A field can exist while missing an option added later (e.g. "In flight").
  const missing = spec.options.filter((o) => !(found.options ?? []).some((x) => x.name === o))
  if (missing.length) console.log(`\n  field ${spec.name} — missing option(s): ${missing.join(', ')} (add in the UI; the API cannot append)`)
}
fields = json(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json']).fields
const byName = Object.fromEntries(fields.map((f) => [f.name, f]))
const optionId = (field, value) => (byName[field]?.options ?? []).find((o) => o.name === value)?.id ?? null

// ── Add every missing item FIRST, then read the board once ─────────────
// Projects v2 is eventually consistent. The first version of this script re-read the
// item list immediately after each add and matched nothing, so it created the board
// and set zero field values. Batch the writes, then read once.
const before = json(['project', 'item-list', PROJECT, '--owner', OWNER, '--format', 'json', '--limit', '300'])
const present = new Set((before.items ?? []).map((it) => it.content?.number))

const added = all.filter((i) => !present.has(i.number))
for (const i of added) {
  sh(['project', 'item-add', PROJECT, '--owner', OWNER,
      '--url', `https://github.com/${REPO}/issues/${i.number}`], { allowFail: true })
}
if (added.length) console.log(`\n  added ${added.length} item(s); waiting for the board to settle`)

/** Poll until every expected item is visible, rather than assuming one read is enough. */
let board = null
for (let attempt = 0; attempt < 6; attempt++) {
  board = json(['project', 'item-list', PROJECT, '--owner', OWNER, '--format', 'json', '--limit', '300'])
  const seen = new Set((board.items ?? []).map((it) => it.content?.number))
  if (all.every((i) => seen.has(i.number))) break
  execFileSync('sleep', ['2'])
}
const entryOf = new Map((board.items ?? []).map((it) => [it.content?.number, it]))

// ── Field values ───────────────────────────────────────────────────────
let applied = 0
const unresolved = []
for (const i of all) {
  const entry = entryOf.get(i.number)
  if (!entry) { unresolved.push(i.number); continue }
  for (const [field, value] of [['Status', i.status], ['Release', i.release], ['Area', i.area], ['Outcome', i.outcome]]) {
    const opt = optionId(field, value)
    if (!opt) continue
    sh(['project', 'item-edit', '--id', entry.id, '--project-id', projectId,
        '--field-id', byName[field].id, '--single-select-option-id', opt], { allowFail: true })
  }
  applied++
}

console.log(`\n  fields applied to ${applied}/${all.length} item(s)`)
if (unresolved.length) {
  console.log(`  NOT on the board after retries: ${unresolved.join(', ')} — re-run to converge`)
  process.exitCode = 1
}
sh(['project', 'link', PROJECT, '--owner', OWNER, '-R', REPO], { allowFail: true })
console.log(`\nhttps://github.com/users/${OWNER}/projects/${PROJECT}`)
