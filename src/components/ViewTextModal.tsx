import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Link as LinkType } from '../types';

interface ViewTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: LinkType | null;
  containerColor?: string;
}

const ViewTextModal: React.FC<ViewTextModalProps> = ({ isOpen, onClose, link, containerColor }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Always open in fullscreen on mobile
      if (window.innerWidth < 768) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    }
  }, [isOpen]);

  if (!isOpen || !link) return null;

  const handleCopy = () => {
    if (link.content) {
      navigator.clipboard.writeText(link.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (link.content) {
      const element = document.createElement("a");
      const file = new Blob([link.content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${link.title.replace(/\s+/g, '_').toLowerCase()}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div
      className={`modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`}
      onClick={onClose}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className={`modal-content view-text-modal-content ${isFullscreen ? 'fullscreen-content' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h2 className="line-clamp-1">{link.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="action-pill"
              title={copied ? t('container.modals.viewText.copied') : t('container.modals.viewText.copy')}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              onClick={handleDownload}
              className="action-pill mediaforbuttons"
              title={t('container.modals.viewText.download')}
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="action-pill mediaforbuttons"
              title={isFullscreen ? t('container.modals.viewText.minimize') : t('container.modals.viewText.fullscreen')}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} className="modal-close">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className={`modal-body markdown-view-body ${isFullscreen ? 'fullscreen-body' : ''}`}>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {link.content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTextModal;
