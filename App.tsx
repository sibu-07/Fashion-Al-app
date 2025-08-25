
import React, { useState, useCallback } from 'react';
import { analyzeImageAndGetRecommendations, generateOutfitImage } from './services/geminiService';
import { Filter, Recommendation, AnalysisResult, Gender, Occasion } from './types';
import ImageUploader from './components/ImageUploader';
import FilterSelector from './components/FilterSelector';
import RecommendationCard from './components/RecommendationCard';
import Loader from './components/Loader';
import { UploadIcon, SparklesIcon, XCircleIcon } from './components/icons/Icons';

const App: React.FC = () => {
    const [image, setImage] = useState<{ file: File, base64: string } | null>(null);
    const [filters, setFilters] = useState<Filter>({ gender: Gender.FEMALE, occasion: Occasion.CASUAL });
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (file: File, base64: string) => {
        setImage({ file, base64 });
        setAnalysis(null);
        setRecommendations([]);
        setError(null);
    };

    const handleFilterChange = (type: 'gender' | 'occasion', value: Gender | Occasion) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const getRecommendations = useCallback(async () => {
        if (!image) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setRecommendations([]);

        try {
            const initialResponse = await analyzeImageAndGetRecommendations(image.base64, filters.gender, filters.occasion);

            if (!initialResponse.userInputAnalysis || !initialResponse.recommendations) {
                throw new Error("AI response was not in the expected format.");
            }
            
            setAnalysis(initialResponse.userInputAnalysis);
            
            // Set recommendations with text first
            const textRecommendations = initialResponse.recommendations.map(rec => ({ ...rec, imageUrl: '' }));
            setRecommendations(textRecommendations);

            // Generate images for each recommendation
            const imagePromises = initialResponse.recommendations.map(rec => 
                generateOutfitImage(rec.description, filters.gender)
            );

            const generatedImages = await Promise.all(imagePromises);

            // Update recommendations with generated images
            const finalRecommendations = initialResponse.recommendations.map((rec, index) => ({
                ...rec,
                imageUrl: generatedImages[index],
            }));

            setRecommendations(finalRecommendations);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [image, filters]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                         <SparklesIcon className="w-8 h-8 text-indigo-600"/>
                        <h1 style={{fontFamily: "'Playfair Display', serif"}} className="text-3xl font-bold text-gray-800">
                            Fashion AI
                        </h1>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Control Panel */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                               <UploadIcon className="w-6 h-6 mr-2 text-indigo-600"/> 
                               1. Upload Clothing Item
                            </h2>
                            <ImageUploader onImageChange={handleImageChange} />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Set Preferences</h2>
                            <div className="space-y-6">
                               <FilterSelector<Gender>
                                    label="Gender"
                                    options={Object.values(Gender)}
                                    selectedValue={filters.gender}
                                    onChange={(val) => handleFilterChange('gender', val)}
                                />
                                <FilterSelector<Occasion>
                                    label="Occasion"
                                    options={Object.values(Occasion)}
                                    selectedValue={filters.occasion}
                                    onChange={(val) => handleFilterChange('occasion', val)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={getRecommendations}
                            disabled={!image || isLoading}
                            className="w-full flex items-center justify-center text-lg font-semibold py-4 px-6 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="w-6 h-6 mr-3"/>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-6 h-6 mr-3"/>
                                    Get Recommendations
                                </>
                            )}
                        </button>
                    </aside>

                    {/* Results Area */}
                    <div className="lg:col-span-8">
                        {error && (
                             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center" role="alert">
                                <XCircleIcon className="w-6 h-6 mr-3"/>
                                <div>
                                    <p className="font-bold">Error</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !analysis && !recommendations.length && !error && (
                            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 p-12 text-center">
                                <div className="text-indigo-400 mb-4">
                                   <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.042.506.092.763.152C12.83 4.14 15.5 5.87 15.5 9.438v3.111c0 .445-.18.86-.49 1.159L12 16.5M9.75 3.104a6.375 6.375 0 00-3.32 1.343L3.75 6.5m1.5-3.375C7.25 2.42 9.006 2 11.25 2c2.244 0 4 .42 5.25 1.125M3.75 6.5c-.621.483-.997 1.22-.997 2.007v3.111c0 .445.18.86.49 1.159L6 14.5M19.5 6.5c.621.483.997 1.22.997 2.007v3.111c0 .445-.18.86-.49 1.159L18 14.5M15.5 16.5l-3 3m0 0l-3-3m3 3V21"></path></svg>
                                </div>
                                <h3 style={{fontFamily: "'Playfair Display', serif"}} className="text-2xl font-bold text-gray-700">Your Outfit Recommendations Appear Here</h3>
                                <p className="mt-2 text-gray-500 max-w-md">Upload a clothing photo, select your style preferences, and let our AI create the perfect outfit for you.</p>
                            </div>
                        )}

                        {isLoading && !analysis && (
                             <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                                <Loader className="w-12 h-12 mx-auto text-indigo-600"/>
                                <p className="mt-4 text-lg font-semibold text-gray-700">Analyzing your item and crafting outfits...</p>
                                <p className="text-gray-500">This may take a moment.</p>
                            </div>
                        )}
                        
                        {analysis && (
                           <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-fade-in">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Analysis of Your Item</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="font-semibold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">{analysis.category}</span>
                                    {analysis.attributes.map((attr, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{attr}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                             {recommendations.map((rec, index) => (
                                <RecommendationCard key={index} recommendation={rec} isLoading={!rec.imageUrl && isLoading} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
