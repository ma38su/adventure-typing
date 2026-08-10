# Stage 2 3D制作gate — 小鳥が知っている道

最終更新: 2026-08-10  
状態: 技術greybox完了・画像絵コンテ承認待ち（品質制作・ゲーム統合禁止）
対象: `evt-forest-creek-bridge` → `bnd-forest-mountain-a`

## 1. 固定する体験

Stage 1の小川橋を同じscene・同じ共有chunkのまま渡り、湿った支流沿いの森から段丘崖、倒木gap、雲霧林の肩を経て、低い星見門の向こうに続く山腹道へ上る。背景交換、camera reload、空間skipは行わない。

正本は `docs/3d-stage-2-12-production-briefs.md`、画像制作標準は `docs/stage-storyboard-production-gate.md`、表現正本は`artwork/preproduction/meadow-to-forest-storyboard-webgl-implementation-v2.png`、球面6anchorは `artwork/preproduction/world-map/kotoba-island-route-v2.js`。表現正本から内容を複製せず視覚文法だけを用い、Stage 2固有値は画像制作標準のdesign reviewから差し込む。Stage 2距離5.74km、目安39問・5 courseは世界距離を縮める指示ではない。prototypeの短縮再生は経路・境界・資源状態の技術確認だけに使い、アートや構図の承認物としない。

## 2. 共有境界とchunk契約

- Stage 1終端とStage 2始端は同じ橋、両岸、小川、route位置・接線を所有する`evt-forest-creek-bridge`共有chunk。橋を複製しない。
- `worldProgress=1.000`でcanvas、scene、camera、renderer、BGM transportを再生成しない。
- Stage 2を`worldProgress>=0.82`でpreload、`>=0.96`でactivate。Stage 1固有chunkはStage 2後半（`>1.55`）まで保持してからsceneからdetachする。
- geometry/material/textureをdetach時にdisposeしない。将来の後退・再訪方針確定まではcache所有とする。
- Stage 3は星見門の先の山腹道、風衝低木、灰青の稜線だけをproxy表示し、専用イベント・完成地形を作らない。

## 3. 六つのscenic anchor

| Stage p / world | 球面anchor / 微地形 | 必須画面・前anchorとの差 |
|---:|---|---|
| 0.00 / 1.00 | `stage-2-anchor-1` 小川氾濫原、0.22km | Stage 1と同じ橋・小川・対岸林。橋の先も森が左右外周まで続く |
| 0.20 / 1.20 | `anchor-2` 支流合流、約0.32km | 水音を右後方へ送り、根・シダ・湿岩を近景化。橋は背後に残る |
| 0.40 / 1.40 | `anchor-3` 段丘崖、約0.42km | 非対称な樹洞大木へ一度視線を寄せ、その横から上る道を大形状と光で読む。羽根印へ意味を依存しない |
| 0.60 / 1.60 | `anchor-4` 倒木gap、約0.52km | 高木の連続面を背後に残しつつ、倒木の開口から空を増やす。一斉伐採に見せない |
| 0.80 / 1.80 | `anchor-5` 雲霧林の肩、約0.62km | 層状岩、乾いた草、低木、勾配が増え、木々の狭間に灰青山稜。海は見せない |
| 1.00 / 2.00 | `anchor-6` カルデラ鞍部、0.72km | 低い石の星見門と、門を抜けて曲がり続ける山腹道。portal発光や暗転なし |

微地形、高度、region、watershed、chunk IDはroute v2の値をruntime adapterで参照する。prototypeのローカル座標は6点の順序・高度単調増加・接線を再現するが、球面距離の別正本にはしない。

## 4. モデル・材質・植生

### 共有利用

- Stage 1の成木3型、若木、低木、シダ、苔岩、倒木、橋、小川。
- `forest-floor`、湿岩、水、木、苔。共有材質はcloneせず参照する。

### Stage 2品質候補

