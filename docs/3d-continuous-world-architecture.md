# 3D連続世界アーキテクチャ検討

最終更新: 2026-08-09
状態: 方式検討・草原から森の試作を基準に設計
対象: `花と草原 → 木漏れ日の森 → 星見の山道` から始まる全6地域

## 1. 結論

採用候補は、自由移動型のオープンワールドではなく、**タイピング進捗で一本道を進む連続世界を、複数チャンクとしてストリーミングする方式**とする。

プレイヤーからは草原、森、山、入り江、古代樹林、雲上遺跡が地理的につながって見える。一方、実装では現在地の前後に必要なチャンクだけをThree.jsへ読み込み、遠くなったチャンクを解放する。

この方式を本書では「連続コリドー型世界」と呼ぶ。

### オープンワールドと異なる点

- 自由移動、方向入力、衝突探索を導入しない。
- カメラ位置は一意の旅座標から決定する。
- プレイヤーは道を外れず、タイピングによって前進する。
- 一本道でも、道の蛇行、視界の開閉、周辺地形、ランドマークで広い世界を感じさせる。
- 画面外まで環境を作るが、実際に移動できる範囲は限定する。

## 2. 体験上の目標

1. ステージ選択や問題の切り替わりがあっても、同じ島を旅していると感じられる。
2. 地域境界で背景画像の交換、暗転、ポータル、霧の壁を使わない。
3. 次の地域を遠景、音、植生、地形で少しずつ予告する。
4. 前の地域を振り返らなくても、来た方向の地理を想像できる。
5. タイピング中は進行方向が常に明確で、自由移動の判断を要求しない。

## 3. 世界座標と旅座標

全地域を概念上は一つの世界座標へ置く。ただし、全地域のメッシュを同時には生成しない。

```ts
type WorldJourneyState = {
  worldProgress: number       // 全旅程0〜1
  regionId: RegionId
  regionProgress: number      // 地域内0〜1
  chunkId: ChunkId
  isTyping: boolean
  typingPace: number          // 足取り演出だけに使用
  reducedMotion: boolean
}
```

- `worldProgress` は全地域を通じて単調増加する。
- `regionProgress` は現在地域内の表示やイベント判定に使用する。
- カメラの前進距離は進捗から決まり、`typingPace` では変更しない。
- 問題や文章が変わっても、`worldProgress` とカメラ位置を戻さない。

## 4. チャンク構成

一地域を一ファイル、一メッシュとして扱わず、次の単位へ分割する。

| チャンク種別 | 目安長 | 内容 |
|---|---:|---|
| 地域内部 | 60〜120m | 地域固有の主要景観、通常歩行、ランドマーク |
| 地域境界 | 20〜40m | 前後地域の植生・光・地形が混ざる共有区間 |
| イベント | 15〜30m | 倒木、小川、橋、展望地点などの局所演出 |
| 遠景 | 必要範囲 | 次地域の山、森、海、遺跡などの軽量カード |

同時に保持する基本範囲:

```text
後方チャンク  現在チャンク  前方チャンク  次地域の遠景
    optional       active        preload          proxy
```

- 現在チャンクは完全表示する。
- 前方チャンクは境界へ近づく前に生成する。
- 後方チャンクはカメラから十分離れた時点で解放する。
- 次地域全体は読み込まず、遠景proxyだけを先に表示する。

## 5. 地域のつなぎ方

### 草原から森

```text
広い草原
  → 横に広がる森の遠景
  → 若木と低木が混ざる林縁
  → 成木の間を通過
  → 樹冠に包まれた森内部
```

- 森は道沿いの列ではなく、画面外まで続く面として先に見せる。
- 林縁チャンクでは草原と森の地表色、霧、照明を連続補間する。
- 森内部へ入った後は空シェーダー、距離霧、露出を青緑へ寄せる。

### 森から山

```text
森内部
  → 森の中の小川と橋
  → 木々の隙間に遠い山稜
  → 林床が乾き、岩と傾斜が増える
  → 星見の山道
```

- 小川と橋は森の内部に置く。
- 橋の周囲と対岸にも樹林を継続する。
- 山は中央の狭い抜けから予告し、森の出口で突然全面表示しない。
- 海は山道後半または物語上必要な展望地点まで見せない。

## 6. ファイル構成案

ステージごとのHTMLは作らない。共通レンダラー、地域定義、チャンク定義、共有アセットへ分ける。

