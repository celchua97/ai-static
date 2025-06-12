import React, { useState, useRef } from 'react';
import { Upload, Zap, Palette, Type, Image, Target, Lightbulb, Download, Wand2 } from 'lucide-react';

// Map icon names from API response to Lucide React components
const iconMap = {
  "Type": Type,
  "Palette": Palette,
  "Target": Target,
  "Image": Image,
  "Lightbulb": Lightbulb,
  // Add other Lucide icons here if you expand the API response
  "Wand2": Wand2 // For the AI copy generation section
};

const AdVariationGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState([]);
  const [adDescription, setAdDescription] = useState('');
  const [aiGeneratedCopy, setAiGeneratedCopy] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); // New loading state for image analysis
  const fileInputRef = useRef(null);

  // Function to convert File object to Base64 string
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the Base64 part
      reader.onerror = error => reject(error);
    });
  };

  // Handles image file selection and sets up a preview.
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        setImagePreview(e.target.result);
        await analyzeImage(file); // Pass the file directly for API analysis
      };
      reader.readAsDataURL(file);
    } else {
      console.warn('Please select a valid image file.');
    }
  };

  // Function to generate ad copy using the Gemini API
  const generateAdCopy = async () => {
    if (!adDescription.trim()) {
      setAiGeneratedCopy("Please enter a description for the ad copy generation.");
      return;
    }

    setIsGeneratingCopy(true);
    setAiGeneratedCopy(''); // Clear previous results

    try {
      let chatHistory = [];
      const prompt = `Generate a compelling ad copy based on the following description. Focus on catchy headlines and engaging body text suitable for online advertisements. Also, include a clear Call-to-Action.
      
      Ad Description: "${adDescription}"
      
      Provide a few variations if possible.`;
      
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide the API key at runtime

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiGeneratedCopy(text);
      } else {
        setAiGeneratedCopy("Failed to generate ad copy. Please try again or refine your description.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      setAiGeneratedCopy("An error occurred while generating ad copy. Please check your network connection.");
      console.error("Error calling Gemini API for copy generation:", error);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Analyzes the uploaded image using Gemini API to generate A/B testing suggestions.
  const analyzeImage = async (imageFile) => {
    if (!imageFile) {
      setVariations([]);
      return;
    }

    setIsAnalyzingImage(true);
    setVariations([]); // Clear previous variations

    try {
      const base64ImageData = await fileToBase64(imageFile);
      const prompt = `Analyze this ad image and provide concrete A/B testing suggestions based on its visual elements, layout, and potential messaging. Focus on variations that could improve its performance.
      
      Provide the suggestions as a JSON array of objects, where each object has:
      - "category": (string, e.g., "Visual Elements", "Layout & Composition", "Call-to-Action", "Typography", "Color Scheme")
      - "iconName": (string, one of "Type", "Palette", "Target", "Image", "Lightbulb", "Wand2" - choose based on category)
      - "suggestions": (array of strings, 3-5 specific, actionable A/B test ideas)
      - "priority": (string, "Critical", "High", or "Medium" based on potential impact)
      
      Example of expected JSON structure:
      [{
        "category": "Visual Elements",
        "iconName": "Palette",
        "suggestions": ["Test product focus vs lifestyle imagery", "A/B test different background textures"],
        "priority": "High"
      }]
      `;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64ImageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "category": { "type": "STRING" },
                "iconName": { "type": "STRING" },
                "suggestions": {
                  "type": "ARRAY",
                  "items": { "type": "STRING" }
                },
                "priority": { "type": "STRING", "enum": ["Critical", "High", "Medium"] }
              },
              "required": ["category", "iconName", "suggestions", "priority"]
            }
          }
        }
      };

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        try {
          const parsedVariations = JSON.parse(jsonString);
          setVariations(parsedVariations);
        } catch (parseError) {
          console.error("Failed to parse JSON from API response:", parseError);
          setVariations([{
            category: "Error",
            iconName: "Lightbulb",
            suggestions: ["Could not parse AI suggestions. Please try again."],
            priority: "Critical"
          }]);
        }
      } else {
        setVariations([{
          category: "No Suggestions",
          iconName: "Lightbulb",
          suggestions: ["AI could not generate suggestions for this image."],
          priority: "Medium"
        }]);
        console.error("Gemini API response structure unexpected for image analysis:", result);
      }
    } catch (error) {
      setVariations([{
        category: "Network Error",
        iconName: "Lightbulb",
        suggestions: ["Failed to connect to AI for image analysis. Check your connection."],
        priority: "Critical"
      }]);
      console.error("Error calling Gemini API for image analysis:", error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Resets all states
  const resetUpload = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setVariations([]);
    setIsAnalyzing(false); // This is for the simulated analysis
    setAdDescription('');
    setAiGeneratedCopy('');
    setIsGeneratingCopy(false);
    setIsAnalyzingImage(false); // Reset image analysis loading
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determines the priority color for variation suggestions.
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Ad Variation Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Upload your ad image and get AI-powered suggestions for A/B testing variations 
            to optimize your campaign performance
          </p>
        </div>

        {/* Main Content Area: Upload and Suggestions Sections (now stacked) */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-purple-600" />
              Upload Your Ad Image
            </h2>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                imagePreview 
                  ? 'border-purple-300 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded ad" 
                    className="max-h-64 w-full object-contain mx-auto rounded-lg shadow-lg"
                  />
                  <div className="text-sm text-gray-600">
                    Click to upload a different image
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      resetUpload();
                    }}
                    className="mt-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Drop your ad image here</p>
                    <p className="text-gray-500">or click to browse files</p>
                    <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input for Ad Description */}
            <div className="mt-6">
              <label htmlFor="ad-description" className="block text-sm font-medium text-gray-700 mb-2">
                Or, tell us about your ad for copy generation:
              </label>
              <textarea
                id="ad-description"
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-700"
                placeholder="e.g., 'Promote a new eco-friendly water bottle for fitness enthusiasts, highlight durability and sleek design.'"
                value={adDescription}
                onChange={(e) => setAdDescription(e.target.value)}
              ></textarea>
              <button
                onClick={generateAdCopy}
                className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isGeneratingCopy}
              >
                {isGeneratingCopy ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Copy...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Ad Copy
                  </>
                )}
              </button>
            </div>

            {/* Overall analysis loading indicator (for both image and text-based suggestions) */}
            {(isAnalyzing || isAnalyzingImage) && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-purple-100 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-purple-700 font-medium">Analyzing your ad...</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Generated Copy Section */}
          {(aiGeneratedCopy || isGeneratingCopy) && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
                AI Generated Ad Copy
              </h2>
              {isGeneratingCopy ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-700 font-medium">Crafting your copy...</span>
                  </div>
                </div>
              ) : (
                aiGeneratedCopy && (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {aiGeneratedCopy.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* A/B Testing Suggestions Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
              A/B Testing Suggestions
            </h2>

            {isAnalyzingImage ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-flex items-center px-6 py-3 bg-purple-100 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-purple-700 font-medium">Generating image-based suggestions...</span>
                </div>
              </div>
            ) : variations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Upload an image or provide a description to get AI-powered suggestions</p>
                <p className="text-sm mt-2">Our AI will analyze your ad and provide tailored A/B testing recommendations</p>
              </div>
            ) : (
              <div className="space-y-6">
                {variations.map((variation, index) => {
                  const IconComponent = iconMap[variation.iconName] || Lightbulb; // Fallback icon
                  return (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <IconComponent className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {variation.category}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(variation.priority)}`}>
                          {variation.priority}
                        </span>
                      </div>
                      
                      <ul className="space-y-3">
                        {variation.suggestions.map((suggestion, suggestionIndex) => (
                          <li key={suggestionIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-purple-600" />
                    Pro Tips for A/B Testing
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Test one element at a time for clear results
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Run tests for at least 1-2 weeks to account for daily variations
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Ensure statistical significance before making decisions
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Focus on high-priority variations first for maximum impact
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdVariationGenerator;


