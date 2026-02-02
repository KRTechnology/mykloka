import klokaLogoColor from "@/public/images/my_kloka_Logo_color.svg";
import login_page_banner from "@/public/images/login_page_banner.svg";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ClientLogin() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="w-1/2 h-full">
        <Image
          src={login_page_banner}
          alt="Kloka Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-1/2 p-10 flex flex-col">
        <Image
          src={klokaLogoColor}
          alt="Kloka Logo"
          width={100}
          height={50}
          className="object-contain"
        />
        <p>Tagline</p>

        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <label className="block mb-2">Work Email</label>
            <input
              type="email"
              placeholder="input email"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              placeholder="input password"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <Button type="submit">Log In</Button>
        </div>

        <div className="mt-auto">
          <p>New Company ? Sign up</p>
          <p>Forgot Password ?</p>
        </div>
      </div>
    </div>
  );
}
