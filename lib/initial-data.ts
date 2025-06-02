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
                notes: "Reusable search component",
                labels: ["Frontend"],
              },
              {
                title: "Integrate into Navbar",
                notes: "Seamless integration",
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
                title: "Backend GET /api/products is Implemented",
                completed: true,
                labels: ["Backend"],
              },
              {
                title: "Frontend is styled, uses dummy data, and is ready for API integration",
                labels: ["Frontend"],
              },
              {
                title: "Category Filter Component",
                notes: "Advanced filtering",
                labels: ["Frontend"],
                subtasks: [{ title: "Sidebar filter powered by useCategories" }, { title: "Update URL on selection" }],
              },
              {
                title: "Sorting Dropdown",
                notes: "Multiple sort options",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Dropdown for sort by: price, popularity, new" },
                  { title: "Triggers URL update & data re-fetch" },
                ],
              },
              {
                title: "Pagination Controls",
                notes: "Smooth navigation",
                labels: ["Frontend"],
                subtasks: [
                  { title: "Enable navigation via buttons" },
                  { title: "Update URL and re-fetch based on page number" },
                ],
              },
              {
                title: "Final polish on responsiveness and UI styling",
                labels: ["Frontend", "Design"],
              },
            ],
          },
        ],
      },
    ]
  }, {
    title: "Admin Endpoints & Frontend Features",
    notes: "This section covers the functionalities for managing products, categories, and orders by administrators.",
    labels: [],
    subtasks: [
      {
        title: "Foundation",
        notes: "Core admin infrastructure",
        completed: true,
        labels: ["Fullstack"],
        subtasks: [
          {
            title:
              "/admin (or /admin/index.tsx): Basic structure with AdminLayout and client-side role protection implemented",
            completed: true,
          },
          {
            title: "Displays placeholder/dummy stats",
            completed: true,
          },
          {
            title: "Authentication Middleware: Secure admin endpoints Implemented",
            completed: true,
            labels: ["Backend"],
          },
        ],
      },
      {
        title: "Product Management APIs",
        notes: "Complete product CRUD operations",
        labels: ["Backend", "Frontend"],
        subtasks: [
          {
            title: "List all products",
            notes: "Admin product overview",
            subtasks: [
              {
                title: "Backend GET /api/admin/products — including disabled (to be implemented)",
                labels: ["Backend"],
              },
              {
                title: "Frontend /admin/products — Manage products: list page, Add/Edit/Delete links",
                labels: ["Frontend"],
              },
            ],
          },
          {
            title: "Create new product",
            notes: "Product creation workflow",
            subtasks: [
              {
                title: "Backend POST /api/admin/products (Service function: Create)",
                labels: ["Backend"],
              },
              {
                title: "Frontend /admin/products/create — Form for products",
                labels: ["Frontend"],
              },
            ],
          },
        ],
      },
    ],
  }
]