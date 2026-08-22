import React from 'react';
import { 
    Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale, 
    BookOpen, Book, FileText, Sparkles, Lightbulb, Info, HelpCircle, 
    GraduationCap, Bookmark, Layers, MessageSquare, Activity, Award
} from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    Stethoscope,
    Users,
    HeartPulse,
    Brain,
    HeartHandshake,
    Scale,
    BookOpen,
    Book,
    FileText,
    Sparkles,
    Lightbulb,
    Info,
    HelpCircle,
    GraduationCap,
    Bookmark,
    Layers,
    MessageSquare,
    Activity,
    Award
};

export const getModuleIcon = (iconName?: string, size = 24, className = ''): React.ReactNode => {
    if (!iconName) return <BookOpen size={size} className={className} />;
    const IconComp = ICON_MAP[iconName] || BookOpen;
    return <IconComp size={size} className={className} />;
};
