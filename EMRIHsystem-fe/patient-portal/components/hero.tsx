import Link from 'next/link';
import LogoImage from '@/public/images/logo.png';

const Hero = () => {
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

      <div className="text-right pr-8 pt-4 text-gray-600">
          Are you a doctor ? <Link href="/signindoctor" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign in</Link>
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
            <div className="ml-2">dApp|</div>
            <div className="left-0 mt-1 text-sm text-blue-500">Patient Portal</div>
          </div>
        </Link>

        {/* Hero content */}
        <div className="mt-8 md:pt-16 md:pb-3">
          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-16" data-aos="zoom-y-out">Electronic<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"> Medical Record</span></h1>
            <div className="max-w-3xl mx-auto mt-24">
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <a className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0" href="/signin">Login Patient</a>
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
        <div className="text-gray-600 text-center mt-32">
          Don't you have an account? <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign up </Link>
          | Want to <Link href="//localhost:3001/signin" className="text-blue-600 hover:underline transition duration-150 ease-in-out">make an appointment ?</Link>
        </div>
      </div>
    </section>
  )
}

export default Hero