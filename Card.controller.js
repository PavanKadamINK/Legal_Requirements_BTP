sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("ns.Sewer_Legal_Requirements.Card", {
		onInit: function () {
			debugger;
			var oModel = new sap.ui.model.json.JSONModel({});
			this.getView().setModel(oModel, "legal");

			this.getView().setBusy(true);
			this.getView().attachModelContextChange(this._onModelArrival, this);
			this._onModelArrival();
		},

		_onModelArrival: function () {
			debugger;
			// Get the model from the Component
			var oODataModel = this.getOwnerComponent().getModel();

			// Check if the model is defined yet
			if (oODataModel) {
				// 3. Success! Stop listening so this doesn't run again
				this.getView().detachModelContextChange(this._onModelArrival, this);

				// 4. Wait for metadata to be ready before calling .read()
				oODataModel.metadataLoaded().then(function () {
					this._loadData();
				}.bind(this));
			}
		},

		fullyDecode: function (value) {
			if (!value) return value;

			let prev;
			let current = value;

			try {
				do {
					prev = current;
					current = decodeURIComponent(current);
				} while (prev !== current);
			} catch (e) {
				return value;
			}

			return current;
		},

		_loadData: function () {
			debugger;
			var params = new URLSearchParams(window.location.search);
			var title = params.get("title");
			title = title ? title.split("/")[0] : "";
			console.log("Received Title:", title);

			if (title.includes('%')) title = this.fullyDecode(title);

			if (!title) return;
			
			var oModel = this.getOwnerComponent().getModel();

			var aFilters = [];

			if (title) {
				aFilters.push(new sap.ui.model.Filter("PageName", sap.ui.model.FilterOperator.Contains, title));
			}
			this.getView().setBusy(true);
			oModel.read("/OTLegalRequirements", {
				filters: aFilters,
				success: function (oData) {
					const aData = oData.results || [];
					const oGroup = {};

					// Group the original flat data by 'Ref'
					aData.forEach(item => {
						if (!oGroup[item.Ref]) {
							oGroup[item.Ref] = [];
						}
						oGroup[item.Ref].push({
							Requirements: item.Requirements,
							URL: item.URL
						});
					});

					// Convert the grouped object into a final array of groups
					const aLegalGroups = Object.keys(oGroup).map(ref => {
						return {
							Ref: ref,
							Items: oGroup[ref]
						};
					});

					const oJsonModel = new sap.ui.model.json.JSONModel({
						// Bind the new array name to the model
						legalGroups: aLegalGroups
					});

					this.getView().setModel(oJsonModel, "legal");
					this.getView().setBusy(false);

				}.bind(this),
				error: function (oError) {
					this.getView().setBusy(false);
				}
			});

		},

		onReqLinkPress: function (oEvent) {
			const oCtx = oEvent.getSource().getBindingContext("legal");
			const sUrl = oCtx.getProperty("URL");

			if (sUrl) {
				window.open(sUrl, "_blank");
			}
		}


	});
});