export type KanaItem = { kana: string; romaji: string }
export type KanaCourse = { id: string; name: string; subtitle: string; icon: string; color: string; items: KanaItem[] }

const makeItems = (source: string): KanaItem[] => source.trim().split(/\s+/).map((pair) => {
  const [kana, romaji] = pair.split(':')
  return { kana, romaji }
})

export const KANA_COURSES: KanaCourse[] = [
  {
    id: 'basic-1', name: 'はじめの音', subtitle: '母音・か行・さ行・た行・な行', icon: '🌱', color: '#45b99c',
    items: makeItems('あ:a い:i う:u え:e お:o か:ka き:ki く:ku け:ke こ:ko さ:sa し:shi す:su せ:se そ:so た:ta ち:chi つ:tsu て:te と:to な:na に:ni ぬ:nu ね:ne の:no'),
  },
  {
    id: 'basic-2', name: 'ことばの音', subtitle: 'は行・ま行・や行・ら行・わ行・ん', icon: '🍀', color: '#42a9c5',
    items: makeItems('は:ha ひ:hi ふ:fu へ:he ほ:ho ま:ma み:mi む:mu め:me も:mo や:ya ゆ:yu よ:yo ら:ra り:ri る:ru れ:re ろ:ro わ:wa を:wo ん:n'),
  },
  {
    id: 'voiced', name: 'にごる音', subtitle: '濁音・半濁音', icon: '💧', color: '#7c83dc',
    items: makeItems('が:ga ぎ:gi ぐ:gu げ:ge ご:go ざ:za じ:ji ず:zu ぜ:ze ぞ:zo だ:da ぢ:ji づ:zu で:de ど:do ば:ba び:bi ぶ:bu べ:be ぼ:bo ぱ:pa ぴ:pi ぷ:pu ぺ:pe ぽ:po'),
  },
  {
    id: 'contracted', name: '小さい「ゃゅょ」', subtitle: '拗音のチャレンジ', icon: '⭐', color: '#e49a43',
    items: makeItems('きゃ:kya きゅ:kyu きょ:kyo しゃ:sha しゅ:shu しょ:sho ちゃ:cha ちゅ:chu ちょ:cho にゃ:nya にゅ:nyu にょ:nyo ひゃ:hya ひゅ:hyu ひょ:hyo みゃ:mya みゅ:myu みょ:myo りゃ:rya りゅ:ryu りょ:ryo ぎゃ:gya ぎゅ:gyu ぎょ:gyo じゃ:ja じゅ:ju じょ:jo びゃ:bya びゅ:byu びょ:byo ぴゃ:pya ぴゅ:pyu ぴょ:pyo'),
  },
]
