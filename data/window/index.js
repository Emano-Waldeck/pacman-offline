/* globals PACMAN */
'use strict';

window.setTimeout(function () {
  const el = document.getElementById('pacman');
  PACMAN.init(el, './');
}, 0);

chrome.runtime.connect({name: 'window'});
