# ことば島 ぐるっと周遊デモ v1

## 目的

物語や学年構成を先に固定せず、ことば島の地形・気候・海岸帯から導いた特徴的な場所を、一つの3D地表と一つの閉じたrouteで巡って評価する。

## コース

`南東の花草原 → 東の木漏れ日林 → 北東の雨の森 → 北西カルデラ縁 → 西の風見尾根 → 南西河口湿地 → 岬裏のポケット浜 → 根泉の谷 → 古代樹外縁 → 南岸花壇集落 → 花草原`

- 天空は含めない。
- 古代樹は内部へ入らず、外縁から大きさを予告する。
- 海岸は河口湿地、白砂、浅海、外礁を同じ地形正本上で分ける。
- routeは背景交換、暗転、teleportを使わず閉じる。
- routeは地点間の直線ではなく、海岸段丘、小川の谷、斜面のつづら折り、尾根の肩をつなぐ。全27制御点を陸上に置き、隣接制御点間の実標高勾配を22%未満にする。
- 全島模型の地形形状は共通正本を使う。ただし、地形理解用の大きな標高誇張は地表追従時に崖のように見えるため、この周遊デモの表示倍率は2.35倍とする。

## デモ操作

- 自動再生／一時停止
- 全島俯瞰／地表追従の切替
- 周遊位置slider
- 10地点への直接移動
- 地表追従中は、左右ドラッグで回り込み、上下ドラッグで視線を上下、ホイールで距離を変更
- 視点リセット

## 実装境界

地形と海は既存のcanonical island surfaceを使う。ルートとデモ用の簡略ランドマークは評価層であり、正式なgameplay propsではない。承認後は、各区間を同じ座標のregional-corridor / gameplay-near LODとして作り込み、別の島を作らない。22%は全島模型の制御点間を監査する上限であり、実際の歩行用LODではさらに細かな折返しと地形整形を入れ、短区間の体感勾配を緩める。

## 対象ファイル

- 配布用単体版: `artwork/renderer-prototypes/kotoba-island-grand-tour-v1.html`
- 互換名の単体版: `artwork/renderer-prototypes/kotoba-island-grand-tour-v1-standalone.html`
- 開発用ソース: `artwork/renderer-prototypes/kotoba-island-grand-tour-v1-dev.html`
- route正本: `src/journey3d/islandGrandTour.ts`

配布用と互換名の2ファイルにはThree.js、地形、routeのJavaScriptがすべて埋め込まれている。`file://`で直接開ける。`-dev.html`はViteがbare module importとTypeScript importを解決する開発用であり、直接開かない。
