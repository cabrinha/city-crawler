import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ApiService } from '../services/api';
import type { TopContributor, BloodDeity, RichVampire } from '../types/game';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
  padding: 20px;
`;

const PageTitle = styled.h1`
  color: #cc3333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
`;

const BackToMapButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background: #cc3333;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;

  &:hover {
    background: #aa2222;
  }
`;

const LeaderboardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const LeaderboardCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
`;

const LeaderboardTitle = styled.h2`
  color: #cc3333;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.8em;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LeaderboardItem = styled.div<{ rank: number; theme: 'reporters' | 'blood' | 'rich' }>`
  background: ${props =>
    props.rank === 1 ? 'linear-gradient(90deg, #ffd700, #ffed4e)' :
    props.rank === 2 ? 'linear-gradient(90deg, #c0c0c0, #e8e8e8)' :
    props.rank === 3 ? 'linear-gradient(90deg, #cd7f32, #daa520)' : '#000'};
  color: ${props => {
    switch (props.theme) {
      case 'reporters': return '#fff';
      case 'blood': return '#cc3333';
      case 'rich': return '#ffd700';
      default: return '#fff';
    }
  }};
  border: 1px solid ${props =>
    props.rank === 1 ? '#ffd700' :
    props.rank === 2 ? '#c0c0c0' :
    props.rank === 3 ? '#cd7f32' : '#333'};
  border-radius: 4px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${props => props.rank <= 3 ? 'bold' : 'normal'};
`;

const RankBadge = styled.div<{ rank: number }>`
  background: ${props =>
    props.rank === 1 ? '#ffd700' :
    props.rank === 2 ? '#c0c0c0' :
    props.rank === 3 ? '#cd7f32' : '#555'};
  color: ${props => props.rank <= 3 ? '#000' : '#fff'};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9em;
`;

const PlayerInfo = styled.div`
  flex: 1;
  margin-left: 15px;
`;

const PlayerName = styled.div`
  font-size: 1.1em;
  font-weight: bold;
`;

const PlayerStats = styled.div<{ theme: 'reporters' | 'blood' | 'rich' }>`
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 2px;
  color: ${props => {
    switch (props.theme) {
      case 'reporters': return '#ccc';
      case 'blood': return '#aa2222';
      case 'rich': return '#ccaa00';
      default: return '#ccc';
    }
  }};
`;

const StatValue = styled.span<{ theme: 'reporters' | 'blood' | 'rich' }>`
  font-weight: bold;
  font-size: 1.1em;
  color: ${props => {
    switch (props.theme) {
      case 'reporters': return '#fff';
      case 'blood': return '#cc3333';
      case 'rich': return '#ffd700';
      default: return '#fff';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-style: italic;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #ccc;
  padding: 40px 20px;
`;

interface RankingsPageProps {
  onBackToMap?: () => void;
}

export const RankingsPage: React.FC<RankingsPageProps> = ({ onBackToMap }) => {
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [bloodDeities, setBloodDeities] = useState<BloodDeity[]>([]);
  const [richVampires, setRichVampires] = useState<RichVampire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        setLoading(true);
        const [contributors, deities, vampires] = await Promise.all([
          ApiService.getTopContributors(20),
          ApiService.getBloodDeities(20),
          ApiService.getRichVampires(20)
        ]);

        setTopContributors(contributors);
        setBloodDeities(deities);
        setRichVampires(vampires);
      } catch (error) {
        console.error('Failed to load leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return `${diffDays}d ago`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <PageContainer>
      {onBackToMap && (
        <BackToMapButton onClick={onBackToMap}>
          ← Back to Map
        </BackToMapButton>
      )}

      <PageTitle>🏆 City Rankings</PageTitle>

      <LeaderboardsContainer>
        {/* Top Reporters */}
        <LeaderboardCard>
          <LeaderboardTitle>📊 Top Reporters</LeaderboardTitle>
          {loading ? (
            <LoadingState>Loading...</LoadingState>
          ) : topContributors.length === 0 ? (
            <EmptyState>No reporters yet</EmptyState>
          ) : (
            <LeaderboardList>
              {topContributors.map((contributor) => (
                <LeaderboardItem key={contributor.username} rank={contributor.rank} theme="reporters">
                  <RankBadge rank={contributor.rank}>#{contributor.rank}</RankBadge>
                  <PlayerInfo>
                    <PlayerName>{contributor.username}</PlayerName>
                  </PlayerInfo>
                  <StatValue theme="reporters">{contributor.total_reports} reports</StatValue>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          )}
        </LeaderboardCard>

        {/* Blood Deities */}
        <LeaderboardCard>
          <LeaderboardTitle>🩸 Blood Deities</LeaderboardTitle>
          {loading ? (
            <LoadingState>Loading...</LoadingState>
          ) : bloodDeities.length === 0 ? (
            <EmptyState>No blood deities reported yet</EmptyState>
          ) : (
            <LeaderboardList>
              {bloodDeities.map((deity) => (
                <LeaderboardItem key={deity.vampire_name} rank={deity.rank} theme="blood">
                  <RankBadge rank={deity.rank}>#{deity.rank}</RankBadge>
                  <PlayerInfo>
                    <PlayerName>{deity.vampire_name}</PlayerName>
                    <PlayerStats theme="blood">
                      Updated {formatTimeAgo(deity.last_updated)}
                      {deity.reporter_username && ` by ${deity.reporter_username}`}
                    </PlayerStats>
                  </PlayerInfo>
                  <StatValue theme="blood">{formatNumber(deity.blood_amount)} pints</StatValue>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          )}
        </LeaderboardCard>

        {/* Rich Vampires */}
        <LeaderboardCard>
          <LeaderboardTitle>💰 Rich Vampires</LeaderboardTitle>
          {loading ? (
            <LoadingState>Loading...</LoadingState>
          ) : richVampires.length === 0 ? (
            <EmptyState>No rich vampires reported yet</EmptyState>
          ) : (
            <LeaderboardList>
              {richVampires.map((vampire) => (
                <LeaderboardItem key={vampire.vampire_name} rank={vampire.rank} theme="rich">
                  <RankBadge rank={vampire.rank}>#{vampire.rank}</RankBadge>
                  <PlayerInfo>
                    <PlayerName>{vampire.vampire_name}</PlayerName>
                    <PlayerStats theme="rich">
                      Updated {formatTimeAgo(vampire.last_updated)}
                      {vampire.reporter_username && ` by ${vampire.reporter_username}`}
                    </PlayerStats>
                  </PlayerInfo>
                  {/* Rich vampires don't show coin amounts */}
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          )}
        </LeaderboardCard>
      </LeaderboardsContainer>
    </PageContainer>
  );
};