
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'keychain' | 'custom';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DesignConcept {
  conceptName: string;
  engravingText: string;
  recommendedFont: string;
  materialSuggestion: string;
  styleDescription: string;
}
