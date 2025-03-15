import React from "react";
import { Zap, Twitter, Linkedin, Github, Facebook } from "lucide-react";

export function Footer({ logoText, description, sections }) {
  return (
    <footer className="w-full border-t border-purple-100 bg-white py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                {logoText}
              </span>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
              <nav className="flex flex-col gap-2">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-purple-100 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {logoText}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}