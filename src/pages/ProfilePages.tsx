import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import type { CharacterStyle, UserProfile } from '../domain'
import type { Grade } from '../questions'
import { ADVENTURE_RANKS, type getAdventureRank } from '../ranks'
import { Explorer } from '../components/game/GameVisuals'
import { hasProfileSettingsChanged } from '../profileSettings'

export function ProfileCreator({ name, grade, character, error, onName, onGrade, onCharacter, onCreate }: { name: string; grade: Grade; character: CharacterStyle; error: string; onName: (value: string) => void; onGrade: (value: Grade) => void; onCharacter: (value: CharacterStyle) => void; onCreate: () => void }) {
  const grades: Grade[] = [1, 2, 3, 4, 5, 6]
  return <div className="profile-create-card"><span>あたらしい冒険者</span><h2>なまえを とうろく</h2><label><span>なまえ</span><input value={name} maxLength={12} onChange={(event) => onName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onCreate() }} placeholder="なまえを入力" autoComplete="off" /></label><div className="profile-grade-picker"><span>学年</span><div>{grades.map((value) => <button key={value} className={grade === value ? 'active' : ''} onClick={() => onGrade(value)}>{value}年</button>)}</div></div><div className="profile-character-picker"><span>冒険者</span><div><button className={character === 'girl' ? 'active' : ''} onClick={() => onCharacter('girl')}><span><Explorer variant="girl" /></span><b>ミナ</b></button><button className={character === 'boy' ? 'active' : ''} onClick={() => onCharacter('boy')}><span><Explorer variant="boy" /></span><b>ソラ</b></button></div></div>{error && <p className="profile-error">{error}</p>}<button className="profile-register-button" onClick={onCreate}>このなまえで はじめる　▶</button><small>パスワードは不要です。この端末の中だけに保存されます。</small></div>
}

type ReturningEntry = { profile: UserProfile; points: number; rank: ReturnType<typeof getAdventureRank> }

export function ProfileWelcomePage({ entries, creator, onSelect }: { entries: ReturningEntry[]; creator: ReactNode; onSelect: (profile: UserProfile) => void }) {
  const [creating, setCreating] = useState(false)
  if (creating) return <main className="profile-welcome"><div className="profile-welcome-sky" aria-hidden="true">☁️　　☀️　　☁️</div><section><button className="profile-create-back" onClick={() => setCreating(false)}>‹ ユーザー選択へ戻る</button><div className="profile-welcome-brand"><span>✨</span><div><small>あたらしい冒険の準備</small><h1>新しいユーザーを作る</h1><p>名前・学年・キャラクターを決めよう！</p></div></div>{creator}</section></main>
  return <main className="profile-welcome"><div className="profile-welcome-sky" aria-hidden="true">☁️　　☀️　　☁️</div><section><div className="profile-welcome-brand"><span>⌨</span><div><small>ことば島の</small><h1>冒険者をえらぶ</h1><p>ユーザーを選んで、冒険へ出発しよう！</p></div></div>{entries.length > 0 && <div className="returning-profiles"><h2>つづきから遊ぶ</h2><div>{entries.map(({ profile, points, rank }) => <button key={profile.id} onClick={() => onSelect(profile)}><span>{profile.characterStyle === 'girl' ? '👧' : '👦'}</span><div><b>{profile.name}</b><small>{profile.lastGrade}年生・{rank.icon} {rank.name}・{points.toLocaleString()} GP</small></div><em>▶</em></button>)}</div></div>}<button className="profile-new-user-button" onClick={() => setCreating(true)}>＋ 新しいユーザーを作る</button></section></main>
}

export type RankingEntry = { profile: UserProfile; points: number; rank: ReturnType<typeof getAdventureRank>; completed: number; discoveries: number }

