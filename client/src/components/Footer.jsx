import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold mb-2">
              <span>📚</span>
              LibraryHub
            </div>
            <p className="text-primary-200/75 text-sm">
              Modern library management for a digital world
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-200/75">
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-primary-200/75">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-primary-200/75 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary-200/75 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-primary-200/75 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-primary-200/75 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-700/60 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-200/70 text-sm">
            © 2024 LibraryHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-200/70 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
