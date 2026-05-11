import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <img src="/emisora.png" alt="Emisora Comunal del Cesar" height="28" className="mr-2" style={{ objectFit: 'contain' }} />
            <span className="font-medium ml-2" style={{ color: '#3a7d1e' }}>Emisora Comunal del Cesar</span>
        </div>
    );
};

export default AppFooter;
