# 📈 AI Stock Market Sentiment Analyzer

<div align="center">
  <img width="800" height="400" alt="Stock Sentiment Analyzer" src="https://via.placeholder.com/800x400/1f2937/14b8a6?text=AI+Stock+Market+Sentiment+Analyzer" />
</div>

A powerful AI-driven application that analyzes stock market sentiment using Google's Gemini AI. Get real-time sentiment analysis, technical indicators, news feeds, and investment recommendations for any stock across multiple exchanges.

## ✨ Features

- 🔍 **Multi-Exchange Support**: NSE, BSE, NASDAQ, NYSE, LSE, TSE
- 🤖 **AI-Powered Analysis**: Uses Google Gemini 2.5 Flash for sentiment analysis
- 📊 **Technical Indicators**: RSI, Moving Averages, Volume analysis
- 📰 **News Integration**: Latest news articles and market updates
- 📈 **Interactive Charts**: Price charts with technical overlays
- 🎯 **Investment Recommendations**: Buy/Hold/Sell suggestions with reasoning
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔄 **Real-time Data**: Up-to-date market information
- 📤 **Export & Share**: CSV export and social media sharing

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Stock-Market-Sentiment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the template file
   cp env.template .env
   
   # Edit .env file and add your API key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Start analyzing stocks! 🎉

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 📁 Project Structure

```
Stock-Market-Sentiment/
├── src/
│   ├── components/          # React components
│   │   ├── icons/          # SVG icon components
│   │   ├── AspectRadarChart.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── PriceChart.tsx
│   │   ├── SentimentChart.tsx
│   │   ├── SentimentResult.tsx
│   │   └── StockInputForm.tsx
│   ├── services/           # API services
│   │   └── geminiService.ts
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── App.tsx            # Main application component
├── public/                # Static assets
├── .env                   # Environment variables
├── env.template          # Environment template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server Configuration
PORT=3000
```

### Supported Exchanges

- **NSE** (India) - National Stock Exchange
- **BSE** (India) - Bombay Stock Exchange  
- **NASDAQ** (USA) - National Association of Securities Dealers
- **NYSE** (USA) - New York Stock Exchange
- **LSE** (UK) - London Stock Exchange
- **TSE** (Japan) - Tokyo Stock Exchange

## 📊 How It Works

1. **Input**: Enter a stock symbol and select an exchange
2. **AI Analysis**: Gemini AI analyzes market sentiment using:
   - Recent news articles
   - Social media trends
   - Financial reports
   - Technical indicators
3. **Results**: Get comprehensive analysis including:
   - Overall sentiment score (-1 to +1)
   - Investment recommendation
   - Positive and negative points
   - Technical indicators (RSI, Moving Averages)
   - Historical price data
   - Recent news articles

## 🎨 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Google Gemini 2.5 Flash
- **Icons**: Custom SVG components
- **Build Tool**: Vite

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Upload the `dist` folder to your web server
3. Configure your server to serve the built files

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure
- Use environment variables for all sensitive data
- Consider using a proxy server for production API calls

## 🐛 Troubleshooting

### Common Issues

**"GEMINI_API_KEY environment variable is not set"**
- Ensure your `.env` file exists in the root directory
- Check that the API key is correctly formatted
- Restart the development server after adding the key

**"Network error"**
- Check your internet connection
- Verify your API key is valid
- Ensure the Gemini API is accessible from your location

**"Model not found"**
- The app uses `gemini-2.5-flash` model
- Ensure your API key has access to this model
- Check Google's model availability

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your API key is working: https://makersuite.google.com/app/apikey
3. Ensure all dependencies are installed: `npm install`
4. Try restarting the development server

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Recharts for beautiful chart components
- Tailwind CSS for utility-first styling
- React team for the amazing framework

---

**Disclaimer**: This application is for educational and informational purposes only. It is not intended as financial advice. Always consult with a qualified financial advisor before making investment decisions.
