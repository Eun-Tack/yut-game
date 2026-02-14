import React, { useState } from 'react';
import type { Player, Connection, YutResult } from '../types';
import './GameScreen.css';

interface GameScreenProps {
  players: Player[];
  onGameComplete: (connections: Connection[]) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ players: initialPlayers, onGameComplete }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [selectingResult, setSelectingResult] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{ from: string; to: string } | null>(null);

  const playSound = (type: 'select' | 'connect') => {
    // 효과음 재생 (나중에 구현)
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'select') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const handlePlayerClick = (playerId: string) => {
    if (!currentPlayer) {
      // 첫 번째 플레이어 선택
      setCurrentPlayer(playerId);
      playSound('select');
    } else if (playerId !== currentPlayer && !players.find(p => p.id === playerId)?.selected) {
      // 다음 플레이어 지목
      setPendingConnection({ from: currentPlayer, to: playerId });
      setSelectingResult(true);
      playSound('select');
    }
  };

  const handleResultSelect = (result: YutResult) => {
    if (!pendingConnection) return;

    playSound('connect');

    const newConnection: Connection = {
      from: pendingConnection.from,
      to: pendingConnection.to,
      result,
    };

    const newConnections = [...connections, newConnection];
    setConnections(newConnections);

    // 지목된 플레이어를 선택 상태로 변경
    setPlayers(players.map(p =>
      p.id === pendingConnection.to ? { ...p, selected: true } : p
    ));

    // 다음 차례로 넘어감
    setCurrentPlayer(pendingConnection.to);
    setPendingConnection(null);
    setSelectingResult(false);

    // 모든 플레이어가 선택되었는지 확인
    const allSelected = players.every(p =>
      p.id === pendingConnection.to || p.selected || p.id === currentPlayer
    );

    if (allSelected) {
      setTimeout(() => {
        onGameComplete(newConnections);
      }, 500);
    }
  };

  const handleResultCancel = () => {
    setPendingConnection(null);
    setSelectingResult(false);
  };

  // 원형 배치를 위한 좌표 계산
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // 화살표 그리기를 위한 SVG 경로 계산
  const getArrowPath = (fromId: string, toId: string) => {
    const fromIndex = players.findIndex(p => p.id === fromId);
    const toIndex = players.findIndex(p => p.id === toId);

    const fromPos = getPlayerPosition(fromIndex, players.length);
    const toPos = getPlayerPosition(toIndex, players.length);

    // 곡선 화살표를 위한 제어점 계산
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 두 점 사이의 거리 계산
    const distance = Math.sqrt(
      Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2)
    );

    // 중심에서 바깥쪽으로 약간 휘게 (거리에 비례)
    const dx = midX - centerX;
    const dy = midY - centerY;
    const len = Math.sqrt(dx * dx + dy * dy);

    // len이 너무 작으면 기본값 사용
    const offset = len > 10 ? (distance * 0.15) : 30;
    const controlX = len > 10 ? midX + (dx / len) * offset : midX;
    const controlY = len > 10 ? midY + (dy / len) * offset : midY - 30;

    return {
      path: `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`,
      labelX: controlX,
      labelY: controlY,
    };
  };

  return (
    <div className="game-screen">
      {/* 플레이어 노드들 */}
      {players.map((player, index) => {
        const pos = getPlayerPosition(index, players.length);
        const isCurrentPlayer = player.id === currentPlayer;
        const isSelectable = currentPlayer && !player.selected && player.id !== currentPlayer;

        return (
          <div
            key={player.id}
            className={`player-node ${player.selected ? 'selected' : ''} ${isCurrentPlayer ? 'current' : ''} ${isSelectable ? 'selectable' : ''}`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
            }}
            onClick={() => handlePlayerClick(player.id)}
          >
            {player.name}
          </div>
        );
      })}

      {/* 연결 화살표들 */}
      <svg className="connections-svg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ff6b9d" />
          </marker>
        </defs>
        {connections.map((conn, index) => {
          const arrow = getArrowPath(conn.from, conn.to);
          return (
            <g key={index} className="connection-group">
              <path
                d={arrow.path}
                stroke="#ff6b9d"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="connection-arrow"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
              <text
                x={arrow.labelX}
                y={arrow.labelY}
                textAnchor="middle"
                className="connection-label"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {conn.result}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 빽도/도/개/걸/윷/모 선택 모달 */}
      {selectingResult && (
        <div className="result-modal">
          <div className="result-modal-content">
            <h3>결과를 선택하세요</h3>
            <div className="result-buttons">
              {(['빽도', '도', '개', '걸', '윷', '모'] as YutResult[]).map(result => (
                <button
                  key={result}
                  onClick={() => handleResultSelect(result)}
                  className="result-button"
                >
                  {result}
                </button>
              ))}
            </div>
            <button onClick={handleResultCancel} className="cancel-button">
              뒤로
            </button>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="instruction">
        {!currentPlayer && '시작할 플레이어를 선택하세요'}
        {currentPlayer && !selectingResult && `${players.find(p => p.id === currentPlayer)?.name}님, 다음 플레이어를 지목하세요`}
      </div>
    </div>
  );
};
