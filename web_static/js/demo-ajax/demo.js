/*
	Common javascript support for the Ajax demo
*/

Ext.BLANK_IMAGE_URL = '/js/ext/resources/images/default/s.gif';
Ext.QuickTips.init();
Ext.namespace('A4D');

App.name = 'Active4D Ajax Demo';

App.loginFunction = function() {
	window.location = '/login-ajax/main';
};

App.logoutFunction = function() {
	window.location = '/login-ajax/logout';
};

Ext.ux.Data.sessionTimeout = 15;