# 💸 Money Manager

A modern, intuitive personal finance tracker built with Next.js, TypeScript, and Supabase. Track your income, set recurring rules for savings and investments, and manage your daily spending with real-time balance protection.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 🎯 **Smart Financial Management**
- **Income Tracking**: Add and manage multiple income sources with notes
- **Recurring Rules**: Set up automatic monthly allocations for savings, investments, and bills
- **One-off Transactions**: Track daily spending, extra savings, and investment trades
- **Real-time Balance Protection**: Prevents overspending with intelligent safeguards

### 💡 **Key Features**
- **Multiple Recurring Expenses**: Add unlimited recurring expenses with descriptions (Netflix, Rent, Gym, etc.)
- **Income History**: View and delete income entries with full transaction history
- **Live Balance Updates**: See your "Remaining to Spend" balance update in real-time
- **Modern UI**: Beautiful gradient design with glass morphism effects
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on desktop and mobile

### 🛡️ **Smart Safeguards**
- **Balance Protection**: Can't activate recurring rules without sufficient funds
- **Overspending Prevention**: Blocks transactions that would exceed your budget
- **Data Validation**: Ensures all amounts are valid and positive

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account (free tier works great!)

### 1. Clone the Repository
```bash
git clone https://github.com/cloud-vinny/money_manager.git
cd money_manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings → API

### 4. Configure Environment Variables
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📱 How to Use

### **Dashboard** 📊
- **Add Income**: Enter your monthly income with optional notes
- **Income History**: View and delete all income entries
- **Financial Summary**: See totals for income, savings, investments, and spending
- **Remaining Balance**: Live calculation of money available to spend

### **Spend Page** 💳
- **Add Recurring Expenses**: Create multiple recurring bills (Netflix, Rent, etc.)
- **Manage Expenses**: Toggle active/inactive, edit amounts, delete expenses
- **One-off Spending**: Add daily expenses with merchant and category
- **Month Totals**: View recurring vs one-off spending breakdown

### **Savings Page** 🏦
- **Recurring Savings**: Set up automatic monthly savings transfers
- **One-off Transfers**: Add extra savings when you have extra money
- **Savings Tracking**: Monitor your total savings for the month

### **Investments Page** 📈
- **Recurring Investments**: Automate monthly investment contributions
- **One-off Trades**: Add extra investment amounts
- **Investment Tracking**: Track your total investment activity

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 15.5.2 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Custom CSS with modern design patterns
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Authentication**: Single-user demo system (easily extensible)

### **Database Schema**
- **Profiles**: User accounts
- **Periods**: Monthly tracking periods
- **Incomes**: Income entries with notes
- **Expenses**: One-off spending transactions
- **Savings Transfers**: Savings transactions
- **Investment Trades**: Investment transactions
- **Recurring Allocations**: Monthly recurring rules

### **Key Features**
- **Server Actions**: Direct database operations from React components
- **Real-time Updates**: Instant UI updates after database changes
- **Balance Guards**: Prevents overspending at the database level
- **Responsive Design**: Mobile-first approach with modern CSS

## 🎨 Design Features

### **Modern UI Elements**
- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Glass Morphism**: Translucent cards with backdrop blur
- **Hover Animations**: Smooth transitions and interactions
- **Typography**: Modern font hierarchy with gradient text effects
- **Color Scheme**: Consistent purple/blue theme throughout

### **User Experience**
- **Intuitive Navigation**: Clear header with page navigation
- **Form Validation**: Real-time error checking and feedback
- **Modal Dialogs**: Clean error messages and confirmations
- **Loading States**: Smooth transitions between states

## 🔧 Development

### **Project Structure**
```
money_manager/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── spend/page.tsx        # Spending management
│   │   ├── savings/page.tsx      # Savings tracking
│   │   ├── investments/page.tsx  # Investment management
│   │   ├── actions.ts            # Server actions
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── components/
│   │       ├── Modal.tsx         # Error modal
│   │       └── ThemeToggle.tsx   # Dark mode toggle
│   └── lib/
│       ├── supabase.ts           # Supabase client
│       └── theme.ts              # Theme utilities
├── supabase/
│   └── schema.sql               # Database schema
└── .env.local                   # Environment variables
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) for the amazing React framework
- Powered by [Supabase](https://supabase.com/) for the backend-as-a-service
- Styled with modern CSS techniques and design principles

---

**Made with ❤️ by Vince**

*Track your money, build your future! 💰*
