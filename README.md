# WIT AI - Work in Tandem AI

An AI-powered logistics platform that connects shippers and carriers seamlessly while providing intelligent assistance for sales operations.

## 🚀 Features

- **Smart Logistics Matching**: AI-powered algorithms match shippers with optimal truckers
- **Secure Payment Management**: Automated payment processing for both parties
- **Real-time Analytics**: Track performance and monitor KPIs
- **AI Call Assistant**: Real-time AI guidance during calls to maximize conversion
- **Role-based Access Control**: Admin, Manager, and Agent user roles
- **Email Integration**: Gmail API integration for email management

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Authentication**: Supabase Auth
- **Email**: Gmail API
- **Maps**: Mapbox GL
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console project (for Gmail API)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wit-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials in `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── contexts/           # React contexts (User, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
├── pages/              # Page components
└── main.tsx           # App entry point
```

## 🔐 Authentication

The app uses mock authentication for development. To use real Supabase auth:

1. Set up Supabase Auth in your project
2. Replace mock login in `src/contexts/UserContext.tsx`
3. Configure Row Level Security (RLS) policies

## 👥 User Roles

- **Admin**: Full access to all features
- **Manager**: Access to dashboard, reports, calls, email, training, directory
- **Agent**: Access to dashboard, calls, email, training, directory

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `VITE_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support, email sales@witai.com or join our Slack channel.
