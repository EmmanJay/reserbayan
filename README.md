# ReserBayan

[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Java](https://img.shields.io/badge/Java-21-informational)]()
[![Node.js](https://img.shields.io/badge/Node.js-20-green)]()

**ReserBayan** is an online Barangay Document Request System for Filipino residents. It streamlines document requests, tracking, and management via a digital platform.

---

## 🚀 Features

- Resident & Admin authentication
- Browse 25+ barangay document types
- Document detail pages with requirements & processing times
- Real-time request tracking (backend support)
- Responsive, mobile-first design with animations
- Admin dashboard for request management

---

## 🏗️ Tech Stack

**Frontend:** Next.js 15 + React 19, Tailwind CSS v4, ShadCN UI, Framer Motion  
**Backend:** Spring Boot 3.5.7, Spring Data JPA, MySQL  
**Database:** MySQL 8+ (local: `localhost:3306/reserbayan`)

---

## 📂 Project Structure

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

## ⚡ Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run Project

# Full stack

```bash
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
