// src/i18n/translations.js

const translations = {
  /* -------------------------------------------------------
   * ENGLISH
   * ----------------------------------------------------- */
  en: {
    // NAV
    "nav.logo": "My Admin",
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.products": "Products",
    "nav.orders": "Orders",
    "nav.settings": "Settings",
    "nav.welcome": "Welcome back",

    // PAGE TITLES (topbar)
    titleDashboard: "Dashboard",
    titleUsers: "Users",
    titleProducts: "Products",
    titleOrders: "Orders",
    titleSettings: "Settings",

    // COMMON
    "common.search": "Search",
    "common.reset": "Reset",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",

    /* ---------- DASHBOARD ---------- */
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Quick overview of your users and activity.",

    cardTotalUsers: "Total users",
    cardActiveUsers: "Active users",
    cardInactiveUsers: "Inactive users",
    cardAdmins: "Admins",

    cardFootActiveRate: "Active rate",
    cardFootActiveUsers: 'Users with status "Active"',
    cardFootInactiveUsers: "Users currently inactive",
    cardFootAdmins: "Users with Admin role",

    totalOrders: "Total orders",
    pendingOrders: "Pending",
    shippedOrders: "Shipped",
    totalRevenue: "Total revenue",

    revenueOverviewTitle: "Revenue overview",
    revenueOverviewSubtitle: "Last 6 months total revenue (€)",
    revenueOverviewEmpty: "Not enough data to display.",

    orderStatusDistributionTitle: "Order status distribution",
    orderStatusDistributionSubtitle:
      "Breakdown of Pending, Shipped and Cancelled orders",
    orderStatusDistributionEmpty: "No orders to display.",
    ordersLabel: "orders",

    orderStatusPending: "Pending",
    orderStatusShipped: "Shipped",
    orderStatusCancelled: "Cancelled",

    recentTitle: "Recent users",
    recentSubtitle: "latest users",
    recentEmpty:
      "No users found. Go to the Users page to add your first user.",

    recentOrdersTitle: "Recent orders",
    latestOrdersLabel: "Latest {count} orders",
    recentOrdersEmpty: "No recent orders found.",

    thName: "Name",
    thEmail: "Email",
    thRole: "Role",
    thStatus: "Status",
    thId: "ID",
    thCustomer: "Customer",
    thTotal: "Total",

    roleAdmin: "Admin",
    roleModerator: "Moderator",
    roleUser: "User",
    statusActive: "Active",
    statusInactive: "Inactive",

    /* ---------- USERS PAGE ---------- */
    "users.title": "Users",
    "users.subtitle": "Manage your customers, admins and team members.",
    "users.addUser": "Add user",
    "users.name": "Name",
    "users.email": "Email",
    "users.role": "Role",
    "users.lastActive": "Last active",
    "users.createdAt": "Created at",
    "users.searchPlaceholder": "Search by name or email...",
    "users.filter.all": "All",
    "users.filter.active": "Active",
    "users.filter.inactive": "Inactive",
    // PRODUCTS
    "products.title": "Products",
    "products.subtitle": "Manage your anime, manga and gaming items.",
    "products.addProduct": "Add Product",
    "products.editProduct": "Edit Product",
    "products.nameLabel": "Name",
    "products.categoryLabel": "Category",
    "products.fandomLabel": "Fandom",
    "products.priceLabel": "Price (€)",
    "products.stockLabel": "Stock",
    "products.statusLabel": "Status",
    "products.searchPlaceholder": "Search by name, fandom, category...",
    "products.filterAll": "All",
    "products.filterCategoryAll": "All categories",
    "products.filterStatusAll": "All statuses",
    "products.status.active": "Active",
    "products.status.hidden": "Hidden",
    "products.status.outOfStock": "Out of stock",
    "products.saveButton": "Save",
    "products.cancelButton": "Cancel",
    "products.editButton": "Edit",
    "products.deleteButton": "Delete",
    "products.empty": "No products found for this filter.",
    "products.error.nameRequired": "Name is required.",
    "products.error.priceInvalid": "Enter a valid price.",
    "products.error.stockInvalid": "Stock must be 0 or higher.",
    "products.summary.totalProducts": "Total products",
    "products.summary.activeProducts": "Active",
    "products.summary.lowStock": "Low stock (≤5)",
    "products.summary.outOfStock": "Out of stock",
    "products.summary.inventoryValue": "Inventory value",
    "products.resultsSummary": "Showing {current} of {total} products",

     "orders.title": "Orders",
    "orders.subtitle": "Track and manage recent orders.",
    "orders.filterAll": "All",
    "orders.searchPlaceholder": "Search by name, email, ID...",
    "orders.summaryTotalOrders": "Total Orders",
    "orders.summaryTotalRevenue": "Total Revenue",
    "orders.thId": "ID",
    "orders.thCustomer": "Customer",
    "orders.thEmail": "Email",
    "orders.thDate": "Date",
    "orders.thTotal": "Total",
    "orders.thStatusClickable": "Status (click to change)",
    "orders.thPayment": "Payment",
    "orders.empty": "No orders found for this filter.",
    "orders.resultsSummary": "Showing {current} of {total} orders",
    "orders.exportCsv": "Export CSV",
    "orders.detailsTitle": "Order details",
    "orders.detailsOrderId": "Order ID",
    "orders.detailsCustomer": "Customer",
    "orders.detailsEmail": "Email",
    "orders.detailsDate": "Date",
    "orders.detailsTotal": "Total amount",
    "orders.detailsStatus": "Status",
    "orders.detailsPayment": "Payment method",
    "orders.detailsClose": "Close",


    /* ---------- SETTINGS PAGE ---------- */
    "settings.title": "Settings",
    "settings.subtitle": "Manage your profile, preferences and notifications.",
    "settings.profileTitle": "Profile",
    "settings.profileDesc": "Update how your name appears in the admin panel.",
    "settings.displayNameLabel": "Display name",
    "settings.displayNamePlaceholder": "Your name",
    "settings.prefsTitle": "Preferences",
    "settings.prefsDesc": "Choose your visual theme and interface language.",
    "settings.themeLabel": "Theme",
    "settings.languageLabel": "Language",
    "settings.theme.dark": "Dark",
    "settings.theme.light": "Light",
    "settings.theme.system": "System",
    "settings.notifTitle": "Notifications",
    "settings.notifDesc":
      "Control which email updates you receive about activity.",
    "settings.mainEmailLabel": "Main email alerts",
    "settings.mainEmailSub":
      "Order updates, critical account messages.",
    "settings.weeklyLabel": "Weekly summary",
    "settings.weeklySub":
      "Get a weekly summary of users and orders.",
    "settings.savedPill": "Settings saved",
  },

  /* -------------------------------------------------------
   * TURKISH
   * ----------------------------------------------------- */
  tr: {
    "nav.logo": "Yönetim Paneli",
    "nav.dashboard": "Panel",
    "nav.users": "Kullanıcılar",
    "nav.products": "Ürünler",
    "nav.orders": "Siparişler",
    "nav.settings": "Ayarlar",
    "nav.welcome": "Tekrar hoş geldin",

    titleDashboard: "Panel",
    titleUsers: "Kullanıcılar",
    titleProducts: "Ürünler",
    titleOrders: "Siparişler",
    titleSettings: "Ayarlar",

    "common.search": "Ara",
    "common.reset": "Sıfırla",
    "common.status": "Durum",
    "common.actions": "İşlemler",
    "common.cancel": "İptal",
    "common.save": "Kaydet",
    "common.edit": "Düzenle",
    "common.delete": "Sil",

    dashboardTitle: "Panel",
    dashboardSubtitle: "Kullanıcılar ve aktiviteler için hızlı bir özet.",

    cardTotalUsers: "Toplam kullanıcı",
    cardActiveUsers: "Aktif kullanıcı",
    cardInactiveUsers: "Pasif kullanıcı",
    cardAdmins: "Yöneticiler",

    cardFootActiveRate: "Aktif oranı",
    cardFootActiveUsers: 'Durumu "Aktif" olan kullanıcılar',
    cardFootInactiveUsers: "Şu anda pasif kullanıcılar",
    cardFootAdmins: "Admin rolüne sahip kullanıcılar",

    totalOrders: "Toplam sipariş",
    pendingOrders: "Beklemede",
    shippedOrders: "Gönderilen",
    totalRevenue: "Toplam gelir",

    revenueOverviewTitle: "Gelir özeti",
    revenueOverviewSubtitle: "Son 6 ayın toplam geliri (€)",
    revenueOverviewEmpty: "Gösterilecek yeterli veri yok.",

    orderStatusDistributionTitle: "Sipariş durum dağılımı",
    orderStatusDistributionSubtitle:
      "Beklemede, Gönderilen ve İptal edilen siparişlerin dağılımı",
    orderStatusDistributionEmpty: "Gösterilecek sipariş yok.",
    ordersLabel: "sipariş",

    orderStatusPending: "Beklemede",
    orderStatusShipped: "Gönderildi",
    orderStatusCancelled: "İptal edildi",

    recentTitle: "Son kullanıcılar",
    recentSubtitle: "son kullanıcı",
    recentEmpty:
      "Hiç kullanıcı bulunamadı. Kullanıcı eklemek için Users sayfasına gidin.",

    recentOrdersTitle: "Son siparişler",
    latestOrdersLabel: "Son {count} sipariş",
    recentOrdersEmpty: "Son sipariş bulunamadı.",

    thName: "İsim",
    thEmail: "E-posta",
    thRole: "Rol",
    thStatus: "Durum",
    thId: "ID",
    thCustomer: "Müşteri",
    thTotal: "Tutar",

    roleAdmin: "Admin",
    roleModerator: "Moderatör",
    roleUser: "Kullanıcı",
    statusActive: "Aktif",
    statusInactive: "Pasif",

    "users.title": "Kullanıcılar",
    "users.subtitle": "Müşterileri, yöneticileri ve ekip üyelerini yönet.",
    "users.addUser": "Kullanıcı ekle",
    "users.name": "İsim",
    "users.email": "E-posta",
    "users.role": "Rol",
    "users.lastActive": "Son aktif",
    "users.createdAt": "Oluşturulma",
    "users.searchPlaceholder": "İsim veya e-posta ile ara...",
    "users.filter.all": "Hepsi",
    "users.filter.active": "Aktif",
    "users.filter.inactive": "Pasif",
        // PRODUCTS
    "products.title": "Ürünler",
    "products.subtitle": "Anime, manga ve gaming ürünlerini yönet.",
    "products.addProduct": "Ürün Ekle",
    "products.editProduct": "Ürünü Düzenle",
    "products.nameLabel": "İsim",
    "products.categoryLabel": "Kategori",
    "products.fandomLabel": "Evren",
    "products.priceLabel": "Fiyat (€)",
    "products.stockLabel": "Stok",
    "products.statusLabel": "Durum",
    "products.searchPlaceholder": "İsim, evren veya kategori ile ara...",
    "products.filterAll": "Hepsi",
    "products.filterCategoryAll": "Tüm kategoriler",
    "products.filterStatusAll": "Tüm durumlar",
    "products.status.active": "Aktif",
    "products.status.hidden": "Gizli",
    "products.status.outOfStock": "Stokta yok",
    "products.saveButton": "Kaydet",
    "products.cancelButton": "İptal",
    "products.editButton": "Düzenle",
    "products.deleteButton": "Sil",
    "products.empty": "Bu filtreye uygun ürün bulunamadı.",
    "products.error.nameRequired": "İsim zorunludur.",
    "products.error.priceInvalid": "Geçerli bir fiyat gir.",
    "products.error.stockInvalid": "Stok 0 veya daha büyük olmalı.",
    "products.summary.totalProducts": "Toplam ürün",
    "products.summary.activeProducts": "Aktif",
    "products.summary.lowStock": "Düşük stok (≤5)",
    "products.summary.outOfStock": "Stokta yok",
    "products.summary.inventoryValue": "Stok değeri",
    "products.resultsSummary": "Toplam {total} üründen {current} tanesi görüntüleniyor",

    "orders.title": "Siparişler",
    "orders.subtitle": "Son siparişleri takip et ve yönet.",
    "orders.filterAll": "Hepsi",
    "orders.searchPlaceholder": "İsim, e-posta veya ID ile ara...",
    "orders.summaryTotalOrders": "Toplam Sipariş",
    "orders.summaryTotalRevenue": "Toplam Gelir",
    "orders.thId": "ID",
    "orders.thCustomer": "Müşteri",
    "orders.thEmail": "E-posta",
    "orders.thDate": "Tarih",
    "orders.thTotal": "Tutar",
    "orders.thStatusClickable": "Durum (değiştirmek için tıkla)",
    "orders.thPayment": "Ödeme",
    "orders.empty": "Bu filtreye uygun sipariş bulunamadı.",
    "orders.resultsSummary": "Toplam {total} siparişten {current} tanesi görüntüleniyor",
    "orders.exportCsv": "CSV olarak dışa aktar",
    "orders.detailsTitle": "Sipariş detayı",
    "orders.detailsOrderId": "Sipariş ID",
    "orders.detailsCustomer": "Müşteri",
    "orders.detailsEmail": "E-posta",
    "orders.detailsDate": "Tarih",
    "orders.detailsTotal": "Toplam tutar",
    "orders.detailsStatus": "Durum",
    "orders.detailsPayment": "Ödeme yöntemi",
    "orders.detailsClose": "Kapat",


    "settings.title": "Ayarlar",
    "settings.subtitle":
      "Profilini, tercihlerini ve bildirimlerini yönet.",
    "settings.profileTitle": "Profil",
    "settings.profileDesc":
      "İsminin panelde nasıl görüneceğini güncelle.",
    "settings.displayNameLabel": "Görünen ad",
    "settings.displayNamePlaceholder": "Adın",
    "settings.prefsTitle": "Tercihler",
    "settings.prefsDesc": "Tema ve arayüz dilini buradan seç.",
    "settings.themeLabel": "Tema",
    "settings.languageLabel": "Dil",
    "settings.theme.dark": "Koyu",
    "settings.theme.light": "Açık",
    "settings.theme.system": "Sistem",
    "settings.notifTitle": "Bildirimler",
    "settings.notifDesc":
      "Hangi e-posta bildirimlerini alacağını seç.",
    "settings.mainEmailLabel": "Ana e-posta uyarıları",
    "settings.mainEmailSub":
      "Sipariş güncellemeleri, kritik hesap mesajları.",
    "settings.weeklyLabel": "Haftalık özet",
    "settings.weeklySub":
      "Her hafta kullanıcı ve sipariş özeti al.",
    "settings.savedPill": "Ayarlar kaydedildi",
  },

  /* -------------------------------------------------------
   * GERMAN
   * ----------------------------------------------------- */
  de: {
    "nav.logo": "Admin Bereich",
    "nav.dashboard": "Übersicht",
    "nav.users": "Benutzer",
    "nav.products": "Produkte",
    "nav.orders": "Bestellungen",
    "nav.settings": "Einstellungen",
    "nav.welcome": "Willkommen zurück",

    titleDashboard: "Übersicht",
    titleUsers: "Benutzer",
    titleProducts: "Produkte",
    titleOrders: "Bestellungen",
    titleSettings: "Einstellungen",

    "common.search": "Suchen",
    "common.reset": "Zurücksetzen",
    "common.status": "Status",
    "common.actions": "Aktionen",
    "common.cancel": "Abbrechen",
    "common.save": "Speichern",
    "common.edit": "Bearbeiten",
    "common.delete": "Löschen",

    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Schneller Überblick über deine Nutzer und Aktivität.",

    cardTotalUsers: "Gesamtbenutzer",
    cardActiveUsers: "Aktive Benutzer",
    cardInactiveUsers: "Inaktive Benutzer",
    cardAdmins: "Admins",

    cardFootActiveRate: "Aktiv-Rate",
    cardFootActiveUsers: 'Benutzer mit Status "Aktiv"',
    cardFootInactiveUsers: "Benutzer derzeit inaktiv",
    cardFootAdmins: "Benutzer mit Admin-Rolle",

    totalOrders: "Gesamtbestellungen",
    pendingOrders: "Offen",
    shippedOrders: "Versendet",
    totalRevenue: "Gesamtumsatz",

    revenueOverviewTitle: "Umsatzübersicht",
    revenueOverviewSubtitle: "Umsatz der letzten 6 Monate (€)",
    revenueOverviewEmpty: "Nicht genügend Daten.",

    orderStatusDistributionTitle: "Bestellstatus-Verteilung",
    orderStatusDistributionSubtitle:
      "Aufschlüsselung von Offen, Versendet und Storniert",
    orderStatusDistributionEmpty: "Keine Bestellungen.",
    ordersLabel: "Bestellungen",

    orderStatusPending: "Ausstehend",
    orderStatusShipped: "Versendet",
    orderStatusCancelled: "Storniert",

    recentTitle: "Neueste Benutzer",
    recentSubtitle: "letzte Benutzer",
    recentEmpty: "Keine Benutzer gefunden.",

    recentOrdersTitle: "Letzte Bestellungen",
    latestOrdersLabel: "Letzte {count} Bestellungen",
    recentOrdersEmpty: "Keine Bestellungen gefunden.",

    thName: "Name",
    thEmail: "E-Mail",
    thRole: "Rolle",
    thStatus: "Status",
    thId: "ID",
    thCustomer: "Kunde",
    thTotal: "Summe",

    roleAdmin: "Admin",
    roleModerator: "Moderator",
    roleUser: "Benutzer",
    statusActive: "Aktiv",
    statusInactive: "Inaktiv",

    "users.title": "Benutzer",
    "users.subtitle":
      "Verwalte deine Kunden, Admins und Teammitglieder.",
    "users.addUser": "Benutzer hinzufügen",
    "users.name": "Name",
    "users.email": "E-Mail",
    "users.role": "Rolle",
    "users.lastActive": "Zuletzt aktiv",
    "users.createdAt": "Erstellt am",
    "users.searchPlaceholder": "Nach Name oder E-Mail suchen...",
    "users.filter.all": "Alle",
    "users.filter.active": "Aktiv",
    "users.filter.inactive": "Inaktiv",
    // PRODUCTS (DE)
    "products.title": "Produkte",
    "products.subtitle": "Verwalte deine Anime-, Manga- und Gaming-Artikel.",
    "products.addProduct": "Produkt hinzufügen",
    "products.editProduct": "Produkt bearbeiten",
    "products.nameLabel": "Name",
    "products.categoryLabel": "Kategorie",
    "products.fandomLabel": "Universum",
    "products.priceLabel": "Preis (€)",
    "products.stockLabel": "Bestand",
    "products.statusLabel": "Status",
    "products.searchPlaceholder": "Nach Name, Universum oder Kategorie suchen...",
    "products.filterAll": "Alle",
    "products.filterCategoryAll": "Alle Kategorien",
    "products.filterStatusAll": "Alle Status",
    "products.status.active": "Aktiv",
    "products.status.hidden": "Versteckt",
    "products.status.outOfStock": "Nicht auf Lager",
    "products.saveButton": "Speichern",
    "products.cancelButton": "Abbrechen",
    "products.editButton": "Bearbeiten",
    "products.deleteButton": "Löschen",
    "products.empty": "Für diesen Filter wurden keine Produkte gefunden.",
    "products.error.nameRequired": "Name ist erforderlich.",
    "products.error.priceInvalid": "Gib einen gültigen Preis ein.",
    "products.error.stockInvalid": "Bestand muss 0 oder größer sein.",
    "products.summary.totalProducts": "Gesamtprodukte",
    "products.summary.activeProducts": "Aktiv",
    "products.summary.lowStock": "Niedriger Bestand (≤5)",
    "products.summary.outOfStock": "Nicht auf Lager",
    "products.summary.inventoryValue": "Lagerwert",
    "products.resultsSummary": "Zeige {current} von {total} Produkten",
    
    
       "orders.title": "Bestellungen",
    "orders.subtitle": "Verfolge und verwalte aktuelle Bestellungen.",
    "orders.filterAll": "Alle",
    "orders.searchPlaceholder": "Nach Name, E-Mail oder ID suchen...",
    "orders.summaryTotalOrders": "Gesamtbestellungen",
    "orders.summaryTotalRevenue": "Gesamtumsatz",
    "orders.thId": "ID",
    "orders.thCustomer": "Kunde",
    "orders.thEmail": "E-Mail",
    "orders.thDate": "Datum",
    "orders.thTotal": "Summe",
    "orders.thStatusClickable": "Status (zum Ändern klicken)",
    "orders.thPayment": "Zahlung",
    "orders.empty": "Für diesen Filter wurden keine Bestellungen gefunden.",
    "orders.resultsSummary": "Zeige {current} von {total} Bestellungen",
    "orders.exportCsv": "Als CSV exportieren",
    "orders.detailsTitle": "Bestelldetails",
    "orders.detailsOrderId": "Bestell-ID",
    "orders.detailsCustomer": "Kunde",
    "orders.detailsEmail": "E-Mail",
    "orders.detailsDate": "Datum",
    "orders.detailsTotal": "Gesamtbetrag",
    "orders.detailsStatus": "Status",
    "orders.detailsPayment": "Zahlungsmethode",
    "orders.detailsClose": "Schließen",



    "settings.title": "Einstellungen",
    "settings.subtitle":
      "Verwalte dein Profil, deine Präferenzen und Benachrichtigungen.",
    "settings.profileTitle": "Profil",
    "settings.profileDesc":
      "Aktualisiere, wie dein Name im Admin Panel erscheint.",
    "settings.displayNameLabel": "Anzeigename",
    "settings.displayNamePlaceholder": "Dein Name",
    "settings.prefsTitle": "Präferenzen",
    "settings.prefsDesc":
      "Wähle Theme und Sprache für die Oberfläche.",
    "settings.themeLabel": "Theme",
    "settings.languageLabel": "Sprache",
    "settings.theme.dark": "Dunkel",
    "settings.theme.light": "Hell",
    "settings.theme.system": "System",
    "settings.notifTitle": "Benachrichtigungen",
    "settings.notifDesc":
      "Steuere, welche E-Mails du erhältst.",
    "settings.mainEmailLabel": "Wichtige E-Mail-Benachrichtigungen",
    "settings.mainEmailSub":
      "Bestell-Updates, wichtige Kontonachrichten.",
    "settings.weeklyLabel": "Wöchentliche Zusammenfassung",
    "settings.weeklySub":
      "Wöchentliche Übersicht über Nutzer und Bestellungen.",
    "settings.savedPill": "Einstellungen gespeichert",
  },

  /* -------------------------------------------------------
   * SPANISH
   * ----------------------------------------------------- */
  es: {
    "nav.logo": "Mi Panel",
    "nav.dashboard": "Panel",
    "nav.users": "Usuarios",
    "nav.products": "Productos",
    "nav.orders": "Pedidos",
    "nav.settings": "Ajustes",
    "nav.welcome": "Bienvenido de nuevo",

    titleDashboard: "Panel",
    titleUsers: "Usuarios",
    titleProducts: "Productos",
    titleOrders: "Pedidos",
    titleSettings: "Ajustes",

    "common.search": "Buscar",
    "common.reset": "Reiniciar",
    "common.status": "Estado",
    "common.actions": "Acciones",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",

    dashboardTitle: "Panel",
    dashboardSubtitle: "Resumen rápido de tus usuarios y actividad.",

    cardTotalUsers: "Usuarios totales",
    cardActiveUsers: "Usuarios activos",
    cardInactiveUsers: "Usuarios inactivos",
    cardAdmins: "Administradores",

    cardFootActiveRate: "Tasa de actividad",
    cardFootActiveUsers:
      'Usuarios con estado "Activo"',
    cardFootInactiveUsers: "Usuarios actualmente inactivos",
    cardFootAdmins: "Usuarios con rol de Admin",

    totalOrders: "Pedidos totales",
    pendingOrders: "Pendientes",
    shippedOrders: "Enviados",
    totalRevenue: "Ingresos totales",

    revenueOverviewTitle: "Resumen de ingresos",
    revenueOverviewSubtitle:
      "Ingresos de los últimos 6 meses (€)",
    revenueOverviewEmpty: "No hay suficientes datos.",

    orderStatusDistributionTitle:
      "Distribución del estado de los pedidos",
    orderStatusDistributionSubtitle:
      "Reparto entre Pendientes, Enviados y Cancelados",
    orderStatusDistributionEmpty: "No hay pedidos.",
    ordersLabel: "pedidos",

    orderStatusPending: "Pendiente",
    orderStatusShipped: "Enviado",
    orderStatusCancelled: "Cancelado",

    recentTitle: "Usuarios recientes",
    recentSubtitle: "últimos usuarios",
    recentEmpty:
      "No se encontraron usuarios. Ve a la página de Users para añadir tu primer usuario.",

    recentOrdersTitle: "Pedidos recientes",
    latestOrdersLabel: "Últimos {count} pedidos",
    recentOrdersEmpty: "No se encontraron pedidos recientes.",

    thName: "Nombre",
    thEmail: "Correo",
    thRole: "Rol",
    thStatus: "Estado",
    thId: "ID",
    thCustomer: "Cliente",
    thTotal: "Total",

    roleAdmin: "Admin",
    roleModerator: "Moderador",
    roleUser: "Usuario",
    statusActive: "Activo",
    statusInactive: "Inactivo",

    "users.title": "Usuarios",
    "users.subtitle":
      "Administra a tus clientes, administradores y equipo.",
    "users.addUser": "Añadir usuario",
    "users.name": "Nombre",
    "users.email": "Correo electrónico",
    "users.role": "Rol",
    "users.lastActive": "Última actividad",
    "users.createdAt": "Creado en",
    "users.searchPlaceholder": "Buscar por nombre o correo...",
    "users.filter.all": "Todos",
    "users.filter.active": "Activos",
    "users.filter.inactive": "Inactivos",
    // PRODUCTS
    "products.title": "Productos",
    "products.subtitle": "Gestiona tus productos de anime, manga y gaming.",
    "products.addProduct": "Añadir producto",
    "products.editProduct": "Editar producto",
    "products.nameLabel": "Nombre",
    "products.categoryLabel": "Categoría",
    "products.fandomLabel": "Universo",
    "products.priceLabel": "Precio (€)",
    "products.stockLabel": "Stock",
    "products.statusLabel": "Estado",
    "products.searchPlaceholder": "Buscar por nombre, universo, categoría...",
    "products.filterAll": "Todos",
    "products.filterCategoryAll": "Todas las categorías",
    "products.filterStatusAll": "Todos los estados",
    "products.status.active": "Activo",
    "products.status.hidden": "Oculto",
    "products.status.outOfStock": "Sin stock",
    "products.saveButton": "Guardar",
    "products.cancelButton": "Cancelar",
    "products.editButton": "Editar",
    "products.deleteButton": "Eliminar",
    "products.empty": "No se encontraron productos para este filtro.",
    "products.error.nameRequired": "El nombre es obligatorio.",
    "products.error.priceInvalid": "Introduce un precio válido.",
    "products.error.stockInvalid": "El stock debe ser 0 o mayor.",
    "products.summary.totalProducts": "Productos totales",
    "products.summary.activeProducts": "Activos",
    "products.summary.lowStock": "Bajo stock (≤5)",
    "products.summary.outOfStock": "Sin stock",
    "products.summary.inventoryValue": "Valor del inventario",
    "products.resultsSummary": "Mostrando {current} de {total} productos",

        "orders.title": "Pedidos",
    "orders.subtitle": "Controla y gestiona los pedidos recientes.",
    "orders.filterAll": "Todos",
    "orders.searchPlaceholder": "Buscar por nombre, correo, ID...",
    "orders.summaryTotalOrders": "Pedidos totales",
    "orders.summaryTotalRevenue": "Ingresos totales",
    "orders.thId": "ID",
    "orders.thCustomer": "Cliente",
    "orders.thEmail": "Correo",
    "orders.thDate": "Fecha",
    "orders.thTotal": "Total",
    "orders.thStatusClickable": "Estado (clic para cambiar)",
    "orders.thPayment": "Pago",
    "orders.empty": "No se encontraron pedidos para este filtro.",
    "orders.resultsSummary": "Mostrando {current} de {total} pedidos",
    "orders.exportCsv": "Exportar CSV",
    "orders.detailsTitle": "Detalles del pedido",
    "orders.detailsOrderId": "ID del pedido",
    "orders.detailsCustomer": "Cliente",
    "orders.detailsEmail": "Correo",
    "orders.detailsDate": "Fecha",
    "orders.detailsTotal": "Importe total",
    "orders.detailsStatus": "Estado",
    "orders.detailsPayment": "Método de pago",
    "orders.detailsClose": "Cerrar",

    "settings.title": "Ajustes",
    "settings.subtitle":
      "Administra tu perfil, preferencias y notificaciones.",
    "settings.profileTitle": "Perfil",
    "settings.profileDesc":
      "Actualiza cómo aparece tu nombre en el panel.",
    "settings.displayNameLabel": "Nombre visible",
    "settings.displayNamePlaceholder": "Tu nombre",
    "settings.prefsTitle": "Preferencias",
    "settings.prefsDesc":
      "Elige el tema y el idioma de la interfaz.",
    "settings.themeLabel": "Tema",
    "settings.languageLabel": "Idioma",
    "settings.theme.dark": "Oscuro",
    "settings.theme.light": "Claro",
    "settings.theme.system": "Sistema",
    "settings.notifTitle": "Notificaciones",
    "settings.notifDesc":
      "Controla qué correos recibes sobre la actividad.",
    "settings.mainEmailLabel": "Alertas principales por correo",
    "settings.mainEmailSub":
      "Actualizaciones de pedidos y mensajes importantes.",
    "settings.weeklyLabel": "Resumen semanal",
    "settings.weeklySub":
      "Recibe un resumen semanal de usuarios y pedidos.",
    "settings.savedPill": "Ajustes guardados",
  },

  /* -------------------------------------------------------
   * FRENCH
   * ----------------------------------------------------- */
  fr: {
    "nav.logo": "Mon Admin",
    "nav.dashboard": "Tableau de bord",
    "nav.users": "Utilisateurs",
    "nav.products": "Produits",
    "nav.orders": "Commandes",
    "nav.settings": "Paramètres",
    "nav.welcome": "Ravi de te revoir",

    titleDashboard: "Tableau de bord",
    titleUsers: "Utilisateurs",
    titleProducts: "Produits",
    titleOrders: "Commandes",
    titleSettings: "Paramètres",

    "common.search": "Rechercher",
    "common.reset": "Réinitialiser",
    "common.status": "Statut",
    "common.actions": "Actions",
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",

    dashboardTitle: "Tableau de bord",
    dashboardSubtitle:
      "Aperçu rapide de vos utilisateurs et de leur activité.",

    cardTotalUsers: "Utilisateurs totaux",
    cardActiveUsers: "Utilisateurs actifs",
    cardInactiveUsers: "Utilisateurs inactifs",
    cardAdmins: "Administrateurs",

    cardFootActiveRate: "Taux d'activité",
    cardFootActiveUsers:
      'Utilisateurs avec le statut "Actif"',
    cardFootInactiveUsers:
      "Utilisateurs actuellement inactifs",
    cardFootAdmins:
      "Utilisateurs avec le rôle Admin",

    totalOrders: "Commandes totales",
    pendingOrders: "En attente",
    shippedOrders: "Expédiées",
    totalRevenue: "Revenu total",

    revenueOverviewTitle: "Aperçu des revenus",
    revenueOverviewSubtitle:
      "Revenus des 6 derniers mois (€)",
    revenueOverviewEmpty:
      "Pas assez de données pour afficher.",

    orderStatusDistributionTitle:
      "Répartition du statut des commandes",
    orderStatusDistributionSubtitle:
      "Répartition entre En attente, Expédiées et Annulées",
    orderStatusDistributionEmpty:
      "Aucune commande à afficher.",
    ordersLabel: "commandes",

    orderStatusPending: "En attente",
    orderStatusShipped: "Expédiée",
    orderStatusCancelled: "Annulée",

    recentTitle: "Utilisateurs récents",
    recentSubtitle: "derniers utilisateurs",
    recentEmpty:
      "Aucun utilisateur trouvé. Allez sur la page Users pour ajouter votre premier utilisateur.",

    recentOrdersTitle: "Commandes récentes",
    latestOrdersLabel:
      "Dernières {count} commandes",
    recentOrdersEmpty:
      "Aucune commande récente trouvée.",

    thName: "Nom",
    thEmail: "E-mail",
    thRole: "Rôle",
    thStatus: "Statut",
    thId: "ID",
    thCustomer: "Client",
    thTotal: "Total",

    roleAdmin: "Admin",
    roleModerator: "Modérateur",
    roleUser: "Utilisateur",
    statusActive: "Actif",
    statusInactive: "Inactif",

    "users.title": "Utilisateurs",
    "users.subtitle":
      "Gérez vos clients, administrateurs et membres d'équipe.",
    "users.addUser": "Ajouter un utilisateur",
    "users.name": "Nom",
    "users.email": "E-mail",
    "users.role": "Rôle",
    "users.lastActive": "Dernière activité",
    "users.createdAt": "Créé le",
    "users.searchPlaceholder":
      "Rechercher par nom ou e-mail...",
    "users.filter.all": "Tous",
    "users.filter.active": "Actifs",
    "users.filter.inactive": "Inactifs",
    // PRODUCTS
    "products.title": "Produits",
    "products.subtitle": "Gérez vos articles d’anime, de manga et de gaming.",
    "products.addProduct": "Ajouter un produit",
    "products.editProduct": "Modifier le produit",
    "products.nameLabel": "Nom",
    "products.categoryLabel": "Catégorie",
    "products.fandomLabel": "Univers",
    "products.priceLabel": "Prix (€)",
    "products.stockLabel": "Stock",
    "products.statusLabel": "Statut",
    "products.searchPlaceholder": "Rechercher par nom, univers, catégorie...",
    "products.filterAll": "Tous",
    "products.filterCategoryAll": "Toutes les catégories",
    "products.filterStatusAll": "Tous les statuts",
    "products.status.active": "Actif",
    "products.status.hidden": "Masqué",
    "products.status.outOfStock": "Rupture de stock",
    "products.saveButton": "Enregistrer",
    "products.cancelButton": "Annuler",
    "products.editButton": "Modifier",
    "products.deleteButton": "Supprimer",
    "products.empty": "Aucun produit trouvé pour ce filtre.",
    "products.error.nameRequired": "Le nom est obligatoire.",
    "products.error.priceInvalid": "Saisissez un prix valide.",
    "products.error.stockInvalid": "Le stock doit être supérieur ou égal à 0.",
    "products.summary.totalProducts": "Produits totaux",
    "products.summary.activeProducts": "Actifs",
    "products.summary.lowStock": "Stock faible (≤5)",
    "products.summary.outOfStock": "Rupture de stock",
    "products.summary.inventoryValue": "Valeur du stock",
    "products.resultsSummary": "Affichage de {current} sur {total} produits",

        "orders.title": "Commandes",
    "orders.subtitle": "Suivez et gérez les commandes récentes.",
    "orders.filterAll": "Toutes",
    "orders.searchPlaceholder": "Rechercher par nom, e-mail, ID...",
    "orders.summaryTotalOrders": "Commandes totales",
    "orders.summaryTotalRevenue": "Revenu total",
    "orders.thId": "ID",
    "orders.thCustomer": "Client",
    "orders.thEmail": "E-mail",
    "orders.thDate": "Date",
    "orders.thTotal": "Total",
    "orders.thStatusClickable": "Statut (cliquer pour changer)",
    "orders.thPayment": "Paiement",
    "orders.empty": "Aucune commande trouvée pour ce filtre.",
    "orders.resultsSummary": "Affichage de {current} sur {total} commandes",
    "orders.exportCsv": "Exporter en CSV",
    "orders.detailsTitle": "Détails de la commande",
    "orders.detailsOrderId": "ID de commande",
    "orders.detailsCustomer": "Client",
    "orders.detailsEmail": "E-mail",
    "orders.detailsDate": "Date",
    "orders.detailsTotal": "Montant total",
    "orders.detailsStatus": "Statut",
    "orders.detailsPayment": "Méthode de paiement",
    "orders.detailsClose": "Fermer",


    "settings.title": "Paramètres",
    "settings.subtitle":
      "Gérez votre profil, vos préférences et notifications.",
    "settings.profileTitle": "Profil",
    "settings.profileDesc":
      "Mettez à jour la façon dont votre nom apparaît.",
    "settings.displayNameLabel": "Nom affiché",
    "settings.displayNamePlaceholder": "Votre nom",
    "settings.prefsTitle": "Préférences",
    "settings.prefsDesc":
      "Choisissez le thème et la langue de l'interface.",
    "settings.themeLabel": "Thème",
    "settings.languageLabel": "Langue",
    "settings.theme.dark": "Sombre",
    "settings.theme.light": "Clair",
    "settings.theme.system": "Système",
    "settings.notifTitle": "Notifications",
    "settings.notifDesc":
      "Contrôlez les e-mails que vous recevez.",
    "settings.mainEmailLabel":
      "Alertes principales par e-mail",
    "settings.mainEmailSub":
      "Mises à jour de commandes, messages importants.",
    "settings.weeklyLabel": "Récapitulatif hebdomadaire",
    "settings.weeklySub":
      "Recevez un résumé des utilisateurs et commandes.",
    "settings.savedPill": "Paramètres enregistrés",
  },

  /* -------------------------------------------------------
   * ITALIAN
   * ----------------------------------------------------- */
  it: {
    "nav.logo": "Pannello Admin",
    "nav.dashboard": "Dashboard",
    "nav.users": "Utenti",
    "nav.products": "Prodotti",
    "nav.orders": "Ordini",
    "nav.settings": "Impostazioni",
    "nav.welcome": "Bentornato",

    titleDashboard: "Dashboard",
    titleUsers: "Utenti",
    titleProducts: "Prodotti",
    titleOrders: "Ordini",
    titleSettings: "Impostazioni",

    "common.search": "Cerca",
    "common.reset": "Reimposta",
    "common.status": "Stato",
    "common.actions": "Azioni",
    "common.cancel": "Annulla",
    "common.save": "Salva",
    "common.edit": "Modifica",
    "common.delete": "Elimina",

    dashboardTitle: "Dashboard",
    dashboardSubtitle:
      "Panoramica rapida dei tuoi utenti e attività.",

    cardTotalUsers: "Utenti totali",
    cardActiveUsers: "Utenti attivi",
    cardInactiveUsers: "Utenti inattivi",
    cardAdmins: "Amministratori",

    cardFootActiveRate: "Tasso di attività",
    cardFootActiveUsers:
      'Utenti con stato "Attivo"',
    cardFootInactiveUsers:
      "Utenti attualmente inattivi",
    cardFootAdmins:
      "Utenti con ruolo Admin",

    totalOrders: "Ordini totali",
    pendingOrders: "In attesa",
    shippedOrders: "Spediti",
    totalRevenue: "Entrate totali",

    revenueOverviewTitle: "Panoramica entrate",
    revenueOverviewSubtitle:
      "Entrate degli ultimi 6 mesi (€)",
    revenueOverviewEmpty:
      "Dati insufficienti per la visualizzazione.",

    orderStatusDistributionTitle:
      "Distribuzione stato ordini",
    orderStatusDistributionSubtitle:
      "Ripartizione tra In attesa, Spediti e Annullati",
    orderStatusDistributionEmpty:
      "Nessun ordine da mostrare.",
    ordersLabel: "ordini",

    orderStatusPending: "In attesa",
    orderStatusShipped: "Spedito",
    orderStatusCancelled: "Annullato",

    recentTitle: "Utenti recenti",
    recentSubtitle: "ultimi utenti",
    recentEmpty:
      "Nessun utente trovato. Vai alla pagina Users per aggiungere il primo utente.",

    recentOrdersTitle: "Ordini recenti",
    latestOrdersLabel: "Ultimi {count} ordini",
    recentOrdersEmpty:
      "Nessun ordine recente trovato.",

    thName: "Nome",
    thEmail: "Email",
    thRole: "Ruolo",
    thStatus: "Stato",
    thId: "ID",
    thCustomer: "Cliente",
    thTotal: "Totale",

    roleAdmin: "Admin",
    roleModerator: "Moderatore",
    roleUser: "Utente",
    statusActive: "Attivo",
    statusInactive: "Inattivo",

    "users.title": "Utenti",
    "users.subtitle":
      "Gestisci clienti, amministratori e membri del team.",
    "users.addUser": "Aggiungi utente",
    "users.name": "Nome",
    "users.email": "Email",
    "users.role": "Ruolo",
    "users.lastActive": "Ultima attività",
    "users.createdAt": "Creato il",
    "users.searchPlaceholder":
      "Cerca per nome o email...",
    "users.filter.all": "Tutti",
    "users.filter.active": "Attivi",
    "users.filter.inactive": "Inattivi",
    // PRODUCTS
    "products.title": "Prodotti",
    "products.subtitle": "Gestisci i tuoi articoli anime, manga e gaming.",
    "products.addProduct": "Aggiungi prodotto",
    "products.editProduct": "Modifica prodotto",
    "products.nameLabel": "Nome",
    "products.categoryLabel": "Categoria",
    "products.fandomLabel": "Universo",
    "products.priceLabel": "Prezzo (€)",
    "products.stockLabel": "Stock",
    "products.statusLabel": "Stato",
    "products.searchPlaceholder": "Cerca per nome, universo, categoria...",
    "products.filterAll": "Tutti",
    "products.filterCategoryAll": "Tutte le categorie",
    "products.filterStatusAll": "Tutti gli stati",
    "products.status.active": "Attivo",
    "products.status.hidden": "Nascosto",
    "products.status.outOfStock": "Esaurito",
    "products.saveButton": "Salva",
    "products.cancelButton": "Annulla",
    "products.editButton": "Modifica",
    "products.deleteButton": "Elimina",
    "products.empty": "Nessun prodotto trovato per questo filtro.",
    "products.error.nameRequired": "Il nome è obbligatorio.",
    "products.error.priceInvalid": "Inserisci un prezzo valido.",
    "products.error.stockInvalid": "Lo stock deve essere 0 o maggiore.",
    "products.summary.totalProducts": "Prodotti totali",
    "products.summary.activeProducts": "Attivi",
    "products.summary.lowStock": "Scorte basse (≤5)",
    "products.summary.outOfStock": "Esauriti",
    "products.summary.inventoryValue": "Valore dell'inventario",
    "products.resultsSummary": "Visualizzazione di {current} su {total} prodotti",

       "orders.title": "Ordini",
    "orders.subtitle": "Monitora e gestisci gli ordini recenti.",
    "orders.filterAll": "Tutti",
    "orders.searchPlaceholder": "Cerca per nome, email, ID...",
    "orders.summaryTotalOrders": "Ordini totali",
    "orders.summaryTotalRevenue": "Entrate totali",
    "orders.thId": "ID",
    "orders.thCustomer": "Cliente",
    "orders.thEmail": "Email",
    "orders.thDate": "Data",
    "orders.thTotal": "Totale",
    "orders.thStatusClickable": "Stato (clicca per cambiare)",
    "orders.thPayment": "Pagamento",
    "orders.empty": "Nessun ordine trovato per questo filtro.",
    "orders.resultsSummary": "Visualizzazione di {current} su {total} ordini",
    "orders.exportCsv": "Esporta CSV",
    "orders.detailsTitle": "Dettagli ordine",
    "orders.detailsOrderId": "ID ordine",
    "orders.detailsCustomer": "Cliente",
    "orders.detailsEmail": "Email",
    "orders.detailsDate": "Data",
    "orders.detailsTotal": "Importo totale",
    "orders.detailsStatus": "Stato",
    "orders.detailsPayment": "Metodo di pagamento",
    "orders.detailsClose": "Chiudi",

    "settings.title": "Impostazioni",
    "settings.subtitle":
      "Gestisci profilo, preferenze e notifiche.",
    "settings.profileTitle": "Profilo",
    "settings.profileDesc":
      "Aggiorna come appare il tuo nome nel pannello.",
    "settings.displayNameLabel": "Nome visualizzato",
    "settings.displayNamePlaceholder": "Il tuo nome",
    "settings.prefsTitle": "Preferenze",
    "settings.prefsDesc":
      "Scegli tema e lingua dell'interfaccia.",
    "settings.themeLabel": "Tema",
    "settings.languageLabel": "Lingua",
    "settings.theme.dark": "Scuro",
    "settings.theme.light": "Chiaro",
    "settings.theme.system": "Sistema",
    "settings.notifTitle": "Notifiche",
    "settings.notifDesc":
      "Controlla quali email ricevi.",
    "settings.mainEmailLabel":
      "Avvisi email principali",
    "settings.mainEmailSub":
      "Aggiornamenti degli ordini e messaggi importanti.",
    "settings.weeklyLabel": "Riepilogo settimanale",
    "settings.weeklySub":
      "Ricevi un riepilogo settimanale di utenti e ordini.",
    "settings.savedPill": "Impostazioni salvate",
  },

  /* -------------------------------------------------------
   * RUSSIAN
   * ----------------------------------------------------- */
  ru: {
    "nav.logo": "Админ панель",
    "nav.dashboard": "Панель",
    "nav.users": "Пользователи",
    "nav.products": "Товары",
    "nav.orders": "Заказы",
    "nav.settings": "Настройки",
    "nav.welcome": "С возвращением",

    titleDashboard: "Панель",
    titleUsers: "Пользователи",
    titleProducts: "Товары",
    titleOrders: "Заказы",
    titleSettings: "Настройки",

    "common.search": "Поиск",
    "common.reset": "Сброс",
    "common.status": "Статус",
    "common.actions": "Действия",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.edit": "Редактировать",
    "common.delete": "Удалить",

    dashboardTitle: "Панель",
    dashboardSubtitle:
      "Быстрый обзор пользователей и активности.",

    cardTotalUsers: "Всего пользователей",
    cardActiveUsers: "Активные пользователи",
    cardInactiveUsers: "Неактивные пользователи",
    cardAdmins: "Администраторы",

    cardFootActiveRate: "Доля активных",
    cardFootActiveUsers:
      'Пользователи со статусом "Активен"',
    cardFootInactiveUsers:
      "Пользователи, которые сейчас неактивны",
    cardFootAdmins:
      "Пользователи с ролью Admin",

    totalOrders: "Всего заказов",
    pendingOrders: "В ожидании",
    shippedOrders: "Отправленные",
    totalRevenue: "Общая выручка",

    revenueOverviewTitle: "Обзор доходов",
    revenueOverviewSubtitle:
      "Доход за последние 6 месяцев (€)",
    revenueOverviewEmpty:
      "Недостаточно данных для отображения.",

    orderStatusDistributionTitle:
      "Распределение статусов заказов",
    orderStatusDistributionSubtitle:
      "Доля заказов В ожидании, Отправленных и Отменённых",
    orderStatusDistributionEmpty:
      "Нет заказов для отображения.",
    ordersLabel: "заказов",

    orderStatusPending: "В ожидании",
    orderStatusShipped: "Отправлен",
    orderStatusCancelled: "Отменён",

    recentTitle: "Недавние пользователи",
    recentSubtitle: "последние пользователи",
    recentEmpty:
      "Пользователи не найдены.",

    recentOrdersTitle: "Недавние заказы",
    latestOrdersLabel:
      "Последние {count} заказов",
    recentOrdersEmpty:
      "Недавние заказы не найдены.",

    thName: "Имя",
    thEmail: "E-mail",
    thRole: "Роль",
    thStatus: "Статус",
    thId: "ID",
    thCustomer: "Клиент",
    thTotal: "Сумма",

    roleAdmin: "Админ",
    roleModerator: "Модератор",
    roleUser: "Пользователь",
    statusActive: "Активен",
    statusInactive: "Неактивен",

    "users.title": "Пользователи",
    "users.subtitle":
      "Управляйте клиентами, администраторами и командой.",
    "users.addUser": "Добавить пользователя",
    "users.name": "Имя",
    "users.email": "E-mail",
    "users.role": "Роль",
    "users.lastActive": "Последняя активность",
    "users.createdAt": "Создан",
    "users.searchPlaceholder":
      "Поиск по имени или e-mail...",
    "users.filter.all": "Все",
    "users.filter.active": "Активные",
    "users.filter.inactive": "Неактивные",
    // PRODUCTS
    "products.title": "Товары",
    "products.subtitle": "Управляйте товарами по аниме, манге и играм.",
    "products.addProduct": "Добавить товар",
    "products.editProduct": "Редактировать товар",
    "products.nameLabel": "Название",
    "products.categoryLabel": "Категория",
    "products.fandomLabel": "Вселенная",
    "products.priceLabel": "Цена (€)",
    "products.stockLabel": "Остаток",
    "products.statusLabel": "Статус",
    "products.searchPlaceholder": "Поиск по названию, вселенной, категории...",
    "products.filterAll": "Все",
    "products.filterCategoryAll": "Все категории",
    "products.filterStatusAll": "Все статусы",
    "products.status.active": "Активен",
    "products.status.hidden": "Скрыт",
    "products.status.outOfStock": "Нет в наличии",
    "products.saveButton": "Сохранить",
    "products.cancelButton": "Отмена",
    "products.editButton": "Изменить",
    "products.deleteButton": "Удалить",
    "products.empty": "Для этого фильтра товары не найдены.",
    "products.error.nameRequired": "Название обязательно.",
    "products.error.priceInvalid": "Введите корректную цену.",
    "products.error.stockInvalid": "Остаток должен быть 0 или больше.",
    "products.summary.totalProducts": "Всего товаров",
    "products.summary.activeProducts": "Активные",
    "products.summary.lowStock": "Малый остаток (≤5)",
    "products.summary.outOfStock": "Нет в наличии",
    "products.summary.inventoryValue": "Стоимость склада",
    "products.resultsSummary": "Показано {current} из {total} товаров",

       "orders.title": "Заказы",
    "orders.subtitle": "Отслеживайте и управляйте последними заказами.",
    "orders.filterAll": "Все",
    "orders.searchPlaceholder": "Поиск по имени, e-mail или ID...",
    "orders.summaryTotalOrders": "Всего заказов",
    "orders.summaryTotalRevenue": "Общая выручка",
    "orders.thId": "ID",
    "orders.thCustomer": "Клиент",
    "orders.thEmail": "E-mail",
    "orders.thDate": "Дата",
    "orders.thTotal": "Сумма",
    "orders.thStatusClickable": "Статус (кликните, чтобы изменить)",
    "orders.thPayment": "Оплата",
    "orders.empty": "Для этого фильтра заказы не найдены.",
    "orders.resultsSummary": "Показано {current} из {total} заказов",
    "orders.exportCsv": "Экспорт CSV",
    "orders.detailsTitle": "Детали заказа",
    "orders.detailsOrderId": "ID заказа",
    "orders.detailsCustomer": "Клиент",
    "orders.detailsEmail": "E-mail",
    "orders.detailsDate": "Дата",
    "orders.detailsTotal": "Итоговая сумма",
    "orders.detailsStatus": "Статус",
    "orders.detailsPayment": "Способ оплаты",
    "orders.detailsClose": "Закрыть",


    "settings.title": "Настройки",
    "settings.subtitle":
      "Управляйте профилем, предпочтениями и уведомлениями.",
    "settings.profileTitle": "Профиль",
    "settings.profileDesc":
      "Обновите, как ваше имя отображается в панели.",
    "settings.displayNameLabel": "Отображаемое имя",
    "settings.displayNamePlaceholder": "Ваше имя",
    "settings.prefsTitle": "Предпочтения",
    "settings.prefsDesc":
      "Выберите тему и язык интерфейса.",
    "settings.themeLabel": "Тема",
    "settings.languageLabel": "Язык",
    "settings.theme.dark": "Тёмная",
    "settings.theme.light": "Светлая",
    "settings.theme.system": "Системная",
    "settings.notifTitle": "Уведомления",
    "settings.notifDesc":
      "Управляйте e-mail уведомлениями.",
    "settings.mainEmailLabel":
      "Основные e-mail уведомления",
    "settings.mainEmailSub":
      "Обновления по заказам, важные сообщения аккаунта.",
    "settings.weeklyLabel": "Еженедельный обзор",
    "settings.weeklySub":
      "Получайте еженедельный отчёт по пользователям и заказам.",
    "settings.savedPill": "Настройки сохранены",
  },
};

export default translations;
