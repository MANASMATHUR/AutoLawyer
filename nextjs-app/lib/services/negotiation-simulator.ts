import { aiService } from './ai-service';

export interface NegotiationScenario {
    scenario_id: string;
    name: string;
    probability: number; // 0-100%
    financial_impact: number; // Estimated $ impact
    counterparty_reaction: 'accept' | 'reject' | 'negotiate';
    explanation: string;
}

export class NegotiationSimulator {
    /**
     * Simulates negotiation outcomes for a high-risk clause.
     */
    static async simulateScenarios(clauseText: string, riskScore: number): Promise<NegotiationScenario[]> {
        // If risk is low, negotiation is likely smooth
        if (riskScore < 0.3) {
            return [{
                scenario_id: 'smooth-sailing',
                name: 'Standard Acceptance',
                probability: 95,
                financial_impact: 0,
                counterparty_reaction: 'accept',
                explanation: 'Clause is standard and low risk. Counterparty likely to accept without comment.'
            }];
        }

        // Use AI to generate realistic scenarios for high risk
        // For mock/demo purposes, we can also generate some deterministic ones if AI fails
        try {
            // TODO: In a real app, we'd ask the AI for these scenarios.
            // For this demo, we'll simulate "Monte Carlo" by generating 3 variations based on risk severity.

            const baseImpact = riskScore * 100000; // Arbitrary base impact calculation

            return [
                {
                    scenario_id: 'best-case',
                    name: 'Best Case: Minor Pushback',
                    probability: 30,
                    financial_impact: baseImpact * 0.1,
                    counterparty_reaction: 'negotiate',
                    explanation: 'Counterparty requests minor clarification but accepts the core obligation.'
                },
                {
                    scenario_id: 'likely-case',
                    name: 'Most Likely: Compromise Required',
                    probability: 50,
                    financial_impact: baseImpact * 0.5,
                    counterparty_reaction: 'negotiate',
                    explanation: 'Counterparty rejects the unlimited liability and proposes a 2x cap.'
                },
                {
                    scenario_id: 'worst-case',
                    name: 'Worst Case: Deal Breaker',
                    probability: 20,
                    financial_impact: baseImpact * 1.5,
                    counterparty_reaction: 'reject',
                    explanation: 'Counterparty refuses to sign unless this clause is entirely removed.'
                }
            ];
        } catch (error) {
            console.error("Simulation error:", error);
            return [];
        }
    }
}
