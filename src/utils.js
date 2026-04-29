const SIZE_REGEX = /\b(XS|XL|S|M|L)\b/i

const COLOR_PATTERNS = [
  { words: ['schwarz'],          value: 'schwarz' },
  { words: ['wei(ß|ss|s)'],      value: 'weiss'   },
  { words: ['rot'],              value: 'rot'     },
  { words: ['beige'],            value: 'beige'   },
  { words: ['orange'],           value: 'orange'  },
  { words: ['gelb'],             value: 'gelb'    },
  { words: ['blau'],             value: 'blau'    },
  { words: ['gr(ü|ue|u)n'],      value: 'gruen'   },
  { words: ['lila', 'violett'],  value: 'lila'    },
  { words: ['gold'],             value: 'gold'    },
  { words: ['pink', 'rosa'],     value: 'pink'    },
  { words: ['grau'],             value: 'grau'    },
]

export function extractSizeAndColors(name) {
  if (!name) return { groesse: '', farben: [] }

  const sizeMatch = name.match(SIZE_REGEX)
  const groesse = sizeMatch ? sizeMatch[1].toUpperCase() : ''

  const farben = []
  for (const { words, value } of COLOR_PATTERNS) {
    if (farben.length >= 3) break
    const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'i')
    if (pattern.test(name)) farben.push(value)
  }

  return { groesse, farben }
}
