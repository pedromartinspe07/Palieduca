import re
import unicodedata
from typing import Tuple

# Lista abrangente de termos impróprios, palavras de baixo calão, ofensas e termos obscenos em português
PROFANITY_WORDS = {
    # Palavrões e termos de baixo calão comuns
    "porra", "caralho", "merda", "puta", "puto", "putaria", "filho da puta", "fdp", 
    "foda", "foder", "fodido", "fudeu", "fuder", "buceta", "boceta", "caralha", 
    "cu", "vai tomar no cu", "vtnc", "vsf", "toma no cu", "cacete", "bosta", 
    "boiola", "viado", "viadagem", "bicha", "piranha", "vagabunda", "arrombado", 
    "arrombada", "babaca", "otario", "otaria", "imbecil", "retardado", "desgracado", 
    "desgraca", "chupa", "penis", "pau no cu", "cuzão", "cuzao", "rola", "pinto", 
    "xoxota", "grelo", "orgasmo", "masturbar", "pornografia", "porno", "sexo", "vadia"
}

# Mapeamento para desofuscação de Leetspeak (ex: p0rr@ -> porra, c@r@lh0 -> caralho)
LEET_MAP = {
    '@': 'a', '4': 'a',
    '3': 'e',
    '1': 'i', '!': 'i', '|': 'i',
    '0': 'o',
    '5': 's', '$': 's',
    '7': 't', '+': 't',
    '8': 'b',
    '9': 'g',
}

def normalize_text(text: str) -> str:
    """
    Normaliza o texto: minúsculas, remoção de acentos, conversão de leetspeak e remoção de caracteres repetidos/espaçadores.
    """
    if not text:
        return ""
    
    # 1. Minúsculas
    text = text.lower()

    # 2. Desofuscação de Leetspeak
    for leet_char, regular_char in LEET_MAP.items():
        text = text.replace(leet_char, regular_char)

    # 3. Remoção de acentos (NFD normalization)
    nfkd = unicodedata.normalize('NFKD', text)
    text = "".join([c for c in nfkd if not unicodedata.combining(c)])

    # 4. Substituição de pontuações e símbolos por espaços
    text = re.sub(r'[^a-z0-9\s]', ' ', text)

    # 5. Redução de espaços múltiplos
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def check_content(text: str) -> Tuple[bool, str]:
    """
    Verifica se o texto contém palavras impróprias ou conteúdo ofensivo.
    Retorna (is_clean: bool, feedback_message: str).
    """
    if not text or not text.strip():
        return False, "O comentário não pode ficar em branco."

    if len(text.strip()) < 3:
        return False, "O comentário deve conter pelo menos 3 caracteres."

    normalized = normalize_text(text)
    words = normalized.split()

    # Checagem por palavras exatas e combinações
    for word in words:
        if word in PROFANITY_WORDS:
            return False, (
                "🤖 O Bot de Moderação Acadêmica identificou termos incompatíveis com o "
                "ambiente virtual de aprendizagem do Palieduca/UFPB. "
                "Por favor, reformule sua mensagem com linguagem ética e respeitosa."
            )

    # Checagem por frases ou expressões compostas na string normalizada
    for bad_phrase in PROFANITY_WORDS:
        if " " in bad_phrase and bad_phrase in normalized:
            return False, (
                "🤖 O Bot de Moderação Acadêmica identificou termos incompatíveis com o "
                "ambiente virtual de aprendizagem do Palieduca/UFPB. "
                "Por favor, reformule sua mensagem com linguagem ética e respeitosa."
            )

    # Checagem de palavras emendadas (ex: vai_se_foder, filhadaputa)
    compact_text = normalized.replace(" ", "")
    for bad_word in PROFANITY_WORDS:
        if len(bad_word) >= 4 and bad_word in compact_text:
            return False, (
                "🤖 O Bot de Moderação Acadêmica identificou termos incompatíveis com o "
                "ambiente virtual de aprendizagem do Palieduca/UFPB. "
                "Por favor, reformule sua mensagem com linguagem ética e respeitosa."
            )

    return True, ""
