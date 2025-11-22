# MedSafe - Medication Safety & Verification Platform

A comprehensive web-based platform for medication verification, drug interaction checking, and patient safety monitoring. MedSafe combats counterfeit medications while providing AI-powered tools for medication management and safety assessment.

## Overview

MedSafe is a full-stack healthcare application designed to address medication safety challenges in India and beyond. The platform enables users to verify medication authenticity through multiple methods (QR codes, image recognition, batch numbers), check for dangerous drug interactions, manage medical history, and access emergency medical resources.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first styling with custom design system
- **shadcn/ui** - Accessible component library
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **Recharts** - Data visualization
- **next-themes** - Dark mode with system preference detection

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with Row-Level Security (RLS)
  - Edge Functions (TypeScript/Deno serverless)
  - Real-time subscriptions
  - Authentication (Email/Password, Google OAuth, Phone OTP)
  - File Storage
- **pg_cron** - Automated scheduled tasks

### AI Integration
- **Google Gemini 2.0 Flash** - AI model for:
  - Medicine information lookup
  - Drug interaction analysis
  - Safety score calculation
  - Diet recommendations
  - Prescription OCR assistance

### Additional Libraries
- **Tesseract.js** - OCR for prescription scanning
- **html2canvas** + **jsPDF** - PDF report generation
- **qrcode** - QR code generation
- **html5-qrcode** - QR code scanning
- **React Markdown** - Rich text rendering
- **KaTeX** - Mathematical expression rendering

## Key Features

### 🔍 Multi-Modal Drug Verification
- **QR Code Scanning**: Real-time camera scanning or file upload
- **Batch Number Lookup**: Direct database verification against FDA dataset
- **Medicine Name Search**: AI-powered information retrieval
- **Image Recognition**: Photo-based medicine identification using AI

### 📄 Prescription Scanner
- OCR extraction using Tesseract.js + Gemini AI
- Automatic drug verification for all extracted medications
- Counterfeit and interaction flagging
- Secure encrypted storage with PDF export
- Multi-user support (family members, caregivers)

### ⚠️ Drug Interaction Checker
- Multi-medication interaction analysis
- Food and alcohol interaction detection
- Severity levels (Severe/Moderate/Minor) with color coding
- Timing recommendations
- Alternative medication suggestions

### 🎯 Safety Score Calculator
- AI-based patient-specific safety assessment
- Considers: age, medical conditions, current medications
- Drug interaction risk evaluation
- Built-in example entries for testing

### 📋 Medical History Management
- Medication tracking with dosage and frequency
- Medicine reminder system with notifications
- Family member health record management
- Caregiver access control with granular permissions

### 🍎 Diet Recommendation System
- AI-powered personalized diet plans
- Considers medical history and current medications
- Interactive AI chat for nutritional guidance
- Markdown-formatted recommendations with mathematical expressions

### 🌍 Community Reporting System
- Counterfeit medication reporting with photo uploads
- Anonymous submission support
- Status workflow (Submitted → Under Review → Investigated → Resolved)
- Gamification: points, badges, and leaderboard
- Public heatmap visualization of reported locations

### 🏥 Pharmacy Locator
- Licensed pharmacy directory
- Google Maps integration (API required)
- Filtering by 24/7 availability, services, ratings
- License verification status
- Contact information and directions

### 🚨 Emergency Module
- Public access (no login required)
- Indian-specific emergency helplines (112, Poison Control)
- First aid guides aligned with Indian medical standards
- Drug overdose symptoms and antidote information
- Emergency report filing

### 🔔 Real-Time Notifications
- Supabase real-time subscriptions
- Counterfeit detection alerts
- Medicine reminders
- Verification status updates
- Community report status changes

### 👥 Role-Based Access Control
- **Patient**: Personal medication management
- **Pharmacist**: Drug verification approval workflow
- **Admin**: System-wide oversight, user management, analytics

## Architecture

### Frontend Layer
- Single Page Application (SPA) with code splitting
- React.lazy and Suspense for lazy loading
- Responsive design with mobile-first approach
- WebP image optimization with lazy loading
- Dark/Light theme with system preference detection

