import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SHOP_NAMES, GUILD_NAMES } from '../data/reportedLocations';

const Page = styled.main`
  flex: 1;
  padding: 32px 20px 60px;
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.6;
  font-size: 15px;
  text-align: left;
  color: #ddd;

  h1 { font-family: var(--font-title); font-weight: 400; font-size: 44px; color: #ff4444; margin: 0 0 8px; }
  h2 { font-family: var(--font-title); font-weight: 400; font-size: 26px; color: #ff6666; margin: 36px 0 8px; }
  p { margin: 0 0 14px; }
  a { color: #ff6666; }
  a:hover { color: #fff; }
  ul { padding-left: 22px; margin: 0 0 14px; }
  li { margin: 4px 0; }
  code, .mono { font-family: var(--font-mono); font-size: 13px; color: #00ff00; }
  .lede { font-size: 17px; color: #fff; }
  .rule { border: 0; border-top: 1px solid #333; margin: 30px 0; }
`;

const founded = 2003;
const years = new Date().getUTCFullYear() - founded;

export const AboutPage: React.FC = () => (
  <Page>
    <h1>About the City Crawler</h1>
    <p className="lede">
      A map and a notebook for <a href="https://quiz.ravenblack.net/blood.pl" target="_blank" rel="noopener">Vampires!</a>,
      RavenBlack&apos;s browser game of stalking humans through a city of a hundred streets by a hundred streets.
      The game gives you a 5&times;5 window onto that city; this site gives you the whole thing.
    </p>

    <h2>What it&apos;s for</h2>
    <ul>
      <li><strong>Finding shops and guilds.</strong> The {SHOP_NAMES.length} magic shops move every twelve hours and the {GUILD_NAMES.length} guilds
        (three tiers each) move several times a month. Players report where they found them, and the <Link to="/">map</Link> shows
        everything reported this cycle, with a countdown to the next move so you know how long a report stays true.</li>
      <li><strong>Getting there.</strong> Click a tile to set your location, pick a destination, and the navigator works out
        the shortest walk or whether a transit station gets you there cheaper.</li>
      <li><strong>Remembering the fixed things.</strong> Banks, pubs and the nine transit stations never move; they are all on the map.</li>
      <li><strong>Budgeting.</strong> The <Link to="/shopping">shopping calculator</Link> prices a shopping list with your charisma discount.</li>
      <li><strong>Bragging.</strong> <Link to="/rankings">Rankings</Link> for the most generous reporters, the richest vampires and the biggest blood hoards.</li>
    </ul>
    <p>
      Reports come from the site itself and from a Discord bot that reads shop lists posted in the community server, crediting
      everyone named in the post. Everything here is community-reported: a location is only as current as the last vampire who walked past it.
    </p>

    <h2>The game</h2>
    <p>
      <em>Vampires!</em> (also called <em>The Dark Alleyway</em>) is a free, text-and-tables browser game written and still run by
      RavenBlack. You are a vampire with a handful of action points that recharge one every half hour; you spend them walking the
      grid, drinking from the humans you find, buying scrolls and potions, and gaining powers. It has no graphics to speak of and
      has not needed any.
    </p>
    <p>
      It is old. The oldest surviving entries in the game&apos;s changelog are from January 2003, and the entry for 31 January 2003
      is the one that introduced &ldquo;twenty magic shops&rdquo; that &ldquo;seem to move every twelve hours or so&rdquo;, which is
      the mechanic this site is built around. That makes the game at least {years} years old and, as far as anyone can tell, one of the
      longest continuously running browser games there is. Players from the early days are still on the leaderboards.
    </p>
    <p>
      New here? Read RavenBlack&apos;s own guide first: <a href="https://quiz.ravenblack.net/bloodhowto.html" target="_blank" rel="noopener">How To Play</a>.
      It explains the streets (trees and animals in the west, minerals and malaise in the east), action points, transit, and biting.
    </p>

    <hr className="rule" />
    <p>
      Built by Vespertine. Source on <a href="https://github.com/cabrinha/city-crawler" target="_blank" rel="noopener">GitHub</a>;
      bugs and ideas welcome there. Not affiliated with RavenBlack. Machine-readable summary at <a href="/llms.txt">/llms.txt</a>.
    </p>
  </Page>
);
