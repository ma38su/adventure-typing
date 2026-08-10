# Stage 2 storyboard design review v2

最終更新: 2026-08-10  
状態: v1目視評価済み・v2生成仕様確定・生成前  
対象: `evt-forest-creek-bridge` → `bnd-forest-mountain-a`

## 1. 制作判断

既存`stage-2-continuous-corridor-storyboard-v1.png`は制作履歴として保持し、正本へ昇格させない。主分類`G`（境界不一致）、副分類`P`（道）、`D`（密度）、`S`（表現）、`C`（進路cue）で差戻す。v1へ部分修正や上書きをせず、本書からv2を新規生成する。

### v1判定

| 要件 | 判定 | 観察 |
|---|---|---|
| 3×2・六コマ・順序 | 合格 | 橋→支流→樹洞→倒木→肩→門の順は読める |
| Stage 1終端との一致 | 不合格 G | 橋の欄干、幅、周辺岩、川幅、視点がStage 1正本第6コマと同一物に見えない。Stage 1側から残す要素も比較不能 |
| Stage 3への連続 | 条件付き | 門の先に道はあるが、門が画面中央の独立モニュメントに寄り、共有鞍部の混在帯が弱い |
| 記号なしの進路 | 不合格 C | 樹洞コマに白い羽根が高コントラストで置かれ、意味cueに見える |
| 道の地形への混ざり | 不合格 P | 六コマを通して明るい敷石状の帯が強く、獣道1.5〜1.8mより整備路に見える |
| 密度と余白 | 不合格 D | 森4コマの細部密度が全面で均一。空・遠景・進路のquiet areaが不足 |
| Stage 1の表現文法 | 不合格 S | 多角形面はあるが、v1は暗く細密で、Stage 1正本の大色面、軽い透明水彩、低〜中密度造形より重い |
| 地学・植生の段階変化 | 合格寄り | 支流、段丘、倒木gap、岩が増える肩、鞍部の順は概ね成立 |

## 2. 確定design review sheet

- 物語上の一文体験: Stage 1の小川橋を同じ場所のまま渡り、湿った支流沿いの森から段丘崖、倒木gap、雲霧林の肩を上って、星見門越しの山腹道へ進む。
- 開始共有物 / 所有Stage: `evt-forest-creek-bridge`。Stage 1/2共有chunk。木橋、同じ8枚の床板、低い簡素な欄干、小川、苔岩、シダ、両岸林を一体で保持する。
- 終了共有物 / 所有Stage: `bnd-forest-mountain-a`。Stage 2/3共有chunk。低い層状岩の星見門、風衝草、灰青岩、門の先で左へ曲がる山腹道を保持する。
- 地質・微地形の開始→終了: 小川氾濫原→支流合流→段丘崖→倒木gap→雲霧林の肩→カルデラ鞍部。
- 植生帯の開始→終了: 湿った低地常緑・半常緑の五層林→高木を距離差で減らす→低木・風衝草。背後と片側に森の連続面を残す。
- 色・時刻・気象の開始→終了: Stage 1終端と同じ青緑の木漏れ日→灰青の山気＋少量の夕金。露出段差なし、霧は徐々に薄くする。
- 絶対に見せない土地・物: 海、伐採地、広場、白い羽根、矢印、音波、進路用発光、portal、巨大門、巨大建造物、黒い輪郭、写真PBR。
- 主役landmark 6点: 共有橋 / 支流合流 / 非対称な樹洞大木 / 倒木gap / 層状岩と狭い山稜の抜け / 低い星見門。
- 六コマを通して残す連続要素 2点以上: 蛇行する土の踏み跡、灰青の遠気、背後または片側に残る森、同じ下層植生の一部。
- 画面を開くanchor / 最も密にするanchor: p=.80〜1.00 / p=.20〜.40。
- 道幅・道面の状態: 1.5〜1.8m。土、苔、落葉、根、草切れが中央にも入り、明るい舗装帯や敷石列にしない。一度以上蛇行し遠方で細くなる。
- 近景反復assetと変化規則: 苔岩、シダ、根を最大3点の大形状として反復。湿度と高度に従い、苔量を減らし岩露出と乾いた草を増やす。同型・同scaleの等間隔配置は禁止。
- 中景の主役優先順位: 各panelで上記landmark一つだけ。橋と樹洞、樹洞と倒木など二主役にしない。
- 遠景の次土地予告: p=.80で木々の狭間に灰青山稜、p=1.00で門越しの実在する山腹道。海は出さない。
- 前Stage終端との一致確認方法: Stage 1正本第6コマとv2第1コマを横並びにし、橋の床板、欄干、川流向、主要苔岩、対岸の幹、光色を対応づける。
- 次Stage入口との一致確認方法: v2第6コマとStage 3第1コマ仕様を横並びにし、門石の輪郭、道の接線、層状岩、植生混在、稜線位置を対応づける。
- HUD safe zone: 上12%。最重要landmarkと最明部を置かない。
- typing safe zone: 下24%。道の手前は隠れてよいが、次の曲がりと足元危険を置かない。
- 三人称overlay: 今回は含めない。景観承認後の別gate。
- first passで判断する3項目: Stage 1橋が同一物に見える / 羽根なしで山側の進路が読める / 森が一斉に消えず星見門の先へ物理的に続く。

## 3. v2六panel設計

