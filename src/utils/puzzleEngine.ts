/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WordSearchGrid {
  grid: string[][];
  words: string[];
  positions: { word: string; start: [number, number]; direction: [number, number] }[];
  size: number;
}

export interface MazeGrid {
  size: number;
  // 2D grid representing walls: 0 = path, 1 = wall
  grid: number[][];
  start: [number, number];
  end: [number, number];
}

/**
 * Generates an educational 10x10 Word Search puzzle
 */
export function generateWordSearch(wordsToPlace: string[], size = 10): WordSearchGrid {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWords: { word: string; start: [number, number]; direction: [number, number] }[] = [];
  const directions = [
    [0, 1],   // horizontal left-to-right
    [1, 0],   // vertical top-to-bottom
    [1, 1],   // diagonal down-right
  ];

  for (const rawWord of wordsToPlace) {
    const word = rawWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length === 0 || word.length > size) continue;

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxR = size - dir[0] * word.length;
      const maxC = size - dir[1] * word.length;
      if (maxR < 0 || maxC < 0) continue;

      const r = Math.floor(Math.random() * (maxR + 1));
      const c = Math.floor(Math.random() * (maxC + 1));

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const nr = r + dir[0] * i;
        const nc = c + dir[1] * i;
        if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          grid[r + dir[0] * i][c + dir[1] * i] = word[i];
        }
        placedWords.push({ word, start: [r, c], direction: [dir[0], dir[1]] });
        placed = true;
      }
    }
  }

  // Fill remaining empty cells with random uppercase English characters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, words: placedWords.map((p) => p.word), positions: placedWords, size };
}

/**
 * Generates a solvable, single-solution Maze using randomized depth-first search
 */
export function generateMaze(cellCount = 11): MazeGrid {
  // Ensure odd dimensions for wall/cell grid
  const dim = cellCount % 2 === 0 ? cellCount + 1 : cellCount;
  const maze: number[][] = Array.from({ length: dim }, () => Array(dim).fill(1)); // 1 = wall

  function carve(r: number, c: number) {
    maze[r][c] = 0; // 0 = path

    const dirs = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < dim - 1 && nc > 0 && nc < dim - 1 && maze[nr][nc] === 1) {
        maze[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  }

  carve(1, 1);

  // Mark start and exit
  maze[1][0] = 0; // entrance
  maze[dim - 2][dim - 1] = 0; // exit

  return {
    size: dim,
    grid: maze,
    start: [1, 0],
    end: [dim - 2, dim - 1],
  };
}
