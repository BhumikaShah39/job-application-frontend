import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import KaryaLogo from "../../assets/LogoWithText.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link
            to="/"
            className="text-2xl font-bold text-[#1A2E46] hover:text-[#58A6FF]"
          >
            <div className="h-full flex items-center">
              <img src={KaryaLogo} className="h-20 w-auto" alt="Karya" />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          <Link
            to="/login"
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-block rounded-lg bg-[#1A2E46] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#58A6FF]"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#1A2E46]"
          >
            <Bars3Icon aria-hidden="true" className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        {/* This div ensures the background click area for the Dialog */}
        <div className="fixed inset-0 z-10" />

        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-transparent px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-[#1A2E46]/10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-xl font-bold text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Karya
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-[#1A2E46]"
            >
              <XMarkIcon aria-hidden="true" className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-[#1A2E46]/10">
              <div className="py-6">
                <Link
                  to="/login"
                  className="block rounded-lg px-3 py-2 text-base font-medium text-[#1A2E46] hover:bg-[#58A6FF] hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-lg bg-[#1A2E46] px-3 py-2 text-base font-semibold text-white text-center hover:bg-[#58A6FF]"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
