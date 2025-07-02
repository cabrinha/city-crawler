import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0d1117;
  color: #f0f6fc;
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
`;

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background: #238636;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  z-index: 1000;
  transition: background-color 0.2s;

  &:hover {
    background: #2ea043;
  }
`;

const Sidebar = styled.aside`
  width: 296px;
  min-height: 100vh;
  background: #161b22;
  border-right: 1px solid #30363d;
  padding: 80px 0 32px;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
`;

const SidebarContent = styled.div`
  padding: 0 24px;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 296px;
  padding: 80px 32px 64px;
  max-width: 1012px;
`;

const TOCTitle = styled.h3`
  color: #f0f6fc;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const TOCList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TOCItem = styled.li<{ level?: number }>`
  margin: 0;
`;

const TOCLink = styled.a<{ active?: boolean }>`
  color: ${props => props.active ? '#58a6ff' : '#8b949e'};
  text-decoration: none;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  display: block;
  padding: 6px 0;
  line-height: 1.5;
  transition: color 0.2s;
  border-left: ${props => props.active ? '2px solid #fd7e14' : '2px solid transparent'};
  padding-left: ${props => props.active ? '14px' : '16px'};

  &:hover {
    color: #58a6ff;
    text-decoration: none;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #30363d;
`;

const PageTitle = styled.h1`
  color: #f0f6fc;
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
`;

const PageSubtitle = styled.p`
  color: #8b949e;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
`;

const Section = styled.section`
  margin-bottom: 32px;
  scroll-margin-top: 80px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  color: #f0f6fc;
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  padding-bottom: 8px;
  border-bottom: 1px solid #30363d;
`;

const SubSectionTitle = styled.h3`
  color: #f0f6fc;
  margin: 24px 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
`;

const Paragraph = styled.p`
  color: #e6edf3;
  line-height: 1.6;
  margin: 0 0 16px 0;
  font-size: 16px;
`;

const BiterLink = styled.a`
  color: #58a6ff;
  text-decoration: none;
  font-weight: 600;
  background: #1f2937;
  padding: 12px 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  font-size: 16px;
  border: 1px solid #30363d;
  transition: all 0.2s;

  &:hover {
    background: #374151;
    border-color: #58a6ff;
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const PowersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const PowerItem = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #58a6ff;
  }
`;

const PowerName = styled.h4`
  color: #f0f6fc;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
`;

const PowerCost = styled.div`
  color: #f85149;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const PowerDescription = styled.div`
  color: #e6edf3;
  line-height: 1.5;
  font-size: 14px;
`;

const List = styled.ul`
  color: #e6edf3;
  padding-left: 24px;
  line-height: 1.6;
  margin: 0 0 16px 0;

  li {
    margin-bottom: 8px;
    font-size: 16px;
  }
`;

const CalloutBox = styled.div<{ type: 'info' | 'warning' }>`
  background: ${props => props.type === 'info' ? '#0f2419' : '#2d1f1a'};
  border: 1px solid ${props => props.type === 'info' ? '#1a7f37' : '#da3633'};
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;

  &::before {
    content: ${props => props.type === 'info' ? '"ℹ️"' : '"⚠️"'};
    margin-right: 8px;
    font-size: 16px;
  }
`;

const CalloutTitle = styled.strong`
  color: ${props => props.color || '#f0f6fc'};
  display: inline;
`;

const TableOfContentsBox = styled.div`
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin: 24px 0;
`;

const TOCBoxTitle = styled.h4`
  color: #f0f6fc;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
`;

const TOCBoxList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TOCBoxItem = styled.li`
  margin: 0;
`;

const TOCBoxLink = styled.a`
  color: #58a6ff;
  text-decoration: none;
  font-size: 14px;
  display: block;
  padding: 4px 0;
  line-height: 1.5;

  &:hover {
    text-decoration: underline;
  }
`;

interface AboutPageProps {
  onBackToMap?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToMap }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'new-players', 'powers', 'location-tracking', 'contributing'];
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tableOfContents = [
    { id: 'overview', title: 'Overview' },
    { id: 'new-players', title: 'New Players' },
    { id: 'powers', title: 'Powers' },
    { id: 'location-tracking', title: 'Location Tracking' },
    { id: 'contributing', title: 'Contributing' },
  ];

  return (
    <PageContainer>
      {onBackToMap && (
        <BackButton onClick={onBackToMap}>
          ← Back to Map
        </BackButton>
      )}

      <Sidebar>
        <SidebarContent>
          <TOCTitle>In this article</TOCTitle>
          <TOCList>
            {tableOfContents.map((item) => (
              <TOCItem key={item.id}>
                <TOCLink
                  href={`#${item.id}`}
                  active={activeSection === item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.title}
                </TOCLink>
              </TOCItem>
            ))}
          </TOCList>
        </SidebarContent>
      </Sidebar>

      <MainContent>
        <PageHeader>
          <PageTitle>City Crawler</PageTitle>
          <PageSubtitle>
            A community-driven mapping tool for RavenBlack's Vampires game
          </PageSubtitle>
        </PageHeader>

        <TableOfContentsBox>
          <TOCBoxTitle>In this article</TOCBoxTitle>
          <TOCBoxList>
            {tableOfContents.map((item) => (
              <TOCBoxItem key={item.id}>
                <TOCBoxLink
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.title}
                </TOCBoxLink>
              </TOCBoxItem>
            ))}
          </TOCBoxList>
        </TableOfContentsBox>

        <Section id="overview">
          <SectionTitle>Overview</SectionTitle>
          <Paragraph>
            City Crawler is a community-driven mapping tool for the text-based vampire game{' '}
            <a href="https://quiz.ravenblack.net/blood.pl?biter=Vespertine" target="_blank" rel="noopener noreferrer" style={{color: '#58a6ff', textDecoration: 'none'}}>
              RavenBlack's Vampires! The Dark Alleyway
            </a>.
            The game features a sprawling city where vampires hunt, trade, and explore - but navigation
            can be challenging without proper tools.
          </Paragraph>
          <Paragraph>
            This interactive map helps players:
          </Paragraph>
          <List>
            <li>Track shop and guild locations as they move throughout the city</li>
            <li>Report new locations discovered during exploration</li>
            <li>Plan efficient routes for hunting and navigating the city</li>
            <li>Share location data with the broader vampire community</li>
          </List>
        </Section>

        <Section id="new-players">
          <SectionTitle>New Players</SectionTitle>
          <Paragraph>
            Ready to join the ranks of the undead? Click the link below to begin your vampiric journey:
          </Paragraph>
          <div style={{ textAlign: 'center' }}>
            <BiterLink href="https://quiz.ravenblack.net/blood.pl?biter=Vespertine" target="_blank" rel="noopener noreferrer">
              🧛‍♀️ Get Bit & Start Playing
            </BiterLink>
          </div>
          <Paragraph>
            Once you're a vampire, you'll spawn in the city and can begin exploring, hunting,
            and accumulating blood. Use this map to navigate and contribute location reports!
          </Paragraph>

          <CalloutBox type="info">
            <CalloutTitle>Getting Started Tips:</CalloutTitle>
            <List>
              <li>Start by exploring your immediate area to get familiar with movement</li>
              <li>Look for humans to bite and gain blood points</li>
              <li>Visit shops to buy useful items and scrolls</li>
              <li>Join a guild when you have enough coins to learn powers</li>
            </List>
          </CalloutBox>
        </Section>

        <Section id="powers">
          <SectionTitle>Powers</SectionTitle>
          <Paragraph>
            As you progress in the game, you can purchase various powers at the given guilds, using coins.
            Here are the available powers:
          </Paragraph>

          <PowersList>
            <PowerItem>
              <PowerName>Celerity</PowerName>
              <PowerCost>Cost: 100 bp</PowerCost>
              <PowerDescription>
                Grants extra movement points per day, allowing you to travel farther and hunt more efficiently.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Suction</PowerName>
              <PowerCost>Cost: 100 bp</PowerCost>
              <PowerDescription>
                Increases the amount of blood gained from each successful bite, making feeding more efficient.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Surprise</PowerName>
              <PowerCost>Cost: 100 bp</PowerCost>
              <PowerDescription>
                Improves your success rate when biting other vampires, making you a more effective predator.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Telepathy</PowerName>
              <PowerCost>Cost: 200 bp</PowerCost>
              <PowerDescription>
                Allows you to send messages to other vampires anywhere in the city, enabling communication and coordination.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Stamina</PowerName>
              <PowerCost>Cost: 200 bp</PowerCost>
              <PowerDescription>
                Increases your maximum blood capacity, allowing you to store more blood before needing to bank it.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Shadows</PowerName>
              <PowerCost>Cost: 200 bp</PowerCost>
              <PowerDescription>
                Makes you harder to detect and bite, providing defensive capabilities against other vampires.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Thievery</PowerName>
              <PowerCost>Cost: 200 bp</PowerCost>
              <PowerDescription>
                Allows you to steal coins from humans and other vampires, providing an alternative income source.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Locate</PowerName>
              <PowerCost>Cost: 200 bp</PowerCost>
              <PowerDescription>
                Enables you to find the location of any vampire in the city by name, useful for hunting or meeting allies.
              </PowerDescription>
            </PowerItem>

            <PowerItem>
              <PowerName>Scrying</PowerName>
              <PowerCost>Cost: 1000 bp</PowerCost>
              <PowerDescription>
                The most expensive power - allows you to see what's happening at any location in the city remotely.
              </PowerDescription>
            </PowerItem>
          </PowersList>
        </Section>

        <Section id="location-tracking">
          <SectionTitle>Location Tracking</SectionTitle>
          <Paragraph>
            In RavenBlack's Vampires, shops and guilds periodically move to new locations:
          </Paragraph>
          <List>
            <li><strong>Shops</strong> move every 12 hours at 10:40 GMT (10:40 AM and 10:40 PM)</li>
            <li><strong>Guilds</strong> move every few days on specific dates (1st, 6th, 10th, 14th, 19th, 23rd, 27th)</li>
            <li><strong>Hunters, Paladins, and Werewolves</strong> can appear in multiple locations simultaneously</li>
          </List>

          <CalloutBox type="warning">
            <CalloutTitle>Important:</CalloutTitle> This map automatically expires old reports based on these movement patterns,
            ensuring you always have current location data. Always verify locations before making long trips!
          </CalloutBox>
        </Section>

        <Section id="contributing">
          <SectionTitle>Contributing</SectionTitle>
          <Paragraph>
            Help keep the map accurate by reporting locations you discover:
          </Paragraph>
          <List>
            <li>Use the "Report Location" feature when you find shops, guilds, or special NPCs</li>
            <li>Include your vampire name to get credit for contributions</li>
            <li>Double-check coordinates to ensure accuracy</li>
            <li>Add notes for any special circumstances or confirmations</li>
          </List>

          <CalloutBox type="info">
            <CalloutTitle>Quality Reports:</CalloutTitle> The most helpful reports include exact coordinates,
            building names, and any relevant timing information (like "just moved here" or "confirmed still here").
          </CalloutBox>

          <Paragraph>
            Every contribution helps the vampire community navigate the city more effectively!
          </Paragraph>
        </Section>
      </MainContent>
    </PageContainer>
  );
};