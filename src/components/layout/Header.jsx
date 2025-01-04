import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';

function Header({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
      >
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired
};

export default Header;

