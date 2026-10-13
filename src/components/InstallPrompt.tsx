import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setVisible(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !visible || !deferred) return null;

  return (
    <div className="install-banner" role="dialog" aria-label="Install app">
      <div className="install-banner-text">
        <strong>Install Fund Tracker</strong>
        <span>Add to your home screen for quick access</span>
      </div>
      <div className="install-banner-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            sessionStorage.setItem('pwa-install-dismissed', '1');
            setVisible(false);
          }}
        >
          Not now
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setVisible(false);
            setDeferred(null);
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
