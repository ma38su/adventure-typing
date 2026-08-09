# 連続3Dステージ画像絵コンテ制作gate

最終更新: 2026-08-10  
状態: Stage 1画像絵コンテ正本確認済み・Stage 2画像絵コンテ制作前  
対象: Stage 2〜36の画像絵コンテ、3D着手判定

## 1. 判断と制作順

文章ブリーフだけで品質版3Dを作らない。各Stageは次の順序を必須とする。

1. 物語、地学、六つのscenic anchor、前後境界を文章で固定する。
2. 六コマを一枚にした画像絵コンテを作り、構図・近中遠景・光・連続性を目視承認する。
3. 承認画像を基に同じカメラ位置の技術greyboxを作り、経路、地形、境界、負荷を検証する。
4. 絵コンテとgreyboxの差分を画像比較し、合格後だけ品質モデル、材質、植生、演出へ進む。
5. ゲーム画面のHUDとtyping overlayを重ね、safe zoneとスクロールなしを確認して統合する。

`artwork/renderer-prototypes/meadow-to-forest-threejs-v1.html`と`qa/stage2-corridor-v1/`は空間連続性を示す**技術greybox**であり、Stage 1/2のアート、構図、密度の承認物ではない。Stage 1画像絵コンテ正本の終端をStage 2第1コマの境界正本にする。

## 2. 既存基準と不足

| Stage | 文章ブリーフ | 画像絵コンテ | 技術greybox | 品質版3D着手 |
|---|---|---|---|---|
| 1 | 済 | `meadow-to-forest-storyboard-nihonga-simplified-v1.png`が最新版・正本 | 済 | ゲーム統合済み。三人称化では正本を変えず構図を追加検証 |
| 2 | 済 | **未作成** | 7地点あり | 画像絵コンテ承認まで禁止 |
| 3〜12 | 済 | **全Stage未作成** | Stage 3入口proxyのみ | 各Stageの画像絵コンテ承認まで禁止 |
| 13〜36 | 制作資料済み | 未作成 | 未作成 | Stage 12承認後、画像絵コンテから段階制作 |

Stage 1の`nihonga-simplified-v1`は画調、景観遷移、構図の最新版・正本である。`webgl-implementation-v1/v2`は当時の実装密度・再利用モデルを検討した過去資料に限り、正本として参照しない。森内部1.5〜1.8mの獣道、中央へ戻る苔・落葉・草、左右から張り出す根と草、高木・若木・低木・草本・林床の高密度五層は文章ブリーフと正本画像を併用して判定する。

現在不足するのは次の順序である。

1. Stage 1三人称構図追加検証: 正本画像の六景を変えず、女の子、カメラ、HUD/typing safe zoneを重ねて遮蔽を確認する。新しい景観絵コンテを作る工程ではない。
2. Stage 2画像絵コンテv1: 六コマを同一画調・同一人物視点で比較し、Stage 1正本終端とStage 3入口を連続させる。
3. Stage 3〜12: 各Stage同形式の画像絵コンテ。

Stage 2絵コンテはStage 1正本の橋・小川・両岸林を変更せずに開始する。

## 3. Stage 1三人称構図追加gate

`meadow-to-forest-storyboard-nihonga-simplified-v1.png`の六景、landmark、画調を景観正本として保持する。別の景観案へ描き直さず、三人称の女の子、追従カメラ、上12%・下24%のsafe zoneを追加した構図検証を行う。特にp=0.40以降で森の五層を遮らず、p=0.60以降の幅1.5〜1.8mの獣道と進行方向を主人公が隠さないことを確認する。p=1.00の橋・小川・両岸林はStage 2 p=0.00と同じ共有物として固定する。

Stage 1正本と現Stage 1実装を六anchorで比較し、実装側の構図・密度・道・safe zoneの差を一覧化する。この比較が完了しても自動的に実装を作り直さず、差分承認後に品質反復へ進む。

## 4. Stage 2画像絵コンテ共通仕様

