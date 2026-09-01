#!/usr/bin/env node
/**
 * Populate the GitHub Project board with the redesign arc, and give it the fields
 * needed to read it as a history rather than a flat list of closed tickets.
 *
 * Requires the `project` scope, which the repo token does not carry by default:
 *
 *     gh auth refresh -s project
 *
 * Idempotent — re-running adds nothing twice. Fields that already exist are reused,
 * items already on the board are skipped, and field values are re-applied so a
 * partially-populated board converges rather than duplicating.
 *
 *     node scripts/project-sync.mjs            # apply
 *     node scripts/project-sync.mjs --dry-run  # print the plan, touch nothing
 */
import { execFileSync } from 'node:child_process'

const OWNER = 'jthiruveedula'
const REPO = 'jthiruveedula/jthiruveedula.github.io'
const PROJECT = '4'
const DRY = process.argv.includes('--dry-run')

const sh = (args, { allowFail = false } = {}) => {
  try {
    return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (err) {
    if (allowFail) return null
    const stderr = (err.stderr || '').toString().trim()
    throw new Error(`gh ${args.join(' ')}\n${stderr}`)
  }
}
const json = (args) => JSON.parse(sh(args) || 'null')

/**
 * The board's content. `outcome` is the honest disposition, which is not always
 * "Done": #120 closed with zero code because the behaviour it asked for already
 * existed, and recording that as Done would assert work that never happened.
 */
const ITEMS = [
  { n: 111, release: 'v6.0', area: 'design',  outcome: 'Superseded' },
  { n: 114, release: 'v7.0', area: 'design',  outcome: 'Shipped' },
  { n: 112, release: 'v7.1', area: 'design',  outcome: 'Shipped' },
  { n: 113, release: 'v7.0', area: 'imagery', outcome: 'Shipped' },
  { n: 115, release: 'v7.1', area: 'design',  outcome: 'Shipped' },
  { n: 116, release: 'v7.1', area: 'ci',      outcome: 'Shipped' },
  { n: 117, release: 'v7.2', area: 'dataviz', outcome: 'Shipped' },
  { n: 118, release: 'v7.2', area: 'imagery', outcome: 'Shipped' },
  { n: 119, release: 'v7.2', area: 'a11y',    outcome: 'Shipped' },
  { n: 120, release: 'v7.2', area: 'motion',  outcome: 'Already satisfied' },
  { n: 121, release: 'v7.2', area: 'motion',  outcome: 'Shipped' },
  { n: 122, release: 'v7.2', area: 'dataviz', outcome: 'Shipped' },
]

const FIELDS = [
  { name: 'Release', options: ['v6.0', 'v7.0', 'v7.1', 'v7.2'] },
  { name: 'Area', options: ['design', 'dataviz', 'imagery', 'motion', 'a11y', 'ci'] },
  // Distinct from Status on purpose. Status says where a card sits; Outcome says
  // what actually happened to it — including the one that needed no code.
  { name: 'Outcome', options: ['Shipped', 'Already satisfied', 'Superseded'] },
]

console.log(`${DRY ? 'PLAN' : 'SYNC'} · project ${PROJECT} · ${ITEMS.length} items, ${FIELDS.length} fields\n`)

if (DRY) {
  for (const f of FIELDS) console.log(`  field  ${f.name.padEnd(8)} ${f.options.join(' · ')}`)
  console.log()
  for (const i of ITEMS) {
    console.log(`  #${String(i.n).padEnd(4)} ${i.release.padEnd(5)} ${i.area.padEnd(8)} ${i.outcome}`)
  }
  console.log('\nRe-run without --dry-run to apply.')
  process.exit(0)
}

// ── Fields ─────────────────────────────────────────────────────────────
const projectId = json(['project', 'view', PROJECT, '--owner', OWNER, '--format', 'json']).id
let fields = json(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json']).fields

for (const spec of FIELDS) {
  if (fields.some((f) => f.name === spec.name)) {
    console.log(`  field  ${spec.name} — exists`)
    continue
  }
  sh([
    'project', 'field-create', PROJECT, '--owner', OWNER,
    '--name', spec.name, '--data-type', 'SINGLE_SELECT',
    '--single-select-options', spec.options.join(','),
  ])
  console.log(`  field  ${spec.name} — created`)
}
fields = json(['project', 'field-list', PROJECT, '--owner', OWNER, '--format', 'json']).fields

const fieldByName = Object.fromEntries(fields.map((f) => [f.name, f]))
const optionId = (fieldName, value) => {
  const opt = (fieldByName[fieldName]?.options ?? []).find((o) => o.name === value)
  if (!opt) throw new Error(`no option "${value}" on field "${fieldName}"`)
  return opt.id
}

// ── Items ──────────────────────────────────────────────────────────────
const existing = json(['project', 'item-list', PROJECT, '--owner', OWNER, '--format', 'json', '--limit', '200'])
const byNumber = new Map((existing.items ?? []).map((it) => [it.content?.number, it]))

for (const item of ITEMS) {
  let entry = byNumber.get(item.n)
  if (!entry) {
    const url = `https://github.com/${REPO}/issues/${item.n}` // works for PRs too
    sh(['project', 'item-add', PROJECT, '--owner', OWNER, '--url', url])
    const refreshed = json(['project', 'item-list', PROJECT, '--owner', OWNER, '--format', 'json', '--limit', '200'])
    entry = (refreshed.items ?? []).find((it) => it.content?.number === item.n)
    if (!entry) {
      console.log(`  #${item.n} — added but not found on re-read, skipping fields`)
      continue
    }
  }
  for (const [fieldName, value] of [['Release', item.release], ['Area', item.area], ['Outcome', item.outcome]]) {
    sh([
      'project', 'item-edit', '--id', entry.id, '--project-id', projectId,
      '--field-id', fieldByName[fieldName].id,
      '--single-select-option-id', optionId(fieldName, value),
    ], { allowFail: true })
  }
  console.log(`  #${String(item.n).padEnd(4)} ${item.release} / ${item.area} / ${item.outcome}`)
}

sh(['project', 'link', PROJECT, '--owner', OWNER, '--repo', REPO], { allowFail: true })
console.log(`\nDone. https://github.com/users/${OWNER}/projects/${PROJECT}`)
