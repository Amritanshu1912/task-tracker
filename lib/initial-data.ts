// lib/initial-data.ts
import type { RawTaskData } from "./types"; // Import the type

export const initialTasksData: RawTaskData[] = [
  {
    title: "Public (Consumer) Endpoints & Frontend Features",
    notes: "This section details the functionalities accessible to general users, covering product browsing, cart management, and order viewing.",
    labels: [],
    subtasks: [
      {
        title: "Core Navigation & UI Polish",
        notes: "Modern navigation with smooth animations",
        labels: ["Frontend", "Design"],
        subtasks: [
          {
            title: "Navbar Category Dropdown",
            notes: "Implemented using useCategories hook.",
            completed: true,
            labels: ["Frontend", "Backend"],
          },
          {
            title: "Navbar Search Bar",
            notes: "Real-time search with debouncing",
            labels: ["Frontend"],
            subtasks: [
              {
                title: "Create SearchBar.tsx component",
                notes: "",
                labels: ["Frontend"],
              },
              {
                title: "Integrate into Navbar",
                notes: "",
                labels: ["Frontend"],
              },
              {
                title: "Update URL query for Product Listing Page (PLP) on input",
                notes: "URL state management",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "User Menu (Navbar)",
            notes: "Enhanced user experience",
            labels: ["Frontend"],
            subtasks: [
              {
                title: "Improve hover/click dropdown for authenticated users",
                notes: "Smooth animations",
              },
              {
                title: "Add links for Profile, Orders, Wishlist, and Sign Out",
                notes: "Complete user navigation",
              },
            ],
          },
        ],
      },
      {
        title: "Product Management (Public Read)",
        notes: "Customer-facing product features",
        labels: ["Frontend", "Backend"],
        subtasks: [
          {
            title: "Product Listing Page (/products)",
            notes: "Connect to backend GET /api/products.",
            labels: ["Fullstack"],
            subtasks: [
              {
                title: "Backend GET /api/products is Implemented.",
                completed: true,
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend is styled, uses dummy data, and is ready for API integration.",
                labels: ["Frontend"],
              },
              {
                title: "Category Filter Component",
                notes: "Advanced filtering",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Sidebar filter powered by useCategories." },
                  { title: "Update URL on selection." },
                ],
              },
              {
                title: "Sorting Dropdown",
                notes: "Multiple sort options",
                labels: ["Frontend"],
                subtasks: [
                  {
                    title: "Dropdown for sort by: price, popularity, new.",
                  },
                  { title: "Triggers URL update & data re-fetch." },
                ],
              },
              {
                title: "Pagination Controls",
                notes: "",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Enable navigation via buttons." },
                  {
                    title: "Update URL and re-fetch based on page number.",
                  },
                ],
              },
              {
                title: "Final polish on responsiveness and UI styling.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Product Detail Page (/products/[slug])",
            notes: "Connect to backend GET /api/products/:slug.",
            labels: ["Full Stack"],
            subtasks: [
              {
                title: "Backend GET /api/products/:slug is Implemented.",
                completed: true,
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend is styled, uses dummy data, and is ready for API integration.",
                labels: ["Frontend"],
              },
              {
                title: "Image Gallery",
                notes: "",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Main image + thumbnails." },
                  { title: "Click-to-change, optional arrows or zoom." },
                ],
              },
              {
                title: "Variant Selectors",
                notes: "",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Dropdowns/buttons to pick size, color, etc.." },
                  { title: "Update price, image, stock availability." },
                ],
              },
              {
                title: "UI Polish for overall product display.",
                labels: ["Frontend"],
              },
            ],
          },
        ],
      },
      {
        title: "Category Management (Public Read)",
        notes: "",
        subtasks: [
          {
            title:
              "List all categories: Backend GET /api/categories is Implemented.",
            completed: true,
            labels: ["Backend"],
          },
          {
            title:
              "Frontend (via useCategories hook) is set up for category access.",
            completed: true,
            labels: ["Frontend"],
          },
          {
            title:
              "Retrieve category details by slug: Backend GET /api/categories/:slug is Implemented.",
            completed: true,
            labels: ["Backend"],
          },
        ],
      },
      {
        title: "Cart APIs (User)",
        notes: "",
        subtasks: [
          {
            title: "View Cart",
            notes: "",
            subtasks: [
              {
                title: "Backend GET /api/cart is Implemented.",
                completed: true,
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /cart page created, fetches data from backend via proxy, displays items and summary.",
                labels: ["Frontend"],
              },
              { title: "UI polish.", labels: ["Frontend"] },
            ],
          },
          {
            title: "Add Item",
            notes:
              "Backend Service stubbed, needs full logic & controller/route for POST /api/cart/items.",
            labels: ["Backend"],
          },
          {
            title: "Update Item",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend Service stubbed, needs full logic & controller/route for PUT /api/cart/items/:cartItemId.",
                labels: ["Backend"],
              },
              {
                title:
                  'Frontend "Update Quantity" button needs connection to this API.',
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Remove Item",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend Service stubbed, needs full logic & controller/route for DELETE /api/cart/items/:cartItemId.",
                labels: ["Backend"],
              },
              {
                title:
                  'Frontend "Remove Item" button needs connection to this API.',
                labels: ["Frontend"],
              },
            ],
          },
        ],
      },
      {
        title: "Order APIs (User – Read Only for Phase 2)",
        notes: "",
        subtasks: [
          {
            title: "List user orders",
            notes: "",
            subtasks: [
              {
                title: "Backend GET /api/orders is Implemented.",
                completed: true,
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /orders page created, fetches data from backend via proxy, displays order list.",
                labels: ["Frontend"],
              },
              { title: "Polish UI.", labels: ["Frontend"] },
              { title: "Add pagination to order history." },
              { title: "Later: add sorting if necessary." },
            ],
          },
          {
            title: "Get user order details",
            notes: "",
            subtasks: [
              {
                title: "Backend GET /api/orders/:orderId is Implemented.",
                completed: true,
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /orders/[orderId] page created, fetches data from backend via proxy, displays order details.",
                labels: ["Frontend"],
              },
              { title: "Polish UI.", labels: ["Frontend"] },
            ],
          },
          {
            title: "Create order",
            notes:
              "Deferred to Phase 3 due to payment integration (POST /api/orders).",
            labels: ["Deferred"],
          },
        ],
      },
      {
        title: "Landing Page (index.tsx)",
        notes: "",
        labels: ["Frontend"],
        subtasks: [
          { title: "Uses data from useCategories for category section." },
          {
            title:
              "Uses local product fetch (or later useProducts) for featured products.",
          },
          { title: "Finalize styling and layout for all sections." },
        ],
      },
      {
        title: "Checkout Page (/checkout)",
        notes: "",
        labels: ["Frontend"],
        subtasks: [
          { title: "Placeholder page structure needed." },
          {
            title:
              "Build static layout with sections: Address, Shipping, Payment, Order Summary.",
          },
          { title: "Use placeholders for now, backend logic to follow." },
        ],
      },
      {
        title: "Frontend to REAL Backend READ APIs Connection",
        notes: "",
        labels: ["Full Stack"],
        subtasks: [
          { title: "Refactor useCategories to fetch from live backend." },
          {
            title:
              "Create useProducts (list) and useProductDetail (detail) hooks to call your backend.",
          },
          {
            title:
              "Use frontend proxy API routes to call backend securely.",
          },
        ],
      },
    ],
  }, {
    title: "Admin Endpoints & Frontend Features",
    notes: "This section covers the functionalities for managing products, categories, and orders by administrators.",
    labels: [],
    subtasks: [
      {
        title: "Foundation",
        notes: "",
        completed: true,
        labels: ["Full Stack"],
        subtasks: [
          {
            title:
              "/admin (or /admin/index.tsx): Basic structure with AdminLayout and client-side role protection implemented.",
            completed: true,
          },
          { title: "Displays placeholder/dummy stats.", completed: true },
          {
            title:
              "Authentication Middleware: Secure admin endpoints Implemented.",
            completed: true,
            labels: ["Backend"],
          },
        ],
      },
      {
        title: "Product Management APIs",
        notes: "",
        subtasks: [
          {
            title: "List all products",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend GET /api/admin/products — including disabled (to be implemented).",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/products — Manage products: list page, Add/Edit/Delete links.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Create new product",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend POST /api/admin/products (Service function: Create).",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/products/create — Form for products.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Update existing product",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend PUT /api/admin/products/:id — including handling variants, categories via ProductCategory (Service function: Update).",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/products/edit/[id] — Form for products.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Delete product",
            notes:
              "Backend DELETE /api/admin/products/:id — soft delete using deletedAt or hard delete based on choice (Service function: Delete).",
            labels: ["Backend"],
          },
          {
            title: "Toggle isEnabled (Service function to implement).",
            labels: ["Backend"],
          },
        ],
      },
      {
        title: "Category Management APIs",
        notes: "",
        subtasks: [
          {
            title: "List all categories",
            notes: "",
            subtasks: [
              {
                title: "Backend GET /api/admin/categories.",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/categories — List page created, fetches data via proxy, delete functionality placeholder.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Create new category",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend POST /api/admin/categories (Service function: Create).",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/categories/create — Form page created using CategoryForm component, calls proxies for create.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Update existing category",
            notes: "",
            subtasks: [
              {
                title:
                  "Backend PUT /api/admin/categories/:id (Service function: Update).",
                labels: ["Backend"],
              },
              {
                title:
                  "Frontend /admin/categories/edit/[id] — Form page created using CategoryForm component, calls proxies for update.",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Delete category",
            notes:
              "Backend DELETE /api/admin/categories/:id — soft delete or hard delete (Service function: Delete).",
            labels: ["Backend"],
          },
        ],
      },
      {
        title: "Order Management APIs",
        notes: "",
        subtasks: [
          {
            title: "Backend GET /api/admin/orders — list page placeholder.",
            labels: ["Backend"],
          },
        ],
      },
    ],
  },
]
