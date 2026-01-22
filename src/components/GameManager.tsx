'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, Player, GameMode, GAME_MODES, GameSession } from '@/types/game';

type GamePhase = 'MODE_SELECT' | 'START' | 'PASS' | 'REVEAL' | 'PLAYING' | 'GAME_END';

export default function GameManager() {
  const [phase, setPhase] = useState<GamePhase>('MODE_SELECT');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playersCount, setPlayersCount] = useState(4);
  const [impostorsCount, setImpostorsCount] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setPhase('START');
  };

  const startGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playersCount,
          impostorsCount,
          gameMode,
        }),
      });

      if (!response.ok) {
        // Tenta obter a mensagem de erro da resposta
        let errorMessage = 'Erro ao iniciar o jogo';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Se não conseguir parsear JSON, usa mensagem padrão
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setGameSession(data);
      setCurrentPlayerIndex(0);
      setPhase('PASS');
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar o jogo';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReady = () => {
    setPhase('REVEAL');
  };

  const handleSeen = () => {
    if (!gameSession) return;

    const nextIndex = currentPlayerIndex + 1;
    
    if (nextIndex >= gameSession.players.length) {
      setPhase('PLAYING');
    } else {
      setCurrentPlayerIndex(nextIndex);
      setPhase('PASS');
    }
  };

  // Gerenciar cronômetro quando estiver na fase PLAYING
  useEffect(() => {
    if (phase === 'PLAYING') {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [phase]);

  const resetGame = () => {
    setPhase('MODE_SELECT');
    setGameSession(null);
    setCurrentPlayerIndex(0);
    setTimer(0);
    setGameMode('CLASSIC');
  };

  const backToModeSelect = () => {
    setPhase('MODE_SELECT');
  };

  const endGame = () => {
    setPhase('GAME_END');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPlayer = gameSession?.players[currentPlayerIndex];

  const selectedModeInfo = GAME_MODES.find(m => m.id === gameMode);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Fase MODE_SELECT */}
        {phase === 'MODE_SELECT' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-4 text-yellow-400 drop-shadow-lg font-clash">
              CLASH IMPOSTOR
            </h1>
            <p className="text-white text-center mb-8 text-lg">
              Escolha o modo de jogo
            </p>
            
            <div className="space-y-4">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => selectMode(mode.id)}
                  className="w-full p-6 bg-white/10 hover:bg-white/20 rounded-2xl border-2 border-yellow-400/50 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{mode.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 font-clash">
                        {mode.name}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fase START */}
        {phase === 'START' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-4 text-yellow-400 drop-shadow-lg font-clash">
              CLASH IMPOSTOR
            </h1>
            
            {/* Modo selecionado */}
            <div className="bg-white/10 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedModeInfo?.icon}</span>
                <div>
                  <span className="text-yellow-400 font-bold font-clash">{selectedModeInfo?.name}</span>
                  <p className="text-white/60 text-xs">{selectedModeInfo?.description}</p>
                </div>
              </div>
              <button
                onClick={backToModeSelect}
                className="text-white/60 hover:text-white text-sm underline"
              >
                Alterar
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white text-lg font-semibold mb-2 font-clash">
                  Número de Jogadores
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={playersCount}
                  onChange={(e) => setPlayersCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white text-center text-2xl font-bold border-2 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 touch-manipulation"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-white text-lg font-semibold mb-2 font-clash">
                  Número de Impostores
                </label>
                <input
                  type="number"
                  min="1"
                  max={playersCount - 1}
                  value={impostorsCount}
                  onChange={(e) => setImpostorsCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 text-white text-center text-2xl font-bold border-2 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 touch-manipulation"
                  inputMode="numeric"
                />
              </div>

              <button
                onClick={startGame}
                disabled={isLoading || impostorsCount >= playersCount}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-xl rounded-xl border-4 border-yellow-600 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-clash"
              >
                {isLoading ? 'Iniciando...' : 'INICIAR JOGO'}
              </button>
            </div>
          </div>
        )}

        {/* Fase PASS */}
        {phase === 'PASS' && currentPlayer && (
          <div className="bg-blue-900/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col items-center justify-center animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-8 text-center font-clash">
              Passe o celular para o
            </h2>
            <div className="text-5xl font-bold text-yellow-400 mb-12 animate-pulse font-clash">
              Jogador {currentPlayer.id}
            </div>
            <button
              onClick={handleReady}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-xl border-4 border-green-700 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 font-clash"
            >
              Estou pronto
            </button>
          </div>
        )}

        {/* Fase REVEAL */}
        {phase === 'REVEAL' && currentPlayer && gameSession && (
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col items-center justify-center animate-flip-in">
            {currentPlayer.role === 'IMPOSTOR' && gameSession.gameMode === 'CLASSIC' ? (
              // Modo Clássico - Impostor não vê carta e sabe que é impostor
              <>
                <div className="text-6xl mb-6">👹</div>
                <h2 className="text-5xl font-bold text-red-500 mb-4 text-center animate-pulse drop-shadow-2xl font-clash">
                  VOCÊ É O IMPOSTOR
                </h2>
                <p className="text-white text-xl text-center mb-8">
                  Descubra qual é a carta secreta!
                </p>
              </>
            ) : (
              // Modo Espião (todos veem carta) OU Jogador normal no modo Clássico
              // No modo Espião, o impostor vê uma carta diferente mas NÃO sabe que é impostor
              <>
                <div className="mb-6 animate-bounce relative w-48 h-48">
                  <Image
                    src={currentPlayer.assignedCard?.iconUrls.medium || gameSession.secretCard.iconUrls.medium}
                    alt={currentPlayer.assignedCard?.name || gameSession.secretCard.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center font-clash">
                  {currentPlayer.assignedCard?.name || gameSession.secretCard.name}
                </h2>
                <p className="text-white text-lg text-center mb-8">
                  Memorize esta carta!
                </p>
              </>
            )}
            
            <button
              onClick={handleSeen}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-xl border-4 border-blue-700 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 font-clash"
            >
              Já vi
            </button>
          </div>
        )}

        {/* Fase PLAYING */}
        {phase === 'PLAYING' && gameSession && (
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col items-center justify-center animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{selectedModeInfo?.icon}</span>
              <span className="text-white/80 font-clash">{selectedModeInfo?.name}</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-8 text-center font-clash">
              JOGO EM ANDAMENTO
            </h2>
            
            <div className="bg-black/30 rounded-2xl p-8 mb-8 border-4 border-yellow-400">
              <div className="text-6xl font-bold text-yellow-400 text-center font-mono">
                {formatTime(timer)}
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={endGame}
                className="w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-xl rounded-xl border-4 border-yellow-600 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 font-clash"
              >
                Revelar Impostores
              </button>
              
              <button
                onClick={resetGame}
                className="w-full px-8 py-4 bg-red-500/80 hover:bg-red-600 text-white font-bold text-lg rounded-xl border-4 border-red-700 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 font-clash"
              >
                Cancelar Partida
              </button>
            </div>
          </div>
        )}

        {/* Fase GAME_END - Revelação dos Impostores */}
        {phase === 'GAME_END' && gameSession && (
          <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-6 text-center font-clash">
              FIM DE JOGO!
            </h2>
            
            <div className="text-6xl mb-4">👹</div>
            
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center font-clash">
              {gameSession.players.filter(p => p.role === 'IMPOSTOR').length > 1 
                ? 'OS IMPOSTORES ERAM:' 
                : 'O IMPOSTOR ERA:'}
            </h3>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {gameSession.players
                .filter(p => p.role === 'IMPOSTOR')
                .map(impostor => (
                  <div 
                    key={impostor.id}
                    className="bg-red-500/30 border-4 border-red-500 rounded-2xl px-8 py-4 animate-pulse"
                  >
                    <span className="text-4xl font-bold text-white font-clash">
                      Jogador {impostor.id}
                    </span>
                  </div>
                ))
              }
            </div>

            {/* Mostrar as cartas no modo Espião */}
            {gameSession.gameMode === 'SPY' && gameSession.impostorCard && (
              <div className="w-full bg-black/20 rounded-2xl p-6 mb-8">
                <h4 className="text-lg font-bold text-white/80 mb-4 text-center font-clash">
                  Cartas da rodada:
                </h4>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <Image
                        src={gameSession.secretCard.iconUrls.medium}
                        alt={gameSession.secretCard.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-green-400 font-bold text-sm font-clash">Carta Real</p>
                    <p className="text-white text-xs">{gameSession.secretCard.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <Image
                        src={gameSession.impostorCard.iconUrls.medium}
                        alt={gameSession.impostorCard.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <p className="text-red-400 font-bold text-sm font-clash">Carta do Espião</p>
                    <p className="text-white text-xs">{gameSession.impostorCard.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar a carta secreta no modo Clássico */}
            {gameSession.gameMode === 'CLASSIC' && (
              <div className="w-full bg-black/20 rounded-2xl p-6 mb-8">
                <h4 className="text-lg font-bold text-white/80 mb-4 text-center font-clash">
                  A carta secreta era:
                </h4>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <Image
                      src={gameSession.secretCard.iconUrls.medium}
                      alt={gameSession.secretCard.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-yellow-400 font-bold font-clash">{gameSession.secretCard.name}</p>
                </div>
              </div>
            )}

            <button
              onClick={resetGame}
              className="w-full px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-xl rounded-xl border-4 border-yellow-600 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 font-clash"
            >
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
