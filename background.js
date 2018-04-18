'use strict';

var port;

chrome.runtime.onConnect.addListener(p => {
  port = p;
  port.onDisconnect.addListener(() => port = null);
});

chrome.browserAction.onClicked.addListener(() => {
  if (port) {
    chrome.windows.update(port.sender.tab.windowId, {
      focused: true
    });
  }
  else {
    chrome.storage.local.get({
      width: 700,
      height: 700,
      left: screen.availLeft + Math.round((screen.availWidth - 700) / 2),
      top: screen.availTop + Math.round((screen.availHeight - 700) / 2),
    }, prefs => {
      chrome.windows.create({
        url: chrome.extension.getURL('data/window/index.html'),
        width: prefs.width,
        height: prefs.height,
        left: prefs.left,
        top: prefs.top,
        type: 'popup'
      });
    });
  }
});

// FAQs & Feedback
chrome.storage.local.get({
  'version': null,
  'faqs': navigator.userAgent.indexOf('Firefox') === -1,
  'last-update': 0,
}, prefs => {
  const version = chrome.runtime.getManifest().version;

  if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
    const now = Date.now();
    const doUpdate = (now - prefs['last-update']) / 1000 / 60 / 60 / 24 > 30;
    chrome.storage.local.set({
      version,
      'last-update': doUpdate ? Date.now() : prefs['last-update']
    }, () => {
      // do not display the FAQs page if last-update occurred less than 30 days ago.
      if (doUpdate) {
        const p = Boolean(prefs.version);
        chrome.tabs.create({
          url: chrome.runtime.getManifest().homepage_url + '?version=' + version +
            '&type=' + (p ? ('upgrade&p=' + prefs.version) : 'install'),
          active: p === false
        });
      }
    });
  }
});

{
  const {name, version} = chrome.runtime.getManifest();
  chrome.runtime.setUninstallURL(
    chrome.runtime.getManifest().homepage_url + '?rd=feedback&name=' + name + '&version=' + version
  );
}
