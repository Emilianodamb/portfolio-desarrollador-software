import { useRef, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export default function WhatsAppTab() {
  const { content: { profile }, ui } = usePreferences();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <aside className="whatsapp-tab" aria-label="WhatsApp" onKeyDown={(event) => {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }}>
      <button ref={trigger} id="whatsapp-tab-toggle" className="whatsapp-tab__trigger" type="button"
        aria-expanded={open} aria-controls="whatsapp-tab-panel" onClick={() => setOpen((previous) => !previous)}>
        <span>WhatsApp</span><span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id="whatsapp-tab-panel" className="whatsapp-tab__panel" hidden={!open}>
        <a className="whatsapp-tab__contact" href={profile.whatsapp} target="_blank" rel="noopener noreferrer">
          {ui.contactWhatsApp}
        </a>
      </div>
    </aside>
  );
}
