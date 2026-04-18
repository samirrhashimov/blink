import React, { useState, useRef, useEffect } from 'react';
import { useContainer } from '../contexts/ContainerContext';
import { X, UploadCloud, File as FileIcon, AlertCircle, CheckCircle2, Loader2, Tag, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { canUploadFile, getFileSizeLimit } from '../utils/plans';
import PlanGate from './PlanGate';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerId: string;
  containerColor?: string;
}

const AddFileModal: React.FC<AddFileModalProps> = ({ isOpen, onClose, containerId, containerColor }) => {
  const { t } = useTranslation();
  const { addLinkToContainer } = useContainer();
  const { currentUser } = useAuth();

  const userPlan = currentUser?.plan;
  const fileSizeLimitMB = getFileSizeLimit(userPlan);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const MAX_FILE_SIZE = fileSizeLimitMB * 1024 * 1024;

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // reset state when closed
      setFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setStatus('idle');
      setProgress(0);
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleAddTag = (text?: string) => {
    const rawInput = text !== undefined ? text : tagInput;
    const individualTags = rawInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "");

    setTags(prevTags => {
      const newTags = [...prevTags];
      individualTags.forEach(tag => {
        if (!newTags.includes(tag)) {
          newTags.push(tag);
        }
      });
      return newTags;
    });
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMsg(t('container.modals.addFile.errors.tooLarge', { size: '10MB' }));
      return false;
    }
    // We allow Cloudinary to handle other validations via Upload Preset,
    // but a basic client check is good.
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name);
    }
    setErrorMsg('');
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const calculateFormat = (filename: string, mimeType: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext) return ext;
    const mimeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'jpg',
      'image/png': 'png'
    };
    return mimeMap[mimeType] || 'file';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg(t('container.modals.addFile.errors.noFile'));
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setErrorMsg('Cloudinary environment variables missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(10); // Start progress

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'blink_assets'); // Organizes files in a specific folder
      formData.append('context', `original_filename=${file.name}`);

      // Use auto/upload to let Cloudinary determine resource type automatically
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<{ public_id: string, bytes: number, resource_type: string, secure_url: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            // Reserve 90-100% for the Firebase save process
            setProgress(Math.max(10, Math.min(85, percent)));
          }
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            console.error('Cloudinary Error:', xhr.responseText);
            reject(new Error('Upload to Cloudinary failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        
        xhr.open('POST', uploadUrl, true);
        xhr.send(formData);
      });

      const response = await uploadPromise;
      setProgress(90);

      // Save metadata and the direct SECURE URL to Firebase
      // No need for a separate signed URL function anymore
      await addLinkToContainer(containerId, {
        title: title || file.name,
        url: response.secure_url, // Direct link
        type: 'file',
        description: description,
        tags: tags,
        fileData: {
          originalName: file.name,
          publicId: response.public_id,
          format: calculateFormat(file.name, file.type),
          bytes: response.bytes,
          resourceType: response.resource_type
        }
      });

      setProgress(100);
      setStatus('success');
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || t('container.modals.addFile.errors.failed'));
    }
  };

  if (!isOpen) return null;

  // Plan check: Starter users cannot upload files
  if (!canUploadFile(userPlan)) {
    return (
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ '--primary': containerColor } as React.CSSProperties}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{t('container.modals.addFile.title', 'Upload File')}</h2>
            <button onClick={onClose} className="modal-close">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="modal-body" style={{ padding: '24px' }}>
            <PlanGate requiredPlan="pro">
              {/* This is never rendered but keeps PlanGate happy */}
              <span />
            </PlanGate>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={() => status !== 'uploading' && onClose()}
      style={{ '--primary': containerColor } as React.CSSProperties}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('container.modals.addFile.title', 'Upload File')}</h2>
          <button onClick={() => status !== 'uploading' && onClose()} className="modal-close" disabled={status === 'uploading'}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form id="add-file-form" onSubmit={handleSubmit} className="modal-body">
          {errorMsg && (
            <div className="error-message flex gap-2 items-center">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {/* Drag & Drop Area */}
          {!file && status !== 'uploading' && status !== 'success' && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging ? 'border-primary bg-[rgba(var(--primary-rgb),0.05)]' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: '200px' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                // Optional: accept=".pdf,.doc,.docx" depending on preferences
              />
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] mb-2">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="font-medium text-[var(--text-main)]">{t('container.modals.addFile.dragDrop', 'Click or drag file to this area')}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{t('container.modals.addFile.limits', 'PDF, DOC, Images (Max 10MB)')}</p>
              </div>
            </div>
          )}

          {/* Selected File / Progress State */}
          {(file || status === 'uploading' || status === 'success') && (
            <div className="mb-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[rgba(var(--bg-secondary-rgb),0.5)]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                   <FileIcon size={20} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">{file?.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                  </span>
                </div>
                {status === 'idle' && (
                  <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-[var(--bg-hover)] rounded-md text-[var(--text-secondary)] transition-colors">
                    <X size={16} />
                  </button>
                )}
                {status === 'uploading' && <Loader2 size={18} className="animate-spin text-primary" />}
                {status === 'success' && <CheckCircle2 size={18} className="text-green-500" />}
              </div>

              {/* Progress Bar */}
              {(status === 'uploading' || status === 'success') && (
                <div className="w-full bg-[var(--border-color)] rounded-full h-1.5 mt-3 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out ${status === 'success' ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="form-group mt-4">
            <label htmlFor="title" className="form-label">
              {t('container.modals.addFile.fileTitle', 'Title')} *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder={t('container.modals.addFile.placeholders.title', 'File Name')}
              disabled={status !== 'idle'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('container.modals.addFile.description', 'Description')}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-none"
              rows={3}
              placeholder={t('container.modals.addFile.placeholders.description', 'Add a short description')}
              disabled={status !== 'idle'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              {t('container.modals.addLink.tags', 'Tags')}
            </label>
            <div className="tags-input-wrapper">
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="remove-tag" disabled={status !== 'idle'}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-field-wrapper">
                <div className="tag-input-icon">
                  <Tag size={16} />
                </div>
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.endsWith(',')) {
                      handleAddTag(value);
                    } else {
                      setTagInput(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="form-input tag-input-padding"
                  placeholder={t('container.modals.addLink.placeholders.tags', 'Add tags separated by commas')}
                  disabled={status !== 'idle'}
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="tag-add-btn"
                  title={t('container.modals.addLink.tooltips.addTag')}
                  disabled={status !== 'idle'}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'uploading'}
            className="btn-cancel"
          >
            {t('common.buttons.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            form="add-file-form"
            disabled={status !== 'idle' || !file}
            className="btn-primary flex items-center gap-2"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                {t('container.modals.addFile.buttons.uploading', 'Uploading...')}
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                 {t('container.modals.addFile.buttons.success', 'Uploaded')}
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                {t('container.modals.addFile.buttons.upload', 'Upload File')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;
