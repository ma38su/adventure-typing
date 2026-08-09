# Stage 1→2 連続コリドー技術ゲート

## 判定対象

`artwork/renderer-prototypes/meadow-to-forest-threejs-v1.html` の単一canvas・単一sceneで、Stage 1終端の小川の橋からStage 2仮proxyへリロードせず通過できることを検証する。ゲーム本体の `src/App*` と `src/journey3d/` は本ゲートでは変更しない。

本ゲート合格後の3Dシーン制作・ゲーム反映範囲は **Stage 1〜12** とする。Stage 13〜36は設計資料と接続契約だけを整備し、3D実装・ゲーム統合は行わない。Stage 12→13は将来境界として資料上でのみ定義する。

## 実装契約

- `worldProgress` は0〜2で単調増加し、Stage 1は0〜1、Stage 2 proxyは1〜2。stage/course/sentence境界はカメラ位置をリセットしない。
- Stage 2 chunkは0.82でpreload、0.96でactivate。Stage 1 chunkは境界を背後へ十分通過した1.55でunloadする。
- 両chunkは橋の一点と進行方向を共有し、カメラ、地形高、霧、光、植生密度をworldProgressで連続補間する。
- canvasとrendererは生成し直さない。HUDでcanvas identity、chunk lifecycle、geometry/material/texture数、境界の位置差・角度差、reload/reset回数を観測する。
- BGMは `worldProgress`, stage, boundary proximityを購読するだけとし、rendererから再生しない。itemは同一scene内の予兆座標と2D報酬イベントIDだけを返し、常設3Dモデルを必須にしない。

## 受入基準

1. スクラブと自動歩行の両方で0.95→1.05を通過でき、canvas identityが不変、reload/resetが0。
2. 境界前にStage 2がpreloaded、境界でactive、1.55以降にStage 1がunloadedとなる。
3. 境界位置差が0.05m未満、接線角差が3度未満。カメラ高、霧、光に単フレームの跳びがない。
4. sentence相当の「文区切り」を境界前後で押してもworldProgressを保持する。
5. console warning/errorが0。往復スクラブ時にresource数が増加しない。
6. 1024×768でviewport、HUD、操作UIが確認でき、境界前・境界・境界後のQA画像を残す。

## 動物発見演出の次段接続契約

コリドーゲート合格後、同じHTML・同じsceneで次の4案を状態機械として比較する。通常アイテムの「無音の光予兆」と識別できることを必須とする。

| 状態/案 | 表現 | 役割 |
|---|---|---|
| A: cue-audio | 短い鳴き声＋周辺環境の小さな反応 | 方向を断定せず気配を知らせる |
| B: cue-foliage | 草木の局所的な揺れ＋横切る影 | 音OFF時にも気配を伝える |
| C: glimpse-silhouette | 0.6〜1.2秒の簡略3Dシルエット | 発見直前だけ奥行き内に姿を示す |
| D: reveal-reward | 成功後の短い姿見せ→2D図鑑報酬event | 3D常設せず収集結果へ接続する |

状態は `idle → hinted → glimpsed → discovered → reward2d` とし、見逃した場合は `missed → cooldown → idle` へ戻して別地点で再出現できる。タイピング正確性や進行を阻害せず、視線を強制しない。タイピング中は大きな移動・発光・画面中央への飛び出しを禁止する。

### 動物演出の受入基準

- 常設動物モデルを置かず、同一scene内の短時間演出だけで完結する。
- 音OFFではBまたは控えめな視覚合図を必ず代替表示する。
- reducedMotionでは草木揺れ、影、シルエット移動量を抑え、静止姿＋opacity中心にする。
- 見逃し可能で、同じrun内の安全な後続地点に最大1回再出現できる。
- 通常アイテム予兆とは色、音、動きのうち2要素以上が異なる。
- 成功後だけ2D図鑑報酬契約を発火し、3D側は報酬UIを所有しない。
- 状態遷移の反復でconsole errorがなく、生成resourceとlistenerをcleanupできる。

### 動物演出prototype検証（2026-08-10）

- A〜Dを同一scene内の `idle → hinted → glimpsed/discovered → reward2d` 状態機械として実装。移動用 `worldProgress` とは独立し、各案の開始・見逃し・成功後も0.600を保持した。
- Aは短い合成鳴き声。音OFF時は局所的な葉の揺れを自動併用する。Bは葉の揺れと地面の影、Cは短い簡略3Dシルエット、Dは短い姿見せ後に `corridor-animal-reward` を2D層向けに発火する。
- Dは `hinted → glimpsed → discovered → reward2d` を通過。報酬UI自体は3D側に作っていない。
- Cを見逃すと `missed → cooldown相当 → hinted` へ進み、後続地点で `再出現 1/1` となる。2回目以降は再出現しない。
- reducedMotionでは葉、影、シルエット移動を16%へ抑え、音OFF代替と併用可能。
- 「先頭へ」でtimerをclearし、transient groupを非表示、stateと再出現数を初期化するcleanup契約を追加。
- 4案の反復、見逃し、再出現、成功後を画像確認し、console warning/errorは0件。進行阻害・視線強制・常設表示はない。

## 検証ログ

2026-08-10にChrome 1024×768相当で実施した。

- 起動時はcanvas 1枚、Stage 1 `active`、Stage 2 `cold`、resource `250g/39m/2t`。
- world 0.83でStage 2 `preloaded`となり、resourceは `254g/39m/2t`。以後の往復スクラブで増加しない。
- world 0.97〜1.00でStage 1 `boundary` / Stage 2 `active`。境界 `Δpos=0.0207m`, `Δangle=0.063°`。
- world 1.56でStage 1 `unloaded` / Stage 2 `active`。0.80へ戻すとStage 1を再attachし、Stage 2 resourceは再生成せずcacheを再利用する。
- 自動歩行で0.98→1.109を通過し、canvas identityは `corridor-lhifyv` のまま不変、reload/resetとも0。
- 文区切りをworld 1.010で実行し、実行前後とも1.010を保持。
- 境界直前・自動通過直後・Stage 2 proxy内部を画像確認。接近時に巨大化していた遠景mountain cardは0.70〜0.94で連続fadeするよう修正し、再画像確認済み。
- console warning/errorは0件。WebGL開始エラーもなし。

以上により、連続コリドーの技術条件はprototype上で合格。次段は本書の動物発見演出比較であり、ゲーム本体統合のcommit判断とは分離する。
