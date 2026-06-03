export const manifest = {
  screens: {
    scr_pbkzt2: { name: "Peta", route: "/", position: {"x":160,"y":2200} },
    scr_jjv0np: { name: "Login", route: "/login", position: {"x":160,"y":220} },
    scr_qle0d8: { name: "Register", route: "/register", position: {"x":1560,"y":220} },
    scr_m3hg6b: { name: "Buat Laporan", route: "/buat-laporan", position: {"x":1560,"y":2200} },
    scr_fxg1h0: { name: "Admin", route: "/admin", position: {"x":160,"y":4180} },
  },
  sections: {
    sec_nz0qaq: { name: "Authentication flow", x: 0, y: 0, width: 2920, height: 1180 },
    sec_lc3wdr: { name: "Main app", x: 0, y: 1980, width: 2920, height: 1180 },
    sec_4m0ter: { name: "Admin panel", x: 0, y: 3960, width: 1520, height: 1180 },
  },
  layers: [
    { kind: "section", id: "sec_nz0qaq", children: [
      { kind: "screen", id: "scr_jjv0np" },
      { kind: "screen", id: "scr_qle0d8" },
    ] },
    { kind: "section", id: "sec_lc3wdr", children: [
      { kind: "screen", id: "scr_pbkzt2" },
      { kind: "screen", id: "scr_m3hg6b" },
    ] },
    { kind: "section", id: "sec_4m0ter", children: [
      { kind: "screen", id: "scr_fxg1h0" },
    ] },
  ],
}
