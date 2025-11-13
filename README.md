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

## Features & Pages

### Public Pages

#### Home (`/`)
- Landing page with symposium information
- Quick links to upcoming events and paper submission
- Featured testimonials and highlights from past events

#### About (`/about`)
- Information about the symposium
- Mission and objectives
- Contact information

#### Upcoming Events (`/upcoming-events`)
- List of upcoming symposiums
- Event details (date, location, venue)
- Submission deadlines and important dates
- Theme color and banner customization per event

#### Past Events (`/past-events`)
- Year-based archive of previous symposiums (2024, 2023, 2022...)
- Event overview with customizable highlights
- Photo galleries with highlight selection
- Keynote speaker profiles
- Best paper awards
- Participant testimonials
- Downloadable paper archives

### User Features (Authentication Required)

#### Submit Paper (`/submit-paper`)
- Paper submission form with required fields:
  - Title and abstract
  - Authors and co-authors information
  - Keywords
  - PDF file upload (max 10MB)
- Submission period validation
- Email confirmation upon submission
- Draft save functionality

#### My Submissions (`/my-submissions`)
- View all your submitted papers
- Edit submissions before deadline
- Track submission status (draft, submitted, under review, accepted, rejected, revision requested)
- Delete draft submissions
- Download submitted PDFs

### Reviewer Dashboard (Reviewer Role Required)

#### Reviewer Dashboard (`/reviewer`)
- List of assigned paper submissions
- Filter by review status (pending, in progress, completed)
- Quick access to review forms
- Review statistics

#### Review Form (`/review/:submissionId`)
- Detailed paper review interface
- Scoring system (1-5 scale) for:
  - Originality
  - Methodology
  - Clarity
  - Contribution
- Overall score calculation
- Recommendation options:
  - Accept
  - Reject
  - Major Revision
  - Minor Revision
- Comments to authors
- Confidential comments to committee
- Save draft and submit functionality

### Admin Dashboard (Admin Role Required)

#### Admin Dashboard (`/admin`)
- Statistics overview:
  - Total events, submissions, users, reviewers
  - Recent submissions
  - Submission status breakdown
- Quick links to management pages

#### Manage Events (`/admin/events`)
- Create, edit, delete events
- Event configuration:
  - Basic info (title, description, date, location)
  - Submission period settings
  - Review deadlines
  - Notification dates
- Event customization:
  - Theme color
  - Banner image URL
  - Feature toggles (keynote, program, testimonials, photos, best paper)
  - Highlight statistics (JSON format)
- Event status management (upcoming, ongoing, past)
- Soft delete with hard delete option

#### Manage Submissions (`/admin/submissions`)
- View all paper submissions across all events
- Filter by:
  - Event
  - Status (all, draft, submitted, under review, accepted, rejected, revision requested)
- Submission details:
  - Title, authors, abstract, keywords
  - Submission date
  - PDF download link
- Status update functionality
- Assign reviewers to submissions

#### Manage Users (`/admin/users`)
- View all registered users
- User information:
  - Name, email, affiliation
  - Registration date
  - Email verification status
  - Active status
- Role management:
  - Assign/remove admin role
  - Assign/remove reviewer role
  - Multiple roles per user supported
- User search and filtering

#### Manage Past Events (`/admin/past-events`)
- Select past event from dropdown
- Three management tabs:

**Photos Tab:**
- Add event photos with:
  - Photo URL
  - Caption
  - Highlight flag (featured photos)
  - Display order
- Edit/delete existing photos
- Visual grid display

**Speakers Tab:**
- Add keynote speakers with:
  - Name, title, affiliation
  - Biography
  - Photo URL
  - Presentation title
  - Display order
- Edit/delete speaker profiles

**Testimonials Tab:**
- Add participant testimonials with:
  - Author name and affiliation
  - Testimonial text
  - Featured flag
- Edit/delete testimonials

## User Roles & Permissions

### User (Default)
- View public pages
- Submit papers
- View and edit own submissions
- Update profile

### Reviewer
- All User permissions
- Access reviewer dashboard
- Review assigned papers
- Submit review scores and recommendations

### Admin
- All User and Reviewer permissions
- Manage events (CRUD)
- Manage all submissions
- Manage users and assign roles
- Manage past event content (photos, speakers, testimonials)
- View admin statistics

## Authentication & Security

- Email/password registration with email verification
- JWT-based authentication (7-day expiration)
- Password reset via email link
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected API routes with middleware
- File upload validation (type and size)

## Default Admin Account

For initial setup:
- Email: `admin@hanyang.ac.kr`
- Password: `Admin123!`
- Roles: user, admin, reviewer

**Important:** Change the default password immediately after first login.

## Deployment

See [terraform/README.md](terraform/README.md) for AWS deployment instructions.

## License

MIT
