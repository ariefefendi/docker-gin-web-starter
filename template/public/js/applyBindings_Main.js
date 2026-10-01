/*
 * @Author: Arif Efendi - Kazuya Media Indonesia
 * @Date:   2021-04-03 21:40:05
 * @Last Modified by:   kazuya
 * @Last Modified time: 2021-09-01 19:15:43
 */

/**
 * ============================================================
 * AJAX SETUP
 * ============================================================
 */

$.ajaxSetup({
    headers: {
        "X-CSRF-TOKEN":
            $('meta[name="csrf-token"]').attr("content")
    }
});

/**
 * ============================================================
 * AUTH SESSION STORAGE
 * ============================================================
 */
(function () {

    /**
     * Pastikan AUTH_USER dikirim dari Laravel.
     */
    if (window.AUTH_USER) {

        /**
         * USER ID
         */
        sessionStorage.setItem(
            "user_id",
            window.AUTH_USER.user_id || ""
        );


        /**
         * ROLE ID
         */
        sessionStorage.setItem(
            "role_id",
            window.AUTH_USER.role_id || ""
        );


        /**
         * ROLE NAME
         */
        sessionStorage.setItem(
            "role_name",
            window.AUTH_USER.role_name || ""
        );

    }

})();


/**
 * ============================================================
 * PERMISSIONS
 * ============================================================
 *
 * Hanya contoh sementara.
 *
 * Nantinya sebaiknya dikirim dari Laravel.
 */
(function () {

    /**
     * Jangan overwrite permission
     * jika sudah ada di sessionStorage.
     */
    if (!sessionStorage.getItem("permissions")) {

        sessionStorage.setItem(

            "permissions",

            JSON.stringify({

                units: {
                    view: true,
                    read: true,
                    create: true,
                    update: true,
                    delete: false
                },

                warehouses: {
                    view: true,
                    read: true,
                    create: false,
                    update: false,
                    delete: false
                }

            })

        );

    }

})();

/**
 * ============================================================
 * KNOCKOUT CUSTOM BINDING
 * ============================================================
 */

ko.bindingHandlers.googlemap = {
  init: function (element, valueAccessor) {
    var value = valueAccessor(),
      latLng = new google.maps.LatLng(value.latitude, value.longitude),
      mapOptions = {
        zoom: 10,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      },
      map = new google.maps.Map(element, mapOptions),
      marker = new google.maps.Marker({
        position: latLng,
        map: map,
      });
  },
};

ko.bindingHandlers.checkId = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      return true;
    });
    $(element).on("keyup", function (e) {
      var valId = $(element).val();
      // ajaxPost(valueAccessor(), {id: valId}, function (res) {
      $.post({
        url: valueAccessor(),
        method: "POST", // it should be method: 'post' //GET, HEAD, PUT, PATCH, DELETE."
        data: { id: valId },
        success: function (res) {
          console.log(res);
          var res = JSON.parse(res);
          if (res.result === "Data Sama") {
            $(element).closest(".form-control").addClass("is-invalid");
            $(element).addClass("form-control-warning");
            model.CheckId(true);
          } else {
            $(element).closest(".form-group").removeClass("is-invalid");
            $(element).removeClass("form-control-warning");
            $(element).removeClass("is-invalid");
            model.CheckId(true);
          }
        },
      });
    });
  },
};

ko.bindingHandlers.checkNickname = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      return true;
    });
    $(element).on("keyup", function (e) {
      var valId = $(element).val();
      $.post({
        url: valueAccessor(),
        method: "POST", // it should be method: 'post' //GET, HEAD, PUT, PATCH, DELETE."
        data: { id: valId },
        success: function (res) {
          var ress = JSON.parse(res);
          if (ress.result === "Data Sama") {
            $(element).closest(".form-control").addClass("is-invalid");
            $(element).addClass("form-control-warning");
            model.checkNickname(true);
          } else {
            $(element).closest(".form-group").removeClass("is-invalid");
            $(element).removeClass("form-control-warning");
            $(element).removeClass("is-invalid");
            model.checkNickname(false);
          }
        },
      });
    });
  },
};

ko.bindingHandlers.checkDuplicateMail = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      return true;
    });
    $(element).on("keyup", function (e) {
      var valId = $(element).val();
      $.post({
        url: valueAccessor(),
        method: "POST", // it should be method: 'post' //GET, HEAD, PUT, PATCH, DELETE."
        data: { id: valId },
        success: function (res) {
          var ress = JSON.parse(res);
          if (ress.result === "Data Sama") {
            $(element).closest(".form-control").addClass("is-invalid");
            $(element).addClass("form-control-warning");
            model.checkDuplicateMail(true);
          } else {
            $(element).closest(".form-group").removeClass("is-invalid");
            $(element).removeClass("form-control-warning");
            $(element).removeClass("is-invalid");
            model.checkDuplicateMail(false);
          }
        },
      });
    });
  },
};

