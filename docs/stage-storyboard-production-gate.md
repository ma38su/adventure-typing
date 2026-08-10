# 連続3Dステージ画像絵コンテ標準工程・制作gate

最終更新: 2026-08-10  
状態: Stage 1表現正本確定・Stage 2画像絵コンテ制作前
対象: Stage 2〜36の画像絵コンテ、三人称overlay、3D着手判定

## 1. 目標と正本

Stage 1で最終的に到達した次の画像を、全Stageの**目標品質・表現基準**とする。

- `artwork/preproduction/meadow-to-forest-storyboard-webgl-implementation-v2.png`

流用するのはStage 1の草原・森・橋という内容ではない。流用するのは、大色面で読みやすく整理されたローポリ造形、水彩紙の柔らかさ、六コマを通した連続移動、近中遠景の構成、密度と余白の判断である。各Stageの地形、植生、建造物、物語cue、色、光は当該制作ブリーフへ差し替える。

`meadow-to-forest-storyboard-nihonga-simplified-v1.png`は日本画・水彩方向を探った画風検討履歴、`webgl-implementation-v1.png`は実装整理途中の履歴であり、最終出力の正本にはしない。過去の試行錯誤を新Stageで順に再現してはならない。

## 2. 正本から抽出する観察可能な視覚文法

「柔らかい」「ファンタジー」だけでは合否判定できない。生成前に次を数え、生成後も画面上で確認する。

| 軸 | 正本の視覚文法 | 観察可能な要件 |
|---|---|---|
| 大色面 | 空、地面、遠山、樹林、道を先に大きな面で分ける | 縮小表示しても空間を4〜7個の主要色面として説明できる。細部を消しても進路とlandmarkが残る |
| 造形 | 3D実装へ翻訳できる面分割を保つ | 樹冠、岩、山、地面は低〜中密度の多角形面。写真模様、鉛筆線、細密な葉脈へ逃げない |
| 描き込み密度 | 主役周辺だけ中密度、遠景と空は低密度 | 高周波な細部が画面全面へ均一に広がらない。空・遠景・進路のうち最低2領域に休める面がある |
| 日本画×水彩 | 輪郭線より色面、透明な重なり、紙の柔らかさ | 黒い外輪郭なし。淡い紙目は全体に一度だけ。色境界は柔らかいが、物体シルエットは読める |
| 非対称 | 道、木、landmarkを中央軸へ揃えない | 左右の幹の太さ・高さ・距離が異なる。道は緩く蛇行し、主landmarkは中央から5〜25%ずれる |
| 道 | 空間を導くが道路を主役にしない | 遠方へ向かって細くなり、途中で一度以上曲がる。地面との境界は不規則。草、苔、落葉、根が中央にも戻る |
| 植生層 | 少数モデルの反復でなく奥行きの層を作る | 森では高木、若木、低木、草本、林床の5層中4層以上が一画面で読める。樹冠・幹・低木を異なる距離帯へ置く |
| 近景 | 太い幹、岩、花、根で視差と入口を作る | 左右または片側の画面端に1〜3個の大形状。ただし進路とlandmarkを完全には塞がない |
| 中景 | 道と当該anchorの出来事を読む層 | 道の曲がり、橋、倒木、門など主役を一つに限定。副要素は主役より小さく・低コントラスト |
| 遠景 | 次の土地を予告し移動方向を保つ | 山稜、樹林の抜け、道の続きなどを一つ。前景より低彩度・低コントラスト・明るい空気遠近 |
| 光 | 進路を柔らかく導き、照明切替を見せない | 道または次の開口に最明部を置く。隣接コマで色温度・露出を段階変化させ、暗転・白飛びを使わない |
| 六コマ連続 | 同じ場所の反復でも背景交換でもない | 隣接コマごとに視界、勾配、水、岩、植生、landmark、光の最低2軸を変え、最低2要素を前コマから残す |

## 3. 標準工程

各Stageは次の一方向工程とする。

