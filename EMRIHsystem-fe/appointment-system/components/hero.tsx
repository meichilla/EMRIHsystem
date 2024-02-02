import { useAuth } from '@/app/(auth)/AuthContext';
import Link from 'next/link';
import LogoImage from '@/public/images/logo.png';

const Hero = () => {
  const { logout } = useAuth();
  logout();

  return (
    
    <section className="relative">
      {/* Illustration behind hero content */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1" aria-hidden="true">
        <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
              <stop stopColor="#FFF" offset="0%" />
              <stop stopColor="#EAEAEA" offset="77.402%" />
              <stop stopColor="#DFDFDF" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="url(#illustration-01)" fillRule="evenodd">
            <circle cx="1232" cy="128" r="128" />
            <circle cx="155" cy="443" r="64" />
          </g>
        </svg>
      </div>

      <div className="text-right pr-8 pt-4">
        <button className="text-blue-900 hover:underline sm:w-auto sm:mb-0">
              <a href="/signup">
                <span>Register</span>
              </a>
            </button>
          <button className="ml-8 hover:underline sm:w-auto sm:mb-0">
            <a href="/signinadmin">
              <span>Admin</span>
            </a>
          </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

      <Link href="#" className="flex items-center justify-center mt-16" aria-label="Cruip">

          <div className="flex items-center">
            <img
              src={LogoImage.src}
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="ml-2">ezAppointment|</div>
            <div className="left-0 mt-1 text-sm text-blue-500">Hospital</div>
          </div>
        </Link>

        {/* Hero content */}
        <div className="pt-32 pb-5 md:pt-16 md:pb-3">
          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">A Destination for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">advanced care</span></h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-black-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">How is health today? Sounds like not good..
                  <br/>Don&apos;t worry. Find your doctor online Book as you wish with ezAppointment.
                  <br/>We offer you a free doctor channeling service, Make your appointment now.</p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <a className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0" href="/signin">Make an Appointment</a>
              </div>

              <div className="max-w-xs mx-auto mt-5 sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <a className="btn text-blue bg-gray-200 hover:bg-gray-100 w-full mb-4 sm:w-auto sm:mb-0" href="//localhost:3002">Patient Portal</a>
              </div>
            </div>
          </div>

          {/* Hero image */}
          {/* <ModalVideo
            thumb={VideoThumb}
            thumbWidth={768}
            thumbHeight={432}
            thumbAlt="Modal video thumbnail"
            video="/videos/video.mp4"
            videoWidth={1920}
            videoHeight={1080} /> */}

        </div>

      </div>
    </section>
  )
}

export default Hero