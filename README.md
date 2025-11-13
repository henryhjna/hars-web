# Hanyang Accounting Research Symposium (HARS) Web Platform

A comprehensive web platform for managing academic symposiums, paper submissions, and peer reviews.

## Project Structure

```
hars-web/
├── client/          # React + TypeScript frontend
├── server/          # Node.js + Express + TypeScript backend
├── db/              # PostgreSQL database scripts
├── terraform/       # AWS infrastructure as code
├── nginx/           # Nginx configuration
└── docker-compose.yml
```

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT Authentication
- AWS S3 (file storage)
- Nodemailer (email)

### Infrastructure
- Docker & Docker Compose
- Terraform (AWS)
- Nginx (reverse proxy)
- AWS EC2 (t2.micro)
- AWS S3
- AWS Route 53
- Let's Encrypt (SSL)

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- AWS Account

### Local Development

1. Clone the repository
```bash
git clone https://github.com/henryhjna/hars-web.git
cd hars-web
```

2. Set up environment variables (see `.env.example` files)

3. Start with Docker Compose
```bash
docker-compose up -d
```

4. Access the application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

## Deployment

See [terraform/README.md](terraform/README.md) for AWS deployment instructions.

## License

MIT
