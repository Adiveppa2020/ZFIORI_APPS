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

    function checkInputValue(oView, sType) {
        let sInputValue = oView.byId("idPostingDateRangeSO").getFrom();
        let message = "";
        if (!sInputValue && sType === "EDA") {
            message = getI18nText(oView, "messageMandatoryField", getI18nText(oView, "postingDate"));
            return {
                error: true,
                message: message
            };
        }
        sInputValue = oView.byId("idCompanyCodeInput").getValue();
        if (!sInputValue && (sType === "DB" || sType === "BB")) {
            message = getI18nText(oView, "messageMandatoryField", getI18nText(oView, "companyCode"));
            return {
                error: true,
                message: message
            };
        }
        sInputValue = oView.byId("idSalesOrgInput").getValue();
        if (!sInputValue && (sType === "DB" || sType === "BB")) {
            message = getI18nText(oView, "messageMandatoryField", getI18nText(oView, "salseOrg"));
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
        this.changeSetId = this.changeSetId ? this.changeSetId : 1;
        return Promise.all(aPayload.map(function (oPayload) {
            this.changeSetId = this.changeSetId + 10;
            return new Promise(function (resolve, reject) {
                oDataModel.update(sEntityName, oPayload,
                    {
                        method: "POST",
                        groupId: "GID",
                        changeSetId: "changeSetId" + this.changeSetId,
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
            }.bind(this));
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
                        reject({ message: "Action cancelled.", popup: true });
                    }
                }
            });
        });
    }

    return {
        getI18nText,
        displayErrorMessagePopup,
        displayConfirmMessageBox,
        checkMandatoryParams: function (sType) {
            let oInputRequire = checkInputValue(this.getView(), sType);
            if (oInputRequire.error) {
                displayErrorMessagePopup(oInputRequire.message);
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

        getDateFilter: function (oFilter) {
            if (oFilter.FromDate && oFilter.ToDate) {
                return new Filter(oFilter.sPath, FilterOperator.BT, oFilter.FromDate, oFilter.ToDate);
            }
            return null;
        },

        updateODataCallList: async function (sEntityName, aPayload) {
            try {
                const oDataModel = this.getOwnerComponent().getModel();
                oDataModel.sDefaultUpdateMethod = "POST";
                const aDifGrp = oDataModel.getDeferredGroups();
                aDifGrp.push("updatePRHeadList");
                const aResponse = await updatePRList.call(this, sEntityName, aPayload, oDataModel);
                console.log(aResponse);
                return aResponse;
            } catch (error) {
                throw error;
            }
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

        getHeadSetUpdatePayload: function (aSelectedContext, sAction) {
            const oView = this.getView();
            const aPayload = [];
            if (aSelectedContext && aSelectedContext.length > 0) {
                let oPayload = {};
                aSelectedContext.forEach(function (oContext) {
                    oPayload = oContext.getObject();
                    delete oPayload.__metadata;
                    oPayload.Action = sAction.toUpperCase();
                    aPayload.push(oPayload);
                });
            } else {
                displayErrorMessagePopup(getI18nText(oView, "errorMessageNoItemSelected"));
            }
            return aPayload;

        }
    }
});
