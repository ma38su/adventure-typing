# ことば島ワールドマップ・地学統合コンセプト

更新: 2026-08-10
状態: v1比較用。最終地図・配信素材ではない。

## 正本

- `docs/spherical-world-map-spec.md`
- `docs/world-geology-and-climate-spec.md`
- `docs/world-biomes-fauna-culture-spec.md`
- `docs/3d-stage-1-36-continuous-world-plan.md`

## 画像

- `kotoba-island-geology-map-concept-v1.png`: 平面俯瞰。旧カルデラ縁、風上多雨林、三支流、河口湿地、雨陰草原、古代樹の関係を確認する。
- `kotoba-island-geology-map-concept-v2.png`: v1の地学構造を保ったまま、珊瑚の範囲、河口湿地、集落密度、古代樹と雲上遺跡の高度差を修正した地形候補。
- `kotoba-world-globe-concept-v1.png`: 同じ島を低緯度の球体世界上に置いた縮尺確認用。
- `kotoba-island-coordinate-map-v2.png`: 1280×800の座標正本QA。水彩OFF、座標地形・region・分水嶺・三支流・外礁、Stage 1〜12実線、13〜36破線、全216 scenicAnchorを表示。
- `kotoba-island-coordinate-map-terrain-v2.png`: 1280×800の地形基盤QA。水彩・route・anchorをOFFにし、座標由来の島輪郭、region、標高帯、分水嶺、流域だけを表示。

## 座標地図v2 QA

検証元は`kotoba-island-map-overlay-v2.html`と`kotoba-island-route-v2.js`。Chromeの1280×800 viewportで確認し、真正PNGへ正規化した。

- 横overflowなし、console warning/error 0。
- Stage 1〜12 route 12本、Stage 13〜36 route 24本、合計36本を確認。
- scenicAnchor 216個をDOM件数と画面上の点で確認。
- 水彩比較はOFF。座標地形、region、分水嶺、三支流、外礁はON。
- 気候は北東多雨林／南西雨陰草原というregion色で読めるが、v2 HTMLには独立した気候矢印layerがまだない。今回のPNGへ存在しないlayerを後加工で描き足していない。
- 36 routeの線種とStage番号、主要地名は1280×800で判別できる。
- 216 anchorの位置と密度は判別できるが、全`Stage.anchor`番号を等倍で個別読解することはできない。個別監査はHTMLの拡大表示またはStage/章filterが必要。

したがって、`kotoba-island-coordinate-map-v2.png`は全体整合QAには合格だが、全anchor IDを一枚で読む制作表としては不合格である。次版ではHTML正本へ気候layerとStage/章filterを追加し、通常表示はanchor点のみ、選択時だけIDを表示する。

## v1の合格点

- 一つの火山島として山地、森、湾、草原が連続する。
- 東北東の湿潤風と北東多雨、南西雨陰の対比が読める。
- 分水嶺から三支流が合流し、湾北部の河口湿地へ入る。
- 球体上で旅の舞台が惑星の一部にすぎないと分かる。

## v2で必須の修正

- 珊瑚礁を島全周から減らし、南西湾の清澄な外湾・岬に限定する。
- 集落記号を減らし、巨大都市でなく環境へ適応した小規模な生活痕跡にする。
- 古代樹上の根棚と、1.65〜2.05km高度の雲上遺跡を別の高度層として読ませる。
- 河口湿地→砂泥・藻場→白砂ポケット浜→外湾裾礁の帯状変化をより明確にする。
- 決定論的なSVG/HTMLオーバーレイでStage 1〜12の実線、Stage 13〜36の計画破線、高度区間、ルビ付き地名を追加する。

v2で上の最初の三項は改善した。一方、雲上への螺旋路が地表の巨大道路のように強く見えるため、最終版では古代樹の内部・上昇根・岩盤アンカーの部分表示に弱める。オーバーレイ検証完了まで配信用最終地図にはしない。

## 生成方法

OpenAIの組み込み画像生成を使用。プロンプトは `docs/spherical-world-map-spec.md` の地学・気候・投影条件を展開し、文字、route、UIは画像へ焼き込まない条件とした。
