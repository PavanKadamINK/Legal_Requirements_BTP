sap.ui.define([
	'sap/ui/core/UIComponent',
"sap/ui/model/odata/v2/ODataModel"
],
	function(UIComponent,ODataModel) {
	"use strict";

	var Component = UIComponent.extend("ns.Sewer_Legal_Requirements.Component", {

		metadata : {
			manifest: "json"
		},
		onCardReady: function (oCard) {
                // const that = this;
                // oCard.request({
                //     "url": "{{destinations.BMSPortal_API}}/v2/odata/v4/main/CompanyCodeData"
                // }).then(function (oData) {
                //     that.setModel(new JSONModel(oData.d.results), "CompanyCodeModel");
                // }).catch(function (oError) {
                //     console.error(oError);
                // });

                oCard.resolveDestination("BMSPortal_API").then(function (sResolvedUrl) {
                    // 2. Clean up URL (remove trailing slash if present)
                    if (sResolvedUrl.endsWith("/")) {
                        sResolvedUrl = sResolvedUrl.slice(0, -1);
                    }

                    // 3. Construct the Service URL (mimicking your dataSource uri: "/v2/odata/v4/main/")
                    var sServiceUrl = sResolvedUrl + "/v2/odata/v4/main/";

                    // 4. Create the OData V2 Model
                    // This corresponds to the "settings" in your dataSources snippet
                    var oModel = new ODataModel(sServiceUrl, {
                        useBatch: true,        // Standard for OData V2
                        defaultBindingMode: "TwoWay",
                        headers: {
                            "X-Requested-With": "XMLHttpRequest"
                        },
                        // Ensure we handle the proxy authentication correctly
                        tokenHandling: true,
                        withCredentials: true
                    });

                    // Optional: Handle metadata failure (e.g., if auth fails again)
                    oModel.attachMetadataFailed(function (oEvent) {
                        console.error("OData Metadata Failed", oEvent.getParameters());
                    });

                    // 5. Set as the DEFAULT model (no name)
                    // This allows the view to use paths like "{/CompanyCodeData}"
                    this.setModel(oModel);

                }.bind(this)).catch(function (sError) {
                    console.error("Destination Resolution Failed", sError);
                });
            }
	});

	return Component;

});
