// // import { redirect } from "next/navigation";
// import Image from "next/image";
// import landingPageBanner from "@/public/images/Landing_Page_Banner.svg";
// import landingPageBanner_2 from "@/public/images/Landing_Page_Banner_2.svg";

// import people from "@/public/images/people.svg";
// import people_icon from "@/public/images/people_icon.svg";

// import klokaLogo from "@/public/images/my_kloka_Logo.svg";
// import klokaLogoColor from "@/public/images/my_kloka_Logo_color.svg";
// import Link from "next/link";

// import { Button } from "@/components/ui/button";
// import { Header } from "@/components/dashboard/header";
// import { DialogOverlay } from "@/components/ui/dialog";

// export default function HomePage() {
//   return (
//     <div>
//       <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
//         {/* Logo + Nav */}
//         <div className="hidden md:flex items-center gap-12">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Image
//               src={klokaLogoColor}
//               alt="Kloka Logo"
//               width={150}
//               height={75}
//               className="object-contain"
//             />
//           </div>

//           {/* Navigation Links */}
//           <nav className="flex items-center gap-8 font-bold text-gray-800">
//             <Link
//               href="#features"
//               className="hover:text-[#FF6F00] transition-colors"
//             >
//               Features
//             </Link>
//             <Link
//               href="#resources"
//               className="hover:text-[#FF6F00] transition-colors"
//             >
//               Resources
//             </Link>
//             <Link
//               href="#about"
//               className="hover:text-[#FF6F00] transition-colors"
//             >
//               About
//             </Link>
//           </nav>
//         </div>

//         {/* Buttons */}
//         <div className="flex items-center gap-4">
//           <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">
//             Log in
//           </Button>
//           <Button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800">
//             Sign Up
//           </Button>
//         </div>
//       </header>
//       {/* <section>
//         <div>
//           <p>Simplify how your team works</p>
//           <p>
//             Kloka is a professional-grade platform built to make attendance
//             tracking and task management effortless for organizations of all
//             sizes
//           </p>
//           <Button className="bg-kr-orange hover:bg-kr-orange/90">
//             Get Started
//           </Button>
//         </div>
//         <div>
//           <Image
//             src={landingPageBanner}
//             alt="User avatar"
//             width={500}
//             height={300}
//           />
//         </div>
//       </section> */}
//       <section className="px-10 py-16">
//         <div className="flex items-center justify-between rounded-2xl bg-[#2A0C00] px-10 pt-16 pr-0">
//           {/* Text content */}
//           <div className="max-w-xl">
//             <p className="font-bold text-5xl leading-tight tracking-[-0.02em] text-[#fff]">
//               Simplify how your team works
//             </p>

//             <p className="mt-4 text-xl leading-8 text-[#FFE3DE]">
//               Kloka is a professional-grade platform built to make attendance
//               tracking and task management effortless for organizations of all
//               sizes
//             </p>

//             <div className="mt-6 flex gap-4">
//               <Button className=" bg-kr-orange hover:bg-kr-orange/90">
//                 Get Started
//               </Button>
//             </div>
//           </div>

//           {/* Image */}
//           <div className="w-1/2">
//             <Image
//               src={landingPageBanner}
//               alt="User avatar"
//               // width={500}
//               // height={300}
//               className="object-contain w-full h-auto"
//             />
//           </div>
//         </div>
//       </section>
//       {/* Features Section */}
//       <section className="px-16 bg-[#ebe9e9] py-10">
//         <div className="mb-8">
//           {/* Features heading */}
//           <p className="text-[#FF6F00] font-semibold text-base">Features</p>

//           {/* Alternating color heading */}
//           <p className="font-semibold text-4xl leading-tight">
//             <span className="text-black">Attendance?</span>{" "}
//             <span className="text-[#FF6F00]">Tracked,</span>{" "}
//             <span className="text-black">Tasks?</span>{" "}
//             <span className="text-[#FF6F00]">Handled,</span>{" "}
//             <span className="text-black">Teamwork?</span>{" "}
//             <span className="text-[#FF6F00]">Upgraded</span>
//           </p>

//           {/* Description */}
//           <p className="mt-4 text-xl leading-7 text-[#535862]">
//             No more guesswork. With real-time attendance monitoring, seamless
//             task coordination, and robust reporting tools, Kloka gives you the
//             visibility and control you need to lead with confidence.
//           </p>
//         </div>

