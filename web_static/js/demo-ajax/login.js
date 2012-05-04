/*
	Javascript support for login page
*/

Ext.BLANK_IMAGE_URL = '/js/ext/resources/images/default/s.gif';
Ext.QuickTips.init();

Ext.onReady(function() {
	
	var formPanel = new Ext.form.FormPanel({
		baseCls: 'x-plain',
		labelWidth: 50,
		labelPad: 15,
		autoHeight: true,
		bodyStyle: 'padding: 15px 0 7px 15px',
		border: false,
		defaultType: 'textfield',
		monitorValid: true,
		layoutConfig: { labelSeparator: '' },

		buttons: [{
			text: 'Login',
			formBind: true,
			handler: doSubmit
		},
		{
			text: 'Cancel',
			handler: function() { window.location = '/login-ajax/logout'; }
		}],

		defaults: {
			msgTarget: 'side',
			width: 250
		},

		items: [{
			id: 'name',
			fieldLabel: 'Name:',
			name: 'name',
			allowBlank: false,
			blankText: 'Please enter your account name (try "tinytim").'
		},
		{
			fieldLabel: 'Password:',
			name: 'password',
			inputType: 'password',
			allowBlank: false,
			blankText: 'Please enter your password (try "tulips").',
			minLength: 1
		}]
	});
	
	
	function doSubmit() {
		
		if (!formPanel.getForm().isValid()) {
			return;
		}
		
		var values = formPanel.getForm().getValues(false);
		
		formPanel.getForm().submit({
			url: '/4dcgi/login-ajax/validateLogin',
			failure: onSubmitFailure,
			success: onSubmitSuccess
		});
	};
	
	
	function onSubmitSuccess(form, action) {
		if (action.result.valid) {
			dlg.close();
			window.location = '/vendors-ajax/list';
		}
		else {
			Ext.Msg.alert('Active4D Demo Login', 'Invalid username and/or password. Hint: try "tinytim" and "tulips".');
		}
	};
	
	
	function onSubmitFailure(form, action) {
		Ext.Msg.alert('Active4D Demo Login', 'An network error occurred trying to validate the login. Please try again.');
	};
	
	
	function onBeforeShow() {
		
		// I would like return and enter keys to perform a submit
		formPanel.getEl().addKeyListener(
			[ Ext.EventObject.ENTER, Ext.EventObject.RETURN ], 

			function(key, ev) {
				ev.stopEvent();  // eat the key so IE doesn't try to submit the form
				doSubmit();
			}
		);
	};
	
	
	var dlg = new Ext.Window({
		id: 'login-dlg',
		title: 'Active4D Demo Login',
		plain: true,
		width: 390,
		autoHeight: true,
		layout: 'fit',
		plain: true,
		modal: true,
		closable: false,
		resizable: false,
		constrain: true,
		buttonAlign: 'center',

		items: formPanel,
		focus: function() { formPanel.getForm().findField('name').focus(); },
		listeners: {
			'beforeshow': onBeforeShow
		}
	});
		
	dlg.show();
});