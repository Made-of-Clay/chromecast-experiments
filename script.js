"use strict";
/* global window, chrome, console */
((window, chrome, undefined) => {
    var session = null;

    document.addEventListener('DOMContentLoaded', () => {
        var cast = document.getElementById('castme');
        var stop = document.getElementById('stop');

        var loadCastInterval = setInterval(function intervalCheck() {
            if (chrome.cast.isAvailable) {
                console.log('cast has loaded');
                clearInterval(loadCastInterval);
                initCastApi();
            } else {
                console.warn('unavailable');
            }
        }, 1000);

        cast.addEventListener('click', () => {
            launchApp();
        });
        stop.addEventListener('click', () => {
            stopApp();
        });
    });

    function initCastApi() {
        console.info(chrome.cast);
        var appId = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
        var sessReq = new chrome.cast.SessionRequest(appId);
        var apiConfig = new chrome.cast.ApiConfig(sessReq, sessionListener, receiverListener);
        chrome.cast.initialize(apiConfig, onInitSuccess, onInitError);
    }
    function sessionListener(e) {
        session = e;
        console.log('new session', session);
        if (session.media.length) {
            console.info(`Found ${session.media.length} sessions`);
        } else {
            console.warn('session.media was empty :( ', session.media);
        }
    }
    function receiverListener(e) {
        if (e === 'available') {
            console.log('Chromecast was found on the network');
        } else {
            console.log('There are no Chromecasts available');
        }
    }
    function onInitSuccess() {
        console.log('Init succeeded');
    }
    function onInitError() {
        console.log('Init failed');
    }
    function launchApp() {
        console.log('Launching the Chromecast App...');
        chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
    }
    function onRequestSessionSuccess(e) {
        console.log('Successfully created session: ' + e.sessionId);
        session = e;
        loadMedia();
    }
    function onLaunchError() {
        console.error('Error connecting to the Chromecast');
    }
    function loadMedia() {
        if (!session) {
            console.log('No session', session);
            return;
        }

        var mediaInfo = new chrome.cast.media.MediaInfo('http://i.imgur.com/I2Db5KD.jpg');
        // var mediaInfo = new chrome.cast.media.MediaInfo('http://10.0.0.236/chromecast-test/pic.jpg');
        // var mediaInfo = new chrome.cast.media.MediaInfo('http://10.0.0.236/chromecast-test/test.html');
        mediaInfo.contentType = 'image/jpg';
        // mediaInfo.contentType = 'text/html';

        var req = new chrome.cast.media.LoadRequest(mediaInfo);
        req.autoplay = true;

        session.loadMedia(req, onLoadSuccess, onLoadError);
    }
    function onLoadSuccess() {
        console.log('Successfully loaded image.');
    }

    function onLoadError() {
        console.log('Failed to load image.');
    }

    function stopApp() {
        session.stop(onStopAppSuccess, onStopAppError);
    }

    function onStopAppSuccess() {
        console.log('Successfully stopped app.');
    }

    function onStopAppError() {
        console.log('Error stopping app.');
    }
})(window, chrome);