//         {/* Rest of your section */}
//         <div className="flex justify-between">
//           <div className="flex flex-col">
//             {/* First div with orange left border */}
//             <div className="border-l-4 border-[#cc5900] pl-4 py-6">
//               <p className="font-semibold">Track attendance in real time</p>
//               <p>Know who’s in, out, or working remotely.</p>
//             </div>
//             <div className="border-l-4 border-[#f5f5f5] pl-4 py-6">
//               <p className="font-semibold">Track tasks seamlessly</p>
//               <p>Keep your team on top of deadlines.</p>
//             </div>
//             <div className="border-l-4 border-[#f5f5f5] pl-4 py-6">
//               <p className="font-semibold">Track tasks seamlessly</p>
//               <p>Keep your team on top of deadlines.</p>
//             </div>{" "}
//             <div className="border-l-4 border-[#f5f5f5] pl-4 py-6">
//               <p className="font-semibold">Track tasks seamlessly</p>
//               <p>
//                 Whether your team is remote, hybrid, or in-office, Kloka works
//                 for you.
//               </p>
//             </div>{" "}
//             <div className="border-l-4 border-[#f5f5f5] pl-4 py-6">
//               <p className="font-semibold">Track tasks seamlessly</p>
//               <p>Keep your team on top of deadlines.</p>
//             </div>
//           </div>

//           <div className="bg-[#F5F5F5] p-5 pr-0 w-1/2">
//             <Image
//               src={landingPageBanner_2}
//               alt="User avatar"
//               // width={500}
//               // height={300}
//               className="border-2 border-black rounded-l-xl border-r-0 w-full h-auto object-contain"
//             />
//           </div>
//         </div>
//       </section>

//       <section className="flex items-center px-0 py-0 border">
//         {/* Image (50%) */}
//         <div className="w-1/2">
//           <Image
//             src={people}
//             alt="User avatar"
//             width={500}
//             height={200}
//             className="h-auto w-full object-contain"
//           />
//         </div>

//         {/* Text (50%) */}
//         <div className="pl-10 ">
//           <div className="max-w-lg ml-auto">
//             <Image
//               src={people_icon}
//               alt="Icon"
//               width={50}
//               height={30}
//               className="mb-4 object-contain"
//             />

//             <p className="font-semibold text-3xl leading-tight text-[#181D27]">
//               Your Workflow, Simplified.
//             </p>

//             <p className="mt-4 text-lg leading-7 text-[#2A0C00]">
//               From daily check-ins to project follow-through, Kloka helps you
//               stay organized and connected — without the stress.
//             </p>
//           </div>
//         </div>
//       </section>

//       <section className="px-10 py-16">
//         <div className="flex items-center justify-between rounded-2xl bg-[#EBE9E9] px-10 pt-16 pr-0">
//           {/* Text content */}
//           <div className="max-w-xl">
//             <p className="font-semibold text-4xl leading-tight tracking-[-0.02em] text-[#181D27]">
//               Ready to Upgrade Your Team’s Efficiency?
//             </p>

//             <p className="mt-4 text-xl leading-8 text-[#535862]">
//               Get started with Kloka today.
//             </p>

//             <div className="mt-6 flex gap-4">
//               <Button variant={"secondary"}>Book a Demo</Button>
//               <Button className=" bg-kr-orange hover:bg-kr-orange/90">
//                 Try Kloka Today
//               </Button>
//             </div>
//           </div>

//           {/* Image */}
//           <div className="w-1/2">
//             <Image
//               src={landingPageBanner}
//               alt="User avatar"
//               // width={500}
//               // height={300}
//               className="object-contain w-full h-auto"
//             />
//           </div>
//         </div>
//       </section>

//       <section className="flex justify-between bg-[#2A0C00] px-8 py-6">
//         {/* Logo */}
//         <div>
//           <Image src={klokaLogo} alt="Logo" width={150} height={75} />
//         </div>

//         {/* Links */}

