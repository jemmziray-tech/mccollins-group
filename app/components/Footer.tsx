import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  const WHATSAPP_NUMBER = "255743924467";

  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-4">McCollins Group</h3>
          <p className="text-gray-400">Quality products across Fashion, Food, and Education.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <p className="text-gray-400 mb-2">Tanzania</p>
          <p className="text-gray-400 mb-2">Phone: +255 743 924 467</p>
          <p className="text-gray-400">Email: info@mccollinsgroup.com</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 flex items-center transition-colors">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </a>
            </li>
            <li><a href="#categories" className="text-gray-400 hover:text-white transition-colors">Our Brands</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} McCollins Group. All rights reserved.
      </div>
    </footer>
  );
}