import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";

import { useSiteConfig } from "../../hooks/useSiteConfig";

const TopBar = () => {
  const { data: site } = useSiteConfig();

  const socialLinks = [
    { href: site?.facebookUrl, label: "Facebook EMSP", icon: Facebook },
    { href: site?.twitterUrl, label: "Twitter EMSP", icon: Twitter },
    { href: site?.linkedinUrl, label: "LinkedIn EMSP", icon: Linkedin },
    { href: site?.youtubeUrl, label: "YouTube EMSP", icon: Youtube },
  ];

  return (
    <div className="bg-secondary text-sm text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-label="Telephone EMSP">{site?.phone1 || "+225 27 21 21 45 60"}</span>
          <span className="opacity-60">|</span>
          <span aria-label="Email EMSP">{site?.emailContact || "contact@emsp.int"}</span>
        </div>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href || "#"}
              aria-label={label}
              className={`transition hover:text-primary ${href ? "" : "pointer-events-none opacity-50"}`}
              rel="noreferrer"
              target="_blank"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
