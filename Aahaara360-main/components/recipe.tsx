import React, { useState, useEffect } from 'react';

interface Recipe {
  title?: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: string;
  ingredients?: string[];
  instructions?: string[];
  tips?: string[];
}

const Recipe: React.FC = () => {
  const [dishName, setDishName] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const apiKey = 'AIzaSyClqogNmRb_oxJLUnYERHAt7bHREMeFZfQ';

  const getYouTubeVideo = async (dishName: string): Promise<string> => {
    const searchTerms = [
      `${dishName} recipe how to make`,
      `${dishName} cooking tutorial`,
      `${dishName} step by step recipe`
    ];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(randomTerm)}`;
  };

  const callGeminiAPI = async (dishName: string): Promise<Recipe> => {
    const prompt = `Create a detailed recipe for "${dishName}". Return ONLY valid JSON in this exact format:
    {
        "title": "Recipe Name",
        "description": "Brief description of the dish",
        "prepTime": "15 minutes",
        "cookTime": "30 minutes",
        "servings": "4 people",
        "difficulty": "Medium",
        "ingredients": [
            "1 cup ingredient 1",
            "2 tbsp ingredient 2"
        ],
        "instructions": [
            "Step 1: Do this",
            "Step 2: Do that"
        ],
        "tips": [
            "Cooking tip 1",
            "Cooking tip 2"
        ]
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from API');
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from API');
    }

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return {
        title: dishName,
        description: text.substring(0, 200) + '...',
        prepTime: 'N/A',
        cookTime: 'N/A',
        servings: 'N/A',
        difficulty: 'Medium',
        ingredients: ['Check full recipe details'],
        instructions: [text],
        tips: []
      };
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return {
        title: dishName,
        description: 'Recipe generated successfully',
        prepTime: 'N/A',
        cookTime: 'N/A',
        servings: 'N/A',
        difficulty: 'Medium',
        ingredients: ['Please refer to the full recipe text'],
        instructions: [text],
        tips: []
      };
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setError('Please enter your Gemini API key first.');
      return;
    }

    const trimmedDishName = dishName.trim();
    if (!trimmedDishName) {
      setError('Please enter a dish name.');
      return;
    }

    await generateRecipe(trimmedDishName);
  };

  const generateRecipe = async (dishName: string) => {
    setIsLoading(true);
    setError('');
    setShowResults(true);

    try {
      const recipeData = await callGeminiAPI(dishName);
      const videoUrl = await getYouTubeVideo(dishName);
      setRecipe(recipeData);
      setYoutubeUrl(videoUrl);
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      setError(`Failed to generate recipe: ${error.message}. Please check your API key and internet connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (recipeName: string) => {
    setDishName(recipeName);
    const searchInput = document.getElementById('dishName');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const recipeCategories = [
    {
      title: "Indian Cuisine",
      suggestions: ["Butter Chicken", "Biryani", "Palak Paneer"]
    },
    {
      title: "Italian Classics",
      suggestions: ["Spaghetti Carbonara", "Margherita Pizza", "Lasagna"]
    },
    {
      title: "Asian Favorites",
      suggestions: ["Pad Thai", "Fried Rice", "Ramen"]
    },
    {
      title: "Mexican Dishes",
      suggestions: ["Tacos", "Quesadillas", "Guacamole"]
    },
    {
      title: "American Classics",
      suggestions: ["Burger", "Mac and Cheese", "BBQ Ribs"]
    },
    {
      title: "Desserts",
      suggestions: ["Chocolate Cake", "Tiramisu", "Apple Pie"]
    }
  ];

  const features = [
    {
      icon: "📋",
      title: "Detailed Ingredients",
      description: "Complete list with exact measurements"
    },
    {
      icon: "🍳",
      title: "Step-by-Step",
      description: "Clear cooking instructions"
    },
    {
      icon: "⏱️",
      title: "Timing Info",
      description: "Prep and cook time estimates"
    },
    {
      icon: "🎥",
      title: "Video Reference",
      description: "YouTube tutorials for visual guidance"
    }
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'oklch(1 0 0)', 
      color: 'oklch(0.145 0 0)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.6'
    }}>
      <div className="max-w-6xl mx-auto p-5">
        {/* Header */}
        <div className="text-center mb-12 pt-16 pb-8 text-white rounded-b-lg shadow-lg" style={{
          background: 'oklch(0.45 0.15 220)',
          borderRadius: '0 0 0.625rem 0.625rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ letterSpacing: '-0.025em' }}>
            Aahaara360 Recipe Intelligence
          </h1>
          <p className="text-xl opacity-90 font-light">
            Discover detailed recipes for any dish with video reference
          </p>
        </div>

        {/* Search Container */}
        <div className="p-12 rounded-lg shadow-lg -mt-8 mx-5 mb-16" style={{
          background: 'oklch(1 0 0)',
          border: '1px solid oklch(0.922 0 0)',
          borderRadius: '0.625rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              id="dishName"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e as any);
                }
              }}
              className="flex-1 min-w-80 px-4 py-3 text-base rounded-md transition-all duration-200 focus:outline-none"
              style={{
                border: '2px solid oklch(0.922 0 0)',
                background: 'oklch(1 0 0)',
                color: 'oklch(0.145 0 0)',
                borderRadius: 'calc(0.625rem - 2px)'
              }}
              placeholder="Enter any dish name (e.g., Chicken Tikka Masala, Spaghetti Carbonara, Chocolate Cake)"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 py-3 text-base font-semibold rounded-md cursor-pointer transition-all duration-200 min-w-36 hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'oklch(0.45 0.15 220)',
                color: 'oklch(0.985 0 0)',
                border: 'none',
                borderRadius: 'calc(0.625rem - 2px)'
              }}
            >
              {isLoading ? 'Generating...' : 'Get Recipe'}
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        {!showResults && (
          <div className="p-12 rounded-lg shadow-lg mx-5 mb-16" style={{
            background: 'oklch(1 0 0)',
            border: '1px solid oklch(0.922 0 0)',
            borderRadius: '0.625rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'oklch(0.145 0 0)' }}>
                Popular Recipe Ideas
              </h2>
              <p className="text-lg mb-12" style={{ color: 'oklch(0.556 0 0)' }}>
                Click on any suggestion to get started
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {recipeCategories.map((category, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      background: 'oklch(0.97 0 0)',
                      borderRadius: '0.625rem'
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-4 pb-2" style={{
                      color: 'oklch(0.145 0 0)',
                      borderBottom: '2px solid oklch(0.45 0.15 220)'
                    }}>
                      {category.title}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {category.suggestions.map((suggestion, suggestionIndex) => (
                        <span
                          key={suggestionIndex}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 text-sm font-medium rounded cursor-pointer transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                          style={{
                            background: 'oklch(1 0 0)',
                            border: '2px solid oklch(0.922 0 0)',
                            color: 'oklch(0.145 0 0)',
                            borderRadius: 'calc(0.625rem - 4px)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'oklch(0.45 0.15 220)';
                            e.currentTarget.style.color = 'oklch(0.985 0 0)';
                            e.currentTarget.style.borderColor = 'oklch(0.45 0.15 220)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'oklch(1 0 0)';
                            e.currentTarget.style.color = 'oklch(0.145 0 0)';
                            e.currentTarget.style.borderColor = 'oklch(0.922 0 0)';
                          }}
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10" style={{ borderTop: '1px solid oklch(0.922 0 0)' }}>
                <h3 className="text-2xl font-semibold text-center mb-8" style={{ color: 'oklch(0.145 0 0)' }}>
                  What You Get
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.922 0 0)',
                        borderRadius: 'calc(0.625rem - 4px)'
                      }}
                    >
                      <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0" style={{
                        background: 'oklch(0.97 0 0)'
                      }}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-1" style={{ color: 'oklch(0.145 0 0)' }}>
                          {feature.title}
                        </h4>
                        <p className="text-sm m-0" style={{ color: 'oklch(0.556 0 0)' }}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Container */}
        {showResults && (
          <div className="p-10 rounded-lg shadow-lg" style={{
            background: 'oklch(1 0 0)',
            border: '1px solid oklch(0.922 0 0)',
            borderRadius: '0.625rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            {isLoading && (
              <div className="text-center p-10">
                <div className="w-12 h-12 border-3 border-t-3 rounded-full animate-spin mx-auto mb-5" style={{
                  border: '3px solid oklch(0.97 0 0)',
                  borderTop: '3px solid oklch(0.45 0.15 220)'
                }} />
                <p>Generating your recipe...</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded mb-5" style={{
                background: 'oklch(0.577 0.245 27.325)',
                color: 'oklch(0.577 0.245 27.325)',
                borderLeft: '4px solid oklch(0.577 0.245 27.325)',
                borderRadius: '0.625rem'
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {recipe && !isLoading && (
              <div className="rounded-lg overflow-hidden">
                <div className="p-8">
                  <h2 className="text-4xl font-bold mb-4" style={{ color: 'oklch(0.145 0 0)' }}>
                    {recipe.title || dishName}
                  </h2>
                  <p className="text-lg mb-8" style={{ 
                    color: 'oklch(0.556 0 0)',
                    lineHeight: '1.6'
                  }}>
                    {recipe.description || ''}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 p-6 rounded-lg" style={{
                    background: 'oklch(0.97 0 0)',
                    borderRadius: '0.625rem'
                  }}>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: 'oklch(0.556 0 0)' }}>Prep Time</div>
                      <div className="text-lg font-semibold" style={{ color: 'oklch(0.145 0 0)' }}>
                        {recipe.prepTime || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: 'oklch(0.556 0 0)' }}>Cook Time</div>
                      <div className="text-lg font-semibold" style={{ color: 'oklch(0.145 0 0)' }}>
                        {recipe.cookTime || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: 'oklch(0.556 0 0)' }}>Servings</div>
                      <div className="text-lg font-semibold" style={{ color: 'oklch(0.145 0 0)' }}>
                        {recipe.servings || 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm mb-1" style={{ color: 'oklch(0.556 0 0)' }}>Difficulty</div>
                      <div className="text-lg font-semibold" style={{ color: 'oklch(0.145 0 0)' }}>
                        {recipe.difficulty || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'oklch(0.145 0 0)' }}>
                      <div className="w-6 h-6 rounded-full" style={{ background: 'oklch(0.45 0.15 220)' }} />
                      Ingredients
                    </h3>
                    <ul className="list-none p-0 m-0">
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ingredient, index) => (
                          <li
                            key={index}
                            className="p-3 mb-2 font-medium transition-all duration-200 hover:translate-x-1"
                            style={{
                              background: 'oklch(0.97 0 0)',
                              borderLeft: '4px solid oklch(0.45 0.15 220)',
                              borderRadius: 'calc(0.625rem - 4px)',
                              paddingLeft: '1.25rem'
                            }}
                          >
                            {ingredient}
                          </li>
                        ))
                      ) : (
                        <li className="p-3 mb-2 font-medium" style={{
                          background: 'oklch(0.97 0 0)',
                          borderLeft: '4px solid oklch(0.45 0.15 220)',
                          borderRadius: 'calc(0.625rem - 4px)',
                          paddingLeft: '1.25rem'
                        }}>
                          No ingredients provided
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'oklch(0.145 0 0)' }}>
                      <div className="w-6 h-6 rounded-full" style={{ background: 'oklch(0.45 0.15 220)' }} />
                      Instructions
                    </h3>
                    <ol className="list-none p-0 m-0">
                      {recipe.instructions && recipe.instructions.length > 0 ? (
                        recipe.instructions.map((instruction, index) => (
                          <li
                            key={index}
                            className="p-4 mb-3 relative pl-14"
                            style={{
                              background: 'oklch(0.97 0 0)',
                              borderRadius: 'calc(0.625rem - 2px)',
                              lineHeight: '1.6'
                            }}
                          >
                            <div className="absolute left-4 top-4 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-sm" style={{
                              background: 'oklch(0.45 0.15 220)',
                              color: 'oklch(0.985 0 0)'
                            }}>
                              {index + 1}
                            </div>
                            {instruction}
                          </li>
                        ))
                      ) : (
                        <li className="p-4 mb-3 relative pl-14" style={{
                          background: 'oklch(0.97 0 0)',
                          borderRadius: 'calc(0.625rem - 2px)',
                          lineHeight: '1.6'
                        }}>
                          <div className="absolute left-4 top-4 w-7 h-7 rounded-full flex items-center justify-center font-semibold text-sm" style={{
                            background: 'oklch(0.45 0.15 220)',
                            color: 'oklch(0.985 0 0)'
                          }}>
                            1
                          </div>
                          No instructions provided
                        </li>
                      )}
                    </ol>
                  </div>

                  {recipe.tips && recipe.tips.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'oklch(0.145 0 0)' }}>
                        <div className="w-6 h-6 rounded-full" style={{ background: 'oklch(0.45 0.15 220)' }} />
                        Cooking Tips
                      </h3>
                      <ul className="list-none p-0 m-0">
                        {recipe.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="p-3 mb-2 font-medium transition-all duration-200 hover:translate-x-1"
                            style={{
                              background: 'oklch(0.97 0 0)',
                              borderLeft: '4px solid oklch(0.45 0.15 220)',
                              borderRadius: 'calc(0.625rem - 4px)',
                              paddingLeft: '1.25rem'
                            }}
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {youtubeUrl && (
                    <div className="my-8 p-6 rounded-lg shadow-lg" style={{
                      background: '#dc2626',
                      borderRadius: '0.625rem',
                      boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
                    }}>
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 no-underline text-white transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="flex-shrink-0 p-2 rounded transition-all duration-200" style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 'calc(0.625rem - 4px)'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23 7.8c-.1-1.9-1.4-3.4-3.3-3.5-3.8-.3-7.7-.3-11.5 0C6.4 4.4 5.1 5.9 5 7.8c-.2 2.3-.2 4.6 0 6.9.1 1.9 1.4 3.4 3.3 3.5 3.8.3 7.7.3 11.5 0 1.9-.1 3.2-1.6 3.3-3.5.2-2.3.2-4.6-.1-6.9z" fill="#FF0000"/>
                            <path d="m9.5 15.5 6-3.5-6-3.5v7z" fill="#FFFFFF"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <strong className="text-lg font-semibold">Watch Cooking Video</strong>
                          <span className="text-sm opacity-90">Learn how to make {dishName}</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;