ko.bindingHandlers.checkDiplicateNIK = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      return true;
    });
    $(element).on("keyup", function (e) {
      var valId = $(element).val();
      $.post({
        url: valueAccessor(),
        method: "POST", // it should be method: 'post' //GET, HEAD, PUT, PATCH, DELETE."
        data: { id: valId },
        success: function (res) {
          var ress = JSON.parse(res);
          if (ress.result === "Data Sama") {
            $(element).closest(".form-control").addClass("is-invalid");
            $(element).addClass("form-control-warning");
            model.checkDiplicateNIK(true);
          } else {
            $(element).closest(".form-group").removeClass("is-invalid");
            $(element).removeClass("form-control-warning");
            $(element).removeClass("is-invalid");
            model.checkDiplicateNIK(false);
          }
        },
      });
    });
  },
};

ko.bindingHandlers.checkPass = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      return true;
    });
    $(element).on("keyup", function (e) {
      var valId = $(element).val();
      ajaxPost(valueAccessor(), { id: valId }, function (res) {
        if (res.res == "Data Sama") {
          model.checkPass(false);
          $(element).closest(".form-group").addClass("has-success");
          $(element).addClass("form-control-success");
        } else {
          model.checkPass(true);
          $(element).closest(".form-group").removeClass("has-success");
          $(element).removeClass("form-control-success");
        }

        if (res.res == "OK") {
          model.checkPass(false);
          $(element).closest(".form-group").addClass("has-warning");
          $(element).addClass("form-control-warning");
        } else {
          model.checkPass(true);
          $(element).closest(".form-group").removeClass("has-warning");
          $(element).removeClass("form-control-warning");
        }
      });
    });
  },
};

ko.bindingHandlers.numeric = {
  init: function (element, valueAccessor) {
    $(element).on("keydown", function (e) {
      if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
      }
    });
    $(element).on("keyup", function (e) {});
  },
};
ko.bindingHandlers.readonly = {
  update: function (element, valueAccessor) {
    if (valueAccessor() == "show") {
      $(element).attr("readonly", "readonly");
      $(element).addClass("disabled");
    } else {
      $(element).removeAttr("readonly");
      $(element).removeClass("disabled");
    }
  },
};

ko.bindingHandlers.checkValue = {
  init: function (element, valueAccessor) {
    $(element).on("keyup", function (e) {
      var checkvalue = $(element).val();

      if (checkvalue == "") {
        model.CheckValue(true);
        $(element).addClass("error");
      }
      if (checkvalue !== "") {
        model.CheckValue(false);
        $(element).removeClass("error");
      }
    });
  },
};

ko.bindingHandlers.slideVisible = {
  update: function (element, valueAccessor, allBindings) {
    // First get the latest data that we're bound to
    var value = valueAccessor();
    // Next, whether or not the supplied model property is observable, get its current value
    var valueUnwrapped = ko.unwrap(value);
    // Grab some more data from another binding property
    var duration = allBindings.get("slideDuration") || 400; // 400ms is default duration unless otherwise specified
    // Now manipulate the DOM element
    if (valueUnwrapped == true)
      $(element).slideDown(duration); // Make the element visible
    else $(element).slideUp(duration); // Make the element invisible
  },
};
// <div data-bind="slideVisible: model.giftWrap, slideDuration:600">You have selected the option</div>
// <label><input type="checkbox" data-bind="checked: model.giftWrap" /> Gift wrap</label>

ko.bindingHandlers.validate = {
  init: function (
    element,
    valueAccessor,
    allBindings,
    viewModel,
    bindingContext,
  ) {
    var valueObservable = valueAccessor();
    var errorObservable = ko.observable("");
    // Subscribe to changes in the value
    ko.computed(function () {
      var value = valueObservable();
      var error = "";
      // Perform validation
      if (value.trim() == "" || value == 0) {
        error = "This field is required.";
        // Apply the error observable to the element
      }
      // Update the error observable
      errorObservable(error);
    });
    // Store the error observable in the valueAccessor for access in the parent view model
    valueObservable.error = errorObservable;
  },
};

