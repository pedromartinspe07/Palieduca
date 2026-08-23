export type SearchResultType = 
    | 'Módulo' 
    | 'Conceito' 
    | 'Glossário' 
    | 'Biblioteca' 
    | 'Apresentação' 
    | 'Página';

export interface SearchItem {
    id: string;
    title: string;
    description: string;
    type: SearchResultType;
    path: string; // includes route and optional hash/anchor
    keywords: string[]; // Rich synonyms, acronyms, and related medical/educational terms
    category?: string;
    badge?: string;
}

const CANONICAL_MODULES = [
    {
        id: 'fundamentos',
        title: 'Módulo 1 - Fundamentos',
        description: 'Conceitos, História, Princípios, Elegibilidade, Mitos e verdades sobre os cuidados paliativos.',
        keywords: [
            'historia dos cuidados paliativos', 'cicely saunders', 'st christophers hospice',
            'principios da oms', 'organizacao mundial da saude', 'elegibilidade',
            'mitos e verdades', 'filosofia paliativa', 'fim de vida', 'terminalidade',
            'paciente terminal', 'diagnostico ameacador a vida', 'qualidade de vida',
            'curativo versus paliativo', 'introducao', 'modulo 1'
        ]
    },
    {
        id: 'comunicacao',
        title: 'Módulo 2 - Comunicação',
        description: 'Comunicação terapêutica, Escuta ativa, Notícias difíceis e Relação com a família do paciente.',
        keywords: [
            'comunicacao terapeutica', 'protocolo spikes', 'mas noticias', 'noticias dificeis',
            'escuta ativa', 'relacao equipe paciente', 'relacao medico paciente',
            'enfermagem', 'empatia', 'acolhimento', 'conferencia familiar',
            'silencio terapeutico', 'comunicacao nao-violenta', 'cnv', 'modulo 2'
        ]
    },
    {
        id: 'sintomas',
        title: 'Módulo 3 - Controle de Sintomas',
        description: 'Manejo da Dor, Dispneia, Náuseas, Delirium, Fadiga e outras complicações.',
        keywords: [
            'manejo da dor', 'dor total', 'escala visual analogica', 'eva', 'dor cronica',
            'dor aguda', 'dor neuropatica', 'dor nociceptiva', 'opioides', 'morfina',
            'metadona', 'fentanil', 'codeina', 'tramadol', 'escada analgesica da oms',
            'dispneia', 'falta de ar', 'nauseas', 'vomitos', 'delirium', 'confusao mental',
            'fadiga', 'astenia', 'constipacao', 'obstrucao intestinal', 'hipodermoclise',
            'via subcutanea', 'controle de sintomas', 'modulo 3'
        ]
    },
    {
        id: 'cuidados-enfermagem',
        title: 'Módulo 4 - Cuidados de Enfermagem',
        description: 'Processo de Enfermagem, Diagnósticos, Intervenções e Planejamento.',
        keywords: [
            'processo de enfermagem', 'sae', 'sistematizacao da assistencia', 'nanda',
            'nic', 'noc', 'diagnosticos de enfermagem', 'intervencoes de enfermagem',
            'lesao por pressao', 'lpp', 'prevencao de ulceras', 'curativos',
            'higiene e conforto', 'banho no leito', 'cuidados com a pele',
            'cuidados com a boca', 'xerostomia', 'cuidados pos-morte', 'modulo 4'
        ]
    },
    {
        id: 'familia-cuidador',
        title: 'Módulo 5 - Família e Cuidador',
        description: 'Sobrecarga, Apoio familiar, Educação em saúde e o Luto antecipatório.',
        keywords: [
            'familia', 'cuidador principal', 'cuidador informal', 'sobrecarga do cuidador',
            'escala de zarit', 'burnout do cuidador', 'apoio familiar', 'luto antecipatorio',
            'fases do luto', 'educacao em saude', 'orientacao familiar', 'roda de conversa',
            'autocuidado', 'modulo 5'
        ]
    },
    {
        id: 'bioetica',
        title: 'Módulo 6 - Bioética',
        description: 'Autonomia, Beneficência, Não maleficência, Justiça e Diretivas antecipadas.',
        keywords: [
            'bioetica clinica', 'principios da bioetica', 'autonomia do paciente',
            'beneficencia', 'nao-maleficencia', 'justica distributiva',
            'diretivas antecipadas de vontade', 'dav', 'testamento vital',
            'procurador de saude', 'mandato duradouro', 'ortotanasia', 'morte digna',
            'distanasia', 'obstinacao terapeutica', 'futilidade medica',
            'eutanasia', 'suicidio assistido', 'sedacao paliativa', 'consentimento livre e esclarecido',
            'codigo de etica de enfermagem', 'modulo 6'
        ]
    }
];

