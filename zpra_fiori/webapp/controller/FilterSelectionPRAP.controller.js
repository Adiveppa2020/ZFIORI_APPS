sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "zprap/zfprap/utils/ValueHelpFilter",
    "zprap/zfprap/utils/Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ValueHelpFilter, Utils) {
        "use strict";

        return Controller.extend("zprap.zfprap.controller.FilterSelectionPRAP", {
            onInit: function () {
                this.oFragment = {}
            },

            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            /**
             * Shows the selected item on the object page
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            onSearchButtonNavToListPress: function () {
                if (Utils.checkMandatoryParams.call(this)) {
                    const oView = this.getView();
                    const sRC = this.byId("idReleaseCodeInput").getSelectedKey() || oView.byId("idReleaseCodeInput").getValue();
                    const sDT = this.byId("idDocType").getSelectedKey() || oView.byId("idDocType").getValue();
                    this.getRouter().navTo("prlistpage", {
                        releaseCode: sRC,
                        "?query": {
                            plant: oView.byId("idPlantInput").getValue(),
                            material: oView.byId("idMaterialInput").getValue(),
                            purchaseReqNo: oView.byId("idPurchaseReqNoInput").getValue(),
                            docType: sDT
                        }
                    });
                }
            },

            onInputMaterialsValueHelpRequest: function (oEvent) {
                ValueHelpFilter.onInputMaterialsValueHelpRequest.call(this, oEvent);
            },

            onValueHelpSearch: function (oEvent) {
                ValueHelpFilter.onValueHelpSearch.call(this, oEvent);
            },

            onValueHelpClose: function (oEvent, sValueInputProperty) {
                ValueHelpFilter.onValueHelpClose.call(this, oEvent, sValueInputProperty);
            },

            onChangeInputValue: function (oEvent, sValueInputProperty) {
                this.getOwnerComponent().getModel("localModel").setProperty(sValueInputProperty, oEvent.getSource().getValue());
            },

            onChangeInputValueComboBox: function (oEvent, sValueInputProperty) {
                this.getOwnerComponent().getModel("localModel").setProperty(sValueInputProperty, oEvent.getSource().getSelectedKey());
            }
        });
    });
