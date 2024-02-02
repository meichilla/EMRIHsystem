'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './logo';
import MobileMenu from './mobile-menu';
import { useAuth } from '@/app/(auth)/AuthContext';

const Header = () => {
  const [top, setTop] = useState<boolean>(true);
  const { isLoggedIn, logout } = useAuth();

  // Detect whether the user has scrolled the page down by 10px
  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  useEffect(() => {
    scrollHandler();
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // Handle logout functionality
  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
  };

  return (
    <div>
    {!isLoggedIn ? (
    <header className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${!top ? 'bg-white backdrop-blur-sm shadow-lg' : ''}`}>
      <div className="max-w-8xl mx-auto px-5 sm:px-6 mt-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="shrink-0 mr-4">
            <Logo />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            {/* Desktop sign-in links */}
            <ul className="flex grow justify-end flex-wrap items-center">
              {/* Check if the user is on the homepage */}
              {isLoggedIn ? (
                // If user is logged in, show logout link
                <li>
                    <Link href="/" className="btn-sm text-gray-200 bg-gray-900 hover:bg-gray-800 ml-3">
                        <span>Logout</span>
                        <svg onClick={handleLogout} className="w-3 h-3 fill-current text-gray-400 shrink-0 ml-2 -mr-1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z" fillRule="nonzero" />
                        </svg>
                    </Link>
                </li>
              ) : (
                // Add your login links if needed
                <>
                </>
              )}
            </ul>
          </nav>

          <MobileMenu isLoggedIn={isLoggedIn} />

        </div>
      </div>
    </header>
    ): (
      <>
      </>
    )}
    </div>
  );
};

export default Header;
