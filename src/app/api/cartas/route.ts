import { NextResponse } from "next/server";

export async function GET() {
    const token = process.env.CLASH_ROYALE_API_KEY;

    if (!token) {
        return NextResponse.json(
            { error: 'Chave da API do Clash Royale não configurada' },
            { status: 500 }
        );
    }

    // Remove espaços e caracteres invisíveis da chave
    const cleanToken = token.trim();

    try {
        const res = await fetch('https://api.clashroyale.com/v1/cards', {
            headers: {
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            let errorMessage = `Falha ao buscar cartas: ${res.status} ${res.statusText}`;
            let errorData = null;
            
            // Tenta obter mensagem de erro mais específica da API
            try {
                const errorText = await res.text();
                console.error('Erro na API do Clash Royale:', res.status, errorText);
                
                try {
                    errorData = JSON.parse(errorText);
                    if (errorData.reason) {
                        errorMessage = `Erro na API: ${errorData.reason}`;
                    }
                } catch {
                    // Se não for JSON, usa o texto como está
                    errorMessage = errorText || errorMessage;
                }
            } catch {
                // Se não conseguir ler a resposta
                console.error('Erro ao ler resposta da API');
            }
            
            // Tratamento específico para erro 403
            if (res.status === 403) {
                // Verifica se o erro é relacionado a IP não autorizado
                const errorText = errorData ? JSON.stringify(errorData) : errorMessage;
                const isIpError = errorText.toLowerCase().includes('ip') || 
                                 errorText.toLowerCase().includes('address') ||
                                 errorMessage.toLowerCase().includes('ip');
                
                if (isIpError) {
                    errorMessage = 'IP não autorizado. A chave da API não permite acesso deste endereço IP. Acesse https://developer.clashroyale.com/ e adicione seu IP na lista de IPs permitidos do token.';
                } else {
                    errorMessage = 'Chave da API inválida ou sem permissões. Verifique se a chave está correta e ativa em https://developer.clashroyale.com/';
                }
            }
            
            return NextResponse.json(
                { error: errorMessage },
                { status: res.status }
            );
        }

        const data = await res.json();

        if (!data.items || !Array.isArray(data.items)) {
            return NextResponse.json(
                { error: 'Formato de resposta inválido da API' },
                { status: 500 }
            );
        }

        return NextResponse.json(data.items);
    } catch (error) {
        console.error('Erro ao buscar cartas:', error);
        return NextResponse.json(
            { error: 'Erro ao conectar com a API do Clash Royale' },
            { status: 500 }
        );
    }
}