/* Basketball Money — tab loader.
 *
 * Each tab has a <section id="view-NAME" class="view"> in index.html.
 * Sections that ship empty get their markup fetched once from
 * components/NAME.html and cached. Admin ships with its markup already
 * in the page, so nothing is fetched for it.
 *
 * showTab(name) works whether or not a menu button exists for that tab,
 * which is what lets player and supporter pages open from a link while
 * being absent from the menu.
 */
(function () {
  'use strict';

  var loaded = {};   // name -> true once its markup is in the page
  var loading = {};  // name -> Promise, so two calls don't both fetch

  function sectionFor(name) {
    return document.getElementById('view-' + name);
  }

  // A section counts as already built if it has real markup in it.
  function hasMarkup(section) {
    return section && section.children.length > 0;
  }

  function loadComponent(name) {
    if (loaded[name]) return Promise.resolve();
    if (loading[name]) return loading[name];

    var section = sectionFor(name);
    if (!section) return Promise.resolve();

    if (hasMarkup(section)) {          // inline, e.g. admin
      loaded[name] = true;
      return Promise.resolve();
    }

    loading[name] = fetch('components/' + name + '.html', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status + ' loading ' + name);
        return res.text();
      })
      .then(function (html) {
        section.innerHTML = html;
        loaded[name] = true;
        delete loading[name];

        // Components carry data-i18n attributes, so translate the new
        // markup as soon as it lands.
        if (typeof window.applyLang === 'function') window.applyLang();
      })
      .catch(function (err) {
        console.error('Could not load the ' + name + ' page:', err);
        section.innerHTML =
          '<div class="wrap"><div class="panel">' +
          '<p style="color:#f66;">This page could not be loaded. Please refresh.</p>' +
          '</div></div>';
        delete loading[name];
      });

    return loading[name];
  }

  function showTab(name) {
    if (!name) return Promise.resolve();

    var target = sectionFor(name);
    if (!target) {
      console.warn('No section for tab:', name);
      return Promise.resolve();
    }

    // Only one view visible at a time.
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) views[i].classList.remove('active');
    target.classList.add('active');

    // Highlight the matching menu button when there is one. Player and
    // supporter have no button, and that is fine.
    var tabs = document.querySelectorAll('.tab');
    for (var j = 0; j < tabs.length; j++) {
      tabs[j].classList.toggle('active', tabs[j].getAttribute('data-tab') === name);
    }

    return loadComponent(name);
  }

  // Menu clicks
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.tab') : null;
    if (!btn) return;
    var name = btn.getAttribute('data-tab');
    if (name) showTab(name);
  });

  // Whichever section is marked active in the markup is the starting tab.
  document.addEventListener('DOMContentLoaded', function () {
    var current = document.querySelector('.view.active');
    var name = current ? current.id.replace('view-', '') : 'admin';
    showTab(name);
  });

  window.showTab = showTab;
})();