1. 制作ブリーフ、地学・植生正本、前後Stage境界を読む。
2. 次節のdesign review sheetを埋める。未定欄が一つでもあれば生成しない。
3. 六anchorを大色面・近中遠景・道・光へ分解し、隣接差を表にする。
4. Stage固有差替え欄を固定し、共通prompt templateへ一度だけ組み込む。
5. 3×2のfirst passを一枚生成する。
6. first-pass合格条件を機械的に判定する。差戻し時は第7節の分類を一つ選ぶ。
7. 構図承認後、同じ六anchorで技術greyboxを作り画像比較する。
8. 品質モデル・材質・植生へ進み、最後に三人称overlay gateを別途通す。

生成結果へ場当たり的に「もっと森」「道を狭く」「さらに柔らかく」などを追記して再生成してはならない。不合格なら、原因となったdesign review sheet、六コマ仕様、観察可能な数値要件のいずれかを先に修正し、promptをテンプレートから再構築する。promptだけの継ぎ足し履歴を仕様にしない。

## 4. 生成前design review sheet

Stageごとに複製して全欄を埋め、画像と同じディレクトリへ保存する。

```md
# Stage [番号] storyboard design review

- 物語上の一文体験:
- 開始共有物 / 所有Stage:
- 終了共有物 / 所有Stage:
- 地質・微地形の開始→終了:
- 植生帯の開始→終了:
- 色・時刻・気象の開始→終了:
- 絶対に見せない土地・物:
- 主役landmark 6点:
- 六コマを通して残す連続要素 2点以上:
- 画面を開くanchor / 最も密にするanchor:
- 道幅・道面の状態:
- 近景反復assetと変化規則:
- 中景の主役優先順位:
- 遠景の次土地予告:
- 前Stage終端との一致確認方法:
- 次Stage入口との一致確認方法:
- HUD safe zone:
- typing safe zone:
- 三人称overlayは今回含める / 別gate:
- first passで判断する3項目:
```

レビューでは、(a)六コマの物語順、(b)地形・植生の因果、(c)前後境界、(d)画面密度、(e)3Dで再現できるasset単位を確認する。生成担当へ渡す前にディレクターが可否を記録する。

## 5. Stage固有差替え欄

共通promptで変更してよいのは次の欄だけである。

```text
[STAGE_TITLE]
[ONE_SENTENCE_JOURNEY]
[START_BOUNDARY_EXACT]
[END_BOUNDARY_EXACT]
[GEOLOGY_AND_MICROLANDFORMS]
[VEGETATION_START_TO_END]
[PALETTE_LIGHT_WEATHER]
[RECURRING_ASSETS]
[PANEL_1]
[PANEL_2]
[PANEL_3]
[PANEL_4]
[PANEL_5]
[PANEL_6]
[FORBIDDEN_STAGE_SPECIFIC_ELEMENTS]
```

各`PANEL`は必ず「近景 / 中景主役 / 遠景 / 道の曲線と幅 / 前コマから残す要素 / 変える2軸 / 光」を含む。形容詞だけの欄、`beautiful`や`detailed`だけの指定は不可。

## 6. 3×2六コマ共通prompt template

```text
Create one production-quality environment storyboard sheet for [STAGE_TITLE], six equal 16:9 panels in a clean 3-column by 2-row grid, chronological left-to-right then top-to-bottom. This is one unbroken walk: [ONE_SENTENCE_JOURNEY]. The first panel must physically preserve [START_BOUNDARY_EXACT]. The final panel must physically continue into [END_BOUNDARY_EXACT]. No scene reset or background replacement.

Match the visual language and output quality of the authoritative Stage 1 reference, meadow-to-forest-storyboard-webgl-implementation-v2.png, without copying its meadow, forest, bridge, or layout content. Use large readable color masses first; simplified low-to-medium polygonal forms that can be rebuilt in WebGL; restrained transparent-watercolor softness and one subtle paper texture layer; soft colored edges without black outlines; asymmetrical grouping; a clear foreground, middle ground and atmospheric-distance background. Keep detail selectively concentrated around one middle-ground focal landmark per panel. Leave quiet low-frequency areas in sky, distance, or route. The route must curve at least once, narrow with perspective, and merge irregularly into its terrain rather than appearing as a bright road.

Stage geology and micro-landforms: [GEOLOGY_AND_MICROLANDFORMS]. Vegetation transition: [VEGETATION_START_TO_END]. Palette, light and weather: [PALETTE_LIGHT_WEATHER]. Reusable recurring assets and variation rules: [RECURRING_ASSETS].

Panel 1: [PANEL_1]
Panel 2: [PANEL_2]
Panel 3: [PANEL_3]
Panel 4: [PANEL_4]
Panel 5: [PANEL_5]
Panel 6: [PANEL_6]

Across every adjacent pair, change at least two of view openness, slope, water, rock, vegetation band, landmark, or light, while visibly retaining at least two continuity elements. Avoid centered symmetry and evenly spaced repeated assets. No text, captions, interface, arrows, logo, portal, crossfade, scene cut, broad road, empty plaza, photographic PBR, dense linework, black contour lines, neon effects, or [FORBIDDEN_STAGE_SPECIFIC_ELEMENTS]. Environment storyboard only; do not include a character in this landscape-authority pass.
```

