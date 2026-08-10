# Stage 3 明るさ・可愛さ・3D実装性 校正v2

最終更新: 2026-08-10
状態: 方向確認用。Stage 2/4/5への展開前
画像: `artwork/preproduction/stage-3-mountain-to-inlet-storyboard-bright-v2.png`

## v1の問題

地理順は正しかったが、暗い岩面、細かな三角模様、専用形状に見える崖、連続した敷石状の道が
多く、柔らかな冒険より重厚な背景画へ寄っていた。画像をそのまま再現するとStageごとの専用meshが
増え、Stage 4〜12へ展開しにくい。

## v2で固定した方向

- sky blue、mint、yellow-green、cream、coral-goldを大色面にする。
- 影を黒へ落とさず、花は白・黄・淡桃の小さなアクセントに限定する。
- 丸みのあるfaceted rock、広葉樹、低木を少数familyで組む。
- 画面全面の細かな面分割を減らし、空・遠山・水へquiet areaを作る。
- 山でも危険・緊張を主調にせず、「先を見たくなる安全な細道」として見せる。
- route-v2の北西鞍部→南西河口、0.72km→0.03km、panel 5まで海を遮る条件は維持する。

## 3D asset分解

| 種別 | 初回制作数 | 変化の作り方 |
|---|---:|---|
| rounded basalt | 3 | scale、yaw、埋没率、色差 |
| broadleaf cloud tree | 2 | 幹/樹冠scale、傾き、距離LOD |
| wind shrub | 2 | scale、mirror、密度 |
| grass / flower card | 1 atlas | 白/黄/淡桃、cluster密度 |
| ground / trail | 1 shader | soil、grass、root、pebble maskをworld座標で混合 |
| low stone gate | 1 modular set | 既存Stage 2境界と共有 |
| small lookout | 1 modular set | 木柱、床、布だけ |
| stream | 1 ribbon system | 幅、流速、石mask |
| estuary bridge | 1 modular set | Stage 4境界と共有 |

遠山は個別の背景板でなく全島canonical terrainのregional LODを使う。崖、谷、河岸段丘は
正本地形meshから生成し、絵ごとの専用彫刻meshを作らない。

## 画像上の判定

### 改善

- v1より明度、色面、空の余白、親しみやすさが大きく改善。
- 岩・木・低木が同じasset familyとして読みやすく、3D量産へ分解できる。
- panel 1〜6の下り、谷川、海の初見、河口湿地の地理順を維持。
- 針葉樹風の植生を広葉樹へ修正。

### まだ直す点

- 道がcream色の連続帯として強く、部分的に敷石へ見える。
- panel 2〜3の岩数を約20%減らして、斜面と空の大色面をさらに広げられる。
- panel 6の橋はStage 4第1コマと同一camera比較が必要。

## 展開gate

この明るさ、形状の丸み、asset分解をStage 2/4/5へ展開候補とする。ただし、道中央へ草・土・根を
戻す一回の画像修正と、ユーザーの方向確認後に展開する。可愛さを増すために小物を大量追加せず、
色、輪郭、余白、丸い大形状で調整する。

## 生成記録

組み込み画像生成を使用。Stage 1正本をvisual-language reference、Stage 3 v1を地理順のreference
として渡した。promptでは再利用可能なasset数、route方位/標高、camera接線、海の遮蔽、大色面、
palette、禁止する専用崖/細密模様/敷石道を明記した。特定作品・作家の模倣は指定していない。

