type AudioControlsProps = {
  bgmOn: boolean
  soundEffectsOn: boolean
  className?: string
  onBgmChange: (on: boolean) => void
  onSoundEffectsChange: (on: boolean) => void
}

export function AudioControls({ bgmOn, soundEffectsOn, className = '', onBgmChange, onSoundEffectsChange }: AudioControlsProps) {
  return <div className={`audio-controls ${className}`.trim()} role="group" aria-label="音の設定">
    <button type="button" className="audio-toggle" aria-label={`BGMを${bgmOn ? 'オフ' : 'オン'}にする`} aria-pressed={bgmOn} onClick={(event) => { event.stopPropagation(); onBgmChange(!bgmOn) }}><span aria-hidden="true">♫</span><b>BGM</b><small>{bgmOn ? 'ON' : 'OFF'}</small></button>
    <button type="button" className="audio-toggle" aria-label={`効果音を${soundEffectsOn ? 'オフ' : 'オン'}にする`} aria-pressed={soundEffectsOn} onClick={(event) => { event.stopPropagation(); onSoundEffectsChange(!soundEffectsOn) }}><span aria-hidden="true">♪</span><b>効果音</b><small>{soundEffectsOn ? 'ON' : 'OFF'}</small></button>
  </div>
}
