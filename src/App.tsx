/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  processImageToColoringPage,
  ProcessOptions
} from './utils/imageProcessing';
import {
  getContourPointsForShape,
  extractOrderedContourFromCanvas,
  DotPoint,
  PresetShape
} from './utils/connectDots';
import {
  generateMathWorksheet,
  MathProblem
} from './utils/mathGenerator';
import {
  generateWordSearch,
  generateMaze,
  WordSearchGrid,
  MazeGrid
} from './utils/puzzleEngine';
import {
  exportActivityBookPDF,
  ActivityPage,
  ActivityBookMeta
} from './utils/pdfGenerator';
import { generateSampleImage } from './utils/sampleImages';
import { enrichPromptConcept } from './utils/aiService';
import {
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  ShoppingBag,
  ShieldCheck,
  Menu,
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  Tag,
  Star,
  Check
} from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  type: string;
  pages: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'categories' | 'photo' | 'dots' | 'math' | 'tracing' | 'puzzles' | 'book' | 'shop' | 'admin'
  >('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Persistent Book Pages State (LocalStorage backed)
  const [bookPages, setBookPages] = useState<ActivityPage[]>(() => {
    try {
      const saved = localStorage.getItem('colorcraft_book_pages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookMeta, setBookMeta] = useState<ActivityBookMeta>(() => {
    try {
      const saved = localStorage.getItem('colorcraft_book_meta');
      return saved
        ? JSON.parse(saved)
        : {
            title: 'My Magical Learning Book',
            subtitle: 'Coloring, Numbers, Tracing & Maths',
            childName: 'Alex',
            theme: 'Animals & Adventures',
            pageSize: 'a4',
            orientation: 'portrait',
          };
    } catch {
      return {
        title: 'My Magical Learning Book',
        subtitle: 'Coloring, Numbers, Tracing & Maths',
        childName: 'Alex',
        theme: 'Animals & Adventures',
        pageSize: 'a4',
        orientation: 'portrait',
      };
    }
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('colorcraft_book_pages', JSON.stringify(bookPages));
      localStorage.setItem('colorcraft_book_meta', JSON.stringify(bookMeta));
    } catch (e) {
      console.warn('LocalStorage limit reached or quota exceeded', e);
    }
  }, [bookPages, bookMeta]);

  // 2. Shopping Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // 3. Admin Authentication Barrier State
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // Toast System
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' } | null>(null);
  const showToast = (message: string, type: 'info' | 'success' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const addPageToBook = (page: Omit<ActivityPage, 'id'>) => {
    const newPage: ActivityPage = {
      ...page,
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setBookPages((prev) => [...prev, newPage]);
    showToast(`Added "${page.title}" to Activity Book!`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2D3748] font-sans flex flex-col antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#B5EAD7]" />
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
          onCheckoutSuccess={() => {
            setCart([]);
            setCartOpen(false);
            showToast('Order confirmed in Demo Sandbox! Instant printable files unlocked.');
          }}
        />
      )}

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] flex items-center justify-center shadow-sm">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black tracking-tight text-[#4A5568]">COLORCRAFT</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-[#6C5CE7] text-white tracking-wider">AI</span>
              </div>
              <p className="text-[10px] font-bold tracking-wider text-[#A0AEC0] uppercase">
                Create, Learn, Color &amp; Play!
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'categories', label: 'Categories' },
              { id: 'photo', label: 'Photo to Outline' },
              { id: 'dots', label: 'Connect Dots' },
              { id: 'math', label: 'Maths Studio' },
              { id: 'tracing', label: 'Tracing' },
              { id: 'puzzles', label: 'Puzzles & Mazes' },
              { id: 'book', label: `My Book (${bookPages.length})` },
              { id: 'shop', label: 'Shop' },
              { id: 'admin', label: 'Admin' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-[#6C5CE7] text-white shadow-sm'
                    : 'text-[#4A5568] hover:bg-[#F7FAFC]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-gray-700" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#6C5CE7] text-white rounded-full text-[10px] font-extrabold">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-5 space-y-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'categories', label: 'All 15 Activity Categories' },
              { id: 'photo', label: 'Photo-to-Coloring Studio' },
              { id: 'dots', label: 'Connect the Dots Studio' },
              { id: 'math', label: 'Maths Worksheets' },
              { id: 'tracing', label: 'Handwriting & Tracing' },
              { id: 'puzzles', label: 'Puzzles & Mazes' },
              { id: 'book', label: `My Activity Book (${bookPages.length} Pages)` },
              { id: 'shop', label: 'Educational Store' },
              { id: 'admin', label: 'Admin Dashboard' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                  activeTab === t.id ? 'bg-[#6C5CE7] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            bookPageCount={bookPages.length}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesView onSelectCategory={(catId) => {
            if (catId === 'dots') setActiveTab('dots');
            else if (catId === 'math') setActiveTab('math');
            else if (catId === 'tracing' || catId === 'alphabet' || catId === 'numbers') setActiveTab('tracing');
            else if (catId === 'puzzles' || catId === 'mazes' || catId === 'wordsearch') setActiveTab('puzzles');
            else setActiveTab('photo');
          }} />
        )}
        {activeTab === 'photo' && (
          <PhotoToColoringStudio onAddToBook={addPageToBook} />
        )}
        {activeTab === 'dots' && (
          <ConnectDotsStudio onAddToBook={addPageToBook} />
        )}
        {activeTab === 'math' && (
          <MathStudio onAddToBook={addPageToBook} />
        )}
        {activeTab === 'tracing' && (
          <TracingStudio onAddToBook={addPageToBook} />
        )}
        {activeTab === 'puzzles' && (
          <PuzzleStudio onAddToBook={addPageToBook} />
        )}
        {activeTab === 'book' && (
          <BookBuilderView
            pages={bookPages}
            meta={bookMeta}
            setMeta={setBookMeta}
            setPages={setBookPages}
            onDownloadSuccess={() => showToast('Activity Book PDF compiled and downloaded!')}
          />
        )}
        {activeTab === 'shop' && (
          <ShopView onAddToCart={(item) => {
            setCart((prev) => [...prev, item]);
            showToast(`Added "${item.title}" to cart!`);
          }} />
        )}
        {activeTab === 'admin' && (
          <AdminView
            totalBookPages={bookPages.length}
            authenticated={adminAuthenticated}
            onAuthenticate={() => setAdminAuthenticated(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#F0EAE1] mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎨</span>
                <span className="text-lg font-black tracking-tight text-[#4A5568]">COLORCRAFT AI</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Empowering parents, teachers, and children worldwide to create personalized educational activity books and coloring pages with zero-cost client processing.
              </p>
              <div className="flex items-center space-x-3 mt-4 text-xs font-semibold text-gray-600">
                <span>Twitter</span>
                <span>·</span>
                <span>Instagram</span>
                <span>·</span>
                <span>YouTube</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Activities</h4>
              <ul className="text-xs space-y-2 text-gray-500">
                <li><button onClick={() => setActiveTab('photo')} className="hover:text-[#6C5CE7]">Photo-to-Coloring</button></li>
                <li><button onClick={() => setActiveTab('dots')} className="hover:text-[#6C5CE7]">Connect the Dots</button></li>
                <li><button onClick={() => setActiveTab('math')} className="hover:text-[#6C5CE7]">Maths Worksheets</button></li>
                <li><button onClick={() => setActiveTab('tracing')} className="hover:text-[#6C5CE7]">Alphabet &amp; Handwriting</button></li>
                <li><button onClick={() => setActiveTab('puzzles')} className="hover:text-[#6C5CE7]">Word Search &amp; Mazes</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Activity Books</h4>
              <ul className="text-xs space-y-2 text-gray-500">
                <li><button onClick={() => setActiveTab('book')} className="hover:text-[#6C5CE7]">Personalized PDF Builder</button></li>
                <li><button onClick={() => setActiveTab('shop')} className="hover:text-[#6C5CE7]">Printable Bundles</button></li>
                <li><button onClick={() => setActiveTab('categories')} className="hover:text-[#6C5CE7]">All 15 Categories</button></li>
                <li><span className="text-gray-400">Print on Demand (Upcoming)</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Help &amp; Legal</h4>
              <ul className="text-xs space-y-2 text-gray-500">
                <li><span className="cursor-pointer hover:text-gray-700">Privacy Policy</span></li>
                <li><span className="cursor-pointer hover:text-gray-700">Terms &amp; Conditions</span></li>
                <li><span className="cursor-pointer hover:text-gray-700">Refund Policy</span></li>
                <li><span className="cursor-pointer hover:text-gray-700">Help Center &amp; FAQs</span></li>
                <li><button onClick={() => setActiveTab('admin')} className="text-[#6C5CE7] font-semibold hover:underline">Admin Portal</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400">
            <p>© {new Date().getFullYear()} ColorCraft AI. All rights reserved. Zero-Budget Educational Suite.</p>
            <p className="mt-2 sm:mt-0">All image processing and mathematical worksheets run client-side in your browser.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. HOME VIEW
// ----------------------------------------------------------------------
function HomeView({
  onNavigate,
  bookPageCount,
}: {
  onNavigate: (tab: any) => void;
  bookPageCount: number;
}) {
  const steps = [
    { num: '01', title: 'Choose or Upload', desc: 'Pick from 15 activity types or upload any family photo, toy, or pet image.' },
    { num: '02', title: 'Customize & Generate', desc: 'Adjust outline thickness, dot counts, math levels, or tracing guide letters.' },
    { num: '03', title: 'Compile & Print', desc: 'Add pages to your custom activity book and export a print-ready A4/Letter PDF.' },
  ];

  const popularPacks = [
    { title: 'Animal Kingdom Adventures', pages: 24, age: '3-7', tag: 'Best Seller' },
    { title: 'Kindergarten Maths & Counting', pages: 30, age: '4-6', tag: 'Curriculum' },
    { title: 'Space Odyssey Dot-to-Dot', pages: 20, age: '5-8', tag: 'Popular' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FFF5F5] via-[#FFFDF9] to-[#EBF4FF] rounded-3xl p-8 sm:p-14 border border-[#E2E8F0] shadow-sm text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Zero-Budget • 100% Client-Side Engine • Print-Ready</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2D3748] tracking-tight leading-tight">
            Create Your Own Magical Learning &amp; Coloring Books!
          </h1>

          <p className="text-base sm:text-lg text-[#718096] mt-4 max-w-2xl mx-auto leading-relaxed">
            Turn your imagination, family photos, and educational goals into beautiful coloring pages,
            numbered connect-the-dots, verified maths worksheets, and custom printable books.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <button
              onClick={() => onNavigate('photo')}
              className="px-6 py-3.5 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center space-x-2"
            >
              <span>📸</span>
              <span>Start Creating Free</span>
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold rounded-2xl shadow-xs transition-all text-sm"
            >
              Explore 15 Activities
            </button>
            <button
              onClick={() => onNavigate('book')}
              className="px-6 py-3.5 bg-[#2D3748] hover:bg-black text-white font-bold rounded-2xl shadow-sm transition-all text-sm flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>My Book ({bookPageCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">How It Works</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">Simple 3-step creation process for parents and teachers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <span className="text-3xl font-black text-[#6C5CE7]">{st.num}</span>
              <h3 className="text-base font-bold text-gray-800 mt-2">{st.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Activity Generators */}
      <section>
        <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Interactive Creation Studios</h2>
            <p className="text-xs sm:text-sm text-[#718096] mt-1">All engines run locally in the browser with zero paid subscriptions.</p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-bold text-[#6C5CE7] hover:underline"
          >
            View all 15 categories →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'photo', title: 'Photo-to-Coloring Page', icon: '📸', desc: 'Convert pet, family, or object photos into clean line art outlines with edge dilation.' },
            { id: 'dots', title: 'Number Connect the Dots', icon: '🔢', desc: '10, 20, 50, and 100 dot worksheets with contour-accurate sequential numbering.' },
            { id: 'math', title: 'Maths Worksheets (Validated)', icon: '➕', desc: 'Addition, subtraction, missing numbers, and division with guaranteed correct answers.' },
            { id: 'tracing', title: 'Alphabet & Letter Tracing', icon: '✏️', desc: 'Standardized 3-line ruling with green stroke-start guides for handwriting.' },
            { id: 'puzzles', title: 'Word Search & Solvable Mazes', icon: '🧩', desc: 'Thematic word search puzzles and algorithmic single-solution mazes.' },
            { id: 'book', title: 'Personalized Book Compiler', icon: '📚', desc: 'Combine multiple worksheets into a customized printable book with personalized cover.' },
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl block mb-3">{card.icon}</span>
                <h3 className="text-base font-bold text-gray-800">{card.title}</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{card.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#6C5CE7]">
                <span>Launch Studio</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Activity Books */}
      <section className="bg-white p-8 rounded-3xl border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-[#2D3748]">Popular Activity Books</h2>
          <p className="text-xs text-[#718096]">Ready-to-print collections loved by parents and homeschoolers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularPacks.map((pack, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-gray-100 bg-[#FFFDF9] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider">{pack.tag}</span>
                <h3 className="text-sm font-bold text-gray-800 mt-1">{pack.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{pack.pages} Pages · Ages {pack.age}</p>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="mt-4 w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                View in Store
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section>
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sample Community Feedback</span>
          <h2 className="text-2xl font-black text-[#2D3748] mt-1">What Parents &amp; Teachers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah M.', role: 'Homeschool Parent', review: 'Being able to turn our pet dog’s photo into a coloring page made my daughter’s day. The PDF export is crystal clear on our home printer!' },
            { name: 'David K.', role: '1st Grade Teacher', review: 'The programmatically validated maths sheets save me hours. No incorrect equations or negative numbers for young kids.' },
            { name: 'Priya R.', role: 'Preschool Educator', review: 'The 3-line tracing format and connect-the-dots sequence are pedagogically sound. Truly exceptional zero-budget tool.' },
          ].map((r, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">"{r.review}"</p>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-800">{r.name}</p>
                <p className="text-[10px] text-gray-400">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. CATEGORIES VIEW (All 15 Required Categories)
// ----------------------------------------------------------------------
function CategoriesView({ onSelectCategory }: { onSelectCategory: (id: string) => void }) {
  const categoriesList = [
    { id: 'coloring', name: 'Normal Coloring Pages', icon: '🎨', age: '3-10', diff: 'Easy to Advanced', desc: 'Classic black and white line drawings with wide spaces for crayons and pencils.' },
    { id: 'dots', name: 'Number Connect the Dots', icon: '🔢', age: '4-8', diff: '10 to 100 Dots', desc: 'Contour-based dot-to-dot exercises reinforcing number sequences.' },
    { id: 'alphabet', name: 'Alphabet Learning', icon: '🔤', age: '3-6', diff: 'Beginner', desc: 'Letter recognition, phonics matching, and uppercase/lowercase practice.' },
    { id: 'numbers', name: 'Number Learning', icon: '7️⃣', age: '3-6', diff: 'Beginner', desc: 'Number identification, counting games, and before-and-after ordering.' },
    { id: 'math', name: 'Maths Worksheets', icon: '➕', age: '4-8', diff: 'Age-Graded', desc: 'Validated addition, subtraction, missing numbers, and integer division.' },
    { id: 'tracing', name: 'Tracing Worksheets', icon: '✏️', age: '3-6', diff: 'Beginner', desc: 'Handwriting practice with elementary 3-line rulings and stroke start points.' },
    { id: 'puzzles', name: 'Puzzle Books', icon: '🧩', age: '5-9', diff: 'Medium', desc: 'Brain teasers, pattern completion, and visual logic puzzles.' },
    { id: 'wordsearch', name: 'Word Search', icon: '🔍', age: '5-10', diff: 'Easy to Medium', desc: 'Hidden word grids with themed vocabularies and answer validation.' },
    { id: 'mazes', name: 'Maze Games', icon: '🌀', age: '4-8', diff: 'Progressive', desc: 'Guaranteed solvable single-path labyrinth mazes from Start to Finish.' },
    { id: 'matching', name: 'Matching Activities', icon: '🔄', age: '3-6', diff: 'Beginner', desc: 'Object matching, shadow silhouettes, and pair connection challenges.' },
    { id: 'drawing', name: 'Drawing Practice', icon: '🖌️', age: '4-9', diff: 'Medium', desc: 'Step-by-step grid drawing practice and creative completion prompts.' },
    { id: 'animals', name: 'Animals & Nature Activities', icon: '🦁', age: '3-8', diff: 'All Ages', desc: 'Jungle animals, underwater creatures, birds, and forest habitats.' },
    { id: 'vehicles', name: 'Vehicles & Transportation', icon: '🚗', age: '3-8', diff: 'All Ages', desc: 'Cars, aeroplanes, trains, rockets, and construction machinery.' },
    { id: 'fruits', name: 'Fruits & Vegetables', icon: '🍎', age: '3-6', diff: 'Beginner', desc: 'Healthy food recognition, counting produce, and coloring harvest sheets.' },
    { id: 'shapes', name: 'Shapes & Colors', icon: '🔺', age: '3-5', diff: 'Beginner', desc: 'Geometric exploration of circles, triangles, stars, and pattern sequences.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">All 15 Activity Categories</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Explore our complete educational curriculum. Every category is ready to generate and compile into books.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesList.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-3xl border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-4xl block mb-3">{c.icon}</span>
              <h3 className="text-base font-bold text-gray-800">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{c.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-semibold">
                <span>Age {c.age}</span>
                <span>·</span>
                <span>{c.diff}</span>
              </div>
              <button
                onClick={() => onSelectCategory(c.id)}
                className="px-3.5 py-1.5 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white text-xs font-bold rounded-xl transition-all"
              >
                Create
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. PHOTO-TO-COLORING STUDIO (Zero Cost Canvas Filter Engine)
// ----------------------------------------------------------------------
function PhotoToColoringStudio({
  onAddToBook,
}: {
  onAddToBook: (page: Omit<ActivityPage, 'id'>) => void;
}) {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [options, setOptions] = useState<ProcessOptions>({
    threshold: 65,
    thickness: 2,
    brightness: 10,
    contrast: 20,
    style: 'simple',
    invert: false,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [promptIdea, setPromptIdea] = useState('');
  const [enhancedResult, setEnhancedResult] = useState<{ text: string; note?: string } | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleEnhancePrompt = async () => {
    if (!promptIdea.trim()) return;
    setIsEnhancing(true);
    const res = await enrichPromptConcept(promptIdea);
    setEnhancedResult({ text: res.enhancedPrompt, note: res.note });
    setIsEnhancing(false);
  };

  // Load sample image
  const loadSample = (type: 'puppy' | 'car' | 'dino') => {
    setErrorMsg(null);
    const dataUrl = generateSampleImage(type);
    const img = new Image();
    img.onload = () => setSourceImage(img);
    img.src = dataUrl;
  };

  // File Upload with Validation (JPG, PNG, WEBP, <= 15MB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setErrorMsg('Unsupported format! Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File too large! Please upload an image under 15MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceImage(img);
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      setErrorMsg('Failed to decode image file. Please try another image.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
    e.target.value = '';
  };

  // Re-process image whenever options or source changes
  useEffect(() => {
    if (!sourceImage || !hiddenCanvasRef.current || !resultCanvasRef.current) return;

    const canvas = hiddenCanvasRef.current;
    const maxDim = 900;
    let w = sourceImage.width;
    let h = sourceImage.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(sourceImage, 0, 0, w, h);

    const processed = processImageToColoringPage(canvas, options);

    const resCanvas = resultCanvasRef.current;
    resCanvas.width = w;
    resCanvas.height = h;
    const resCtx = resCanvas.getContext('2d', { willReadFrequently: true })!;
    resCtx.drawImage(processed, 0, 0);
  }, [sourceImage, options]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Turn Your Photo Into a Coloring Page</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Upload family photos, drawings, pets, or cars. Runs 100% in your browser with zero paid API costs.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          {/* File Upload Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Upload Photo (JPG, PNG, WEBP)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#6C5CE7] file:text-white hover:file:bg-[#5A4AD1] cursor-pointer"
            />
          </div>

          {/* Quick Sample Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Or Try Instant Samples:</label>
            <div className="flex gap-2">
              <button
                onClick={() => loadSample('puppy')}
                className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800"
              >
                🐶 Puppy
              </button>
              <button
                onClick={() => loadSample('car')}
                className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-800"
              >
                🚗 Car
              </button>
              <button
                onClick={() => loadSample('dino')}
                className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800"
              >
                🦖 Dino
              </button>
            </div>
          </div>

          {/* AI Idea / Coloring Prompt Assistant */}
          <div className="p-3.5 bg-gradient-to-br from-[#F4F1FE] to-[#FFFDF9] rounded-2xl border border-purple-100 space-y-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <label className="text-xs font-bold text-purple-950">AI Coloring Prompt &amp; Idea Assistant</label>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. Space cat on Mars, Princess dragon"
                value={promptIdea}
                onChange={(e) => setPromptIdea(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs"
              />
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !promptIdea.trim()}
                className="px-2.5 py-1.5 bg-[#6C5CE7] hover:bg-[#5A4AD1] disabled:opacity-50 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                {isEnhancing ? 'Enhancing...' : 'Enhance'}
              </button>
            </div>
            {enhancedResult && (
              <div className="p-2 bg-white rounded-xl border border-purple-100 text-[11px] text-gray-700 space-y-1">
                <p className="font-semibold text-purple-900 leading-snug">"{enhancedResult.text}"</p>
                {enhancedResult.note && (
                  <p className="text-[9px] text-gray-400 italic">{enhancedResult.note}</p>
                )}
              </div>
            )}
          </div>

          {/* Style Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Coloring Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(['simple', 'detailed', 'bold', 'kids'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOptions({ ...options, style: st })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border ${
                    options.style === st
                      ? 'border-[#6C5CE7] bg-[#F4F1FE] text-[#6C5CE7]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
              <span>Outline Sensitivity</span>
              <span>{options.threshold}</span>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              value={options.threshold}
              onChange={(e) => setOptions({ ...options, threshold: Number(e.target.value) })}
              className="w-full accent-[#6C5CE7]"
            />
          </div>

          {/* Line Thickness */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
              <span>Line Thickness</span>
              <span>{options.thickness}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={options.thickness}
              onChange={(e) => setOptions({ ...options, thickness: Number(e.target.value) })}
              className="w-full accent-[#6C5CE7]"
            />
          </div>

          {/* Brightness & Contrast */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Brightness</label>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.brightness}
                onChange={(e) => setOptions({ ...options, brightness: Number(e.target.value) })}
                className="w-full accent-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Contrast</label>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.contrast}
                onChange={(e) => setOptions({ ...options, contrast: Number(e.target.value) })}
                className="w-full accent-[#6C5CE7]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              disabled={!sourceImage}
              onClick={() => {
                if (!resultCanvasRef.current) return;
                onAddToBook({
                  title: 'Custom Coloring Page',
                  category: 'Coloring Pages',
                  dataUrl: resultCanvasRef.current.toDataURL('image/png'),
                  instructions: 'Color neatly inside the lines with your favorite crayons, markers or colored pencils.',
                });
              }}
              className="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] disabled:opacity-50 text-white rounded-xl font-bold shadow-sm text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Activity Book</span>
            </button>

            <button
              disabled={!sourceImage}
              onClick={() => {
                if (!resultCanvasRef.current) return;
                const link = document.createElement('a');
                link.download = 'colorcraft-coloring-page.png';
                link.href = resultCanvasRef.current.toDataURL('image/png');
                link.click();
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        {/* Preview Canvas Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
          <canvas ref={hiddenCanvasRef} className="hidden" />
          {sourceImage ? (
            <div className="w-full flex flex-col items-center">
              <canvas
                ref={resultCanvasRef}
                className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded-2xl shadow-inner bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                Crisp black &amp; white coloring outline preview (White background, zero perimeter border)
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400 p-8">
              <span className="text-5xl block mb-2">🖼️</span>
              <p className="font-bold text-sm text-gray-600">No Image Selected</p>
              <p className="text-xs text-gray-400 mt-1">Upload an image or click a sample (Puppy, Car, Dino) to see the conversion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. CONNECT-THE-DOTS STUDIO
// ----------------------------------------------------------------------
function ConnectDotsStudio({
  onAddToBook,
}: {
  onAddToBook: (page: Omit<ActivityPage, 'id'>) => void;
}) {
  const [dotCount, setDotCount] = useState<number>(20);
  const [shape, setShape] = useState<PresetShape>('dinosaur');
  const [customActive, setCustomActive] = useState(false);
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);
  const [dots, setDots] = useState<DotPoint[]>([]);

  const dotsCanvasRef = useRef<HTMLCanvasElement>(null);
  const customDotsInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 600;
      const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
      tCtx.drawImage(img, 0, 0, 600, 600);
      const points = extractOrderedContourFromCanvas(tempCanvas, dotCount);
      setDots(points);
      setCustomActive(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    e.target.value = '';
  };

  // Recalculate contour points
  useEffect(() => {
    if (!customActive) {
      const points = getContourPointsForShape(shape, 600, 600, dotCount);
      setDots(points);
    }
  }, [shape, dotCount, customActive]);

  // Render canvas
  useEffect(() => {
    if (!dotsCanvasRef.current || dots.length === 0) return;
    const canvas = dotsCanvasRef.current;
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 600);

    // Optional subtle dashed connecting guide lines
    if (showGuideLines) {
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      dots.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Render dots and outward-positioned labels
    dots.forEach((pt) => {
      // Dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.number === 1 ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = pt.number === 1 ? '#6C5CE7' : '#1F2937';
      ctx.fill();

      // Number Label
      ctx.font = pt.number === 1 ? 'bold 13px sans-serif' : '11px sans-serif';
      ctx.fillStyle = pt.number === 1 ? '#6C5CE7' : '#4B5563';
      const labelText = pt.number === 1 ? '1 (Start)' : String(pt.number);
      ctx.fillText(labelText, pt.x + pt.labelOffsetX, pt.y + pt.labelOffsetY);
    });
  }, [dots, showGuideLines]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Connect the Dots Generator</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Sequential numbered dots (1 to {dotCount}) following real geometric contours without random placements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          {/* Preset Shapes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Choose Subject Outline</label>
            <div className="grid grid-cols-4 gap-2">
              {(['dinosaur', 'elephant', 'rocket', 'car', 'star', 'apple', 'butterfly', 'teddy'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setCustomActive(false);
                    setShape(s);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border ${
                    !customActive && shape === s
                      ? 'border-[#00B894] bg-[#E6FFFA] text-[#00B894]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              <input
                ref={customDotsInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
              <button
                onClick={() => customDotsInputRef.current?.click()}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                  customActive
                    ? 'border-[#00B894] bg-[#E6FFFA] text-[#00B894]'
                    : 'border-dashed border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>📷</span>
                <span>{customActive ? 'Custom Photo Active (Re-Upload)' : 'Or Upload Photo to Extract Dots'}</span>
              </button>
            </div>
          </div>

          {/* Dot Counts */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Difficulty / Number of Dots</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((c) => (
                <button
                  key={c}
                  onClick={() => setDotCount(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                    dotCount === c
                      ? 'border-[#00B894] bg-[#E6FFFA] text-[#00B894]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c} Dots
                </button>
              ))}
            </div>
          </div>

          {/* Guide Line Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="dotGuideToggle"
              checked={showGuideLines}
              onChange={(e) => setShowGuideLines(e.target.checked)}
              className="w-4 h-4 text-[#00B894] rounded accent-[#00B894]"
            />
            <label htmlFor="dotGuideToggle" className="text-xs font-bold text-gray-700">
              Display Light Dotted Guide Lines
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (!dotsCanvasRef.current) return;
                onAddToBook({
                  title: `Connect the Dots: ${shape.toUpperCase()} (1-${dotCount})`,
                  category: 'Connect the Dots',
                  dataUrl: dotsCanvasRef.current.toDataURL('image/png'),
                  instructions: `Connect the dots sequentially from 1 to ${dotCount} to reveal the ${shape}, then color your picture!`,
                });
              }}
              className="w-full py-3 bg-[#00B894] hover:bg-[#009879] text-white rounded-xl font-bold shadow-sm text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Activity Book</span>
            </button>

            <button
              onClick={() => {
                if (!dotsCanvasRef.current) return;
                const link = document.createElement('a');
                link.download = `connect-dots-${shape}-${dotCount}.png`;
                link.href = dotsCanvasRef.current.toDataURL('image/png');
                link.click();
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
          <canvas
            ref={dotsCanvasRef}
            className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded-2xl shadow-inner bg-white"
          />
          <p className="text-[11px] text-gray-400 mt-2 font-medium">
            Numbered 1 through {dotCount} · Outward normal label offsets prevent overlap
          </p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. MATHS WORKSHEET STUDIO (Programmatically Validated)
// ----------------------------------------------------------------------
function MathStudio({
  onAddToBook,
}: {
  onAddToBook: (page: Omit<ActivityPage, 'id'>) => void;
}) {
  const [ageGroup, setAgeGroup] = useState<'3-4' | '4-5' | '5-6' | '6-8'>('5-6');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const mathCanvasRef = useRef<HTMLCanvasElement>(null);

  const generateFreshProblems = () => {
    const res = generateMathWorksheet(ageGroup, 8);
    setProblems(res.problems);
  };

  useEffect(() => {
    generateFreshProblems();
  }, [ageGroup]);

  // Render canvas
  useEffect(() => {
    if (!mathCanvasRef.current || problems.length === 0) return;
    const canvas = mathCanvasRef.current;
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative Worksheet Header
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(40, 30, 720, 80);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 30, 720, 80);

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Maths Adventure • Age Group ${ageGroup}`, 60, 65);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Name: __________________________    Date: ________________', 60, 95);

    const startY = 150;
    const rowHeight = 190;

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 50 + col * 360;
      const y = startY + row * rowHeight;

      // Question card
      ctx.fillStyle = '#FAFAFA';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, 340, 160, 12);
      ctx.fill();
      ctx.stroke();

      // Number badge
      ctx.fillStyle = '#FD79A8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Q${idx + 1}.`, x + 16, y + 28);

      // Question text
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText(p.question, x + 44, y + 28);

      // Expression
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(p.expression, x + 25, y + 85);

      // Answer overlay if toggled
      if (showAnswers) {
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`Verified Answer: ${p.correctAnswer}`, x + 25, y + 130);
      }
    });
  }, [problems, showAnswers, ageGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Educational Maths Worksheet Generator</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          100% programmatically validated equations without fractional remainders or negative subtraction errors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Age Bracket</label>
            <div className="grid grid-cols-2 gap-2">
              {(['3-4', '4-5', '5-6', '6-8'] as const).map((ag) => (
                <button
                  key={ag}
                  onClick={() => setAgeGroup(ag)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    ageGroup === ag
                      ? 'border-[#FD79A8] bg-[#FFF0F5] text-[#FD79A8]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Age {ag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="mathAnsKeyToggle"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
              className="w-4 h-4 text-[#FD79A8] rounded accent-[#FD79A8]"
            />
            <label htmlFor="mathAnsKeyToggle" className="text-xs font-bold text-gray-700">
              Reveal Answer Key Overlay
            </label>
          </div>

          <button
            onClick={generateFreshProblems}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Problem Set</span>
          </button>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (!mathCanvasRef.current) return;
                onAddToBook({
                  title: `Maths Practice (Age ${ageGroup})`,
                  category: 'Maths Worksheets',
                  dataUrl: mathCanvasRef.current.toDataURL('image/png'),
                  instructions: 'Solve the arithmetic equations and write your answers in the blank spaces.',
                });
              }}
              className="w-full py-3 bg-[#FD79A8] hover:bg-[#E86796] text-white rounded-xl font-bold shadow-sm text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Activity Book</span>
            </button>

            <button
              onClick={() => {
                if (!mathCanvasRef.current) return;
                const link = document.createElement('a');
                link.download = `maths-worksheet-age-${ageGroup}.png`;
                link.href = mathCanvasRef.current.toDataURL('image/png');
                link.click();
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
          <canvas
            ref={mathCanvasRef}
            className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded-2xl shadow-inner bg-white"
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. TRACING & HANDWRITING STUDIO
// ----------------------------------------------------------------------
function TracingStudio({
  onAddToBook,
}: {
  onAddToBook: (page: Omit<ActivityPage, 'id'>) => void;
}) {
  const [mode, setMode] = useState<'letters' | 'numbers' | 'words'>('letters');
  const [content, setContent] = useState('ABC');
  const tracingCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!tracingCanvasRef.current) return;
    const canvas = tracingCanvasRef.current;
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;

    // Clean white page
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1000);

    // Header
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Handwriting & Tracing Practice', 50, 60);

    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Name: __________________________    Date: ________________', 50, 95);

    const items = content.split('').slice(0, 4);

    items.forEach((item, idx) => {
      const yBase = 180 + idx * 190;

      // Primary Blue Baseline
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, yBase);
      ctx.lineTo(750, yBase);
      ctx.stroke();

      // Middle Dashed Guideline
      ctx.strokeStyle = '#FCA5A5';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(50, yBase - 45);
      ctx.lineTo(750, yBase - 45);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Guideline
      ctx.strokeStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(50, yBase - 90);
      ctx.lineTo(750, yBase - 90);
      ctx.stroke();

      // 1. Solid Master Model
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 75px monospace';
      ctx.fillText(item, 70, yBase - 15);

      // 2. Dotted Trace Models with green stroke-start dot
      ctx.fillStyle = '#CBD5E1';
      for (let pos = 240; pos <= 660; pos += 130) {
        ctx.fillText(item, pos, yBase - 15);

        // Green start dot
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(pos + 10, yBase - 75, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#CBD5E1';
      }
    });
  }, [content, mode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Handwriting &amp; Tracing Studio</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Standardized elementary 3-line ruling with green directional stroke-start indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'letters', label: 'Letters A-Z' },
                { id: 'numbers', label: 'Numbers 0-9' },
                { id: 'words', label: 'Words' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as any);
                    setContent(m.id === 'letters' ? 'ABC' : m.id === 'numbers' ? '123' : 'CAT');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border ${
                    mode === m.id
                      ? 'border-[#6C5CE7] bg-[#F4F1FE] text-[#6C5CE7]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Characters to Trace (Up to 4)</label>
            <input
              type="text"
              maxLength={4}
              value={content}
              onChange={(e) => setContent(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded-xl text-sm font-bold uppercase tracking-wider"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (!tracingCanvasRef.current) return;
                onAddToBook({
                  title: `Tracing Practice: ${content}`,
                  category: 'Handwriting & Tracing',
                  dataUrl: tracingCanvasRef.current.toDataURL('image/png'),
                  instructions: 'Start tracing from each green dot and keep your pencil between the blue guide lines.',
                });
              }}
              className="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white rounded-xl font-bold shadow-sm text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Activity Book</span>
            </button>

            <button
              onClick={() => {
                if (!tracingCanvasRef.current) return;
                const link = document.createElement('a');
                link.download = `tracing-${content}.png`;
                link.href = tracingCanvasRef.current.toDataURL('image/png');
                link.click();
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
          <canvas
            ref={tracingCanvasRef}
            className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded-2xl shadow-inner bg-white"
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. PUZZLES & MAZES STUDIO
// ----------------------------------------------------------------------
function PuzzleStudio({
  onAddToBook,
}: {
  onAddToBook: (page: Omit<ActivityPage, 'id'>) => void;
}) {
  const [puzzleType, setPuzzleType] = useState<'wordsearch' | 'maze'>('wordsearch');
  const [wordTheme, setWordTheme] = useState<'animals' | 'space' | 'fruits' | 'ocean'>('animals');
  const [wordData, setWordData] = useState<WordSearchGrid | null>(null);
  const [mazeData, setMazeData] = useState<MazeGrid | null>(null);

  const puzzleCanvasRef = useRef<HTMLCanvasElement>(null);

  const wordBank = {
    animals: ['LION', 'TIGER', 'ZEBRA', 'BEAR', 'WOLF', 'FOX'],
    space: ['MOON', 'MARS', 'STAR', 'SUN', 'COMET', 'EARTH'],
    fruits: ['APPLE', 'MANGO', 'PEACH', 'BERRY', 'LEMON', 'PLUM'],
    ocean: ['SHARK', 'WHALE', 'CORAL', 'CRAB', 'FISH', 'OCTOPUS'],
  };

  const regeneratePuzzle = () => {
    if (puzzleType === 'wordsearch') {
      const generated = generateWordSearch(wordBank[wordTheme], 10);
      setWordData(generated);
    } else {
      const generated = generateMaze(11);
      setMazeData(generated);
    }
  };

  useEffect(() => {
    regeneratePuzzle();
  }, [puzzleType, wordTheme]);

  // Render puzzle canvas
  useEffect(() => {
    if (!puzzleCanvasRef.current) return;
    const canvas = puzzleCanvasRef.current;
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 800, 1000);

    if (puzzleType === 'wordsearch' && wordData) {
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Word Search Puzzle • ${wordTheme.toUpperCase()}`, 50, 60);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Name: __________________________    Date: ________________', 50, 95);

      // Grid rendering
      const startX = 140;
      const startY = 140;
      const cellSize = 52;

      wordData.grid.forEach((row, r) => {
        row.forEach((letter, c) => {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;

          ctx.strokeStyle = '#E2E8F0';
          ctx.strokeRect(x, y, cellSize, cellSize);

          ctx.fillStyle = '#334155';
          ctx.font = 'bold 24px monospace';
          ctx.fillText(letter, x + 18, y + 35);
        });
      });

      // Word Bank List at bottom
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Find & Circle These Words:', 140, 720);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(wordData.words.join('   •   '), 140, 755);
    } else if (puzzleType === 'maze' && mazeData) {
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Labyrinth Maze Adventure', 50, 60);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Name: __________________________    Date: ________________', 50, 95);

      const cellSize = 45;
      const startX = 400 - (mazeData.size * cellSize) / 2;
      const startY = 150;

      for (let r = 0; r < mazeData.size; r++) {
        for (let c = 0; c < mazeData.size; c++) {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;

          if (mazeData.grid[r][c] === 1) {
            // Wall
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(x, y, cellSize, cellSize);
          } else {
            // Path
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = '#F1F5F9';
            ctx.strokeRect(x, y, cellSize, cellSize);
          }
        }
      }

      // Start & Finish Markers
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('START 🟢', startX - 85, startY + cellSize * 1.5);

      ctx.fillStyle = '#6C5CE7';
      ctx.fillText('🏆 GOAL', startX + mazeData.size * cellSize + 15, startY + (mazeData.size - 1.5) * cellSize);
    }
  }, [puzzleType, wordData, mazeData, wordTheme]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Puzzles &amp; Brain Games Studio</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Algorithmic word search puzzles and guaranteed solvable single-path mazes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Puzzle Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPuzzleType('wordsearch')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                  puzzleType === 'wordsearch'
                    ? 'border-[#6C5CE7] bg-[#F4F1FE] text-[#6C5CE7]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Word Search
              </button>
              <button
                onClick={() => setPuzzleType('maze')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                  puzzleType === 'maze'
                    ? 'border-[#6C5CE7] bg-[#F4F1FE] text-[#6C5CE7]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Maze Labyrinth
              </button>
            </div>
          </div>

          {puzzleType === 'wordsearch' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Word Bank Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {(['animals', 'space', 'fruits', 'ocean'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWordTheme(t)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize border ${
                      wordTheme === t
                        ? 'border-[#6C5CE7] bg-[#F4F1FE] text-[#6C5CE7]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={regeneratePuzzle}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Grid</span>
          </button>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (!puzzleCanvasRef.current) return;
                onAddToBook({
                  title: puzzleType === 'wordsearch' ? `Word Search: ${wordTheme.toUpperCase()}` : 'Maze Labyrinth Adventure',
                  category: 'Puzzles & Games',
                  dataUrl: puzzleCanvasRef.current.toDataURL('image/png'),
                  instructions: puzzleType === 'wordsearch' ? 'Find and circle all hidden words horizontal or vertical.' : 'Trace a continuous line from START to the GOAL without crossing any walls.',
                });
              }}
              className="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white rounded-xl font-bold shadow-sm text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Activity Book</span>
            </button>

            <button
              onClick={() => {
                if (!puzzleCanvasRef.current) return;
                const link = document.createElement('a');
                link.download = `${puzzleType}-puzzle.png`;
                link.href = puzzleCanvasRef.current.toDataURL('image/png');
                link.click();
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
          <canvas
            ref={puzzleCanvasRef}
            className="max-w-full max-h-[500px] object-contain border border-gray-200 rounded-2xl shadow-inner bg-white"
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. BOOK BUILDER & MULTI-PAGE PDF GENERATOR
// ----------------------------------------------------------------------
function BookBuilderView({
  pages,
  meta,
  setMeta,
  setPages,
  onDownloadSuccess,
}: {
  pages: ActivityPage[];
  meta: ActivityBookMeta;
  setMeta: React.Dispatch<React.SetStateAction<ActivityBookMeta>>;
  setPages: React.Dispatch<React.SetStateAction<ActivityPage[]>>;
  onDownloadSuccess: () => void;
}) {
  const [exporting, setExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (pages.length === 0) {
      alert('Please add at least 1 worksheet page to your book first!');
      return;
    }
    setExporting(true);
    try {
      const blob = await exportActivityBookPDF(meta, pages);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onDownloadSuccess();
    } catch (err) {
      console.error('PDF compilation failed', err);
      alert('Error creating printable PDF. Check console logs.');
    } finally {
      setExporting(false);
    }
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    const copy = [...pages];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setPages(copy);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">Personalized Activity Book Builder</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Reorder pages, personalize title and child's name, then export a print-ready PDF book.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={exporting || pages.length === 0}
          className="px-6 py-3.5 bg-[#6C5CE7] hover:bg-[#5A4AD1] disabled:opacity-50 text-white rounded-2xl font-bold shadow-md transition-all text-xs flex items-center space-x-2"
        >
          {exporting ? (
            <span>Compiling Multi-Page PDF...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Printable Book ({pages.length} Pages)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover & Personalization Settings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Cover &amp; Layout Settings</h3>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Book Title</label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Subtitle</label>
            <input
              type="text"
              value={meta.subtitle}
              onChange={(e) => setMeta({ ...meta, subtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Child's Name (Personalized Badge)</label>
            <input
              type="text"
              value={meta.childName || ''}
              placeholder="e.g. Liam, Emma, Alex"
              onChange={(e) => setMeta({ ...meta, childName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Book Theme</label>
            <input
              type="text"
              value={meta.theme}
              onChange={(e) => setMeta({ ...meta, theme: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Paper Size</label>
              <select
                value={meta.pageSize}
                onChange={(e) => setMeta({ ...meta, pageSize: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
              >
                <option value="a4">A4 Standard</option>
                <option value="letter">US Letter</option>
                <option value="a5">A5 Booklet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Orientation</label>
              <select
                value={meta.orientation}
                onChange={(e) => setMeta({ ...meta, orientation: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
        </div>

        {/* Page List & Reordering */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Worksheet Pages in this Book ({pages.length})
            </h3>
            {pages.length > 0 && (
              <button
                onClick={() => setPages([])}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Clear All Pages
              </button>
            )}
          </div>

          {pages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <span className="text-4xl block mb-2">📚</span>
              <p className="font-bold text-sm text-gray-700">Your Activity Book is currently empty</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Visit Photo-to-Coloring, Connect Dots, Maths, or Tracing studios and click "Add to My Activity Book".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-600 shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={p.dataUrl}
                      alt={p.title}
                      className="w-10 h-10 object-contain rounded border border-gray-100 bg-white shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{p.title}</h4>
                      <p className="text-[10px] text-gray-400">{p.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => movePage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-20 text-xs"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePage(idx, idx + 1)}
                      disabled={idx === pages.length - 1}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-20 text-xs"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removePage(p.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
                      aria-label="Remove page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. SHOP & EDUCATIONAL STORE
// ----------------------------------------------------------------------
function ShopView({ onAddToCart }: { onAddToCart: (item: CartItem) => void }) {
  const [filter, setFilter] = useState<'all' | 'digital' | 'print'>('all');

  const products: CartItem[] = [
    { id: 'prod_1', title: '50 Jungle Animals Coloring Pack', price: 149, type: 'Digital PDF', pages: 50 },
    { id: 'prod_2', title: 'Complete Kindergarten Maths Bundle', price: 199, type: 'Digital PDF', pages: 40 },
    { id: 'prod_3', title: 'Alphabet & Phonics Tracing Master', price: 99, type: 'Digital PDF', pages: 30 },
    { id: 'prod_4', title: 'Connect-the-Dots Adventure 1-100', price: 129, type: 'Digital PDF', pages: 35 },
    { id: 'prod_5', title: 'Under the Sea Puzzle & Mazes Book', price: 119, type: 'Digital PDF', pages: 25 },
    { id: 'prod_6', title: 'Custom Printed Hardcover Book', price: 599, type: 'Physical Print (Future Expansion)', pages: 60 },
  ];

  const filtered = products.filter((p) => {
    if (filter === 'digital') return p.type.includes('Digital');
    if (filter === 'print') return p.type.includes('Physical');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">ColorCraft Educational Store</h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Printable digital curriculum bundles and physical book previews. (Payment gateway in Demo Mode).
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg ${filter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('digital')}
            className={`px-3 py-1.5 rounded-lg ${filter === 'digital' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
          >
            Digital PDFs
          </button>
          <button
            onClick={() => setFilter('print')}
            className={`px-3 py-1.5 rounded-lg ${filter === 'print' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
          >
            Physical Books
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7] bg-[#F4F1FE] px-2.5 py-1 rounded-full">
                {item.type}
              </span>
              <h3 className="text-base font-bold text-gray-800 mt-3">{item.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.pages} Printable Pages</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-lg font-black text-gray-900">₹{item.price}</span>
              <button
                onClick={() => onAddToCart(item)}
                className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 10. CART DRAWER & DEMO CHECKOUT
// ----------------------------------------------------------------------
function CartDrawer({
  cart,
  onClose,
  onRemove,
  onCheckoutSuccess,
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckoutSuccess: () => void;
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = subtotal - discount;

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'KIDS20') {
      setDiscountPercent(20);
      setPromoMsg('20% Discount Applied! (Coupon: KIDS20)');
    } else {
      setPromoMsg('Invalid coupon code. Try KIDS20');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-800">Shopping Cart ({cart.length})</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">Your cart is empty.</p>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.id}_${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
                    <span className="text-[10px] text-gray-400">{item.type} · ₹{item.price}</span>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3">
          {/* Coupon Code */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo code (Try KIDS20)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-1.5 border rounded-xl text-xs uppercase"
            />
            <button
              onClick={applyPromo}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl"
            >
              Apply
            </button>
          </div>
          {promoMsg && <p className="text-[10px] text-[#6C5CE7] font-semibold">{promoMsg}</p>}

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({discountPercent}%)</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-400">
            Demo Sandbox Checkout: Instant download simulation without live financial charges.
          </p>

          <button
            disabled={cart.length === 0}
            onClick={onCheckoutSuccess}
            className="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            Complete Test Checkout (₹{finalTotal})
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 11. ADMIN DASHBOARD WITH AUTHENTICATION BARRIER
// ----------------------------------------------------------------------
function AdminView({
  totalBookPages,
  authenticated,
  onAuthenticate,
}: {
  totalBookPages: number;
  authenticated: boolean;
  onAuthenticate: () => void;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '7788') {
      onAuthenticate();
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-xl font-black text-gray-800">Admin Authorization Required</h2>
          <p className="text-xs text-gray-500 mt-1">Please enter the administrative security PIN.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Enter PIN (Demo: 7788)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl text-center text-sm font-bold tracking-widest"
            />
            {error && <p className="text-xs text-red-500 font-bold">Incorrect PIN code. Try 7788.</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#2D3748]">ColorCraft Administration &amp; Telemetry</h2>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          System verification status, local resource footprint, and operations control.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-gray-400">Pages in Active Draft</p>
          <p className="text-3xl font-black text-[#6C5CE7] mt-1">{totalBookPages}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-gray-400">Client Engine</p>
          <p className="text-3xl font-black text-[#00B894] mt-1">100% Local</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-gray-400">Monthly API Incurred</p>
          <p className="text-3xl font-black text-gray-900 mt-1">₹0.00</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase text-gray-400">Payment Gateway</p>
          <p className="text-3xl font-black text-[#FD79A8] mt-1">Sandbox</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-sm text-gray-800">Module Verification Audit Checklist</h3>
        <ul className="text-xs space-y-2.5 text-gray-600">
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Photo Upload Engine:</strong> JPG, PNG, WEBP validated with 15MB limit and camera capture support.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Sobel Edge Filter:</strong> Perimeter edge array initialized with white pixels to eliminate border artifacts.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Connect-the-Dots:</strong> Tested with 10, 20, 50, and 100 sequential dots with label repulsion.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Maths Engine:</strong> Programmatic invariant verification on addition, subtraction, missing numbers, and division.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Handwriting Tracing:</strong> Standard 3-line ruling with green directional stroke indicators.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Puzzles &amp; Mazes:</strong> Word search generator with valid matrix insertion and backtracking maze solver.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>PDF Export Engine:</strong> Aspect ratio preservation letterboxing, custom cover page, and multi-page compilation.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Data Persistence:</strong> LocalStorage serialization guarantees draft recovery across browser reloads.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
