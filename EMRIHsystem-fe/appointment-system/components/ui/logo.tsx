import Link from 'next/link';
import Image from 'next/image';
import LogoImage from '@/public/images/logo.png';

export default function Logo() {
  return (
    <Link href="#" className="flex items-center justify-between" aria-label="Cruip">
      <div className="flex items-center">
        <Image
          src={LogoImage}
          alt="Logo"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <div className="ml-2">ezAppointment|</div>
      </div>
      <div className="text-sm text-blue-500">ABC Hospital</div>
      <rect width="32" height="32" rx="16" fill="url(#footer-logo)" fillRule="nonzero" />
    </Link>
  );
}