const mapModulesToSearch = (): SearchItem[] => {
    return CANONICAL_MODULES.map(mod => ({
        id: `mod-${mod.id}`,
        title: mod.title,
        description: mod.description,
        type: 'Módulo',
        path: `/modulo/${mod.id}`,
        keywords: [
            mod.title.toLowerCase(),
            mod.description.toLowerCase(),
            ...mod.keywords
        ],
        category: 'Trilhas de Aprendizagem',
        badge: 'Trilha Oficial'
    }));
};

// Clinical concepts & Glossary search entries
const CLINICAL_CONCEPTS: SearchItem[] = [
    {
        id: 'cnc-dor-total',
        title: 'Dor Total (Cicely Saunders)',
        description: 'Conceito integrativo que compreende a dor em 4 dimensões inseparáveis: física, psicológica, social e espiritual.',
        type: 'Conceito',
        path: '/glossario#dor-total',
        keywords: ['dor total', 'cicely saunders', 'dimensao espiritual', 'dimensao social', 'dimensao psicologica', 'sofrimento humano', 'dor'],
        category: 'Fundamentos Clínicos',
        badge: 'Conceito Chave'
    },
    {
        id: 'cnc-spikes',
        title: 'Protocolo SPIKES (Comunicação de Más Notícias)',
        description: 'Metodologia estruturada em 6 etapas (Setting, Perception, Invitation, Knowledge, Emotions, Strategy) para comunicar diagnósticos e prognósticos difíceis.',
        type: 'Conceito',
        path: '/modulo/comunicacao',
        keywords: ['spikes', 'protocolo spikes', 'mas noticias', 'comunicacao de mas noticias', 'setting', 'perception', 'invitation', 'knowledge', 'emotions', 'strategy'],
        category: 'Comunicação',
        badge: 'Protocolo Clínico'
    },
    {
        id: 'cnc-dav',
        title: 'Diretivas Antecipadas de Vontade (DAV / Testamento Vital)',
        description: 'Documento no qual o paciente manifesta antecipadamente suas preferências sobre tratamentos e cuidados que deseja ou não receber caso fique incapacitado.',
        type: 'Conceito',
        path: '/modulo/bioetica',
        keywords: ['dav', 'diretivas antecipadas', 'testamento vital', 'autonomia', 'procurador de cuidados', 'vontade do paciente', 'decisao antecipada'],
        category: 'Bioética e Legislação',
        badge: 'Bioética'
    },
    {
        id: 'cnc-ortotanasia',
        title: 'Ortotanásia, Distanásia e Eutanásia',
        description: 'Diferenciação bioética: Ortotanásia (morte no seu tempo natural sem obstinação), Distanásia (prolongamento doloroso e inútil) e Eutanásia (ato deliberado de abreviar a vida).',
        type: 'Conceito',
        path: '/modulo/bioetica',
        keywords: ['ortotanasia', 'distanasia', 'eutanasia', 'obstinacao terapeutica', 'futilidade', 'morte natural', 'morte digna', 'limites terapeuticos'],
        category: 'Bioética e Legislação',
        badge: 'Conceito Chave'
    },
    {
        id: 'cnc-sedacao',
        title: 'Sedação Paliativa',
        description: 'Uso proporcional de medicamentos sedativos para diminuir a consciência do paciente com doença avançada com objetivo estrito de aliviar sintomas refratários insuportáveis.',
        type: 'Conceito',
        path: '/modulo/bioetica',
        keywords: ['sedacao paliativa', 'sintoma refratario', 'midazolam', 'alivio de sofrimento', 'proporcionalidade', 'fim de vida'],
        category: 'Controle de Sintomas',
        badge: 'Prática Clínica'
    },
    {
        id: 'cnc-hipodermoclise',
        title: 'Hipodermóclise (Via Subcutânea)',
        description: 'Infusão contínua ou intermitente de fluidos e medicamentos no tecido celular subcutâneo, técnica minimamente invasiva segura para pacientes em cuidados paliativos.',
        type: 'Conceito',
        path: '/modulo/sintomas',
        keywords: ['hipodermoclise', 'via subcutanea', 'infusao subcutanea', 'agulha borboleta', 'cateter', 'medicacao subcutanea', 'hidratacao'],
        category: 'Procedimentos e Técnicas',
        badge: 'Procedimento'
    },
    {
        id: 'cnc-escalas',
        title: 'Escalas de Avaliação (EVA, PPS, ESAS, Zarit)',
        description: 'Instrumentos validados para mensuração da intensidade da dor (EVA), funcionalidade global (PPS/Karnofsky), sintomas múltiplos (ESAS) e sobrecarga do cuidador (Zarit).',
        type: 'Biblioteca',
        path: '/biblioteca',
        keywords: ['escalas', 'eva', 'escala visual analogica', 'pps', 'palliative performance scale', 'esas', 'edmonton', 'zarit', 'kps', 'karnofsky', 'mensuracao'],
        category: 'Instrumentos Clínicos',
        badge: 'Escalas Validadas'
    },
    {
        id: 'cnc-luto',
        title: 'Luto Antecipatório e Acolhimento Familiar',
        description: 'Processo de elaboração psíquica do luto vivenciado por familiares e pacientes antes da morte física, essencial para prevenir o luto complicado.',
        type: 'Conceito',
        path: '/modulo/familia-cuidador',
        keywords: ['luto', 'luto antecipatorio', 'luto complicado', 'familia', 'perda', 'elaboracao', 'apoio emocional', 'acolhimento'],
        category: 'Apoio Psicossocial',
        badge: 'Apoio Familiar'
    }
];

