# NMIT Student Marketplace

An official peer-to-peer campus marketplace designed exclusively for students at **Nitte Meenakshi Institute of Technology (NMIT), Bangalore**. Built with a human-crafted aesthetic, a full-stack Express backend, persistent JSON database, robust authentication, and external API integrations.

---

## 📋 Compliance & Implementation Matrix (All 22 Requirements)

| No. | Official Requirement | Implementation Details | Status |
| --- | -------------------- | ---------------------- | ------ |
| **1** | **Create an account and log in** | Full student registration (`name`, `@nmit.ac.in` email, USN, branch, phone, hostel, password) and login system via `POST /api/auth/register` and `POST /api/auth/login`. Passwords hashed with SHA-256; Bearer token sessions saved in client storage. Includes 1-click demo student switcher (Arjun Kumar, Sneha Rao, Rohit Verma) for instant evaluation. | ✅ Complete |
| **2** | **Create a listing with an item name** | Modal & form with dedicated Item Title / Name input with length and character validation. | ✅ Complete |
| **3** | **Add a description** | Detailed multi-line item description textarea for specifying condition, branch utility, semester notes, and reasons for selling. | ✅ Complete |
| **4** | **Set an item price** | Price input in ₹ (INR), along with an optional original retail price (MRP) to compute student savings. Validated between ₹1 and ₹200,000. | ✅ Complete |
| **5** | **Select a category** | Dedicated category selector covering: *Textbooks & Notes*, *Tech & Electronics*, *Hostel & Living*, *Cycles & Mobility*, *Lab Uniform & Drafters*, *Snacks & Beverages*, and *Sports & Fitness*. | ✅ Complete |
| **6** | **Upload an item image** | Triple image option: direct file upload with live preview (converted via `FileReader` data URL), external image URL input, or pre-curated student photo presets (Textbooks, Drafters, Calculators, Cycles). | ✅ Complete |
| **7** | **Browse listings posted by students** | Interactive marketplace feed displaying listings posted by fellow students with seller name, USN, campus location, price, condition, views, and timestamp. | ✅ Complete |
| **8** | **Search and filter listings** | Real-time text search (title, author, description, seller, USN), category pill filters, status toggle (*All*, *Available*, *Sold*), condition filter (*Like New*, *Good*, *Fair*), price range slider/inputs (Min–Max), and sorting (*Newest*, *Price: Low to High*, *Price: High to Low*). | ✅ Complete |
| **9** | **View listing details** | Modal view showing high-resolution image, title, pricing, discount calculation, full description, campus pickup spot, views counter, and seller verification card with direct WhatsApp contact and phone call buttons. | ✅ Complete |
| **10** | **Edit or delete your own listings** | Dedicated **Edit** (pre-populated form) and **Delete** (with confirmation dialog) actions available on listing cards, details modal, and the **My Listings** dashboard. Server enforces strict ownership validation (`403 Forbidden` if a student attempts to edit or delete someone else's item). | ✅ Complete |
| **11** | **Mark your own listing as sold** | 1-click **Mark as Sold** / **Reactivate** toggle button for item owners. Invokes `PATCH /api/listings/:id/status` to immediately sync the database and UI. | ✅ Complete |
| **12** | **View and manage your listings** | Dedicated **My Listings** dashboard tab featuring seller profile summary, metric counters (*Total Listed*, *Active Items*, *Sold to Students*, *Realized Revenue in ₹*), filter tabs, and direct listing management controls. | ✅ Complete |
| **13** | **Backend implementation** | Full Express 5 server in `server.ts` running on port 3000, serving RESTful endpoints for authentication, listings CRUD, status toggling, and external API proxying. | ✅ Complete |
| **14** | **Persistent database** | File-backed JSON database in `data/marketplace-db.json` with atomic disk writes, pre-seeded with realistic NMIT student profiles and campus items that persist across server restarts. | ✅ Complete |
| **15** | **Appropriate APIs** | RESTful API suite (`/api/auth/*`, `/api/listings/*`, `/api/external/*`) with structured error handling, JSON responses, and HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`). | ✅ Complete |
| **16** | **Authentication and authorization** | `requireAuth` server middleware verifying session Bearer tokens, password hashing, and server-side ownership enforcement preventing non-owners from editing or deleting items. | ✅ Complete |
| **17** | **External API integration** | **1. India Post Postal PIN Code Verification API:** Queries `https://api.postalpincode.in/pincode/560064` to verify campus postal jurisdiction (Yelahanka / NMIT).<br>**2. Open Library Book Search API:** In the listing creation modal, students can search textbooks by title or author (`https://openlibrary.org/search.json`), and auto-fill the listing title, description, and official book cover with 1 click! | ✅ Complete |
| **18** | **Clearly distinguish sold items** | Sold items feature a prominent `SOLD` badge overlay, grayscaled image, filter tabs to separate active from sold items, and disabled contact buttons with an explanatory note. | ✅ Complete |
| **19** | **Changes reflected across the application** | Any listing creation, edit, status change to sold, or deletion immediately reflects across the main feed, "My Listings" tab, filter counts, and database file. | ✅ Complete |
| **20** | **Loading, empty, and error states** | Shimmer/skeleton loading cards during API requests, descriptive empty states with action buttons when zero results match, and actionable error banners with retry buttons. | ✅ Complete |
| **21** | **Input validation** | Real-time client-side error messages under fields and server-side validation rejecting invalid titles (< 3 chars), descriptions (< 10 chars), invalid prices, or mismatched emails/USNs. | ✅ Complete |
| **22** | **Protect restricted actions** | Unauthenticated visitors attempting to post or manage listings are prompted with the login dialog. Server strictly rejects unauthenticated or unauthorized write requests (`401` / `403`). | ✅ Complete |

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18 or higher
* npm

### Running the Full-Stack Application
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the full-stack server (runs Express API + Vite dev server on port 3000):
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. Type-check / Lint:
   ```bash
   npm run lint
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🧪 Testing the 22 Requirements (Quick Walkthrough)

1. **Test Authentication (Req 1 & 16):**
   - Click the **Quick Test** buttons in the top black notification bar to switch between **Arjun (CSE)**, **Sneha (ECE)**, and **Rohit (Mech)** with 1 click.
   - Or click **Log In** to test custom login or register a brand-new student account.

2. **Test Listing Creation with External Book Lookup (Req 2, 3, 4, 5, 6, 17, 21):**
   - Click **+ Post Listing**.
   - Under the gold banner, click **Auto-Fill from Open Library API** and search for `"Calculus"` or `"Tanenbaum"`. Click any result to see the title, description, and cover auto-populate!
   - Try submitting with empty fields to observe input validation errors.

3. **Test Search & Filtering (Req 7, 8, 18):**
   - In the search bar, type `"Casio"` or `"Bicycle"` to test real-time search.
   - Click category pills (e.g. *Textbooks*, *Cycles*, *Lab Uniform*).
   - Toggle between **All**, **Available**, and **Sold Items** to see the clear distinction for sold items.

4. **Test "My Listings" & Ownership Protection (Req 10, 11, 12, 19, 22):**
   - Click **My Listings** in the top navigation bar.
   - Check the summary metric cards (*Total Listed*, *Active Items*, *Sold to Students*, *Realized Revenue*).
   - Click **Mark as Sold** on any active listing to observe the instant status toggle.
   - Click **Edit** to update price or description, or **Delete** to remove it.
   - Switch to another student account (e.g. Sneha) and notice that you cannot edit or delete Arjun's listings.
