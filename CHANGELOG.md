# Changelog

All notable changes to ORSYS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] — 2026-03-18

### Added
- Complete rewrite with React 18 + Vite 5
- Firebase Authentication with role-based access control
- Firestore database with offline persistence (PWA)
- Denomination input component with +/− controls and live total
- Dashboard with stats cards and denomination bar chart
- Voucher list with search and status filter
- Reports page with date-range filtering and Excel export
- Public receipt verification page (`/verify/:slipNo`)
- Admin panel — user management and payment heads
- Firebase Hosting deployment with single-command deploy
- TypeScript throughout
- Tailwind CSS styling
- TanStack Query for server state management
- Zustand for auth state with persistence
- React Hook Form + Zod validation

### Changed
- Replaced vanilla JS with React component architecture
- Replaced Bootstrap with Tailwind CSS
- Replaced DataTables with custom paginated table
- Denomination fields moved from flat fields to structured array

### Removed
- Express backend dependency (now pure Firebase)
- PostgreSQL / Prisma (replaced by Firestore)
- Server-side Excel generation (now client-side via SheetJS)

---

## [2.0.0] — 2025-01-01

### Added
- Major UI overhaul
- PWA features with service worker
- Enhanced reporting with date range filters
- WhatsApp sharing — convert receipt to image
- Improved mobile responsiveness

---

## [1.5.0] — 2024-06-01

### Added
- WhatsApp sharing capability
- Mobile responsiveness improvements

---

## [1.0.0] — 2024-01-01

### Added
- Initial release
- Basic voucher management
- Firebase Firestore integration
- Email-based authentication
- Receipt printing
