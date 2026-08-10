import { build } from 'vite'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { Script } from 'node:vm'

const root = resolve(import.meta.dirname, '..')
const targets = [
  { input: 'artwork/renderer-prototypes/third-person-girl-motion-v3.html' },
  { input: 'artwork/renderer-prototypes/kotoba-island-terrain-backbone-v1.html' },
  {
    input: 'artwork/renderer-prototypes/kotoba-island-grand-tour-v1-dev.html',
    outputs: [
      'artwork/renderer-prototypes/kotoba-island-grand-tour-v1.html',
      'artwork/renderer-prototypes/kotoba-island-grand-tour-v1-standalone.html',
    ],
  },
]

async function inlinePrototype({ input, outputs }) {
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
    const scriptPath = resolve(dirname(builtHtmlPath), scriptMatch[1])
    if (!scriptPath.endsWith('.js')) throw new Error(`Expected JavaScript bundle for ${input}, got ${scriptPath}`)
    const script = await readFile(scriptPath, 'utf8')
    new Script(script, { filename: scriptPath })
    html = html.replace(scriptMatch[0], '')
    html = html.replace('</body>', () => `<script>${script.replaceAll('</script', '<\\/script')}</script></body>`)

    const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)
    if (styleMatch) {
      const css = await readFile(resolve(dirname(builtHtmlPath), styleMatch[1]), 'utf8')
      html = html.replace(styleMatch[0], `<style>${css}</style>`)
    }

    const embeddedScript = html.match(/<script>([\s\S]*)<\/script><\/body>/)?.[1]
    if (!embeddedScript) throw new Error(`Embedded script missing for ${input}`)
    new Script(embeddedScript, { filename: `${input}:embedded` })
    html = html.replace(/[ \t]+$/gm, '').replace(/^ +(?=\t)/gm, '')

    const destinations = outputs ?? [input.replace(/\.html$/, '-standalone.html')]
    for (const destination of destinations) {
      const output = resolve(root, destination)
      await writeFile(output, html)
      console.log(`${output} (${Buffer.byteLength(html)} bytes)`)
    }
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}

for (const target of targets) await inlinePrototype(target)
