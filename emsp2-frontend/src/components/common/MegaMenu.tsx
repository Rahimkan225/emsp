import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { NavMegaColumn } from "../../config/navigation";

interface MegaMenuProps {
  open: boolean;
  columns: NavMegaColumn[];
}

const MegaMenu = ({ open, columns }: MegaMenuProps) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-1/2 top-full z-40 mt-3 w-[880px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          style={{ borderTop: "4px solid #22C55E" }}
        >
          <div className="grid grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-3 text-sm font-semibold text-secondary">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="inline-flex items-center gap-2 text-sm text-dark transition hover:text-secondary"
                      >
                        <ChevronRight size={14} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default MegaMenu;
