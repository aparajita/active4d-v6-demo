/*
	Javascript support for login page
*/

Ext.namespace('A4D.vendors');

A4D.vendors.Grid = function() {
	
	var ds = new Ext.ux.data.JsonStore({
		url: '/vendors-ajax/selectForGrid',
		remoteSort: false,
		totalProperty: 'count',
		root: 'data',
		
		fields: [
			'id',
			'name',
			'phone',
			{ name: 'num_products', type: 'int' }
		],
		
		id: 'id',
		sortInfo: { field: 'name', direction: 'ASC' }
	});
	
	
	this.grid = new Ext.grid.GridPanel({
		// Panel
		id: 'vendor-list',
		title: 'Vendors',
		border: true,
		width: 500,
		height: 307,
		closable: false,
		autoExpandColumn: 'name',
		renderTo: 'grid',
		
		// Grid
		ds: ds, 
		columns: [{ 
			header: 'Name', 
			id: 'name',
			dataIndex: 'name',
			width: 200,
			resizable: true,
			sortable: true
		},
		{ 
			header: 'Phone', 
			dataIndex: 'phone',
			width: 100,
			sortable: false
		},
		{ 
			header: '# Products', 
			dataIndex: 'num_products',
			width: 90,
			align: 'center',
			sortable: true
		}],
		
		sm: new Ext.grid.RowSelectionModel({
			singleSelect: true,
			listeners: {
				'selectionchange': this.onSelectionChange,
				scope: this
			}
		}),
		
		viewConfig: {
			emptyText: 'No vendors match your search criteria'
		},
		
		tbar: [
			{
				text: 'New',
				iconCls: 'icon-add',
				handler: this.add,
				scope: this
			}, ' ',
			{
				id: 'btn-edit-vendor',
				text: 'Edit',
				iconCls: 'icon-edit',
				disabled: true,
				handler: this.edit,
				scope: this
			}, ' ',
			{
				id: 'btn-delete-vendor',
				text: 'Delete',
				iconCls: 'icon-delete',
				disabled: true,
				handler: this.remove,
				scope: this
			},
			'->',
			new Ext.ux.SearchField({
				width: 100,
				store: ds,
				paramName: 'nm',
				selectOnFocus: true,
				emptyText: 'Name'
			})
		],
		
		listeners: {
			'rowdblclick': this.onRowDblClick,
			scope: this
		}
	});
	
	ds.load();
};


Ext.extend(A4D.vendors.Grid, Ext.util.Observable, {
	
	onSelectionChange: function(sm) {
		var haveSelection = sm.getCount() > 0;
		Ext.getCmp('btn-edit-vendor').setDisabled(!haveSelection);
		Ext.getCmp('btn-delete-vendor').setDisabled(!haveSelection);
	},
	
	
	onRowDblClick: function() {
		this.edit();
	},
	
	
	getId: function() {
		var sm = this.grid.getSelectionModel();
		
		if (sm.getCount() > 0) {
			return sm.getSelected().data.id;
		}
		else {
			return null;
		}
	},
	
	
	add: function() {
		var dlg = new A4D.vendors.EditDlg(this.grid, 'Add Vendor', 'add', null);
	},
	
	
	edit: function() {
		var rec = this.grid.getSelectionModel().getSelected();
		var dlg = new A4D.vendors.EditDlg(this.grid, 'Edit Vendor', 'edit', rec);
	},
	
	
	remove: function() {
		var rec = this.grid.getSelectionModel().getSelected();
		
		var handler = function(button) {
			if (button === 'yes') {
				var options = {
					progressMsg: 'Deleting "' + rec.data.name + '"...',
					recordName: 'vendor "' + rec.data.name + '"',
					request: {
						url: '/vendors-ajax/delete',
						params: { 
							id: rec.data.id
						},
						success: this.afterRemove
					},
					scope: this,
					successMsg: 'The vendor "' + rec.data.name + '" has been deleted.',
					userData: { record: rec }
				};

				Ext.ux.Data.updateRecord(options);				
			}
		}.createDelegate(this);
		
		Ext.Msg.show({
			title: 'Warning',
			msg: 'Are you sure you want to delete "' + 
				 rec.data.name + '"? This cannot be undone.',
			buttons: Ext.Msg.YESNO,
			icon: Ext.MessageBox.WARNING,
			closable: false,
			width: 400,
			fn: handler
		});
	},
	
	
	afterRemove: function(success, json, data) {
		this.grid.getStore().remove(data.record);
	}
});


