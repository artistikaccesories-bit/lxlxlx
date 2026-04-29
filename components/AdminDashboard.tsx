import React, { useEffect } from 'react';

const AdminDashboard: React.FC = () => {
    useEffect(() => {
        window.location.href = '/dashboard/index.html';
    }, []);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-white text-center">
                <div className="spinner mb-4 inline-block"></div>
                <p className="text-zinc-500 uppercase tracking-widest font-bold">Redirecting to Secure Admin Portal...</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
