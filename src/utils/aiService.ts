/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptEnrichmentResult {
  enhancedPrompt: string;
  source: 'gemini_api' | 'local_fallback';
  note?: string;
}

/**
 * Enriches user concepts into kid-friendly, outline-optimized descriptions.
 * Checks server-side Gemini API first; gracefully falls back to local pedagogical templates.
 */
export async function enrichPromptConcept(
  concept: string,
  ageBracket: string = '4-7'
): Promise<PromptEnrichmentResult> {
  const clean = concept.trim();
  if (!clean) {
    return {
      enhancedPrompt: 'Happy cartoon animal in a sunny garden with flowers, bold outlines, white background',
      source: 'local_fallback',
    };
  }

  try {
    const res = await fetch('/api/ai/enrich-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: clean, age: ageBracket }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.enhancedPrompt) {
        return {
          enhancedPrompt: data.enhancedPrompt,
          source: data.source || 'gemini_api',
          note: data.note,
        };
      }
    }
  } catch {
    // Network or server unreachable, fallback to local algorithmic template
  }

  // Pedagogical high-fidelity local templates (Zero Cost, Instant)
  const templates = [
    `Clean black and white coloring outline of ${clean}, bold friendly contours, zero grayscale, large spaces for crayons, age ${ageBracket}.`,
    `Hand-drawn style coloring book illustration of ${clean}, cute child-friendly cartoon proportions, pure white background.`,
    `Educational coloring sheet featuring ${clean}, distinct thick lines, no shading, perfect for young children learning to color.`,
  ];

  const chosen = templates[Math.floor(Math.random() * templates.length)];
  return {
    enhancedPrompt: chosen,
    source: 'local_fallback',
    note: 'Processed via local pedagogical template (₹0 cost, offline ready).',
  };
}
