# Stage 2 continuous corridor QA

取得日: 2026-08-10  
対象: `../meadow-to-forest-threejs-v1.html`  
状態: prototype承認用。ゲーム統合前。

## 画像

| ファイル | worldProgress | 判定対象 |
|---|---:|---|
| `stage1-to-stage2-boundary.png` | 0.99 | Stage 1側から共有橋へ接近 |
| `stage2-boundary.png` | 1.00 | 小川氾濫原、橋、対岸林 |
| `stage2-anchor-2.png` | 1.20 | 支流合流 |
| `stage2-anchor-3.png` | 1.40 | 段丘崖、樹洞、羽根cue |
| `stage2-anchor-4.png` | 1.60 | 倒木gap |
| `stage2-anchor-5.png` | 1.80 | 雲霧林の肩、層状岩、低木 |
| `stage2-anchor-6.png` | 2.00 | 星見門とStage 3方向proxy |

## 機械QA

- 同一canvas IDを各progress変更中に保持。
- 境界 `worldProgress=.9999→1.0001`: `Δpos 0.0210`、`Δangle 0.004°`。
- Stage 2 active時: `551 geometry / 47 material / 2 texture`。6地点で増殖なし。
- chunk: Stage 2は0.82以降preload、0.96以降active。Stage 1は0.94以降boundary、1.55超でunloaded。
- browser実測 `innerWidth=1317 / scrollWidth=1299`、横overflowなし。
- 最終再読込後console warning/error 0。

## 目視で残す判断

- 本画像は簡略モデルによる空間・密度・カメラgateであり、正式な水彩仕上げではない。
- Stage 2終端ではcameraを門手前に保持し、門越しに連続する道を見せる。Stage 3側は道と稜線だけのproxy。
- 正式統合前に、1024×768のゲーム用typing overlayを重ねた再撮影が必要。現prototypeは技術操作UIを含むため、ゲーム画面の縦寸法を代替しない。

