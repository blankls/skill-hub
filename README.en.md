# SkillHub

A visual platform for centralized display and management of personal/team AI Skills. Here you can quickly browse imported Skill files, understand each tool's core functionality, use cases, and standard operating procedures.

## ✨ Features

- 📦 **Skill Management** - Browse, search and filter skills
- 📝 **Skill Import** - Support multiple ways to import skills
- 🌓 **Theme Toggle** - Dark/Light theme
- 🔒 **Admin Dashboard** - Secure skill editing and management
- 📱 **Responsive Design** - Support for multiple devices
- 📤 **Export Feature** - One-click export of skill packages

## 🛠️ Tech Stack

### Frontend
- Vue 3 + Vite
- TypeScript
- Pinia (State Management)
- Vue Router
- Element Plus
- Tailwind CSS

### Backend
- Node.js + Express
- File-based storage system (JSON)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn/pnpm

### Installation and Running

1. **Clone the repository**

```bash
git clone <repository-url>
cd skill-hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Copy environment variables example file
cp .env.example .env

# Edit .env file as needed
```

4. **Start development server**

```bash
# Start backend API and frontend dev server together
npm run dev:all

# Or start separately
# Start backend
npm run server
# Start frontend (in another terminal)
npm run dev
```

5. **Access the application**

- Frontend: http://localhost:5173 (or port shown in terminal)
- Backend API: http://localhost:3001

## 📁 Project Structure

```
skill-hub/
├── src/
│   ├── components/       # General components
│   │   ├── features/     # Feature components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── modules/          # Page modules
│   │   ├── admin/        # Admin dashboard
│   │   ├── home/         # Home page
│   │   ├── skill-detail/ # Skill detail
│   │   └── skill-list/   # Skill list
│   ├── stores/           # Pinia state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.vue           # Root component
│   ├── main.ts           # Entry file
│   └── router.ts         # Router configuration
├── data/
│   └── skills/           # Skill data storage (JSON)
├── docs/                 # Project documentation
├── .env.example          # Environment variables example
├── server.js             # Backend service
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## ⚙️ Environment Variables Configuration

Please refer to the `.env.example` file to create your `.env` file, and configure the following variables:

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API address | `http://localhost:3001/api` |
| `VITE_ADMIN_PASSWORD` | Admin password | `admin123` |

### Backend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Backend service host | `localhost` |
| `PORT` | Backend service port | `3001` |
| `DATA_DIR` | Skill data storage directory (absolute or relative to project root) | `data/skills` |

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run dev:all` | Start backend and frontend together |
| `npm run server` | Start backend API service only |
| `npm run build` | Build production version |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |

## 🔒 Security Notes

- Admin dashboard is password protected, default password is `admin123`
- Please change to a strong password in production
- Session timeout is set to 30 minutes
- More security recommendations in [docs/SECURITY.md](docs/SECURITY.md) (Chinese)

## 📖 Related Documentation

- Security Guide (Chinese): [docs/SECURITY.md](docs/SECURITY.md)

## 🤝 Contributing Guidelines

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- SkillHub Team
