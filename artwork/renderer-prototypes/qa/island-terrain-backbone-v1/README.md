# 全島terrain backbone v1 QA

対象: `artwork/renderer-prototypes/kotoba-island-terrain-backbone-v1.html`  
検証日: 2026-08-10

## 結果

- 1024×768: 東側・西側へorbitし、島patch外に有限海面の端・裏面・seamが見えない。
- 390×844: `innerWidth=390`, `innerHeight=844`、scrollWidth/Heightがviewportと一致し、スクロールなし。
- OrbitControls: targetは島中心固定、pan無効、上下角・zoom範囲を制限。島の全周を回転可能。
- 全216 route anchorとStage 1 detailed corridor表示を維持。地上anchorはsurface height、雲上anchorは構造物高度を使用。
- 海岸帯: 深海→外礁→浅瀬→砂岸／岩岸、南西河口湿地をmetadataと色で区別。
- desktop/phoneともconsole warning/error 0。

## 画像

- `desktop-east.png`: 東側初期視点
- `desktop-west.png`: 島中心を保った反対側視点
- `phone-390x844.png`: 実効390×844

球面海は惑星半径6371km。島patchは局所ENUから実曲率の落差を与えて接続し、地表 reliefだけdebugで7倍表示する。地理座標やroute距離は拡大しない。