| panel / p | 近景 / 中景 / 遠景 | 道・継続・変化・光 |
|---|---|---|
| 1 / .00 | Stage 1第6コマと同じ苔岩・シダ / 同じ橋と小川 / 対岸の五層林 | 橋へ軽く下り、渡った先で右へ曲がる。橋・両岸・青緑光を継続。水と橋を主役化。光はStage 1終端と一致 |
| 2 / .20 | 湿った根、シダ、苔岩 / 右後方へ合流する細い支流 / 背後に橋と連続林を小さく残す | 道は支流と離れて上り始める。橋・小川植生を継続。水位置と近景密度を変更。道の開口が最明部 |
| 3 / .40 | 太根と段丘の苔縁 / 左寄りの非対称な樹洞大木、その右を上る道 / 奥に高木面 | 羽根・印なし。支流湿気と森面を継続。勾配とlandmarkを変更。樹洞内部でなく道の先を明るくする |
| 4 / .60 | 倒木の根元と低い草 / 斜めに架かる倒木gap、下を抜ける踏み跡 / 背後の高木と増える空 | 樹洞側の森と上りを継続。視界と樹冠量を変更。倒木は道を完全に塞がず、開口の空を柔らかく明るくする |
| 5 / .80 | 灰青の層状岩、乾いた草 / 岩間を曲がる細道 / 木々の狭い抜けに山稜 | 背後の森と同じ踏み跡を継続。岩露出と植生帯を変更。海なし。遠い道が最明部 |
| 6 / 1.00 | 風衝草と低い岩 / 中央から10〜20%外した低い星見門 / 門越しに左へ曲がるStage 3山腹道と灰青稜線 | 層状岩と夕金を継続。門と樹冠量を変更。門自体は発光せず、先の道を最明部にする |

## 4. v2生成用確定prompt

```text
Use case: stylized-concept
Asset type: production environment storyboard for a continuous WebGL game corridor
Input images: Image 1 is the authoritative Stage 1 visual-language and start-boundary reference, meadow-to-forest-storyboard-webgl-implementation-v2.png. Image 2 is the rejected Stage 2 v1 used only to understand the six-beat order; do not copy its bridge, white feather, bright paved trail, dense texture, or centered gate.

Create one production-quality environment storyboard sheet for Stage 2, six equal 16:9 panels in a clean 3-column by 2-row grid, chronological left-to-right then top-to-bottom. It is one unbroken walk from the exact Stage 1 creek bridge through a wet forest and gradually uphill to a low stone stargazing gate with a real mountain path continuing beyond it. No character, text, captions, interface, arrows, scene reset, or background replacement.

Match Image 1's observable visual language: 4–7 large readable color masses per panel, simplified low-to-medium polygonal forms rebuildable in WebGL, restrained transparent-watercolor softness, one subtle paper texture layer, colored soft edges without black outlines, asymmetrical grouping, one middle-ground focal landmark, clear foreground/middle/background, and quiet low-frequency space in at least two of sky, distance, or route. Use less overall detail and a lighter value structure than rejected Image 2.

Geology sequence: creek floodplain; tributary confluence; terrace scarp; fallen-log gap; cloud-forest shoulder; caldera saddle. Vegetation changes gradually from humid five-layer evergreen/semi-evergreen forest to lower wind-shaped shrubs and dry grass. Never remove all tall trees at once; retain forest behind or on one side. Palette transitions continuously from the exact blue-green Stage 1 bridge light to grey-blue mountain air with restrained evening gold.

Panel 1: preserve the exact Stage 1 final-panel bridge identity—same simple timber floor and low rails, creek direction, moss rocks, ferns, bank forms and blue-green light. View from the Stage 1 side approaching the bridge; dense forest visibly continues across it; the footpath bends right after crossing.
Panel 2: wet roots, ferns and moss rocks foreground; a narrow tributary joins behind/right; the shared bridge remains small in the background; the soil path starts gently uphill and separates from the water.
Panel 3: an asymmetrical hollow old tree left of the path on a terrace scarp; the path climbs clearly to its right; retain deep forest behind. No feather, bird sign, symbol, glow, arrow, or sound-wave cue. The route must read from tree mass, slope, canopy opening and light alone.
Panel 4: a diagonal fallen trunk creates a natural gap without blocking the route; tall forest remains behind while more sky appears ahead; the same uphill path passes naturally beneath/beside it.
Panel 5: layered grey-blue rock, dry grass and lower shrubs increase; tall trees thin at different distances; only a narrow glimpse of grey-blue mountain ridge appears between trees; never show the sea.
Panel 6: a low asymmetrical local layered-stone stargazing gate, about human-scale rather than monumental, placed 10–20% off center; weathered grass and rock around it; through the unlit opening a real Stage 3 mountainside path curves left and continues toward a subdued ridge.

Across every adjacent pair, retain at least two continuity elements and change at least two of openness, slope, water, rock, vegetation band, landmark, and light. The route is a 1.5–1.8 m irregular earthen footpath, curves at least once in every panel, narrows with perspective, and contains moss, leaf litter, roots and grass breaks through its center. It must never look like bright paving stones, a broad road, or an empty plaza.

Avoid: white feather, wayfinding icon, arrow, glowing trail, portal, sea, clear-cut forest, giant architecture, centered symmetry, evenly spaced repeated trees, uniform fine detail, photographic PBR, black outlines, neon, dark cave entrance, text, watermark.
```

出力名は`stage-2-continuous-corridor-storyboard-v2.png`とし、v1を上書きしない。生成後は本書第1節と`stage2-boundary-comparison-spec.md`で判定する。
