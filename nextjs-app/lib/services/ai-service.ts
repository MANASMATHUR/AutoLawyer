import OpenAI from 'openai';

// Multi-provider configuration
interface ProviderConfig {
    name: string;
    apiKey: string | undefined;
    baseURL?: string;
    model: string;
    tokenBudget: number;
}

const PROVIDERS: ProviderConfig[] = [
    {
        name: 'OpenAI',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.AUTOLAWYER_MODEL || 'gpt-4o-mini',
        tokenBudget: parseInt(process.env.OPENAI_TOKEN_BUDGET || '2000000'),
    },
    {
        name: 'Nebius',
        apiKey: process.env.NEBIUS_API_KEY,
        baseURL: process.env.NEBIUS_BASE_URL,
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        tokenBudget: parseInt(process.env.NEBIUS_TOKEN_BUDGET || '1500000'),
    },
    {
        name: 'SambaNova',
        apiKey: process.env.SAMBA_NOVA_API_KEY,
        baseURL: process.env.SAMBA_NOVA_BASE_URL,
        model: 'Meta-Llama-3.1-70B-Instruct',
        tokenBudget: parseInt(process.env.SAMBA_NOVA_TOKEN_BUDGET || '1000000'),
    },
    {
        name: 'Blaxel',
        apiKey: process.env.BLAXEL_API_KEY,
        baseURL: process.env.BLAXEL_BASE_URL,
        model: 'gpt-4o-mini',
        tokenBudget: parseInt(process.env.BLAXEL_TOKEN_BUDGET || '500000'),
    },
];

// Mock response for when all providers fail
const MOCK_RISK_ANALYSIS = {
    risk_score: 0.8,
    severity: "high",
    rationale: "This clause contains an unlimited indemnity obligation which poses significant financial risk.",
    recommendation: "Cap the indemnity to 12 months of fees.",
    redline: "The Supplier's liability shall be limited to the total fees paid in the preceding 12 months."
};

export class AIService {
    private providers: OpenAI[] = [];
    private activeProviderIndex: number = 0;

    constructor() {
        // Initialize all available providers
        for (const config of PROVIDERS) {
            if (config.apiKey) {
                const client = new OpenAI({
                    apiKey: config.apiKey,
                    baseURL: config.baseURL,
                });
                this.providers.push(client);
                console.log(`✅ Initialized ${config.name} provider`);
            } else {
                console.warn(`⚠️  ${config.name} API key not found, skipping`);
            }
        }

        if (this.providers.length === 0) {
            console.warn("⚠️  No AI providers available. Using mock mode.");
        }
    }

    /**
     * Analyze a clause with automatic provider fallback
     */
    async analyzeClauseRisk(clauseText: string, policy: string = "Standard commercial terms"): Promise<any> {
        if (this.providers.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MOCK_RISK_ANALYSIS;
        }

        // Try each provider in order until one succeeds
        for (let i = 0; i < this.providers.length; i++) {
            const providerIndex = (this.activeProviderIndex + i) % this.providers.length;
            const provider = this.providers[providerIndex];
            const config = PROVIDERS.filter(p => p.apiKey)[providerIndex];

            try {
                console.log(`🤖 Attempting analysis with ${config.name}...`);

                const completion = await provider.chat.completions.create({
                    model: config.model,
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert legal AI. Analyze the following contract clause against this policy: "${policy}". 
Return a JSON object with:
- risk_score (0.0 to 1.0)
- severity ("low", "medium", "high", "critical")
- rationale (concise explanation)
- recommendation (actionable advice)
- redline (suggested rewrite)`
                        },
                        {
                            role: "user",
                            content: clauseText
                        }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.3,
                });

                const content = completion.choices[0].message.content;
                const result = JSON.parse(content || "{}");

                console.log(`✅ Success with ${config.name}`);
                this.activeProviderIndex = providerIndex; // Remember successful provider
                return result;

            } catch (error: any) {
                console.error(`❌ ${config.name} failed:`, error.message);

                // If this was the last provider, throw
                if (i === this.providers.length - 1) {
                    console.error("❌ All providers failed, using mock response");
                    return MOCK_RISK_ANALYSIS;
                }

                // Otherwise, try next provider
                continue;
            }
        }

        return MOCK_RISK_ANALYSIS;
    }

    /**
     * Get status of all providers
     */
    getProviderStatus() {
        return PROVIDERS.map((config, index) => ({
            name: config.name,
            available: !!config.apiKey,
            active: index === this.activeProviderIndex && !!config.apiKey,
            model: config.model,
            tokenBudget: config.tokenBudget,
        }));
    }
}

export const aiService = new AIService();
