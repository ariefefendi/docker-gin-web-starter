// Halaman Units: datatable server side + form tambah/ubah/hapus.
// Memanggil API di /api/master-data/units. Semua teks dari server
// dipasang lewat textContent (aman dari XSS).
(function () {
  'use strict';

  var API = '/api/master-data/units';
  var state = { start: 0, length: 10, filter: '', filtered: 0 };
  var timer = null;

  function $(id) { return document.getElementById(id); }

  // ---------------------------------------------------------
  // Helper DOM
  // ---------------------------------------------------------
  function cell(text, className) {
    var td = document.createElement('td');
    td.textContent = text == null ? '' : text;
    if (className) td.className = className;
    return td;
  }

  function button(label, className, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function messageRow(text) {
    var tr = document.createElement('tr');
    var td = cell(text, 'empty');
    td.colSpan = 6;
    tr.appendChild(td);
    return tr;
  }

  function formatErrors(errors) {
    if (!errors) return 'Terjadi kesalahan.';
    if (typeof errors === 'string') return errors;
    return Object.keys(errors).map(function (k) { return errors[k]; }).join(' ');
  }

  // ---------------------------------------------------------
  // Tabel
  // ---------------------------------------------------------
  function render(items) {
    var tbody = $('rows');
    tbody.replaceChildren();

    if (!items.length) {
      tbody.appendChild(messageRow('Tidak ada data.'));
    }

    items.forEach(function (u) {
      var tr = document.createElement('tr');
      tr.appendChild(cell(u.reference));
      tr.appendChild(cell(u.code));
      tr.appendChild(cell(u.name));
      tr.appendChild(cell(u.description));

      var status = document.createElement('td');
      var badge = document.createElement('span');
      badge.className = 'badge ' + (u.is_active ? 'on' : 'off');
      badge.textContent = u.is_active ? 'Aktif' : 'Nonaktif';
      status.appendChild(badge);
      tr.appendChild(status);

      var actions = document.createElement('td');
      actions.className = 'actions';
      actions.appendChild(button('Edit', 'btn small', function () { openForm(u); }));
      actions.appendChild(button('Hapus', 'btn small danger', function () { remove(u); }));
      tr.appendChild(actions);

      tbody.appendChild(tr);
    });

    var from = state.filtered === 0 ? 0 : state.start + 1;
    var to = Math.min(state.start + state.length, state.filtered);
    $('info').textContent = from + '–' + to + ' dari ' + state.filtered + ' data';
    $('prev').disabled = state.start === 0;
    $('next').disabled = state.start + state.length >= state.filtered;
  }

  function load() {
    var q = new URLSearchParams({
      start: state.start,
      length: state.length,
      filtertext: state.filter
    });

    return fetch(API + '/data?' + q)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        state.filtered = json.RecordsFiltered || 0;
        render(json.Data || []);
      })
      .catch(function () {
        var tbody = $('rows');
        tbody.replaceChildren(messageRow('Gagal memuat data.'));
      });
  }

  // ---------------------------------------------------------
  // Form tambah / ubah
  // ---------------------------------------------------------
  function showError(msg) {
    var el = $('form-error');
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function openForm(u) {
    showError('');
    $('modal-title').textContent = u ? 'Ubah Unit' : 'Tambah Unit';
    $('f-id').value = u ? u.id : '';
    $('f-code').value = u ? u.code : '';
    $('f-name').value = u ? u.name : '';
    $('f-description').value = u && u.description ? u.description : '';
    $('f-active').checked = u ? !!u.is_active : true;
    $('modal').showModal();
    $('f-code').focus();
  }

  function save(e) {
    e.preventDefault();
    showError('');

    var id = $('f-id').value;
    var payload = {
      code: $('f-code').value.trim(),
      name: $('f-name').value.trim(),
      description: $('f-description').value.trim() || null,
      is_active: $('f-active').checked
    };
    if (id) payload.id = id;

    fetch(API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (json) { return { ok: res.ok, json: json }; });
      })
      .then(function (r) {
        if (!r.ok) {
          showError(formatErrors(r.json.errors || r.json.message));
          return;
        }
        $('modal').close();
        load();
      })
      .catch(function () { showError('Tidak dapat terhubung ke server.'); });
  }

  // ---------------------------------------------------------
  // Hapus
  // ---------------------------------------------------------
  function remove(u) {
    if (!window.confirm('Hapus unit "' + u.name + '"?')) return;

    fetch(API + '?reference=' + encodeURIComponent(u.reference), { method: 'DELETE' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        // Jika baris terakhir di halaman ini dihapus, mundur satu halaman.
        var remaining = state.filtered - 1;
        if (state.start >= remaining && state.start > 0) {
          state.start = Math.max(0, state.start - state.length);
        }
        return load();
      })
      .catch(function () { window.alert('Gagal menghapus data.'); });
  }

  // ---------------------------------------------------------
  // Event
  // ---------------------------------------------------------
  $('btn-add').addEventListener('click', function () { openForm(null); });
  $('btn-cancel').addEventListener('click', function () { $('modal').close(); });
  $('form').addEventListener('submit', save);

  $('search').addEventListener('input', function (e) {
    clearTimeout(timer);
    var value = e.target.value.trim();
    timer = setTimeout(function () {
      state.filter = value;
      state.start = 0;
      load();
    }, 300);
  });

  $('page-size').addEventListener('change', function (e) {
    state.length = parseInt(e.target.value, 10) || 10;
    state.start = 0;
    load();
  });

  $('prev').addEventListener('click', function () {
    state.start = Math.max(0, state.start - state.length);
    load();
  });

  $('next').addEventListener('click', function () {
    state.start += state.length;
    load();
  });

  load();
})();
