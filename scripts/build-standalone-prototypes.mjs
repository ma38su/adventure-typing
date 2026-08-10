import { build } from 'vite'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const targets = [
  'artwork/renderer-prototypes/third-person-girl-motion-v3.html',
  'artwork/renderer-prototypes/kotoba-island-terrain-backbone-v1.html',
  'artwork/renderer-prototypes/kotoba-island-grand-tour-v1.html',
]

async function inlinePrototype(input) {
  const temporary = await mkdtemp(join(tmpdir(), 'kotobajima-standalone-'))
  try {
    await build({
      root,
      configFile: false,
      base: './',
      logLevel: 'warn',
      build: {
        outDir: temporary,
        emptyOutDir: true,
        modulePreload: false,
        cssCodeSplit: false,
        rollupOptions: {
          input: resolve(root, input),
          output: {
            inlineDynamicImports: true,
            entryFileNames: 'bundle.js',
            assetFileNames: 'bundle.[ext]',
          },
        },
      },
    })

    const builtHtmlPath = join(temporary, input)
    let html = await readFile(builtHtmlPath, 'utf8')
    html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/g, '')
    const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
    if (!scriptMatch) throw new Error(`Bundled script not found for ${input}`)
    const script = await readFile(resolve(dirname(builtHtmlPath), scriptMatch[1]), 'utf8')
    html = html.replace(scriptMatch[0], `<script>${script}</script>`)

    const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
    if (styleMatch) {
      const css = await readFile(resolve(dirname(builtHtmlPath), styleMatch[1]), 'utf8')
      html = html.replace(styleMatch[0], `<style>${css}</style>`)
    }

    const output = resolve(root, input.replace(/\.html$/, '-standalone.html'))
    await writeFile(output, html)
    console.log(`${output} (${Buffer.byteLength(html)} bytes)`)
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}

for (const target of targets) await inlinePrototype(target)
