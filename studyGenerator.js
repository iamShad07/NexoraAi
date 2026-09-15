const aiProvider = require('./aiProvider');

class StudyGenerator {
  /**
   * Generates comprehensive study package for educational learning
   */
  async generateStudyKit(document) {
    const title = document.originalName.replace(/\.[^/.]+$/, '');
    const text = document.textContent;
    const pageCount = document.pageCount || 1;

    if (aiProvider.hasExternalProvider()) {
      try {
        const prompt = `Create an educational study package based on this document: "${title}".
Content snippet:
"""${text.slice(0, 5000)}"""

Return ONLY a valid JSON object matching this schema:
{
  "chapterSummary": "Thorough chapter-by-chapter summary",
  "definitions": [{"term": "Term 1", "definition": "Definition 1", "page": 1}],
  "flashcards": [
    {"id": "fc-1", "front": "Concept or Question", "back": "Clear answer with explanation", "source": "Page 1"}
  ],
  "mcqs": [
    {
      "id": "mcq-1",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct",
      "source": "Page 1"
    }
  ],
  "shortQuestions": [
    {"question": "Short Question 1?", "answer": "Model answer 1.", "marks": 3}
  ],
  "longQuestions": [
    {"question": "Comprehensive Question 1?", "keyPoints": ["Point 1", "Point 2"], "marks": 10}
  ],
  "revisionNotes": ["Note 1", "Note 2", "Note 3"],
  "examFocusedPoints": ["Exam Tip 1", "High probability question topic 2"],
  "quickRevisionSheet": "One-page condensed high-yield review"
}`;
        const res = await aiProvider.generateCompletion(prompt);
        const clean = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return parsed;
      } catch (err) {
        console.warn('AI Study generation fallback to heuristic:', err.message);
      }
    }

    // Heuristic study material generation
    return this.buildHeuristicStudyKit(document);
  }

  buildHeuristicStudyKit(document) {
    const title = document.originalName.replace(/\.[^/.]+$/, '');
    const text = document.textContent;
    const sentences = text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 25);
    const chunks = document.chunks || [];

    // Extract significant terms
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 4);
    const stopWords = new Set(['about','above','after','again','could','would','should','their','there','these','those','where','which','while']);
    const freq = {};
    words.forEach(w => {
      if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const keyTerms = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

    // Flashcards
    const flashcards = keyTerms.slice(0, 6).map((term, i) => {
      const relatedSentence = sentences.find(s => s.toLowerCase().includes(term.toLowerCase())) || `Essential principle of ${term} presented in ${title}.`;
      return {
        id: `fc-${i + 1}`,
        front: `What is the significance of ${term}?`,
        back: relatedSentence,
        source: `Page ${Math.min(i + 1, document.pageCount)}`
      };
    });

    // MCQs with options and instant grading
    const mcqs = keyTerms.slice(0, 5).map((term, i) => {
      const correctOption = `It represents a primary pillar governing ${term} in the document.`;
      const distractors = [
        `It is an unrelated historical artifact not covered in the text.`,
        `It acts as an obsolete protocol replaced in 1995.`,
        `It denotes an optional secondary footnote with no operational effect.`
      ];
      const allOptions = [correctOption, ...distractors].sort(() => 0.5 - Math.random());
      const correctIndex = allOptions.indexOf(correctOption);

      return {
        id: `mcq-${i + 1}`,
        question: `According to ${document.originalName}, what is the role of "${term}"?`,
        options: allOptions,
        correctIndex,
        explanation: `The text establishes ${term} as an integral concept with direct application across documented workflows.`,
        source: `Page ${Math.min(i + 1, document.pageCount)}`
      };
    });

    // Short & Long questions
    const shortQuestions = keyTerms.slice(0, 4).map((term, i) => ({
      question: `Define "${term}" and explain its context within ${title}.`,
      answer: `"${term}" is established in the document as a fundamental component. Key attributes include structured relationships with related topics and clear operational utility.`,
      marks: 3
    }));

    const longQuestions = [
      {
        question: `Critically assess the core findings and thematic structure presented in ${title}.`,
        keyPoints: [
          `Examine the primary objectives and methodologies outlined across the ${document.pageCount} pages.`,
          `Analyze how ${keyTerms.slice(0, 3).join(', ')} interoperate.`,
          `Synthesize the practical recommendations and their real-world impact.`
        ],
        marks: 10
      },
      {
        question: `Discuss the structural differentiation between ${keyTerms[0] || 'primary concepts'} and ${keyTerms[1] || 'secondary concepts'}.`,
        keyPoints: [
          `Detail definitions and operational contexts.`,
          `Provide concrete examples grounded in the text.`,
          `Evaluate edge cases or constraints highlighted in the material.`
        ],
        marks: 10
      }
    ];

    // Definitions
    const definitions = keyTerms.slice(0, 6).map((term, i) => ({
      term,
      definition: `A central subject element identified in ${title}, analyzed extensively across page ${Math.min(i + 1, document.pageCount)}.`,
      page: Math.min(i + 1, document.pageCount)
    }));

    // Revision notes & Exam points
    const revisionNotes = [
      `Review the definitions for ${keyTerms.slice(0, 4).join(', ')}.`,
      `Focus on section relationships identified on pages 1 through ${document.pageCount}.`,
      `Be prepared to articulate the differences between theoretical principles and practical findings.`,
      `Memorize key numeric data points and documented conclusions.`
    ];

    const examFocusedPoints = [
      `High-probability question: Expect an essay or structured question on ${keyTerms[0] || 'the main topic'}.`,
      `Common pitfall: Conflating ${keyTerms[0] || 'concept A'} with ${keyTerms[1] || 'concept B'}. Make sure to note distinct operational boundaries.`,
      `Quick Formula / Heuristic: Always ground your answers with specific document sections and terminology.`
    ];

    const quickRevisionSheet = `# Quick Revision Sheet: ${title}
- **Document**: ${document.originalName} (${document.wordCount} words, ${document.pageCount} pages)
- **Top 5 Core Concepts**: ${keyTerms.slice(0, 5).join(' • ')}
- **Essential Takeaway**: ${sentences.slice(0, 2).join(' ')}
- **High-Yield Exam Focus**: Master definitions for ${keyTerms[0] || 'the subject'}, its dependencies, and verified analytical outcomes.`;

    return {
      chapterSummary: `Comprehensive chapter review of ${title}: The document synthesizes ${document.wordCount} words across ${document.pageCount} pages, focusing on ${keyTerms.slice(0, 5).join(', ')}.`,
      definitions,
      flashcards,
      mcqs,
      shortQuestions,
      longQuestions,
      revisionNotes,
      examFocusedPoints,
      quickRevisionSheet
    };
  }
}

module.exports = new StudyGenerator();
