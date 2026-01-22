import { NextResponse } from 'next/server';
import { setupGame } from '@/services/gameLogic';
import { GameMode, CardSource, Card } from '@/types/game';

// Função para buscar cartas do Clash Royale
async function fetchClashRoyaleCards(): Promise<Card[]> {
  const apiKey = process.env.CLASH_ROYALE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Chave da API do Clash Royale não configurada');
  }

  const cleanApiKey = apiKey.trim();
  const authHeader = `Bearer ${cleanApiKey}`;

  const response = await fetch('https://proxy.royaleapi.dev/v1/cards', {
    method: 'GET',
    headers: { 
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Erro ao buscar cartas: ${response.status} ${response.statusText}`;
    
    try {
      const errorText = await response.text();
      try {
        const errorDetails = JSON.parse(errorText);
        if (errorDetails.reason) {
          errorMessage = `Erro na API: ${errorDetails.reason}`;
        } else if (errorDetails.message) {
          errorMessage = `Erro na API: ${errorDetails.message}`;
        }
      } catch {
        errorMessage = errorText || errorMessage;
      }
    } catch {
      // Erro ao ler resposta
    }
    
    if (response.status === 403) {
      errorMessage = 'IP não autorizado ou chave da API inválida. Verifique em https://developer.clashroyale.com/';
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Nenhuma carta encontrada na API');
  }

  return data.items;
}

export async function POST(request: Request) {
  try {
    const { 
      playersCount, 
      impostorsCount, 
      gameMode = "CLASSIC",
      cardSource = "CLASH",
      customCards = []
    } = await request.json() as {
      playersCount: number;
      impostorsCount: number;
      gameMode?: GameMode;
      cardSource?: CardSource;
      customCards?: Card[];
    };

    // Validação dos dados de entrada
    if (!playersCount || !impostorsCount) {
      return NextResponse.json(
        { error: 'Número de jogadores e impostores são obrigatórios' },
        { status: 400 }
      );
    }

    if (typeof playersCount !== 'number' || typeof impostorsCount !== 'number') {
      return NextResponse.json(
        { error: 'Número de jogadores e impostores devem ser números' },
        { status: 400 }
      );
    }

    if (playersCount < 3 || playersCount > 10) {
      return NextResponse.json(
        { error: 'Número de jogadores deve estar entre 3 e 10' },
        { status: 400 }
      );
    }

    if (impostorsCount < 1 || impostorsCount >= playersCount) {
      return NextResponse.json(
        { error: 'Número de impostores deve ser pelo menos 1 e menor que o número de jogadores' },
        { status: 400 }
      );
    }

    // Valida o modo de jogo
    const validModes: GameMode[] = ["CLASSIC", "SPY"];
    if (!validModes.includes(gameMode)) {
      return NextResponse.json(
        { error: 'Modo de jogo inválido. Use "CLASSIC" ou "SPY"' },
        { status: 400 }
      );
    }

    // Valida a fonte de cartas
    const validSources: CardSource[] = ["CLASH", "CUSTOM", "BOTH"];
    if (!validSources.includes(cardSource)) {
      return NextResponse.json(
        { error: 'Fonte de cartas inválida. Use "CLASH", "CUSTOM" ou "BOTH"' },
        { status: 400 }
      );
    }

    // Monta a lista de cartas baseada na fonte selecionada
    let allCards: Card[] = [];

    if (cardSource === 'CLASH' || cardSource === 'BOTH') {
      try {
        const clashCards = await fetchClashRoyaleCards();
        allCards = [...allCards, ...clashCards];
      } catch (error) {
        // Se estiver usando apenas Clash, propaga o erro
        if (cardSource === 'CLASH') {
          return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao buscar cartas do Clash Royale' },
            { status: 500 }
          );
        }
        // Se estiver usando BOTH, continua apenas com as personalizadas
        console.error('Erro ao buscar cartas do Clash (usando apenas personalizadas):', error);
      }
    }

    if (cardSource === 'CUSTOM' || cardSource === 'BOTH') {
      if (!customCards || customCards.length < 2) {
        return NextResponse.json(
          { error: 'Você precisa de pelo menos 2 cartas personalizadas' },
          { status: 400 }
        );
      }
      allCards = [...allCards, ...customCards];
    }

    // Verifica se tem cartas suficientes
    if (allCards.length < 2) {
      return NextResponse.json(
        { error: 'Não há cartas suficientes para iniciar o jogo' },
        { status: 400 }
      );
    }

    // Inicia a lógica do jogo passando as cartas, configs e modo de jogo
    const gameSession = setupGame(allCards, playersCount, impostorsCount, gameMode);

    return NextResponse.json(gameSession);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erro ao processar dados da requisição' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}