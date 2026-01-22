import { NextResponse } from 'next/server';
import { setupGame } from '@/services/gameLogic';

export async function POST(request: Request) {
  try {
    const { playersCount, impostorsCount, mode } = await request.json();

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

    const apiKey = process.env.CLASH_ROYALE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave da API do Clash Royale não configurada' },
        { status: 500 }
      );
    }

    // Remove espaços e caracteres invisíveis da chave
    const cleanApiKey = apiKey.trim();
    const authHeader = `Bearer ${cleanApiKey}`;

    // Usando proxy do RoyaleAPI para evitar problemas com IPs dinâmicos
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
      let errorDetails = null;
      
      // Tenta obter mensagem de erro mais específica da API
      try {
        const errorText = await response.text();
        
        try {
          errorDetails = JSON.parse(errorText);
          if (errorDetails.reason) {
            errorMessage = `Erro na API: ${errorDetails.reason}`;
          } else if (errorDetails.message) {
            errorMessage = `Erro na API: ${errorDetails.message}`;
          }
        } catch {
          // Se não for JSON, usa o texto como está
          errorMessage = errorText || errorMessage;
        }
      } catch {
        // Erro ao ler resposta
      }
      
      // Tratamento específico para erro 403
      if (response.status === 403) {
        // Verifica se o erro é relacionado a IP não autorizado
        const errorText = errorDetails ? JSON.stringify(errorDetails) : '';
        const isIpError = errorText.toLowerCase().includes('ip') || 
                         errorText.toLowerCase().includes('address') ||
                         errorMessage.toLowerCase().includes('ip');
        
        if (isIpError) {
          errorMessage = 'IP não autorizado. A chave da API não permite acesso deste endereço IP. Acesse https://developer.clashroyale.com/ e adicione seu IP na lista de IPs permitidos do token.';
        } else {
          const detailedMessage = errorDetails 
            ? `Chave da API inválida ou sem permissões. Detalhes: ${JSON.stringify(errorDetails)}`
            : 'Chave da API inválida ou sem permissões. Verifique se a chave está correta e ativa em https://developer.clashroyale.com/';
          errorMessage = detailedMessage;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma carta encontrada na API' },
        { status: 500 }
      );
    }

    const allCards = data.items;
    
    // Determinar modo de jogo
    const gameMode = (mode === 'DOUBLE_TROUBLE') ? 'DOUBLE_TROUBLE' : 'CLASSIC';

    // Inicia a lógica do jogo passando as cartas e configs
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