# ことば島 Stage 2〜12 制作監査・承認つき展開計画

最終更新: 2026-08-10  
状態: 現状監査済み。Stage 2景観承認待ち  
対象: 全島正本、36 Stage route、Stage 1〜12 briefs/storyboards、Stage 1〜2 Three.js、canonical LOD

## 結論

島の地理・36 Stage route・LOD契約は実装と機械QAまで揃っている。一方、アートとして承認済みなのはStage 1の景観表現正本だけで、Stage 2は技術greybox、Stage 3〜12は文章briefまでである。したがって、次はStage 2の画像承認を最優先し、以後は「次Stageの画像設計」と「承認済みStageの3D化」を一段ずらして進める。キャラクター制作は別gateとし、島の景観承認を止めない。

## 1. 現在できているもの

| 層 | 現状 | 判定 |
|---|---|---|
| 全島正本 | `islandTerrainSurface.ts`が海岸・標高・水系・微地形を所有し、`canonicalTerrainMesh.ts`が同じ地表をLOD別密度でサンプル | 正本あり |
| 36 route | 36 Stage、216 anchor、35共有境界、各Stage 121 spline sample、距離・問題数・course数を生成JSONとtestで検証 | 機械QA済み |
| Stage 1 | 六コマ表現正本、greybox、Three.jsゲーム統合候補、canonical terrain接地 | 技術gate通過。正式モデル完成扱いではない |
| Stage 2 | 文章brief、design review適用値、六anchor、Stage 1共有橋、Stage 3 proxy、7枚の技術QA画像 | 技術greybox完了。景観・構図・ゲーム統合は未承認 |
| Stage 3〜12 | 地形・植生・境界・必要asset・BGM意味区間・六コマ合否brief | 画像制作前 |
| Stage 13〜36 | routeと将来brief | Stage 12承認まで制作禁止 |

確認済み機械結果: 島・route・LOD関連5 test file / 20 testsは合格。キャラクターloaderの
型契約も統合後に修正され、全体125 tests、lint、production buildも合格している。

## 2. 不一致・不足

1. `StageOneJourneyScene.tsx`は名称と文書上の「Stage 1だけ」に対し、実体はStage 2 greyboxとStage 3 proxyまで含む。これは連続性検証には有効だが、Stage 2が品質承認済みと誤読される。
2. `JourneyWorld`の公開契約は全Stageの数値をStage 1 rendererへ渡すが、rendererのroute clampはStage 2＋proxyまでである。Stage 3以降の正式chunk streaming owner/registryは未実装。
3. canonical terrainは共有されるが、道・植生・橋・門は単一scene内の直接配置で、正本座標を保存するchunk asset manifest、preload/detach/cacheの実ownerはまだない。
4. Stage 2には技術QA画像があるが、景観正本となる3×2六コマfirst pass、前Stage終端比較、次Stage入口比較、1024×768 HUD overlay比較が未承認。
5. Stage 3〜12は文章briefのみで、各Stageの保存済みdesign review sheet、六コマ画像、境界pair画像、greybox、resource表がない。
6. globe / regional / nearは同じ地表を参照する契約とtestがある一方、実ゲームでの距離別切替、chunk再利用、長時間移動時のresource増殖QAは未実装。
7. 島単体testだけでなく全体test / lint / buildを各配信単位で実行する。別作業の失敗が出た場合は
   所有範囲を切り分け、島側が通ったという理由だけで配信可能扱いにしない。

## 3. 制作順

### Gate A — Stage 2景観を承認する

1. 既存design reviewを独立ファイル化し、Stage 1終端・Stage 2六anchor・Stage 3入口proxyの連続要素を固定する。
2. キャラクターなしの3×2六コマ景観絵コンテを一枚作る。
3. Stage 1終端 / Stage 2開始、Stage 2終端 / Stage 3開始を横並び比較する。
4. 構図承認後だけ、既存greyboxを同じanchorへ合わせて修正する。
5. 最後にHUD safe zone、typing safe zone、仮シルエットのoverlayを確認し、Stage 2の`JourneyWorld`統合を承認する。

