import React, { useState } from 'react';
import './PlayerInput.css';

interface PlayerInputProps {
  onComplete: (playerNames: string[]) => void;
}

export const PlayerInput: React.FC<PlayerInputProps> = ({ onComplete }) => {
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(10).fill(''));
  const [step, setStep] = useState<'count' | 'names'>('count');

  const handleCountSubmit = () => {
    if (playerCount >= 2 && playerCount <= 30) {
      setPlayerNames(Array(playerCount).fill(''));
      setStep('names');
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleNamesSubmit = () => {
    // 빈 값은 플레이어 번호로 대체
    const finalNames = playerNames.map((name, index) =>
      name.trim() !== '' ? name.trim() : `플레이어 ${index + 1}`
    );
    onComplete(finalNames);
  };

  if (step === 'count') {
    return (
      <div className="player-input">
        <div className="input-card">
          <h2>몇 명이 참여하나요?</h2>
          <input
            type="number"
            min="2"
            max="30"
            value={playerCount}
            onChange={(e) => setPlayerCount(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
            className="count-input"
          />
          <button onClick={handleCountSubmit} className="submit-button">
            다음
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-input">
      <div className="input-card names-card">
        <h2>플레이어 이름을 입력하세요</h2>
        <div className="names-grid">
          {playerNames.map((name, index) => (
            <div key={index} className="name-input-wrapper">
              <span className="player-index">{index + 1}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`플레이어 ${index + 1}`}
                className="name-input"
              />
            </div>
          ))}
        </div>
        <button onClick={handleNamesSubmit} className="submit-button">
          게임 시작
        </button>
      </div>
    </div>
  );
};
