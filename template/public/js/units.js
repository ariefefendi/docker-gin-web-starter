/*
 * Module : Units
 * Padanan <script> di UnitsView.blade.php (arsitektur sama):
 *
 *   model.masterModel  -> bentuk record kosong
 *   units              -> view-model halaman (dipakai lewat data-bind="with: units")
 *   units.back / selectdata / save / remove
 *   units.grid         -> jQuery DataTable server side
 *
 * File ini dimuat SEBELUM applyBindings_Main.js, karena
 * ko.applyBindings(model) butuh objek `units` sudah ada.
 *
 * Endpoint Gin (base = model.api = "/api"):
 *   POST   /api/master-data/units/data     -> datatable
 *   GET    /api/master-data/units/select   -> satu data  (?reference=)
 *   POST   /api/master-data/units          -> insert     (JSON)
 *   PUT    /api/master-data/units          -> update     (JSON)
 *   DELETE /api/master-data/units          -> delete     (?reference=)
 */

(function () {
    "use strict";

    var API = model.api + "/master-data/units";

    model.masterModel = {
        id: "",
        reference: "",
        code: "",
        name: "",
        description: "",
        is_active: true,
        SELECTFILTERVALUE: [
            {name: "code", value: "code"},
            {name: "name", value: "name"},
            {name: "description", value: "description"},
            {name: "is_active", value: "is_active"},
        ],
        MODE: "",
    };

    window.units = {
        Recordunits: ko.mapping.fromJS(model.masterModel),
        Listunits: ko.observableArray([]),
        Mode: ko.observable(""),
        status: ko.observable("Nothing"),
        FilterText: ko.observable(""),
        DataFilter: ko.observableArray(["code", "name", "description", "is_active"]),
        FilterValue: ko.observable("code"),
    };

    /**
     * Escape teks sebelum dimasukkan ke HTML (mencegah XSS di DataTable).
     */
    units.escapeHtml = function (value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
            return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c];
        });
    };

    /**
     * Tampilkan pesan error dari respons JSON Gin.
     * Bentuk: {result, message} atau {result, errors: string | {field: pesan}}
     */
    units.showError = function (xhr) {
        var res = (xhr && xhr.responseJSON) || {};
        var msg = res.message || res.errors || "Terjadi kesalahan.";

        if (typeof msg === "object") {
            msg = Object.keys(msg).map(function (k) { return msg[k]; }).join(" ");
        }

        Swal.fire("Gagal", msg, "error");
    };

    units.back = function (tab) {
        units.Mode("");
        // reset formValidations
        model.resetFormValidation("#formValidations");

        units.grid.ajax.reload(null, true);
        ko.mapping.fromJS(model.masterModel, units.Recordunits);
        model.activetab(tab);
    };

    units.selectdata = function (reference) {
        model.Processing(true);
        units.back(0);
        units.Mode("Update");

        $.get(
            API + "/select",
            {
                reference: reference
            },
            function (res) {

                ko.mapping.fromJS(
                    res,
                    {},
                    units.Recordunits
                );

                // Nilai true/false (atau 1/0) -> boolean untuk checkbox
                units.Recordunits.is_active(
                    res.is_active === true || Number(res.is_active) === 1
                );

                model.Processing(false);

            }
        ).fail(function () {

            model.Processing(false);

            alert("Gagal mengambil data");
        });
    };

    units.save = function () {

        if (!model.formValidation("#formValidations")) {
            alert_InValidField();
            return false;
        }

        var val = ko.toJS(units.Recordunits);

        // Gin memakai JSON: is_active harus boolean (true/false)
        val.is_active = !!val.is_active;

        var isUpdate = units.Mode() === "Update";

        // ajaxPost (applyBindings_Main.js) mengirim JSON.
        // Insert = POST, Update = PUT (lewat otherConfig).
        ajaxPost(
            API,
            val,
            function () {
                units.back(1);
            },
            function (xhr) {
                units.showError(xhr);
            },
            {type: isUpdate ? "PUT" : "POST"}
        );
    };

    units.remove = function (reference) {
        if (!confirm("Yakin hapus data?")) return;

        $.ajax({
            url: API + "?reference=" + encodeURIComponent(reference),
            method: "DELETE",
            success: function () {
                units.back(1);
            },
            error: function (xhr) {
                units.showError(xhr);
            }
        });
    };

    units.filtermaterialDataSearch = function () {
        $("#myTable").DataTable().ajax.reload(null, true);
    };

    $(document).ready(function () {
        model.activetab(1);

        units.grid = $("#myTable").DataTable({
            paging: true,
            retrieve: true,
            searching: false,
            processing: true,
            serverSide: true,
            ordering: false,
            bLengthChange: false,
            bInfo: true,
            ajax: {
                url: API + "/data",
                type: "POST",
                data: function (d) {
                    d.filtervalue = units.FilterValue();
                    d.filtertext = units.FilterText();
                    return d;
                },
                dataSrc: function (json) {
                    json.recordsTotal = json.RecordsTotal;
                    json.recordsFiltered = json.RecordsFiltered;
                    return json.Data || [];
                }
            },
            columns: [
                {
                    data: null,
                    render: function (data, type, row, meta) {
                        return meta.row + 1;
                    }
                },
                {
                    data: "code",
                    render: function (data, type, row, meta) {

                        if (type !== "display") return data;

                        const canUpdate = model.permission('update');

                        return `
                                <button
                                    type="button"
                                    class="btn btn-sm btn-link text-primary pe-0"
                                    ${canUpdate ? '' : 'disabled'}
                                    onclick="units.selectdata('${row.reference}')">
                                    ${units.escapeHtml(data)}
                                </button>
                            `;
                    }
                },
                {data: "name", defaultContent: "", render: $.fn.dataTable.render.text()},
                {data: "description", defaultContent: "", render: $.fn.dataTable.render.text()},
                {
                    data: "is_active",
                    render: function (data, type, row, meta) {
                        return data == 1
                            ? '<span class="badge bg-success">Active</span>'
                            : '<span class="badge bg-secondary">Inactive</span>';
                    }
                },
                {
                    data: "reference",
                    render: function (data) {

                        return `
                                 <button
                                        type="button"
                                        class="btn btn-sm btn-link text-secondary pe-0 ${UpdateClass}"
                                        onclick="${canUpdate ? `units.selectdata('${data}')` : 'return false;'}">
                                    <svg class="icon-32" width="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4925 2.78906H7.75349C4.67849 2.78906 2.75049 4.96606 2.75049 8.04806V16.3621C2.75049 19.4441 4.66949 21.6211 7.75349 21.6211H16.5775C19.6625 21.6211 21.5815 19.4441 21.5815 16.3621V12.3341" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.82812 10.921L16.3011 3.44799C17.2321 2.51799 18.7411 2.51799 19.6721 3.44799L20.8891 4.66499C21.8201 5.59599 21.8201 7.10599 20.8891 8.03599L13.3801 15.545C12.9731 15.952 12.4211 16.181 11.8451 16.181H8.09912L8.19312 12.401C8.20712 11.845 8.43412 11.315 8.82812 10.921Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.1655 4.60254L19.7315 9.16854" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </button>
                                <button
                                        type="button"
                                        class="btn btn-sm btn-link text-default px-0 ${DeleteClass}"
                                        onclick="${canDelete ? `units.remove('${data}')` : 'return false;'}">
                                    <svg class="icon-32" width="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.3955 9.59497L9.60352 14.387" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.3971 14.3898L9.60107 9.59277" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16.3345 2.75024H7.66549C4.64449 2.75024 2.75049 4.88924 2.75049 7.91624V16.0842C2.75049 19.1112 4.63549 21.2502 7.66549 21.2502H16.3335C19.3645 21.2502 21.2505 19.1112 21.2505 16.0842V7.91624C21.2505 4.88924 19.3645 2.75024 16.3345 2.75024Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                                </button>
                                `;
                    }
                }
            ]

        });
    });
})();
