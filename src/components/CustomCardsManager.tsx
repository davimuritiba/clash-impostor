'use client';

import { useState, useEffect } from 'react';
import { Card, CUSTOM_CARDS_STORAGE_KEY } from '@/types/game';

interface CustomCardsManagerProps {
  onClose: () => void;
  onCardsUpdate: (cards: Card[]) => void;
}

export default function CustomCardsManager({ onClose, onCardsUpdate }: CustomCardsManagerProps) {
  const [customCards, setCustomCards] = useState<Card[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardEmoji, setNewCardEmoji] = useState('🎴');
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Carregar cartas do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
    if (stored) {
      try {
        const cards = JSON.parse(stored);
        setCustomCards(cards);
        onCardsUpdate(cards);
      } catch {
        console.error('Erro ao carregar cartas personalizadas');
      }
    }
  }, [onCardsUpdate]);

  // Salvar cartas no localStorage
  const saveCards = (cards: Card[]) => {
    localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(cards));
    setCustomCards(cards);
    onCardsUpdate(cards);
  };

  const addCard = () => {
    if (!newCardName.trim()) return;

    const newCard: Card = {
      id: Date.now(), // ID único baseado no timestamp
      name: newCardName.trim(),
      iconUrls: {
        medium: newCardEmoji, // Usamos emoji como "ícone"
      },
      isCustom: true,
    };

    saveCards([...customCards, newCard]);
    setNewCardName('');
    setNewCardEmoji('🎴');
  };

  const deleteCard = (cardId: number) => {
    saveCards(customCards.filter(card => card.id !== cardId));
  };

  const startEditing = (card: Card) => {
    setEditingCard(card);
    setNewCardName(card.name);
    setNewCardEmoji(card.iconUrls.medium);
  };

  const saveEdit = () => {
    if (!editingCard || !newCardName.trim()) return;

    const updatedCards = customCards.map(card =>
      card.id === editingCard.id
        ? { ...card, name: newCardName.trim(), iconUrls: { medium: newCardEmoji } }
        : card
    );

    saveCards(updatedCards);
    setEditingCard(null);
    setNewCardName('');
    setNewCardEmoji('🎴');
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setNewCardName('');
    setNewCardEmoji('🎴');
  };

  // Emojis sugeridos para cartas
  const suggestedEmojis = ['🎴', '⭐', '🔥', '💎', '🎯', '🏆', '👑', '⚡', '🌟', '💀', '🐉', '🦁', '🐺', '🦅', '🎪', '🎭', '🎨', '🎸', '🚀', '💫'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 font-clash">
            Cartas Personalizadas
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Formulário de adicionar/editar */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <h3 className="text-white font-semibold mb-3 font-clash">
            {editingCard ? 'Editar Carta' : 'Nova Carta'}
          </h3>
          
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              className="text-4xl bg-white/10 rounded-xl p-2 hover:bg-white/20 transition-colors"
              onClick={() => {
                const randomEmoji = suggestedEmojis[Math.floor(Math.random() * suggestedEmojis.length)];
                setNewCardEmoji(randomEmoji);
              }}
            >
              {newCardEmoji}
            </button>
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="Nome da carta..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-yellow-400/50 focus:border-yellow-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  editingCard ? saveEdit() : addCard();
                }
              }}
            />
          </div>

          {/* Seletor de emojis */}
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewCardEmoji(emoji)}
                className={`text-xl p-1 rounded-lg transition-all ${
                  newCardEmoji === emoji
                    ? 'bg-yellow-400 scale-110'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {editingCard ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={!newCardName.trim()}
                  className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-clash"
                >
                  Salvar
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors font-clash"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={addCard}
                disabled={!newCardName.trim()}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-clash"
              >
                Adicionar Carta
              </button>
            )}
          </div>
        </div>

        {/* Lista de cartas */}
        <div className="flex-1 overflow-y-auto">
          {customCards.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <span className="text-4xl block mb-2">📭</span>
              <p>Nenhuma carta personalizada ainda.</p>
              <p className="text-sm">Adicione cartas acima!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white/10 rounded-xl p-3 flex items-center gap-3 group"
                >
                  <span className="text-3xl">{card.iconUrls.medium}</span>
                  <span className="flex-1 text-white font-semibold truncate">
                    {card.name}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(card)}
                      className="p-2 bg-blue-500/50 hover:bg-blue-500 rounded-lg text-white transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg text-white transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contador */}
        <div className="mt-4 text-center text-white/60 text-sm">
          {customCards.length} carta{customCards.length !== 1 ? 's' : ''} personalizada{customCards.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
