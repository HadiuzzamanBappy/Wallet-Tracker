# 💰 Wallet App - AI-Powered Expense Tracker

A modern, React-based wallet application with AI-powered natural language processing for expense tracking. No external APIs required - everything runs locally!

## ✨ Features

- 🤖 **Enhanced AI Chat Interface** - Advanced NLP with regex patterns and Compromise.js
- 🔥 **Firebase Backend** - Real-time data synchronization with proper security rules
- 📊 **Real-time Dashboard** - Live updates with weekly/monthly statistics
- 🏷️ **Smart Categorization** - Intelligent expense/income detection with confidence scoring
- 💬 **Advanced NLP Processing** - Pattern matching + linguistic analysis for better accuracy
- 🎨 **Modern Redesigned UI** - Beautiful gradient cards and responsive design
- 🔐 **Secure Authentication** - Email/Password and Google Sign-in with proper Firebase rules
- ⚡ **Live Updates** - Dashboard refreshes automatically on transaction changes

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Firebase Account (free)

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd wallet-app
   npm install
   ```

2. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password + Google)
   - Create Firestore Database
   - Copy your Firebase config

3. **Environment Setup**
   - Rename `.env.example` to `.env`
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```

## 🎯 How to Use

### Adding Transactions via Chat

The enhanced AI assistant with advanced NLP understands complex natural language! Try these:

**💸 Advanced Expense Examples:**
- "I bought groceries for 500 taka today"
- "Paid the electricity bill 2000 BDT"
- "Spent 350 on movie tickets last night"
- "Ordered pizza delivery for 800"
- "Movie ticket cost 350"
- "Uber ride 200 BDT"

**💰 Advanced Income Examples:**
- "Received my monthly salary 50000"
- "Got paid 3000 for freelance work"
- "Earned bonus 5000 from company"
- "Sold my old phone for 15000"

### Categories

The app automatically categorizes transactions:
- 🍔 Food (groceries, restaurant, meals)
- 🚗 Transport (uber, taxi, fuel)
- 🎬 Entertainment (movies, games)
- 🛍️ Shopping (clothes, online purchases)
- 📄 Bills (electricity, internet, rent)
- 🏥 Health (doctor, medicine)
- 📚 Education (books, courses)
- 💼 Salary & 💻 Freelance (income)

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Firebase (Auth + Firestore)
- **NLP:** Compromise.js (Local processing)
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Date Handling:** date-fns

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/           # Login/Register components
│   ├── Chat/           # AI Chat interface
│   ├── Dashboard/      # Main dashboard
│   └── Layout/         # Navigation components
├── config/
│   └── firebase.js     # Firebase configuration
├── context/
│   └── AuthContext.jsx # Authentication context
├── hooks/
│   └── useAuth.js      # Authentication hook
├── services/
│   ├── authService.js      # Authentication logic
│   └── transactionService.js # Transaction CRUD
├── utils/
│   ├── transactionParser.js # Local NLP parser
│   └── helpers.js           # Utility functions
├── App.jsx
└── main.jsx
```

## 🔐 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own profile and transactions
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read/write their own transactions
      match /transactions/{transactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Alternative structure for transactions at root level
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 🎨 Customization

### Adding New Categories
Edit `src/utils/transactionParser.js`:

```javascript
const categoryKeywords = {
  yourCategory: ['keyword1', 'keyword2', 'keyword3'],
  // ... existing categories
};
```

### Styling
The app uses Tailwind CSS. Customize colors and themes in `tailwind.config.js`.

## 🐛 Troubleshooting

1. **Firebase Connection Issues**
   - Verify your `.env` file has correct Firebase config
   - Check Firebase project settings

2. **Tailwind Not Working**
   - Ensure PostCSS is configured
   - Check `tailwind.config.js` content paths

3. **Chat Not Responding**
   - Check browser console for errors
   - Verify NLP parser is importing correctly

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made with ❤️ using React, Firebase, and local AI processing**

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
