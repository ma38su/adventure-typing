# 女の子主人公 Gate 1.4 — final procedural head QA

更新: 2026-08-10  
制作正本: `artwork/blender/adventurer-girl-head-gate1-4/adventurer-girl-head-gate1-4.blend`  
再生成: `scripts/blender/build_adventurer_girl_head_gate1_4.py`  
比較正本: `artwork/preproduction/characters/third-person-adventurer-girl-face-expression-sheet-v1.png`

## 最終構造改訂

Gate 1〜1.3を保持し、頭部だけを別出力した。全身、衣装、UV、rig、motionへは進んでいない。

- 独立`GEO_FringeShell`を完全削除
- hair cap自身の前面下端へ非対称な波形hairlineを持たせた`GEO_Hair_ContinuousCap`を生成
- 額前へ張り出す別の庇・板をゼロにした
- cap表面から読める先細りside bangだけを残した
- `GEO_CheekPatch_*`を完全削除し、blushなしへ変更
- eye openingを横長にし、外目尻をわずかに下げ、白目面積を縮小
- upper lashと眉を低く短くし、curve point radiusで両端をtaper
- 暖灰背景、最小色toon寄り材質、同一3灯を維持

## face sheet neutralとの原寸比較

face sheetのneutral front / true side / front 3/4とGate 1.4を原寸でビューごとに並べた。

| 軸 | Gate 1.4の観察 | 正本との差 | 判定 |
|---|---|---|---|
| continuous hair cap | Gate 1.3の厚い庇は消え、front / sideで頭部曲率へ連続 | hairlineが細かな鋸歯状で、中央の山が硬い | **fail** |
| side bang | capから連続して見え、毛先だけが顔横へ落ちる | 正本の束の重なりと軽い外跳ねには未達 | conditional |
| cheek | 浮いたcoral patchは完全に消えた | 正本の薄い血色はmaterial/texture工程で必要 | pass（構造） |
| eye opening | Gate 1.3より横長で、外目尻が低い。球状突出なし | 白目外周が折り紙的な多角形で、上下瞼の有機的な厚みがない | **fail** |
| upper lash | 短く低く、中央から両端へtaperする | 3/4でcurveがまだ顔面から浮いて見える | conditional |
| 眉 | 低く短い柔らかな弧になった | 正本より表情面への馴染みが弱い | conditional |
| 鼻・口・顎 | 最小構成で険しさはない | 頬から口角・顎の面変化が平坦 | **fail** |
| neutralの可愛さ | Gate 1より大幅に落ち着き、色と大形は親しみやすい | 正本の有機的な目、頬、髪束には届かない | **fail** |

## Gate判定

**FAIL — Gate 2へ進まない。procedural-only head modelingはここで終了する。**

Gate 1〜1.4で、parametric meshだけでも比率、命名階層、flat anime eye、bob大形、同一条件renderを
再現できることは確認できた。一方、可愛さを決める眼窩・瞼・頬・口角・hairlineの連続曲面は、
少数の数式primitive / n-gon / curve追加では正本品質へ到達しない。さらにパーツを足す方法は採らない。

## 次に必要な制作方法

次のいずれかを選び、同じGate 1で再開する。まだ全身へ進めない。

1. **Blender手動sculpt＋retopology（推奨）**  
   現在の頭部比率を参考に、MultiresまたはVoxel Remesh上で眼窩、頬、口角、顎を手で造形し、
   Quad topologyへretopoする。髪も頭部曲率に沿うsurfaceを手で整える。最も正本へ合わせやすい。
2. **VRoid Studioのface / hair base**  
   顔と髪の編集済みbaseをVRMで渡し、Blenderで輪郭、topology、命名、不要材質を整理する。
   速いが、VRoid由来の顔つきが強くならないよう正本比較が必要。
3. **権利が明確な外部anime base mesh**  
   商用・改変・再配布条件を確認したbase headを導入し、正本へsculptする。導入時にlicense記録と
   topology監査が必須。

いずれもfront / side / 3/4の無彩色比較を先に通し、重大failがなくなるまでGate 2へ進まない。

## 実行確認

- Blender: 5.2.0 LTS
- headless build: `GATE1_OK`
- `.blend`、front / 3/4 / side PNG: PASS
- mesh数: 32
- `GEO_FringeShell`、`GEO_CheekPatch_*`: 不存在
- console: Python exception 0、render失敗 0（`use_nodes` deprecation warningのみ）