- 樹洞木: 成木幹へ非対称な暗い凹みと苔縁。入口幅は幹幅の35%以下。
- 進路誘導用の羽根便道標は作らない。樹洞大木、倒木、地形傾斜、植生帯、空の抜けをlandmark列として使う。
- 層状岩: 3 scale、灰青の大色面、苔量3段階。
- 山地低木: 2樹形、風下へ偏る輪郭。
- 星見門: 高さ2.8〜3.4m、地元の層状岩、低いlintel。画面を塞ぐ巨大門にしない。
- Stage 3 proxy: 山腹ribbon、風衝低木、稜線cardのみ。

材質遷移は湿った深緑→灰青岩→乾いた土→夕金の草穂。道中央にも苔・落葉・草切れを戻し、幅1.5〜1.8mを維持する。高木、若木、低木は距離帯をずらして減らし、同じpで一斉に消さない。

## 5. 光・霧・カメラ

- `p=0`はStage 1終端の青緑の森光と完全一致。
- `p=.35〜.8`で霧密度を連続的に下げ、空の灰青と夕金を増やす。露出の段差は禁止。
- camera高は地形＋1.52m。route、道中心、地形高度は同じsampleを参照する。
- p=.32〜.44で樹洞側へyawを最大6°だけ寄せ、0.7秒以上で戻す。
- 倒木gapでは上向きpitchを最大3°、星見門では先の道へ注視。camera cutなし。
- 通常bobは既存Stage 1以下。reduced motionではbob 25%、樹洞look 40%以下。

## 6. BGM / item / animal意味cue

- BGMは一つのtransportを継続し、`forest-listen`（1.00〜1.38）→`signal-found`（1.34〜1.68）→`mountain-air`（1.62〜2.00）をgainで重ねる。境界で曲頭へ戻さない。
- Stage 2 rendererは進路用item cueを持たない。樹洞大木、倒木gap、上り勾配、段階的に低くなる植生、増える空、山側の明部で進行を理解させる。報酬本体と説明は2D層所有。
- animal cueは小鳥ピピの鳴き声＋枝揺れ＋一時シルエットを任意演出としてよいが、音OFF・見逃し時も地形と光だけで進路が分かること。羽根印を理解必須cueにしない。
- cueは進行をblockせず、一度見逃した場合は前方anchorで一度だけ再提示。rendererは図鑑・報酬・audio transportを所有しない。

## 7. prototype合否

1. 六anchorと境界の計7画面を同じcanvasから取得できる。
2. `worldProgress=.9999→1.0001`の位置差が0.05m相当以下、接線差1°以下。橋・水面・両岸に重複や隙間がない。
3. 0.00/0.18/0.38/0.58/0.78/1.00で制作briefの必須画面を満たす。
4. Stage 2終端で星見門がportalでなく、奥へ続くStage 3 proxy道が見える。
5. `cold→preloaded→active`、Stage 1 `active→boundary→unloaded`が一方向進行で成立し、canvas IDとreload countが不変。
6. 7地点すべてconsole error 0。境界前後でgeometry/material/texture数が意図せず増殖しない。
7. 文区切り操作でworldProgress、chunk state、BGM transport IDを保持する。
8. 1024×768で横overflowなし。樹洞大木、倒木、空の抜け、山側の明部、門がHUD/typing overlayと競合せず、羽根印なしでも進路を説明できる。

## 8. 承認後の順序

design review sheetと六コマ景観絵コンテ、Stage 1終端との比較、Stage 3入口との比較を先にレビューする。景観承認後に女の子・HUD/typing safe zoneを別overlayとして検証する。これらの承認後、技術greyboxの7画面と境界数値・resource表を照合し、明示承認された後にだけJourneyWorld用Stage 2 adapterを実装する。ゲーム`src`統合、Stage 3本制作、正式小鳥モデル、個別3D報酬はこのgateに含めない。
