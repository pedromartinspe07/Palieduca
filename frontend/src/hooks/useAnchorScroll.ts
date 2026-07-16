import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Detects the URL hash after navigation and scrolls to the matching element.
 * Usage: call useAnchorScroll() inside any page component.
 */
const useAnchorScroll = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (!hash) return;

        const id = hash.replace('#', '');

        // Allow time for the page to render before scrolling
        const timeout = setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Flash highlight for visibility
                el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all');
                setTimeout(() => el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [hash]);
};

export default useAnchorScroll;
