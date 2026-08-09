# Stage 1 3Dゲーム統合仕様

> 状態: **technical gate・route v2接続後のStage 1統合候補**（2026-08-10）。Stage 1だけを候補範囲とし、Stage 2以降への3D制作・統合は各共有境界の承認まで停止する。

## 意図

Stage 1「草原から森へ」は、背景画像の切替ではなく、草原・林縁・森・小川を一つのThree.jsワールド内に配置する。文が終わってもカメラ位置は戻さず、ステージ全体の `journeyProgress`（0〜1）だけで経路上を前進させる。

## 画面と責務

- 対象は冒険モードのStage 1のみ。他ステージと苦手キー練習は既存2D画面を維持する。
- ヘッダー下を一つの3D viewportにし、常設の島マップ、2D横歩きシーン、アイテムサイドパネルは表示しない。
- 上部はステージ名・コース/問題・連続進捗・スコアだけの最小HUD、問題文は下部の半透明パネルへ重ねる。
- `journeyProgress` はコース内の問題番号と現在問題の歩行量から単調増加させる。`sentenceProgress` は3Dカメラへ渡さない。
- `isTyping` と `typingPace` は足取りの上下動だけに使い、基準カメラ位置には影響させない。reduced motionでは足取りを抑える。
- WebGLが開始できない場合も問題入力を妨げず、水彩調のCSS背景を表示する。
- `JourneyWorld`をReact側の安定ownerとし、Stage 1 rendererはその配下へ置く。将来Stage 2を承認した時はownerを差し替えず、同じcanvas/camera/transportへ次chunkを追加する。
- Three.jsを含む`JourneyWorld`は`React.lazy`で分離し、Stage 1冒険を開始するまでダウンロード・初期化しない。
- item/animal/BGMは`journeyContracts.ts`に接続型だけを定義する。正式演出は未統合で、3Dが2D報酬UIや音楽transportを所有しない。

## 受入基準

1. Stage 1で文を完了して次問へ移っても、視点がスタートへ戻らない。
2. 進捗0 / 0.2 / 0.4 / 0.55 / 0.75 / 1.0で、草原 / 林縁 / 森入口 / 成木の狭間 / 森内部 / 小川の橋へ連続移動する。
3. Stage 1では旧CourseMap、AdventureScenes、GameSidePanelがDOMに存在しない。
4. 1024×768でヘッダー、HUD、問題文、ローマ字入力表示がスクロールなしで収まる。
5. Stage 2以降と苦手キー練習の画面は従来どおり動作する。
6. WebGLリソース、ResizeObserver、animation frameを画面離脱時に破棄する。
7. 初期main chunkにThree.jsを含めず、Stage 1用遅延chunkとして分離する。

## 現在のWIP変更

- `src/journey3d/StageOneJourneyScene.tsx`: Three.jsプリビズから一本の経路、地形追従カメラ、水彩canvas texture、狭い踏み跡、密な植生、倒木、小川と橋、光量変化をゲーム用ライフサイクルへ抽出。
- `src/journey3d/JourneyWorld.tsx`: Stage境界をまたいでも維持するReact owner。現時点では承認済み範囲のStage 1 rendererだけを保持。
- `src/journey3d/journeyContracts.ts`: BGM意味cueとitem/animal予兆を将来接続する型。報酬UIは2Dゲーム層所有。
- `src/journey3d/journeyRoute.ts` / `.test.ts`: 進捗clamp、6地点ラベルと純関数テスト。
- `src/App.tsx`: `selectedStage === 1 && practiceMode === 'adventure'` のときだけ3Dレイアウトへ分岐し、`courseProgress` を接続。
- `src/App.css`: Stage 1の固定viewport、最小HUD、下部半透明TypingCard、1024×768用の省面積指定。
- `src/three.d.ts`: 現行依存に型宣言パッケージがない状態でもビルド可能にする局所宣言。

外部担当が更新した `package.json` / `package-lock.json`、プリビズHTML、3D正本文書は参照したが、削除・巻き戻し・commitしていない。

## 検証記録

- `npm test -- --run`: 106 tests passed。
- `npm run lint`: passed。
- `npm run build`: passed。main `465.99 kB`、`JourneyWorld 8.03 kB`、`three-core 17.30 kB`、`three-shaders 220.04 kB`、`three-renderer 298.63 kB`へ分離し、500 kB警告は解消。Three関連chunkはStage 1でのみ取得する。
- Chromeの1024×768相当viewportで画像確認。実測は `innerWidth=1024`, `innerHeight=767`, `scrollHeight=767`, `scrollY=0`。
- 同画面で `canvas=1`, `.map-panel=0`, `.adventure-scene/.perspective-scene=0`, `.side-panel=0`。
- 1問目完了後に道のりが0%から7%へ進み、報酬確認後の2問目でも7%を保持。console warning/errorは0件。
- QA画像では、上部HUD、草原から森へ続く奥行き、下部の日本語・ローマ字・フィードバックがスクロールなしで同時に見えることを確認した。

## technical gate後の復帰手順

1. 正本資料とプリビズの技術判定結果を本書へ追記し、経路・描画品質・端末方針の差分を確定する。
2. WIPが残っている場合は上記5ファイルの差分を再確認する。別作業で退避する場合は、この文書と `src/journey3d/`、`App.tsx` の `usesStageOneJourney` 分岐、`App.css` の `stage-one-*` 節を一組としてpatch化する。
3. `package.json` の `three` 依存を維持し、test / lint / buildを再実行する。
4. 1024×768でStage 1の0%、文境界後、40%、75%、100%を画像比較してからcommit対象へ昇格する。

## 正本route v2 adapterの接続状態

`StageOneJourneyScene`は、機械可読route v2のStage 1・6 anchorを`stageOneRouteV2.ts`へ明示変換し、chunk localのCatmull–Rom経路として使用する。地図と同じanchor順・微地形・共有終端を参照するが、専用モデルと全chunkの品質承認前なので、Stage 1シーン全体を「正式モデル完成」とは扱わない。

1. ゲームの単調増加`journeyProgress`を共有`worldProgress / regionId / chunkId`へ変換する。
2. route、地形、踏み跡中心、カメラ地形追従が同じ標本を参照し、独自の補間曲線を重複させない。
3. Stage 1終端とStage 2開始で同じ橋・両岸・接線を共有し、scene/canvas/cameraを再生成しない。
4. BGMはsemantic cueを購読するだけ、item/animalは予兆eventを受け渡すだけとし、rendererが音声や2D報酬を所有しない。
5. v2 adapterの画像比較と専用モデルが承認されるまで、Stage 1シーンを「正式モデル完成」と記載しない。

### km座標を描画へ渡す単位

`stageOneRouteV2.ts`はartwork用IIFEを実行時importせず、Stage 1の6 anchorをsrc用データとして明示変換する。緯度経度は最初のanchorを原点とするENU kmへ変換し、開始→終了ベクトルをchunk内の前方軸へ回転する。その後、Stage 1の水平距離だけを152 scene unitへscaleする。

- 世界全体のkm座標で巨大なterrainを一度に生成しない。
- 各chunkは自身の開始anchorをlocal原点とし、前方`-Z`、横断`X`、標高差をmetadataとして持つ。
- 隣接chunkは共有boundary anchorと接線を同値にし、owner側がchunk local transformをworldへ配置する。
- 遠方chunkの浮動小数精度やGPU負荷を避け、`現在＋前方`だけを生成・保持する。
- `stageOneRouteV2.test.ts`で6 anchor順、progress、微地形、共有終端、local corridor範囲を固定する。
