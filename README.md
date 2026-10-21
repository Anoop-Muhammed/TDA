# TDA Engineering Studio

High-Performance PrestaShop Modules & Bespoke E-Commerce Development.

## Showcase Overview

This repository contains the interactive showcase website for **TDA Engineering Studio**, featuring:
- **PerfectSearch™**: Standalone instant live AJAX search module for PrestaShop (<50ms latency, flat MySQL FULLTEXT indexing, soundex typo tolerance, 0 €/mo external SaaS fees).
- **FestiveFlow™**: Seasonal marketing & holiday atmosphere suite for PrestaShop (60-144 FPS HTML5 canvas particle physics, interactive coupon gift box, zero checkout disruption).
- **Bespoke Engineering Services**: PrestaShop 1.7–9.x migrations, custom module development, WooCommerce, Laravel web applications, and Core Web Vitals optimization.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Design system extracted from editorial specs), Vanilla JavaScript SPA router
- **Design Tokens**: `#FEF3E2` (Cream), `#891818` (Garnet Wine), `#1C150C` (Ink), `#FAB12F` (Sun Gold)
- **Typography**: Bricolage Grotesque, Hanken Grotesk, DM Mono
- **Backend & Tooling**: Node.js, Vite, Nodemailer

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
git clone https://github.com/Anoop-Muhammed/TDA.git
cd TDA
npm install
```

### Environment Configuration

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
SMTP_USER=tdawebservices@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Running Locally

To start the Vite development server:
```bash
npm run dev
```

To build the production bundle:
```bash
npm run build
```

To run the standalone production Node server:
```bash
node server.js
```

## License

Proprietary — All rights reserved © TDA Engineering Studio.
