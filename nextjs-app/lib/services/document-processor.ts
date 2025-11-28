import mammoth from 'mammoth';
import { readFile } from 'fs/promises';
import { extname } from 'path';

// Mock contract text for demo purposes
const MOCK_CONTRACT_TEXT = `
MASTER SERVICE AGREEMENT

1. TERM AND TERMINATION
This Agreement shall commence on the Effective Date and continue for an initial term of twelve (12) months. Either party may terminate this Agreement with thirty (30) days written notice.

2. LIABILITY AND INDEMNIFICATION
The Supplier shall indemnify and hold harmless the Client against any and all claims, damages, losses, and expenses arising from the Supplier's performance under this Agreement. The Supplier's liability under this Agreement shall be unlimited and uncapped.

3. DATA PROTECTION AND PRIVACY
The Supplier shall comply with all applicable data protection laws including GDPR and CCPA. The Supplier shall implement appropriate technical and organizational measures to protect Client data.

4. SERVICE LEVEL AGREEMENT
The Supplier shall maintain a minimum uptime of 99.9% measured monthly. Failure to meet this SLA shall result in service credits equal to 10% of monthly fees for each percentage point below the target.

5. PAYMENT TERMS
Client shall pay all invoices within thirty (30) days of receipt. Late payments shall accrue interest at 1.5% per month.

6. INTELLECTUAL PROPERTY
All intellectual property created under this Agreement shall be the sole property of the Client. The Supplier hereby assigns all rights, title, and interest in such IP to the Client.

7. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement and for a period of five (5) years thereafter.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California without regard to its conflict of law provisions.
`;

export class DocumentProcessor {
    /**
     * Extracts text from a file based on its extension.
     * @param filePath Absolute path to the file
     * @returns Extracted text string
     */
    static async extractText(filePath: string): Promise<string> {
        const ext = extname(filePath).toLowerCase();
        const buffer = await readFile(filePath);

        try {
            if (ext === '.pdf') {
                // For demo purposes, return mock contract text
                // In production, you would use a proper PDF library or external service
                console.log('Using mock contract text for PDF demo');
                return MOCK_CONTRACT_TEXT;
            } else if (ext === '.docx') {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            } else if (ext === '.txt') {
                return buffer.toString('utf-8');
            } else {
                throw new Error(`Unsupported file extension: ${ext}`);
            }
        } catch (error: any) {
            console.error(`Error extracting text from ${filePath}:`, error);
            throw new Error(`Failed to process document: ${error.message}`);
        }
    }

    /**
     * Simple segmentation of text into clauses based on double newlines or common headers.
     * @param text Full document text
     * @returns Array of clause strings
     */
    static segmentClauses(text: string): string[] {
        // Basic segmentation: split by double newlines, filter empty
        // In a real app, use regex for "Section 1.1", "Article I", etc.
        return text
            .split(/\n\s*\n/)
            .map(chunk => chunk.trim())
            .filter(chunk => chunk.length > 50); // Filter out short noise
    }
}
