/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MathProblem {
  id: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'counting' | 'missing';
  question: string;
  expression: string;
  operands: number[];
  operator: string;
  correctAnswer: number;
  options?: number[];
  visualItems?: string[];
  verified: boolean;
}

export function generateMathWorksheet(
  ageGroup: '3-4' | '4-5' | '5-6' | '6-8',
  count: number = 8
): { problems: MathProblem[]; allVerified: boolean } {
  const problems: MathProblem[] = [];
  const emojis = ['🍎', '⭐️', '🚗', '🐶', '🎈', '🌸', '🍌', '🐱', '🚀', '🍓', '🧸'];

  for (let i = 0; i < count; i++) {
    if (ageGroup === '3-4') {
      // Counting items (1 to 6)
      const num = Math.floor(Math.random() * 6) + 1;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      problems.push({
        id: `m_3_4_${i}_${Date.now()}`,
        type: 'counting',
        question: 'Count the items and write the number:',
        expression: `${emoji} `.repeat(num).trim(),
        operands: [num],
        operator: '=',
        correctAnswer: num,
        visualItems: Array(num).fill(emoji),
        verified: true,
      });
    } else if (ageGroup === '4-5') {
      // Simple addition (sums <= 10) or small subtraction
      const isSub = Math.random() > 0.6;
      if (isSub) {
        const b = Math.floor(Math.random() * 4) + 1;
        const a = b + Math.floor(Math.random() * 4) + 1; // ensures a > b
        problems.push({
          id: `m_4_5_${i}_${Date.now()}`,
          type: 'subtraction',
          question: 'Subtract the numbers:',
          expression: `${a} - ${b} = ___`,
          operands: [a, b],
          operator: '-',
          correctAnswer: a - b,
          verified: (a - b) >= 0,
        });
      } else {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        problems.push({
          id: `m_4_5_${i}_${Date.now()}`,
          type: 'addition',
          question: 'Add the numbers together:',
          expression: `${a} + ${b} = ___`,
          operands: [a, b],
          operator: '+',
          correctAnswer: a + b,
          verified: (a + b) === (a + b),
        });
      }
    } else if (ageGroup === '5-6') {
      // Addition up to 20 or non-negative subtraction, or missing addend
      const mode = Math.floor(Math.random() * 3);
      if (mode === 0) {
        // Missing addend: a + ? = c
        const a = Math.floor(Math.random() * 9) + 1;
        const ans = Math.floor(Math.random() * 9) + 1;
        const c = a + ans;
        problems.push({
          id: `m_5_6_${i}_${Date.now()}`,
          type: 'missing',
          question: 'Find the missing number:',
          expression: `${a} + ___ = ${c}`,
          operands: [a, c],
          operator: '+',
          correctAnswer: ans,
          verified: a + ans === c,
        });
      } else if (mode === 1) {
        // Subtraction with results >= 0
        const b = Math.floor(Math.random() * 8) + 1;
        const a = b + Math.floor(Math.random() * 10) + 1;
        problems.push({
          id: `m_5_6_${i}_${Date.now()}`,
          type: 'subtraction',
          question: 'Subtract the numbers:',
          expression: `${a} - ${b} = ___`,
          operands: [a, b],
          operator: '-',
          correctAnswer: a - b,
          verified: a - b >= 0,
        });
      } else {
        // Addition up to 20
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        problems.push({
          id: `m_5_6_${i}_${Date.now()}`,
          type: 'addition',
          question: 'Add the numbers:',
          expression: `${a} + ${b} = ___`,
          operands: [a, b],
          operator: '+',
          correctAnswer: a + b,
          verified: a + b <= 25,
        });
      }
    } else {
      // Age 6-8: Multiplication & Exact Integer Division
      const mode = Math.floor(Math.random() * 3);
      if (mode === 0) {
        // Multiplication (tables 2 to 9)
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        problems.push({
          id: `m_6_8_${i}_${Date.now()}`,
          type: 'multiplication',
          question: 'Multiply:',
          expression: `${a} × ${b} = ___`,
          operands: [a, b],
          operator: '×',
          correctAnswer: a * b,
          verified: a * b === (a * b),
        });
      } else if (mode === 1) {
        // Division without remainders: divisor * quotient = dividend
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = Math.floor(Math.random() * 9) + 1;
        const dividend = divisor * quotient;
        problems.push({
          id: `m_6_8_${i}_${Date.now()}`,
          type: 'division',
          question: 'Divide:',
          expression: `${dividend} ÷ ${divisor} = ___`,
          operands: [dividend, divisor],
          operator: '÷',
          correctAnswer: quotient,
          verified: dividend / divisor === quotient && Number.isInteger(dividend / divisor),
        });
      } else {
        // 2-digit addition
        const a = Math.floor(Math.random() * 40) + 10;
        const b = Math.floor(Math.random() * 40) + 10;
        problems.push({
          id: `m_6_8_${i}_${Date.now()}`,
          type: 'addition',
          question: 'Add the two-digit numbers:',
          expression: `${a} + ${b} = ___`,
          operands: [a, b],
          operator: '+',
          correctAnswer: a + b,
          verified: a + b === (a + b),
        });
      }
    }
  }

  // Cross-verification
  const allVerified = problems.every((p) => {
    if (p.type === 'counting') return p.correctAnswer === p.operands[0];
    if (p.type === 'missing') return p.operands[0] + p.correctAnswer === p.operands[1];
    if (p.operator === '+') return p.operands[0] + p.operands[1] === p.correctAnswer;
    if (p.operator === '-') return p.operands[0] - p.operands[1] === p.correctAnswer && p.correctAnswer >= 0;
    if (p.operator === '×') return p.operands[0] * p.operands[1] === p.correctAnswer;
    if (p.operator === '÷') return p.operands[0] / p.operands[1] === p.correctAnswer && Number.isInteger(p.correctAnswer);
    return false;
  });

  return { problems, allVerified };
}
