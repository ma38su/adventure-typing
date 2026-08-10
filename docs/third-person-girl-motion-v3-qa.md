# 女の子冒険者 review model v3 — 要件・QA

最終更新: 2026-08-10  
対象: `artwork/renderer-prototypes/third-person-girl-motion-v3.html`

## 目的

v2の階層リグとmotion比較機能を維持しつつ、華やか版v2三面図に近い「可愛い主人公」としてレビューできる造形へ改善する。正式GLBではなく、体格、顔、髪、衣装レイヤー、3/4・背面シルエット、平地foot plantの承認用プリビズ。

## v2からの造形改善

- 約4.5頭身。頬の丸み、目・眉・口・頬色を追加。
- 髪を複数の丸い塊で構成し、短いボブ、前髪、片側結び、琥珀の留めを分離。
- 首、肩、胸、腰、骨盤の間を丸い形状で接続し、腰の異常な露出を解消。
- 上腕・前腕・大腿・下腿を丸いtapered capsuleで構成。手を扁平な丸形、靴を丸いつま先に変更。
- ターコイズのジャケット、生成りインナー、コーラル縁、黄土サッシュ、葉形肩布、小鞄を別レイヤー化。
- idle / walk / run、再生停止、速度、4視点、wire、骨格、reduced motionは維持。

## 目視QA

| 項目 | 期待値 | 結果 |
|---|---|---|
| 3/4 | 顔、髪留め、上着、肩布、鞄が分離して読める | PASS |
| 背面 | ボブ、片側結び、肩布、小鞄が主人公の輪郭を作る | PASS |
| 接続 | 関節の大きな隙間、箱腕、腰の露出がない | PASS |
| motion | idle / walk / runで肩肘股膝足首、腰胸、腕振りが読める | PASS |
| foot plant | 支持脚と遊脚の位相、膝・足首の曲がりが読める | PASS（平地） |
| inspect | wire / 骨格 / reduced motionを併用できる | PASS |
| responsive | 1024×768で水平overflow 0 | PASS |
| console | error 0 | PASS（warningも0） |

実ブラウザでwalk 3/4とrun背面を目視し、foot plant表示と支持脚・遊脚を確認した。1024×768 QA画像は `artwork/renderer-prototypes/qa/third-person-girl-motion-v3-1024x768.png`。計測時の `scrollWidth - clientWidth` は0。

## スマホ追試

390×844の縦長表示では、初期cameraを原点から補間せず3/4位置へ即配置する。縦長canvasだけcamera distanceを広げ、FOVを33°から39°へ変更する。rendererの再計測は描画widthとheightの両方を条件に含める。

- 3/4 walk: 初回frameから全身が中央に表示されることを確認。
- front / side / back / 3/4: 全視点を切り替え、全身がviewport内に残ることを確認。
- horizontal overflow: 0。
- console warning / error: 0。
- QA画像: `artwork/renderer-prototypes/qa/third-person-girl-motion-v3-390x844.png`。
- 既存1024×768表示もdesktop用distance / FOVを維持する。

坂道IK、skin weight、髪や布のsecondary bone、表情animationは正式GLB工程の対象で、このprimitive pilotの判定には含めない。
