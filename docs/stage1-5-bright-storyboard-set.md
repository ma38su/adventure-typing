# Stage 1〜5 明るく可愛い・3D実装可能な絵コンテセット

最終更新: 2026-08-10
状態: 共通スタイル校正済み・境界同一性の最終比較前

## 対象画像

| Stage | 画像 | 地理 |
|---:|---|---|
| 1 | `stage-1-meadow-to-forest-storyboard-bright-v3-1.png` | 南東草原→小川橋 |
| 2 | `stage-2-forest-to-mountain-storyboard-bright-v3.png` | 小川橋→北西カルデラ鞍部 |
| 3 | `stage-3-mountain-to-inlet-storyboard-bright-v2.png` | 北西鞍部→南西河口湿地 |
| 4 | `stage-4-inlet-to-ancient-root-storyboard-bright-v2.png` | 南西河口→東向き海岸→根門 |
| 5 | `stage-5-ancient-root-to-cloud-storyboard-bright-v2-1.png` | 南西根門→北東/島中央側の雲上庭園 |

旧版を上書きせず、上記を共通スタイル候補として追加した。

## 共通視覚文法

- sky blue、mint、yellow-green、creamを主色、turquoise、coral、lavenderを土地別accentにする。
- 黒へ落ちる影を避け、明部だけでなく影面にも色を残す。
- 丸みのあるfaceted rock、広葉樹、低木、根を少数asset familyとして読む。
- 小さな花は可愛さの補助であり、進路cueや画面全面のdetailにしない。
- 各panelを4〜7大色面へ整理し、空、水、遠山のいずれかへquiet areaを持つ。
- cameraはroute接線の後方・子どもの目線相当。aerial view、camera反転、背景交換を使わない。
- 地形と遠景はworld map / route-v2の方位・高度・遮蔽へ従う。

## 3D実装契約

絵の各岩・樹木・根を一対一でモデリングしない。canonical terrainを地形正本とし、土地をまたいで
次を共有する。

- rounded basalt 3種
- broadleaf tree 3種＋young tree 2種
- shrub 3種、grass/flower atlas 1式
- root module 3種
- world-coordinate ground/trail shader
- stream/coast water system
- 境界専用のbridge / gate / root-gate modular set

色、scale、rotation、埋没率、密度、LODで変化を作る。専用崖、panel専用の樹木、背景板による海、
画像texture貼付で合わせない。

## 画像監査

### 共通合格

- v1群より一貫して明るく、親しみやすい。
- Stage 1〜5の大色面、丸い形状、花accent、空気遠近が揃った。
- world map上の草原→北西山地→南西湾→海岸東進→島中央上昇を維持した。
- 各Stageを少数の再利用assetへ分解できる。

### 残る共通課題

- cream色の道が連続帯に見えるpanelがある。3Dではtrail shaderへ草、根、暗色土、落葉、石maskを
  35〜55%戻し、輪郭と中央を分断する。絵コンテにも境界比較版でmaskを重ねて確認する。
- 花と岩を等間隔に並べず、seeded scatterでcluster / gapを作る。
- 明るさを保ちながら、森内部と根道には奥行き差が必要。黒ではなく青緑の距離差で作る。

### 境界監査

| 境界 | 状態 | 次の確認 |
|---|---|---|
| Stage 1→2 木橋 | 橋・川・森の型は一致候補 | 同一camera cropで床板、欄干、岩、川向きを照合 |
| Stage 2→3 星見門 | 低い石門と左曲がり道は一致候補 | 門石silhouetteとroute接線を照合 |
| Stage 3→4 河口石橋 | 小型石橋・葦・湿地は一致候補 | 橋幅、アーチ、山の位置を照合 |
| Stage 4→5 根門 | Stage 5 v2-1で別石門を削除しroot gateへ統一 | 根3本の交差、海方向、route位置を照合 |

境界比較が終わるまで品質版3Dへ一括展開しない。Stage 2から一境界ずつ反映する。

## 生成記録

組み込み画像生成を使用。Stage 3 bright v2を共通スタイルreference、各旧版を地理順reference、
前Stage画像を境界referenceとして使用した。各promptへasset family数、route方位/高度、camera接線、
海の遮蔽、禁止する専用mesh的細部を記載した。生成画像は3D assetやtextureとして使わない。

