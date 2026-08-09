export type FullscreenDocument = Pick<Document, 'documentElement' | 'fullscreenElement' | 'fullscreenEnabled' | 'addEventListener' | 'removeEventListener' | 'exitFullscreen'>

export function isStandaloneDisplay(targetWindow: Pick<Window, 'matchMedia'> | undefined = typeof window === 'undefined' ? undefined : window, targetNavigator: Navigator | undefined = typeof navigator === 'undefined' ? undefined : navigator) {
  const navigatorWithStandalone = targetNavigator as (Navigator & { standalone?: boolean }) | undefined
  return Boolean(targetWindow?.matchMedia?.('(display-mode: standalone)').matches || navigatorWithStandalone?.standalone)
}

export function supportsFullscreen(targetDocument: FullscreenDocument | undefined = typeof document === 'undefined' ? undefined : document) {
  return Boolean(targetDocument?.fullscreenEnabled && typeof targetDocument.documentElement.requestFullscreen === 'function' && typeof targetDocument.exitFullscreen === 'function')
}

export async function setPageFullscreen(targetDocument: FullscreenDocument, active: boolean) {
  if (active) await targetDocument.documentElement.requestFullscreen()
  else await targetDocument.exitFullscreen()
}

export function subscribeFullscreenChange(targetDocument: FullscreenDocument, listener: () => void) {
  targetDocument.addEventListener('fullscreenchange', listener)
  return () => targetDocument.removeEventListener('fullscreenchange', listener)
}
