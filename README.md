# Contract Analysis Frontend

A modern, responsive Next.js application that provides an intuitive interface for AI-powered contract analysis. Built with React 19, TypeScript, and Tailwind CSS, featuring real-time contract processing, interactive dashboards, and seamless payment integration.

## 🌟 Features

### Core User Interface
- **Modern Dashboard** - Clean, intuitive contract management interface
- **Real-time Analysis** - Live contract processing with progress indicators
- **Interactive Visualizations** - Charts and graphs using Recharts
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Framer Motion powered transitions

### Contract Management
- **Drag & Drop Upload** - Easy PDF file uploading interface
- **Contract Type Detection** - Visual confirmation of detected contract types
- **Analysis Results Display** - Comprehensive risk and opportunity presentation
- **Contract History** - Organized list of analyzed contracts
- **Search & Filter** - Quick contract discovery and organization
- **Export Capabilities** - Download analysis reports

### User Experience
- **Google OAuth Integration** - One-click authentication
- **Premium Subscription Flow** - Seamless Stripe checkout experience
- **Usage Analytics** - Visual representation of contract limits and usage
- **Error Handling** - User-friendly error messages and recovery
- **Loading States** - Skeleton loaders and progress indicators

### Premium Features UI
- **Advanced Analytics Dashboard** - Detailed contract insights
- **Unlimited Upload Interface** - No restrictions messaging
- **Comprehensive Reports** - Full analysis results display
- **Negotiation Points** - Interactive recommendations interface
- **Financial Terms Breakdown** - Structured data presentation
- **Performance Metrics** - KPI visualization

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.3.0** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Radix UI** - Accessible, unstyled components
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library
- **Framer Motion** - Production-ready motion library

### State Management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **React Hook Form** - Form state management


## 🚀 Quick Start

### Prerequisites
- Node.js (v18.18.0 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone github-project-path
   cd github-project
   ```

2. **Install dependencies**
   ```bash
   yarn
   ```

3. **Environment Setup**
   
   Create `.env.local` file in the client directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   NEXT_PUBLIC_GEMINI_API_KEY=
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
client/
├── public/                      # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (private)/          # Protected route group
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── payment-cancel/  # Payment cancellation page
│   │   │   └── payment-success/ # Payment success page
│   │   ├── about-us/            # About-us page
│   │   ├── features/            # Features page
│   │   ├── pricing/            # Pricing page
│   │   ├── privacy-policy/        # Privacy-Policy page
│   │   ├── terms-and-conditions/  # Terms-and-Conditions page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # React components
│   │   ├── analysis/           # Contract analysis components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── modals/             # Modal components
│   │   ├── shared/             # Shared components
│   │   ├── ui/                 # Base UI components (Radix)
|   |   ├──footer.tsx           # Footer Code
|   |   ├──header.tsx           # Header Code
|   |   ├──hero-section.tsx     # Hero-Section Code
|   |   ├──pricing-section.tsx  # Pricing-Section Code
│   └── hooks/                  # Custom React hooks files
│   ├── interfaces/             # TypeScript interfaces
│   │   └── contract.interface.ts # Contract types
│   ├── lib/                    # Utility functions 
│   │   ├── api.ts              # API client setup
│   │   ├──stripe.ts           # Stripe configuration
│   │   └── utils.ts            # General utilities
│   ├── providers/              # Context providers files
│   └── store/                  # State management (Zustand)    
└── README.md                  # This file
```

