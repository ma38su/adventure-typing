# ことば島：正本地形とLOD実装契約

## 結論

全島模型と実際のプレイフィールドは別モデルにしない。`islandTerrainSurface.ts` を唯一の地形正本とし、同じ緯度・経度に対して同じ海岸線、標高、気候、水系、海岸帯を返す。表示距離に応じて変えるのはメッシュ密度と上物だけである。

## 3段階の表示

| LOD | 用途 | 正本から取得 | LOD固有 |
|---|---|---|---|
| globe | ワールドマップ・全島俯瞰 | 海岸、標高、海底、地域、全216アンカー | 粗い格子、遠景色 |
| regional-corridor | 前後ステージを含む景観 | 同じ地表＋決定的微地形 | 中密度格子、遠中景植生 |
| gameplay-near | キャラクター周囲 | 同じ地表＋同じ決定的微地形 | 高密度格子、草・根・落葉・小物 |

LODは別の地形を所有しない。`sampleRenderedSurfaceHeightKm()` の同一地点を異なる密度でサンプリングする。微地形もローカルシーンの手描き波形ではなく、地理座標を入力する正本関数である。

## 座標と接続

- 世界正本：WGS84相当の `latitudeDeg / longitudeDeg / altitudeKm`
- 全島表示：正本原点からENUへ投影し、球面曲率を表示時に適用
- プレイ回廊：Stage 1始点を原点にした剛体ENU変換。`geographicPointToScene()` と `scenePointToGeographic()` は互いに逆変換
- Stage境界：前Stage終端と次Stage始点は同じアンカー・同じ地表サンプルを共有
- 再ロードや地形差し替えは行わず、周辺LODをストリーミングする

## 水と岸

球面海は全島表示の視覚基盤だが、海岸判定は `sampleCoastDistanceKm()`、水深と岸種は `sampleIslandSurface()` が所有する。近景の波、泡、透明度は表現レイヤーであり、岸線位置を変更してはならない。川・小川は水系IDと地形勾配に従って追加する上物で、地形を独自に切断しない。

## 上物配置契約

樹木、岩、橋、草、発見演出は緯度・経度または正本route progressを保存する。描画時に `sampleCorridorGroundSceneY()` で接地する。小物側が独自の高さ関数を持つこと、見た目を合わせるために地面から浮かせること、Stageごとに別の経路曲線を手描きすることは禁止する。橋など高さを持つ物だけ、接地高に明示的な構造オフセットを加える。

## 実装の所有関係

- `worldTerrainBackbone.ts`: 全36 Stage、216アンカー、世界投影
- `islandTerrainSurface.ts`: 海岸・標高・水深・気候・水系・正本微地形
- `canonicalTerrainMesh.ts`: renderer非依存の回廊メッシュ生成と接地API
- `stageTwoRouteV2.ts`: 世界座標とStage 1–2回廊座標の可逆変換
- `StageOneJourneyScene.tsx`: Three.jsの材質・光・上物。地形形状は所有しない

## 単体HTML

生成済みstandaloneはThree.jsとデータをインライン化しているが、ユーザー環境の
`file://` では表示できないことを確認した。したがって「単体HTMLで確認可能」は未達であり、
現時点ではVite配信版だけを正規の確認経路とする。ブラウザやOSのファイルプレビューに
依存するstandaloneを配布経路にはしない。単体配布を再開する場合は、対象端末の実機で
起動・WebGL描画・操作・consoleを確認できた版だけを成果物として扱う。

## 完了条件

- 216アンカーと全35境界が維持される
- 地上アンカーの正本標高制約が維持される
- Stage 1–2の地面、道、小物、カメラが同じ接地APIを使う
- globeとnearで海岸・巨視標高が分岐しない
- tests、lint、buildが成功する
