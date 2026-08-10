# 可愛い女の子主人公：3D制作方法と承認gate

更新: 2026-08-10  
外観正本: `artwork/preproduction/characters/third-person-adventurer-girl-3d-visual-target-v1.png`

## 結論

正本画像へ向けてprimitiveを少しずつ調整する方法は採用しない。可愛さは衣装色だけでなく、
顔の面構成、目と前髪の可視性、頭身、全身シルエット、表情、視線、変形後の輪郭が同時に
成立して初めて読める。そのため、造形・表情・変形・ゲーム画面の4段階で別々に承認する。

現在のprimitive v3はmotion timingの参考に限定し、正式モデルのmesh基盤にはしない。

## 調査から採用する制作原則

1. **プリセットを選ぶだけで終えず、顔・髪・衣装を個別に造形する。**
   VRoid Studioの公式説明でも、顔・髪・衣装は形状、パラメータ、textureを個別に編集し、
   髪は束ごとに造形・揺れを設定する設計である。可愛さを一つの全身パラメータで作らない。
2. **外形を先に、細部を後にする。**
   正面、側面、背面、後方ゲームcameraの無彩色renderで、頭部・髪・頬・肩・袖・脚・bootsの
   silhouetteを承認してからUVや柄へ進む。衣装textureで悪い輪郭を隠さない。
3. **顔は専用topologyとshape keyで作る。**
   Blenderの公式manualが説明するように、shape keyは顔など骨回転だけでは制御しにくい有機的
   変形に使う。Basis topologyを安定させてから、blink、smile、joy、surprise、母音を作る。
4. **身体はhumanoid rig、顔はshape key中心に分ける。**
   Rigifyの公式手順に従い、共通骨格をmesh寸法へ合わせ、肘・膝へ軽い曲げ方向を持たせる。
   顔boneを増やしすぎず、目線boneと表情shapeを責務分離する。
5. **ウェイトは静止姿勢でなく動作で承認する。**
   shoulder、elbow、hip、kneeのweightを正規化し、walk/run時の頬・肩・袖・股・膝の輪郭を
   front 3/4とgame cameraで確認する。必要箇所だけcorrective shapeを追加する。
6. **可愛さを保つ小さな生命感を仕様化する。**
   VRM 1.0が標準化するblink、emotion、gaze、SpringBone相当を採用し、目線、瞬き、髪先、
   肩布、sashを独立制御する。揺れを増やすこと自体を可愛さとみなさない。
7. **Web実装はskinned GLBを正本にする。**
   Three.js公式の想定どおり、SkinnedMeshを手作業のprimitive階層で代用せず、GLTFLoaderで
   skeleton・morph target・animation clipを含むGLBを読み、AnimationMixerで遷移する。

## 制作順と停止gate

### Gate 0 — 画像設計

- front / true side / backの同一寸法model sheet
- 顔の正面・横・笑顔・瞬きの拡大sheet
- 後方ゲームcameraで読む髪、肩布、鞄、bootsのsilhouette sheet
- 色を消しても主人公として識別できること

次のGate 0資料を制作済み。これらを造形の入力に使い、生成画像自体をmeshとは扱わない。

- `third-person-adventurer-girl-face-expression-sheet-v1.png`
- `third-person-adventurer-girl-rear-motion-sheet-v1.png`

顔sheetはneutral front / true side / front 3/4 / gentle smile / blink / discoveryを同一人物で固定。
後方sheetはstanding / walk / run / back A-poseで、髪、肩布、鞄、sash、bootsの重なりを固定した。

### Gate 1 — 無彩色head bust

- 顔、耳、首、眼球、前髪、横髪、後髪を正式topologyで制作
- front / side / 3/4を外観正本と同じcamera・照明でrender
- 両目が前髪から完全に見える
- 無表情でも険しく、幼児的、無機質に見えない

ここで不合格なら身体や衣装へ進まない。

### Gate 2 — 全身grey model

- 4.5頭身と関節位置を数値固定
- tapered arm/leg、親指の読める手、甲・履き口・底のあるboots
- jacket / cape / inner / pants / sash / bagを別meshにする
- front / side / back / game cameraの4画像を比較

ここで不合格ならtextureへ進まない。

### Gate 3 — UV・材質・トゥーン

- 肌、白目、虹彩、髪、布、革を別材質slotにする
- 大きな色面を優先し、柄は輪郭を壊さない低コントラスト
- 明部でも白目と肌、暗部でも髪束と顔輪郭が分離する
- MToon相当または同等のtoon lightingをPC/iPadで比較

### Gate 4 — rig・表情・motion

- humanoid skeleton、正規化weight、eye bones
- blink / smile / joy / surprise / a-i-u-e-o shape keys
- idle / walk / run / look / discover / receive clips
- motion切替はcrossfadeし、停止時に足滑りしない
- 髪・肩布・sashは控えめなsecondary motion

### Gate 5 — 実ゲームcamera

- Stage 1の背景、上HUD、下typing overlayを同時表示
- normal / near / wide cameraで頭、肩、足が隠れない
- 1024×768と390×844で顔・髪・進路が読める
- 5秒動画とfront/side/back静止画を画像比較して承認する

## 合否表

各gateは「なんとなく可愛い」で通さない。次の7軸を同じcameraで前版と正本に並べ、
`pass / conditional / fail`を記録する。

1. 顔の第一印象（目、頬、口、顎）
2. 髪が目と顔輪郭を邪魔しないか
3. 4.5頭身と手足のtaper
4. 後方silhouetteの識別性
5. 衣装の重なりと身体接続
6. walk/run時の変形と足接地
7. ゲーム背景・UI内での可読性

一つでも重大な`fail`があれば次工程へ進まず、その工程のmeshまたは設計へ戻す。
prompt追加や色変更だけで構造上のfailを直したことにしない。

## 形式と実装契約

- 制作正本: Blender相当の編集可能source
- 配信形式: GLB（skin、morph targets、複数animation clips）
- 将来互換: VRM 1.0 humanoid / expression / lookAt / SpringBoneへ対応可能な命名
- Three.js: `GLTFLoader` + `AnimationMixer`
- 読込・受入検査: `loadAdventurerCharacter.ts` / `adventurerCharacterAsset.ts`。skin、6 clips、
  9 facial morphsが揃うまで正式assetへ切り替えない。未完成GLBをゲーム画面へ自動fallback表示しない
- primitive v3: motion timing比較専用。正式モデルのfallback外観には使用しない

## 参照した一次資料

- Blender Manual — Shape Keys: https://docs.blender.org/manual/en/latest/animation/shape_keys/introduction.html
- Blender Manual — Rigify Basic Usage: https://docs.blender.org/manual/en/latest/addons/rigging/rigify/basics.html
- Blender Manual — Weight Paint: https://docs.blender.org/manual/en/4.4/sculpt_paint/weight_paint/introduction.html
- VRM — Features and contents: https://vrm.dev/en/vrm/vrm_features/
- VRM — LookAt: https://vrm.dev/univrm1/vrm1_tutorial/lookat/
- VRoid Studio — official feature overview: https://vroid.com/en/studio
- Three.js — SkinnedMesh: https://threejs.org/docs/pages/SkinnedMesh.html
- Three.js — Animation System: https://threejs.org/manual/en/animation-system.html
- Three.js — GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
