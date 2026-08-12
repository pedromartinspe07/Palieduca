import React from 'react';
import type { BlockProps } from './types';
import HeroBlock from './HeroBlock';
import ModulesGridBlock from './ModulesGridBlock';
import TextBlock from './TextBlock';
import SpacerBlock from './SpacerBlock';

const BlockRenderer: React.FC<BlockProps> = (props) => {
    switch (props.block.type) {
        case 'HeroBlock':
            return <HeroBlock {...props} />;
        case 'ModulesGridBlock':
            return <ModulesGridBlock {...props} />;
        case 'TextBlock':
            return <TextBlock {...props} />;
        case 'SpacerBlock':
            return <SpacerBlock {...props} />;
        default:
            return (
                <div className="p-4 border-2 border-dashed border-red-300 bg-red-50 text-red-700 rounded-xl m-4">
                    Bloco desconhecido: {props.block.type}
                </div>
            );
    }
};

export default BlockRenderer;
