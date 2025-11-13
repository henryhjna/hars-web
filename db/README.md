# Database

PostgreSQL database schema for HARS platform.

## Schema Overview

### Core Tables
- **users**: User accounts with role-based access (user, admin, reviewer)
- **events**: Symposium events with customization options
- **event_sessions**: Program schedule for events
- **keynote_speakers**: Featured speakers information
- **submissions**: Paper submissions
- **reviews**: Peer reviews for submissions
- **review_assignments**: Reviewer assignments
- **event_photos**: Event photo gallery
- **event_testimonials**: Participant testimonials
- **activity_logs**: Audit trail

## Default Admin Account

For development purposes, a default admin account is created:

- **Email**: admin@hanyanghars.com
- **Password**: Admin123!
- **Roles**: user, admin, reviewer

**IMPORTANT**: Change this password in production!

## Running Migrations

The database will be automatically initialized when you run docker-compose:

```bash
docker-compose up -d
```

## Manual Database Access

```bash
# Connect to PostgreSQL container
docker exec -it hars-db psql -U postgres -d hars_db

# Run SQL file manually
docker exec -i hars-db psql -U postgres -d hars_db < db/init.sql
```

## Backup

```bash
# Backup database
docker exec hars-db pg_dump -U postgres hars_db > backup.sql

# Restore database
docker exec -i hars-db psql -U postgres hars_db < backup.sql
```
