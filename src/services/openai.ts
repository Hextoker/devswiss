import 'server-only';

type OpenAIMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

interface OpenAIChatOptions {
    model?: string;
    messages: OpenAIMessage[];
    temperature?: number;
    maxTokens?: number;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const callOpenAIChat = async ({
    model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages,
    temperature = 0.2,
    maxTokens = 220,
}: OpenAIChatOptions): Promise<string> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing OPENAI_API_KEY env var.');
    }

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
        throw new Error('OpenAI returned an empty response.');
    }

    return content;
};
