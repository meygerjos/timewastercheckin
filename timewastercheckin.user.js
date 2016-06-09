/**
 * This is a Greasemonkey script and must be run using a Greasemonkey-compatible browser.
 *
 * @author maymay <bitetheappleback@gmail.com>
 */
// ==UserScript==
// @name           Time waster check-in
// @version        0.1.2
// @namespace      net.maymay.timewastercheckin
// @updateURL      https://github.com/meitar/timewastercheckin/raw/master/timewastercheckin.user.js
// @description    Discourages use of time-wasting sites with a "soft" blocker that checks in about whether you really want to be on this site.
// @include        http://www.tumblr.com/*
// @include        https://www.tumblr.com/*
// @include        https://twitter.com/*
// @include        https://www.facebook.com/*
// @include        https://fetlife.com/*
// @grant          GM_log
// @grant          GM_addStyle
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_getResourceText
// @resource selectors-www.facebook.com selectors-www.facebook.com.json
// @resource selectors-twitter.com selectors-twitter.com.json
// ==/UserScript==

// TODO:
// * Add a white listing feature.
// * Add a feature to allow customizations of which sites are "time wasters."

var TRUE_COST = {};
TRUE_COST.main = function () {
    try {
        var p = JSON.parse(GM_getResourceText('selectors-' + window.location.host));
    } catch (e) {
        console.error('Error parsing JSON resource "selectors-' + window.location.host + '" ' + e.message);
        return;
    }

    p.forEach(function (obj) {
        if (obj['content'][navigator.language]) {
            var text = obj['content'][navigator.language]
        } else {
            return;
        }
        var els = document.querySelectorAll(obj['selector']);
        for (var i = 0; i < els.length; i++) {
            switch (obj['action']) {
                case 'appendText':
                    if (!els[i].textContent.endsWith(text)) {
                        els[i].textContent = els[i].textContent + text;
                    }
                    break;
                case 'prependText':
                    if (!els[i].textContent.startsWith(text)) {
                        els[i].textContent = text + els[i].textContent;
                    }
                    break;
                case 'replaceText':
                default:
                    els[i].textContent = text;
                    break;
            }
        }
    });
};
TRUE_COST.start = function () {
    TRUE_COST.main(); // run now
    setInterval(TRUE_COST.main, 5000); // and again every 5 seconds
}

CHECK_IN = {};
CHECK_IN.config = {
    'debug': true,
    'check_in_interval': GM_getValue('check_in_interval', 3600000), // 1 hour by default
    'now': new Date().getTime()
};

CHECK_IN.hostIsPermitted = function (host) {
    var nag_time = GM_getValue(host + '_is_permitted', false);
    return (!nag_time || CHECK_IN.config.now > nag_time) ? false : true;
};

CHECK_IN.main = function () {
    if (!CHECK_IN.hostIsPermitted(window.location.host)) {
        if (window.confirm('Are you sure you want to continue using ' + window.location.host + '? There are probably better uses of your time, right?')) {
            GM_setValue(window.location.host + '_is_permitted', CHECK_IN.config.now + CHECK_IN.config.check_in_interval);
            window.setTimeout(CHECK_IN.main, CHECK_IN.config.check_in_interval);
        } else {
            window.location.href = 'http://lmgtfy.com/?q=what+should+I+do+now';
        }
    }
};

window.addEventListener('DOMContentLoaded', CHECK_IN.main);
window.addEventListener('DOMContentLoaded', TRUE_COST.start);