// -----------------------------------------------------
//  KO binding: apexChart
// -----------------------------------------------------
/*
 * Binding Knockout yang membungkus ApexCharts.
 *
 * Cara kerja
 * ----------
 * init  –  Buat instance ApexCharts dari konfigurasi yang diberikan
 *          di data‑bind, render sekali, lalu simpan di elemen.
 *          Registrasi dispose callback agar chart dihancurkan
 *          ketika elemen di‑remove (menghindari memory leak).
 *
 * update –  Dipanggil tiap observables dalam konfigurasi berubah.
 *          Hanya update `series` (cara tercepat).  Opsi lain
 *          (type, colors, labels, …) tetap sama kecuali seluruh
 *          objek diganti.
 *
 * Catatan penggunaan
 * -----------------
 * 1. Sertakan script ApexCharts **sebelum** Knockout melakukan
 *    `ko.applyBindings` (mis. CDN di Blade view).
 * 2. Binding menerima objek JavaScript biasa atau observable
 *    yang mengembalikan objek; `ko.unwrap` akan mengubahnya
 *    menjadi nilai mentah.
 * 3. Instance chart disimpan di elemen dengan kunci internal
 *    `"__apexChart__"` – biasanya tidak perlu diakses langsung.
 *
 * Contoh konfigurasi (yang dipakai di data‑bind)
 * ----------------------------------------------
 * {
 *     chart:   { type: 'donut', height: 320 },          // tipe chart
 *     title:   { text: 'Distribusi Status' },          // opsional
 *     labels:  ['Draft','Confirmed','Processing','Completed'],
 *     series:  [12, 7, 5, 16],                         // angka atau observable
 *     colors:  ['#6c757d','#0dcaf0','#ffc107','#198754']
 * }
 * // Semua properti bersifat opsional kecuali `series`.
 */

ko.bindingHandlers.apexChart = {
  init: function (element, valueAccessor) {
    var config = ko.unwrap(valueAccessor());

    if (!config) {
      return;
    }

    ko.utils.domData.set(element, "__apexChartConfig__", config);

    var chart = new ApexCharts(element, config);

    ko.utils.domData.set(element, "__apexChart__", chart);

    chart.render();

    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
      var chart = ko.utils.domData.get(element, "__apexChart__");

      if (chart) {
        chart.destroy();

        ko.utils.domData.set(element, "__apexChart__", null);
      }
    });
  },

  update: function (element, valueAccessor) {
    var config = ko.unwrap(valueAccessor());

    if (!config) {
      return;
    }

    var chart = ko.utils.domData.get(element, "__apexChart__");

    if (!chart) {
      return;
    }

    chart.updateOptions(config, true, true);
  },
};

model.activetab = function (index) {
  $("#tabnavform > li").removeClass("current");
  $("#tabnavform li>.nav-link").removeClass("active");
  $("#tabnavform li>.nav-link").attr({ "aria-expanded": false });

  $("#tabnavform > li").eq(index).addClass("current");
  $("#tabnavform li>.nav-link").eq(index).addClass("active");
  $("#tabnavform li>.nav-link").eq(index).attr({ "aria-expanded": true });

  $("#tabnavform-content div.tab-pane").removeClass("active show");
  $("#tabnavform-content div.tab-pane").attr({ "aria-expanded": false });

  $("#tabnavform-content div.tab-pane").eq(index).addClass("active show");
  $("#tabnavform-content div.tab-pane")
    .eq(index)
    .attr({ "aria-expanded": true });
};
model.sidebar = function (index) {
  $("#sidebar-menu li>.nav-link").removeClass("active");
  // $("#sidebar-menu li>.nav-link").attr({"aria-expanded":false});
  $("#sidebar-menu li>.nav-link").eq(index).addClass("active");
  // $("#sidebar-menu li>.nav-link").eq(index).attr({"aria-expanded":true});
};

// START: Form Custom - Form Validation
model.formValidation = function (formSelector) {
  const form = document.querySelector(formSelector);

  if (!form) {
    console.warn("Form validation: form tidak ditemukan:", formSelector);

    return false;
  }

  let isValid = true;

  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach(function (input) {
    if (input.disabled) {
      return;
    }

    /*
        |--------------------------------------------------------------------------
        | Select2
        |--------------------------------------------------------------------------
        */

    if ($(input).hasClass("select2-hidden-accessible")) {
      if (!input.value) {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");

        $(input)
          .next(".select2-container")
          .find(".select2-selection")
          .addClass("is-invalid");

        isValid = false;
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");

        $(input)
          .next(".select2-container")
          .find(".select2-selection")
          .removeClass("is-invalid");
      }

      return;
    }

    /*
        |--------------------------------------------------------------------------
        | HTML5 Validation
        |--------------------------------------------------------------------------
        */

    if (!input.checkValidity()) {
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");

      isValid = false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
    }
  });

  return isValid;
};
// END: Form Custom - Form Validation
// END: Form Custom - Form Validation

