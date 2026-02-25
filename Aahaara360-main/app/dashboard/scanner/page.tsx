"use client"

import { useEffect, useRef, useState } from "react"

// Food database interface
interface FoodItem {
  calories: number
  carbs: number
  protein: number
  fat: number
  fiber?: number
  sugar?: number
  ayurveda?: AyurvedaProperties
}

interface AyurvedaProperties {
  doshas: {
    vata: string
    pitta: string
    kapha: string
  }
  rasa: string[]
  virya: string
  vipaka: string
  guna: string[]
  properties: string
}

interface DetectedFood {
  name: string
  portion_size: number
  unit: string
  confidence: number
  nutrition: {
    calories: number
    carbs: number
    protein: number
    fat: number
    fiber: number
    sugar: number
  }
  ayurveda: AyurvedaProperties
}

export default function ScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [foodName, setFoodName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("")
  const [calories, setCalories] = useState("")
  const [showFoodPreview, setShowFoodPreview] = useState(false)
  const [dailyFoods, setDailyFoods] = useState<any[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [detectionResults, setDetectionResults] = useState<DetectedFood[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  // Gemini API Configuration
  const GEMINI_API_KEY = "AIzaSyClqogNmRb_oxJLUnYERHAt7bHREMeFZfQ"
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

  // Food database
  const foodDatabase: Record<string, FoodItem> = {
    'apple': {
      calories: 52, carbs: 14, protein: 0.3, fat: 0.2, fiber: 2.4, sugar: 10.4,
      ayurveda: {
        doshas: { vata: 'good', pitta: 'good', kapha: 'moderate' },
        rasa: ['madhura', 'kashaya'],
        virya: 'sheeta',
        vipaka: 'madhura',
        guna: ['laghu', 'ruksha'],
        properties: 'Digestive, cooling, good for heart'
      }
    },
    'banana': {
      calories: 89, carbs: 23, protein: 1.1, fat: 0.3, fiber: 2.6, sugar: 12.2,
      ayurveda: {
        doshas: { vata: 'good', pitta: 'good', kapha: 'avoid' },
        rasa: ['madhura'],
        virya: 'sheeta',
        vipaka: 'madhura',
        guna: ['guru', 'snigdha'],
        properties: 'Energy giving, good for weakness, avoid in cold/cough'
      }
    },
    'orange': {
      calories: 47, carbs: 12, protein: 0.9, fat: 0.1, fiber: 2.4, sugar: 9.4,
      ayurveda: {
        doshas: { vata: 'moderate', pitta: 'avoid', kapha: 'good' },
        rasa: ['amla', 'madhura'],
        virya: 'ushna',
        vipaka: 'amla',
        guna: ['laghu', 'ruksha'],
        properties: 'Vitamin C rich, digestive, may increase pitta'
      }
    },
    'broccoli': {
      calories: 34, carbs: 7, protein: 2.8, fat: 0.4, fiber: 2.6, sugar: 1.5,
      ayurveda: {
        doshas: { vata: 'moderate', pitta: 'good', kapha: 'good' },
        rasa: ['tikta', 'kashaya'],
        virya: 'sheeta',
        vipaka: 'katu',
        guna: ['laghu', 'ruksha'],
        properties: 'Detoxifying, anti-inflammatory, may cause gas in vata'
      }
    },
    'chicken breast': {
      calories: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0, sugar: 0,
      ayurveda: {
        doshas: { vata: 'good', pitta: 'moderate', kapha: 'good' },
        rasa: ['madhura'],
        virya: 'ushna',
        vipaka: 'madhura',
        guna: ['guru', 'snigdha'],
        properties: 'Strengthening, building, easy to digest'
      }
    },
    'rice': {
      calories: 130, carbs: 28, protein: 2.7, fat: 0.3, fiber: 0.4, sugar: 0.1,
      ayurveda: {
        doshas: { vata: 'good', pitta: 'good', kapha: 'moderate' },
        rasa: ['madhura'],
        virya: 'sheeta',
        vipaka: 'madhura',
        guna: ['laghu', 'snigdha'],
        properties: 'Easy to digest, nourishing, cooling'
      }
    },
    'bread': {
      calories: 265, carbs: 49, protein: 9, fat: 3.2, fiber: 2.7, sugar: 5.7,
      ayurveda: {
        doshas: { vata: 'moderate', pitta: 'moderate', kapha: 'avoid' },
        rasa: ['madhura'],
        virya: 'ushna',
        vipaka: 'madhura',
        guna: ['guru', 'snigdha'],
        properties: 'Heavy, may cause congestion in kapha'
      }
    },
    // Add more food items as needed
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any)
    }
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        }
      })
      
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream
        cameraStreamRef.current = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('❌ Camera access denied or not available. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
    }
    
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null
    }
    
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (cameraVideoRef.current && captureCanvasRef.current) {
      const video = cameraVideoRef.current
      const canvas = captureCanvasRef.current
      const ctx = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        
        // Convert to data URL for analysis
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        setImagePreview(dataURL)
        
        // Analyze with Gemini AI
        analyzeImageWithGemini(dataURL)
      }
    }
  }

  // Gemini AI Integration
  const analyzeImageWithGemini = async (imageDataURL: string) => {
    setAnalysisLoading(true)
    setDetectionResults([])
    
    try {
      // Extract base64 data from data URL
      const base64Data = imageDataURL.split(',')[1]
      
      const prompt = `
      Analyze this image and identify all food items visible. For each food item, provide:

      1. Food name (be specific, e.g., "grilled chicken breast" not just "chicken")
      2. Estimated portion size in grams or standard units
      3. Confidence level (0-100%)
      4. Estimated nutritional information per portion:
         - Calories, Carbohydrates (g), Protein (g), Fat (g), Fiber (g), Sugar (g)
      5. Ayurvedic properties:
         - Dosha effects (vata: good/moderate/avoid, pitta: good/moderate/avoid, kapha: good/moderate/avoid)
         - Rasa (taste): madhura (sweet), amla (sour), lavana (salty), katu (pungent), tikta (bitter), kashaya (astringent)
         - Virya (potency): ushna (heating) or sheeta (cooling)
         - Vipaka (post-digestive effect): madhura (sweet), amla (sour), katu (pungent)
         - Guna (qualities): laghu (light), guru (heavy), ruksha (dry), snigdha (oily), etc.
         - Traditional properties and recommendations

      Return the response in the following JSON format only, no additional text:
      {
        "foods": [
          {
            "name": "food name",
            "portion_size": 150,
            "unit": "grams",
            "confidence": 85,
            "nutrition": {
              "calories": 250,
              "carbs": 0,
              "protein": 30,
              "fat": 8,
              "fiber": 0,
              "sugar": 0
            },
            "ayurveda": {
              "doshas": {
                "vata": "good",
                "pitta": "moderate",
                "kapha": "good"
              },
              "rasa": ["madhura"],
              "virya": "ushna",
              "vipaka": "madhura",
              "guna": ["guru", "snigdha"],
              "properties": "Strengthening, building, easy to digest"
            }
          }
        ]
      }

      Be as accurate as possible with portion size estimation and Ayurvedic analysis based on traditional principles.
      `

      const requestBody = {
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1
        }
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const responseText = data.candidates[0].content.parts[0].text
      
      // Parse the JSON response from Gemini
      try {
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0])
          setDetectionResults(analysisData.foods || [])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError)
        // Fallback to manual detection based on text
        const detectedFoods = extractFoodFromText(responseText)
        setDetectionResults(detectedFoods)
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
      alert('❌ Analysis failed. Please try again or check your API key.')
      // Fallback to mock data if API fails
      simulateAnalysis()
    } finally {
      setAnalysisLoading(false)
    }
  }

  const extractFoodFromText = (text: string): DetectedFood[] => {
    // Simple fallback function to extract food information from text response
    // This is a basic implementation - you might want to improve it
    const foodNames = ['apple', 'banana', 'orange', 'broccoli', 'chicken', 'rice', 'bread']
    
    // Look for food names in the text
    const detected: DetectedFood[] = []
    
    foodNames.forEach(name => {
      if (text.toLowerCase().includes(name)) {
        detected.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          portion_size: 100,
          unit: "grams",
          confidence: 70,
          nutrition: foodDatabase[name] || {
            calories: 100,
            carbs: 15,
            protein: 5,
            fat: 2,
            fiber: 2,
            sugar: 5
          },
          ayurveda: foodDatabase[name]?.ayurveda || {
            doshas: { vata: 'moderate', pitta: 'moderate', kapha: 'moderate' },
            rasa: ['madhura'],
            virya: 'sheeta',
            vipaka: 'madhura',
            guna: ['laghu'],
            properties: 'General food properties'
          }
        })
      }
    })
    
    return detected.length > 0 ? detected : [{
      name: "Food",
      portion_size: 100,
      unit: "grams",
      confidence: 50,
      nutrition: {
        calories: 100,
        carbs: 15,
        protein: 5,
        fat: 2,
        fiber: 2,
        sugar: 5
      },
      ayurveda: {
        doshas: { vata: 'moderate', pitta: 'moderate', kapha: 'moderate' },
        rasa: ['madhura'],
        virya: 'sheeta',
        vipaka: 'madhura',
        guna: ['laghu'],
        properties: 'General food properties'
      }
    }]
  }

  const simulateAnalysis = () => {
    // Fallback mock data if Gemini API fails
    const mockResults: DetectedFood[] = [
      {
        name: "Apple",
        portion_size: 150,
        unit: "grams",
        confidence: 85,
        nutrition: {
          calories: 78,
          carbs: 21,
          protein: 0.5,
          fat: 0.3,
          fiber: 3.6,
          sugar: 15.6
        },
        ayurveda: {
          doshas: { vata: 'good', pitta: 'good', kapha: 'moderate' },
          rasa: ['madhura', 'kashaya'],
          virya: 'sheeta',
          vipaka: 'madhura',
          guna: ['laghu', 'ruksha'],
          properties: 'Digestive, cooling, good for heart'
        }
      }
    ]
    
    setDetectionResults(mockResults)
  }

  const analyzeFood = () => {
    if (imagePreview) {
      analyzeImageWithGemini(imagePreview)
    } else {
      alert('Please upload or capture an image first.')
    }
  }

  const previewFood = () => {
    if (!foodName || !quantity || !unit) {
      alert('Please fill in all required fields.')
      return
    }
    setShowFoodPreview(true)
  }

  const addFood = () => {
    if (!foodName || !quantity || !unit) {
      alert('Please fill in all required fields.')
      return
    }

    const nutrition = calculateNutrition(foodName.toLowerCase(), parseFloat(quantity))
    const newFood = {
      id: Date.now(),
      name: foodName,
      quantity: parseFloat(quantity),
      unit,
      calories: calories ? parseFloat(calories) : nutrition.calories,
      carbs: nutrition.carbs,
      protein: nutrition.protein,
      fat: nutrition.fat,
      fiber: nutrition.fiber || 0,
      sugar: nutrition.sugar || 0,
      ayurveda: nutrition.ayurveda,
      timestamp: new Date().toLocaleTimeString(),
      source: 'Manual Entry'
    }

    setDailyFoods([...dailyFoods, newFood])
    clearForm()
    setShowFoodPreview(false)
  }

  const clearForm = () => {
    setFoodName("")
    setQuantity("")
    setUnit("")
    setCalories("")
    setSelectedFile(null)
    setImagePreview(null)
  }

  const clearAllFoods = () => {
    if (confirm('Are you sure you want to clear all foods?')) {
      setDailyFoods([])
    }
  }

  const calculateNutrition = (foodName: string, quantity: number) => {
    const baseFood = foodDatabase[foodName] || {
      calories: 100, carbs: 15, protein: 5, fat: 2, fiber: 2, sugar: 5,
      ayurveda: {
        doshas: { vata: 'moderate', pitta: 'moderate', kapha: 'moderate' },
        rasa: ['madhura'],
        virya: 'sheeta',
        vipaka: 'madhura',
        guna: ['laghu'],
        properties: 'General food properties'
      }
    }

    const multiplier = quantity / 100

    return {
      calories: baseFood.calories * multiplier,
      carbs: baseFood.carbs * multiplier,
      protein: baseFood.protein * multiplier,
      fat: baseFood.fat * multiplier,
      fiber: (baseFood.fiber || 0) * multiplier,
      sugar: (baseFood.sugar || 0) * multiplier,
      ayurveda: baseFood.ayurveda
    }
  }

  const removeFood = (id: number) => {
    setDailyFoods(dailyFoods.filter(food => food.id !== id))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="header bg-primary text-primary-foreground text-center py-12 rounded-b-xl shadow-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">Aahaara360 Food Scanner</h1>
        <p className="text-xl opacity-90">Track your nutrition with smart food recognition and Ayurvedic insights</p>
      </div>

      <div className="welcome-section bg-card border border-border rounded-xl shadow-md p-8 mb-12">
        <div className="welcome-content text-center">
          <h2 className="welcome-title text-2xl font-bold mb-2">AI-Powered Food Analysis</h2>
          <p className="welcome-subtitle text-muted-foreground mb-8">Upload photos or use your camera to get instant nutrition and Ayurvedic insights</p>

          <div className="features-section text-left">
            <h3 className="features-title text-lg font-semibold mb-4">What You Get</h3>
            <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="feature flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                <div className="feature-icon text-2xl">🤖</div>
                <div className="feature-text">
                  <h4 className="font-semibold">AI Food Recognition</h4>
                  <p className="text-sm text-muted-foreground">Powered by Gemini AI for accurate identification</p>
                </div>
              </div>
              <div className="feature flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                <div className="feature-icon text-2xl">📊</div>
                <div className="feature-text">
                  <h4 className="font-semibold">Complete Nutrition</h4>
                  <p className="text-sm text-muted-foreground">Detailed macro and micronutrient breakdown</p>
                </div>
              </div>
              <div className="feature flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                <div className="feature-icon text-2xl">🕉️</div>
                <div className="feature-text">
                  <h4 className="font-semibold">Ayurvedic Wisdom</h4>
                  <p className="text-sm text-muted-foreground">Traditional wellness insights for balanced living</p>
                </div>
              </div>
              <div className="feature flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                <div className="feature-icon text-2xl">📈</div>
                <div className="feature-text">
                  <h4 className="font-semibold">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor your nutrition goals and habits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live Camera Section */}
          <div className="section bg-card border border-border rounded-xl shadow-md overflow-hidden">
            <div className="section-header p-6 border-b border-border">
              <div className="section-title flex items-center gap-3 mb-2">
                <div className="icon w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">📹</div>
                <h2 className="text-xl font-semibold">Live Camera Detection</h2>
              </div>
              <p className="section-description text-muted-foreground text-sm">Real-time AI-powered food recognition using your camera</p>
            </div>
            <div className="section-content p-6">
              <div className="camera-container">
                <div className="camera-section relative inline-block">
                  <video 
                    ref={cameraVideoRef}
                    className="camera-video w-full max-w-md h-64 bg-foreground rounded-xl border-3 border-primary"
                    autoPlay 
                    muted
                  ></video>
                  <canvas className="detection-overlay absolute top-0 left-0 pointer-events-none rounded-xl"></canvas>
                </div>
                <div className="camera-controls flex flex-wrap justify-center gap-3 mt-4">
                  {!cameraActive ? (
                    <button 
                      className="btn btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                      onClick={startCamera}
                    >
                      <span>📹</span> Start Camera
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-success flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium"
                        onClick={capturePhoto}
                      >
                        <span>📸</span> Capture & Analyze
                      </button>
                      <button 
                        className="btn btn-danger flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium"
                        onClick={stopCamera}
                      >
                        <span>⏹️</span> Stop Camera
                      </button>
                    </>
                  )}
                </div>
                <canvas ref={captureCanvasRef} className="capture-canvas hidden"></canvas>
              </div>
              
              {analysisLoading && (
                <div className="text-center mt-5">
                  <div className="animate-spin inline-block">🔄</div>
                  <span className="ml-2">Analyzing with Aahaara360...</span>
                </div>
              )}
              
              {detectionResults.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-lg font-semibold mb-3">Detection Results</h4>
                  {detectionResults.map((food, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-md mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-xl">🍽️ {food.name}</strong>
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">
                          {food.confidence}% confident
                        </span>
                      </div>
                      <div className="text-gray-600 mb-3">
                        <strong>Portion:</strong> {food.portion_size} {food.unit}
                      </div>
                      <div className="nutrition-grid grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.calories}</div>
                          <div>Calories</div>
                        </div>
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.carbs}g</div>
                          <div>Carbs</div>
                        </div>
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.protein}g</div>
                          <div>Protein</div>
                        </div>
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.fat}g</div>
                          <div>Fat</div>
                        </div>
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.fiber}g</div>
                          <div>Fiber</div>
                        </div>
                        <div className="nutrition-item bg-muted p-3 rounded text-center">
                          <div className="nutrition-value font-bold text-primary">{food.nutrition.sugar}g</div>
                          <div>Sugar</div>
                        </div>
                      </div>
                      
                      {/* Ayurvedic Properties */}
                      <div className="ayurveda-section bg-accent p-4 rounded-lg mt-4">
                        <h5 className="text-primary font-semibold mb-3">🕉️ Ayurvedic Properties</h5>
                        <div className="dosha-indicators flex flex-wrap gap-2 mb-3">
                          <span className="dosha-tag bg-purple-600 text-white px-2 py-1 rounded text-xs">
                            Vata: {food.ayurveda.doshas.vata}
                          </span>
                          <span className="dosha-tag bg-red-600 text-white px-2 py-1 rounded text-xs">
                            Pitta: {food.ayurveda.doshas.pitta}
                          </span>
                          <span className="dosha-tag bg-green-600 text-white px-2 py-1 rounded text-xs">
                            Kapha: {food.ayurveda.doshas.kapha}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div><strong>Rasa (Taste):</strong> {food.ayurveda.rasa.join(', ')}</div>
                          <div><strong>Virya (Potency):</strong> {food.ayurveda.virya}</div>
                          <div><strong>Vipaka (Post-digestive):</strong> {food.ayurveda.vipaka}</div>
                          <div><strong>Guna (Qualities):</strong> {food.ayurveda.guna.join(', ')}</div>
                          <div className="mt-2 italic">{food.ayurveda.properties}</div>
                        </div>
                      </div>
                      
                      <button 
                        className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold mt-3"
                        onClick={() => {
                          const newFood = {
                            id: Date.now(),
                            name: food.name,
                            quantity: food.portion_size,
                            unit: food.unit,
                            calories: food.nutrition.calories,
                            carbs: food.nutrition.carbs,
                            protein: food.nutrition.protein,
                            fat: food.nutrition.fat,
                            fiber: food.nutrition.fiber,
                            sugar: food.nutrition.sugar,
                            ayurveda: food.ayurveda,
                            timestamp: new Date().toLocaleTimeString(),
                            source: 'AI Analysis'
                          }
                          setDailyFoods([...dailyFoods, newFood])
                          alert(`✅ Added ${food.name} (${food.portion_size}${food.unit}) to your food log!`)
                        }}
                      >
                        ➕ Add to Food Log
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="section bg-card border border-border rounded-xl shadow-md overflow-hidden">
            <div className="section-header p-6 border-b border-border">
              <div className="section-title flex items-center gap-3 mb-2">
                <div className="icon w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">📸</div>
                <h2 className="text-xl font-semibold">Photo Analysis</h2>
              </div>
              <p className="section-description text-muted-foreground text-sm">Upload a photo for AI food recognition</p>
            </div>
            <div className="section-content p-6">
              <div 
                className="upload-area border-3 border-dashed border-border rounded-xl p-10 text-center bg-muted cursor-pointer transition-all hover:bg-accent hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-icon text-5xl text-primary mb-4">📷</div>
                <h3 className="text-lg font-medium mb-2">Drop your food photo here or click to upload</h3>
                <p className="text-muted-foreground">Supported formats: JPG, PNG, GIF</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Food preview" className="image-preview max-w-xs max-h-48 mx-auto mt-4 rounded border-2 border-border" />
                )}
              </div>
              {imagePreview && (
                <button 
                  className="btn btn-primary btn-lg w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium"
                  onClick={analyzeFood}
                >
                  <span>🔍</span> Analyze Food with Aahaara360
                </button>
              )}
            </div>
          </div>

          {/* Manual Food Entry */}
          <div className="section bg-card border border-border rounded-xl shadow-md overflow-hidden">
            <div className="section-header p-6 border-b border-border">
              <div className="section-title flex items-center gap-3 mb-2">
                <div className="icon w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">✏️</div>
                <h2 className="text-xl font-semibold">Manual Food Entry</h2>
              </div>
              <p className="section-description text-muted-foreground text-sm">Add foods manually with Ayurvedic properties preview</p>
            </div>
            <div className="section-content p-6">
              <form className="food-form grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="form-group flex flex-col">
                  <label htmlFor="foodName" className="font-semibold mb-2">Food Name</label>
                  <input 
                    type="text" 
                    id="foodName"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g., Apple, Chicken Breast" 
                    className="p-3 border-2 border-input rounded bg-background"
                    required 
                  />
                </div>
                <div className="form-group flex flex-col">
                  <label htmlFor="quantity" className="font-semibold mb-2">Quantity</label>
                  <input 
                    type="number" 
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 1, 100" 
                    className="p-3 border-2 border-input rounded bg-background"
                    required 
                  />
                </div>
                <div className="form-group flex flex-col">
                  <label htmlFor="unit" className="font-semibold mb-2">Unit</label>
                  <select 
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="p-3 border-2 border-input rounded bg-background"
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="piece">Piece</option>
                    <option value="grams">Grams</option>
                    <option value="cups">Cups</option>
                    <option value="tablespoons">Tablespoons</option>
                    <option value="ounces">Ounces</option>
                  </select>
                </div>
                <div className="form-group flex flex-col">
                  <label htmlFor="calories" className="font-semibold mb-2">Calories (optional)</label>
                  <input 
                    type="number" 
                    id="calories"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Auto-calculated if empty" 
                    className="p-3 border-2 border-input rounded bg-background"
                  />
                </div>
              </form>
              <div className="flex flex-wrap gap-4 mt-6">
                <button 
                  className="btn btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                  onClick={previewFood}
                >
                  <span>👁️</span> Preview Properties
                </button>
                {showFoodPreview && (
                  <button 
                    className="btn btn-success flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium"
                    onClick={addFood}
                  >
                    <span>✅</span> Confirm & Add
                  </button>
                )}
              </div>

              {/* Food Preview Section */}
              {showFoodPreview && (
                <div className="mt-5">
                  <h4 className="text-lg font-semibold mb-4">🔍 Food Preview & Properties</h4>
                  <div className="bg-card p-6 rounded-xl border border-border">
                    <h4 className="text-xl font-semibold mb-3">🍽️ {foodName}</h4>
                    <p className="text-muted-foreground mb-4">Quantity: {quantity} {unit}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <h5 className="text-primary font-semibold mb-2">📊 Nutrition Facts</h5>
                        <div className="text-sm">
                          <div>Calories: {calories || calculateNutrition(foodName.toLowerCase(), parseFloat(quantity)).calories.toFixed(1)}</div>
                          <div>Carbs: {calculateNutrition(foodName.toLowerCase(), parseFloat(quantity)).carbs.toFixed(1)}g</div>
                          <div>Protein: {calculateNutrition(foodName.toLowerCase(), parseFloat(quantity)).protein.toFixed(1)}g</div>
                          <div>Fat: {calculateNutrition(foodName.toLowerCase(), parseFloat(quantity)).fat.toFixed(1)}g</div>
                          <div>Fiber: {calculateNutrition(foodName.toLowerCase(), parseFloat(quantity)).fiber?.toFixed(1) || 0}g</div>
                        </div>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h5 className="text-primary font-semibold mb-2">🕉️ Ayurvedic Properties</h5>
                        <div className="text-sm">
                          <div><strong>Rasa:</strong> {foodDatabase[foodName.toLowerCase()]?.ayurveda?.rasa.join(', ') || 'Unknown'}</div>
                          <div><strong>Virya:</strong> {foodDatabase[foodName.toLowerCase()]?.ayurveda?.virya || 'Unknown'}</div>
                          <div><strong>Vipaka:</strong> {foodDatabase[foodName.toLowerCase()]?.ayurveda?.vipaka || 'Unknown'}</div>
                          <div><strong>Dosha Effect:</strong> Balanced</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent p-4 rounded-lg border-l-4 border-primary">
                      <h5 className="text-primary font-semibold mb-2">💡 Health Benefits</h5>
                      <p className="text-sm">
                        {foodDatabase[foodName.toLowerCase()]?.ayurveda?.properties || 'This food provides essential nutrients and supports overall health according to Ayurvedic principles.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Food List */}
          <div className="section bg-card border border-border rounded-xl shadow-md overflow-hidden">
            <div className="section-header p-6 border-b border-border">
              <div className="section-title flex items-center gap-3 mb-2">
                <div className="icon w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">📋</div>
                <h2 className="text-xl font-semibold">Today's Food Log</h2>
              </div>
              <p className="section-description text-muted-foreground text-sm">Your tracked meals and snacks with Ayurvedic insights</p>
            </div>
            <div className="section-content p-6">
              <div className="food-list">
                {dailyFoods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-5">No foods added yet. Start by uploading a photo or manually adding food!</p>
                ) : (
                  dailyFoods.map((food) => (
                    <div key={food.id} className="food-item bg-card p-5 rounded-xl border-l-4 border-primary shadow-md mb-4 flex justify-between items-center">
                      <div className="food-details flex-1">
                        <div className="food-name font-semibold text-lg">{food.name}</div>
                        <div className="food-nutrition text-muted-foreground text-sm">
                          {food.quantity} {food.unit} • {Math.round(food.calories)} cal • 
                          C: {Math.round(food.carbs)}g • P: {Math.round(food.protein)}g • F: {Math.round(food.fat)}g • 
                          Added: {food.timestamp} • {food.source}
                        </div>
                        {food.ayurveda && (
                          <div className="mt-2">
                            <div className="dosha-indicators flex flex-wrap gap-1">
                              <span className="dosha-tag bg-purple-600 text-white px-2 py-1 rounded text-xs">
                                V: {food.ayurveda.doshas.vata}
                              </span>
                              <span className="dosha-tag bg-red-600 text-white px-2 py-1 rounded text-xs">
                                P: {food.ayurveda.doshas.pitta}
                              </span>
                              <span className="dosha-tag bg-green-600 text-white px-2 py-1 rounded text-xs">
                                K: {food.ayurveda.doshas.kapha}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn btn-danger px-3 py-2 bg-red-600 text-white rounded-md text-sm"
                        onClick={() => removeFood(food.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              {dailyFoods.length > 0 && (
                <button 
                  className="btn btn-danger btn-sm mt-4 flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md text-sm"
                  onClick={clearAllFoods}
                >
                  <span>🗑️</span> Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}