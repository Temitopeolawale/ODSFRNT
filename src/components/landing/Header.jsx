import React from "react";
import { Zap } from "lucide-react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export function Header({ navItems, logoText }) {
    const navigate = useNavigate();

    const handleGetStartedClick = () => {
      navigate("/signup");
    };
    
  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-purple-600" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            {logoText}
          </span>
        </div>
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors hidden sm:block"
          >
            Sign In
          </a>
          <Button
           onClick={handleGetStartedClick}
           className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}