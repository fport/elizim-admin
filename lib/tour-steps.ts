import type { Step } from "react-joyride";
import type { TourId } from "./tour-store";

export interface ResponsiveStep {
  desktop?: string;
  mobile?: string;
  title: string;
  content: string;
  desktopPlacement?: Step["placement"];
  mobilePlacement?: Step["placement"];
}

export const responsiveTourSteps: Record<TourId, ResponsiveStep[]> = {
  admin: [
    {
      desktop: '[data-tour="sidebar-logo"]',
      mobile: '[data-tour="bottom-nav"]',
      title: "Yonetim Panelin",
      content: "Burasi senin panelin anne, oglun ayarladi. Kolay!",
      desktopPlacement: "right",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="nav-dashboard"]',
      mobile: '[data-tour="bnav-home"]',
      title: "Ana Panel",
      content: "Genel durum burada. Urun, kategori sayilari falan.",
      desktopPlacement: "right",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="nav-gorsel"]',
      mobile: '[data-tour="bnav-gorsel"]',
      title: "Gorsel Olustur",
      content: "Yapay zeka ile urun gorseli olustur. En cok kullanacagin yer!",
      desktopPlacement: "right",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="nav-tasarim"]',
      mobile: '[data-tour="bnav-tasarim"]',
      title: "Tasarim Uretici",
      content: "Ne istedigini yaz, yapay zeka tasarim uretsin.",
      desktopPlacement: "right",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="nav-urunler"]',
      mobile: '[data-tour="bnav-diger"]',
      title: "Diger Sayfalar",
      content: "Urunler, desenler, kategoriler, blog ve daha fazlasi burada. Tikla, goster!",
      desktopPlacement: "right",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="stats-grid"]',
      mobile: '[data-tour="stats-grid"]',
      title: "Genel Bakis",
      content: "Kac urun, kac kategori, hepsi burada.",
      desktopPlacement: "bottom",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="quick-actions"]',
      mobile: '[data-tour="quick-actions"]',
      title: "Hizli Islemler",
      content: "Tek tikla urun veya yazi ekle.",
      desktopPlacement: "top",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="tour-help-btn"]',
      mobile: '[data-tour="header-help"]',
      title: "Yardim",
      content: "Unutursan bu soru isaretine bas anne, tekrar gostereyim!",
      desktopPlacement: "top",
      mobilePlacement: "bottom",
    },
  ],

  urunler: [
    {
      desktop: '[data-tour="urun-add-btn"]',
      mobile: '[data-tour="urun-add-btn"]',
      title: "Yeni Urun",
      content: "Buraya bas, yeni urun ekle. Baslik, fiyat, foto - o kadar!",
      desktopPlacement: "bottom",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="urun-table"]',
      mobile: '[data-tour="urun-table"]',
      title: "Urun Listesi",
      content: "Tum urunlerin burada. Foto, ad, fiyat gorunuyor.",
      desktopPlacement: "top",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="urun-edit-btn"]',
      mobile: '[data-tour="urun-edit-btn"]',
      title: "Duzenle",
      content: "Kaleme bas, urunu duzenle.",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="urun-delete-btn"]',
      mobile: '[data-tour="urun-delete-btn"]',
      title: "Sil",
      content: "Cop kutusuna bas, sil. Once soruyor merak etme.",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
  ],

  desenler: [
    {
      desktop: '[data-tour="desen-add-btn"]',
      mobile: '[data-tour="desen-add-btn"]',
      title: "Yeni Desen",
      content: "Burdan yeni desen ekle. Baslik, fiyat, zorluk, format sec.",
      desktopPlacement: "bottom",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="desen-table"]',
      mobile: '[data-tour="desen-table"]',
      title: "Desen Listesi",
      content: "Desenlerin burada. DST, VP3, EXP nakis makinesi formatlari.",
      desktopPlacement: "top",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="desen-edit-btn"]',
      mobile: '[data-tour="desen-edit-btn"]',
      title: "Duzenle",
      content: "Kaleme bas, ustte form acilir, degistir kaydet.",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="desen-delete-btn"]',
      mobile: '[data-tour="desen-delete-btn"]',
      title: "Sil",
      content: "Cop kutusuna bas, sil. Once soruyor.",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
  ],

  kategoriler: [
    {
      desktop: '[data-tour="kategori-add-btn"]',
      mobile: '[data-tour="kategori-add-btn"]',
      title: "Yeni Kategori",
      content: "Burdan ekle: Nakis, Dantel, Bohca ne istersen.",
      desktopPlacement: "bottom",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="kategori-table"]',
      mobile: '[data-tour="kategori-table"]',
      title: "Kategori Listesi",
      content: "Kategorilerin burada. Sirayi degistirebilirsin.",
      desktopPlacement: "top",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="kategori-edit-btn"]',
      mobile: '[data-tour="kategori-edit-btn"]',
      title: "Duzenle",
      content: "Kaleme bas, adini degistir.",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
    {
      desktop: '[data-tour="kategori-delete-btn"]',
      mobile: '[data-tour="kategori-delete-btn"]',
      title: "Sil",
      content: "Dikkat, silersen urunlerin kategorisi bos kalir!",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
  ],

  gorsel: [
    {
      desktop: '[data-tour="gorsel-upload"]',
      mobile: '[data-tour="gorsel-upload"]',
      title: "1. Desen Yukle",
      content: "Desen fotografini yukle. Telefondan cektigin de olur!",
      desktopPlacement: "right",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="gorsel-product-type"]',
      mobile: '[data-tour="gorsel-product-type"]',
      title: "2. Urun Sec",
      content: "Havlu mu, masa ortusu mu? Sec veya kendin yaz.",
      desktopPlacement: "right",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="gorsel-aspect"]',
      mobile: '[data-tour="gorsel-aspect"]',
      title: "3. Boyut",
      content: "Instagram icin kare sec, anlamazsan kare yeter!",
      desktopPlacement: "right",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="gorsel-generate"]',
      mobile: '[data-tour="gorsel-generate"]',
      title: "Olustur!",
      content: "Bas butona, yapay zeka halleder. 30-60 sn bekle.",
      desktopPlacement: "right",
      mobilePlacement: "bottom",
    },
    {
      desktop: '[data-tour="gorsel-preview"]',
      mobile: '[data-tour="gorsel-preview"]',
      title: "Sonuc",
      content: "Gorsel burada cikar. Begendiysen indir, begenmediysen tekrarla!",
      desktopPlacement: "left",
      mobilePlacement: "top",
    },
  ],
};

export function resolveSteps(tourId: TourId): Step[] {
  const responsive = responsiveTourSteps[tourId];
  if (!responsive) return [];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return responsive
    .map((step): Step | null => {
      const target = isMobile
        ? step.mobile || step.desktop
        : step.desktop || step.mobile;

      if (!target) return null;

      const el = document.querySelector(target);
      if (!el) return null;

      const placement = isMobile
        ? step.mobilePlacement || step.desktopPlacement || "auto"
        : step.desktopPlacement || step.mobilePlacement || "auto";

      return {
        target,
        title: step.title,
        content: step.content,
        placement,
        disableBeacon: true,
      };
    })
    .filter((s): s is Step => s !== null);
}
