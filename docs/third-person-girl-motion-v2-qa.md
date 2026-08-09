# 女の子冒険者 3D motion pilot v2 — 要件・QA

最終更新: 2026-08-10  
対象: `artwork/renderer-prototypes/third-person-girl-motion-v2.html`

## 目的

華やか版v2三面図の衣装が、3D化と歩行時にも魅力的かをGLB制作前に確認する。正式モデルやゲーム統合ではなく、4.5頭身のシルエット、階層リグ、関節の演技、foot plant、肩布・鞄の追従を比較する技術プリビズ。

## 実装要件

- 頭、髪、胸、腰、骨盤、左右の上腕・前腕・手、大腿・下腿・足を別階層で保持する。
- ターコイズ＋コーラル、黄土サッシュ、片側の葉形肩布、短いボブ、斜め掛け鞄を表現する。
- idle / walk / run、再生・停止、0.50〜1.50倍速を即時切替できる。
- 正面 / 側面 / 背面 / 3/4を同じスケールで確認できる。
- wireframe、骨格、reduced motionを独立して切替できる。
- walk/runは肩・肘・股・膝・足首、腰・胸の逆捻り、左右のfoot plantを含む。単純な全身上下動だけにしない。
- reduced motionでも接地の位相は保ち、腕振り・捻り・上下動のみ35%へ抑える。
- 既存のcamera composition v1は変更しない。

## 目視QA

| 項目 | 期待値 | 結果 |
|---|---|---|
| 初期表示 | 3/4、walk、1.00倍、全身が接地まで見える | PASS |
| motion | idle / walk / runで関節と速度の差が読める | PASS |
| foot plant | 支持脚の足が後ろへ反らず、遊脚の膝・足首が曲がる | PASS（平地プリビズ） |
| view | 正面 / 側面 / 背面 / 3/4が切替できる | PASS |
| inspect | wireと骨格を同時にも表示できる | PASS |
| reduced | 関節位相を保ったまま振幅が低下する | PASS |
| responsive | 1024×768相当、狭幅で水平overflowなし | PASS（`scrollWidth - clientWidth = 0`） |
| console | error 0 | PASS（warningも0） |

実ブラウザで初期walkを目視後、run / side / wire / 骨格 / reduced motionを同時に有効化して再確認した。足の長さと接地高は初回目視の浮きを受けて修正し、再読込後に確認した。

## 判定の境界

このHTMLのprimitiveは体格・色・動作の判断用で、顔造形、髪束、服の縫製、skin weight、two-bone IK、坂道raycastの最終品質は判定しない。外観承認後、同じ階層・semantic materialを正式GLBへ置き換える。
