export type Grade = 1 | 2 | 3

export type Question = {
  id: string
  stage: 1 | 2 | 3
  sentence: string
  reading: string
  /** 文節ごとに記述します。[漢字:よみ] の部分だけにルビが付きます。 */
  ruby: string[]
  /** 文節ごとに半角スペースを入れて記述します。判定時は自動で除去されます。 */
  romaji: string
  focus: string
  meaning: string
}

// 問題は学年ごとの配列に追加するだけで増やせます。
export const QUESTIONS: Record<Grade, Question[]> = {
  1: [
    { id: '1-000a', stage: 1, sentence: '山へ 行く。', reading: 'やまへ いく。', ruby: ['[山:やま]へ', '[行:い]く。'], romaji: 'yamahe iku', focus: '山・行', meaning: '山へ しゅっぱつ' },
    { id: '1-000b', stage: 1, sentence: '赤い 花。', reading: 'あかい はな。', ruby: ['[赤:あか]い', '[花:はな]。'], romaji: 'akai hana', focus: '赤・花', meaning: '赤い花を はっけん' },
    { id: '1-000c', stage: 1, sentence: '犬と 走る。', reading: 'いぬと はしる。', ruby: ['[犬:いぬ]と', '[走:はし]る。'], romaji: 'inuto hashiru', focus: '犬・走', meaning: '犬と かけっこ' },
    { id: '1-001', stage: 2, sentence: '大きな 木の 下で 休みます。', reading: 'おおきな きの したで やすみます。', ruby: ['[大:おお]きな', '[木:き]の', '[下:した]で', '[休:やす]みます。'], romaji: 'ookina kino shitade yasumimasu', focus: '木・下・休', meaning: '木かげで ひとやすみ' },
    { id: '1-002', stage: 2, sentence: '白い 犬と 山へ 行きます。', reading: 'しろい いぬと やまへ いきます。', ruby: ['[白:しろ]い', '[犬:いぬ]と', '[山:やま]へ', '[行:い]きます。'], romaji: 'shiroi inuto yamahe ikimasu', focus: '白・犬・山・行', meaning: 'しろい犬と ぼうけん！' },
    { id: '1-003', stage: 3, sentence: '青い 空に 月が 出ました。', reading: 'あおい そらに つきが でました。', ruby: ['[青:あお]い', '[空:そら]に', '[月:つき]が', '[出:で]ました。'], romaji: 'aoi sorani tsukiga demashita', focus: '青・空・月・出', meaning: '夜の島を てらす月' },
    { id: '1-004', stage: 3, sentence: '川で 小さな 貝を 見つけた。', reading: 'かわで ちいさな かいを みつけた。', ruby: ['[川:かわ]で', '[小:ちい]さな', '[貝:かい]を', '[見:み]つけた。'], romaji: 'kawade chiisana kaiwo mitsuketa', focus: '川・小・貝・見', meaning: 'きらきらの貝を はっけん' },
    { id: '1-005', stage: 3, sentence: '赤い 花が 七つ さきました。', reading: 'あかい はなが ななつ さきました。', ruby: ['[赤:あか]い', '[花:はな]が', '[七:なな]つ', 'さきました。'], romaji: 'akai hanaga nanatsu sakimashita', focus: '赤・花・七', meaning: '花ばたけに とうちゃく' },
  ],
  2: [
    { id: '2-000a', stage: 1, sentence: '春が 来た。', reading: 'はるが きた。', ruby: ['[春:はる]が', '[来:き]た。'], romaji: 'haruga kita', focus: '春・来', meaning: 'あたたかい春が きた' },
    { id: '2-000b', stage: 1, sentence: '海を 見る。', reading: 'うみを みる。', ruby: ['[海:うみ]を', '[見:み]る。'], romaji: 'umiwo miru', focus: '海・見', meaning: '広い海を ながめよう' },
    { id: '2-000c', stage: 1, sentence: '風が 強い。', reading: 'かぜが つよい。', ruby: ['[風:かぜ]が', '[強:つよ]い。'], romaji: 'kazega tsuyoi', focus: '風・強', meaning: 'ぼうしに 気をつけて' },
    { id: '2-001', stage: 2, sentence: '春の 池で 小さな 魚を 見つけた。', reading: 'はるの いけで ちいさな さかなを みつけた。', ruby: ['[春:はる]の', '[池:いけ]で', '[小:ちい]さな', '[魚:さかな]を', '[見:み]つけた。'], romaji: 'haruno ikede chiisana sakanawo mitsuketa', focus: '春・池・魚・見', meaning: '池の中に だれかいるよ' },
    { id: '2-002', stage: 2, sentence: '風に のって 船が 島へ 進みます。', reading: 'かぜに のって ふねが しまへ すすみます。', ruby: ['[風:かぜ]に', 'のって', '[船:ふね]が', '[島:しま]へ', '[進:すす]みます。'], romaji: 'kazeni notte funega shimahe susumimasu', focus: '風・船・島・進', meaning: 'つぎの島へ しゅっぱつ' },
    { id: '2-003', stage: 3, sentence: '朝日が 海を 金色に そめました。', reading: 'あさひが うみを きんいろに そめました。', ruby: ['[朝日:あさひ]が', '[海:うみ]を', '[金色:きんいろ]に', 'そめました。'], romaji: 'asahiga umiwo kinironi somemashita', focus: '朝・海・金・色', meaning: 'まぶしい朝の海' },
    { id: '2-004', stage: 3, sentence: '広い 野原を 元気に 走ります。', reading: 'ひろい のはらを げんきに はしります。', ruby: ['[広:ひろ]い', '[野原:のはら]を', '[元気:げんき]に', '[走:はし]ります。'], romaji: 'hiroi noharawo genkini hashirimasu', focus: '広・野・元・気・走', meaning: '風といっしょに かけぬけよう' },
    { id: '2-005', stage: 3, sentence: '古い 地図に 宝の 印が あります。', reading: 'ふるい ちずに たからの しるしが あります。', ruby: ['[古:ふる]い', '[地図:ちず]に', '[宝:たから]の', '[印:しるし]が', 'あります。'], romaji: 'furui chizuni takarano shirushiga arimasu', focus: '古・地・図・宝・印', meaning: 'ひみつの場所は どこかな？' },
  ],
  3: [
    { id: '3-000a', stage: 1, sentence: '星が 光る。', reading: 'ほしが ひかる。', ruby: ['[星:ほし]が', '[光:ひか]る。'], romaji: 'hoshiga hikaru', focus: '星・光', meaning: '夜空に 星がきらり' },
    { id: '3-000b', stage: 1, sentence: '橋を 渡る。', reading: 'はしを わたる。', ruby: ['[橋:はし]を', '[渡:わた]る。'], romaji: 'hashiwo wataru', focus: '橋・渡', meaning: '川のむこうへ 進もう' },
    { id: '3-000c', stage: 1, sentence: '鳥が 飛び立つ。', reading: 'とりが とびたつ。', ruby: ['[鳥:とり]が', '[飛:と]び[立:た]つ。'], romaji: 'toriga tobitatsu', focus: '鳥・飛・立', meaning: '鳥が空へ まい上がる' },
    { id: '3-001', stage: 2, sentence: '森の 奥で 美しい 湖を 発見した。', reading: 'もりの おくで うつくしい みずうみを はっけんした。', ruby: ['[森:もり]の', '[奥:おく]で', '[美:うつく]しい', '[湖:みずうみ]を', '[発見:はっけん]した。'], romaji: 'morino okude utsukushii mizuumiwo hakkenshita', focus: '森・奥・美・湖・発見', meaning: 'しずかな湖を はっけん' },
    { id: '3-002', stage: 2, sentence: '急な 坂道を 登って 頂上を 目指す。', reading: 'きゅうな さかみちを のぼって ちょうじょうを めざす。', ruby: ['[急:きゅう]な', '[坂道:さかみち]を', '[登:のぼ]って', '[頂上:ちょうじょう]を', '[目指:めざ]す。'], romaji: 'kyuuna sakamichiwo nobotte choujouwo mezasu', focus: '急・坂・登・頂上・目指', meaning: '山のてっぺんへ！' },
    { id: '3-003', stage: 3, sentence: '島の 港に 大きな 客船が 着いた。', reading: 'しまの みなとに おおきな きゃくせんが ついた。', ruby: ['[島:しま]の', '[港:みなと]に', '[大:おお]きな', '[客船:きゃくせん]が', '[着:つ]いた。'], romaji: 'shimano minatoni ookina kyakusenga tsuita', focus: '島・港・客船・着', meaning: '遠くから船が やってきた' },
    { id: '3-004', stage: 3, sentence: '暗い 洞窟で 不思議な 石を 拾った。', reading: 'くらい どうくつで ふしぎな いしを ひろった。', ruby: ['[暗:くら]い', '[洞窟:どうくつ]で', '[不思議:ふしぎ]な', '[石:いし]を', '[拾:ひろ]った。'], romaji: 'kurai doukutsude fushigina ishiwo hirotta', focus: '暗・洞窟・不思議・石・拾', meaning: '石が かすかに光っている' },
    { id: '3-005', stage: 3, sentence: '太陽の 光が 氷を 静かに 溶かす。', reading: 'たいようの ひかりが こおりを しずかに とかす。', ruby: ['[太陽:たいよう]の', '[光:ひかり]が', '[氷:こおり]を', '[静:しず]かに', '[溶:と]かす。'], romaji: 'taiyouno hikariga kooriwo shizukani tokasu', focus: '太陽・光・氷・静・溶', meaning: '春へのとびらが ひらく' },
  ],
}
