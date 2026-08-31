/**
 * Utilitário de Geração e Exportação de Apostilas em PDF para o PaliEduca (UFPB)
 * Gera um documento A4 limpo, sem ruídos de interface, otimizado para impressão e download de PDF.
 */

export interface ExportModuleOptions {
    moduleTitle: string;
    moduleDescription: string;
    elements: any[];
    authorName?: string;
    institution?: string;
}

export function exportModuleToPDF(options: ExportModuleOptions) {
    const {
        moduleTitle,
        moduleDescription,
        elements = [],
        authorName = "Prof.ª Patrícia Maria de Oliveira Andrade",
        institution = "Universidade Federal da Paraíba (UFPB) — Departamento de Enfermagem Clínica"
    } = options;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
        alert("Por favor, permita pop-ups no seu navegador para gerar o PDF da apostila.");
        return;
    }

    // Processa os blocos de conteúdo para HTML semântico de impressão
    let contentHtml = '';
    let quizHtml = '';

    elements.forEach((block) => {
        const type = block.type || 'rich_text';
        const data = block.data || {};

        switch (type) {
            case 'hero':
            case 'title':
            case 'header':
                contentHtml += `
                    <div class="section-title">
                        <h2>${data.title || data.text || ''}</h2>
                        ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ''}
                    </div>
                `;
                break;

            case 'rich_text':
            case 'text':
                contentHtml += `
                    <div class="rich-text">
                        ${data.content || data.html || data.text || ''}
                    </div>
                `;
                break;

            case 'quote':
                contentHtml += `
                    <blockquote class="clinical-quote">
                        <p>"${data.quote || data.text || ''}"</p>
                        ${data.author ? `<cite>— ${data.author}</cite>` : ''}
                    </blockquote>
                `;
                break;

            case 'callout':
            case 'alert':
            case 'highlight':
                contentHtml += `
                    <div class="clinical-box">
                        <div class="box-header">💡 Ponto de Atenção Clínica & Humanização</div>
                        <div class="box-body">${data.text || data.content || data.html || ''}</div>
                    </div>
                `;
                break;

            case 'cards':
            case 'card_grid':
                if (Array.isArray(data.cards || data.items)) {
                    const items = data.cards || data.items;
                    contentHtml += `<div class="cards-grid">`;
                    items.forEach((item: any) => {
                        contentHtml += `
                            <div class="clinical-card">
                                <h4>${item.title || ''}</h4>
                                <p>${item.description || item.text || ''}</p>
                            </div>
                        `;
                    });
                    contentHtml += `</div>`;
                }
                break;

            case 'accordion':
                if (Array.isArray(data.items)) {
                    contentHtml += `<div class="accordion-print">`;
                    data.items.forEach((item: any) => {
                        contentHtml += `
                            <div class="accordion-item">
                                <strong>📌 ${item.title || item.header || ''}</strong>
                                <div>${item.content || item.body || ''}</div>
                            </div>
                        `;
                    });
                    contentHtml += `</div>`;
                }
                break;

            case 'flashcards':
                if (Array.isArray(data.cards)) {
                    contentHtml += `<div class="flashcards-print"><h3>Flashcards de Fixação Rápida</h3><div class="cards-grid">`;
                    data.cards.forEach((card: any) => {
                        contentHtml += `
                            <div class="clinical-card">
                                <strong>P: ${card.question || card.front || ''}</strong>
                                <p style="margin-top:6px; color:#0f766e;">R: ${card.answer || card.back || ''}</p>
                            </div>
                        `;
                    });
                    contentHtml += `</div></div>`;
                }
                break;

            case 'quiz':
                if (Array.isArray(data.questions)) {
                    quizHtml += `
                        <div class="quiz-section page-break">
                            <h2>📝 Questões de Autoavaliação e Fixação</h2>
                            <p class="subtitle">Teste seus conhecimentos com as questões oficiais deste módulo.</p>
                    `;
                    data.questions.forEach((q: any, qIdx: number) => {
                        quizHtml += `
                            <div class="question-box">
                                <p class="question-text"><strong>Questão ${qIdx + 1}:</strong> ${q.question || ''}</p>
                                <ul class="options-list">
                        `;
                        if (Array.isArray(q.options)) {
                            q.options.forEach((opt: string, optIdx: number) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const isCorrect = optIdx === q.correct_index;
                                quizHtml += `
                                    <li class="option-item ${isCorrect ? 'correct-option' : ''}">
                                        <span class="opt-letter">${letter})</span> ${opt}
                                        ${isCorrect ? ' <em>(Gabarito Oficial)</em>' : ''}
                                    </li>
                                `;
                            });
                        }
                        quizHtml += `</ul>`;
                        if (q.explanation) {
                            quizHtml += `
                                <div class="explanation-box">
                                    <strong>Comentário Pedagógico:</strong> ${q.explanation}
                                </div>
                            `;
                        }
                        quizHtml += `</div>`;
                    });
                    quizHtml += `</div>`;
                }
                break;

            default:
                if (data.content || data.html || data.text) {
                    contentHtml += `<div class="rich-text">${data.content || data.html || data.text}</div>`;
                }
                break;
        }
    });

    const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const fullDocumentHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Apostila — ${moduleTitle} | PaliEduca UFPB</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 15mm 20mm 15mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* ─── CAPA INSTITUCIONAL ─── */
        .cover-page {
            text-align: center;
            padding: 30px 20px 40px;
            border-bottom: 2px solid #0f766e;
            margin-bottom: 30px;
        }

        .inst-header {
            font-size: 10pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f766e;
            margin-bottom: 6px;
        }

        .inst-sub {
            font-size: 9pt;
            color: #64748b;
            margin-bottom: 25px;
        }

        .butterfly-logo {
            font-size: 32pt;
            margin-bottom: 10px;
        }

        .module-main-title {
            font-size: 22pt;
            font-weight: 900;
            color: #0f172a;
            margin: 10px 0 12px;
            line-height: 1.25;
        }

        .module-desc {
            font-size: 11pt;
            color: #334155;
            max-width: 650px;
            margin: 0 auto 25px;
        }

        .meta-badges {
            display: flex;
            justify-content: center;
            gap: 15px;
            font-size: 9pt;
            font-weight: 700;
            color: #0f766e;
            margin-top: 15px;
        }

        .meta-badge {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            padding: 5px 12px;
            border-radius: 20px;
        }

        /* ─── CONTEÚDO PRINCIPAL ─── */
        .section-title {
            margin: 30px 0 15px;
            border-left: 4px solid #0f766e;
            padding-left: 12px;
        }

        .section-title h2 {
            font-size: 15pt;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }

        .section-title .subtitle {
            font-size: 9.5pt;
            color: #64748b;
            margin: 3px 0 0;
        }

        .rich-text {
            font-size: 11pt;
            color: #334155;
            margin-bottom: 18px;
        }

        .rich-text p {
            margin: 0 0 12px;
        }

        .rich-text strong {
            color: #0f172a;
        }

        .clinical-quote {
            margin: 20px 0;
            padding: 14px 20px;
            background: #f8fafc;
            border-left: 4px solid #0284c7;
            font-style: italic;
            color: #1e293b;
            border-radius: 0 8px 8px 0;
        }

        .clinical-quote cite {
            display: block;
            margin-top: 6px;
            font-style: normal;
            font-weight: 700;
            font-size: 9pt;
            color: #0284c7;
        }

        .clinical-box {
            margin: 20px 0;
            border: 1.5px solid #14b8a6;
            background: #f0fdf4;
            border-radius: 10px;
            padding: 14px 18px;
            page-break-inside: avoid;
        }

        .box-header {
            font-weight: 800;
            font-size: 10pt;
            color: #0f766e;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .box-body {
            font-size: 10.5pt;
            color: #1e293b;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 15px 0;
            page-break-inside: avoid;
        }

        .clinical-card {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            padding: 12px 14px;
        }

        .clinical-card h4 {
            margin: 0 0 6px;
            font-size: 10.5pt;
            color: #0f766e;
        }

        .clinical-card p {
            margin: 0;
            font-size: 9.5pt;
            color: #475569;
        }

        .accordion-print .accordion-item {
            border-bottom: 1px solid #e2e8f0;
            padding: 10px 0;
            page-break-inside: avoid;
        }

        /* ─── QUESTÕES E GABARITO ─── */
        .quiz-section {
            margin-top: 35px;
            padding-top: 20px;
            border-top: 2px dashed #cbd5e1;
        }

        .question-box {
            background: #fafafa;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 16px;
            page-break-inside: avoid;
        }

        .question-text {
            font-size: 11pt;
            color: #111827;
            margin-bottom: 10px;
        }

        .options-list {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }

        .option-item {
            padding: 6px 10px;
            margin-bottom: 4px;
            border-radius: 6px;
            font-size: 10pt;
            color: #374151;
        }

        .correct-option {
            background: #ecfdf5;
            font-weight: 700;
            color: #065f46;
            border-left: 3px solid #10b981;
        }

        .explanation-box {
            margin-top: 8px;
            padding: 8px 12px;
            background: #eff6ff;
            border-radius: 6px;
            font-size: 9pt;
            color: #1e40af;
        }

        .page-break {
            page-break-before: always;
        }

        /* ─── RODAPÉ INSTITUCIONAL ─── */
        .print-footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #64748b;
        }

        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="no-print" style="position:fixed; top:15px; right:15px; z-index:9999; display:flex; gap:10px;">
        <button onclick="window.print()" style="background:#0f766e; color:#fff; font-weight:bold; padding:10px 18px; border-radius:8px; border:none; cursor:pointer; font-size:13px; box-shadow:0 4px 10px rgba(0,0,0,0.15);">
            🖨️ Salvar como PDF / Imprimir
        </button>
        <button onclick="window.close()" style="background:#e2e8f0; color:#334155; font-weight:bold; padding:10px 16px; border-radius:8px; border:none; cursor:pointer; font-size:13px;">
            Fechar
        </button>
    </div>

    <!-- CAPA -->
    <div class="cover-page">
        <div class="butterfly-logo">🦋</div>
        <div class="inst-header">PaliEduca — Guia Didático e Clínico Oficial</div>
        <div class="inst-sub">${institution}</div>
        <h1 class="module-main-title">${moduleTitle}</h1>
        <p class="module-desc">${moduleDescription}</p>
        <div class="meta-badges">
            <span class="meta-badge">📚 Material Didático UFPB</span>
            <span class="meta-badge">👩‍🏫 Coordenação: ${authorName}</span>
            <span class="meta-badge">📅 Edição: ${currentDate}</span>
        </div>
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="main-content">
        ${contentHtml}
    </div>

    <!-- QUESTÕES E GABARITO -->
    ${quizHtml}

    <!-- RODAPÉ FINAL -->
    <div class="print-footer">
        <span>PaliEduca — Plataforma de Ensino em Cuidados Paliativos (UFPB)</span>
        <span>Acesse online: https://palieduca.com.br</span>
    </div>

    <script>
        // Dispara o diálogo de impressão/PDF após carregar renderização
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullDocumentHtml);
    printWindow.document.close();
}
