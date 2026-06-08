import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, noFooter = false, fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="min-h-screen font-sans">
        {children}
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
