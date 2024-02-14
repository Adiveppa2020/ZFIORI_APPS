sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "com/denpro/sd/document/utils/ValueHelpFilter",
    "com/denpro/sd/document/utils/Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ValueHelpFilter, Utils) {
        "use strict";

        return Controller.extend("com.denpro.sd.document.controller.FilterSelectionPRAP", {
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

            getCreatedOnFilterDate: function () {
                function addZero (iMonth) {
                    if (iMonth < 10) {
                        return "0" + iMonth;
                    }
                    return iMonth;
                }
                const oFromDate = this.byId("idCreatedOnDateRange").getFrom();
                const oToDate = this.byId("idCreatedOnDateRange").getTo();
                const oDateRange = {from: "", to: ""};
                if (oFromDate && oToDate) {
                    let yyyy = oFromDate.getFullYear();
                    oDateRange.from = yyyy.toString() + addZero(oFromDate.getMonth() + 1) + addZero(oFromDate.getDate());
                    yyyy = oToDate.getFullYear();
                    oDateRange.to = yyyy.toString() + addZero(oToDate.getMonth() + 1) + addZero(oToDate.getDate());
                }
                return oDateRange;
            },

            /**
             * Shows the selected item on the object page
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            onSearchButtonNavToListPress: function () {
                if (Utils.checkMandatoryParams.call(this)) {
                    const oView = this.getView();
                    const sSalesDoc = oView.byId("idSalesDocumentInput").getValue();
                    const oDateRange = this.getCreatedOnFilterDate();
                    this.getRouter().navTo("detailslistpage", {
                        salesDocument: "SD",
                        "?query": {
                            createdBy: oView.byId("idCreatedByInput").getValue(),
                            salesDocument: sSalesDoc,
                            fromDate: oDateRange.from,
                            toDate: oDateRange.to
                        }
                    });
                }
            },

            onInputCommonValueHelpRequest: function (oEvent) {
                ValueHelpFilter.onInputCommonValueHelpRequest.call(this, oEvent);
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
