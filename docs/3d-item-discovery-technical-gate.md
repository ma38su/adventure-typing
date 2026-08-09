# 3Dアイテム発見演出 技術ゲート

## 正本と目的

`docs/game-design.md` の「3D空間での発見と報酬表現」を正本とする。通常アイテムの個別3Dモデルは作らず、同一scene内の抽象的な環境予兆から、タイピング成功後の短い取得演出と2D報酬eventへ接続する。

検証場所は `artwork/renderer-prototypes/meadow-to-forest-threejs-v1.html`。ゲーム本体WIPは変更しない。

## 共通状態機械

`idle → hinted → near → typing → acquired → reward2d`

- `hinted`: 道脇へ控えめな環境予兆を置く。
- `near`: 接近または問題開始。進行とカメラを止めない。
- `typing`: ゲーム側の問題を待つ。3D側は入力判定を所有しない。
- `acquired`: 0.72秒で光・葉・粒を中心へ集める。
- `reward2d`: `corridor-item-reward` を発火。3D側は2D報酬UIを描画しない。
- 見逃し時は `missed → hinted` とし、安全な後続地点へ1回だけ移す。再挑戦してもworldProgressを戻さない。

## 比較案

| 案 | 色 | 動き | 音 | 適性 |
|---|---|---|---|---|
| G 地面の光＋少数の粒 | 暖かな金色 | 静かな呼吸、成功時に中心へ収束 | なし | 種、小さな宝物 |
| M 苔模様＋葉 | 若草色 | 七角形の淡い苔模様、少数の葉が寄る | なし | 森由来の素材、植物 |
| R 波紋状の共鳴 | 青緑 | 地面を広がる低い同心波紋 | なし | 水辺、古代の手がかり |

### 推奨

Stage 1の最初の一種類は **G 地面の柔らかな光＋少数の粒** を採用する。最も小さく、道の読解とタイピングを妨げず、「何かある」ことは伝わるが中身を3Dで断定しない。近くの草の小さな反応を補助として加え、種類差が必要になった時だけM/Rへ展開する。

動物予兆との差は次の3要素で確保する。

- 色: アイテムは金/若草/青緑、動物は自然な草色・茶色の影。
- 音: 通常アイテムは無音。動物Aは鳴き声を使用できる。
- 動き: アイテムは地面中心へ放射/収束、動物は局所的な横揺れ・横切る影・一時的な姿。

## 受入基準

1. 個別アイテム3Dモデルを常設しない。
2. 予兆、接近、タイピング成功、取得、2D reward eventが状態として観測できる。
3. 見逃し後に後続地点へ1回再配置でき、worldProgressを保持する。
4. reducedMotionではpulse、波紋、粒の移動量を18%へ抑える。通常アイテムは無音なので音OFFでも情報が欠けない。
5. Stage 1→2境界付近でも同一scene/canvasで動き、chunk lifecycleを変更しない。
6. reset/cleanupでtimerをclearし、transient groupを非表示にする。
7. 反復実行でconsole warning/errorがなく、chunk resource数が増えない。

## QA記録

2026-08-10、Chrome 1024×768相当で実施。

- world 0.930（Stage 2 chunk `preloaded`）でG/M/Rを各 `hinted → near → typing` まで実行。全案でworld 0.930、canvas identity `corridor-brkvjq`、chunk resource `254g/39m/2t` を保持した。
- Gは橋の手前から、道脇の暖かな光と少数の粒が見えることを画像確認。画面中央や進行方向を塞がず、中身の形は見せない。
- 別のQAセッションでGのタイピング成功後、`acquired → reward2d` へ遷移。そのセッション内でworld 0.930、canvas identity `corridor-6mqfzr`、resource `254g/39m/2t` は不変。上記の`corridor-brkvjq`との差はページ再読込みを挟んだ別QAセッションの初期ID差であり、発見演出によるcanvas再生成ではない。
- RをreducedMotion ONで見逃すと、安全な後続地点で `R:hinted · retry 1/1` へ遷移。world 0.930を保持。
- 「先頭へ」で `idle · retry 0/1` へcleanup。chunk resourceはpreload cacheを再利用するため254のままで増加なし。
- 3案、成功、見逃し、retry、cleanupの反復中、console warning/errorは0件。通常アイテム演出は無音のため音OFFでも情報欠落なし。

判定: **GをStage 1の一種類目として採用可能**。ゲーム接続時は、予兆位置、問題event ID、成功eventをゲーム側から渡し、3D側は `corridor-item-reward` のdetailだけを返す。
