# ことば島 全36 Stage 球面route spline正本 v2

最終更新: 2026-08-10
状態: 全36 Stageの中間座標・距離・問題密度を機械生成する正本
機械可読データ: [`kotoba-island-route-v2.js`](../artwork/preproduction/world-map/kotoba-island-route-v2.js)
表示QA: [`kotoba-island-map-overlay-v2.html`](../artwork/preproduction/world-map/kotoba-island-map-overlay-v2.html)

## 1. 契約

- 各Stageは開始・終了を含む6個の`scenicAnchor`を持つ。全体で36×6=216個。
- anchorは`latitudeDeg / longitudeDeg / altitudeKm / microLandform / watershedId / regionId / chunkId`を持つ。
- Stage Nのanchor 6はStage N+1のanchor 1と座標・高度・chunkが完全一致する。
- anchor間は一様Catmull–Rom spline（各区間24 sample）で補間し、開始・終了だけを結ぶchordをrouteとして使わない。
- `routeDistanceKm`は補間sample間の球面大円距離と高度差から再計算する。地図・SVG・3D worldが同じ値を使う。
- 中間点はStageごとの地域遷移に対する法線方向の小蛇行から決定論的に生成する。水彩画像の道へ合わせて座標を動かさない。
- 地形正本は局所正距方位投影の小範囲ENU。水彩画像は雰囲気比較レイヤーであり、座標・流域・routeを所有しない。

## 2. 地学制約

- meadow→forestは溶岩原の緩丘、涸れ沢、河岸段丘、季節湿地、防風林縁、小川氾濫原を通る。
- forest→mountainは支流を上り、段丘崖、倒木gap、雲霧林の肩からカルデラ鞍部へ達する。
- mountain→inletは分水嶺を一度だけ鞍部で越え、支尾根、谷頭、崩積斜面、河岸段丘、河口湿地の順に下る。
- inlet→rootは河口湿地、自然堤防、砂泥・藻場、白砂・波食棚、海食洞、溶岩洞崩落窓の順。河口へ珊瑚を置かない。
- root→skyは根際湿地、宙水泉、古土壌段、人工・生物構造の上昇根螺旋、雲霧集水庭へ上る。
- sky→meadowは雲上施設、風衝露台、霧氷石段、石造鞍部、実体下降支尾根、草原へ連続する。
- Stage 12→13は同じ`bnd-sky-star-route`で接続し、Stage 13内で夜航路展望台から森まで実体下降する。

## 3. 距離・問題数への影響

旧始終点chordの水平合計は約198.8kmだった。六anchorと高度を含むCatmull–Rom sampleで再計算した全routeは約207kmである。蛇行・上昇下降により約4%増える。問題数は`ceil(routeDistanceM / 150)`と景観beat下限24問の大きい方、上限60問とし、1 course 6〜9問、`ceil(Q/8)`を暫定course数とする。

| Stage | 距離km | 問 | course | Stage | 距離km | 問 | course |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 7.73 | 52 | 7 | 19 | 7.72 | 52 | 7 |
| 2 | 5.74 | 39 | 5 | 20 | 5.74 | 39 | 5 |
| 3 | 8.36 | 56 | 7 | 21 | 8.42 | 57 | 8 |
| 4 | 4.07 | 28 | 4 | 22 | 4.07 | 28 | 4 |
| 5 | 3.35 | 24 | 3 | 23 | 3.33 | 24 | 3 |
| 6 | 7.82 | 53 | 7 | 24 | 8.33 | 56 | 7 |
| 7 | 7.22 | 49 | 7 | 25 | 7.72 | 52 | 7 |
| 8 | 5.74 | 39 | 5 | 26 | 5.74 | 39 | 5 |
| 9 | 8.43 | 57 | 8 | 27 | 8.42 | 57 | 8 |
| 10 | 4.07 | 28 | 4 | 28 | 4.07 | 28 | 4 |
| 11 | 3.37 | 24 | 3 | 29 | 3.32 | 24 | 3 |
| 12 | 0.81 | 24 | 3 | 30 | 8.32 | 56 | 7 |
| 13 | 3.71 | 25 | 4 | 31 | 7.72 | 52 | 7 |
| 14 | 5.75 | 39 | 5 | 32 | 5.74 | 39 | 5 |
| 15 | 8.43 | 57 | 8 | 33 | 8.42 | 57 | 8 |
| 16 | 4.07 | 28 | 4 | 34 | 4.07 | 28 | 4 |
| 17 | 3.40 | 24 | 3 | 35 | 3.31 | 24 | 3 |
| 18 | 8.79 | 59 | 8 | 36 | 1.99 | 24 | 3 |

暫定総数は1,441問、193 courseとなる。これは問題文を今すぐ量産する指示ではない。各Stageの通常速度3D歩行QA後に、60問へ近づく長距離Stage 9、15、18、21、27、33を優先してroute・休憩単位・学習負荷をレビューする。距離を隠すために速度を上げたり空間をskipしたりしない。

## 4. SVG地形基盤

v2 HTMLは、次をすべて球面座標から同じ投影関数で描く。

- 島輪郭
- 草原・森・山・入り江・古代樹林region
- 三段の標高帯
- 弧状分水嶺
- 森支流・星見支流・根泉支流
- 河口湿地・外湾礁
- 216 anchorと全36 spline

水彩v2はopacity付きで比較表示できるが、座標地形と一致しない場所をroute座標で補正してはならない。v1 overlayの7較正点による水彩v2のaffine残差RMSは約52pxであり、比較toggle中に表示する。水彩側の次版制作で、SVGの島輪郭、分水嶺、河川、region、routeを参照し、この残差を下げる。

## 5. 機械QA

- Stage数36、anchor数216。
- 全35 Stage境界で座標・高度・chunkの完全一致。
- 全anchorにmicro-landform、watershed、region、chunkが存在。
- spline sample数は1 Stageあたり121（5区間×24+終点）。
- 全距離は有限かつ正、問題数18〜60、course数3〜8。
- Stage 12終点と13始点は`bnd-sky-star-route`。
- Stage 3/9/15/21/27/33は鞍部→支尾根→谷頭→河口で、分水嶺を反復横断しない。
