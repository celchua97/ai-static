import React, { useState, useRef } from 'react';
import { Upload, Zap, Palette, Type, Image, Target, Lightbulb, Download } from 'lucide-react';

const AdVariationGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variations, setVariations] = useState([]);
  const fileInputRef = useRef(null);

  // Handles image file selection and sets up a preview.
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        analyzeImage(); // Trigger analysis after image is loaded
      };
      reader.readAsDataURL(file);
    } else {
      // Use a custom message box instead of alert() for better UX.
      // For this example, we'll keep it simple, but in a real app,
      // you'd render a modal or toast notification.
      console.warn('Please select a valid image file.');
    }
  };

  // Simulates AI analysis of the uploaded image to generate variations.
  const analyzeImage = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis with more realistic timing using a setTimeout
    setTimeout(() => {
      const generatedVariations = [
        {
          category: "Headlines & Copy",
          icon: <Type className="w-5 h-5 text-purple-600" />,
          suggestions: [
            "Test emotional vs rational headlines (e.g., 'Transform Your Life' vs '50% More Efficient')",
            "A/B test question-based headlines vs statement headlines",
            "Try urgency-driven copy ('Limited Time') vs benefit-focused copy",
            "Test first-person vs second-person messaging ('I saved' vs 'You'll save')"
          ],
          priority: "High"
        },
        {
          category: "Visual Elements",
          icon: <Palette className="w-5 h-5 text-purple-600" />,
          suggestions: [
            "Test warm color scheme (oranges, reds) vs cool colors (blues, greens)",
            "Try minimalist design vs information-rich layout",
            "A/B test product-focused vs lifestyle-focused imagery",
            "Experiment with different background textures or gradients"
          ],
          priority: "High"
        },
        {
          category: "Call-to-Action",
          icon: <Target className="w-5 h-5 text-purple-600" />,
          suggestions: [
            "Test button colors: high contrast vs brand colors",
            "Try different CTA text: 'Get Started' vs 'Try Now' vs 'Learn More'",
            "Experiment with CTA placement: center vs right-aligned",
            "Test button shapes: rounded vs sharp corners"
          ],
          priority: "Critical"
        },
        {
          category: "Layout & Composition",
          icon: <Image className="w-5 h-5 text-purple-600" />,
          suggestions: [
            "Test vertical vs horizontal layout orientation",
            "Try left-aligned vs centered text placement",
            "Experiment with white space: compact vs spacious design",
            "A/B test single focal point vs multiple visual elements"
          ],
          priority: "Medium"
        },
        {
          category: "Social Proof",
          icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
          suggestions: [
            "Add customer testimonials vs remove all text",
            "Test star ratings vs customer count ('500+ happy customers')",
            "Try logo badges vs written endorsements",
            "Experiment with before/after imagery vs single product shot"
          ],
          priority: "Medium"
        }
      ];
      setVariations(generatedVariations);
      setIsAnalyzing(false);
    }, 2500); // Simulate a 2.5 second analysis time
  };

  // Resets the image upload and analysis state.
  const resetUpload = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setVariations([]);
    setIsAnalyzing(false);
    // Clear the file input value to allow re-uploading the same file
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
        {/* Removed grid classes to ensure vertical stacking on all screen sizes */}
        <div className="max-w-4xl mx-auto space-y-8"> {/* Added space-y-8 for vertical gap */}
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
                      e.stopPropagation(); // Prevents triggering the parent div's onClick
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

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-purple-100 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-purple-700 font-medium">Analyzing your ad...</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Section (now below the Upload Section) */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
              A/B Testing Suggestions
            </h2>

            {variations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Upload an image to get AI-powered variation suggestions</p>
                <p className="text-sm mt-2">Our AI will analyze your ad and provide tailored A/B testing recommendations</p>
              </div>
            ) : (
              <div className="space-y-6">
                {variations.map((variation, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          {variation.icon}
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
                ))}

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
