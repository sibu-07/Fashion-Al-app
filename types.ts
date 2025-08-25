
export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    UNISEX = 'Unisex'
}

export enum Occasion {
    CASUAL = 'Casual',
    FORMAL = 'Formal',
    PARTY = 'Party',
    BUSINESS = 'Business Casual',
}

export interface Filter {
    gender: Gender;
    occasion: Occasion;
}

export interface AnalysisResult {
    category: string;
    attributes: string[];
}

export interface Recommendation {
    name: string;
    description: string;
    tags: string[];
    imageUrl: string;
}

export interface GeminiResponse {
    userInputAnalysis: AnalysisResult;
    recommendations: Omit<Recommendation, 'imageUrl'>[];
}
