import Navbar from '@/components/marketing/Navbar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar showNavLinks={false} />
      <div className="pt-16 min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