//         <div className="flex items-center gap-6">
//           <Link
//             href="/overview"
//             className="text-[#FFE3DE] font-semibold text-base leading-6 hover:underline"
//           >
//             Overview
//           </Link>
//           <Link
//             href="/features"
//             className="text-[#FFE3DE] font-semibold text-base leading-6 hover:underline"
//           >
//             Features
//           </Link>
//           <Link
//             href="/pricing"
//             className="text-[#FFE3DE] font-semibold text-base leading-6 hover:underline"
//           >
//             FAQs
//           </Link>
//           <Link
//             href="/about"
//             className="text-[#FFE3DE] font-semibold text-base leading-6 hover:underline"
//           >
//             Careers
//           </Link>
//           <Link
//             href="/about"
//             className="text-[#FFE3DE] font-semibold text-base leading-6 hover:underline"
//           >
//             Careers
//           </Link>
//         </div>

//         {/* Footer text */}
//         <div className="text-right text-white text-sm">
//           © 2026 Kloka. Powered By <br /> Kimberly Ryan
//         </div>
//       </section>
//     </div>
//   );
// }
// import { redirect } from "next/navigation";
import Image from "next/image";
import landingPageBanner from "@/public/images/Landing_Page_Banner.svg";
import landingPageBanner_2 from "@/public/images/Landing_Page_Banner_2.svg";

import people from "@/public/images/people.svg";
import people_icon from "@/public/images/people_icon.svg";

import klokaLogo from "@/public/images/my_kloka_Logo.svg";
import klokaLogoColor from "@/public/images/my_kloka_Logo_color.svg";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/dashboard/header";
import { DialogOverlay } from "@/components/ui/dialog";

