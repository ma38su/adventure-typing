export type Grade = 1 | 2 | 3

export type Question = {
  id: string
  sentence: string
  reading: string
  /** 文節ごとに半角スペースを入れて記述します。判定時は自動で除去されます。 */
  romaji: string
  focus: string
  meaning: string
}

// 問題は学年ごとの配列に追加するだけで増やせます。
export const QUESTIONS: Record<Grade, Question[]> = {
  1: [
    { id: '1-001', sentence: '大きな 木の 下で 休みます。', reading: 'おおきな きの したで やすみます。', romaji: 'ookina kino shitade yasumimasu', focus: '木・下・休', meaning: '木かげで ひとやすみ' },
    { id: '1-002', sentence: '白い 犬と 山へ 行きます。', reading: 'しろい いぬと やまへ いきます。', romaji: 'shiroi inuto yamahe ikimasu', focus: '白・犬・山・行', meaning: 'しろい犬と ぼうけん！' },
    { id: '1-003', sentence: '青い 空に 月が 出ました。', reading: 'あおい そらに つきが でました。', romaji: 'aoi sorani tsukiga demashita', focus: '青・空・月・出', meaning: '夜の島を てらす月' },
    { id: '1-004', sentence: '川で 小さな 貝を 見つけた。', reading: 'かわで ちいさな かいを みつけた。', romaji: 'kawade chiisana kaiwo mitsuketa', focus: '川・小・貝・見', meaning: 'きらきらの貝を はっけん' },
    { id: '1-005', sentence: '赤い 花が 七つ さきました。', reading: 'あかい はなが ななつ さきました。', romaji: 'akai hanaga nanatsu sakimashita', focus: '赤・花・七', meaning: '花ばたけに とうちゃく' },
  ],
  2: [
    { id: '2-001', sentence: '春の 池で 小さな 魚を 見つけた。', reading: 'はるの いけで ちいさな さかなを みつけた。', romaji: 'haruno ikede chiisana sakanawo mitsuketa', focus: '春・池・魚・見', meaning: '池の中に だれかいるよ' },
    { id: '2-002', sentence: '風に のって 船が 島へ 進みます。', reading: 'かぜに のって ふねが しまへ すすみます。', romaji: 'kazeni notte funega shimahe susumimasu', focus: '風・船・島・進', meaning: 'つぎの島へ しゅっぱつ' },
    { id: '2-003', sentence: '朝日が 海を 金色に そめました。', reading: 'あさひが うみを きんいろに そめました。', romaji: 'asahiga umiwo kiniro ni somemashita', focus: '朝・海・金・色', meaning: 'まぶしい朝の海' },
    { id: '2-004', sentence: '広い 野原を 元気に 走ります。', reading: 'ひろい のはらを げんきに はしります。', romaji: 'hiroi noharawo genkini hashirimasu', focus: '広・野・元・気・走', meaning: '風といっしょに かけぬけよう' },
    { id: '2-005', sentence: '古い 地図に 宝の 印が あります。', reading: 'ふるい ちずに たからの しるしが あります。', romaji: 'furui chizuni takarano shirushiga arimasu', focus: '古・地・図・宝・印', meaning: 'ひみつの場所は どこかな？' },
  ],
  3: [
    { id: '3-001', sentence: '森の 奥で 美しい 湖を 発見した。', reading: 'もりの おくで うつくしい みずうみを はっけんした。', romaji: 'morino okude utsukushii mizuumiwo hakkenshita', focus: '森・奥・美・湖・発見', meaning: 'しずかな湖を はっけん' },
    { id: '3-002', sentence: '急な 坂道を 登って 頂上を 目指す。', reading: 'きゅうな さかみちを のぼって ちょうじょうを めざす。', romaji: 'kyuuna sakamichiwo nobotte choujouwo mezasu', focus: '急・坂・登・頂上・目指', meaning: '山のてっぺんへ！' },
    { id: '3-003', sentence: '島の 港に 大きな 客船が 着いた。', reading: 'しまの みなとに おおきな きゃくせんが ついた。', romaji: 'shimano minatoni ookina kyakusenga tsuita', focus: '島・港・客船・着', meaning: '遠くから船が やってきた' },
    { id: '3-004', sentence: '暗い 洞窟で 不思議な 石を 拾った。', reading: 'くらい どうくつで ふしぎな いしを ひろった。', romaji: 'kurai doukutsude fushigina ishiwo hirotta', focus: '暗・洞窟・不思議・石・拾', meaning: '石が かすかに光っている' },
    { id: '3-005', sentence: '太陽の 光が 氷を 静かに 溶かす。', reading: 'たいようの ひかりが こおりを しずかに とかす。', romaji: 'taiyouno hikariga kooriwo shizukani tokasu', focus: '太陽・光・氷・静・溶', meaning: '春へのとびらが ひらく' },
  ],
}
