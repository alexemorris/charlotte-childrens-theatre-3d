import type { JSX } from 'preact';
import { lightboxMedia } from '../../state/shell-store.ts';
import { Icon } from './icons.tsx';

/**
 * Enlarged Reference Lightbox Modal for physical 1:24 Model Box photos
 * and 1/4" = 1'-0" CAD Ground Plans.
 *
 * Bound to `lightboxMedia.value` in `shell-store.ts`.
 */
export function ReferenceLightboxModal(): JSX.Element | null {
  const media = lightboxMedia.value;
  if (!media) return null;

  const close = (): void => {
    lightboxMedia.value = null;
  };

  return (
    <div
      id="reference-lightbox-modal"
      class="shell-modal-backdrop shell-lightbox-backdrop"
      onClick={close}
    >
      <div
        class="shell-modal shell-glass shell-lightbox-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ref-lightbox-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header class="shell-modal-head ref-lightbox-header">
          <div class="ref-lightbox-title-wrap">
            <span id="ref-lightbox-badge" class="ref-lightbox-badge">
              {media.badge}
            </span>
            <h2 id="ref-lightbox-title" class="ref-lightbox-title">
              {media.title}
            </h2>
          </div>
          <button
            id="ref-lightbox-close-btn"
            type="button"
            class="shell-icon-btn"
            aria-label="Close reference viewer"
            title="Close (Esc)"
            onClick={close}
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div class="ref-lightbox-body">
          <img
            id="ref-lightbox-img"
            src={media.imgUrl}
            alt={media.title}
            class="ref-lightbox-img"
          />
        </div>
      </div>
    </div>
  );
}
