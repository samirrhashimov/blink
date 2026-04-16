import React from 'react';
import { X, FileText, Download, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = React.useState(false);

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
      className="modal-overlay"
      onClick={onClose}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className="modal-content view-text-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h2 className="line-clamp-1">{link.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="action-pill"
              title={copied ? "Copied!" : "Copy content"}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              onClick={handleDownload}
              className="action-pill"
              title="Download as .md"
            >
              <Download size={18} />
            </button>
            <button onClick={onClose} className="modal-close">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="modal-body markdown-view-body">
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