export default function HomePage() {
  return (
    <div>
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white shadow-md">
        {/* Logo + Nav */}
        <div className="flex items-center gap-4 md:gap-12">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={klokaLogoColor}
              alt="Kloka Logo"
              width={100}
              height={50}
              className="md:w-[150px] md:h-[75px] object-contain"
            />
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-gray-800">
            <Link
              href="#features"
              className="hover:text-[#FF6F00] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#resources"
              className="hover:text-[#FF6F00] transition-colors"
            >
              Resources
            </Link>
            <Link
              href="#about"
              className="hover:text-[#FF6F00] transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden p-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Buttons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">
            Log in
          </Button>
          <Button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-10 py-8 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-2xl bg-[#2A0C00] px-4 md:px-10 pt-8 md:pt-16 md:pr-0">
          {/* Text content */}
          <div className="w-full md:max-w-xl mb-8 md:mb-0">
            <p className="font-bold text-3xl md:text-5xl leading-tight tracking-[-0.02em] text-[#fff]">
              Simplify how your team works
            </p>

            <p className="mt-4 text-base md:text-xl leading-6 md:leading-8 text-[#FFE3DE]">
              Kloka is a professional-grade platform built to make attendance
              tracking and task management effortless for organizations of all
              sizes
            </p>

            <div className="mt-6 flex gap-4">
              <Button className="w-full md:w-auto bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                Get started
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
            <Image
              src={landingPageBanner}
              alt="Dashboard preview"
              className="object-contain w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-16 bg-[#ebe9e9] py-8 md:py-10">
        <div className="mb-8">
          {/* Features heading */}
          <p className="text-[#FF6F00] font-semibold text-sm md:text-base">
            Features
          </p>

          {/* Alternating color heading */}
          <p className="font-semibold text-2xl md:text-4xl leading-tight mt-2">
            <span className="text-black">Attendance?</span>{" "}
            <span className="text-[#FF6F00]">Tracked,</span>{" "}
            <span className="text-black">Tasks?</span>{" "}
            <span className="text-[#FF6F00]">Handled</span>
          </p>

          {/* Description */}
          <p className="mt-4 text-base md:text-xl leading-6 md:leading-7 text-[#535862]">
            No more guesswork. With real-time attendance monitoring, seamless
            task coordination, and robust reporting tools, Kloka gives you the
            visibility and control you need to lead with confidence.
          </p>
        </div>

        {/* Feature List and Image */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col w-full md:w-1/2">
            {/* First div with orange left border */}
            <div className="border-l-4 border-[#cc5900] pl-4 py-4 md:py-6">
              <p className="font-semibold text-base md:text-lg">
                Track attendance in real time
              </p>
              <p className="text-sm md:text-base text-[#535862]">
                Know who's in, out, or working remotely.
              </p>
            </div>
            <div className="border-l-4 border-[#d9d9d9] pl-4 py-4 md:py-6">
              <p className="font-semibold text-base md:text-lg">
                Coordinate tasks with ease
              </p>
              <p className="text-sm md:text-base text-[#535862]">
                Assign, monitor, and manage work from one place.
              </p>
            </div>
            <div className="border-l-4 border-[#d9d9d9] pl-4 py-4 md:py-6">
              <p className="font-semibold text-base md:text-lg">
                Make smarter decisions
              </p>
              <p className="text-sm md:text-base text-[#535862]">
                Access powerful reports that fuel productivity and performance.
              </p>
            </div>
            <div className="border-l-4 border-[#d9d9d9] pl-4 py-4 md:py-6">
              <p className="font-semibold text-base md:text-lg">
                Support any work style
              </p>
              <p className="text-sm md:text-base text-[#535862]">
                Whether your team is remote, hybrid, or in-office, Kloka works
                for you.
              </p>
            </div>
            <div className="border-l-4 border-[#d9d9d9] pl-4 py-4 md:py-6">
              <p className="font-semibold text-base md:text-lg">
                Generates generic emails
              </p>
              <p className="text-sm md:text-base text-[#535862]">
                Send bulk emails to all staff
              </p>
            </div>
          </div>

          <div className="bg-[#F5F5F5] p-4 md:p-5 md:pr-0 w-full md:w-1/2">
            <Image
              src={landingPageBanner_2}
              alt="Attendance management dashboard"
              className="border-2 border-black rounded-l-xl border-r-0 w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="flex flex-col md:flex-row items-center px-4 md:px-0 py-8 md:py-0">
        {/* Image (50% on desktop, full width on mobile) */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <Image
            src={people}
            alt="Team collaboration"
            width={500}
            height={200}
            className="h-auto w-full object-contain"
          />
        </div>

        {/* Text (50% on desktop, full width on mobile) */}
        <div className="w-full md:w-1/2 md:pl-10">
          <div className="max-w-lg md:ml-auto">
            <Image
              src={people_icon}
              alt="Icon"
              width={50}
              height={30}
              className="mb-4 object-contain"
            />

            <p className="font-semibold text-2xl md:text-3xl leading-tight text-[#181D27]">
              Your Workflow, Simplified.
            </p>

            <p className="mt-4 text-base md:text-lg leading-6 md:leading-7 text-[#2A0C00]">
              From daily check-ins to project follow-through, Kloka helps you
              stay organized and connected — without the stress.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-10 py-8 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between rounded-2xl bg-[#EBE9E9] px-4 md:px-10 pt-8 md:pt-16 md:pr-0">
          {/* Text content */}
          <div className="w-full md:max-w-xl mb-8 md:mb-0">
            <p className="font-semibold text-2xl md:text-4xl leading-tight tracking-[-0.02em] text-[#181D27]">
              Ready to Upgrade Your Team's Efficiency?
            </p>

            <p className="mt-4 text-base md:text-xl leading-6 md:leading-8 text-[#535862]">
              Get started with Kloka today.
            </p>

            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <Button
                variant={"secondary"}
                className="w-full md:w-auto order-2 md:order-1"
              >
                Book a demo
              </Button>
              <Button className="w-full md:w-auto bg-[#FF6F00] hover:bg-[#FF6F00]/90 order-1 md:order-2">
                Try Kloka today
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="w-full md:w-1/2">
            <Image
              src={landingPageBanner}
              alt="Dashboard preview"
              className="object-contain w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="flex flex-col md:flex-row justify-between items-center bg-[#2A0C00] px-4 md:px-8 py-6 gap-6">
        {/* Logo */}
        <div className="order-1">
          <Image
            src={klokaLogo}
            alt="Logo"
            width={120}
            height={60}
            className="md:w-[150px] md:h-[75px]"
          />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 order-3 md:order-2">
          <Link
            href="/overview"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            Overview
          </Link>
          <Link
            href="/features"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            FAQs
          </Link>
          <Link
            href="/about"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            Careers
          </Link>
          <Link
            href="/help"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            Help
          </Link>
          <Link
            href="/privacy"
            className="text-[#FFE3DE] font-semibold text-sm md:text-base leading-6 hover:underline"
          >
            Privacy
          </Link>
        </div>

        {/* Footer text */}
        <div className="w-full text-center md:text-right text-white text-xs md:text-sm order-2 md:order-3 mt-4 md:mt-0">
          © 2026 Kloka. Powered By <br /> Kimberly Ryan
        </div>
      </section>
    </div>
  );
}
