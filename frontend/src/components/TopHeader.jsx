import React from 'react';
import { Moon, ChevronDown } from 'lucide-react';
import logo from '../logo.png';

const TopHeader = ({ user, sidebarOpen, setSidebarOpen, onLogout }) => {
  return (
    <header 
      className="w-full h-[64px] flex items-center justify-between px-6 sticky top-0 z-30 border-b border-[#E5E7EB] backdrop-blur-sm"
      style={{ 
        backgroundColor: 'rgba(248, 250, 252, 0.85)',
      }}
    >
      {/* Left: Logo Section */}
      <div className="flex items-center gap-[10px]">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
           <img src={logo} alt="Spendora Logo" className="w-full h-full object-contain" />
        </div>
        
        {/* Wordmark */}
        <span className="text-[20px] font-bold text-[#2563EB] tracking-tight">
          Spendora
        </span>
      </div>

      {/* Right: User Cluster */}
      <div className="flex items-center">
        
        {/* Theme Toggle (Moon) */}
        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] transition-colors mr-[14px]">
          <Moon size={18} />
        </button>

        {/* Separator / Group */}
        <div className="flex items-center cursor-pointer group" onClick={onLogout}>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[12px] font-bold mr-[10px] shrink-0">
              {user?.firstName?.charAt(0) || 'D'}{user?.lastName?.charAt(0) || 'P'}
            </div>

            {/* User Info Stack */}
            <div className="flex flex-col justify-center mr-[8px]">
              <span className="text-[#111827] text-[14px] font-semibold leading-tight">
                 {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Devesh Patel'}
              </span>
              <span className="text-[#6B7280] text-[12px] font-normal leading-tight max-w-[150px] truncate">
                 {user?.email || 'deveshpatel6870@gmail.com'}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDown size={16} className="text-[#6B7280]" />
        </div>

      </div>
    </header>
  );
};

export default TopHeader;