const CANONICAL_PRESENTATION = [
    {
        id: "publico-alvo",
        title: "Público-alvo",
        description: "Estudantes, Professores e Profissionais de Enfermagem em busca de evolução e metodologias ativas."
    },
    {
        id: "fundamentacao",
        title: "Fundamentação Teórica (Vygotsky e Falkembach)",
        description: "Teoria Histórico-Cultural da mediação (Vygotsky) e modelo estruturante de ambientes de aprendizagem (Falkembach)."
    },
    {
        id: "equipe",
        title: "Equipe Responsável",
        description: "Conheça Patricia Andrade (idealizadora), Pedro Martins e Carlos Eduardo, a equipe criadora do PaliEduca."
    }
];

// Presentation sections
const mapPresentationToSearch = (): SearchItem[] => {
    return CANONICAL_PRESENTATION.map(section => ({
        id: `apr-${section.id}`,
        title: section.title,
        description: section.description,
        type: 'Apresentação',
        path: `/apresentacao#${section.id}`,
        keywords: [
            section.title.toLowerCase(),
            section.description.toLowerCase(),
            'apresentacao', 'proposta pedagogica', 'vygotsky', 'falkembach', 'patricia andrade', 'pedro martins', 'carlos eduardo', 'equipe'
        ],
        category: 'Institucional',
        badge: 'PaliEduca'
    }));
};

// Direct pages navigation
const APP_PAGES: SearchItem[] = [
    {
        id: 'pg-modulos',
        title: 'Todos os Módulos de Aprendizagem',
        description: 'Explore a grade curricular completa com 6 módulos interativos, vídeos, quizzes e casos clínicos.',
        type: 'Página',
        path: '/modulos',
        keywords: ['modulos', 'cursos', 'aulas', 'conteudo', 'trilhas', 'estudo', 'licoes'],
        category: 'Navegação',
        badge: 'Navegação'
    },
    {
        id: 'pg-biblioteca',
        title: 'Biblioteca Virtual e Diretrizes Científicas',
        description: 'Acesse manuais do Ministério da Saúde, ANCP, diretrizes de cuidados paliativos e escalas clínicas.',
        type: 'Biblioteca',
        path: '/biblioteca',
        keywords: ['biblioteca', 'artigos', 'manuais', 'diretrizes', 'livros', 'ancp', 'ministerio da saude', 'pdf', 'leituras'],
        category: 'Acervo Científico',
        badge: 'Biblioteca'
    },
    {
        id: 'pg-glossario',
        title: 'Glossário Humanizado de Termos',
        description: 'Dicionário com termos técnicos, conceitos bioéticos e terminologias de cuidados paliativos.',
        type: 'Glossário',
        path: '/glossario',
        keywords: ['glossario', 'dicionario', 'termos', 'conceitos', 'definicoes', 'vocabulario', 'significados'],
        category: 'Referência',
        badge: 'Glossário'
    },
    {
        id: 'pg-perfil',
        title: 'Meu Perfil e Desempenho do Aluno',
        description: 'Visualize suas estatísticas de estudo, módulos concluídos, certificados emitidos e histórico.',
        type: 'Página',
        path: '/perfil',
        keywords: ['perfil', 'minha conta', 'desempenho', 'progresso', 'certificados', 'aluno', 'estatisticas'],
        category: 'Área do Aluno',
        badge: 'Conta'
    }
];

