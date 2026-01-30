import React from "react";

const Header = () => {
  return (
    <header className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20 px-6 md:px-12 overflow-hidden">
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto text-center md:text-left">
        {/* Subtitle */}
        <h2 className="text-sm md:text-xl font-semibold tracking-wider uppercase opacity-80 mb-3">
          Inc. This Morning
        </h2>

        {/* Title with smooth scaling quote marks */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 flex items-center justify-center md:justify-start gap-2">
          <span className="text-yellow-300 animate-scaleQuote">"</span>
          Blog
          <span className="text-yellow-300 animate-scaleQuote">"</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-2xl">
          Your daily dose of <span className="font-semibold">productivity</span>{" "}
          and <span className="font-semibold">entertainment</span> — inspiring
          updates and insightful posts to keep you motivated.
        </p>
      </div>

      {/* Background decorative shapes */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-200/30 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full filter blur-2xl animate-pulse"></div>
    </header>
  );
};

export default Header;