/****************************************************************
	EDIT DIALOG
****************************************************************/
A4D.vendors.EditDlg = function(list, title, mode, record) {

	var dlgId = 'vendor-edit-dlg';
	this.list = list;
	this.record = record;
	this.mode = mode;
	this.valid = null;  // start with no state
	
	this.fp = new Ext.FormPanel({
		id: 'vendor-edit-fp',
		formId: 'vendor-edit-form',
		labelWidth: 75,
		url: '/4dcgi/vendors-ajax/update',
		frame: true,
		cls: 'demo-form',
		bodyStyle: 'padding: 10px 10px 5px 10px',
		width: 450,
		monitorValid: true,
		defaults: { 
			width: 300,
			msgTarget: 'side'
		},
		defaultType: 'textfield',
		
		items: [
			{
				fieldLabel: 'Name',
				name: 'name',
				allowBlank: false
			},
			{
				fieldLabel: 'Phone',
				name: 'phone'
			},
			{
				xtype: 'textarea',
				fieldLabel: 'Comments',
				name: 'comments'
			},
			{
				xtype: 'hidden',
				name: 'timestamp'
			}
		],
		
		listeners: {
			'render': function () { 
				this.submitButton = Ext.getCmp('b_submit');
				this.fp.load({
					url: '/vendors-ajax/load',
					params: { id: this.record ? this.record.data.id : '-1' },
					method: 'GET',
					success: function(form) {
						form.findField('name').focus(true);
					}
				});
			},
			'clientvalidation': this.onClientValidation,
			scope: this
		}
	});
	
	this.dlg = new Ext.Window({
		id: dlgId,
		title: title,
		width: 500,
		height: 265,
		closable: false,
		resizable: false,
		modal: true,
		bodyStyle: 'padding: 15px',
		
		items: [ this.fp ],
	
		buttonAlign: 'center',
		buttons: [
			{
				id: 'b_submit',
				text: 'Save',
				handler: this.submit,
				scope: this
			},
			{
				text: 'Cancel',
				handler: function() { this.dlg.close(); },
				scope: this
			}
		]		
	});
	
	this.dlg.show();
};


A4D.vendors.EditDlg.prototype = {
	
	getDlg: function() {
		return this.dlg;
	},
	
	
	onClientValidation: function(formPanel, valid) {
		
		// First time through this.valid has to be set
		if (this.valid === null) {
			this.valid = !valid
		}
		
		if (valid != this.valid) {
			this.submitButton.setDisabled(!valid);
			this.valid = valid;
		}
	},
	
	
	submit: function() {
		if (!this.valid) {
			Ext.ux.Msg.alertError(
				'Error', 
				'One or more mandatory fields are empty. Please check the fields in red.',
				null,
				this);
		}
		else {
			var options = {
				closer: this.dlg,
				progressMsg: 'Saving...',
				recordName: this.record ? 'vendor "' + this.record.data.name + '"' : '',
				scope: this,
				request: {
					url: '/4dcgi/vendors-ajax/update',
					method: 'POST',
					params: { id: this.record ? this.record.data.id : '-1' },
					form: 'vendor-edit-form',
					callback: this.afterSubmit
				},
				userData: { 
					list: this.list
				}
			};

			Ext.ux.Data.updateRecord(options);
		}
	},
	
	
	afterSubmit: function(success, json, userData) {
		// Reload the list
		userData.list.getStore().reload();
	}
};


Ext.onReady(function() {
	
	var grid = new A4D.vendors.Grid();
});