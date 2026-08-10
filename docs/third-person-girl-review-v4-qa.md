# 女の子主人公 visual target comparison v4 — QA / GLB gate

最終更新: 2026-08-10  
対象: `artwork/renderer-prototypes/third-person-girl-review-v4.html`  
外観正本: `artwork/preproduction/characters/third-person-adventurer-girl-3d-visual-target-v1.png`
制作方法正本: `docs/cute-girl-3d-production-method.md`

## 外観正本の制作記録

2026-08-10に画像生成で制作した。既存の三面図
`third-person-adventurer-girl-turnaround-v2.png`から配色と冒険者としての同一性を継承し、
ユーザー確認画像のprimitiveモデルは「避ける形状」の参照にのみ使用した。

生成要件は次のとおり。

- 固有VTuberの模倣ではなく、親しみやすいオリジナルのアニメ調3Dキャラクター。
- 4.5頭身、大きく明瞭な琥珀色の瞳、丸い頬、小さな口、前髪で目を隠さない。
- 短い濃紺緑のボブ、軽い外跳ね、黄土色の葉飾り。
- ターコイズのジャケットとケープ、生成りのインナー、コーラルの縁、黄土色の帯、
  ゆったりしたパンツ、成形された茶色いブーツと斜め掛け鞄。
- front / side / backの三面で形状と衣装が一致し、モデル制作に使える中立立ち姿。
- capsule、tube、単純球の継ぎ足し、顔を横切る髪、下着状に見える骨盤面、
  棒状の手足を避ける。

このPNGは最終テクスチャそのものではなく、mesh・材質・輪郭・可愛さの承認基準である。
生成画像をそのまま3Dモデルと呼ばない。

## 画像差分

「可愛い」と自己判定せず、正本との観察差分を記録する。

| 項目 | 画像基準 | 現在のprimitive | 判定 |
|---|---|---|---|
| 顔 | 大きな琥珀目が前髪から完全に見え、丸い頬・顎・耳・小口 | 目は小さく立体構造がなく、前髪と顔面の接続が粗い | GLB必須 |
| 髪 | 根元から毛先へ流れる意図的な束、軽い外跳ね、葉飾り | 丸い塊によるボブの大形のみ | GLB必須 |
| 接続 | 首から肩、胸、腰へ布と身体が連続 | 隙間は抑えたが、cloth skinの変形ではない | GLB必須 |
| 衣装 | ケープ、ジャケット、生成りインナー、サッシュ、パンツが明瞭 | 色レイヤーは分離。布端・襟・パンツの立体裁断は不足 | GLB必須 |
| 四肢 | tapered limbs、指のある手、成形ブーツ | capsule、丸い手、簡略靴 | GLB必須 |
| motion | in-place idle / walk / run | 肩肘股膝足首、腰胸、foot plantを確認可能 | 継続利用可 |

## v4比較機能

- 正本画像と実動モデルをPCでは横並び、スマホでは縦並びで表示。
- front 3/4 / side / back 3/4の静止比較。
- idle / walk / runを同じviewで再生。
- v3のcamera / wire / bones / reduced motion機構は保持。

## 制作gate

primitiveの継ぎ足しを外観承認用モデルとして継続しない。制作方法正本のGate 0から順に進め、
正本をmodel sheetとしてBlenderでretopology可能なmeshを制作する。次を満たすGLBを制作し、
v3はmotion timingの比較対象にだけ使用する。

1. 顔と大きな琥珀目、眼窩、耳、口を独立mesh / shape key化。
2. 前髪・横髪・後髪・片側結びを意図的なhair cardsまたは束meshで制作。
3. jacket / inner / cape / pants / sash / boots / bagを別slotで制作し、下着状の骨盤面を露出させない。
4. 手は親指と指のシルエット、bootsは履き口・甲・底を持たせる。
5. skin後にfront 3/4 / side / back 3/4静止画をv4へ差し替え、正本との横並び承認を得る。

## ブラウザQA

| 項目 | 結果 |
|---|---|
| PC横並び、3静止pose、3 motion | PASS |
| phone縦並び、horizontal overflow 0 | PASS |
| console warning / error 0 | PASS |

実ブラウザで正本と実動モデルの横並びを目視し、比較結果として「外観は未達、motion検証は継続利用可」を確認した。スマホ幅ではgridが1列になり、horizontal overflowは0。console warning / errorも0。