// Base static search items
export const BASE_SEARCH_DATA: SearchItem[] = [
    ...mapModulesToSearch(),
    ...CLINICAL_CONCEPTS,
    ...mapPresentationToSearch(),
    ...APP_PAGES
];

// Dynamic items parsed from CMS / Database
let dynamicCMSItems: SearchItem[] = [];

// Helper to strip HTML tags from rich text blocks
export const stripHtml = (html: string): string => {
    return (html || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Parses CMS pages (Glossary, Library, Module blocks, etc.) and backend Modules
 * into searchable items that update in real-time as users edit via CMS.
 */
export const parseCMSPagesToSearchItems = (pages: any[] = [], modules: any[] = []): SearchItem[] => {
    const dynamicResults: SearchItem[] = [];
    const moduleMap: Record<string, string> = {};

    // 1. Index Modules from DB / CMS
    if (Array.isArray(modules)) {
        for (const mod of modules) {
            moduleMap[mod.slug_id] = mod.title;
            dynamicResults.push({
                id: `cms-mod-${mod.slug_id || mod.id}`,
                title: mod.title,
                description: mod.description || 'Módulo de aprendizagem em cuidados paliativos.',
                type: 'Módulo',
                path: `/modulo/${mod.slug_id}`,
                keywords: [
                    mod.title,
                    mod.description || '',
                    mod.resources || '',
                    mod.slug_id,
                    'modulo', 'trilha', 'aula', 'curso'
                ],
                category: 'Trilhas de Aprendizagem',
                badge: 'Módulo'
            });
        }
    }

    // 2. Parse CMS Pages
    if (Array.isArray(pages)) {
        for (const page of pages) {
            if (!page || !page.content) continue;

            let blocks: any[] = [];
            try {
                blocks = JSON.parse(page.content);
            } catch {
                blocks = [];
            }

            if (!Array.isArray(blocks)) continue;

            // Page: GLOSSÁRIO -> Extracts all dynamic Glossary terms
            if (page.page_name === 'glossario') {
                for (const block of blocks) {
                    if (block.type === 'GlossaryBlock' && block.data?.terms) {
                        for (const term of block.data.terms) {
                            if (!term || !term.term) continue;
                            dynamicResults.push({
                                id: `cms-glossary-${term.id || term.term}`,
                                title: term.term,
                                description: `${term.definition || 'Conceito cadastrado no glossário.'}${term.example ? ` Exemplo: ${term.example}` : ''}`,
                                type: 'Glossário',
                                path: `/glossario#${encodeURIComponent(term.term)}`,
                                keywords: [
                                    term.term,
                                    term.category || '',
                                    term.definition || '',
                                    term.example || '',
                                    'glossario', 'termo', 'conceito', 'definicao', 'paliativo'
                                ],
                                category: term.category || 'Termos do Glossário',
                                badge: 'Glossário'
                            });
                        }
                    }
                }
            }

            // Page: BIBLIOTECA -> Extracts all dynamic Library items
            else if (page.page_name === 'biblioteca') {
                for (const block of blocks) {
                    if (block.type === 'LibraryBlock' && block.data?.items) {
                        for (const item of block.data.items) {
                            if (!item || !item.title) continue;
                            dynamicResults.push({
                                id: `cms-lib-${item.id || item.title}`,
                                title: item.title,
                                description: `${item.description || 'Material disponível na biblioteca.'}${item.author ? ` • Autor: ${item.author}` : ''}${item.year ? ` (${item.year})` : ''}`,
                                type: 'Biblioteca',
                                path: `/biblioteca`,
                                keywords: [
                                    item.title,
                                    item.author || '',
                                    item.category || '',
                                    item.type || '',
                                    item.description || '',
                                    'biblioteca', 'artigo', 'manual', 'diretriz', 'escala', 'pdf'
                                ],
                                category: item.category || 'Biblioteca Virtual',
                                badge: item.type || 'Biblioteca'
                            });
                        }
                    }
                }
            }

            // Page: MÓDULOS DE AULA (modulo_fundamentos, modulo_comunicacao, etc.)
            else if (page.page_name.startsWith('modulo_')) {
                const slug = page.page_name.replace('modulo_', '');
                const modTitle = moduleMap[slug] || `Módulo ${slug}`;

                for (const block of blocks) {
                    if (!block || !block.data) continue;

                    // Text blocks inside lessons
                    if (block.type === 'TextBlock' && block.data.content) {
                        const plain = stripHtml(block.data.content);
                        if (plain.length > 10) {
                            // Extract title if h1 or bold was used, or use first sentence
                            const matchHeading = block.data.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
                            const headingText = matchHeading ? stripHtml(matchHeading[1]) : '';
                            const displayTitle = headingText || `${modTitle}: Tópico`;

                            dynamicResults.push({
                                id: `cms-mod-txt-${page.page_name}-${block.id}`,
                                title: displayTitle,
                                description: plain.length > 180 ? plain.substring(0, 180) + '...' : plain,
                                type: 'Módulo',
                                path: `/modulo/${slug}`,
                                keywords: [
                                    plain,
                                    headingText,
                                    slug,
                                    modTitle,
                                    'modulo', 'aula', 'leitura', 'topico'
                                ],
                                category: modTitle,
                                badge: 'Conteúdo da Aula'
                            });
                        }
                    }

                    // Quiz blocks inside lessons
                    if (block.type === 'QuizBlock' && block.data.question) {
                        dynamicResults.push({
                            id: `cms-quiz-${block.id}`,
                            title: `Quiz: ${block.data.question}`,
                            description: `Atividade avaliativa do ${modTitle}.`,
                            type: 'Módulo',
                            path: `/modulo/${slug}`,
                            keywords: [block.data.question, modTitle, 'quiz', 'pergunta', 'exercicio', 'teste'],
                            category: modTitle,
                            badge: 'Quiz'
                        });
                    }

                    // Case Study blocks
                    if (block.type === 'CaseStudyBlock' && block.data.title) {
                        dynamicResults.push({
                            id: `cms-case-${block.id}`,
                            title: `Caso Clínico: ${block.data.title}`,
                            description: block.data.summary || block.data.description || `Estudo de caso clínico em ${modTitle}.`,
                            type: 'Módulo',
                            path: `/modulo/${slug}`,
                            keywords: [block.data.title, block.data.summary || '', modTitle, 'caso clinico', 'simulacao'],
                            category: modTitle,
                            badge: 'Caso Clínico'
                        });
                    }
                }
            }
        }
    }

    return dynamicResults;
};

/**
 * Updates the in-memory dynamic search index with CMS items
 */
export const updateDynamicSearchIndex = (pages: any[] = [], modules: any[] = []) => {
    const cmsItems = parseCMSPagesToSearchItems(pages, modules);
    dynamicCMSItems = cmsItems;
};

/**
 * Returns all search items (Static + Dynamic CMS items merged)
 * Deduplicates by unique ID or matching path & title
 */
export const getAllSearchData = (): SearchItem[] => {
    const seen = new Set<string>();
    const combined: SearchItem[] = [];

    // 1. Dynamic CMS items first (so user CMS edits have highest priority)
    for (const item of dynamicCMSItems) {
        const key = `${item.type}-${item.title.toLowerCase().trim()}`;
        if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
        }
    }

    // 2. Base static fallback items
    for (const item of BASE_SEARCH_DATA) {
        const key = `${item.type}-${item.title.toLowerCase().trim()}`;
        if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
        }
    }

    return combined;
};

