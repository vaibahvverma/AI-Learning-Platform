import fs from 'fs';
import path from 'path';
// Using dynamic import for pdf-parse due to CommonJS module
let pdfParse: (dataBuffer: Buffer) => Promise<{ numpages: number; text: string }>;

// Initialize pdf-parse
const initPdfParse = async () => {
    if (!pdfParse) {
        const module = await import('pdf-parse');
        pdfParse = module.default;
    }
    return pdfParse;
};

export interface PDFContent {
    text: string;
    pageCount: number;
}

// Cache for extracted PDF text
const textCache = new Map<string, PDFContent>();

export const extractTextFromPDF = async (filePath: string): Promise<PDFContent> => {
    // Check cache first
    if (textCache.has(filePath)) {
        return textCache.get(filePath)!;
    }

    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), filePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`PDF file not found: ${absolutePath}`);
        }

        const dataBuffer = fs.readFileSync(absolutePath);
        const parse = await initPdfParse();
        const data = await parse(dataBuffer);

        const result: PDFContent = {
            text: data.text,
            pageCount: data.numpages
        };

        // Cache the result
        textCache.set(filePath, result);

        return result;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

export const clearCache = (filePath?: string): void => {
    if (filePath) {
        textCache.delete(filePath);
    } else {
        textCache.clear();
    }
};

export const deletePDFFile = async (filePath: string): Promise<void> => {
    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), filePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            clearCache(filePath);
        }
    } catch (error) {
        console.error('Error deleting PDF file:', error);
        throw new Error('Failed to delete PDF file');
    }
};
