# ReserBayan

**ReserBayan** is a digital Barangay Document Request System designed for Filipino residents. It simplifies the process of requesting, tracking, and managing barangay documents by replacing traditional in-person visits with a secure, user-friendly online platform. With ReserBayan, residents can easily browse available documents, submit requests, and monitor their status—all in one seamless digital experience.

---

## Features

- Resident & Admin authentication
- Browse 25+ barangay document types
- Document detail pages with requirements & processing times
- Real-time request tracking (backend support)
- Responsive, mobile-first design with animations
- Admin dashboard for request management

---

## Tech Stack

**Frontend:** Next.js 15 + React 19, Tailwind CSS v4, ShadCN UI, Framer Motion  
**Backend:** Spring Boot 3.5.7, Spring Data JPA, MySQL  
**Database:** MySQL 8+ (local: `localhost:3306/reserbayan`)

---

## Project Structure

```bash
/frontend # Next.js app
/backend # Spring Boot API

src/
├─ app/ # Pages & layouts
├─ components/ # Reusable UI components
├─ lib/ # Utilities & static data
└─ public/ # Logo & document images
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run Project

```bash
# Full stack
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

```

---

## Database Setup

```bash
CREATE DATABASE reserbayan;
```

Update backend/src/main/resources/application.properties with your database credentials. Tables are auto-created via JPA.