参照画像を入力できる生成手段では正本を必ず画像参照として渡す。渡せない場合もファイル名だけに依存せず、第2節の視覚文法をpromptへ残す。

## 7. first-pass合格条件と差戻し分類

first passは次をすべて満たして初めて「方向性確認へ提出可」とする。

1. 3×2、六コマ、順序、16:9が崩れていない。
2. 六コマすべてで大色面、近中遠景、一本の進路が読める。
3. 各コマの主landmarkが一つに絞られ、縮小表示でも判別できる。
4. 各隣接コマで2軸以上変化し、2要素以上が残る。
5. 最初と最後の共有境界が前後Stageの正本と一致する。
6. 正本同様、ローポリへ翻訳可能な面構成と柔らかな水彩紙感が両立する。
7. 道が道路・広場でなく、地形へ不規則に混ざる。
8. 画面全域が同じ細密度にならず、視線を休める面がある。
9. 地学、植生、時刻、光がdesign review sheetと矛盾しない。
10. キャラクターやUIを焼き込まず、景観正本として単独利用できる。

差戻しは一つの主分類を選び、要件側へ修正箇所を記録する。

| ID | 差戻し分類 | 先に直す場所 |
|---|---|---|
| G | 地理・連続性 | boundary、微地形、前後比較欄 |
| C | 構図・遠近 | 各panelの近中遠景、主役、非対称条件 |
| D | 密度・余白 | 大色面数、detail集中地点、quiet area |
| S | 表現・画材 | polygon面、輪郭、紙目、PBR禁止条件 |
| P | 道・進行感 | 道幅、曲線、近景視差、地面への混ざり |
| E | 植生・生態 | 植生層、距離帯、遷移規則 |
| L | 光・色 | 最明部、空気遠近、隣接補間 |
| B | 制作物形式 | 3×2、順序、panel欠落、文字混入 |

同じ主分類で2回不合格になった場合、再度promptを足さずdesign reviewをディレクターへ戻す。三つ以上の分類が同時に不合格なら、部分修正せずStage固有差替え欄を作り直す。

## 8. Stage 2への適用済みdesign review

- 物語上の一文体験: Stage 1の小川橋を渡り、湿った森の音をたどって、空気の開く山腹の星見門へ上る。
- 開始共有物: Stage 1正本第6コマと同じ木橋、小川、苔岩、両岸林。
- 終了共有物: 低い層状岩の星見門と、その先へ曲がるStage 3山腹道。
- 地質: 小川氾濫原→支流合流→段丘崖→倒木gap→雲霧林の肩→カルデラ鞍部。
- 植生: 湿った常緑・半常緑の五層林→高木を距離差で減らす→風衝低木と乾いた草。背後の森を残す。
- 色・光: 青緑の木漏れ日→灰青の山気＋少量の夕金。霧と露出は連続変化。
- 道: 1.5〜1.8mの獣道。苔、落葉、草、根を中央にも戻し、明色の帯にしない。
- 絶対に見せない: 海、伐採地、広場、portal、巨大門、巨大建造物、派手な発光、進路理解を羽根印・矢印・細かな記号へ依存する構図。
- 連続要素: 蛇行する踏み跡、灰青の遠気、背後または片側へ残る森。
- 最密anchor: p=0.20〜0.40。最も開くanchor: p=0.80〜1.00。
- first pass判断3項目: Stage 1橋の一致、森が段階的に開くこと、星見門の先が実在する道であること。

