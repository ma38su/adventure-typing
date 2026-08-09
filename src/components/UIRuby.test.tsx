import { describe, expect, it } from 'vitest'
import { getUncoveredUIKanji, splitUIRuby } from '../uiRuby'

describe('UIRuby', () => {
  it('uses longest phrase readings consistently', () => {
    expect(splitUIRuby('右手の人差し指')).toEqual([
      { text: '右手', reading: 'みぎて' }, { text: 'の' }, { text: '人差し指', reading: 'ひとさしゆび' },
    ])
  })

  it('reports kanji that still need a reading', () => {
    expect(getUncoveredUIKanji('冒険へ進む')).toBe('')
    expect(getUncoveredUIKanji('鰐齧')).toBe('鰐齧')
  })

  it('covers the fixed labels in the first delivery flow', () => {
    const labels = [
      '挑戦するステージを選ぶと、すぐに冒険が始まるよ', '旅支度・タイピング基礎', '日本語入力のままでもOK',
      '灯台をともして、ことば島へ渡る準備をしよう', '基礎クリア後、順に解放', 'クリア済み', 'まだ進めません',
      '今回の練習結果', '入力したキー', '得意なキー', '間違いやすいキー', '次のステージへ進む',
      '選んだ問題からステージの最後まで練習したよ', '旅はまだ続くよ。次のコースへ進もう',
      'キーボードを見ながらでも大丈夫。正しい指でゆっくり打ってね',
      'キーボードで位置を確認し、正しい指で正確に打とう', 'キーボードで位置を確認し、正しい指を上へ伸ばそう',
      'Pのすぐ右隣のキーを、Shiftを押さずに1回押してください',
      'OSが受け取った文字から判定します。物理キーボードの刻印とOS設定が違う場合は、OS側の解釈が表示されます',
      '判定できませんでした。Shiftを離して指定のキーを押すか、下から手動で選んでください',
      '判定結果', '刻印と表示が合っていますか？ 違う場合はここで修正できます', '現在の配列', '変更・再判定', 'これで使う',
    ]
    expect(labels.flatMap((label) => [...getUncoveredUIKanji(label)])).toEqual([])
  })
})
