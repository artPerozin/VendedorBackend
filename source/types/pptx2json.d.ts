declare module "pptx2json" {
  interface Pptx2JsonOptions {
    path: string;
    dist?: string;
    format?: "json";
  }

  interface PptxSlide {
    texts?: string[];
    notes?: string[];
    images?: string[];
    [key: string]: any;
  }

  interface PptxJson {
    slides: PptxSlide[];
    [key: string]: any;
  }

  export default function pptx2json(options: Pptx2JsonOptions): Promise<PptxJson>;
}