### API Layer (Edge Functions)
Serverless TypeScript functions running on Deno:
- `medicine-info` - AI medicine information lookup
- `drug-interactions` - Multi-drug interaction analysis
- `prescription-ocr` - OCR + AI prescription extraction
- `safety-score-ai` - Patient safety calculation
- `diet-recommendation` - Personalized diet planning
- `diet-chat` - Diet AI chat assistant
- `scan-medicine-image` - Image-based medicine identification
- `check-medicine-reminders` - Automated reminder notifications (cron)
- `send-auth-email` - Custom authentication emails
- `import-fda-drugs` - Bulk FDA dataset import

### Database Layer
PostgreSQL with comprehensive schema:

**Core Tables:**
- `drugs` - FDA drug dataset (200k+ entries with batch numbers, risk levels, dates)
- `scan_logs` - Drug verification history with status tracking
- `patient_history` - Medical records with medication tracking
- `prescriptions` - OCR-extracted prescription data
- `counterfeit_reports` - User-submitted reports with gamification
- `pharmacies` - Licensed pharmacy directory
- `family_members` - Family health record management
- `caregivers` - Caregiver access control

**User Management:**
- `profiles` - User profile data
- `user_roles` - Role-based access control
- `user_rewards` - Gamification points and badges
- `notifications` - Real-time notification system
- `dashboard_stats` - User activity tracking

**Security:**
- Row-Level Security (RLS) policies on all tables
- Security definer functions for role checking
- Trigger-based automatic notifications
- Automated timestamp updates

### Authentication
- Email/Password authentication with leaked password protection
- Google OAuth integration
- Phone OTP authentication
- Session management with automatic refresh
- Role-based authorization

### File Storage
- Supabase Storage buckets:
  - `avatars` - User profile pictures (public)
  - Prescription images (private)
  - Community report photos

## Database Features

### Row-Level Security (RLS)
Every table implements RLS policies ensuring:
- Users can only access their own data
- Pharmacists can verify pending scans
- Admins have system-wide access
- Public data is accessible to everyone

### Database Triggers
- `handle_new_user()` - Auto-create profile and assign default role on signup
- `notify_pharmacists_of_new_scan()` - Real-time alerts to pharmacists
- `award_report_points()` - Gamification point assignment
- `update_updated_at_column()` - Automatic timestamp management

### Scheduled Jobs (pg_cron)
- `check-medicine-reminders` - Runs every minute to send medication reminders

## Setup & Development

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file (or use the auto-generated one):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Development

```bash
# Start development server
npm run dev

# Run type checking
npm run build

# Run E2E tests
npx playwright test
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Technical Features

### Performance Optimizations
- Code splitting with React.lazy
- WebP image format with fallbacks
- Lazy loading with `loading="lazy"` attribute
- Tree shaking and minification
- Chunk optimization

### Accessibility
- ARIA-compliant components
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

### Testing
- Playwright E2E tests
- GitHub Actions CI/CD integration
- Automated testing on every push
- Responsive design testing

### Security
- Row-Level Security on all database tables
- Leaked password protection
- Secure session management
- CORS configuration for edge functions
- Input validation and sanitization
- Encrypted file storage

### Design System
- Custom Tailwind configuration with semantic tokens
- HSL color system for theming
- Consistent spacing and typography
- Dark/Light theme support
- Responsive breakpoints

## Data Sources

- **FDA Drug Dataset** (February 2024): 200,000+ FDA-approved drugs
  - Kaggle: United States FDA Drugs dataset
  - Imported via bulk JSON processing
  - Includes: drug names, batch numbers, manufacturers, dates, risk levels

- **AI Models**: Google Gemini 2.0 Flash
  - Medicine information retrieval
  - Drug interaction analysis
  - Safety assessment
  - Diet recommendations

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-based page components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── integrations/    # External service integrations
│   └── assets/          # Static assets (images, icons)
├── supabase/
│   ├── functions/       # Edge Functions (serverless)
│   ├── migrations/      # Database migration scripts
│   └── config.toml      # Supabase configuration
├── e2e/                 # Playwright E2E tests
└── public/              # Public static files
```

## Contributing

This is a hackathon project for medication safety awareness. The codebase demonstrates integration of modern web technologies with AI to solve real-world healthcare challenges.

## License

[Add your license here]

## Acknowledgments

- FDA for open drug dataset
- Google Gemini AI for intelligent features
- Supabase for backend infrastructure
- shadcn/ui for accessible components
