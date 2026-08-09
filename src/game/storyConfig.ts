import type { Grade } from '../questions'
import type { Course } from '../rewards'

export type CourseStory = {
  title: string
  objective: string
  intro: string
  completion: string
  featuredTreasureId: string
  featuredFriendId: string
}

export type GradeStory = {
  chapterTitle: string
  premise: string
  finale: string
  courses: Record<Course, CourseStory>
}

const course = (title: string, objective: string, intro: string, completion: string, featuredTreasureId: string, featuredFriendId: string): CourseStory => ({ title, objective, intro, completion, featuredTreasureId, featuredFriendId })

export const GRADE_STORIES: Record<Grade, GradeStory> = {
  1: { chapterTitle: 'ひかりの種と はじめての地図', premise: '島じゅうの花を元気にする「ひかりの種」が、風に飛ばされてしまいました。', finale: '集めた種が雲上の庭で芽を出し、島じゅうに花の光が戻りました。', courses: {
    1: course('花の道の はじめの一歩', '草原で最初の種を探そう', '白うさぎのミミが、小さな足あとを見つけました。', '花のチャームが光り、森へ続く足あとが現れました。', 'flower-charm', 'rabbit-mimi'),
    2: course('小鳥が知っている道', '森で種の手がかりを聞こう', '小鳥のピピが、光るものを山の方で見たそうです。', 'どんぐり笛でピピと話し、山への近道を教わりました。', 'acorn-whistle', 'bird-pipi'),
    3: course('星見の山の きらめき', '山頂で風に乗った種をつかまえよう', '子鹿のナナと一緒に、星の光を目印に登ります。', '星の結晶のそばで、二つ目のひかりの種を見つけました。', 'star-crystal', 'deer-nana'),
    4: course('波が運んだ 小さな種', '入り江に流れ着いた種を探そう', 'ラッコのモコが、波間で光る貝を抱えています。', 'にじ色の貝の中から、最後の種がころんと現れました。', 'rainbow-shell', 'otter-moko'),
    5: course('月夜の森の めざめ', '古代樹に三つの種を届けよう', '森ねこのルナが、月明かりの道を案内してくれます。', '水晶の花が咲き、種を空へ運ぶ光の道が開きました。', 'crystal-flower', 'cat-luna'),
    6: course('雲の上の 花まつり', '遺跡の花壇に種をまこう', '雪うさぎのユキと、雲上の庭へ最後の階段を進みます。', '空色のかんむりが輝き、島いっぱいに花が咲きました。', 'sky-crown', 'snow-rabbit-yuki'),
  } },
  2: { chapterTitle: '風のコンパスと 眠った風車', premise: '島を動かす風が止まり、船も風車も動かなくなってしまいました。', finale: '六つの風のしるしがそろい、島にやさしい風と船の航路が戻りました。', courses: {
    1: course('風のしるしを追って', '草原で風の向きを調べよう', 'キツネのコンが、揺れる花の向きを見ています。', '冒険者のバッジに最初の風のしるしが刻まれました。', 'trail-badge', 'fox-kon'),
    2: course('森の風笛', '木々の間に残る風の音を集めよう', 'リスのクルが高い枝から風の音を聞かせてくれます。', '森の羽根ペンが風向きを地図に描きました。', 'forest-pen', 'squirrel-kuru'),
    3: course('山をこえる強い風', '山頂の風見台を直そう', '山ヤギのガクが安全な岩道を選んでくれます。', '登山隊のメダルが回り、入り江への風が生まれました。', 'climber-medal', 'goat-gaku'),
    4: course('止まった帆船', '入り江の船に風を届けよう', 'イルカのルルが沖の風車まで案内してくれます。', '潮風のコンパスが北を指し、船が動き始めました。', 'old-compass', 'dolphin-ruru'),
    5: course('古代樹の風の記憶', '古代樹から昔の風を呼び覚まそう', 'フクロウのホシが古い風の言葉を読んでくれます。', '古代樹の鍵で、雲上の風車へ続く門が開きました。', 'ancient-key', 'owl-hoshi'),
    6: course('天空の大風車', '六つのしるしで風車を回そう', '天空ワシのショウと、風の中心へ向かいます。', '天空の望遠鏡の先で大風車が回り、島に風が戻りました。', 'summit-scope', 'hawk-sho'),
  } },
  3: { chapterTitle: '消えた星座と 夜空の地図', premise: '島を導く星座が夜空から消え、旅人たちが道を見失っています。', finale: '集めた星のかけらが新しい星座となり、夜の航路を照らしました。', courses: {
    1: course('昼の草原に落ちた星', '草原で星のかけらを探そう', 'チョウのヒラリが光る花の周りを飛んでいます。', 'おひさま石の中に一つ目の星が眠っていました。', 'sun-stone', 'butterfly-hira'),
    2: course('森に響く星の合図', '森の動物から星の行方を聞こう', 'カブトムシのカブが、夜に光った木を知っています。', '木の葉の紋章に星座の一部が浮かびました。', 'wooden-emblem', 'beetle-kabu'),
    3: course('山頂の星読み台', '星読み台で空の地図を直そう', '山ワシのタカと雲の上まで登ります。', '月あかりランタンが、入り江に落ちた星を照らしました。', 'moon-lantern', 'eagle-taka'),
    4: course('海底に沈んだ星', '入り江の海底から星を取り戻そう', '熱帯魚のニジが、珊瑚の奥へ案内してくれます。', '真珠のリボンで星のかけらを結び直しました。', 'pearl-ribbon', 'fish-niji'),
    5: course('古代の星の書', '古代樹林で星座の名前を見つけよう', '森オオカミのロクが、封印された書を守っています。', '森の魔法書から、失われた星座の名前が分かりました。', 'magic-book', 'wolf-roku'),
    6: course('新しい星座を空へ', '遺跡の天文台で星を戻そう', '若ライオンのレオが最後の台座を動かします。', '勇者の盾飾りが星を映し、新しい星座が完成しました。', 'hero-shield', 'lion-leo'),
  } },
  4: { chapterTitle: 'にじ色の潮と 珊瑚の鐘', premise: '海の色を守る珊瑚の鐘が壊れ、入り江から色が消え始めました。', finale: '鐘の音が七色の潮を呼び、島の海と空に大きな虹が架かりました。', courses: {
    1: course('虹のしずくを集めよう', '草原の朝露から色を集めよう', '白うさぎのミミが七色に光る朝露を見つけました。', '花のチャームに最初の虹色が宿りました。', 'flower-charm', 'rabbit-mimi'),
    2: course('森の青い音', '森に隠れた鐘の音を探そう', '小鳥のピピが不思議な音をまねしています。', 'どんぐり笛から青い音が響きました。', 'acorn-whistle', 'bird-pipi'),
    3: course('雲を染める山の光', '山で夕焼けの色を集めよう', '子鹿のナナと夕日の当たる尾根を目指します。', '星の結晶が赤と金の光を蓄えました。', 'star-crystal', 'deer-nana'),
    4: course('珊瑚の鐘を直そう', '入り江で鐘のかけらを集めよう', 'ラッコのモコが海底からかけらを運んでくれます。', 'にじ色の貝をはめると、鐘が小さく鳴りました。', 'rainbow-shell', 'otter-moko'),
    5: course('月光で色を結ぶ', '古代樹林で七色を一つにしよう', '森ねこのルナが月光の泉へ案内します。', '水晶の花が七色を束ね、鐘を完成させました。', 'crystal-flower', 'cat-luna'),
    6: course('空と海の虹の橋', '雲上の台座で珊瑚の鐘を鳴らそう', '雪うさぎのユキが雲の切れ間を教えてくれます。', '空色のかんむりと鐘が共鳴し、大きな虹が架かりました。', 'sky-crown', 'snow-rabbit-yuki'),
  } },
  5: { chapterTitle: '古代樹の図書館と 月の鍵', premise: '古代樹の図書館から大切な言葉が消え、島の記録が白紙になっています。', finale: '集めた言葉で月の鍵が完成し、島の記憶が未来へ受け継がれました。', courses: {
    1: course('消えた言葉の足あと', '草原に散った文字を集めよう', 'キツネのコンが文字の形をした花びらを見つけました。', '冒険者のバッジに最初の言葉が戻りました。', 'trail-badge', 'fox-kon'),
    2: course('森の羽根ペン', '動物たちの記憶を書き留めよう', 'リスのクルが昔の森の話を覚えています。', '森の羽根ペンで、消えたページを一枚直しました。', 'forest-pen', 'squirrel-kuru'),
    3: course('山に刻まれた物語', '石碑から古い言葉を読み取ろう', '山ヤギのガクが古い石碑の場所を知っています。', '登山隊のメダルに次の暗号が浮かびました。', 'climber-medal', 'goat-gaku'),
    4: course('海を渡った手紙', '入り江に流れ着いた記録を集めよう', 'イルカのルルが古い手紙を見つけました。', '潮風のコンパスが手紙の送り主を示しました。', 'old-compass', 'dolphin-ruru'),
    5: course('月影の大図書館', '古代樹の奥で月の鍵を作ろう', 'フクロウのホシが、読めなくなった魔法書を開きます。', '古代樹の鍵と森の魔法書が一つになりました。', 'ancient-key', 'owl-hoshi'),
    6: course('記憶を未来へ', '雲上の書庫に島の記録を納めよう', '天空ワシのショウが、最後の書庫へ運んでくれます。', '天空の望遠鏡が未来を映し、全ての記録が戻りました。', 'summit-scope', 'hawk-sho'),
  } },
  6: { chapterTitle: 'ことば島の約束と 天空の王冠', premise: '島を守る天空の王冠が六つに分かれ、各地で異変が起きています。', finale: '六つの力と仲間たちの思いが王冠を直し、ことば島の新しい守り手が誕生しました。', courses: {
    1: course('守り手の試験', '草原の人々を助けて信頼を得よう', 'チョウのヒラリが困っている場所へ案内します。', 'おひさま石が認め、王冠の光が一つ戻りました。', 'sun-stone', 'butterfly-hira'),
    2: course('森の仲間との約束', '森の異変を調べて解決しよう', 'カブトムシのカブと役割を分けて調査します。', '木の葉の紋章に、仲間との約束が刻まれました。', 'wooden-emblem', 'beetle-kabu'),
    3: course('山を越える決断', '安全な道を選び全員で山を越えよう', '山ワシのタカが二つの道を示しています。', '月あかりランタンが正しい道と王冠のかけらを照らしました。', 'moon-lantern', 'eagle-taka'),
    4: course('海の民との協力', '入り江の航路をみんなで直そう', '熱帯魚のニジが壊れた珊瑚の道を教えます。', '真珠のリボンで航路を結び、海のかけらを受け取りました。', 'pearl-ribbon', 'fish-niji'),
    5: course('古代の守り手の問い', '古代樹林の試練に答えよう', '森オオカミのロクが、守り手に必要なことを問いかけます。', '森の魔法書が開き、最後の扉の言葉が現れました。', 'magic-book', 'wolf-roku'),
    6: course('天空の王冠', '雲上遺跡で六つのかけらを一つにしよう', '若ライオンのレオと、最後の台座へ進みます。', '勇者の盾飾りが輝き、天空の王冠と島の約束が蘇りました。', 'hero-shield', 'lion-leo'),
  } },
}

export const getCourseStory = (grade: Grade, courseNumber: Course) => GRADE_STORIES[grade].courses[courseNumber]
