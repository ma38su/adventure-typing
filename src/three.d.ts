declare module 'three'
declare module 'three/src/Three.js'
declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export class GLTFLoader {
    loadAsync(url: string): Promise<{
      scene: {
        traverse(callback: (object: unknown) => void): void
      }
      animations: Array<{ name: string }>
    }>
  }
}
