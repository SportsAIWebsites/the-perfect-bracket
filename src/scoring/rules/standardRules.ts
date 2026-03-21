import type { RuleSet } from '../types'

export const standardRules: RuleSet = {
  rules: [
    { stat: 'points',    points:  1.0, label: 'PTS' },
    { stat: 'rebounds',  points:  1.0, label: 'REB' },
    { stat: 'assists',   points:  1.5, label: 'AST' },
    { stat: 'steals',    points:  2.0, label: 'STL' },
    { stat: 'blocks',    points:  2.0, label: 'BLK' },
    { stat: 'turnovers', points: -2.0, label: 'TO'  },
    { stat: 'fouls',     points: -1.0, label: 'PF'  },
  ],
  roundMultipliers: {
    1: 1.0,
    2: 1.0,
    3: 1.0,
    4: 1.0,
    5: 1.0,
    6: 1.0,
  },
}
