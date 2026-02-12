import React from 'react';
import './MainScreen.css';

interface MainScreenProps {
  onStart: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ onStart }) => {
  return (
    <div className="main-screen">
      <div className="main-content">
        <h1 className="title">편안한교회</h1>
        <h2 className="subtitle">2026년 설맞이 사랑의 윷놀이</h2>
        <button className="start-button" onClick={onStart}>
          시작하기
        </button>
      </div>
    </div>
  );
};
