import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'vault';
  count?: number;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({ variant = 'text', count = 1 }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'vault':
        return (
          <div className="vault-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-text" style={{ width: '70%', marginTop: '1rem' }}></div>
          </div>
        );
      
      case 'card':
        return (
          <div className="card-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text" style={{ width: '60%' }}></div>
            </div>
            <div className="skeleton-text" style={{ width: '100%' }}></div>
            <div className="skeleton-text" style={{ width: '80%' }}></div>
          </div>
        );
      
      case 'avatar':
        return <div className="skeleton-avatar"></div>;
      
      case 'text':
      default:
        return <div className="skeleton-text"></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
