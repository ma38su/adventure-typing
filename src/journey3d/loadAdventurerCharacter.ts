import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  ADVENTURER_CHARACTER_ASSET_URL,
  inspectAdventurerCharacterAsset,
  type AdventurerAssetReport,
} from './adventurerCharacterAsset'

export type LoadedAdventurerCharacter = {
  scene: { traverse(callback: (object: unknown) => void): void }
  animations: readonly { name: string }[]
  report: AdventurerAssetReport
}

/** Load and inspect the future authored GLB. This is deliberately not mounted
 * until the asset passes its visual gates and this structural report. */
export async function loadAdventurerCharacter(
  url = ADVENTURER_CHARACTER_ASSET_URL,
): Promise<LoadedAdventurerCharacter> {
  const gltf = await new GLTFLoader().loadAsync(url)
  const morphTargetNames = new Set<string>()
  let hasSkinnedMesh = false

  gltf.scene.traverse((object) => {
    const mesh = object as {
      isSkinnedMesh?: boolean
      morphTargetDictionary?: Record<string, number>
    }
    if (mesh.isSkinnedMesh) hasSkinnedMesh = true
    Object.keys(mesh.morphTargetDictionary ?? {}).forEach((name) => morphTargetNames.add(name))
  })

  return {
    scene: gltf.scene,
    animations: gltf.animations,
    report: inspectAdventurerCharacterAsset({
      clipNames: gltf.animations.map((clip) => clip.name),
      morphTargetNames: [...morphTargetNames],
      hasSkinnedMesh,
    }),
  }
}
