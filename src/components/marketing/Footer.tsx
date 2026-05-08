import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#080810] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
              <span className="text-xl">⌨</span>
              <span>kaystash</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The developer knowledge hub.<br />Store everything. Find anything.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Product</h4>
            <div className="flex flex-col gap-3">
              <Link href="#features" className="text-zinc-500 text-sm hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-zinc-500 text-sm hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Changelog</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">About</Link>
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-zinc-600 text-sm">
          &copy; {year} KayStash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
