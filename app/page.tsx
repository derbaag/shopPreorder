"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, ShoppingBag, User, Heart, ArrowLeft, Plus, Minus, Upload, Check, Clock, ChevronDown, X, Ruler, Truck, Shield, Leaf, Package, CreditCard, Factory, MapPin } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null as any;

type Page = 'login' | 'products' | 'detail' | 'checkout' | 'payment' | 'success';
type Category = 'ทั้งหมด' | 'เสื้อ' | 'หมวก' | 'ผ้าพัฟ' | 'ผ้าเช็ดหน้า';
type ProductStatus = 'preorder' | 'instock' | 'comingsoon' | 'closed';
type StatusFilter = 'ทั้งหมด' | 'preorder' | 'instock' | 'comingsoon' | 'closed';
type Sort = 'ขายดี' | 'มาใหม่' | 'แนะนำ' | 'ราคา';
type Size = 'S' | 'M' | 'L' | 'XL';

interface Product {
  id: string; name: string; nameEn: string; price: number; category: Category; status: ProductStatus;
  preorderEndsAt?: number; daysLeft: number; ordered: number; stock?: number;
  image: string; gallery: string[]; material: string; colors: { name: string; hex: string }[];
}

const nowBase = Date.now();
const toFuture = (d:number,h:number,m:number,s:number)=> nowBase + ((d*24+h)*3600+m*60+s)*1000;