- 一枚の`3列×2段`、左上から右へp=`0.00 / 0.20 / 0.40 / 0.60 / 0.80 / 1.00`。
- 16:9ゲーム画角を各コマで維持し、人物を含む三人称追従カメラで描く。
- 画調は「簡略化した日本画調 × 透明水彩 × 控えめなファンタジー」。大きな色面、柔らかい輪郭、低い高周波密度とする。
- カメラは子どもの後方2.8〜3.6m、頭上0.8〜1.2m、28〜35mm相当。各コマで高さ・レンズを飛ばさない。
- 主人公は画面下中央から左右10%以内、身長は画面高の22〜30%。進路、ランドマーク、発見cueを隠さない。
- 上端12%は進捗HUD、下端24%はtyping overlayのsafe zone。重要な顔、門、樹洞、羽根印、分岐を置かない。
- 近景は画面下・左右に根、草、岩を置き移動視差を作る。中景に細い踏み跡と当該anchorの主役、遠景に次の地形を予告する。
- 道は1.5〜1.8m。中央にも苔・落葉・草を戻し、左右から根と草を張り出させる。明色の道路帯にしない。
- 各コマは直前から視界、勾配、水、岩、植生帯、landmark、光のうち最低2軸を変える。ただし同じ地形を歩いている連続性を残す。
- 文字、UI、矢印、ロゴ、派手な光線、portal、暗転、背景交換、海を描かない。

## 5. Stage 2六コマ画像仕様

| p | 構図と近中遠景 | カメラ | 色・光 | 直前との差・連続条件 |
|---:|---|---|---|---|
| 0.00 | 近: Stage 1の苔岩とシダ。中: 同じ細い木橋、小川、渡り始める主人公。遠: 対岸の密な五層林 | 橋へ軽く下降するroute接線。橋中央を真正面に固定しすぎない | Stage 1終端と同じ青緑の木漏れ日、水面だけ低い反射 | 橋・両岸・小川・樹木位置をStage 1終端から変えない。新sceneの開始絵に見えたら不合格 |
| 0.20 | 近: 湿った根、シダ、層のある岩。中: 支流合流と右へ曲がる踏み跡。遠: 左右外周まで続く森 | 橋を背後へ送り、右曲線を先読み。地形＋一定高 | 湿った深緑、柔らかい青緑。霧はまだ森側の密度 | 水を右後方へ移し、根と岩を近景化。橋の先が空地なら不合格 |
| 0.40 | 近: 苔根と落葉。中: 右寄りの大きな樹洞、中央を塞がない羽根印と小さな枝揺れ。遠: 蛇行する道 | 樹洞へyaw最大6°、進路を画面中央へ残す | 森光の中に羽根だけ弱い暖色。発光はHUDより暗い | 支流より段丘が上がり、樹洞を新landmarkにする。装置・宝箱・派手な魔法にしない |
| 0.60 | 近: 倒木の根株と草。中: 倒木gapをくぐらず横へ抜ける細道。遠: 背後の高木面と増え始めた空 | pitch最大3°上げ、gap越しに行先を見る | 青緑に淡い灰青を混ぜ、gapへ柔らかい明部 | 高木は段階的に減らし背後へ残す。伐採地、広場、木が一斉消失する絵は不合格 |
| 0.80 | 近: 層状岩、乾いた草、風下へ傾く低木。中: 斜面に沿う獣道。遠: 木の狭間の灰青山稜 | 上り勾配へ追従。崖を正面・手前へ置かない | 霧を薄くし、灰青と夕金を増やす。露出段差なし | 森の縁を背後・片側へ残しつつ岩と空を増やす。海や突然の山頂は禁止 |
| 1.00 | 近: 風衝草と低い岩。中: 高さ2.8〜3.4mの星見門と主人公。遠: 門の向こうで曲がり続けるStage 3山腹道、低木、稜線 | 門の手前で道の曲線を注視。門の中心へ吸い込む対称構図を避ける | 灰青の山気と夕金。門自体は発光しない | Stage 3入口を実在地形として見せる。門の先が白・闇・別背景なら不合格 |