### Stage 2六コマ差替え値

| p | Stage固有panel値 |
|---:|---|
| 0.00 | 近景: Stage 1と同じ苔岩とシダ。中景: 同じ木橋と小川。遠景: 対岸の密な五層林。道: 橋へ軽く下降して対岸で右へ曲がる。残す: 橋・両岸・青緑光。変える: 主人公位置は含めず視点だけ橋手前へ進める。光: Stage 1終端と一致 |
| 0.20 | 近景: 湿った根・シダ・層状岩。中景: 支流合流と右曲線。遠景: 左右外周まで続く森。道: 1.5〜1.8m、中央に苔。残す: 水・青緑光。変える: 橋を背後へ、水音方向と岩量。光: 湿った柔光 |
| 0.40 | 近景: 苔根・落葉。中景: 右寄りの非対称な樹洞大木。遠景: 樹洞の横から上る蛇行道。残す: 密な外周森・湿岩。変える: 段丘勾配・樹洞大木landmark。光: 樹洞横の進路へ柔らかい明部。羽根印や細かな記号を主要cueにしない |
| 0.60 | 近景: 倒木根株・草。中景: 倒木横を抜ける細道。遠景: 背後の高木面と増える空。残す: 苔・片側の高木。変える: 視界の開き・乾く地面。光: gapへ柔らかい灰青明部 |
| 0.80 | 近景: 層状岩・乾いた草・風下低木。中景: 斜面沿いの獣道。遠景: 木の狭間の灰青山稜。残す: 背後の森・蛇行道。変える: 勾配・岩/低木帯・霧量。光: 灰青＋夕金 |
| 1.00 | 近景: 風衝草・低い岩。中景: 非対称位置の低い星見門。遠景: 門越しに曲がるStage 3山腹道と稜線。残す: 層状岩・夕金。変える: 樹冠量・門landmark。光: 門は発光せず道の先が最明部 |

Stage 2生成時は第6節へこの表を差し込み、正本画像を参照入力する。first pass後にStage 1第6コマとの境界比較、Stage 3入口proxyとの方向比較を行う。山側への誘導は樹洞大木、倒木、上り勾配、段階的に下がる植生密度、増える空、進路上の柔らかな明部だけで成立させる。小鳥や羽根が画面に存在しても雰囲気・物語の副要素に限定し、それを見落とすと道が分からない構図は不合格とする。

## 9. 三人称overlay gate

景観絵コンテと三人称キャラクター構図を同時に生成して景観正本を曖昧にしない。景観first pass承認後、その画像へ別レイヤーで次を合成・検証する。

- 女の子は画面高の22〜30%、下中央から左右10%以内を基本とする。
- cameraは後方2.8〜3.6m、頭上0.8〜1.2m、28〜35mm相当を起点にする。
- 上12%を進捗HUD、下24%をtyping overlayの検証帯として重ねる。
- キャラクターが道の次の曲がり、主landmark、発見cue、足元の危険を隠さない。
- キャラクターを避けるため景観landmarkを移動しない。遮る場合はcamera offsetとキャラクター画面占有率を先に調整する。
- 六コマで体格、衣装、camera距離を保つ。動きのpose差は許容するが別人化させない。

景観正本、三人称overlay、実装スクリーンショットの三者を同anchorで比較して合格後にゲーム統合する。

## 10. 制作範囲gate

- Stage 2〜12: 各Stageのdesign review sheetと六コマ景観絵コンテを承認するまで当該Stageの品質版3Dへ着手しない。次Stageの境界proxyだけ技術検証用に許可する。
- Stage 13〜36: 文章資料は完成済みだが画像は未制作。Stage 12承認後、Stage 13から一Stageずつ「design review→景観絵コンテ→greybox→三人称overlay→品質版」の順で制作する。
- 全Stage: 実装都合で構図を変える場合、先にdesign review sheetと景観絵コンテを改訂する。3D側で場当たり的にassetを増減しない。
