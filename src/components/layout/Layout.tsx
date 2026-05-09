import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { User, UserRole } from '@/src/types';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function Layout({ children, user }: LayoutProps) {
  // Use a default role for demo purposes if no user
  const effectiveRole = user?.role || UserRole.ADVISOR;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role={effectiveRole} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
