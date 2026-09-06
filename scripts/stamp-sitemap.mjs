/**
 * Stamp public/sitemap.xml's <lastmod> with today's UTC date, every build.
 *
 * Google ignores <changefreq>/<priority> (dropped elsewhere in this diff) but
 * does read <lastmod> — and a hand-edited date goes stale the moment nobody
 * remembers to touch it. Running this as a prebuild step means the sitemap
 * always carries the actual build date with zero upkeep.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
const today = new Date().toISOString().slice(0, 10)

const xml = await readFile(file, 'utf8')
const stamped = xml.replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
await writeFile(file, stamped)

console.log(`stamped sitemap.xml lastmod -> ${today}`)
