import React, { useEffect, useState } from 'react';
import type { Connection, Player, YutResult } from '../types';
import './ResultScreen.css';

interface ResultScreenProps {
  players: Player[];
  connections: Connection[];
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ players, connections, onRestart }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 빵빠레 효과음
    playCelebration();
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const playCelebration = () => {
    const audioContext = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (높은음)

    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 150);
    });
  };

  // 각 결과별로 그룹화
  const groupByResult = () => {
    const groups: Record<YutResult, { from: string; to: string }[]> = {
      '빽도': [],
      '도': [],
      '개': [],
      '걸': [],
      '윷': [],
      '모': [],
    };

    connections.forEach(conn => {
      if (conn.result) {
        const fromPlayer = players.find(p => p.id === conn.from);
        const toPlayer = players.find(p => p.id === conn.to);
        if (fromPlayer && toPlayer) {
          groups[conn.result].push({
            from: fromPlayer.name,
            to: toPlayer.name,
          });
        }
      }
    });

    return groups;
  };

  const resultGroups = groupByResult();
  const resultOrder: YutResult[] = ['빽도', '도', '개', '걸', '윷', '모'];

  return (
    <div className="result-screen">
      {showConfetti && <div className="confetti-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: ['#ff6b9d', '#ffa6c1', '#a8edea', '#fed6e3', '#e0c3fc'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>}

      <div className="result-content">
        <h1 className="result-title">🎉 게임 결과 🎉</h1>

        <div className="result-table">
          {resultOrder.map((result, index) => (
            <div
              key={result}
              className="result-row"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="result-name">{result}</div>
              <div className="result-list">
                {resultGroups[result].length > 0 ? (
                  resultGroups[result].map((conn, idx) => (
                    <div key={idx} className="result-item">
                      <span className="player-name">{conn.from}</span>
                      <span className="arrow">→</span>
                      <span className="player-name">{conn.to}</span>
                    </div>
                  ))
                ) : (
                  <div className="result-item empty">없음</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">총 연결 수</div>
            <div className="stat-value">{connections.length}</div>
          </div>
          {resultOrder.map(result => (
            <div key={result} className="stat-item">
              <div className="stat-label">{result}</div>
              <div className="stat-value">{resultGroups[result].length}</div>
            </div>
          ))}
        </div>

        <button className="restart-button" onClick={onRestart}>
          새 게임 시작
        </button>
      </div>
    </div>
  );
};
