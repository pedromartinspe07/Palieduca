import React from 'react';

const ModuleCardSkeleton: React.FC = () => {
    return (
        <div className="rounded-[2rem] overflow-hidden border border-warm-100 shadow-sm bg-white animate-pulse">
            {/* Image placeholder */}
            <div className="h-48 bg-warm-100" />

            <div className="p-6 space-y-4">
                {/* Progress bar */}
                <div className="h-2 bg-warm-100 rounded-full" />

                {/* Title */}
                <div className="space-y-2">
                    <div className="h-4 bg-warm-100 rounded-full w-3/4" />
                    <div className="h-4 bg-warm-100 rounded-full w-1/2" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-3 bg-warm-50 rounded-full" />
                    <div className="h-3 bg-warm-50 rounded-full w-5/6" />
                    <div className="h-3 bg-warm-50 rounded-full w-4/6" />
                </div>

                {/* Tags */}
                <div className="flex gap-2 pt-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-6 w-16 bg-warm-50 rounded-lg" />
                    ))}
                </div>

                {/* Button */}
                <div className="h-11 bg-warm-50 rounded-xl mt-2" />
            </div>
        </div>
    );
};

export default ModuleCardSkeleton;
