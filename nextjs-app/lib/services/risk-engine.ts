import { DocumentProcessor } from './document-processor';
import { aiService } from './ai-service';
import { NegotiationSimulator, NegotiationScenario } from './negotiation-simulator';
import { v4 as uuidv4 } from 'uuid';

export interface ClauseRisk {
    clause_id: string;
    text: string;
    risk_score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    rationale: string;
    recommendation: string;
    redline: string;
    negotiation_scenarios?: NegotiationScenario[];
}

export interface CaseResult {
    case_id: string;
    clauses: ClauseRisk[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

export class RiskEngine {
    /**
     * Orchestrates the full analysis of a document.
     */
    static async analyzeDocument(filePath: string, caseId: string, policy: string): Promise<CaseResult> {
        // 1. Extract Text
        const text = await DocumentProcessor.extractText(filePath);

        // 2. Segment Clauses
        const rawClauses = DocumentProcessor.segmentClauses(text);

        // 3. Analyze each clause (in parallel with limit)
        // For demo, we'll slice to first 10 clauses to save tokens/time if it's a long doc
        const clausesToAnalyze = rawClauses.slice(0, 10);

        const analyzedClauses: ClauseRisk[] = [];
        const summary = { critical: 0, high: 0, medium: 0, low: 0 };

        // Process in batches of 3 to avoid rate limits
        for (let i = 0; i < clausesToAnalyze.length; i += 3) {
            const batch = clausesToAnalyze.slice(i, i + 3);
            const promises = batch.map(async (clauseText) => {
                const analysis = await aiService.analyzeClauseRisk(clauseText, policy);

                let scenarios: NegotiationScenario[] = [];
                if (analysis.risk_score && analysis.risk_score > 0.5) {
                    scenarios = await NegotiationSimulator.simulateScenarios(clauseText, analysis.risk_score);
                }

                return {
                    clause_id: uuidv4(),
                    text: clauseText,
                    risk_score: analysis.risk_score || 0,
                    severity: analysis.severity || 'low',
                    rationale: analysis.rationale || 'No risk detected',
                    recommendation: analysis.recommendation || '',
                    redline: analysis.redline || '',
                    negotiation_scenarios: scenarios
                } as ClauseRisk;
            });

            const results = await Promise.all(promises);
            analyzedClauses.push(...results);
        }

        // 4. Aggregate Stats
        analyzedClauses.forEach(c => {
            if (summary[c.severity] !== undefined) {
                summary[c.severity]++;
            }
        });

        return {
            case_id: caseId,
            clauses: analyzedClauses,
            summary
        };
    }
}
