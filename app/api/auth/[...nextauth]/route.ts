// app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/lib/auth"; // Import handler dari file konfigurasi

export const { GET, POST } = handlers; 