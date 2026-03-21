import type { NewsItem } from '../types/news'

export const mockNews: NewsItem[] = [
  {
    id: 'n1', category: 'recap', isMock: true,
    headline: 'Cooper Flagg drops 24 points in Duke\'s dominant R1 win',
    summary: 'The freshman phenom put on a clinic, scoring 24 points with 8 rebounds and 5 assists as Duke dispatched Drake 89-61 in the First Round.',
    publishedAt: '2026-03-20T22:30:00Z',
    source: 'ESPN', url: 'https://espn.com',
    relatedTeamIds: ['duke'], relatedPlayerIds: ['cooper-flagg'],
  },
  {
    id: 'n2', category: 'recap', isMock: true,
    headline: 'Johni Broome goes for 22 & 13 as Auburn cruises past High Point',
    summary: 'The SEC Player of the Year was dominant inside, tallying 22 points, 13 rebounds, and 4 blocks in Auburn\'s 92-58 blowout.',
    publishedAt: '2026-03-20T21:45:00Z',
    source: 'CBS Sports', url: 'https://cbssports.com',
    relatedTeamIds: ['auburn'], relatedPlayerIds: ['johni-broome'],
  },
  {
    id: 'n3', category: 'performance', isMock: true,
    headline: 'Mark Sears heating up: Alabama guard averaging 24 PPG in March',
    summary: 'Sears has been virtually unstoppable over the last two weeks, shooting 46% from three and averaging 24 points per game in Alabama\'s SEC tournament run.',
    publishedAt: '2026-03-19T18:00:00Z',
    source: 'The Athletic', url: 'https://theathletic.com',
    relatedTeamIds: ['alabama'], relatedPlayerIds: ['mark-sears'],
  },
  {
    id: 'n4', category: 'preview', isMock: true,
    headline: 'Houston defense: Can anyone slow down Kelvin Sampson\'s machine?',
    summary: 'The Cougars enter the tournament holding opponents to 62.3 PPG — best in the country. Their lockdown defense could be the key to a deep run.',
    publishedAt: '2026-03-19T14:00:00Z',
    source: 'ESPN', url: 'https://espn.com',
    relatedTeamIds: ['houston'], relatedPlayerIds: ['jamal-shead', 'lj-cryer'],
  },
  {
    id: 'n5', category: 'performance', isMock: true,
    headline: 'Michigan-Ohio State tip-off delayed: What to watch for',
    summary: 'The Big Ten rivals meet in the First Round in a potential upset alert. Ohio State\'s balanced attack could push Michigan to the limit tonight.',
    publishedAt: '2026-03-20T18:30:00Z',
    source: 'CBS Sports', url: 'https://cbssports.com',
    relatedTeamIds: ['michigan', 'ohio-st'], relatedPlayerIds: [],
  },
  {
    id: 'n6', category: 'general', isMock: true,
    headline: 'Cinderella alert: High Point\'s dream run ends in West Region',
    summary: 'Despite the loss, High Point\'s electric backcourt showed flashes against Auburn, and their star guard will be one to watch on the NBA radar next season.',
    publishedAt: '2026-03-20T22:00:00Z',
    source: 'The Athletic', url: 'https://theathletic.com',
    relatedTeamIds: ['high-point', 'auburn'], relatedPlayerIds: [],
  },
  {
    id: 'n7', category: 'preview', isMock: true,
    headline: 'Kansas vs Gonzaga: Hunter Dickinson vs Graham Ike is the matchup of the day',
    summary: 'Two elite centers, two contrasting styles. Dickinson\'s physicality vs Ike\'s finesse — whoever wins the post battle likely wins the game tonight.',
    publishedAt: '2026-03-20T10:00:00Z',
    source: 'ESPN', url: 'https://espn.com',
    relatedTeamIds: ['kansas', 'gonzaga'], relatedPlayerIds: ['hunter-dickinson', 'graham-ike'],
  },
  {
    id: 'n8', category: 'performance', isMock: true,
    headline: 'LJ Cryer with 18 first-half points as Houston leads Wisconsin at halftime',
    summary: 'The senior guard has been brilliant, hitting four three-pointers in the first 20 minutes to stake Houston to an 8-point halftime lead over Wisconsin.',
    publishedAt: '2026-03-20T21:00:00Z',
    source: 'CBS Sports', url: 'https://cbssports.com',
    relatedTeamIds: ['houston'], relatedPlayerIds: ['lj-cryer'],
  },
]

export function getNewsForPlayer(playerId: string): NewsItem[] {
  return mockNews.filter(n => n.relatedPlayerIds.includes(playerId))
}

export function getNewsForTeam(teamId: string): NewsItem[] {
  return mockNews.filter(n => n.relatedTeamIds.includes(teamId))
}
