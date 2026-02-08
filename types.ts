
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  stock?: number;
}

export interface CartItem extends Product {
  internalId: string;
  quantity: number;
  frontText?: string;
  backText?: string;
  isDoubleSided?: boolean;
  isGiftBox?: boolean;
}

export interface DesignConcept {
  conceptName: string;
  description: string;
  visualStyle: string;
}
