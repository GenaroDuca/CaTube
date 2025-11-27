import React from 'react';
import './Loader.css';

const Loader = ({ isOverlay = false }) => {
    const containerClass = isOverlay ? 'loader-overlay' : 'loader-local';

    return (
        <div className={containerClass}>
            <div className="spinner"></div>
        </div>
    );
};

export default Loader;