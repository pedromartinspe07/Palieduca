import React from 'react';
import {
    Heart, HeartPulse, HeartHandshake, Stethoscope, Activity, Shield, ShieldCheck,
    Pill, Thermometer, Eye, Ear, Brain, Smile, Sparkles, Hospital,
    MessageSquare, MessageCircle, Users, User, UserCheck, HelpCircle, Phone, Mail,
    Share2, Globe, Compass, Megaphone,
    BookOpen, Book, GraduationCap, Award, Lightbulb, FileText, CheckCircle2, Target,
    Scale, Library, Search,
    Video, Play, Headphones, Mic, Music, Image as ImageIcon, Layers,
    Download, ExternalLink,
    Star, Flame, Zap, Clock, Calendar, BadgeCheck, Settings, AlertTriangle,
    Info, ArrowRight
} from 'lucide-react';

export interface IconItem {
    name: string;
    label: string;
    category: 'saude' | 'comunicacao' | 'educacao' | 'midia' | 'geral';
    keywords: string[];
    component: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

export const ICON_REGISTRY: Record<string, IconItem> = {
    // Saúde & Cuidados
    Heart: { name: 'Heart', label: 'Coração / Amor', category: 'saude', keywords: ['coração', 'amor', 'cuidado', 'afeto'], component: Heart },
    HeartPulse: { name: 'HeartPulse', label: 'Pulso / Sintomas', category: 'saude', keywords: ['pulso', 'sintomas', 'batimento', 'ecg', 'enfermagem'], component: HeartPulse },
    HeartHandshake: { name: 'HeartHandshake', label: 'Acolhimento / Suporte', category: 'saude', keywords: ['cuidado', 'apoio', 'acolhimento', 'paliativo', 'mãos'], component: HeartHandshake },
    Stethoscope: { name: 'Stethoscope', label: 'Estetoscópio / Médico', category: 'saude', keywords: ['médico', 'estetoscópio', 'clínica', 'consulta'], component: Stethoscope },
    Activity: { name: 'Activity', label: 'Atividade / Monitor', category: 'saude', keywords: ['atividade', 'vital', 'monitoramento', 'saúde'], component: Activity },
    Hospital: { name: 'Hospital', label: 'Hospital / Unidade', category: 'saude', keywords: ['hospital', 'unidade', 'clínica', 'centro'], component: Hospital },
    Pill: { name: 'Pill', label: 'Medicamento / Pílula', category: 'saude', keywords: ['remédio', 'medicamento', 'pílula', 'farmácia', 'dosagem'], component: Pill },
    Thermometer: { name: 'Thermometer', label: 'Termômetro / Exame', category: 'saude', keywords: ['termômetro', 'febre', 'temperatura', 'exame'], component: Thermometer },
    Brain: { name: 'Brain', label: 'Cérebro / Cognição', category: 'saude', keywords: ['cérebro', 'mente', 'cognição', 'neurologia', 'professores'], component: Brain },
    Smile: { name: 'Smile', label: 'Bem-estar / Alívio', category: 'saude', keywords: ['sorriso', 'alívio', 'bem-estar', 'conforto'], component: Smile },
    Sparkles: { name: 'Sparkles', label: 'Especial / Qualidade', category: 'saude', keywords: ['brilho', 'qualidade', 'especial', 'destaque'], component: Sparkles },
    Eye: { name: 'Eye', label: 'Visão / Observação', category: 'saude', keywords: ['olho', 'visão', 'olhar', 'observação'], component: Eye },
    Ear: { name: 'Ear', label: 'Escuta / Audição', category: 'saude', keywords: ['ouvido', 'escuta', 'atenção', 'ouvir'], component: Ear },

    // Comunicação & Pessoas
    MessageSquare: { name: 'MessageSquare', label: 'Comunicação / Chat', category: 'comunicacao', keywords: ['comunicação', 'conversa', 'chat', 'mensagem', 'diálogo'], component: MessageSquare },
    MessageCircle: { name: 'MessageCircle', label: 'Diálogo Empático', category: 'comunicacao', keywords: ['diálogo', 'empático', 'conversa', 'fala'], component: MessageCircle },
    Users: { name: 'Users', label: 'Família / Equipe', category: 'comunicacao', keywords: ['família', 'cuidador', 'equipe', 'pessoas', 'grupo', 'profissionais'], component: Users },
    User: { name: 'User', label: 'Paciente / Pessoa', category: 'comunicacao', keywords: ['paciente', 'pessoa', 'indivíduo', 'usuário'], component: User },
    UserCheck: { name: 'UserCheck', label: 'Profissional Aprovado', category: 'comunicacao', keywords: ['profissional', 'médico', 'enfermeiro', 'aprovado'], component: UserCheck },
    HelpCircle: { name: 'HelpCircle', label: 'Dúvidas / FAQ', category: 'comunicacao', keywords: ['ajuda', 'dúvida', 'faq', 'pergunta'], component: HelpCircle },
    Megaphone: { name: 'Megaphone', label: 'Aviso / Campanha', category: 'comunicacao', keywords: ['aviso', 'notícia', 'campanha', 'anúncio'], component: Megaphone },
    Globe: { name: 'Globe', label: 'Global / Comunidade', category: 'comunicacao', keywords: ['mundo', 'global', 'comunidade', 'rede'], component: Globe },
    Share2: { name: 'Share2', label: 'Compartilhar', category: 'comunicacao', keywords: ['compartilhar', 'social', 'divulgar'], component: Share2 },
    Mail: { name: 'Mail', label: 'E-mail / Contato', category: 'comunicacao', keywords: ['email', 'contato', 'carta', 'mensagem'], component: Mail },
    Phone: { name: 'Phone', label: 'Telefone / Chamada', category: 'comunicacao', keywords: ['telefone', 'ligação', 'urgência'], component: Phone },

    // Educação & Mente
    BookOpen: { name: 'BookOpen', label: 'Estudo / Estudantes', category: 'educacao', keywords: ['livro', 'estudo', 'estudantes', 'leitura', 'módulo'], component: BookOpen },
    Book: { name: 'Book', label: 'Manual / Diretriz', category: 'educacao', keywords: ['manual', 'diretriz', 'livro', 'guia'], component: Book },
    GraduationCap: { name: 'GraduationCap', label: 'Formação / Acadêmico', category: 'educacao', keywords: ['formação', 'diploma', 'universidade', 'acadêmico', 'curso'], component: GraduationCap },
    Scale: { name: 'Scale', label: 'Bioética / Justiça', category: 'educacao', keywords: ['bioética', 'ética', 'justiça', 'lei', 'balança', 'direitos'], component: Scale },
    Award: { name: 'Award', label: 'Certificado / Mérito', category: 'educacao', keywords: ['certificado', 'prêmio', 'mérito', 'conquista'], component: Award },
    Lightbulb: { name: 'Lightbulb', label: 'Ideia / Insight', category: 'educacao', keywords: ['ideia', 'insight', 'lâmpada', 'pensamento', 'dica'], component: Lightbulb },
    FileText: { name: 'FileText', label: 'Artigo / Caso Clínico', category: 'educacao', keywords: ['artigo', 'caso', 'clínico', 'texto', 'documento'], component: FileText },
    Target: { name: 'Target', label: 'Objetivos de Aprendizagem', category: 'educacao', keywords: ['objetivo', 'meta', 'alvo', 'foco'], component: Target },
    Compass: { name: 'Compass', label: 'Diretrizes / Guia', category: 'educacao', keywords: ['guia', 'orientação', 'bússola', 'caminho'], component: Compass },
    Library: { name: 'Library', label: 'Biblioteca / Acervo', category: 'educacao', keywords: ['biblioteca', 'acervo', 'materiais', 'livros'], component: Library },
    Search: { name: 'Search', label: 'Pesquisa / Evidência', category: 'educacao', keywords: ['pesquisa', 'busca', 'evidência', 'ciência'], component: Search },
    CheckCircle2: { name: 'CheckCircle2', label: 'Concluído / Sucesso', category: 'educacao', keywords: ['concluído', 'certo', 'sucesso', 'validação'], component: CheckCircle2 },

    // Mídia & Recursos
    Video: { name: 'Video', label: 'Vídeo / Videoaula', category: 'midia', keywords: ['vídeo', 'aula', 'gravação', 'filme'], component: Video },
    Play: { name: 'Play', label: 'Reproduzir / Assistir', category: 'midia', keywords: ['play', 'assistir', 'iniciar', 'reproduzir'], component: Play },
    Headphones: { name: 'Headphones', label: 'Podcast / Áudio', category: 'midia', keywords: ['podcast', 'áudio', 'fone', 'escuta'], component: Headphones },
    Mic: { name: 'Mic', label: 'Gravação de Voz', category: 'midia', keywords: ['microfone', 'fala', 'voz', 'gravação'], component: Mic },
    Music: { name: 'Music', label: 'Musicoterapia / Som', category: 'midia', keywords: ['música', 'som', 'terapia', 'harmonia'], component: Music },
    ImageIcon: { name: 'ImageIcon', label: 'Imagem / Infográfico', category: 'midia', keywords: ['imagem', 'foto', 'infográfico', 'gráfico'], component: ImageIcon },
    Layers: { name: 'Layers', label: 'Camadas / Módulos', category: 'midia', keywords: ['módulos', 'camadas', 'estruturas'], component: Layers },
    Download: { name: 'Download', label: 'Material para Baixar', category: 'midia', keywords: ['download', 'baixar', 'pdf', 'arquivo'], component: Download },
    ExternalLink: { name: 'ExternalLink', label: 'Link Externo', category: 'midia', keywords: ['link', 'externo', 'fonte', 'referência'], component: ExternalLink },

    // Gerais & Destaque
    Star: { name: 'Star', label: 'Estrela / Destaque', category: 'geral', keywords: ['estrela', 'destaque', 'favorito', 'top'], component: Star },
    Flame: { name: 'Flame', label: 'Prioridade / Fogo', category: 'geral', keywords: ['fogo', 'urgência', 'prioridade', 'destaque'], component: Flame },
    Zap: { name: 'Zap', label: 'Rápido / Energia', category: 'geral', keywords: ['energia', 'rápido', 'raio', 'potência'], component: Zap },
    Shield: { name: 'Shield', label: 'Segurança / Proteção', category: 'geral', keywords: ['segurança', 'proteção', 'escudo'], component: Shield },
    ShieldCheck: { name: 'ShieldCheck', label: 'Garantia Verificada', category: 'geral', keywords: ['garantia', 'verificado', 'confiável'], component: ShieldCheck },
    Clock: { name: 'Clock', label: 'Tempo / Duração', category: 'geral', keywords: ['tempo', 'relógio', 'horas', 'duração'], component: Clock },
    Calendar: { name: 'Calendar', label: 'Calendário / Cronograma', category: 'geral', keywords: ['calendário', 'data', 'cronograma', 'agendamento'], component: Calendar },
    BadgeCheck: { name: 'BadgeCheck', label: 'Certificação', category: 'geral', keywords: ['selo', 'qualidade', 'certificado'], component: BadgeCheck },
    Settings: { name: 'Settings', label: 'Configurações', category: 'geral', keywords: ['configuração', 'opções', 'ajustes'], component: Settings },
    Info: { name: 'Info', label: 'Informação Importante', category: 'geral', keywords: ['informação', 'aviso', 'detalhe'], component: Info },
    AlertTriangle: { name: 'AlertTriangle', label: 'Alerta / Atenção', category: 'geral', keywords: ['alerta', 'atenção', 'cuidado', 'aviso'], component: AlertTriangle },
    ArrowRight: { name: 'ArrowRight', label: 'Próximo / Avançar', category: 'geral', keywords: ['seta', 'avançar', 'próximo', 'iniciar'], component: ArrowRight }
};

interface RenderIconProps {
    name: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const RenderIcon: React.FC<RenderIconProps> = ({ name, size = 24, className = '', style }) => {
    const item = ICON_REGISTRY[name] || ICON_REGISTRY['Sparkles'];
    const IconComponent = item.component;
    return <IconComponent size={size} className={className} style={style} />;
};
