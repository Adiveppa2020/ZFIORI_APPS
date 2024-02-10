sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (MessageBox, Filter, FilterOperator, Fragment) {
    "use strict";

    function getI18nText(oView, key, parts) {
        return oView?.getModel("i18n")?.getResourceBundle()?.getText(key, parts);
    }

    function checkInputValue(oView) {
        let sInputlValue = oView.byId("idMaterialInput").getValue();
        let message = "";
        sInputlValue = oView.byId("idReleaseCodeInput").getValue();
        if (!sInputlValue) {
            message = getI18nText(oView, "messageMandatoryField", getI18nText(oView, "releaseCode"));
            return {
                error: true,
                message: message
            };
        }
        return { error: false };
    }

    function displayErrorMessagePopup(sMessage) {
        MessageBox.error(sMessage, {
            actions: [MessageBox.Action.CLOSE],
            emphasizedAction: MessageBox.Action.CLOSE,
            onClose: function () {
                return false;
            }
        });
    }


    async function updatePRList(sEntityName, aPayload, oDataModel) {
        return Promise.all(aPayload.map(function (oPayload) {
            return new Promise(function (resolve, reject) {
                oDataModel.update(sEntityName, oPayload,
                    {
                        method: "POST",
                        groupId: "GID",
                        changeSetId: "changeSetId" + oPayload.MATNR,
                        success: function (oData, response) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
            });
        }.bind(this)));
    }

    async function displayConfirmMessageBox(sConfirmMessage, sBtn) {
        return new Promise(function (resolve, reject) {
            sBtn = MessageBox.Action.YES;
            MessageBox.confirm(sConfirmMessage, {
                actions: [sBtn, MessageBox.Action.CANCEL],
                emphasizedAction: sBtn,
                onClose: (sAction) => {
                    if (sAction === sBtn) {
                        resolve();
                    } else {
                        reject({message: "Action cancelled.", popup: true});
                    }
                }
            });
        });
    }

    return {
        getI18nText,
        displayErrorMessagePopup,
        displayConfirmMessageBox,
        checkMandatoryParams: function () {
            let oInputlRequire = checkInputValue(this.getView());
            if (oInputlRequire.error) {
                displayErrorMessagePopup(oInputlRequire.message);
            } else {
                return true;
            }
        },

        getFilterArray: function (aFilterParam) {
            const aFilter = [];
            aFilterParam.forEach(function (item) {
                if (item.sValue) {
                    aFilter.push(new Filter(item.sPath, FilterOperator.EQ, item.sValue));
                }
            });
            return aFilter;
        },

        readOdataCall: async function (sEntityName, aFilter, urlParams) {
            const oDataModel = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                oDataModel.read(sEntityName, {
                    urlParameters: urlParams,
                    filters: aFilter,
                    success: function (oData, response) {
                        resolve(oData);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                });
            });
        },

        updateOdataCallList: async function (sEntityName, aPayload) {
            const oDataModel = this.getOwnerComponent().getModel();
            oDataModel.sDefaultUpdateMethod = "POST";
            const aDifGrp = oDataModel.getDeferredGroups();
            aDifGrp.push("updatePRHeadList");
            const aResponse = await updatePRList.call(this, sEntityName, aPayload, oDataModel);
            console.log(aResponse);
            return aResponse;
        },

        updateActionEnable: function (aSelectedContext) {
            const oLocalModel = this.getOwnerComponent().getModel("localModel");
            if (aSelectedContext && aSelectedContext.length > 0) {
                oLocalModel.setProperty("/enableListPRActions", true);
                return;
            }
            oLocalModel.setProperty("/enableListPRActions", false);
        },

        updateActionEnableDetailsPage: function (aSelectedContext) {
            const oLocalModel = this.getOwnerComponent().getModel("localModel");
            if (aSelectedContext && aSelectedContext.length > 0) {
                oLocalModel.setProperty("/enableListPRDetailsActions", true);
                return;
            }
            oLocalModel.setProperty("/enableListPRDetailsActions", false);
        },

        openStoackDetailsFragment: function (aFilter) {
            const oView = this.getView();
            if (!this._stockDetailTableDialog) {
                this._stockDetailTableDialog = Fragment.load({
                    id: oView.getId(),
                    name: "zprap.zfprap.fragments.StockDetails",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }
            this._stockDetailTableDialog.then(function (oValueHelpDialog) {
                oView.byId("idStackDetailsDialog").getBinding("items").filter(aFilter);
                oValueHelpDialog.open();
                oValueHelpDialog._oSubHeader && oValueHelpDialog._oSubHeader.setVisible(false);
            }.bind(this));
        },

        getHeadSetUpdatePlayload: function (aSelectedContext, sSupplyPlant, sAction, releaseCode) {
            const oView = this.getView();
            const aPayload = [];
            if (aSelectedContext && aSelectedContext.length > 0) {
                let oPayload = {};
                aSelectedContext.forEach(function (oContext) {
                    oPayload = oContext.getObject();
                    delete oPayload.__metadata;
                    oPayload.ACTION = sAction.toUpperCase();
                    oPayload.RESWK = sSupplyPlant || oPayload.RESWK;
                    oPayload.FRGZU = releaseCode;
                    const aLineItemContext = oContext.getObject().ZITEMNAV.__list;
                    const aLineItem = [];
                    aLineItemContext.forEach(function (sContextLine) {
                        const oLineItem = oContext.getModel().getContext("/" + sContextLine).getObject();
                        oLineItem.RESWK = sSupplyPlant || oLineItem.RESWK;
                        delete oLineItem.__metadata;
                        aLineItem.push(oLineItem);
                    });
                    oPayload.ZITEMNAV = aLineItem;
                    aPayload.push(oPayload);
                });
            } else {
                displayErrorMessagePopup(getI18nText(oView, "errorMessageNoItemSelected"));
            }
            return aPayload;

        },

        getLineItemSetUpdatePlayload: function (aContext, sSupplyPlant, sAction, oHeadItem, releaseCode) {
            const oView = this.getView();
            const oPayload = oHeadItem;
            delete oPayload.__metadata;
            oPayload.ACTION = sAction.toUpperCase();
            oPayload.RESWK = sSupplyPlant || oPayload.RESWK;
            oPayload.FRGZU = releaseCode;
            const aNavItems = [];
            if (aContext && aContext.length > 0) {
                aContext.forEach(function (oContext) {
                    const oLineItem = oContext.getObject();
                    delete oLineItem.__metadata;
                    oLineItem.RESWK = sSupplyPlant || oLineItem.RESWK;
                    aNavItems.push(oLineItem);
                });
                oPayload.ZITEMNAV = aNavItems;
            } else {
                displayErrorMessagePopup(getI18nText(oView, "errorMessageNoItemSelected"));
            }
            return oPayload;

        },

        openSupplyPlantDialog: function () {
            const oView = this.getView();
            if (!this._supplyPlantDialog) {
                this._supplyPlantDialog = Fragment.load({
                    id: oView.getId(),
                    name: "zprap.zfprap.fragments.SupplyPlantDialog",
                    controller: this
                }).then(function (supplyPlantDialog) {
                    oView.addDependent(supplyPlantDialog);
                    return supplyPlantDialog;
                });
            }
            this._supplyPlantDialog.then(function (supplyPlantDialog) {
                supplyPlantDialog.open();
            }.bind(this));
        },

        updateSupplyPlantToHeadList: function (sPlant) {
            const oView = this.getView();
            const aContext = oView.byId("idPRListTable").getBinding("items").getContexts() || [];
            aContext.forEach(function (item) {
                const oContext = item.getObject();
                if (oContext && (oContext.RESWK !== sPlant)) {
                    item.getModel().setProperty(item.getPath() + "/RESWK", sPlant);
                }
            });
        },

        updateSupplyPlantToLineItemList: function (sPlant) {
            const oView = this.getView();
            const aContext = oView.byId("idPRDetailsListTable").getBinding("items").getContexts() || [];
            aContext.forEach(function (item) {
                const oContext = item.getObject();
                if (oContext && (oContext.RESWK !== sPlant)) {
                    item.getModel().setProperty(item.getPath() + "/RESWK", sPlant);
                }
            });
        }
    }
});
