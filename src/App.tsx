import { useState } from 'react';
import type { ScreenType, Player, Connection } from './types';
import { MainScreen } from './components/MainScreen';
import { PlayerInput } from './components/PlayerInput';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import './App.css';

function App() {
  const [screen, setScreen] = useState<ScreenType>('main');
  const [players, setPlayers] = useState<Player[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const handleStart = () => {
    setScreen('input');
  };

  const handlePlayersComplete = (playerNames: string[]) => {
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      selected: false,
    }));
    setPlayers(newPlayers);
    setScreen('game');
  };

  const handleGameComplete = (gameConnections: Connection[]) => {
    setConnections(gameConnections);
    setScreen('result');
  };

  const handleRestart = () => {
    setPlayers([]);
    setConnections([]);
    setScreen('main');
  };

  return (
    <div className="app">
      {screen === 'main' && <MainScreen onStart={handleStart} />}
      {screen === 'input' && <PlayerInput onComplete={handlePlayersComplete} />}
      {screen === 'game' && <GameScreen players={players} onGameComplete={handleGameComplete} />}
      {screen === 'result' && (
        <ResultScreen players={players} connections={connections} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
