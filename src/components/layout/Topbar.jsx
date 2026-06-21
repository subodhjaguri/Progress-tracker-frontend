import React, { useState } from "react";
import { Menu, Bell, ChevronDown, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { ChangePasswordModal } from "../../features/account/ChangePasswordModal.jsx";
import { SearchBox } from "./SearchBox.jsx";

export function Topbar({ onMenu }) {
  const { profile, logout } = useAuth();
  const { announce } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  if (!profile) return null;

  const handleLogout = () => {
    setMenuOpen(false);
    logout(); // clears the token; the auth gate redirects to /login
  };

  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu}>
        <Menu size={23} />
      </button>
      <SearchBox />
      <div className="topbar-actions">
        <button className="icon-button notification">
          <Bell size={20} />
          <i />
        </button>
        <div className="user-menu">
          <button className="current-user" onClick={() => setMenuOpen((v) => !v)}>
            <div className="avatar small">{profile.initials}</div>
            <span>
              <small>{profile.roleLabel}</small>
              <strong>{profile.name}</strong>
            </span>
            <ChevronDown size={16} />
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-head">
                <div className="avatar">{profile.initials}</div>
                <div>
                  <strong>{profile.name}</strong>
                  <span>{profile.roleLabel}</span>
                </div>
              </div>
              <button
                className="user-dropdown-action subtle"
                onClick={() => {
                  setMenuOpen(false);
                  setShowChangePw(true);
                }}
              >
                <KeyRound size={16} />
                Change password
              </button>
              <button className="user-dropdown-action" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      {showChangePw && (
        <ChangePasswordModal
          onClose={() => setShowChangePw(false)}
          onDone={() => announce("Password updated")}
        />
      )}
    </header>
  );
}
