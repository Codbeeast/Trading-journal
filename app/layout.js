// app/layout.js
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import Sidebar from '@/components/Slidebar';

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <html lang="en">
     

      <body className={`${inter.className} m-0 p-0 `} cz-shortcut-listen="true">
          <div className="flex min-h-screen bg-slate-900 transition-all duration-300 ease-in-out">
            <Sidebar onToggle={handleSidebarToggle} />
            <div
              className={`transition-all duration-300 ease-in-out flex-1 ${
                sidebarCollapsed ? 'ml-24' : 'ml-80'
              }`}
            >
              <main className="p-6">
                {children}
              </main>
            </div>
          </div>
      </body>
    </html>
  );
}
