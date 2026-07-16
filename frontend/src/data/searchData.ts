import { MODULES_DATA, PRESENTATION_SECTIONS } from './siteContent';

export type SearchResultType = 'Módulo' | 'Apresentação';

export interface SearchItem {
    id: string;
    title: string;
    description: string;
    type: SearchResultType;
    path: string; // includes hash for deep-link scrolling
}

// Maps the canonical application content strictly into search items
const mapModulesToSearch = (): SearchItem[] => {
    return MODULES_DATA.map(mod => ({
        id: `mod-${mod.id}`,
        title: mod.title,
        description: mod.description,
        type: 'Módulo',
        path: `/#${mod.id}` // Resolves to home page with deep link identifier
    }));
};

const mapPresentationToSearch = (): SearchItem[] => {
    return PRESENTATION_SECTIONS.map(section => ({
        id: `apr-${section.id}`,
        title: section.title,
        description: section.description,
        type: 'Apresentação',
        path: `/apresentacao#${section.id}`
    }));
};

// True, synchronized search database based strictly on what's available
export const SEARCH_DATA: SearchItem[] = [
    ...mapModulesToSearch(),
    ...mapPresentationToSearch()
];
