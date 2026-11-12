import { useRef, type MouseEvent } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { cvFiles } from '../data/cv';

export default function CvDownload() {
  const { ui } = usePreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.current?.close();
    }
  }

  return (
    <>
      <button ref={trigger} id="cv-download" type="button" className="button button--primary" onClick={() => dialog.current?.showModal()}>
        {ui.downloadCv} <span aria-hidden="true">↓</span>
      </button>
      <dialog ref={dialog} className="cv-modal" aria-label="CV" onClick={closeOnBackdrop} onClose={() => trigger.current?.focus()}>
        <div className="cv-modal__options">
          <a className="button button--secondary" href="/cv/es.pdf" download={cvFiles.es} aria-label={ui.downloadSpanishCv} onClick={() => dialog.current?.close()}>[ES]</a>
          <a className="button button--secondary" href="/cv/en.pdf" download={cvFiles.en} aria-label={ui.downloadEnglishCv} onClick={() => dialog.current?.close()}>[EN]</a>
        </div>
      </dialog>
    </>
  );
}
