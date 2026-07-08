/* eslint-env node */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const url = process.argv[2] || 'https://jthiruveedula.github.io/'
const outDir = process.argv[3] || './audit-screenshots'
const passName = process.argv[4] || 'baseline'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

async function main() {
  const dir = path.resolve(outDir, passName)
  await mkdir(dir, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    console.log(`[${passName}] Loading ${url} at ${vp.name} (${vp.width}x${vp.height})`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

    // Wait for React hydration + hero animations to start
    await page.waitForTimeout(2500)

    // Scroll through the page to trigger lazy sections and scroll animations
    await page.evaluate(async () => {
      const delay = (ms) => new Promise((r) => setTimeout(r, ms))
      const step = window.innerHeight * 0.6
      const max = document.body.scrollHeight - window.innerHeight
      for (let y = 0; y <= max; y += step) {
        window.scrollTo(0, y)
        await delay(400)
      }
      window.scrollTo(0, 0)
    })

    // Let final animations settle after scroll reset
    await page.waitForTimeout(1200)

    const fileName = `${passName}-${vp.name}-${vp.width}x${vp.height}.png`
    const filePath = path.join(dir, fileName)
    await page.screenshot({ path: filePath, fullPage: true })
    console.log(`  → ${filePath}`)

    await context.close()
  }

  await browser.close()
  console.log(`Done: ${dir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