function ProfileSettingsEditor({ profile, onSave, onSaved }: { profile: UserProfile; onSave: (settings: Pick<UserProfile, 'name' | 'lastGrade' | 'characterStyle'>) => string; onSaved: () => void }) {
  const [name, setName] = useState(profile.name)
  const [grade, setGrade] = useState(profile.lastGrade)
  const [character, setCharacter] = useState(profile.characterStyle)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const returnTimer = useRef<number | undefined>(undefined)
  const loadedProfileId = useRef(profile.id)
  const changed = hasProfileSettingsChanged(profile, { name, lastGrade: grade, characterStyle: character })
  useEffect(() => {
    if (loadedProfileId.current === profile.id) return
    loadedProfileId.current = profile.id
    setName(profile.name); setGrade(profile.lastGrade); setCharacter(profile.characterStyle); setMessage(''); setSaving(false)
  }, [profile.id, profile.name, profile.lastGrade, profile.characterStyle])
  useEffect(() => () => window.clearTimeout(returnTimer.current), [])
  const grades: Grade[] = [1, 2, 3, 4, 5, 6]
  const update = () => { setMessage(''); setSaving(false) }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!changed || saving) return
    setSaving(true)
    const result = onSave({ name, lastGrade: grade, characterStyle: character })
    setMessage(result)
    setSaving(false)
    if (result === '保存しました') returnTimer.current = window.setTimeout(onSaved, 800)
  }
  return <form className="profile-create-card profile-settings-card" onSubmit={submit}><span>プレイ中の冒険者</span><h2>設定を変更</h2><label><span>なまえ</span><input value={name} maxLength={12} onChange={(event) => { setName(event.target.value); update() }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /></label><div className="profile-grade-picker"><span>学年</span><div>{grades.map((value) => <button type="button" key={value} className={grade === value ? 'active' : ''} onClick={() => { setGrade(value); update() }}>{value}年</button>)}</div></div><div className="profile-character-picker"><span>冒険者</span><div><button type="button" className={character === 'girl' ? 'active' : ''} onClick={() => { setCharacter('girl'); update() }}><span><Explorer variant="girl" /></span><b>ミナ</b></button><button type="button" className={character === 'boy' ? 'active' : ''} onClick={() => { setCharacter('boy'); update() }}><span><Explorer variant="boy" /></span><b>ソラ</b></button></div></div><div className="profile-save-status" aria-live="polite">{message && <p className={message === '保存しました' ? 'profile-save-success' : 'profile-error'}>{message === '保存しました' ? '✓ 設定を保存しました。冒険画面へ戻ります' : message}</p>}</div><button type="submit" className="profile-register-button" disabled={!changed || saving}>{saving ? '保存中…' : changed ? '設定を保存' : '変更はありません'}</button><small>Enterキーでも保存できます。プレイ履歴は自動で保存されます。</small></form>
}

export function ProfileManagerPage({ entries, activeId, onBack, onSelect, onUpdate }: { entries: RankingEntry[]; activeId: string | null; onBack: () => void; onSelect: (profile: UserProfile) => void; onUpdate: (settings: Pick<UserProfile, 'name' | 'lastGrade' | 'characterStyle'>) => string }) {
  const activeProfile = entries.find((entry) => entry.profile.id === activeId)?.profile
  return <main className="profile-manager-page"><header className="catalog-topbar"><button className="catalog-back" onClick={onBack}>‹ 戻る</button><div className="brand"><span className="brand-mark">👥</span><div><strong>冒険者きりかえ</strong><small>この端末のユーザー</small></div></div><div className="catalog-overall"><b>{entries.length}</b>人登録</div></header><section className="profile-manager-layout"><div className="profile-ranking"><div className="profile-ranking-title"><span>🏆</span><div><h1>がんばりランキング</h1><p>この端末で遊んでいる冒険者の記録</p></div></div><div className="profile-ranking-list">{entries.map((entry, index) => <button className={entry.profile.id === activeId ? 'active' : ''} key={entry.profile.id} onClick={() => onSelect(entry.profile)}><strong>{index + 1}</strong><span>{entry.profile.characterStyle === 'girl' ? '👧' : '👦'}</span><div><b>{entry.profile.name}{entry.profile.id === activeId && <em>プレイ中</em>}</b><small>{entry.rank.icon} {entry.rank.name}・{entry.profile.lastGrade}年生</small><small>ステージ達成 {entry.completed}・図鑑 {entry.discoveries}種類</small><i><span style={{ width: `${entry.rank.progress}%` }} /></i></div><output>{entry.points.toLocaleString()}<small> GP</small></output></button>)}</div><div className="rank-guide">{ADVENTURE_RANKS.map((rank) => <span key={rank.name}>{rank.icon}<b>{rank.name}</b><small>{rank.min.toLocaleString()} GP〜</small></span>)}</div></div><div>{activeProfile && <ProfileSettingsEditor profile={activeProfile} onSave={onUpdate} onSaved={onBack} />}</div></section></main>
}
