import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'container' | 'fullscreen';
  count?: number;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({ variant = 'text', count = 1 }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'fullscreen':
        return (
          <div className="skeleton-fullscreen">
            <div className="skeleton-fullscreen__content">
              <div className="skeleton-fullscreen__logo">
                <div className="skeleton-box skeleton-box--circle"></div>
              </div>
              <div className="skeleton-fullscreen__grid">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="skeleton-fullscreen__card">
                    <div className="skeleton-box skeleton-box--rounded" style={{ height: '160px', marginBottom: '1rem' }}></div>
                    <div className="skeleton-box" style={{ width: '70%', height: '20px', marginBottom: '0.5rem' }}></div>
                    <div className="skeleton-box" style={{ width: '50%', height: '16px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'container':
        return (
          <div className="container-skeleton">
            <div className="skeleton-box skeleton-box--rounded" style={{ height: '180px', marginBottom: '1rem' }}></div>
            <div className="skeleton-box" style={{ width: '70%', height: '20px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton-box" style={{ width: '50%', height: '16px' }}></div>
          </div>
        );
      
      case 'card':
        return (
          <div className="card-skeleton">
            <div className="card-skeleton__header">
              <div className="skeleton-box skeleton-box--circle" style={{ width: '40px', height: '40px' }}></div>
              <div className="skeleton-box" style={{ width: '60%', height: '20px' }}></div>
            </div>
            <div className="skeleton-box" style={{ width: '100%', height: '16px', margin: '0.5rem 0' }}></div>
            <div className="skeleton-box" style={{ width: '80%', height: '16px' }}></div>
          </div>
        );
      
      case 'avatar':
        return <div className="skeleton-box skeleton-box--circle" style={{ width: '48px', height: '48px' }}></div>;
      
      case 'text':
      default:
        return <div className="skeleton-box" style={{ width: '100%', height: '16px' }}></div>;
    }
  };

  if (variant === 'fullscreen') {
    return renderSkeleton() as React.ReactElement;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ marginBottom: variant === 'container' ? '1.5rem' : '0.5rem' }}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
