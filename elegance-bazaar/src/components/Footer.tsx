import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
                M
              </div>
              <span className="font-display text-xl font-bold text-foreground">Magazin</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O'zbekistonning eng ishonchli onlayn do'koni. Sifatli mahsulotlar, tez yetkazib berish.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Sahifalar</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-foreground">Mahsulotlar</Link></li>
              <li><Link to="/categories" className="hover:text-foreground">Kategoriyalar</Link></li>
              <li><Link to="/cart" className="hover:text-foreground">Savatcha</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Yordam</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-pointer hover:text-foreground">Yetkazib berish</span></li>
              <li><span className="cursor-pointer hover:text-foreground">Qaytarish</span></li>
              <li><span className="cursor-pointer hover:text-foreground">Bog'lanish</span></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Aloqa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📞 +998 90 123 45 67</li>
              <li>📧 info@magazin.uz</li>
              <li>📍 Toshkent, O'zbekiston</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Magazin. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
