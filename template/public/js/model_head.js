/*
 * model_head.js
 * Padanan <script> di head.blade.php: membuat objek global `model`
 * (root view-model Knockout) yang dipakai semua halaman dan
 * di-bind oleh ko.applyBindings(model) di applyBindings_Main.js.
 *
 * Data dari server (diisi layout main.html):
 *   window.AUTH_USER      { user_id, role_id, role_name, permissions }
 *   window.CURRENT_MODULE modul aktif, mis. "units"
 *
 * Library yang harus sudah dimuat sebelum file ini:
 *   knockout, moment
 */

/**
 * Deteksi module dari URL, dicocokkan dengan key permission.
 * /master-data/units -> "units" (jika ada di permissions)
 */
function detectCurrentModule() {
    const permissions = window.AUTH_USER?.permissions || {};

    const path = window.location.pathname
        .split('/')
        .filter(Boolean);

    if (!path.length) {
        return null;
    }

    // Ambil kandidat module dari URL
    let candidates = [];

    if (path[0] === 'api') {
        candidates.push(path[1]);
    } else {
        candidates.push(path[0]);
    }

    // Tambahkan kandidat berdasarkan seluruh segment URL
    candidates = candidates.concat(path);

    // Cari module yang benar-benar ada di permission
    for (const candidate of candidates) {
        if (!candidate) continue;

        const module = candidate.replace(/-/g, '_');

        if (permissions[module]) {
            return module;
        }
    }

    return null;
}

function getFirstPrefix() {
    var path = window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    return parts.length ? '/' + parts[0] : '';
}

window.appPrefix = window.AUTH_USER?.role_name || "";

var model = {
    /**
     * ============================================================
     * AUTH
     * ============================================================
     */
    check_user_id: ko.observable(
        window.AUTH_USER?.user_id ?? null
    ),

    check_role_id: ko.observable(
        window.AUTH_USER?.role_id ?? null
    ),

    check_role_name: ko.observable(
        window.AUTH_USER?.role_name ?? null
    ),

    permissions: ko.observable(
        window.AUTH_USER?.permissions ?? {}
    ),

    /**
     * ============================================================
     * CURRENT MODULE
     * ============================================================
     */
    current_module: ko.observable(
        window.CURRENT_MODULE || detectCurrentModule()
    ),

    /**
     * ============================================================
     * PERMISSION ENGINE
     * ============================================================
     *
     * model.permission("update")            -> module = current_module
     * model.permission("units", "update")   -> module eksplisit
     *
     * Action: view, read, create, update, delete
     */
    permission: function (module, action) {

        if (action === undefined) {
            action = module;
            module = model.current_module();
        }

        const permissions = model.permissions();

        if (!permissions || !module || !action) {
            return false;
        }

        return permissions[module]?.[action] === true;
    },

    Processing: ko.observable(true),
    ProcessingContent: ko.observable(false),
    checkPass: ko.observable(false),
    CheckId: ko.observable(false),
    changeRupiah: ko.observable(''),
    URI_PAGE: 4, // setup uri access on pages.
    CheckValue: ko.observable(false),
    errorMessage: ko.observable('This field is required!'),
    notAllowedMessage: ko.observable('Email Not Allowed!'),
    acceptMessage: ko.observable('Email is allowed.'),
    giftWrap: ko.observable(true),
    role: getFirstPrefix(),
    dateNow: moment().format('YYYY-MM-DD'),
    timeNow: moment().format('HH:mm'),

    // Di Laravel: "{{ url('/') }}"
    baseUrl: window.location.origin,

    // Prefix route JSON Gin. Di Laravel endpoint memakai model.role + "/units/...";
    // di Gin semua endpoint JSON ada di bawah /api.
    api: "/api"
};

model.changeRupiah = function (value) {
    var number_string = value.toString(),
        sisa = number_string.length % 3,
        rupiah = number_string.substr(0, sisa),
        ribuan = number_string.substr(sisa).match(/\d{3}/g);
    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
        rupiah = 'Rp ' + rupiah;
    }
    return rupiah;
};

model.Resource = {
    logout: 'url-logout',
    /* isikan value dari rootingnya  (url dengan uri = 1)*/
    notif: 'Anda yakin? Anda Akan ',
};

const canUpdate = model.permission('update');
const canDelete = model.permission('delete');

const UpdateClass = canUpdate ? '' : 'permission-disabled';
const DeleteClass = canDelete ? '' : 'permission-disabled';
