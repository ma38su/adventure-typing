# 連続世界runtime backbone

`kotoba-island-route-v2.js`の球面座標・標高・region・watershedと、地学正本から生成する全島低詳細surfaceを全36 Stage共通のbackboneとする。Stage別の独立曲線や孤立地形は作らない。

- `scripts/generate-world-route-runtime.mjs`が正本からruntime JSONを機械生成する。216 anchorを手で複製しない。
- `worldTerrainBackbone.ts`が唯一のENU投影と全Stage registryを提供する。
- `islandTerrainSurface.ts`が決定論的な海岸、旧カルデラ・北西高地・中央分水嶺、三水系、北東湿潤／南西雨陰を持つ標準LODを生成する。地上route anchorの高度は地形生成の補助情報に留め、海岸断面・分水界・河道を上書きしない。実際の歩行経路は生成後の正本地形へ接地させる。雲上anchorは地形でなく構造物高度とする。
- backboneは全島surface、経路、標高、region、watershedを所有する。島全体の最高詳細meshは作らない。
- corridor chunkはbackbone上のsurface・植生・岩・構造物だけを所有する。
- currentとforward chunkを保持し、Stage境界でscene/canvas/rendererを再生成しない。
- Stage 1–2は同じ`bnd-meadow-forest-a` anchor/chunkを共有する。Stage 3以降も同じregistryから接続する。
- `artwork/renderer-prototypes/kotoba-island-terrain-backbone-v1.html`で全島surface、36 route、Stage 1詳細範囲を同時確認できる。

## 球面海とLOD

- 惑星半径6371kmの球面海を海面正本とし、島patchは中心ENU接平面から球面落差`(east²+north²)/(2R)`を加えた隆起として載せる。17×16km範囲の実曲率を誇張しない。
- debugの回転中心は島中心に固定し、panを禁止する。海面は有限平面でなく球面なので360° orbitでも端や裏面が見えない。水平線より手前を空気遠近とfogで連続させる。
- 海岸距離から`deep-ocean → outer-reef → shallow-water → sand/rock-shore`を段階化し、南西湾北部には`estuary-wetland`を置く。bathymetryは深海側へ連続的に下げる。
- runtime LODは遠景の球面海（低分割・低周波法線）、current/forward corridor周辺の沿岸帯、カメラ近傍の波detailの三層。波detailは見た目だけでroute・海岸・標高を所有しない。

## 単体配布版

`artwork/renderer-prototypes/kotoba-island-terrain-backbone-v1-standalone.html`は、Three.js、terrain生成、216 anchorを内包した一ファイル版である。開発サーバーやネットワークを必要としない。`node scripts/build-standalone-prototypes.mjs`で開発版から再生成する。
