// Utilitário para gerenciamento de progresso e respostas do Modo Visitante

const GUEST_ID_KEY = 'palieduca_guest_id';
const GUEST_COMPLETED_ACTIVITIES_KEY = 'palieduca_guest_completed_activities';
const GUEST_QUIZ_ANSWERS_KEY = 'palieduca_guest_quiz_answers';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

/**
 * Retorna ou gera um identificador único de visitante para este navegador/dispositivo
 */
export const getGuestId = (): string => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            guestId = 'guest_' + crypto.randomUUID();
        } else {
            guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        }
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
};

/**
 * Retorna as atividades concluídas pelo visitante a partir do localStorage
 */
export const getGuestCompletedActivities = (): Set<string> => {
    try {
        const raw = localStorage.getItem(GUEST_COMPLETED_ACTIVITIES_KEY);
        if (!raw) return new Set();
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
        return new Set();
    }
};

/**
 * Salva a lista de atividades concluídas pelo visitante no localStorage
 */
export const setGuestCompletedActivities = (activities: Set<string> | string[]): void => {
    try {
        const arr = Array.from(activities);
        localStorage.setItem(GUEST_COMPLETED_ACTIVITIES_KEY, JSON.stringify(arr));
    } catch (e) {
        console.warn('Erro ao salvar atividades do visitante no localStorage:', e);
    }
};

/**
 * Alterna a conclusão de uma atividade para o visitante
 */
export const toggleGuestActivityLocal = (activityId: string, completed: boolean): Set<string> => {
    const set = getGuestCompletedActivities();
    if (completed) {
        set.add(activityId);
    } else {
        set.delete(activityId);
    }
    setGuestCompletedActivities(set);
    return set;
};

export interface StoredQuizAnswer {
    selectedOption: number;
    isCorrect: boolean;
    submitted: boolean;
    moduleSlug?: string;
}

/**
 * Retorna as respostas salvas para um bloco de quiz específico
 */
export const getGuestQuizAnswersForBlock = (blockId: string): Record<number, StoredQuizAnswer> => {
    try {
        const raw = localStorage.getItem(GUEST_QUIZ_ANSWERS_KEY);
        if (!raw) return {};
        const allData = JSON.parse(raw);
        return allData[blockId] || {};
    } catch {
        return {};
    }
};

/**
 * Salva a resposta de uma questão de quiz no localStorage
 */
export const saveGuestQuizAnswerLocal = (
    blockId: string,
    questionIndex: number,
    selectedOption: number,
    isCorrect: boolean,
    moduleSlug?: string
): void => {
    try {
        const raw = localStorage.getItem(GUEST_QUIZ_ANSWERS_KEY);
        const allData: Record<string, Record<number, StoredQuizAnswer>> = raw ? JSON.parse(raw) : {};
        if (!allData[blockId]) {
            allData[blockId] = {};
        }
        allData[blockId][questionIndex] = {
            selectedOption,
            isCorrect,
            submitted: true,
            moduleSlug
        };
        localStorage.setItem(GUEST_QUIZ_ANSWERS_KEY, JSON.stringify(allData));
    } catch (e) {
        console.warn('Erro ao salvar resposta de quiz no localStorage:', e);
    }
};

/**
 * Converte todas as respostas de quizzes em uma lista plana para envio/sincronização
 */
export const getAllGuestQuizAnswersList = (): Array<{
    block_id: string;
    question_index: number;
    selected_option: number;
    is_correct: boolean;
    module_slug?: string;
}> => {
    try {
        const raw = localStorage.getItem(GUEST_QUIZ_ANSWERS_KEY);
        if (!raw) return [];
        const allData: Record<string, Record<number, StoredQuizAnswer>> = JSON.parse(raw);
        const list: Array<any> = [];
        for (const [blockId, questions] of Object.entries(allData)) {
            for (const [qIndexStr, data] of Object.entries(questions)) {
                list.push({
                    block_id: blockId,
                    question_index: parseInt(qIndexStr, 10),
                    selected_option: data.selectedOption,
                    is_correct: data.isCorrect,
                    module_slug: data.moduleSlug
                });
            }
        }
        return list;
    } catch {
        return [];
    }
};

/**
 * Sincroniza o progresso e as respostas do visitante com a conta de aluno autenticada no backend
 */
export const syncGuestWithServer = async (token: string): Promise<boolean> => {
    try {
        const guestId = localStorage.getItem(GUEST_ID_KEY);
        const completedActs = Array.from(getGuestCompletedActivities());
        const quizAnswers = getAllGuestQuizAnswersList();

        if (!guestId && completedActs.length === 0 && quizAnswers.length === 0) {
            return true;
        }

        const res = await fetch(`${API_URL}/api/progress/sync-guest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                guest_id: guestId || undefined,
                completed_activities: completedActs,
                quiz_answers: quizAnswers
            })
        });

        if (res.ok) {
            return true;
        }
        return false;
    } catch (err) {
        console.warn('Erro ao sincronizar dados de visitante:', err);
        return false;
    }
};