```text
src/journey3d/
  JourneyRenderer.ts
  JourneyWorld.ts
  WorldStreamer.ts
  journeyState.ts
  camera/
    JourneyCamera.ts
    WalkingMotion.ts
    CameraEventTrack.ts
  rendering/
    watercolorMaterials.ts
    skyShader.ts
    atmosphere.ts
  assets/
    trees.ts
    vegetation.ts
    rocks.ts
    bridges.ts
  regions/
    meadow/
      region.ts
      chunks.ts
      placements.ts
    forest/
      region.ts
      chunks.ts
      placements.ts
    mountain/
      region.ts
      chunks.ts
      placements.ts
  boundaries/
    meadowForest.ts
    forestMountain.ts
```

## 7. 地域・チャンク契約

```ts
type JourneyChunkDefinition = {
  id: string
  regionId: RegionId
  worldRange: readonly [number, number]
  bounds: THREE.Box3
  createGeometry(context: ChunkContext): THREE.Group
  createProps(context: ChunkContext): THREE.Group
  atmosphere: AtmosphereKeyframes
  cameraEvents: CameraEvent[]
  preloadDistance: number
  unloadDistance: number
}

type AtmosphereKeyframes = {
  skyTop: THREE.Color
  skyHorizon: THREE.Color
  fogColor: THREE.Color
  fogDensity: number
  exposure: number
  sunIntensity: number
  ambientIntensity: number
}
```

隣接チャンクの環境値は、境界範囲で連続補間する。チャンク切り替え時に色や霧を直接切り替えない。

## 8. カメラと歩行

### 確認再生

- 一定速度で旅座標を再生する。
- 歩行揺れを入れず、構図、密度、接続、カメラ経路を確認する。

### ゲーム歩行再生

- 旅座標の前進量は、タイピング進捗の仮入力で決める。
- `typingPace` は足取りの周期、上下動、左右重心、環境反応だけに使用する。
- 倒木などのイベントでは、進捗区間に紐づくカメライベントを加算する。
- イベントによる動きは位置を戻さず、通常カメラ曲線へ滑らかに復帰する。

### 倒木イベント例

```ts
type CameraEvent = {
  range: readonly [number, number]
  heightOffset(t: number): number
  lookOffset(t: number): THREE.Vector3
  rollOffset(t: number): number
  reducedMotionScale: number
}
```

接近時に倒木へ視線を少し下げ、踏み越えで上昇し、着地で小さく沈む。障害物とカメラ演出は同じ世界座標・進捗区間を参照する。

## 9. 描画とメモリ管理

古いiPadを想定し、最初から次を守る。

- 遠景・周辺樹林は`InstancedMesh`を使用する。
- 近景の特徴木だけを個別`Group`にする。
- 地域外周は歩行帯より広く作るが、遠距離ほど形状を単純化する。
- 地表テクスチャ、紙目、ノイズは地域ごとに重複生成しない。
- 水面、粒子、影を持つオブジェクト数へ上限を設ける。
- 解放チャンクのgeometry、material、textureを参照カウント後に`dispose()`する。
- 次地域の遠景proxyと本体を同時に長時間保持しない。

初期目標:

| 項目 | 目標 |
|---|---:|
| 同時保持チャンク | 2〜3 |
| 影を落とす個別樹木 | 近景中心に20〜35本 |
| 周辺・遠景樹木 | instancing |
| 常時粒子 | 50以下 |
| pixel ratio | 最大1.5 |
| 目標fps | iPadで安定30fps以上 |

## 10. 現試作から移植するもの

`artwork/renderer-prototypes/meadow-to-forest-threejs-v1.html`から次を共通モジュール候補として抽出する。

- Catmull-Romルートと旅座標
- 地形追従カメラ
- 確認再生とゲーム歩行再生
- タイピングペースによる足取り演出
- 倒木のカメライベント
- 水彩調の地表テクスチャ
- トゥーン材質
- 空シェーダー、霧、露出の連続補間
- 樹木・低木・岩の基本生成
- 周辺樹林のinstancing

現HTMLをそのまま本体へ貼り付けず、役割ごとに分離して移植する。

## 11. 次の技術検証

1. 現試作を`草原内部`、`草原―森境界`、`森内部`、`森―山境界`の4チャンクへ仮分割する。
2. 同じ見た目を保ったまま、現在チャンク＋前方チャンクだけで再生する。
3. チャンク生成・解放時にカメラ、霧、光、道が変化しないことを確認する。
4. 森の小川と橋を森―山境界の手前へ置き、対岸にも十分な樹林を残す。
5. 山の遠景proxyを、橋の中央付近からだけ見えるようにする。
6. GPUリソース数、draw call、フレーム時間を画面へ表示する検証モードを追加する。
7. iPad相当のviewportとpixel ratioで30fps以上を確認する。

この検証が通るまで、残りの入り江、古代樹林、雲上遺跡を同時制作しない。
