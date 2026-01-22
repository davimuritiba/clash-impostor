'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CUSTOM_CARDS_STORAGE_KEY, hasCustomImage } from '@/types/game';

interface CustomCardsManagerProps {
  onClose: () => void;
  onCardsUpdate: (cards: Card[]) => void;
}

export default function CustomCardsManager({ onClose, onCardsUpdate }: CustomCardsManagerProps) {
  const [customCards, setCustomCards] = useState<Card[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardEmoji, setNewCardEmoji] = useState('🎴');
  const [newCardImageUrl, setNewCardImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [imageError, setImageError] = useState(false);

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

  const resetForm = () => {
    setNewCardName('');
    setNewCardEmoji('🎴');
    setNewCardImageUrl('');
    setShowImageInput(false);
    setEditingCard(null);
    setImageError(false);
  };

  const addCard = () => {
    if (!newCardName.trim()) return;

    const newCard: Card = {
      id: Date.now(),
      name: newCardName.trim(),
      iconUrls: {
        medium: newCardEmoji,
      },
      isCustom: true,
      customImageUrl: newCardImageUrl.trim() || undefined,
    };

    saveCards([...customCards, newCard]);
    resetForm();
  };

  const deleteCard = (cardId: number) => {
    saveCards(customCards.filter(card => card.id !== cardId));
  };

  const startEditing = (card: Card) => {
    setEditingCard(card);
    setNewCardName(card.name);
    setNewCardEmoji(card.iconUrls.medium);
    setNewCardImageUrl(card.customImageUrl || '');
    setShowImageInput(!!card.customImageUrl);
    setImageError(false);
  };

  const saveEdit = () => {
    if (!editingCard || !newCardName.trim()) return;

    const updatedCards = customCards.map(card =>
      card.id === editingCard.id
        ? { 
            ...card, 
            name: newCardName.trim(), 
            iconUrls: { medium: newCardEmoji },
            customImageUrl: newCardImageUrl.trim() || undefined,
          }
        : card
    );

    saveCards(updatedCards);
    resetForm();
  };

  const cancelEdit = () => {
    resetForm();
  };

  // Validar URL da imagem
  const isValidImageUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Vazio é válido (opcional)
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
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
            className="text-white/60 hover:text-white text-2xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Formulário de adicionar/editar */}
        <div className="bg-white/10 rounded-xl p-4 mb-4 flex-shrink-0">
          <h3 className="text-white font-semibold mb-3 font-clash">
            {editingCard ? 'Editar Carta' : 'Nova Carta'}
          </h3>
          
          {/* Preview e Nome */}
          <div className="flex gap-3 mb-3">
            {/* Preview da carta */}
            <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
              {newCardImageUrl && isValidImageUrl(newCardImageUrl) && !imageError ? (
                <Image
                  src={newCardImageUrl}
                  alt="Preview"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <span className="text-3xl">{newCardEmoji}</span>
              )}
            </div>
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="Nome da carta..."
              className="flex-1 min-w-0 px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-yellow-400/50 focus:border-yellow-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  editingCard ? saveEdit() : addCard();
                }
              }}
            />
          </div>

          {/* Toggle para imagem personalizada */}
          <button
            type="button"
            onClick={() => {
              setShowImageInput(!showImageInput);
              if (showImageInput) {
                setNewCardImageUrl('');
                setImageError(false);
              }
            }}
            className="text-sm text-purple-300 hover:text-purple-200 mb-3 flex items-center gap-2"
          >
            <span>{showImageInput ? '➖' : '➕'}</span>
            <span>{showImageInput ? 'Remover imagem' : 'Adicionar imagem (opcional)'}</span>
          </button>

          {/* Campo de URL da imagem */}
          {showImageInput && (
            <div className="mb-3">
              <input
                type="url"
                value={newCardImageUrl}
                onChange={(e) => {
                  setNewCardImageUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="URL da imagem (https://...)"
                className={`w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 focus:outline-none text-sm ${
                  newCardImageUrl && !isValidImageUrl(newCardImageUrl)
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-purple-400/50 focus:border-purple-400'
                }`}
              />
              {newCardImageUrl && !isValidImageUrl(newCardImageUrl) && (
                <p className="text-red-400 text-xs mt-1">URL inválida</p>
              )}
              {imageError && (
                <p className="text-yellow-400 text-xs mt-1">Não foi possível carregar a imagem. Usando emoji como fallback.</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                Cole a URL de uma imagem da internet
              </p>
            </div>
          )}

          {/* Seletor de emojis (sempre visível como fallback) */}
          <div className="mb-3">
            <p className="text-white/60 text-xs mb-2">
              {showImageInput ? 'Emoji (usado se a imagem não carregar):' : 'Escolha um emoji:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCardEmoji(emoji)}
                  className={`text-lg p-1 rounded-lg transition-all ${
                    newCardEmoji === emoji
                      ? 'bg-yellow-400 scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {editingCard ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={!newCardName.trim() || !!(newCardImageUrl && !isValidImageUrl(newCardImageUrl))}
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
                disabled={!newCardName.trim() || !!(newCardImageUrl && !isValidImageUrl(newCardImageUrl))}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-clash"
              >
                Adicionar Carta
              </button>
            )}
          </div>
        </div>

        {/* Lista de cartas */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {customCards.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <span className="text-4xl block mb-2">📭</span>
              <p>Nenhuma carta personalizada ainda.</p>
              <p className="text-sm">Adicione cartas acima!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customCards.map((card) => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  onEdit={startEditing} 
                  onDelete={deleteCard} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Contador */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center text-white/60 text-sm flex-shrink-0">
          {customCards.length} carta{customCards.length !== 1 ? 's' : ''} personalizada{customCards.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

// Componente separado para item da lista (melhor performance)
function CardItem({ 
  card, 
  onEdit, 
  onDelete 
}: { 
  card: Card; 
  onEdit: (card: Card) => void; 
  onDelete: (id: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = hasCustomImage(card) && !imgError;

  return (
    <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/10">
        {showImage ? (
          <Image
            src={card.customImageUrl!}
            alt={card.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <span className="text-2xl">{card.iconUrls.medium}</span>
        )}
      </div>
      <span className="flex-1 text-white font-semibold truncate min-w-0">
        {card.name}
      </span>
      <div className="flex gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(card)}
          className="p-2 bg-blue-500/50 hover:bg-blue-500 rounded-lg text-white transition-colors"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(card.id)}
          className="p-2 bg-red-500/50 hover:bg-red-500 rounded-lg text-white transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
