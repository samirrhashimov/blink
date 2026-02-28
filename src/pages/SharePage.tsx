import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShareLinkService } from '../services/shareLinkService';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import LoadingSkeleton from '../components/LoadingSkeleton';

const SharePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessShareLink = async () => {
            if (!token) {
                navigate('/');
                return;
            }

            try {
                setLoading(true);
                const shareLink = await ShareLinkService.getShareLinkByToken(token);

                if (!shareLink) {
                    toast.error(t('container.modals.shareLink.errors.loadFailed') || 'Invalid or expired share link');
                    navigate('/');
                    return;
                }

                // Increment use count
                await ShareLinkService.useShareLink(shareLink.id);

                // Store permission or other metadata in session if needed?
                // Actually, for now, just redirect to the container page
                // The container page needs to know that this is a public access
                navigate(`/container/${shareLink.containerId}`);
            } catch (err: any) {
                console.error('Error accessing share link:', err);
                toast.error(err.message || 'Failed to access share link');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        accessShareLink();
    }, [token, navigate, toast, t]);

    if (loading) {
        return <LoadingSkeleton variant="fullscreen" />;
    }

    return null;
};

export default SharePage;
