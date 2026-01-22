'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card, CUSTOM_CARDS_STORAGE_KEY, hasCustomImage } from '@/types/game';

interface CustomCardsManagerProps {
  onClose: () => void;
  onCardsUpdate: (cards: Card[]) => void;
}

// Tamanho máximo da imagem em bytes (500KB para não sobrecarregar localStorage)
const MAX_IMAGE_SIZE = 500 * 1024;

export default function CustomCardsManager({ onClose, onCardsUpdate }: CustomCardsManagerProps) {
  const [customCards, setCustomCards] = useState<Card[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardImage, setNewCardImage] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(cards));
      setCustomCards(cards);
      onCardsUpdate(cards);
    } catch (error) {
      // localStorage cheio
      console.error('Erro ao salvar cartas:', error);
      setImageError('Armazenamento cheio. Tente usar imagens menores ou remover algumas cartas.');
    }
  };

  const resetForm = () => {
    setNewCardName('');
    setNewCardImage(null);
    setEditingCard(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Processar upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setImageError('Selecione um arquivo de imagem válido');
      setIsProcessingImage(false);
      return;
    }

    // Verificar tamanho
    if (file.size > MAX_IMAGE_SIZE * 2) {
      setImageError('Imagem muito grande. Máximo 1MB');
      setIsProcessingImage(false);
      return;
    }

    try {
      // Comprimir e converter para base64
      const base64 = await compressAndConvertToBase64(file);
      setNewCardImage(base64);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setImageError('Erro ao processar imagem');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Comprimir imagem e converter para base64
  const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Erro ao criar canvas'));
            return;
          }

          // Redimensionar mantendo proporção (máximo 200x200)
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Converter para base64 com compressão
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = () => {
    setNewCardImage(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addCard = () => {
    if (!newCardName.trim()) return;

    const newCard: Card = {
      id: Date.now(),
      name: newCardName.trim(),
      iconUrls: {
        medium: '🎴', // Fallback padrão
      },
      isCustom: true,
      customImageUrl: newCardImage || undefined,
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
    setNewCardImage(card.customImageUrl || null);
    setImageError(null);
  };

  const saveEdit = () => {
    if (!editingCard || !newCardName.trim()) return;

    const updatedCards = customCards.map(card =>
      card.id === editingCard.id
        ? { 
            ...card, 
            name: newCardName.trim(), 
            customImageUrl: newCardImage || undefined,
          }
        : card
    );

    saveCards(updatedCards);
    resetForm();
  };

  const cancelEdit = () => {
    resetForm();
  };

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
            <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/30">
              {newCardImage ? (
                <Image
                  src={newCardImage}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white/40 text-xs text-center px-1">Sem imagem</span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                type="text"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Nome da carta..."
                className="w-full px-3 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-yellow-400/50 focus:border-yellow-400 focus:outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    editingCard ? saveEdit() : addCard();
                  }
                }}
              />
              
              {/* Botão de upload */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="flex-1 px-3 py-1.5 bg-purple-500/50 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  {isProcessingImage ? '⏳ Processando...' : '📷 Escolher imagem'}
                </button>
                {newCardImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3 py-1.5 bg-red-500/50 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {imageError && (
            <p className="text-red-400 text-xs mb-3">{imageError}</p>
          )}

          {/* Nota sobre imagem opcional */}
          <p className="text-white/40 text-xs mb-3">
            💡 A imagem é opcional. Cartas sem imagem mostram um ícone padrão.
          </p>

          <div className="flex gap-2">
            {editingCard ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={!newCardName.trim() || isProcessingImage}
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
                disabled={!newCardName.trim() || isProcessingImage}
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

// Componente separado para item da lista
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
          <span className="text-2xl">🎴</span>
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
