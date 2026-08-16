import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import logo from '../logo.png';

const TopHeader = ({ user, onLogout, onToggleSidebar }) => {
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}` || '?';
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account';

  return (
    <header
      className="w-full h-[64px] flex items-center justify-between px-6 sticky top-0 z-30 border-b border-[#E5E7EB] backdrop-blur-sm bg-slate-50/85"
    >
      {/* Left: Logo Section */}
      <div className="flex items-center gap-[10px]">
        {/* Only route to the nav on small screens, where the sidebar is off-canvas. */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
           <img src={logo} alt="Spendora logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-[20px] font-bold text-[#2563EB] tracking-tight">
          Spendora
        </span>
      </div>

      {/* Right: User Cluster */}
      <div className="flex items-center">
        <button type="button" className="flex items-center cursor-pointer" onClick={onLogout}>
            <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[12px] font-bold mr-[10px] shrink-0 uppercase">
              {initials}
            </div>

            <div className="flex flex-col justify-center mr-[8px] text-left">
              <span className="text-[#111827] text-[14px] font-semibold leading-tight">
                 {displayName}
              </span>
              <span className="text-[#6B7280] text-[12px] font-normal leading-tight max-w-[150px] truncate">
                 {user?.email || ''}
              </span>
            </div>

            <ChevronDown size={16} className="text-[#6B7280]" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
