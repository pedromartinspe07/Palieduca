import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
}

const DEFAULT_SEO = {
    title: 'PaliEduca — Ensino de Cuidados Paliativos em Enfermagem (UFPB)',
    description: 'Plataforma educacional oficial da Universidade Federal da Paraíba (UFPB) para capacitação humanizada em Cuidados Paliativos, manejo de sintomas, bioética e apoio familiar.',
    keywords: 'cuidados paliativos, enfermagem paliativa, UFPB, manejo da dor, bioética, acolhimento, luto, Patricia Andrade',
    ogImage: 'https://palieduca.com.br/banner-og.png'
};

const ROUTE_SEO_MAP: Record<string, { title: string; description: string }> = {
    '/': {
        title: 'PaliEduca — Início | Formação em Cuidados Paliativos UFPB',
        description: 'Conheça o PaliEduca: plataforma educacional interativa de Cuidados Paliativos em Enfermagem da Universidade Federal da Paraíba.'
    },
    '/apresentacao': {
        title: 'Apresentação Institucional & Metodologia | PaliEduca UFPB',
        description: 'Conheça a coordenação docente da Prof.ª Patrícia Maria de Oliveira Andrade e as bases pedagógicas baseadas em Vygotsky.'
    },
    '/modulos': {
        title: 'Trilhas de Aprendizagem & Módulos | PaliEduca UFPB',
        description: 'Acesse os 6 módulos completos: Fundamentos, Comunicação Compassiva, Manejo de Sintomas, Cuidados de Enfermagem, Família e Bioética.'
    },
    '/comunidade': {
        title: 'Comunidade & Fórum de Casos Clínicos | PaliEduca UFPB',
        description: 'Participe de discussões de casos clínicos reais, tire dúvidas sobre condutas farmacológicas e troque experiências de humanização.'
    },
    '/biblioteca': {
        title: 'Biblioteca Virtual & Acervo Científico | PaliEduca UFPB',
        description: 'Consulte diretrizes clínicas, escalas validadas, manuais e artigos de referência em Cuidados Paliativos.'
    },
    '/glossario': {
        title: 'Glossário Técnico de Termos Paliativos | PaliEduca UFPB',
        description: 'Consulte termos técnicos de cuidados paliativos de A a Z com definições claras e referenciadas.'
    },
    '/simulado': {
        title: 'Simulado Geral de Proficiência Clínica | PaliEduca UFPB',
        description: 'Teste seus conhecimentos em 10 questões avaliativas comentadas e conquiste o selo de proficiência da UFPB.'
    },
    '/validar': {
        title: 'Validação de Certificados Oficiais | PaliEduca UFPB',
        description: 'Verifique a autenticidade e validade acadêmica de certificados e históricos emitidos pelo PaliEduca / UFPB.'
    },
    '/perfil': {
        title: 'Meu Painel do Aluno & Conquistas | PaliEduca UFPB',
        description: 'Acompanhe seu progresso de estudos, medalhas pedagógicas, níveis de XP e emissão de certificados oficiais de 40 horas.'
    }
};

export const SEOHead: React.FC<SEOProps> = ({ title, description, keywords, ogImage }) => {
    const location = useLocation();

    useEffect(() => {
        const routeData = ROUTE_SEO_MAP[location.pathname] || DEFAULT_SEO;
        const currentTitle = title || routeData.title || DEFAULT_SEO.title;
        const currentDesc = description || routeData.description || DEFAULT_SEO.description;
        const currentKeywords = keywords || DEFAULT_SEO.keywords;
        const currentImage = ogImage || DEFAULT_SEO.ogImage;

        // Atualiza título da aba
        document.title = currentTitle;

        // Atualiza meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', currentDesc);

        // Atualiza meta keywords
        let metaKeys = document.querySelector('meta[name="keywords"]');
        if (!metaKeys) {
            metaKeys = document.createElement('meta');
            metaKeys.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeys);
        }
        metaKeys.setAttribute('content', currentKeywords);

        // Atualiza OpenGraph
        const updateOgTag = (property: string, content: string) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        updateOgTag('og:title', currentTitle);
        updateOgTag('og:description', currentDesc);
        updateOgTag('og:image', currentImage);
        updateOgTag('og:url', window.location.href);

    }, [location.pathname, title, description, keywords, ogImage]);

    return null;
};

export default SEOHead;
