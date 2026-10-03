export type ModalityType = 'TEXT' | 'CODE' | 'IMAGE';

export interface BaseResponse {
  modality: ModalityType;
  rawContent: any;
}

export interface TextResponse extends BaseResponse {
  modality: 'TEXT';
  rawContent: string;
}

export interface CodeResponse extends BaseResponse {
  modality: 'CODE';
  rawContent: string;
  language?: string;
}

export interface ImageResponse extends BaseResponse {
  modality: 'IMAGE';
  rawContent: string; // Base64 or URL
  extractedText?: string;
  detectedSymbols?: string[];
}

export type ResponseModality = TextResponse | CodeResponse | ImageResponse;

export interface VisionAnalysisResult {
  status: 'SUCCESS' | 'VISION_PROVIDER_UNAVAILABLE' | 'ERROR';
  modality: 'IMAGE';
  message?: string;
  fallback?: 'TEXT_INPUT';
  extracted_text?: string;
  reasoning_steps?: string[];
  detected_symbols?: string[];
  uncertainty?: number;
}

export abstract class VisionAnalyzer {
  abstract analyze(image: string): Promise<VisionAnalysisResult>;
}

export class OfflineFallbackVisionAnalyzer extends VisionAnalyzer {
  async analyze(image: string): Promise<VisionAnalysisResult> {
    return {
      status: 'VISION_PROVIDER_UNAVAILABLE',
      modality: 'IMAGE',
      message: 'Image analysis is unavailable in offline mode.',
      fallback: 'TEXT_INPUT'
    };
  }
}

export class OptionalLLMVisionAnalyzer extends VisionAnalyzer {
  async analyze(image: string): Promise<VisionAnalysisResult> {
    if (!process.env.VISION_API_KEY) {
      return new OfflineFallbackVisionAnalyzer().analyze(image);
    }
    
    // In a real implementation, this would call a vision model.
    return {
      status: 'SUCCESS',
      modality: 'IMAGE',
      extracted_text: 'Detected handwritten text',
      reasoning_steps: ['Identified image', 'Extracted symbols'],
      detected_symbols: ['x', '=', '5'],
      uncertainty: 0.2
    };
  }
}
