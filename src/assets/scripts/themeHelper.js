import axios from "axios";
import store from "../../store";

import dashboards from "@/assets/config/dashboards.json";
import database from "@/assets/config/database.json";
import indicators from "@/assets/config/indicators.json";
import tables from "@/assets/config/tables.json";
export default {
  loadThemeData(theme, callback) {
    const themeInfo = dashboards.themes.find((obj) => {
      return obj.name === theme;
    });
    const themeDataSources = [];
    let cardInfo;
    //console.log(themeInfo)
    themeInfo.contents.forEach((content) => {
      if (content.cards) {
        content.cards.forEach((card) => {
          cardInfo = indicators.indicators.find((ind) => {
            return ind.name === card.name;
          });
        });
        let chkDs = themeDataSources.find((ds) => {
          return ds === cardInfo.data.layerId;
        });
        //console.log(cardInfo)
        if (!chkDs) {
          themeDataSources.push(cardInfo.data.layerId);
        }
      }
    });

    //axios - build up requests
    const requestsToMake = [];
    themeDataSources.forEach((dataSourceName) => {
      let dataSource = database.datasources.find((obj) => {
        return obj.layerId === dataSourceName;
      });
      if (dataSource) {
        let url = new URL(dataSource.url + "/query");
        let params = {};
        if (store.state.isPublic) {
          params = {
            where: dataSource.preFilter,
            outFields: "*",
            f: "json",
            returnGeometry: false,
          };
        } else {
          params = {
            where: dataSource.preFilter,
            outFields: "*",
            f: "json",
            returnGeometry: false,
            token: store.state.esriCred.token,
          };
        }
        url.search = new URLSearchParams(params).toString();
        dataSource.qurl = url;
        requestsToMake.push(dataSource);
      }
    });
    //get related data if not already loaded
    requestsToMake.forEach((data) => {
      if ("relationshipInfos" in data) {
        data.relationshipInfos.forEach((relation) => {
          let chkData = requestsToMake.find((obj) => {
            return obj.layerId === relation.relLayerId;
          });
          if (!chkData) {
            let dataSource = database.datasources.find((obj) => {
              return obj.layerId === relation.relLayerId;
            });
            if (dataSource) {
              let url = new URL(dataSource.url + "/query");
              let params = {};
              if (store.state.isPublic) {
                params = {
                  where: dataSource.preFilter,
                  outFields: "*",
                  f: "json",
                  returnGeometry: false,
                };
              } else {
                params = {
                  where: dataSource.preFilter,
                  outFields: "*",
                  f: "json",
                  returnGeometry: false,
                  token: store.state.esriCred.token,
                };
              }
              url.search = new URLSearchParams(params).toString();
              dataSource.qurl = url;
              requestsToMake.push(dataSource);
            }
          }
        });
      }
    });
    let axioRequests = [];
    requestsToMake.forEach((request) => {
      let axioRequest = axios.get(request.qurl);
      axioRequests.push(axioRequest);
    });
    const themeDS = [];
    axios.all(axioRequests).then(
      axios.spread((...responses) => {
        responses.forEach((response, i) => {
          let dataObject = requestsToMake[i];
          if (response.data.features.length > 0) {
            let data = response.data;
            let domains = [];
            data.fields.forEach((field) => {
              if (field.domain !== null) {
                data.features.forEach((feature) => {
                  let value = feature.attributes[field.name];
                  let dValue;
                  field.domain.codedValues.forEach((domain) => {
                    if (value === domain.code) {
                      dValue = domain.name;
                    }
                  });
                  feature.attributes[field.name] = dValue;
                });
                domains.push({
                  fieldName: field.name,
                  name: field.domain.name,
                  type: field.domain.type,
                  codedValues: field.domain.codedValues,
                });
              }
            });
            dataObject.domains = domains;
            dataObject.features = data.features;
            themeDS.push(dataObject);
          } else {
            dataObject.domains = null;
            dataObject.features = null;
            themeDS.push(dataObject);
          }
        });

        //Now Build up data modifications
        themeDS.forEach((dataObject) => {
          if ("relationshipInfos" in dataObject) {
            dataObject.relationshipInfos.forEach((rel) => {
              if (rel.modifyValues) {
                rel.modifyActions.forEach((action) => {
                  let relData = null;
                  let v2modify = null;
                  let v2modify1 = "";
                  switch (action.type) {
                    case "replace":
                      dataObject.features.forEach((feature, f) => {
                        v2modify = feature.attributes[action.sourceColumn];
                        if (v2modify) {
                          v2modify1 = v2modify.replace(
                            action.findString,
                            action.replaceWith
                          );
                          feature.attributes[action.newForeignKeyField] =
                            parseInt(v2modify1);
                        }
                      });
                      break;
                    case "addColumn":
                      relData = themeDS.find((data) => {
                        return data.layerId === rel.relLayerId;
                      });
                      if (relData) {
                        dataObject.features.forEach((feature, i) => {
                          v2modify = relData.features.find((obj) => {
                            return (
                              obj.attributes[rel.foreignKeyField] ===
                              feature.attributes[rel.keyField]
                            );
                          });
                          if (v2modify) {
                            feature.attributes[action.newColumn] =
                              v2modify.attributes[action.sourceColumn];
                          } else {
                            feature.attributes[action.newColumn] = null;
                          }
                        });
                      }
                      break;
                    case "replaceValue":
                      relData = themeDS.find((data) => {
                        return data.layerId === rel.relLayerId;
                      });
                      if (relData) {
                        //console.log(relData)
                        dataObject.features.forEach((feature) => {
                          v2modify = relData.features.find((obj) => {
                            return (
                              obj.attributes[rel.keyField] ===
                              feature.attributes[rel.foreignKeyField]
                            );
                          });
                          if (v2modify) {
                            feature.attributes[action.existColumn] =
                              v2modify.attributes[action.sourceColumn];
                          }
                        });
                      } else {
                        //console.log("Related data could not be found")
                      }
                      break;
                    case "appendValues":
                      relData = themeDS.find((data) => {
                        return data.layerId === rel.relLayerId;
                      });
                      if (relData) {
                        //console.log(relData)
                        dataObject.features.forEach((feature) => {
                          v2modify = relData.features.find((obj) => {
                            return (
                              obj.attributes[rel.foreignKeyField] ===
                              feature.attributes[rel.keyField]
                            );
                          });
                          if (v2modify) {
                            //found matching pa aggreement
                            action.appendColumns.forEach((appCol) => {
                              let sourceColVal =
                                feature.attributes[appCol.sourceColumn];
                              appCol.appendValColumns.forEach((c) => {
                                if (isNaN(v2modify.attributes[c])) {
                                  sourceColVal + 0;
                                } else {
                                  sourceColVal =
                                    sourceColVal + v2modify.attributes[c];
                                }
                              });
                              feature.attributes[appCol.sourceColumn] =
                                sourceColVal;
                            });
                          } else {
                            //console.log("FOUND NO MATCH")
                          }
                        });
                      } else {
                        //console.log("Related data could not be found")
                      }

                      break;
                    default:
                      break;
                  }
                });
              }
            });
          }
        });
        console.log(themeDS);
        callback(themeDS);
      })
    );
  },
  loadIndicatorInfo(indicatorName, callback) {
    let cardInfo = indicators.indicators.find((ind) => {
      return ind.name === indicatorName;
    });
    callback(cardInfo);
  },
  loadTableInfo(tableName, callback) {
    let tableInfo = tables.tables.find((obj) => {
      return obj.name === tableName;
    });
    callback(tableInfo);
  },
  loadFilters(theme, datas, callback) {
    let dashboard = dashboards.themes.find((obj) => {
      return obj.name === theme;
    });
    let filtersToLoad = {};
    let timeFilters = [];
    let standardFilters = [];
    dashboard.filters.forEach((themeFilter) => {
      if (themeFilter.display) {
        if (themeFilter.filterType === "time") {
          themeFilter.subFilters.forEach((sfilter) => {
            if (sfilter.filterType === "combo") {
              let filter = {
                name: sfilter.name,
                title: sfilter.title,
                layerId: sfilter.layerId,
              };
              let filterValues = this.getFilterValues(sfilter, datas);
              filter.filterValues = filterValues;
              timeFilters.push(filter);
            }
          });
        } else {
          let filter = {
            name: themeFilter.name,
            title: themeFilter.title,
            layerId: themeFilter.layerId,
          };
          let filterValues = this.getFilterValues(themeFilter, datas);
          filter.filterValues = filterValues;
          standardFilters.push(filter);
        }
      }
    });
    filtersToLoad.standardFilters = standardFilters;
    filtersToLoad.timeFilters = timeFilters;
    callback(filtersToLoad);
  },
  getFilterValues(themeFilter, datas) {
    //get dataObject
    //console.log(themeFilter);
    let fData = datas.find((obj) => {
      return obj.layerId === themeFilter.layerId;
    });
    let cItems = [];
    let cItem = {};
    //console.log(fData);
    if (fData) {
      if ("domains" in fData) {
        if (fData.domains !== null) {
          if (themeFilter.useDomain) {
            let dData = fData.domains.find((obj) => {
              return obj.fieldName === themeFilter.column;
            });
            dData.codedValues.forEach((cValue) => {
              cItem = {
                text: cValue.name,
                value: cValue.name,
              };
              cItems.push(cItem);
            });
            cItems.sort(this.compare);
          } else {
            if ("values" in themeFilter) {
              cItems = themeFilter.values;
            } else {
              //console.log(themeFilter.column);
              fData.features.forEach((feature) => {
                let fValue = feature.attributes[themeFilter.column];
                //console.log(fValue);
                if (fValue) {
                  let vCheck = cItems.find((item) => {
                    return item.value === fValue;
                  });
                  if (!vCheck) {
                    cItem = {
                      text: fValue,
                      value: fValue,
                    };
                    cItems.push(cItem);
                  }
                }
              });
              cItems.sort(this.compare);
            }
          }
        }
      }
    }
    return cItems;
  },
};
