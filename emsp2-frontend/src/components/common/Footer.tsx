import { Link } from "react-router-dom";

import { useSiteConfig } from "../../hooks/useSiteConfig";

const Footer = () => {
  const { data: site } = useSiteConfig();

  return (
    <footer className="bg-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-xl font-bold">{site?.siteName || "EMSP"}</h3>
          <p className="mt-3 text-sm text-slate-300">
            {site?.footerText || site?.slogan || "Ecole Multinationale Superieure des Postes. Institution intergouvernementale d'excellence."}
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Liens rapides</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/inscription">Inscription</Link></li>
            <li><Link to="/actualites">Actualites</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Portail</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Formations</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/formations/fsp">FSP</Link></li>
            <li><Link to="/formations/fs-menum">FS-MENUM</Link></li>
            <li><Link to="/formations/fs-menum/ms-regnum">MS-RegNUM</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>{site?.phone1 || "+225 27 21 21 45 60"}</li>
            <li>{site?.emailContact || "contact@emsp.int"}</li>
            <li>{site?.address || "Abidjan, Treichville Zone 3"}</li>
          </ul>
        </div>
      </div>
      <div className="bg-secondary px-4 py-3 text-center text-sm text-white">
        Copyright {new Date().getFullYear()} {site?.siteName || "EMSP"} - Tous droits reserves.
      </div>
    </footer>
  );
};

export default Footer;