// Normalizer: removes accents, converts to lowercase, trims whitespace
export const normalizeText = (text: string): string => {
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

// Common Portuguese stop words to ignore when searching multiple words
const STOP_WORDS = new Set([
    'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas',
    'por', 'para', 'pra', 'com', 'sem',
    'e', 'ou', 'a', 'o', 'as', 'os',
    'um', 'uma', 'uns', 'umas',
    'que', 'se', 'ao', 'aos', 'sobre'
]);

export interface ScoredSearchResult {
    item: SearchItem;
    score: number;
    matchedTokens: string[];
}

/**
 * Intelligent Multi-Word Tolerant Search Algorithm
 * Runs against the full combined database (Static + Real-time CMS items)
 */
export const searchContent = (rawQuery: string, customDataset?: SearchItem[]): ScoredSearchResult[] => {
    const cleanQuery = rawQuery.trim();
    if (cleanQuery.length < 2) return [];

    const normalizedFullQuery = normalizeText(cleanQuery);
    
    // Split into individual words/tokens
    const allTokens = normalizedFullQuery
        .split(/[\s,.;:+\-_/]+/)
        .filter(token => token.length > 0);

    if (allTokens.length === 0) return [];

    // Filter out short stop words if there are multiple tokens
    const searchTokens = allTokens.length > 1
        ? allTokens.filter(t => !STOP_WORDS.has(t) && t.length > 1)
        : allTokens;

    const activeTokens = searchTokens.length > 0 ? searchTokens : allTokens;

    const dataset = customDataset || getAllSearchData();
    const scoredResults: ScoredSearchResult[] = [];

    for (const item of dataset) {
        const normTitle = normalizeText(item.title);
        const normDesc = normalizeText(item.description);
        const normType = normalizeText(item.type);
        const normCategory = normalizeText(item.category || '');
        const normKeywords = (item.keywords || []).map(normalizeText);

        let score = 0;
        const matchedTokens: string[] = [];

        // 1. Exact full query matches (highest priority)
        if (normTitle === normalizedFullQuery) {
            score += 200;
        } else if (normTitle.startsWith(normalizedFullQuery)) {
            score += 120;
        } else if (normTitle.includes(normalizedFullQuery)) {
            score += 80;
        }

        if (normKeywords.some(k => k === normalizedFullQuery)) {
            score += 90;
        } else if (normKeywords.some(k => k.includes(normalizedFullQuery))) {
            score += 45;
        }

        if (normDesc.includes(normalizedFullQuery)) {
            score += 35;
        }

        // 2. Token-by-token scoring
        let tokensMatchedCount = 0;

        for (const token of activeTokens) {
            let tokenScore = 0;

            // Match in Title
            if (normTitle === token) {
                tokenScore += 50;
            } else if (normTitle.startsWith(token)) {
                tokenScore += 30;
            } else if (normTitle.split(/\s+/).some(w => w === token)) {
                tokenScore += 35;
            } else if (normTitle.includes(token)) {
                tokenScore += 20;
            }

            // Match in Keywords (synonyms, acronyms)
            for (const kw of normKeywords) {
                if (kw === token) {
                    tokenScore += 30;
                    break;
                } else if (kw.includes(token)) {
                    tokenScore += 16;
                    break;
                }
            }

            // Match in Description
            if (normDesc.includes(token)) {
                tokenScore += 12;
            }

            // Match in Type or Category
            if (normType.includes(token) || normCategory.includes(token)) {
                tokenScore += 10;
            }

            if (tokenScore > 0) {
                score += tokenScore;
                tokensMatchedCount++;
                if (!matchedTokens.includes(token)) {
                    matchedTokens.push(token);
                }
            }
        }

        // 3. Multi-token Bonus: If all search terms match this item, give strong bonus
        if (activeTokens.length > 1 && tokensMatchedCount === activeTokens.length) {
            score += 60;
        } else if (activeTokens.length > 1 && tokensMatchedCount >= 2) {
            score += 25;
        }

        // 4. Boost CMS-generated Glossary & Module content
        if (item.badge === 'Glossário' || item.badge === 'Conteúdo da Aula') {
            score += 15;
        }

        // Only include results that actually matched the search
        if (score > 0 && matchedTokens.length > 0) {
            scoredResults.push({
                item,
                score,
                matchedTokens
            });
        }
    }

    // Sort descending by score
    return scoredResults.sort((a, b) => b.score - a.score);
};
