import React from 'react';
import PageEditor from '../components/cms/PageEditor';

const Editor: React.FC = () => {
    return (
        <main className="h-screen w-full pt-20 pb-0 bg-warm-50 flex flex-col overflow-hidden">
            <div className="flex-1 w-full h-full p-4 overflow-hidden">
                <PageEditor />
            </div>
        </main>
    );
};

export default Editor;
