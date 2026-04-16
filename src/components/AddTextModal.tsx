import React, { useState, useEffect, useRef } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import {
  X,
  FileText,
  Type,
  Eye,
  Edit3,
  Loader2,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Code,
  Quote,
  Heading1,
  Heading2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { FaMarkdown } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import type { Link } from '../types';

interface AddTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  containerColor?: string;
  editLink?: Link;
}

const AddTextModal: React.FC<AddTextModalProps> = ({ isOpen, onClose, containerId, containerColor, editLink }) => {
  const { t } = useTranslation();
  const { addLinkToContainer, updateLinkInContainer } = useContainer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (editLink) {
        setTitle(editLink.title || '');
        setContent(editLink.content || '');
      } else {
        setTitle('');
        setContent('');
      }
      setPreviewMode(false);
      setLoading(false);
      setError('');
    }
  }, [isOpen, editLink]);

  const insertFormat = (type: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selection = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        replacement = `**${selection || 'bold text'}**`;
        cursorOffset = selection ? 0 : 2;
        break;
      case 'italic':
        replacement = `*${selection || 'italic text'}*`;
        cursorOffset = selection ? 0 : 1;
        break;
      case 'link':
        replacement = `[${selection || 'link text'}](https://)`;
        cursorOffset = selection ? 3 : 1;
        break;
      case 'list':
        replacement = `\n- ${selection || 'list item'}`;
        break;
      case 'code':
        replacement = `\`${selection || 'code'}\``;
        break;
      case 'quote':
        replacement = `\n> ${selection || 'quote text'}`;
        break;
      case 'h1':
        replacement = `\n# ${selection || 'Heading 1'}`;
        break;
      case 'h2':
        replacement = `\n## ${selection || 'Heading 2'}`;
        break;
      default:
        break;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    // Re-focus and set cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = start + replacement.length - cursorOffset;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError(t('container.modals.addText.errors.required'));
      return;
    }

    try {
      setError('');
      setLoading(true);

      if (editLink) {
        await updateLinkInContainer(containerId, editLink.id, {
          title: title.trim(),
          content: content.trim()
        });
      } else {
        await addLinkToContainer(containerId, {
          title: title.trim(),
          content: content.trim(),
          url: '#text-note',
          type: 'text',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || t('container.modals.addText.errors.failed'));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`}
      onClick={onClose}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div
        className={`modal-content text-modal-content ${isFullscreen ? 'fullscreen-content' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-header ${isFullscreen ? 'fullscreen-header' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="modal-icon-container">
              <FileText size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="mb-0">
                {editLink ? t('container.modals.addText.editTitle') : t('container.modals.addText.title')}
              </h2>
              <p className="text-xs text-gray-500 mb-0">{t('container.modals.addText.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="modal-action-btn"
              type="button"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="modal-close" type="button">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body fullscreen-body">
          <div className="form-group-fullscreen">
            <div className="title-input-wrapper">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="fullscreen-title-input"
                placeholder={t('container.modals.addText.titlePlaceholder')}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="editor-container">
              <div className="editor-toolbar">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  <button type="button" onClick={() => insertFormat('h1')} className="toolbar-btn" title="Heading 1"><Heading1 size={18} /></button>
                  <button type="button" onClick={() => insertFormat('h2')} className="toolbar-btn" title="Heading 2"><Heading2 size={18} /></button>
                  <div className="toolbar-divider" />
                  <button type="button" onClick={() => insertFormat('bold')} className="toolbar-btn" title="Bold"><Bold size={18} /></button>
                  <button type="button" onClick={() => insertFormat('italic')} className="toolbar-btn" title="Italic"><Italic size={18} /></button>
                  <button type="button" onClick={() => insertFormat('code')} className="toolbar-btn" title="Code"><Code size={18} /></button>
                  <div className="toolbar-divider" />
                  <button type="button" onClick={() => insertFormat('list')} className="toolbar-btn" title="List"><List size={18} /></button>
                  <button type="button" onClick={() => insertFormat('quote')} className="toolbar-btn" title="Quote"><Quote size={18} /></button>
                  <button type="button" onClick={() => insertFormat('link')} className="toolbar-btn" title="Link"><LinkIcon size={18} /></button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${!previewMode ? 'bg-white dark:bg-gray-700 shadow-md text-primary font-semibold border-none' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
                      }`}
                  >
                    <Edit3 size={16} />
                    {t('container.modals.addText.buttons.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${previewMode ? 'bg-white dark:bg-gray-700 shadow-md text-primary font-semibold border-none' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
                      }`}
                  >
                    <Eye size={16} />
                    {t('container.modals.addText.buttons.preview')}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 mt-4 flex flex-col overflow-hidden">
                {error && <div className="error-message mb-4">{error}</div>}
                {!previewMode ? (
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="fullscreen-textarea"
                    placeholder={t('container.modals.addText.placeholder')}
                    disabled={loading}
                  />
                ) : (
                  <div className="fullscreen-preview-area markdown-view-body glass-card">
                    {content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 italic">
                        Nothing to preview yet...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer fullscreen-footer">
          <div className="fullscreen-footer-content">
            <div className="text-sm text-gray-500 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FaMarkdown size={24} style={{ opacity: 0.8 }} />
                <span className="font-semibold tracking-wide uppercase text-[10px]">Supported</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{content.length} characters</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary px-6"
              >
                {t('container.modals.addText.buttons.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-8 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {editLink ? t('container.modals.addText.buttons.updating') : t('container.modals.addText.buttons.adding')}
                  </>
                ) : (
                  <>
                    {editLink ? <Edit3 size={18} /> : <Type size={18} />}
                    {editLink ? t('container.modals.addText.buttons.update') : t('container.modals.addText.buttons.add')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTextModal;