// START: Alert Invalid Field
function alert_InValidField() {
  const invalidField = document.querySelector(".is-invalid");

  if (!invalidField) {
    return;
  }

  let fieldName = "Data";

  const container = invalidField.closest(
    ".form-group, .mb-3, .col-md-6, .col-md-12",
  );

  if (container) {
    const label = container.querySelector("label");

    if (label) {
      fieldName = label.innerText.replace("*", "").trim();
    }
  }

  Swal.fire(
    "Data Belum Lengkap",
    "Mohon lengkapi field: " + fieldName,
    "warning",
  ).then(function () {
    invalidField.focus();

    invalidField.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}
// END: Alert Invalid Field

// START: Reset Form Validation
model.resetFormValidation = function (formSelector) {
  const form = document.querySelector(formSelector);

  if (!form) {
    return;
  }

  // Reset semua status validation
  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach(function (field) {
    field.classList.remove("is-invalid", "is-valid");
  });

  // Reset Select2 jika digunakan
  $(form).find(".select2-selection").removeClass("is-invalid is-valid");
};
// END: Reset Form Validation

function permissioncheck() {
  const selectAll = document.getElementById("selectAll");
  const clearAll = document.getElementById("clearAll");

  function getChecks() {
    return document.querySelectorAll(".permission-check");
  }

  // =====================================================
  // SELECT ALL
  // =====================================================

  if (selectAll) {
    selectAll.addEventListener("click", function () {
      getChecks().forEach(function (checkbox) {
        checkbox.checked = true;
      });
    });
  }

  // =====================================================
  // CLEAR ALL
  // =====================================================

  if (clearAll) {
    clearAll.addEventListener("click", function () {
      getChecks().forEach(function (checkbox) {
        checkbox.checked = false;
      });
    });
  }

  // =====================================================
  // ROLE SELECTION
  // =====================================================

  document.querySelectorAll(".role-item").forEach(function (item) {
    item.addEventListener("click", function () {
      // Remove active dari semua role
      document.querySelectorAll(".role-item").forEach(function (role) {
        role.classList.remove("active");
      });

      // Active role yang dipilih
      item.classList.add("active");

      // Ambil nama role
      const roleNameElement = item.querySelector(".role-name");

      if (!roleNameElement) {
        return;
      }

      const roleName = roleNameElement.childNodes[0].textContent.trim();

      // Update selected role
      const selectedRole = document.querySelector(".selected-role");

      if (selectedRole) {
        selectedRole.textContent = roleName;
      }
    });
  });
}

function changeRupiah(angka) {
  var minus = false;
  if (angka < 0) {
    minus = true;
    angka = angka * -1;
  }
  var rev = parseInt(angka, 10).toString().split("").reverse().join("");
  var rev2 = "";
  for (var i = 0; i < rev.length; i++) {
    rev2 += rev[i];
    if ((i + 1) % 3 === 0 && i !== rev.length - 1) {
      rev2 += ".";
    }
  }
  if (minus) return "-" + rev2.split("").reverse().join("");
  else return rev2.split("").reverse().join("");
}
function terbilang(bilangan) {
  var kalimat = "";
  var angka = new Array(
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
  );
  var kata = new Array(
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
  );
  var tingkat = new Array("", "Ribu", "Juta", "Milyar", "Triliun");
  var panjang_bilangan = bilangan.length;

  /* pengujian panjang bilangan */
  if (panjang_bilangan > 15) {
    kalimat = "Diluar Batas";
  } else {
    /* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
    for (i = 1; i <= panjang_bilangan; i++) {
      angka[i] = bilangan.substr(-i, 1);
    }

    var i = 1;
    var j = 0;

    /* mulai proses iterasi terhadap array angka */
    while (i <= panjang_bilangan) {
      subkalimat = "";
      kata1 = "";
      kata2 = "";
      kata3 = "";

      /* untuk Ratusan */
      if (angka[i + 2] != "0") {
        if (angka[i + 2] == "1") {
          kata1 = "Seratus";
        } else {
          kata1 = kata[angka[i + 2]] + " Ratus";
        }
      }

      /* untuk Puluhan atau Belasan */
      if (angka[i + 1] != "0") {
        if (angka[i + 1] == "1") {
          if (angka[i] == "0") {
            kata2 = "Sepuluh";
          } else if (angka[i] == "1") {
            kata2 = "Sebelas";
          } else {
            kata2 = kata[angka[i]] + " Belas";
          }
        } else {
          kata2 = kata[angka[i + 1]] + " Puluh";
        }
      }

      /* untuk Satuan */
      if (angka[i] != "0") {
        if (angka[i + 1] != "1") {
          kata3 = kata[angka[i]];
        }
      }

      /* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
      if (angka[i] != "0" || angka[i + 1] != "0" || angka[i + 2] != "0") {
        subkalimat = kata1 + " " + kata2 + " " + kata3 + " " + tingkat[j] + " ";
      }

      /* gabungkan variabe sub kalimat (untuk Satu blok 3 angka) ke variabel kalimat */
      kalimat = subkalimat + kalimat;
      i = i + 3;
      j = j + 1;
    }

    /* mengganti Satu Ribu jadi Seribu jika diperlukan */
    if (angka[5] == "0" && angka[6] == "0") {
      kalimat = kalimat.replace("Satu Ribu", "Seribu");
    }
  }
  return kalimat;
}
function ajaxPost(url, data, callbackSuccess, callbackError, otherConfig) {
  var startReq = moment();
  var callbackScheduler = function (callback) {
    callback();
  };
  if (typeof callbackSuccess == "object") {
    otherConfig = callbackSuccess;
    callbackSuccess = function () {};
    callbackError = function () {};
  }
  if (typeof callbackError == "object") {
    otherConfig = callbackError;
    callbackError = function () {};
  }
  var config = {
    url: url,
    type: "post",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: ko.mapping.toJSON(data),
    success: function (a) {
      callbackScheduler(function () {
        if (callbackSuccess !== undefined) {
          callbackSuccess(a);
        }
      });
    },
    error: function (a, b, c) {
      callbackScheduler(function () {
        if (callbackError !== undefined) {
          callbackError(a, b, c);
        }
      });
    },
  };
  if (data instanceof FormData) {
    delete config.config;
    config.data = data;
    config.async = false;
    config.cache = false;
    config.contentType = false;
    config.processData = false;
  }
  if (otherConfig != undefined) {
    config = $.extend(true, config, otherConfig);
  }
  return $.ajax(config);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred.";
      break;
  }
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}
function countdate(datefrom, dateto, timefrom, timeto) {
  let A = datefrom; // '31/08/2021'   || let A= document.getElementById("date1_id").value
  let B = dateto; // '01/09/2021'     || let B= document.getElementById("date2_id").value

  let C = Number(A.substring(3, 5));
  let D = Number(B.substring(3, 5));
  let dif = D - C;
  let arr = [];
  let sum = 0;
  for (let i = 0; i < dif + 1; i++) {
    sum += Number(daysInMonth(i + C, 2019));
  }
  let sum_alter = 0;
  for (let i = 0; i < dif; i++) {
    sum_alter += Number(daysInMonth(i + C, 2019));
  }
  let no_of_month = Number(B.substring(3, 5)) - Number(A.substring(3, 5));
  let days = [];
  if (
    Number(B.substring(3, 5)) - Number(A.substring(3, 5)) > 0 ||
    Number(B.substring(0, 2)) - Number(A.substring(0, 2)) < 0
  ) {
    days = Number(B.substring(0, 2)) - Number(A.substring(0, 2)) + sum_alter;
  }
  if (Number(B.substring(3, 5)) == Number(A.substring(3, 5))) {
    days = Number(B.substring(0, 2)) - Number(A.substring(0, 2)) + sum_alter;
  }

  time_1 = [];
  time_2 = [];
  let hour = [];

  time_1 = timefrom; // '01:01:15 AM'
  time_2 = timeto; // '11:59:00 AM'
  if (time_1.substring(0, 2) == "12") {
    time_1 = "00:00:00 PM";
  }
  if (time_1.substring(9, 11) == time_2.substring(9, 11)) {
    hour = Math.abs(
      Number(time_2.substring(0, 2)) - Number(time_1.substring(0, 2)),
    );
  }
  if (time_1.substring(9, 11) != time_2.substring(9, 11)) {
    hour =
      Math.abs(
        Number(time_2.substring(0, 2)) - Number(time_1.substring(0, 2)),
      ) + 12;
  }
  let min = Math.abs(
    Number(time_1.substring(3, 5)) - Number(time_2.substring(3, 5)),
  );
  var result = "" + days + "d:" + hour + "h:" + min + "m, ";
  return result;
}




// pager.extendWithPage(model);
ko.applyBindings(model);
// pager.start(model);
$(document).ready(function () {
  model.Processing(false);
  
    /**
     * Debug auth frontend.
     */
    console.log(
        "USER ID:",
        model.check_user_id()
    );


    console.log(
        "ROLE ID:",
        model.check_role_id()
    );
    
});