const PRODUCTS_FALLBACK: Product[] = [
  { id:'1', name:'เสื้อเดินป่า Ultralight', nameEn:'Trail Ultralight Tee', price:590, category:'เสื้อ', status:'preorder', preorderEndsAt:toFuture(5,14,32,10), daysLeft:5, ordered:128, image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=700&fit=crop','https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=700&fit=crop'], material:'Polyester Recycled 100%', colors:[{name:'Forest',hex:'#1E3A2E'},{name:'Sand',hex:'#D9C5A0'}]},
  { id:'2', name:'หมวกบักเก็ตเดินป่า', nameEn:'Bucket Trail Hat', price:390, category:'หมวก', status:'preorder', preorderEndsAt:toFuture(3,2,15,40), daysLeft:3, ordered:86, image:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&h=700&fit=crop'], material:'Nylon Ripstop', colors:[{name:'Moss',hex:'#4A5D4E'}]},
  { id:'3', name:'ผ้าบัฟลายป่า', nameEn:'Forest Buff', price:250, category:'ผ้าพัฟ', status:'preorder', preorderEndsAt:toFuture(7,8,5,22), daysLeft:7, ordered:212, image:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=700&fit=crop'], material:'Microfiber', colors:[{name:'Forest',hex:'#1E3A2E'}]},
  { id:'4', name:'ผ้าเช็ดหน้าวินเทจ', nameEn:'Vintage Handkerchief', price:180, category:'ผ้าเช็ดหน้า', status:'instock', daysLeft:0, ordered:94, stock:24, image:'https://images.unsplash.com/photo-1590732596287-05ff25b6588f?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1590732596287-05ff25b6588f?w=600&h=700&fit=crop'], material:'Organic Cotton', colors:[{name:'Ecru',hex:'#F5F1EB'}]},
  { id:'5', name:'เสื้อแขนยาวกันแดด', nameEn:'Sun Block Longsleeve', price:690, category:'เสื้อ', status:'instock', daysLeft:0, ordered:156, stock:12, image:'https://images.unsplash.com/photo-1620799139652-715239583449?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1620799139652-715239583449?w=600&h=700&fit=crop'], material:'Merino Blend', colors:[{name:'Stone',hex:'#9A8C7D'}]},
  { id:'6', name:'หมวกแก๊ปผ้าฝ้าย', nameEn:'Cotton Trail Cap', price:350, category:'หมวก', status:'comingsoon', daysLeft:0, ordered:0, image:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=700&fit=crop'], material:'Cotton Canvas', colors:[{name:'Khaki',hex:'#C2B280'}]},
  { id:'7', name:'กางเกงเดินป่า 3Season', nameEn:'3Season Trek Pants', price:890, category:'เสื้อ', status:'closed', daysLeft:0, ordered:203, image:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=700&fit=crop', gallery:['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=700&fit=crop'], material:'Nylon Stretch', colors:[{name:'Olive',hex:'#4A5D4E'}]},
];

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'login', label: 'เข้าสู่ระบบ' }, { id: 'products', label: 'สินค้า' }, { id: 'detail', label: 'รายละเอียด' },
  { id: 'checkout', label: 'ตะกร้า' }, { id: 'payment', label: 'ชำระเงิน' }, { id: 'success', label: 'สำเร็จ' },
];

function getActiveStep(page: Page): number {
  if (page === 'detail' || page === 'products') return 1;
  if (page === 'checkout' || page === 'payment') return 2;
  if (page === 'success') return 3;
  return 0;
}

function PreorderStepper({ activeStep }: { activeStep: number }) {
  const steps = [
    { id: 1, label: 'เลือกสินค้า', desc: 'ไซส์ • สี • จำนวน', Icon: ShoppingBag },
    { id: 2, label: 'ชำระเงิน', desc: 'QR • โอน', Icon: CreditCard },
    { id: 3, label: 'รอผลิต', desc: 'ผลิตตามออเดอร์', Icon: Factory },
    { id: 4, label: 'จัดส่ง', desc: '25 ส.ค. 2026', Icon: Truck },
  ];
  return (
    <div className="sticky top-[128px] lg:top-[136px] z-30 -mx-6 lg:mx-0 mb-10">
      <div className="bg-white border-y lg:border border-black/[0.06] lg:rounded-[24px] shadow-[0_16px_48px_rgba(30,58,46,0.12)] px-6 lg:px-9 py-7 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#1E3A2E] text-white grid place-items-center"><Package className="w-6 h-6" /></div>
            <h3 className="text-[17px] font-bold">ขั้นตอนการ Pre-order</h3>
          </div>
          <span className="text-[13px] font-bold px-3 py-1.5 rounded-full bg-[#F5F1EB] border">{activeStep}/4</span>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-2">
          {steps.map(s => {
            const state = s.id < activeStep ? 'completed' : s.id === activeStep ? 'current' : 'upcoming';
            return (
              <div key={s.id} className="flex flex-col items-center text-center">
                <div className={`w-[64px] h-[64px] rounded-full grid place-items-center border-2 ${state==='completed'?'bg-[#1E3A2E] text-white':state==='current'?'bg-[#FF6B2C] text-white':'bg-[#F5F1EB] text-black/25'}`}>
                  {state==='completed'?<Check className="w-6 h-6"/>:<s.Icon className="w-6 h-6"/>}
                </div>
                <p className="mt-3 text-[14px] font-bold">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}


function getRemainingSeconds(product: Product, now: number): number {
  if (product.status!== 'preorder' ||!product.preorderEndsAt) return 0;
  const diff = Math.floor((product.preorderEndsAt - now) / 1000);
  return Math.max(0, diff);
}
function formatLiveCountdown(totalSec: number): string {
  if (totalSec <= 0) return 'หมดเวลาแล้ว';
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (d > 0) return `เหลือ ${d}วัน ${hh}:${mm}:${ss}`;
  return `เหลือ ${hh}:${mm}:${ss}`;
}
function formatDetailCountdown(totalSec: number): { d: number; h: string; m: string; s: string; isOver: boolean } {
  if (totalSec <= 0) return { d: 0, h: '00', m: '00', s: '00', isOver: true };
  const d = Math.floor(totalSec / 86400);
  const h = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return { d, h, m, s, isOver: false };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS_FALLBACK[0]);

  // --- Real-time Supabase sync ---
  useEffect(() => {
    const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(null), 2500); };
const fetchProducts = async () => {
  if (!supabase) return;
  const { data, error } = await supabase.from('products').select('*').order('id');
  setIsLoadingProducts(false);
  if (!error && data && data.length > 0) {
    const mapped: Product[] = data.map((p:any) => ({
      id: p.id,
      name: p.name,
      nameEn: p.name_en || p.name,
      price: Number(p.price),
      category: (p.category || 'เสื้อ') as Category,
      status: p.status as ProductStatus,
      daysLeft: 5,
      ordered: Number(p.ordered_count) || Math.floor(Math.random()*120)+20,
      stock: Number(p.stock)||0,
      image: p.image || p.image_url || "",
      gallery: p.gallery?.length? p.gallery : [p.image || p.image_url],
      material: p.material || 'วัสดุธรรมชาติ',
      colors: [{name:'Default', hex:'#1E3A2E'}],
      // ใช้ค่าจริงจาก DB ถ้าไม่มีให้ปิดนับเลย
      preorderEndsAt: p.preorder_ends_at
       ? new Date(p.preorder_ends_at).getTime()
        : null,
    }));
    setProducts(mapped);
    setSelectedProduct(prev => {
      const found = mapped.find(m => m.id === prev.id);
      return found || mapped[0];
    });
  }
};
    fetchProducts();
    if (!supabase) return;
    const channel = supabase.channel('products-realtime').on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>{ fetchProducts(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  const [activeCategory, setActiveCategory] = useState<Category>('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ทั้งหมด');
  const [sort, setSort] = useState<Sort>('ขายดี');
  const [cartQty, setCartQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Size>('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'confirmed'>('idle');
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [timer, setTimer] = useState(899);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [openAccordion, setOpenAccordion] = useState<string | null>('material');
  const [activeThumb, setActiveThumb] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Google Auth - check session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setUser({ email: data.session.user.email });
        setCurrentPage('products');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        setUser({ email: session.user.email });
        setCurrentPage('products');
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentPage('login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Timer for payment page
  useEffect(() => {
    if (currentPage!== 'payment') return;
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [currentPage]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'ทั้งหมด' || p.category === activeCategory;
    const matchStatus = statusFilter === 'ทั้งหมด' || p.status === statusFilter;
    return matchCat && matchStatus;
  }).sort((a, b) => {
    if (sort === 'ราคา') return a.price - b.price;
    if (sort === 'มาใหม่') return (b.preorderEndsAt || 0) - (a.preorderEndsAt || 0);
    if (sort === 'ขายดี') return b.ordered - a.ordered;
    return 0;
  });

  const handlePreorder = (p: Product) => {
    if (p.status === 'comingsoon') return;
    setSelectedProduct(p);
    setActiveThumb(0);
    setCurrentPage('detail');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSlipPreview(url);
  };

  const categories: Category[] = ['ทั้งหมด', 'เสื้อ', 'หมวก', 'ผ้าพัฟ', 'ผ้าเช็ดหน้า'];
  const statusTabs: { id: StatusFilter; label: string; count?: number }[] = [
    { id: 'ทั้งหมด', label: 'ทั้งหมด' },
    { id: 'preorder', label: 'Pre-order' },
    { id: 'instock', label: 'พร้อมส่ง' },
    { id: 'comingsoon', label: 'เร็วๆ นี้' },
    { id: 'closed', label: 'ปิดรับแล้ว' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1EB] text-[#1E3A2E] antialiased selection:bg-[#FF6B2C] selection:text-white text-[18px] leading-relaxed" style={{ fontFamily: "Tahoma, sans-serif", fontSize: '18px' }}>
      <style>{`
          * { font-family: Tahoma, sans-serif !important; }
          html { font-size: 18px; scroll-behavior: smooth; }
          html, body { font-family: Tahoma, sans-serif !important; overflow-y: auto; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #F5F1EB; }
          ::-webkit-scrollbar-thumb { background: #1E3A2E; border-radius: 999px; border: 2px solid #F5F1EB; }
          ::-webkit-scrollbar-thumb:hover { background: #FF6B2C; }
          button, input, textarea, select { font-family: Tahoma, sans-serif !important; }
          .preorder-nowrap { white-space: nowrap !important; display: inline-flex !important; align-items: center; gap: 4px !important; vertical-align: middle; }
          .badge-nowrap { white-space: nowrap !important; display: inline-flex !important; align-items: center; gap: 4px !important; }
          .rounded-full { white-space: nowrap; }
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .skeleton { position: relative; overflow: hidden; background: #EDE8E0; }
          .skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 1.5s infinite; }
          .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #1E3A2E #F5F1EB; }
        `}</style>

      {/* TOP HEADER NAVIGATION - BIGGER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b px-6 h- flex items-center justify-between">
        <button onClick={()=>setCurrentPage('products')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E3A2E] text-white grid place-items-center font-bold">DB</div>
          <span className="font-bold tracking-widest">DERBAAG</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={()=>setCurrentPage('checkout')} className="relative w-11 h-11 rounded-full bg-[#F5F1EB] grid place-items-center">
            <ShoppingBag className="w-5 h-5"/>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B2C] text-white text- grid place-items-center font-bold">{cartCount}</span>
          </button>
          <div className="flex items-center gap-3 bg-[#F5F1EB] pl-1 pr-4 h-11 rounded-full border border-black/5">
            <div className="w-9 h-9 rounded-full bg-[#1E3A2E] text-white grid place-items-center font-bold text-">
              {user?.email?.[0]?.toUpperCase() || <User className="w-5 h-5"/>}
            </div>
            <div className="text-left leading-tight">
              <p className="text- font-bold max-w- truncate">{user?.email || 'Guest'}</p>
            </div>
          </div>
          <button onClick={async()=>{await supabase?.auth.signOut(); setUser(null); setCurrentPage('login');}} className="text- font-bold px-3 h-11 rounded-full bg-black text-white">Logout</button>
        </div>
      </header>

      {/* LOGIN PAGE */}
      {currentPage === 'login' && (
        <div className="min-h-[calc(100vh-144px)] flex flex-col lg:flex-row">
          {/* Left - Brand */}
          <div className="relative flex-1 bg-[#1E3A2E] text-[#F5F1EB] p-10 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[480px] lg:min-h-[calc(100vh-144px)]">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            <div className="absolute -top-24 -left-24 w-[520px] h-[520px] bg-[#2A5A40] rounded-full blur-[80px] opacity-60" />
            <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-[#FF6B2C]/20 rounded-full blur-[70px]" />
            <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000&h=1200&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" alt="hiking" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A2E] via-[#1E3A2E]/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[13px] tracking-wide font-bold whitespace-nowrap preorder-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>● <span className="whitespace-nowrap">LIVE PRE-ORDER รอบที่ 08</span></div>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-[13px] tracking-[0.28em] opacity-60 mb-6 font-bold">OUTDOOR GEAR • PRE-ORDER • MADE FOR TRAIL</p>
              <h1 className="text-[56px] lg:text-[80px] leading-[0.9] font-bold tracking-[-0.03em]">
                GEAR<br />FOR THE<br />
                <span className="text-[#FF6B2C]">TRAIL</span>
              </h1>
              <p className="mt-8 text-[19px] leading-relaxed opacity-80 max-w-[38ch] font-medium">
                ออกแบบเพื่อคนเดินป่า • ผ้าที่เบา แห้งไว เป็นมิตรกับโลก<br />พรีออเดอร์รอบนี้ ผลิตตามจำนวนจริง ลดขยะ
              </p>
              <div className="mt-8 flex gap-3">
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[13px] tracking-wide font-bold">RECYCLED FABRIC</span>
                <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[13px] tracking-wide font-bold">SMALL BATCH</span>
              </div>
            </div>
          </div>

          {/* Right - Login Card */}
          <div className="flex-1 bg-[#F5F1EB] flex items-center justify-center p-8 lg:p-14">
            <div className="w-full max-w-[480px]">
              <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(30,58,46,0.10)] border border-black/[0.04] p-8 lg:p-10">
                <div className="w-14 h-14 rounded-full bg-[#1E3A2E] text-white grid place-items-center mb-8">
                  <Leaf className="w-7 h-7" />
                </div>
                <h2 className="text-[36px] font-bold tracking-[-0.02em] leading-[1.05]">ยินดีต้อนรับ<br />กลับมาเดินป่า</h2>
                <p className="text-[17px] text-black/60 mt-4 leading-relaxed font-medium">เข้าสู่ระบบเพื่อดูสินค้าพรีออเดอร์รอบล่าสุด และติดตามสถานะการผลิต</p>

                <button
                  onClick={async () => {
                    if (typeof supabase !== 'undefined' && supabase) {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: window.location.origin
                        }
                      });
                      if (error) alert(error.message);
                    } else {
                      setCurrentPage('products');
                    }
                  }}
                  className="mt-10 w-full h-[56px] rounded-full bg-white border border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center gap-3 font-bold text-[17px] hover:bg-black/[0.02] transition"
                >
                  <span className="w-7 h-7 rounded-full bg-white border shadow-sm grid place-items-center">
                    <span className="text-[16px] font-bold bg-gradient-to-br from-[#4285F4] to-[#EA4335] bg-clip-text text-transparent">G</span>
                  </span>
                  เข้าสู่ระบบด้วย Google
                </button>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-black/10" />
                  <span className="text-[13px] text-black/30 tracking-wide font-bold">หรือ</span>
                  <div className="h-px flex-1 bg-black/10" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <input placeholder="อีเมล" className="h-[52px] px-5 rounded-full bg-[#F5F1EB] border border-black/5 text-[17px] outline-none focus:border-[#1E3A2E]/20 font-medium" />
                  <input placeholder="รหัสผ่าน" type="password" className="h-[52px] px-5 rounded-full bg-[#F5F1EB] border border-black/5 text-[17px] outline-none focus:border-[#1E3A2E]/20 font-medium" />
                </div>

                <button onClick={() => setCurrentPage('products')} className="mt-6 w-full h-[52px] rounded-full bg-[#1E3A2E] text-white text-[18px] font-bold hover:bg-black transition shadow-md">เข้าสู่ระบบ</button>

                <p className="mt-8 text-center text-[13px] text-black/50 leading-relaxed">เข้าสู่ระบบแล้วไปหน้า Product • ข้อมูลของคุณปลอดภัย</p>
              </div>

              <div className="mt-8 flex justify-center gap-2 text-[13px] text-black/40 font-medium">
                <span>© 2026 DERBAAG</span>
                <span>•</span>
                <span>Pre-order • Made to order</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT LISTING */}
      {currentPage === 'products' && (
        <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-8 lg:py-12 pb-28">
          <div className="mb-8 p-4 rounded-[16px] bg-[#1E3A2E] text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[15px] font-medium"><MapPin className="w-5 h-5 text-[#FF6B2C] shrink-0" /> <span className="preorder-nowrap whitespace-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>Pre-order รอบที่ 08</span> <span className="whitespace-nowrap">เปิดถึง 15 ส.ค. • ผลิตตามออเดอร์จริง</span></div>
            <div className="flex items-center gap-2 text-[13px]"><span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 font-bold whitespace-nowrap badge-nowrap">RECYCLED</span><span className="px-3 py-1.5 rounded-full bg-[#FF6B2C] font-bold whitespace-nowrap badge-nowrap">เหลือ 5 วัน</span></div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-[40px] lg:text-[52px] font-bold tracking-[-0.03em] leading-[0.92] preorder-title-fix preorder-nowrap whitespace-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>Pre-order รอบที่ 08</h1>
              <p className="mt-4 text-[17px] text-black/60 max-w-[44ch] leading-relaxed font-medium">พรีออเดอร์เสื้อผ้าเดินป่า ผลิตตามจำนวนจริง • ส่งมอบภายใน ส.ค. 2026 • วัสดุรีไซเคิล เป็นมิตรกับป่า</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[13px] tracking-wide text-black/50 font-bold">SORT</span>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="appearance-none h-[52px] pl-6 pr-12 rounded-full bg-white border border-black/5 text-[17px] font-bold outline-none shadow-sm">
                  <option>ขายดี</option>
                  <option>มาใหม่</option>
                  <option>แนะนำ</option>
                  <option>ราคา</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              </div>
            </div>
          </div>

          {/* STATUS FILTER */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[13px] font-bold tracking-[0.14em] text-black/40">สถานะสินค้า</span>
              <span className="h-px flex-1 bg-black/5" />
            </div>
            <div className="flex gap-2.5 overflow-auto pb-2 scrollbar-none -mx-1 px-1">
              {statusTabs.map(tab => {
                const active = statusFilter === tab.id;
                const count = tab.id === 'ทั้งหมด' ? products.length : products.filter(p => p.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`shrink-0 h-[48px] px-5 rounded-full text-[15px] font-bold border transition flex items-center gap-2 ${active ? 'bg-[#1E3A2E] text-white border-[#1E3A2E] shadow-md' : 'bg-white border-black/5 text-black/60 hover:border-black/15 hover:text-black'}`}
                  >
                    {tab.label}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/15 text-white' : 'bg-black/5 text-black/50'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div className="mt-5 flex gap-3 overflow-auto pb-3 -mx-1 px-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`shrink-0 h-[44px] px-6 rounded-full text-[14px] font-bold border transition ${activeCategory === c ? 'bg-[#F5F1EB] text-[#1E3A2E] border-[#1E3A2E] shadow-sm' : 'bg-white border-black/5 text-black/50 hover:text-black hover:border-black/10'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8">
            {filtered.map(p => {
              const remainingSec = getRemainingSeconds(p, nowTick);
              const isExpired = p.status === 'preorder' && remainingSec <= 0;
              const effectiveStatus: ProductStatus = isExpired ? 'closed' : p.status;
              const isClickable = effectiveStatus !== 'comingsoon';
              return (
                <div
                  key={p.id}
                  onClick={() => isClickable && handlePreorder(p)}
                  className={`group bg-white rounded-[24px] border border-black/[0.05] overflow-hidden shadow-[0_10px_36px_rgba(30,58,46,0.08)] transition-all relative
                    ${isClickable ? 'hover:shadow-[0_20px_60px_rgba(30,58,46,0.14)] hover:-translate-y-1 cursor-pointer' : 'opacity-[0.6] cursor-not-allowed'}
                  `}
                >
                  <div className="relative h-[320px] bg-[#F5F1EB] overflow-hidden">
                    <img src={p.image} alt={p.name} className={`w-full h-full object-cover transition duration-700 ${isClickable ? 'group-hover:scale-[1.04]' : 'grayscale-[0.15]'}`} />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                      {effectiveStatus === 'preorder' && (
                        <>
                          <span className="px-3.5 py-1.5 rounded-full bg-[#FF6B2C] text-white text-[11px] font-bold tracking-[0.12em] shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>PRE-ORDER</span>
                          <span className="px-3 py-1.5 rounded-full bg-[#1E3A2E] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm border border-white/10 whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>
                            <Clock className="w-3.5 h-3.5" /> {formatLiveCountdown(remainingSec)}
                          </span>
                        </>
                      )}
                      {effectiveStatus === 'instock' && (
                        <>
                          <span className="px-3.5 py-1.5 rounded-full bg-[#12A150] text-white text-[11px] font-bold tracking-[0.12em] shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>พร้อมส่ง</span>
                          <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-[#1E3A2E] text-[12px] font-bold border border-black/5 shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>มีในสต็อก {p.stock} ชิ้น</span>
                        </>
                      )}
                      {effectiveStatus === 'comingsoon' && (
                        <>
                          <span className="px-3.5 py-1.5 rounded-full bg-[#8A8A8A] text-white text-[11px] font-bold tracking-[0.12em] shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>COMING SOON</span>
                          <span className="px-3 py-1.5 rounded-full bg-white text-black/60 text-[12px] font-bold border border-black/5 shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>เร็วๆ นี้</span>
                        </>
                      )}
                      {effectiveStatus === 'closed' && (
                        <>
                          <span className="px-3.5 py-1.5 rounded-full bg-[#2B2B2B] text-white text-[11px] font-bold tracking-[0.12em] shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>ปิดรับแล้ว</span>
                          <span className="px-3 py-1.5 rounded-full bg-white text-[#8A3A3A] text-[12px] font-bold border border-black/5 shadow-sm whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>ปิดรับ Pre-order</span>
                        </>
                      )}
                    </div>
                    <button onClick={(e)=>{e.stopPropagation();}} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-black/5 grid place-items-center opacity-0 group-hover:opacity-100 transition hover:bg-white">
                      <Heart className="w-5 h-5" />
                    </button>
                    {effectiveStatus === 'comingsoon' && (
                      <div className="absolute inset-0 bg-[#F5F1EB]/65 backdrop-blur-[1px] grid place-items-center">
                        <div className="bg-white/90 border border-black/5 px-5 py-3 rounded-full shadow-md flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#8A8A8A] animate-pulse" />
                          <span className="text-[13px] font-bold tracking-wide text-black/60">เปิดตัวเร็วๆ นี้ • คลิกไม่ได้</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 lg:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold leading-tight">{p.name}</h3>
                        <p className="text-[13px] text-black/50 mt-1 font-medium">{p.nameEn}</p>
                      </div>
                      <span className="text-[20px] font-bold">฿{p.price}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between min-h-[22px]">
                      {effectiveStatus === 'preorder' && <span className="text-[14px] text-black/60 font-medium">สั่งแล้ว {p.ordered} ชิ้น</span>}
                      {effectiveStatus === 'instock' && <span className="text-[14px] text-[#12A150] font-bold">คงเหลือ {p.stock} ชิ้น • ไม่มี countdown</span>}
                      {effectiveStatus === 'comingsoon' && <span className="text-[14px] text-black/40 font-medium">ยังไม่เปิดขาย</span>}
                      {effectiveStatus === 'closed' && <span className="text-[14px] text-black/50 font-medium">รอเปิดรอบใหม่</span>}
                      {effectiveStatus === 'preorder' && <div className="h-2 w-[110px] rounded-full bg-black/5 overflow-hidden"><div className="h-full bg-[#FF6B2C]" style={{ width: `${Math.min(92, 20 + p.ordered / 3)}%` }} /></div>}
                      {effectiveStatus === 'instock' && <div className="h-2 w-[110px] rounded-full bg-[#E6F4EA] overflow-hidden"><div className="h-full bg-[#12A150]" style={{ width: `${Math.min(100, (p.stock||0)*4)}%` }} /></div>}
                    </div>
                    {effectiveStatus === 'preorder' && (
                      <button onClick={(e)=>{e.stopPropagation(); handlePreorder(p);}} className="mt-6 w-full h-[52px] rounded-full bg-[#FF6B2C] text-white text-[18px] font-bold hover:bg-[#E85F27] transition shadow-[0_8px_24px_rgba(255,107,44,0.28)]">สั่ง Pre-order</button>
                    )}
                    {effectiveStatus === 'instock' && (
                      <button onClick={(e)=>{e.stopPropagation(); handlePreorder(p);}} className="mt-6 w-full h-[52px] rounded-full bg-[#1E3A2E] text-white text-[18px] font-bold hover:bg-black transition shadow-[0_8px_24px_rgba(30,58,46,0.25)]">หยิบใส่ตะกร้า</button>
                    )}
                    {effectiveStatus === 'comingsoon' && (
                      <button disabled className="mt-6 w-full h-[52px] rounded-full bg-[#EDEDED] text-black/35 text-[18px] font-bold cursor-not-allowed border border-black/5">เร็วๆ นี้</button>
                    )}
                    {effectiveStatus === 'closed' && (
                      <button disabled className="mt-6 w-full h-[52px] rounded-full bg-[#2B2B2B] text-white/70 text-[18px] font-bold cursor-not-allowed">ปิดรับ Pre-order</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="mt-16 text-center py-12 bg-white rounded-[24px] border border-black/5">
              <p className="text-[18px] font-bold">ไม่พบสินค้าในหมวดนี้</p>
              <p className="text-[14px] text-black/50 mt-2">ลองเปลี่ยนตัวกรองสถานะหรือหมวดหมู่</p>
              <button onClick={()=>{setStatusFilter('ทั้งหมด'); setActiveCategory('ทั้งหมด');}} className="mt-5 h-11 px-7 rounded-full bg-[#1E3A2E] text-white text-[15px] font-bold">ล้างตัวกรอง</button>
            </div>
          )}
        </main>
      )}

      {/* PRODUCT DETAIL - BIG */}
      {currentPage === 'detail' && (
        <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-8 lg:py-10 pb-28">
          <PreorderStepper activeStep={1} />
          <button onClick={() => setCurrentPage('products')} className="inline-flex items-center gap-2.5 text-[17px] font-semibold text-black/60 hover:text-black mb-8"><ArrowLeft className="w-5 h-5" /> กลับไปหน้าสินค้า</button>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="grid grid-cols-[84px_1fr] lg:grid-cols-[100px_1fr] gap-4">
              <div className="flex flex-col gap-4">
                {selectedProduct.gallery.map((g, i) => (
                  <button key={i} onClick={() => setActiveThumb(i)} className={`h-[88px] lg:h-[104px] rounded-[16px] overflow-hidden border-2 bg-white ${activeThumb === i ? 'border-[#1E3A2E] ring-4 ring-[#1E3A2E]/10' : 'border-black/5'}`}>
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="relative rounded-[24px] overflow-hidden bg-white border border-black/[0.05] h-[520px] lg:h-[720px]">
                <img src={selectedProduct.gallery[activeThumb]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                {(() => {
                  const rem = getRemainingSeconds(selectedProduct, nowTick);
                  const eff = (selectedProduct.status === 'preorder' && rem <=0) ? 'closed' : selectedProduct.status;
                  return (
                    <div className="absolute top-5 left-5 flex flex-col gap-2">
                      {eff === 'preorder' && <span className="px-4 py-1.5 rounded-full bg-[#FF6B2C] text-white text-[13px] font-bold tracking-wide shadow whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>PRE-ORDER • {formatLiveCountdown(rem)}</span>}
                      {eff === 'instock' && <span className="px-4 py-1.5 rounded-full bg-[#12A150] text-white text-[13px] font-bold tracking-wide shadow whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>พร้อมส่ง • มี {selectedProduct.stock} ชิ้น</span>}
                      {eff === 'comingsoon' && <span className="px-4 py-1.5 rounded-full bg-[#8A8A8A] text-white text-[13px] font-bold tracking-wide shadow whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>COMING SOON • เร็วๆ นี้</span>}
                      {eff === 'closed' && <span className="px-4 py-1.5 rounded-full bg-[#2B2B2B] text-white text-[13px] font-bold tracking-wide shadow whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>ปิดรับแล้ว • รอเปิดรอบใหม่</span>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Info */}
            <div className="lg:sticky lg:top-[160px] h-fit">
              {(() => {
                const rem = getRemainingSeconds(selectedProduct, nowTick);
                const cd = formatDetailCountdown(rem);
                const eff = (selectedProduct.status === 'preorder' && rem <=0) ? 'closed' as ProductStatus : selectedProduct.status;
                const isDisabled = eff === 'comingsoon' || eff === 'closed';
                return (
                  <>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[13px] tracking-[0.2em] text-black/50 font-bold whitespace-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>
                    <span className="whitespace-nowrap">{selectedProduct.category} •</span> <span className="preorder-nowrap whitespace-nowrap">{eff === 'preorder' ? 'PRE-ORDER 1-15 ส.ค.' : eff === 'instock' ? 'พร้อมส่งทันที' : eff === 'comingsoon' ? 'เปิดตัวเร็วๆ นี้' : 'ปิดรับแล้ว'}</span>
                  </p>
                  <h1 className="mt-3 text-[36px] lg:text-[42px] font-bold leading-[1.05] tracking-[-0.02em]">{selectedProduct.name}</h1>
                  <p className="text-[16px] text-black/60 mt-2 font-medium">{selectedProduct.nameEn}</p>
                </div>
                <div className="text-right">
                  <div className="text-[28px] lg:text-[34px] font-bold">฿{selectedProduct.price}</div>
                  {eff === 'preorder' && !cd.isOver && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full bg-[#FFF0E8] text-[#FF6B2C] border border-[#FF6B2C]/20 font-bold whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}><Clock className="w-4 h-4" /> {formatLiveCountdown(rem)}</div>
                  )}
                  {eff === 'instock' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full bg-[#E6F4EA] text-[#12A150] border border-[#12A150]/20 font-bold whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>มีในสต็อก {selectedProduct.stock} ชิ้น</div>
                  )}
                  {eff === 'comingsoon' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full bg-[#EDEDED] text-black/50 border border-black/5 font-bold whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>เร็วๆ นี้</div>
                  )}
                  {eff === 'closed' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-full bg-[#2B2B2B] text-white border font-bold whitespace-nowrap badge-nowrap" style={{whiteSpace:'nowrap', display:'inline-flex', gap:'4px'}}>ปิดรับ Pre-order</div>
                  )}
                </div>
              </div>

              {/* STATUS INFO CARD */}
              {eff === 'preorder' && (
                <div className="mt-6 rounded-[18px] bg-[#1E3A2E] text-white p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[15px] font-bold"><div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center"><Clock className="w-5 h-5 text-[#FF6B2C]" /></div> ปิดรับใน {cd.isOver ? 'หมดเวลาแล้ว' : `${cd.d}วัน ${cd.h}:${cd.m}:${cd.s}`}</div>
                    <div className="text-[12px] px-2.5 py-1 rounded-full bg-[#FF6B2C] font-bold">LIVE</div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/10 rounded-[12px] py-3"><div className="text-[22px] font-bold leading-none">{cd.d}</div><div className="text-[11px] opacity-60 mt-1">วัน</div></div>
                    <div className="bg-white/10 rounded-[12px] py-3"><div className="text-[22px] font-bold leading-none">{cd.h}</div><div className="text-[11px] opacity-60 mt-1">ชม.</div></div>
                    <div className="bg-white/10 rounded-[12px] py-3"><div className="text-[22px] font-bold leading-none">{cd.m}</div><div className="text-[11px] opacity-60 mt-1">นาที</div></div>
                    <div className="bg-[#FF6B2C] rounded-[12px] py-3"><div className="text-[22px] font-bold leading-none">{cd.s}</div><div className="text-[11px] opacity-80 mt-1">วิ</div></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[14px]">
                    <span className="opacity-70 font-medium">สั่งแล้ว {selectedProduct.ordered} ชิ้น</span>
                    <div className="h-2 w-[120px] bg-white/15 rounded-full overflow-hidden"><div className="h-full bg-[#FF6B2C]" style={{ width: '68%' }} /></div>
                  </div>
                </div>
              )}
              {eff === 'instock' && (
                <div className="mt-6 p-4 rounded-[16px] bg-[#E6F4EA] border border-[#12A150]/15 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[15px] font-bold text-[#1E3A2E]"><div className="w-9 h-9 rounded-full bg-[#12A150] text-white grid place-items-center"><Package className="w-5 h-5" /></div> มีในสต็อก {selectedProduct.stock} ชิ้น • ไม่มี countdown</div>
                  <div className="h-2 w-[100px] bg-black/5 rounded-full overflow-hidden"><div className="h-full bg-[#12A150]" style={{ width: `${Math.min(100, (selectedProduct.stock||0)*5)}%` }} /></div>
                </div>
              )}
              {eff === 'comingsoon' && (
                <div className="mt-6 p-5 rounded-[16px] bg-[#EDEDED] border border-black/5 flex items-center gap-3 text-[15px] font-bold text-black/50">
                  <div className="w-9 h-9 rounded-full bg-[#8A8A8A] text-white grid place-items-center"><Clock className="w-5 h-5" /></div> สินค้าเร็วๆ นี้ • ยังไม่เปิดขาย คลิกไม่ได้
                </div>
              )}
              {eff === 'closed' && (
                <div className="mt-6 p-5 rounded-[16px] bg-[#2B2B2B] text-white flex items-center gap-3 text-[15px] font-bold">
                  <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center"><X className="w-5 h-5" /></div> ปิดรับ Pre-order แล้ว • รอเปิดรอบใหม่
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold tracking-wide">ขนาด</span>
                  <button onClick={() => setShowSizeChart(true)} className="text-[14px] underline decoration-dotted underline-offset-4 flex items-center gap-1.5 font-semibold"><Ruler className="w-4 h-4" /> ตารางขนาด</button>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {(['S', 'M', 'L', 'XL'] as Size[]).map(s => (
                    <button key={s} disabled={isDisabled} onClick={() => setSelectedSize(s)} className={`h-[52px] rounded-full border text-[17px] font-bold transition ${isDisabled ? 'opacity-40 cursor-not-allowed bg-[#F5F1EB] border-black/5' : selectedSize === s ? 'bg-[#1E3A2E] text-white border-[#1E3A2E] shadow-md' : 'bg-white border-black/10 hover:border-black/20'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <span className="text-[15px] font-bold tracking-wide">สี</span>
                <div className="mt-4 flex gap-3">
                  {selectedProduct.colors.map((c, i) => (
                    <button key={i} disabled={isDisabled} onClick={() => setSelectedColor(i)} className={`w-12 h-12 rounded-full border-2 grid place-items-center transition ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''} ${selectedColor === i ? 'border-[#1E3A2E] scale-110 shadow-md' : 'border-white shadow-sm'}`} style={{ background: c.hex }} title={c.name}>
                      {selectedColor === i && <span className="w-2 h-2 rounded-full bg-white shadow" />}
                    </button>
                  ))}
                  <span className="ml-3 text-[15px] text-black/60 self-center font-semibold">{selectedProduct.colors[selectedColor]?.name}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-[52px] px-1.5 flex items-center gap-1 rounded-full bg-white border border-black/10 shadow-sm">
                  <button disabled={isDisabled} onClick={() => setCartQty(Math.max(1, cartQty - 1))} className="w-11 h-11 rounded-full hover:bg-black/5 grid place-items-center disabled:opacity-30"><Minus className="w-5 h-5" /></button>
                  <span className="w-10 text-center text-[18px] font-bold">{cartQty}</span>
                  <button disabled={isDisabled} onClick={() => setCartQty(cartQty + 1)} className="w-11 h-11 rounded-full hover:bg-black/5 grid place-items-center disabled:opacity-30"><Plus className="w-5 h-5" /></button>
                </div>
                {eff === 'preorder' && (
                  <button onClick={() => { setCartCount(c => c + cartQty); setCurrentPage('checkout'); }} className="flex-1 h-[52px] rounded-full bg-[#FF6B2C] text-white font-bold text-[18px] hover:bg-[#E85F27] transition shadow-[0_10px_28px_rgba(255,107,44,0.35)]">สั่ง Pre-order • ฿{selectedProduct.price * cartQty}</button>
                )}
                {eff === 'instock' && (
                  <button onClick={() => { setCartCount(c => c + cartQty); setCurrentPage('checkout'); }} className="flex-1 h-[52px] rounded-full bg-[#1E3A2E] text-white font-bold text-[18px] hover:bg-black transition shadow-[0_10px_28px_rgba(30,58,46,0.25)]">หยิบใส่ตะกร้า • ฿{selectedProduct.price * cartQty}</button>
                )}
                {eff === 'comingsoon' && (
                  <button disabled className="flex-1 h-[52px] rounded-full bg-[#EDEDED] text-black/35 font-bold text-[18px] cursor-not-allowed border border-black/5">เร็วๆ นี้</button>
                )}
                {eff === 'closed' && (
                  <button disabled className="flex-1 h-[52px] rounded-full bg-[#2B2B2B] text-white/60 font-bold text-[18px] cursor-not-allowed">ปิดรับ Pre-order • รอเปิดรอบใหม่</button>
                )}
              </div>
                  </>
                );
              })()}

              <div className="mt-8 border-t border-black/5">
                {[
                  { id: 'material', title: 'วัสดุ', icon: Leaf, text: selectedProduct.material + ' • ตัดเย็บในไทย ลดคาร์บอน การันตีคุณภาพสำหรับเดินป่า 3-5 วันต่อเนื่อง' },
                  { id: 'care', title: 'การดูแลรักษา', icon: Shield, text: 'ซักน้ำเย็น ไม่ใช้น้ำยาปรับผ้านุ่ม ตากในที่ร่ม หลีกเลี่ยงความร้อนสูงเพื่อรักษาสารกันน้ำ' },
                ].map(item => (
                  <div key={item.id} className="border-b border-black/5">
                    <button onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)} className="w-full py-5 flex items-center justify-between text-left">
                      <span className="flex items-center gap-2.5 text-[16px] font-bold"><item.icon className="w-5 h-5 opacity-60" /> {item.title}</span>
                      <ChevronDown className={`w-5 h-5 transition ${openAccordion === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openAccordion === item.id && <p className="pb-5 text-[15px] leading-relaxed text-black/60 font-medium">{item.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* CHECKOUT */}
      {currentPage === 'checkout' && (
        <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-8 lg:py-10 pb-36">
          <PreorderStepper activeStep={2} />
          <h1 className="text-[32px] lg:text-[40px] font-bold tracking-[-0.02em]">สรุปการสั่งซื้อ</h1>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
            {/* Summary */}
            <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
              <h2 className="text-[17px] font-bold tracking-wide">รายการสินค้า</h2>
              <div className="mt-6 space-y-5">
                {[selectedProduct].map(p => (
                  <div key={p.id} className="flex gap-4">
                    <div className="w-[92px] h-[112px] rounded-[14px] overflow-hidden bg-[#F5F1EB] shrink-0"><img src={p.image} className="w-full h-full object-cover" alt="" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <p className="text-[17px] font-bold leading-tight truncate">{p.name}</p>
                        <p className="text-[17px] font-bold">฿{p.price}</p>
                      </div>
                      <p className="text-[14px] text-black/60 mt-1.5 font-medium">{selectedSize} • {selectedProduct.colors[selectedColor]?.name} • x{cartQty}</p>
                      <div className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-[#1E3A2E] text-white text-[11px] font-bold tracking-wide">PRE-ORDER</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-dashed border-black/10 pt-6 space-y-3 text-[17px]">
                <div className="flex justify-between"><span className="text-black/60 font-medium">ยอดสินค้า</span><span className="font-bold">฿{selectedProduct.price * cartQty}</span></div>
                <div className="flex justify-between"><span className="text-black/60 font-medium">ค่าส่ง</span><span className="font-bold">฿40</span></div>
                <div className="flex justify-between font-bold text-[20px] pt-3 border-t border-black/5"><span>ยอดรวม</span><span>฿{selectedProduct.price * cartQty + 40}</span></div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
                <h2 className="text-[17px] font-bold tracking-wide">ข้อมูลผู้รับ</h2>
                <div className="mt-6 grid gap-4">
                  <input placeholder="ชื่อผู้รับ *" defaultValue="สมชาย เดินป่า" className="h-[52px] px-6 rounded-full bg-[#F5F1EB] border border-black/5 text-[17px] outline-none focus:border-[#1E3A2E]/20 font-medium" />
                  <textarea placeholder="ที่อยู่จัดส่ง *" defaultValue="123 หมู่ 4 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่ 50180" rows={3} className="px-6 py-4 rounded-[18px] bg-[#F5F1EB] border border-black/5 text-[17px] outline-none focus:border-[#1E3A2E]/20 resize-none font-medium" />
                  <input placeholder="เบอร์โทร *" defaultValue="081-234-5678" className="h-[52px] px-6 rounded-full bg-[#F5F1EB] border border-black/5 text-[17px] outline-none focus:border-[#1E3A2E]/20 font-medium" />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
                <h2 className="text-[17px] font-bold tracking-wide">วิธีชำระเงิน</h2>
                <div className="mt-6 grid gap-3">
                  {[
                    { id: 'qr', name: 'QR PromptPay', desc: 'สแกนจ่ายทันที' },
                    { id: 'bank', name: 'โอนธนาคาร', desc: 'กสิกร 123-4-56789-0' },
                  ].map(m => (
                    <label key={m.id} className="flex items-center gap-4 p-4 rounded-[16px] border border-black/5 hover:border-black/10 cursor-pointer has-[input:checked]:border-[#1E3A2E] has-[input:checked]:bg-[#F3F5F2] transition">
                      <input type="radio" name="pay" defaultChecked={m.id === 'qr'} className="accent-[#1E3A2E] w-5 h-5" />
                      <div className="flex-1"><p className="text-[17px] font-bold">{m.name}</p><p className="text-[13px] text-black/60 font-medium">{m.desc}</p></div>
                      <div className="w-10 h-10 rounded-full bg-[#F5F1EB] grid place-items-center text-[12px] font-bold">{m.id === 'qr' ? 'QR' : 'BANK'}</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
            <div className="max-w-[1360px] mx-auto px-6 lg:px-10 h-[88px] flex items-center justify-between gap-5">
              <div>
                <p className="text-[13px] text-black/50 tracking-wide font-bold">ยอดรวมสุทธิ</p>
                <p className="text-[24px] font-bold">฿{selectedProduct.price * cartQty + 40}</p>
              </div>
              <button onClick={() => { setTimer(899); setPaymentStatus('idle'); setCurrentPage('payment'); }} className="h-[52px] px-10 rounded-full bg-[#1E3A2E] text-white text-[18px] font-bold hover:bg-black transition shadow-md">ไปชำระเงิน</button>
            </div>
          </div>
        </main>
      )}

      {/* PAYMENT - FIXED TO FULL WIDTH LIKE CHECKOUT */}
      {currentPage === 'payment' && (
        <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-8 lg:py-10 pb-36">
          <PreorderStepper activeStep={2} />
          <button onClick={() => setCurrentPage('checkout')} className="inline-flex items-center gap-2.5 text-[17px] font-semibold text-black/60 hover:text-black mb-8"><ArrowLeft className="w-5 h-5" /> กลับไปสรุปคำสั่งซื้อ</button>
          <h1 className="text-[32px] lg:text-[40px] font-bold tracking-[-0.02em]">ชำระเงิน</h1>
          <p className="mt-2 text-[17px] text-black/60 font-medium max-w-[60ch]">สแกน QR เพื่อชำระเงินภายในเวลาที่กำหนด จากนั้นแนบสลิปเพื่อยืนยันการสั่งซื้อพรีออเดอร์</p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
            {/* LEFT: QR CODE CARD - SAME STYLE AS CHECKOUT */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8 lg:p-9">
                <div className="flex items-center justify-between">
                  <h2 className="text-[17px] font-bold tracking-wide">QR PromptPay</h2>
                  <span className="px-3 py-1.5 rounded-full bg-[#FFF0E8] text-[#FF6B2C] text-[12px] font-bold border border-[#FF6B2C]/20 tracking-wide">SECURE</span>
                </div>
                
                <div className="mt-7 w-full aspect-square max-w-[360px] mx-auto rounded-[20px] bg-[#F5F1EB] border border-black/5 grid place-items-center relative overflow-hidden">
                  <div className="grid grid-cols-6 gap-1.5 p-6 w-full h-full">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`rounded-[4px] ${Math.random() > 0.45 ? 'bg-[#1E3A2E]' : 'bg-white border border-black/5'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 grid place-items-center"><div className="w-14 h-14 rounded-full bg-white border shadow-md grid place-items-center text-[13px] font-bold tracking-widest">DB</div></div>
                </div>

                <div className="mt-6 p-4 rounded-[16px] bg-[#1E3A2E] text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center"><Clock className="w-5 h-5 text-[#FF6B2C]" /></div>
                    <div>
                      <p className="text-[13px] opacity-70 font-bold tracking-wide">หมดเวลาใน</p>
                      <p className="text-[20px] font-bold leading-none mt-1">{formatTime(timer)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] opacity-70 font-medium">ยอดชำระ</p>
                    <p className="text-[22px] font-bold">฿{selectedProduct.price * cartQty + 40}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-[14px] leading-relaxed">
                  <div className="flex items-start gap-2.5"><div className="w-6 h-6 rounded-full bg-[#F5F1EB] border border-black/5 grid place-items-center shrink-0 mt-0.5"><span className="text-[12px] font-bold">1</span></div><p className="font-medium text-black/70">เปิดแอปธนาคารของคุณ แล้วเลือกสแกนจ่าย</p></div>
                  <div className="flex items-start gap-2.5"><div className="w-6 h-6 rounded-full bg-[#F5F1EB] border border-black/5 grid place-items-center shrink-0 mt-0.5"><span className="text-[12px] font-bold">2</span></div><p className="font-medium text-black/70">สแกน QR นี้ • ชื่อบัญชี DERBAAG Co. Ltd.</p></div>
                  <div className="flex items-start gap-2.5"><div className="w-6 h-6 rounded-full bg-[#F5F1EB] border border-black/5 grid place-items-center shrink-0 mt-0.5"><span className="text-[12px] font-bold">3</span></div><p className="font-medium text-black/70">ตรวจสอบยอด <span className="font-bold text-[#1E3A2E]">฿{selectedProduct.price * cartQty + 40}</span> ให้ตรง แล้วกดยืนยัน</p></div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[12px] text-black/40 font-bold tracking-wide">
                  <Shield className="w-4 h-4" /> ปลอดภัยด้วยการเข้ารหัส • ไม่มีการเก็บข้อมูลบัตร
                </div>
              </div>

              <div className="bg-[#FFFBF7] rounded-[24px] border border-[#FF6B2C]/15 p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF6B2C] text-white grid place-items-center shrink-0"><Truck className="w-5 h-5" /></div>
                <div>
                  <p className="text-[15px] font-bold">ผลิตตามออเดอร์จริง • ลดขยะ</p>
                  <p className="text-[14px] text-black/60 leading-relaxed mt-1 font-medium">ออเดอร์ของคุณจะถูกรวบรวมเข้าผลิตทันทีหลังยืนยันการชำระเงิน • ส่งมอบ 25 ส.ค. 2026</p>
                </div>
              </div>
            </div>

            {/* RIGHT: SLIP UPLOAD + ORDER SUMMARY - SAME STYLE AS CHECKOUT */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
                <h2 className="text-[17px] font-bold tracking-wide">แนบสลิปโอนเงิน</h2>
                <p className="text-[14px] text-black/60 mt-2 font-medium">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ JPG, PNG</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const url = URL.createObjectURL(f); setSlipPreview(url); } }}
                  className="mt-6 w-full h-[200px] rounded-[18px] border-2 border-dashed border-black/10 bg-[#F9F7F3] hover:bg-[#F5F1EB] grid place-items-center text-center p-5 transition group"
                >
                  {slipPreview ? (
                    <img src={slipPreview} alt="slip" className="h-full max-h-[180px] object-contain rounded-[12px] shadow-sm" />
                  ) : (
                    <div>
                      <div className="mx-auto w-14 h-14 rounded-full bg-white border border-black/5 grid place-items-center shadow-sm group-hover:scale-105 transition"><Upload className="w-6 h-6" /></div>
                      <p className="mt-4 text-[17px] font-bold">แนบสลิปที่นี่</p>
                      <p className="text-[14px] text-black/50 font-medium mt-1">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!slipPreview) { fileInputRef.current?.click(); return; }
                    setPaymentStatus('verifying');
                    setTimeout(() => { setPaymentStatus('confirmed'); setTimeout(() => setCurrentPage('success'), 900); }, 1600);
                  }}
                  disabled={paymentStatus === 'verifying'}
                  className={`mt-6 w-full h-[52px] rounded-full font-bold text-[18px] transition shadow-md ${paymentStatus === 'verifying' ? 'bg-black/5 text-black/30' : 'bg-[#1E3A2E] text-white hover:bg-black'}`}
                >
                  {paymentStatus === 'idle' && (slipPreview ? 'ตรวจสอบยอดและยืนยัน' : 'เลือกสลิปก่อน')}
                  {paymentStatus === 'verifying' && 'กำลังตรวจสอบ...'}
                  {paymentStatus === 'confirmed' && 'ยืนยันสำเร็จ ✓'}
                </button>

                {paymentStatus === 'verifying' && <div className="mt-5 h-2 w-full bg-black/5 rounded-full overflow-hidden"><div className="h-full w-full bg-[#1E3A2E] animate-pulse" /></div>}

                <div className="mt-6 p-4 rounded-[14px] bg-[#F5F1EB] border border-black/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center"><CreditCard className="w-4 h-4" /></div>
                  <p className="text-[13px] leading-relaxed font-medium text-black/60"><span className="font-bold text-black/80">PromptPay:</span> 012-345-6789 • DERBAAG Co.</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
                <h2 className="text-[17px] font-bold tracking-wide">สรุปคำสั่งซื้อ</h2>
                <div className="mt-6 flex gap-4">
                  <div className="w-[84px] h-[102px] rounded-[14px] overflow-hidden bg-[#F5F1EB] shrink-0"><img src={selectedProduct.image} className="w-full h-full object-cover" alt="" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <p className="text-[16px] font-bold leading-tight truncate">{selectedProduct.name}</p>
                      <p className="text-[16px] font-bold">฿{selectedProduct.price}</p>
                    </div>
                    <p className="text-[13px] text-black/60 mt-1.5 font-medium">{selectedSize} • {selectedProduct.colors[selectedColor]?.name} • x{cartQty}</p>
                    <div className="mt-2.5 inline-flex px-2.5 py-1 rounded-full bg-[#1E3A2E] text-white text-[11px] font-bold tracking-wide">PRE-ORDER</div>
                  </div>
                </div>
                <div className="mt-6 border-t border-dashed border-black/10 pt-5 space-y-3 text-[15px]">
                  <div className="flex justify-between"><span className="text-black/60 font-medium">ยอดสินค้า</span><span className="font-bold">฿{selectedProduct.price * cartQty}</span></div>
                  <div className="flex justify-between"><span className="text-black/60 font-medium">ค่าส่ง</span><span className="font-bold">฿40</span></div>
                  <div className="flex justify-between font-bold text-[18px] pt-3 border-t border-black/5"><span>ยอดรวม</span><span>฿{selectedProduct.price * cartQty + 40}</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* SUCCESS - FIXED TO FULL WIDTH LIKE OTHER PAGES */}
      {currentPage === 'success' && (
        <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-8 lg:py-10 pb-32">
          <PreorderStepper activeStep={3} />
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            {/* LEFT: SUCCESS MAIN */}
            <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8 lg:p-10">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-[#E6F4EA] border border-[#1E3A2E]/10 grid place-items-center shrink-0"><Check className="w-10 h-10 text-[#1E3A2E]" /></div>
                <div className="flex-1">
                  <h1 className="text-[36px] lg:text-[44px] font-bold tracking-[-0.02em] leading-[0.95]">สั่งซื้อสำเร็จ!</h1>
                  <p className="mt-3 text-[17px] text-black/60 font-medium leading-relaxed">ขอบคุณที่ร่วมพรีออเดอร์กับ DERBAAG • เราจะผลิตตามจำนวนจริง ลดขยะและเป็นมิตรกับป่า</p>
                  <div className="mt-5 inline-flex flex-wrap items-center gap-2">
                    <span className="px-4 py-2 rounded-full bg-[#F5F1EB] border border-black/5 text-[13px] font-bold tracking-wide">เลขที่คำสั่งซื้อ <span className="ml-1 font-bold">#DB-20260812-001</span></span>
                    <span className="px-4 py-2 rounded-full bg-[#1E3A2E] text-white text-[12px] font-bold tracking-wide">PRE-ORDER CONFIRMED</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 text-left">
                {[
                  { label: 'Pre-order', desc: 'รับออเดอร์', done: true },
                  { label: 'ยืนยันการผลิต', desc: '15 ส.ค.', done: false, active: true },
                  { label: 'จัดส่ง', desc: '25 ส.ค. 2026', done: false },
                ].map((s, i) => (
                  <div key={i} className={`rounded-[18px] border p-5 transition ${s.active ? 'bg-[#1E3A2E] text-white border-[#1E3A2E] shadow-lg' : s.done ? 'bg-[#F3F5F2] border-black/5' : 'bg-white border-black/5'}`}>
                    <div className={`w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold ${s.done ? 'bg-[#1E3A2E] text-white' : s.active ? 'bg-white text-[#1E3A2E]' : 'bg-black/5'}`}>{s.done ? <Check className="w-5 h-5" /> : i + 1}</div>
                    <p className="mt-4 text-[15px] font-bold">{s.label}</p>
                    <p className={`text-[13px] font-medium mt-1 ${s.active ? 'text-white/70' : 'text-black/50'}`}>{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-[16px] bg-[#FFF7F0] border border-[#FF6B2C]/15 flex items-center gap-4 text-left">
                <div className="w-11 h-11 rounded-full bg-[#FF6B2C] text-white grid place-items-center shrink-0"><Truck className="w-5 h-5" /></div>
                <div className="text-[15px] leading-relaxed font-medium"><span className="font-bold">คาดว่าจะจัดส่ง 25 ส.ค. 2026</span><br /><span className="text-black/60">ผลิตตามออเดอร์ • ลดขยะ • คุณจะได้รับอีเมลแจ้งเตือนเมื่อจัดส่ง</span></div>
              </div>

              <div className="mt-8 p-5 rounded-[16px] bg-[#F5F1EB] border border-black/5">
                <div className="flex items-center gap-2 text-[13px] font-bold tracking-wide text-black/50"><MapPin className="w-4 h-4" /> ที่อยู่จัดส่ง</div>
                <p className="mt-2 text-[15px] font-medium leading-relaxed">สมชาย เดินป่า • 081-234-5678<br/>123 หมู่ 4 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่ 50180</p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setCurrentPage('products')} className="h-[52px] rounded-full border border-black/10 bg-white text-[18px] font-bold hover:bg-black/[0.02] transition">กลับไปช้อปต่อ</button>
                <button className="h-[52px] rounded-full bg-[#1E3A2E] text-white text-[18px] font-bold hover:bg-black shadow-md transition">ดูรายการสั่งซื้อ</button>
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY + PRODUCTION INFO - SAME CARD STYLE */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-8">
                <h2 className="text-[17px] font-bold tracking-wide">สรุปออเดอร์ #DB-001</h2>
                <div className="mt-6 flex gap-4">
                  <div className="w-[96px] h-[116px] rounded-[14px] overflow-hidden bg-[#F5F1EB] shrink-0"><img src={selectedProduct.image} className="w-full h-full object-cover" alt="" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <p className="text-[17px] font-bold leading-tight truncate">{selectedProduct.name}</p>
                      <p className="text-[17px] font-bold">฿{selectedProduct.price}</p>
                    </div>
                    <p className="text-[14px] text-black/60 mt-1.5 font-medium">{selectedSize} • {selectedProduct.colors[selectedColor]?.name} • x{cartQty}</p>
                    <p className="text-[12px] text-black/40 mt-1 font-medium">{selectedProduct.nameEn}</p>
                    <div className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-[#E6F4EA] text-[#1E3A2E] text-[11px] font-bold tracking-wide border border-[#1E3A2E]/10">✓ ชำระแล้ว</div>
                  </div>
                </div>
                <div className="mt-6 border-t border-dashed border-black/10 pt-5 space-y-3 text-[15px]">
                  <div className="flex justify-between"><span className="text-black/60 font-medium">ยอดสินค้า</span><span className="font-bold">฿{selectedProduct.price * cartQty}</span></div>
                  <div className="flex justify-between"><span className="text-black/60 font-medium">ค่าส่ง</span><span className="font-bold">฿40</span></div>
                  <div className="flex justify-between"><span className="text-black/60 font-medium">วิธีชำระ</span><span className="font-bold text-[14px]">QR PromptPay</span></div>
                  <div className="flex justify-between font-bold text-[20px] pt-3 border-t border-black/5"><span>ยอดรวม</span><span>฿{selectedProduct.price * cartQty + 40}</span></div>
                </div>
              </div>

              <div className="bg-[#1E3A2E] rounded-[24px] border border-white/10 shadow-[0_10px_36px_rgba(30,58,46,0.18)] p-8 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center"><Factory className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-[17px] font-bold">การผลิตแบบ Made to Order</h3>
                    <p className="text-[13px] text-white/60 font-medium">ผลิตตามออเดอร์จริง • ไม่ผลิตเกิน</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#1E3A2E] grid place-items-center text-[13px] font-bold shrink-0">1</div>
                    <div><p className="text-[15px] font-bold">รวบรวมออเดอร์</p><p className="text-[13px] text-white/60 font-medium mt-1">ถึง 15 ส.ค. 2026 • ปิดรอบ</p></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B2C] text-white grid place-items-center text-[13px] font-bold shrink-0">2</div>
                    <div><p className="text-[15px] font-bold">เริ่มผลิต</p><p className="text-[13px] text-white/60 font-medium mt-1">ตัดเย็บในไทย • ใช้ผ้ารีไซเคิล</p></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center text-[13px] font-bold shrink-0">3</div>
                    <div><p className="text-[15px] font-bold">จัดส่ง</p><p className="text-[13px] text-white/60 font-medium mt-1">25 ส.ค. 2026 • แจ้งเลขพัสดุทางอีเมล</p></div>
                  </div>
                </div>
                <div className="mt-7 p-4 rounded-[14px] bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Leaf className="w-5 h-5 text-[#FF6B2C] shrink-0" />
                  <p className="text-[13px] leading-relaxed font-medium text-white/80">การสั่งครั้งนี้ช่วยลดขยะจาก Overproduction ได้ ~0.8kg CO₂ เทียบเท่าปลูกต้นไม้ 1 ต้น</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-black/[0.05] shadow-[0_10px_36px_rgba(30,58,46,0.07)] p-6">
                <h3 className="text-[14px] font-bold tracking-wide flex items-center gap-2"><Shield className="w-4 h-4" /> ช่วยเหลือ</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="h-[44px] rounded-full bg-[#F5F1EB] border border-black/5 text-[14px] font-bold hover:bg-black/[0.03]">ติดต่อแอดมิน</button>
                  <button className="h-[44px] rounded-full bg-[#F5F1EB] border border-black/5 text-[14px] font-bold hover:bg-black/[0.03]">ดูคำถามบ่อย</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})} className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-[#1E3A2E] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] grid place-items-center hover:bg-black transition hover:scale-110">
          <span className="text-[18px] font-bold">↑</span>
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1E3A2E] text-white px-6 py-3 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-[14px] font-bold animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      {/* Size Chart Modal - BIG */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSizeChart(false)} />
          <div className="relative w-full max-w-[520px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 border border-black/5">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-bold">ตารางขนาด</h3>
              <button onClick={() => setShowSizeChart(false)} className="w-10 h-10 rounded-full bg-black/5 grid place-items-center"><X className="w-5 h-5" /></button>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2 text-[14px] font-bold text-black/50">
              <span>Size</span><span>อก</span><span>ยาว</span><span>ไหล่</span>
            </div>
            <div className="mt-3 divide-y divide-black/5 text-[17px]">
              {[
                { s: 'S', a: '38"', b: '26"', c: '16"' },
                { s: 'M', a: '40"', b: '27"', c: '17"' },
                { s: 'L', a: '42"', b: '28"', c: '18"' },
                { s: 'XL', a: '44"', b: '29"', c: '19"' },
              ].map(r => (
                <div key={r.s} className="grid grid-cols-4 py-3"><span className="font-bold">{r.s}</span><span>{r.a}</span><span>{r.b}</span><span>{r.c}</span></div>
              ))}
            </div>
            <p className="mt-6 text-[14px] text-black/50 leading-relaxed font-medium">วัดจากไซส์จริง • หน่วยเป็นนิ้ว • แนะนำเผื่อ 1 ไซส์หากชอบหลวมสำหรับเลเยอร์เดินป่า</p>
          </div>
        </div>
      )}

    </div>
  );
}
