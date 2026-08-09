# 三人称・子ども冒険者 実装前設計

最終更新: 2026-08-10
状態: pilot設計・カメラ構図検証用（正式モデル未制作、ゲーム未統合）

## 1. 決定事項

Stage 1の連続3D経路へ、4〜5頭身の子ども冒険者を後方やや上から見る三人称表示を導入候補とする。移動はタイピング進捗に同期した自動歩行で、自由操作や戦闘は追加しない。既存作品の固有な衣装、髪型、装備、シルエット、配色は模倣せず、ことば島の「簡略化した日本画調 × 透明水彩 × 控えめなファンタジー」に合わせた独自意匠とする。

最初は一人のpilotだけを制作する。turnaround、rig、歩行、カメラ、typing UIとの共存を承認してから、同じskeletonを使う髪・服・配色差分へ展開する。

## 2. 画面で果たす役割

- 文字入力が世界内の前進につながったことを、足運びと身体の向きで伝える。
- 道幅、坂、橋、森への進入を身体スケールで読めるようにする。
- 主人公を鑑賞の中心にしすぎず、土地と発見予兆を読む余白を残す。
- ミス時に転倒、萎縮、責める身振りを使わない。短い歩幅低下か呼吸への復帰だけにする。

## 3. pilot外観

### 比率とシルエット

- 4.5頭身を基準（許容4.2〜4.8頭身）。頭を大きめ、手足を短めにし、後方10〜18m相当でも子どもと分かる。
- 年齢印象は小学校中学年前後。性別を固定しない中立的な顔立ちと体格。
- 大きな帽子、長い武器、巨大な背負い物、床まで届くマントは不採用。景観・予兆・typing overlayを遮るため。
- 輪郭は髪、短い上着、小型の斜め掛け鞄、裾を絞ったパンツ、短靴の5つで読む。輪郭線は使わず、2〜3段階の色面で分ける。

### 正面・側面・背面 turnaround要件

| 面 | 必ず読める要素 | 制作上の注意 |
|---|---|---|
| 正面 | 丸い前髪、短い上着の留め、鞄ストラップ、左右の靴 | 顔は目・眉・口の最小構成。遠景で顔へ依存しない |
| 側面 | 額から鼻の緩い面、後頭部、肘膝の曲がり、薄い鞄 | 鞄と髪が肩・腕の可動域へ干渉しない |
| 背面 | 髪の大きな色面、襟、上着裾、鞄、踵 | 通常画面で最も長く見る面。情報量を正面より少し高くする |

三面図は同一正投影スケール、ニュートラルAポーズ、裸足接地線・頭頂線・肩・肘・腰・膝のガイド付きで作る。装備を外した素体図と装備付き図を分ける。

### 水彩トゥーン表現

- base colorは低彩度の青緑、生成り、土色。accentは琥珀色を面積5〜8%だけ使う。
- 影は一段のtoon ramp、必要なら接地付近だけ二段目。黒いアウトラインは使わない。
- 紙目とにじみはUV固定の微細模様にし、身体の動きに対して画面空間で滑らせない。
- 肌・髪・服で質感を作り分けるが、写実的な毛髪、布繊維、金属PBRは避ける。

## 4. 共通skeletonと差替え契約

共通humanoid skeletonは約34〜42 bonesを目安とする。必須はroot、hips、spine×2、chest、neck、head、左右clavicle/upperArm/lowerArm/hand、左右upperLeg/lowerLeg/foot/toe。髪・鞄は各1〜3本の補助boneを任意追加し、素体skeletonの命名と階層は変えない。

- root motionは書き出さない。前進はrendererのroute transport、motionはin-placeとする。
- 単位m、Y-up、正面+Z（import adapterでThree.js方向へ一度だけ変換）。
- body、hair、top、bottom、shoes、bagを別primitiveまたは差替え可能なmesh slotにする。
- 服差分は同一bind poseとskin weightsを優先し、体格差はpilot承認後に限定的なbone scaleで検証する。
- paletteはskin / hair / clothMain / clothSub / leather / accentの6 semantic slot。色をmaterial名へ埋め込まない。

## 5. 必要motion

| clip | loop | 用途・長さ目安 |
|---|---:|---|
| `idle_breathe` | yes | 3〜5秒。肩と重心の微動のみ |
| `walk_forward` | yes | 0.85〜1.05秒/周期。自動歩行の標準 |
| `run_soft` | yes | 0.65〜0.8秒/周期。長い開けた区間のみ。疾走させない |
| `look_interest` | no | 1.4〜2.0秒。頭→胸の順で予兆へ視線 |
| `discover` | no | 1.2〜1.8秒。少し屈み、手を開く。大げさなジャンプ禁止 |
| `receive` | no | 1.5〜2.2秒。胸の前で受け、2D報酬表示へ視線を導く |

idle↔walkは0.18〜0.28秒、walk↔runは0.25〜0.4秒でcrossfadeする。文境界ではclip時刻をresetしない。タイピング速度は歩幅を極端に変えず、再生速度0.82〜1.18倍と停止時間で吸収する。

## 6. 坂道接地

