# シームレスBGM transport 技術検証

最終更新: 2026-08-10
対象: `artwork/renderer-prototypes/meadow-to-forest-threejs-v1.html`
状態: Web Audio合成仮音による接続検証。正式曲・正式音色ではない

## 1. 目的と正本

連続3D世界でStageや文が切り替わっても、BGMの拍・和声・再生位置を作り直さず、場所と物語上の意味だけをステム量へ反映できるか確認する。

設計判断は次を正本とする。

1. `docs/bgm-production-plan.md`
2. `docs/3d-stage-1-36-continuous-world-plan.md` の全36 Stage対応表
3. `docs/3d-stage-2-12-production-briefs.md` と `docs/3d-stage-13-36-production-briefs.md` のBGM意味区間

第三者の特定曲、旋律、コード進行、特徴的な編曲は参照・模倣しない。今回の発振音は接続挙動を聞き分けるproxyであり、音楽性の承認材料にはしない。

## 2. 実装した責務

- `AudioContext`、master、BGM bus、SE bus、duck gainを一つのtransportが所有する。
- 80 BPM、4/4の疎な基礎パルスはworld位置、Stage番号、タイピング速度に関係なく進み続ける。
- `worldProgress` は再生位置やテンポへ使わず、`base / meadow / forest / creek / mountain` proxyステムのgainへだけ写像する。
- gainは瞬時に切り替えず、`setTargetAtTime`で平滑化する。スクラブ時も同じtransportを維持する。
- 文区切り、アイテム発見、動物発見は短いジングルをSE busへ重ねる。BGMは停止せず、約0.7秒だけ自然にduckして戻す。
- BGMとSEは別々にOFFにできる。BGM OFFでもtransportの拍は保持し、ONへ戻すと現在の拍から聞こえる。
- visibility復帰時は既存contextを`resume()`する。新規contextを作らない。
- `pagehide`でscheduler、持続oscillator、AudioContextをcleanupする。

## 3. Stage 1→2 proxyの意味写像

このHTMLの`worldProgress`はStage 1が`0〜1`、Stage 2 proxyが`1〜2`である。値は曲の再生ヘッドではなく、次の意味量へ変換する。

| worldProgress目安 | cue | 主なステム変化 |
|---|---|---|
| 0.00〜0.20 | `meadow-departure` | baseを保ち、明るいmeadow proxy |
| 0.20〜0.55 | `forest-edge` | meadowを引きながらforestを増加 |
| 0.55〜0.82 | `forest-listen` | forest中心。旋律密度を増やさない |
| 0.82〜1.08 | `creek-bridge` | creek倍音を加え、Stage境界をまたぐ |
| 1.08〜1.42 | `signal-found` | creekからmountainへ連続移行 |
| 1.42〜2.00 | `mountain-air` | 低密度のmountain proxy。拍・和声は同じ |

境界値は今回のHTML用proxyである。本番ではレンダラーと共有するregion/semantic cueを入力とし、BGMだけが独自の旅座標を持たない。

## 4. 診断HUD

音を開始すると次を表示する。

- transport ID
- 通算beat
- 現在cue
- base / forest / creek / mountain gain
- AudioContext再生成回数

Stage 1→2境界、文区切り、スクラブ、発見ジングルの前後でtransport IDとbeatが連続し、再生成回数が`1`のままであることを確認する。

## 5. 手動QA

1. ローカルHTTPサーバーでHTMLを開き「音を開始」を押す。
2. 0.00から自動再生し、0.95〜1.20を通過する。transport ID不変、beat増加、recreate `1`を確認する。
3. progressを0.1→0.9→1.1→0.4へスクラブする。音色量だけが滑らかに変わり、拍が頭出しされないことを確認する。
4. 「文区切り」を複数回押す。world位置とbeatが戻らず、短いSEだけが重なることを確認する。
5. item/animal stinger、および実際の発見成功操作を試す。BGMが短くduckし、自然に元へ戻ることを確認する。
6. BGM OFF中もSEが鳴ること、SE OFF中もBGMが続くこと、両方OFFでも画面進行できることを確認する。
7. タブを非表示→復帰する。既存transport IDと再生成回数を保ってresumeすることを確認する。
8. ページを離れ、DevToolsに未処理例外がなく、scheduler/contextがcleanupされることを確認する。

### 2026-08-10 実機QA記録

- Chromeの1024×768相当で、transport `transport-vtrxul`を開始。AudioContext再生成回数は初回生成を示す`1`。
- world 0.99から1.10まで自動通過し、beatは2から22へ連続。transport IDと再生成回数`1`は不変。
- world 0.4へ逆スクラブ後も同じtransport IDとbeatを維持し、cueとgainのみが平滑に変化。
- BGM OFF / SE ONで短い効果音のみ鳴り、BGMへの復帰後も拍を頭出ししないことを確認。
- 境界通過、逆スクラブ、文・アイテム・動物ジングルの反復中、console errorは0件。

## 6. 合格条件と非対象

合格条件:

- Stage境界・文区切り・スクラブでAudioContext/transportを再生成しない。
- タイピングペースsliderが足取りだけを変え、BPM、beat、音楽再生位置へ影響しない。
- 場所ステムのgain変化にクリックノイズや急な無音がない。
- ジングルでBGMが停止・頭出しされず、duck解除後に元の意味ステム量へ戻る。
- BGM/SE独立OFF、visibility resume、pagehide cleanupが機能する。

非対象:

- 正式な作曲、楽器選定、ミックス、マスタリング
- 48〜64秒正式ループと音声ファイルのコーデック検証
- Stage 3以降の音源・ステム制作
- ゲーム本体`src`への統合

正式音源へ進む場合も、今回のtransport契約を保ち、発振器proxyを同期済みAudioBuffer/AudioWorklet等へ置き換える。第1曲の方向承認前に全36 Stageの音源制作へ展開しない。
