sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "zrelease/rel/com/denpro/utils/ValueHelpFilter",
    "zrelease/rel/com/denpro/utils/Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ValueHelpFilter, Utils) {
        "use strict";

        return Controller.extend("zrelease.rel.com.denpro.controller.FilterSelectionPRAP", {
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

            onSelectRType: function (oEvent) {
                const sType = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();
                const oLocalModel = this.getOwnerComponent().getModel("localModel");
                if (sType === "DB" || sType === "BB") {
                    oLocalModel.setProperty("/visibleEmpDemoAppSelection", false);
                    oLocalModel.setProperty("/visibleDeliverySelection", true);
                    oLocalModel.setProperty("/visibleBillingBlockSelection", (sType === "BB"));
                    oLocalModel.setProperty("/visibleBlockCodeSelection", (sType === "DB"));
                } else {
                    oLocalModel.setProperty("/visibleEmpDemoAppSelection", true);
                    oLocalModel.setProperty("/visibleDeliverySelection", false);
                    oLocalModel.setProperty("/visibleBillingBlockSelection", false);
                    oLocalModel.setProperty("/visibleBlockCodeSelection", false);
                }
            },


            getCreatedOnFilterDate: function () {
                function addZero(iMonth) {
                    if (iMonth < 10) {
                        return "0" + iMonth;
                    }
                    return iMonth;
                }
                const oFromDate = this.byId("idPostingDateRangeSO").getFrom();
                const oToDate = this.byId("idPostingDateRangeSO").getTo();
                const oDateRange = { from: "", to: "" };
                if (oFromDate && oToDate) {
                    let yyyy = oFromDate.getFullYear();
                    oDateRange.from = yyyy.toString() + addZero(oFromDate.getMonth() + 1) + addZero(oFromDate.getDate());
                    yyyy = oToDate.getFullYear();
                    oDateRange.to = yyyy.toString() + addZero(oToDate.getMonth() + 1) + addZero(oToDate.getDate());
                }
                return oDateRange;
            },

            getQueryParam: function (sType) {
                const oView = this.getView();
                const oCommon = {
                    companyCode: oView.byId("idCompanyCodeInput").getValue(),
                    salesOrg: oView.byId("idSalesOrgInput").getValue(),
                    SalesDoc: oView.byId("idSoNoInput").getValue()
                }
                if (sType === "DB") {
                    return {
                        route: "deliveryBlockListPage",
                        queryParam: {
                            ...oCommon,
                            blockCode: oView.byId("idBlockCodeInput").getValue()
                        }
                    };
                } else if (sType === "BB") {
                    return {
                        route: "billingBlockListPage",
                        queryParam: {
                            ...oCommon,
                            billingBlock: oView.byId("idBillingBlockCodeInput").getValue()
                        }
                    };                    
                } else {
                    const PDDate = this.getCreatedOnFilterDate();
                    return {
                        route: "empDemoApproveListPage",
                        queryParam: {
                            supplier: oView.byId("idSupplierInput").getValue(),
                            plant: oView.byId("idPlantInput").getValue(),
                            PDFrom: PDDate.from,
                            PDTo: PDDate.to
                        }
                    };                    
                }
            },

            /**
             * Shows the selected item on the object page
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            onSearchButtonNavToListPress: function () {
                const sType = this.byId("relTypeId").getSelectedButton().getCustomData()[0].getValue();
                if (Utils.checkMandatoryParams.call(this, sType)) {
                    const oParam = this.getQueryParam(sType);
                    this.getRouter().navTo(oParam.route, {
                        id: sType,
                        "?query": oParam.queryParam
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