pilotでは二段階で検証する。

1. 簡易接地: routeの地形法線からhipsの高さと身体upを平滑追従し、足裏の最低点を地形から沈ませない。勾配±12°までを受入範囲とする。
2. 品質版: 左右足のplant区間だけraycastし、ankle位置とfoot pitchをtwo-bone IKで補正する。hips補正は±7cm、足首補正±10cm、補間120〜220ms。段差・倒木はroute側の専用step cueを優先する。

reduced motionでは身体upの揺れ、腕振り、hips上下動を通常の25〜40%へ下げるが、足滑り防止の接地補正は維持する。

## 7. カメラ構図

- 通常: pivotを胸背面付近、カメラを後方3.8〜4.8m・上方2.2〜2.8m、35mm換算約32〜38mm相当。キャラクター全高は画面高の20〜27%。
- キャラクター中心は画面幅50%、画面高62〜68%。頭頂を中央より下に置き、進行方向と樹冠を広く見せる。
- 下部typing panelの上端より上へ、靴を含む全身が見えることを原則とする。狭い画面では靴がpanelに最大10%重なることを許容するが、出題文字へ重ねない。
- 上部HUD、下部typing panel、左右8%をsafe zoneとする。発見予兆はキャラクターの肩越し左右へ出し、身体の真後ろには置かない。
- camera targetはroute接線の6〜10m先。位置と注視点を別々にdampingし、地形追従で急なpitch変化を作らない。
- 通常の上下揺れは画面高0.6%以下、roll 0.5°以下。reduced motionは揺れ0、look eventのyaw変更を通常の40%以下にする。
- 橋、密林、発見時もcamera cutをしない。必要な横オフセットは0.4〜0.8mを0.8秒以上で補間する。

比較プリビズは `artwork/renderer-prototypes/third-person-camera-composition-v1.html`。正式モデルの見た目評価ではなく、人物占有率、safe zone、道の見え方、一人称との差を判定する。

## 8. glTF制作工程

1. 三面図とpilot paletteを承認する。
2. 低密度blockoutで4.5頭身・後方シルエットを確認する。
3. 共通skeleton、bind pose、命名を確定する。
4. pilot meshをskinし、walk一つで肩・鞄・裾の干渉を直す。
5. 6 motionをin-placeで制作し、loop seamとfoot plant markerを検査する。
6. toon materialのsemantic slotと紙目UVを適用する。
7. glTF 2.0 (`.glb`)でmesh、skin、clipsを一体出力する。不要camera/light、未使用material、重複textureは除く。
8. Three.js検証器でscale、orientation、clip名、bone数、bounds、texture color spaceを自動検査する。
9. Stage 1複製環境でcamera/IK/UIを承認する。ここまで通ってからゲーム統合を別タスク化する。
10. pilot承認後だけ、hair / top / palette差分を制作する。

## 9. 性能予算（pilot）

- 1体表示、LOD0 18k〜32k triangles、LOD1 8k〜16k、LOD2 3k〜6k。
- bones 42以下、skinned primitives 6以下、同時material 6以下。
- textureは原則2組以内（baseColor 1024²、toon/paper 512²共有）。pilot GLB 8MB以下を目標。
- 影は本体1体のみ。髪・鞄ごとの独立shadow meshを作らない。
- animation clips合計2MB以下を目安とし、30fps key sampling後に圧縮する。

品質優先のプリビズでは端末負荷をgateにしないが、環境側の描画を壊さないため、キャラクター追加前後のdraw calls、GPU frame time、メモリ差を記録する。

## 10. 受入基準と承認gate

1. 正面・側面・背面で同一人物、4.2〜4.8頭身、独自意匠として読める。
2. 1024×768および16:10で、上部HUDと下部typing panelを隠さず全身と進路が読める。
3. 草原、森入口、橋の3地点でキャラクター占有率20〜27%、水平overflowなし。
4. 文境界でroute位置、walk phase、cameraが先頭へ戻らない。
5. ±12°の坂で足の沈み5cm以下、浮き7cm以下、目立つfoot slidingが連続3frameを超えない。
6. idle / walk / run / look / discover / receiveが責める・怖がらせる演技にならない。
7. reduced motionでcamera bob/rollが止まり、発見演出と進行方向は理解できる。
8. pilot GLBの自動検査とStage 1複製環境のconsole error 0。
9. pilotの静止三面図、後方通常画面、坂、発見の4種をレビューし、明示承認されるまでavatar量産とゲーム統合へ進まない。

## 11. 既存資料との境界

- `docs/3d-scene-brief-meadow-to-forest.md` の連続route、地形、画風を維持する。一人称指定だけを将来の採用判断後に更新する。
- `docs/stage1-3d-game-integration.md` の単調増加journeyProgress、単一canvas、下部typing UI、WebGL fallbackを維持する。
- item/animal/BGMの既存prototype所有権を変更しない。キャラクターは予兆を見たり受け取ったりするだけで、報酬UIやaudio transportを所有しない。
- `docs/game-design.md` の旧2D横歩き背景仕様は、三人称3D画面へ流用しない。
