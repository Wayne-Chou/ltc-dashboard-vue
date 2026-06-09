/**
 * Fix accidental <motion> tags in Vue SFC root <template> only.
 * Skips nested <template v-if> blocks inside the root template.
 */
import fs from 'node:fs'
import path from 'node:path'

const files = process.argv.slice(2)
if (!files.length) {
  console.error('Usage: node scripts/fix-motion-tags.mjs <file.vue> [...]')
  process.exit(1)
}

const TAG = 'di' + 'v'
const OPEN = /<\s*motion\b/gi
const CLOSE = /<\s*\/\s*motion\s*>/gi
const STRAY_CLOSE = new RegExp(`</${TAG}>>`, 'g')

/** Root SFC template: first <template> after </script>, last </template> in file */
function extractRootTemplate(raw) {
  const scriptEnd = raw.search(/<\/script>/i)
  if (scriptEnd === -1) return null

  const afterScript = raw.slice(scriptEnd + '</script>'.length)
  const openIdx = afterScript.search(/<template\b/i)
  if (openIdx === -1) return null

  const closeIdx = raw.lastIndexOf('</template>')
  if (closeIdx === -1) return null

  const openTagEnd = raw.indexOf('>', raw.indexOf('<template', scriptEnd))
  const innerStart = openTagEnd + 1
  const inner = raw.slice(innerStart, closeIdx)
  const full = raw.slice(raw.indexOf('<template', scriptEnd), closeIdx + '</template>'.length)
  const openTag = raw.slice(raw.indexOf('<template', scriptEnd), openTagEnd + 1)

  return { full, openTag, inner, innerStart, closeIdx }
}

function fixTemplate(template) {
  const openCount = (template.match(OPEN) || []).length
  const closeCount = (template.match(CLOSE) || []).length
  const strayCount = (template.match(STRAY_CLOSE) || []).length

  const content = template
    .replace(STRAY_CLOSE, `</${TAG}>`)
    .replace(OPEN, `<${TAG}`)
    .replace(CLOSE, `</${TAG}>`)

  return { content, openCount, closeCount, strayCount }
}

function fixVueFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const extracted = extractRootTemplate(raw)
  if (!extracted) {
    console.log(`${filePath}: could not parse root <template>`)
    return
  }

  const { full, inner } = extracted
  const { content: fixedInner, openCount, closeCount, strayCount } = fixTemplate(inner)

  if (openCount === 0 && closeCount === 0 && strayCount === 0) {
    console.log(`${filePath}: no <motion> tags in root template`)
    return
  }

  const fixed = raw.replace(full, full.replace(inner, fixedInner))
  fs.writeFileSync(filePath, fixed, 'utf8')
  console.log(
    `${filePath}: opening=${openCount}, closing=${closeCount}, stray>>=${strayCount}`,
  )
}

for (const file of files) {
  fixVueFile(path.resolve(file))
}