### Gate B — Stage 3を試作する

Stage 2承認後、Stage 3だけを同じ順で制作する。星見門を複製せず共有chunk化し、山腹→尾根→谷川→河口湿地の六anchorをgreybox化する。Stage 4側は河口湿地のproxyだけに留める。Stage 3でchunk registry、asset manifest、preload/activate/detach/cache、resource counterを実装し、以後の型を確定する。

### Gate C — Stage 4〜12を一境界ずつ展開する

制作列は `4→5→6→7→8→9→10→11→12`。各Stageで、前Stage品質版を維持しながら、次の順を反復する。

`design review確定 → 六コマ景観承認 → 前後境界pair承認 → 技術greybox → canonical接地・chunk QA → 品質asset/material → HUD/キャラoverlay → ゲーム統合`

待ち時間を使う並行作業は一段だけ先行してよい。例: Stage 3のgreybox制作中にStage 4のdesign reviewと六コマfirst passを作る。ただしStage 4の3D着手はStage 3境界承認後とする。Stage 12が通るまでStage 13以降の3Dは作らない。

## 4. ユーザーへ見せる画像と合否

| 段階 | 見せるもの | 合格条件 |
|---|---|---|
| design review | 3×2六コマfirst pass | 6枚・順序・16:9、各画面に一本の進路と主landmark、隣接ごと2軸変化＋2要素継続、地学・植生矛盾なし |
| 境界 | 前Stage終端 / 当Stage開始、当Stage終端 / 次Stage開始の2組 | 同じ地形・構造物・光・route接線。portal、背景交換、隙間、重複なし |
| greybox | 六anchor＋開始境界＋終了境界の8枚（Stage 2は既存7枚に終端比較を追加） | 正本anchor順、進路が記号なしで読める、camera cutなし、地面・道・小物がcanonical接地 |
| 品質版 | 同じ8地点のbefore/after | Stage 1正本の大色面・水彩・低中poly文法、写真PBR/黒輪郭/等間隔反復なし、近中遠景とquiet areaが読める |
| ゲーム版 | 1024×768と390×844のHUD付き画像、境界前後の短い連続動画 | landmarkと進路がUIに隠れず、typing中も低ノイズ、canvas/camera/BGMを維持し、境界が通常歩行で連続 |
| 技術表 | boundary delta、console、geometry/material/texture、chunk state | 位置差0.05m相当以下、接線差1°以下、console error 0、反復移動でresource増殖なし |

各提出は「承認 / 差戻し分類 G・C・D・S・P・E・L・B / 修正点」の三択形式で確認する。同じ分類で2回落ちたら画像promptを足さずdesign reviewへ戻す。

## 5. commit / push単位

他作業を混ぜず、島関連pathだけを明示的にstageする。各単位で該当testを実行し、push後に次gateへ進む。

1. `docs(stage2): add approved landscape review and boundary comparisons`
2. `art(stage2): add approved six-panel storyboard and QA captures`
3. `feat(journey): integrate approved stage 2 chunk contract`
4. `docs(stage3): add design review and storyboard gate`
5. `feat(journey): add stage 3 canonical greybox and chunk lifecycle`
6. Stage 4〜12はStageごとに `docs/art` と `feat` を分けた2 commit
7. `test(journey): verify stage 1-12 continuity, LOD and resource lifecycle`

画像承認前の試作はcommitしても`prototype`と明記し、品質版やゲーム統合commitへ混ぜない。pushは各承認gateの直後に行い、差戻し中の画像を正本名で上書きしない。

## 参照正本

- `canonical-island-terrain-and-lod-contract.md`
- `world-route-spline-v2.md`
- `3d-stage-1-36-continuous-world-plan.md`
- `3d-stage-2-12-production-briefs.md`
- `stage-storyboard-production-gate.md`
- `stage2-3d-production-gate.md`
- `stage1-3d-game-integration.md`