## 6. 画像生成用固定prompt

以下を変えず、六コマの内容だけ前節から差し込む。

```text
Create one production storyboard sheet for an original child-friendly fantasy typing adventure, six equal 16:9 panels in a 3-column by 2-row grid, chronological left-to-right then top-to-bottom. A continuous third-person walk from the same mossy creek bridge in a dense subtropical evergreen and semi-evergreen forest, uphill through a tributary terrace and cloud-forest shoulder, ending at a low layered-stone stargazing gate with a real mountain trail continuing beyond it. The same cute girl adventurer appears consistently from behind in every panel, 4.5-head proportion, small backpack, screen-height 22–30 percent. Camera remains 2.8–3.6 meters behind and 0.8–1.2 meters above her head, natural 28–35mm equivalent.

Art direction: simplified Nihonga composition, transparent watercolor washes, restrained fantasy, large readable foliage and rock shapes, soft colored edges, subtle paper grain, no black outlines, no photoreal PBR. Dense ecologically layered forest: canopy trees, young trees, shrubs, ferns, moss, fallen leaves and roots. A narrow 1.5–1.8 meter animal or hiking trace, irregular and partly reclaimed by moss, leaves, grass and roots, never a bright road.

Panel specifications: [insert the six rows from section 5]. Preserve exact continuity with the Stage 1 authoritative storyboard's final bridge panel and show an unbroken physical trail beyond the final gate. Reserve the top 12 percent and bottom 24 percent of every panel as visually quiet UI-safe zones; keep all landmarks and discovery cues outside them. No text, captions, interface, arrows, logos, portal, crossfade, scene cut, ocean, broad road, empty clearing, neon glow, dramatic combat, or background replacement.
```

生成後に別途、Stage 1正本終端と第1コマ、最終コマとStage 3入口proxyを横並び比較する。画像生成結果の見栄えだけで、共有物の位置不一致を許容しない。

## 7. 画像絵コンテ合否

1. 六コマだけを見て、橋から同じ土地を歩き、湿潤な森が段階的に山地へ変わったと説明できる。
2. p=0.00がStage 1終端の橋・小川・両岸と一致し、p=1.00がStage 3の実在する山腹道へ接続する。
3. 主人公の大きさ、カメラ高、レンズ感が六コマで安定し、前進量を近景視差で感じる。
4. 各隣接コマで最低2軸の景観差があり、同じ森の反復にも背景交換にも見えない。
5. 道が明るい道路や広場でなく、苔・落葉・根・草が戻る細い踏み跡に見える。
6. 上12%・下24%へ重要情報がなく、1024×768のHUD/typing overlayを重ねても読み取れる。
7. 樹洞、羽根cue、倒木gap、山稜、星見門の優先順位が明確で、粒子や発光へ頼っていない。
8. 地学・植生、色、光、主人公の衣装と体格がコマ間で一貫する。

一項でも満たさなければ3D品質制作へ進まない。技術greyboxは画像絵コンテを満たすための空間検証へ差し戻し、絵コンテに合うまで場当たり的な装飾追加を行わない。

## 8. Stage 3〜36 gate

- Stage 3〜12: 各Stageについて本書と同粒度の六コマ画像絵コンテ、前後境界比較、safe-zone判定を作り、承認されるまで当該Stageの品質版3Dへ着手しない。次Stageの境界proxyだけは技術検証用に許可する。
- Stage 13〜36: 文章制作資料は完成扱いだが、画像絵コンテも3Dも未制作である。Stage 12承認後、Stage 13から一Stageずつ「画像絵コンテ→greybox→品質版」の順で段階制作する。
- 全Stage: 3Dのスクリーンショットを同じ六anchorで再取得し、承認画像と差分比較する。形状や実装都合で変更する場合、先に文章・画像絵コンテを改訂して承認を取り直す。
