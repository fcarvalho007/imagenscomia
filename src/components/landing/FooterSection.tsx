export const FooterSection = () => (
  <footer className="py-8 bg-[hsl(222,50%,3%)] border-t border-white/[0.04]">
    <div className="container mx-auto px-5 sm:px-6 text-center">
      <div className="flex flex-wrap justify-center gap-5 text-xs text-text-secondary mb-3">
        <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
        <a href="#" className="hover:text-foreground transition-colors">Termos</a>
        <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
      </div>
      <p className="text-[11px] text-text-secondary/60">
        © 2025 Frederico Carvalho · DIGITALFC
      </p>
    </div>
  </footer>
);
