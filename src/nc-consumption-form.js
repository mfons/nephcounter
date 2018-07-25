import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-input/paper-input.js';
import './nc-foods-by-text-search.js';
import './nc-nutrients-for-a-food.js';
import './redux-store.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icon/iron-icon.js';
import './my-icons.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-styles/color.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/neon-animation/web-animations.js';
import 'polymerfire/firebase-query.js';
import 'polymerfire/firebase-auth.js';
import 'vaadin-date-picker/vaadin-date-picker.js';
import './mixins/dateUtilsMixin.js';
import './nc-alter-food-nutrient-amounts.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NcConsumptionForm extends
    DateUtilsMixin(
        ReduxMixin(
            PolymerElement
        )
    ) {
  static get template() {
    return html`
        <custom-style>
            <style include="shared-styles">
                :host {
                    display: block;

                    padding: 10px;
                }

                .horizontal {
                    @apply --layout-horizontal;
                }

                .item.selected {
                    background: black;
                    color: white;
                }

                .item {
                    background: white;
                    padding: 10px;
                    border-bottom: 1px solid #ccc;
                }

                iron-list {
                    height: 72vh;
                    /* don't use % values unless the parent element is sized. */
                    width: 75vw;
                }

                .yellow-button {
                    text-transform: none;
                    color: #eeff41;
                }

                paper-icon-button.blue,
                paper-button.blue {
                    --paper-icon-button-ink-color: var(--paper-black-500);
                    background-color: var(--paper-light-blue-500);
                    color: white;
                    border-radius: 3px;
                    padding: 2px;
                }

                .gram-weight-field {
                    width: 80px;
                    margin-left: 3px;
                }
            </style>
        </custom-style>

        <firebase-auth id="auth" user="{{user}}">
        </firebase-auth>

        <firebase-query id="consumptionQuery" path="[[_getConsumptionQueryPath(user.uid)]]">
        </firebase-query>

        <nc-foods-by-text-search text-search="[[textSearch]]" id="foodsByTextSearch" is-standard-reference="[[isStandardReference]]">
        </nc-foods-by-text-search>

        <nc-nutrients-for-a-food food-id="[[foodId]]" food-name="[[foodName]]">
            <!-- custom-foods="[[customFoods]]" -->
        </nc-nutrients-for-a-food>

        <iron-form id="presubmit">
            <form method="get" action="/">
                <paper-input id="foodFluidSearchStringId" on-click="_onSearchStringTap" name="foodFluidSearch" label="1. Search for a Food" value="{{foodFluidSearchString}}" required="" autocapitalize="off" spellcheck="true" on-blur="_getFoodData"></paper-input>
                <paper-toggle-button checked="{{isStandardReference}}">
                    (Only Search Generic Food List)
                </paper-toggle-button>
                <paper-dropdown-menu on-iron-select="_foodSelectionMenuIronSelectHandler" required="" style="width:100%;" label="2. Pick a specific food" id="foodSelectionMenu" vertical-align="bottom" horizontal-align="left">
                    <!--on-opened-changed="_foodFluidListOpenedChanged" on-tap="_foodSelectionMenuTapped"-->
                    <div id="foodSelectionDropdownContentId" class="dropdown-content" slot="dropdown-content" style="width: 75vw; height: 72vh; ">
                        <iron-list id="foodFluidIronList" items="[[_foodsChanged(foods.*)]]" selected-item="{{selectedFood}}" selection-enabled="">
                            <template>
                                <div on-click="_foodFluidItemToggled" tabindex\$="[[tabIndex]]" class\$="[[_computedClass(selected)]]">[[item.name]]</div>
                                <!--   -->
                            </template>
                        </iron-list>
                    </div>
                </paper-dropdown-menu>
                <div class="horizontal">
                    <paper-input name="measure" label="(Serving size)" readonly="true" value="[[_getMeasure(foodNutrients.*)]]"></paper-input>
                    <paper-input class="gram-weight-field" name="weight" label="(Weight (g))" readonly="true" value="[[_getWeight(foodNutrients.*)]]"></paper-input>
                </div>
                <div class="horizontal">
                    <paper-input id="multiplierFieldId" name="multiplier" on-click="_onMultiplierTap" type="number" step="any" label="3. How many servings?" value="{{multiplier}}" required=""></paper-input>
                    <paper-input class="gram-weight-field" name="consumedGrams" label="(Total (g))" value="{{consumedGrams}}" readonly="true"></paper-input>
                </div>
                <paper-icon-button icon="my-icons:local-dining" raised="" on-tap="_submit" title="Consume" class="blue"></paper-icon-button>
                <paper-icon-button icon="my-icons:clear" raised="" on-tap="_reset" title="Reset" class="blue"></paper-icon-button>
            </form>
        </iron-form>

        <div class="card" style="margin: unset;">
            <h2 style="font-size: 1em;">Nutrients you care about...</h2>
            <iron-list items="[[_getNutrientsFromFoodNutrients(foodNutrients.*)]]">
                <template>
                    <div class="item horizontal" style="font-size:.7em; width: fit-content;">
                        <div style="width: min-content;">[[item.nutrient]]:&nbsp;&nbsp;</div>
                        <div style="width: min-content;">[[_applyMultiplier(item.value, multiplier)]]&nbsp;</div>
                        <div>[[item.unit]]</div>
                    </div>
                </template>
            </iron-list>

            <paper-icon-button class="blue" icon="my-icons:edit" raised="" on-tap="_editNutrients">
            </paper-icon-button>
            <div class="horizontal">
                <paper-input class="shortField" value="[[todayString]]" label="Report Date" placeholder="YYYY-MM-DD"></paper-input>
                <paper-button class="btn blue" on-tap="_showChangeDateDialog" raised="">Change Date</paper-button>
            </div>

            <paper-dialog id="changeDateDialog" class="paper-date-picker-dialog" on-iron-overlay-closed="_dismissChangeDateDialog">
                <vaadin-date-picker id="picker" value="{{selectedDate}}" initial-position="[[todayString]]" label="Pick a date">
                </vaadin-date-picker>
                <div class="horizontal">
                    <paper-button class="blue" dialog-dismiss="">Cancel</paper-button>
                    <paper-button class="blue" dialog-confirm="">OK</paper-button>
                </div>
            </paper-dialog>

            <paper-dialog id="editConsumptionNutrientsDialog">
                <nc-alter-food-nutrient-amounts food-nutrients="[[_getNutrientsFromFoodNutrients(foodNutrients.*)]]" multiplier="[[multiplier]]"> 
                </nc-alter-food-nutrient-amounts>
                <div class="buttons">
                    <paper-button dialog-dismiss="">Cancel</paper-button>
                    <paper-button dialog-confirm="" autofocus="">Save Nutrients</paper-button>
                </div>
            </paper-dialog>

        </div>

        <paper-toast duration="10000" id="noResultsFoundToastId" text="We did not find any foods for '[[textSearch]]'; try a different search.">
            <!-- <paper-button onclick="this.parentElement.toggle()" class="yellow-button">Close now!</paper-button> -->
        </paper-toast>
`;
  }

  static get is() { return 'nc-consumption-form'; }

  static get actions() {
      return {
          saveAlteredFoodNutrients: (consumptionFormAlteredNutrients) => {
              return {
                  type: 'SAVE_ALTERED_CONSUMPTION_FORM_FOOD_NUTRIENTS',
                  consumptionFormAlteredNutrients:  consumptionFormAlteredNutrients
              }
          }
      };
  }

  static get properties() {
      return {
          offline: {
              type: Boolean,
              statePath: "offline"
          },
          isStandardReference: {
              type: Boolean,
              value: true
          },
          foodFluidSearchString: {
              type: String,
          },
          textSearch: {
              type: String,
              value: "butter"
          },
          foods: {
              type: Array,
              statePath: 'latestFoodList'
          },
          queryBroughtBackNoFoodList: {
              type: Boolean,
              statePath: 'latestQueryBroughtBackNoFoodList'
          },
          lastQueryString: {
              type: String,
              statePath: 'latestFoodListQueryString'
          },
          selectedFood: {
              type: Object,
              observer: '_selectedFoodChanged'
          },
          foodId: {
              type: String
          },
          foodName: {
              type: String
          },
          foodNutrients: {
              type: Object,
              statePath: 'foodNutrientsForCurrentlySelectedFood'
          },
          measure: String,
          multiplier: {
              type: Number,
              value: 0
          },
          weight: {
              type: Number,
              value: 0
          },
          consumedGrams: {
              type: Number,
              computed: '_calculateConsumedGrams(weight, multiplier)'
          },
          alteredNutrients: {
              type: Array,
              statePath: 'consumptionFormAlteredNutrients'
          },
      };
  }

  _showChangeDateDialog() {
      this.$.changeDateDialog.opened = true;
  }

  _dismissChangeDateDialog(event) {
      if (event.detail.confirmed) {
          this.todayString = this._formatLocalDate(new Date(this.$.picker.value)).substring(0, 10);
          this.todayStringStart = this.todayString + "T00:00:00";
          this.todayStringEnd = this.todayString + "T23:59:59";
      }
  }

  _editNutrients(event) { // TODO
      this.$.editConsumptionNutrientsDialog.opened = true;
  }

  _onMultiplierTap() {
      this.$.multiplierFieldId.inputElement.inputElement.select();
  }

  _onSearchStringTap() {
      this.$.foodFluidSearchStringId.inputElement.inputElement.select();
  }

  _applyMultiplier(nutrientValue, multiplier) {
      if (nutrientValue === "--") {
          return "[Value Not Available]";
      }
      return (nutrientValue * multiplier).toFixed(2);
  }

  _getNutrientsFromFoodNutrients(changeRecord) {
      if (changeRecord.base.length > 0) {
          this.notifyPath('foodNutrients.0.nutrients');
          return changeRecord.base[0].nutrients;
      }
      return [];
  }

  _calculateConsumedGrams(weight, multiplier) {
      return (weight * multiplier).toFixed(2);
  }

  _getWeight(changeRecord) {
      if (changeRecord.base.length > 0) {
          this.set('weight', changeRecord.base[0].weight);
          return changeRecord.base[0].weight;
      }
  }

  _getMeasure(changeRecord) {
      if (changeRecord.base.length > 0) {
          this.set('measure', changeRecord.base[0].measure);
          return changeRecord.base[0].measure;
      }
  }

  _hideTheToast() {
      this.$.noResultsFoundToastId.opened = false;
      console.info("closed toast");
  }

  _standardReferenceChanged(standardReferenceValue) {
      console.info("standard reference was changed to ", standardReferenceValue);
      return standardReferenceValue;
  }

  ready() {
      super.ready();
      this.addEventListener('state-changed', (e) => { this._reduxStoreStateChanged(e); });
      var toastDismissalButton = this.$.noResultsFoundToastId.querySelector(".yellow-button");
      // // Create an observer instance linked to the callback function
      // var observer = new MutationObserver((mutationsList) => {
      //     for (var mutation of mutationsList) {
      //         console.info('The ' + mutation.attributeName + ' attribute was modified.', mutation);
      //     }
      // });
      // // Start observing the target node for configured mutations
      // observer.observe(toastDismissalButton, { attributes: true });
  }

  _foodFluidItemToggled(e) {
      //console.log("food/fluid click: ", this.selectedFood);
      if (this.selectedFood !== null) {
          this.$.foodSelectionDropdownContentId.dispatchEvent(new CustomEvent('iron-select', { bubbles: true, composed: true, detail: { item: e.currentTarget /*this.selectedFood*/ } }));
      }
      // this.$.foodSelectionMenu.opened = false;
  }

  _foodSelectionMenuIronSelectHandler(e) {
      console.debug("in _foodSelectionMenuIronSelectHandler: ", e);
  }

  // _foodFluidListOpenedChanged_foodFluidListOpenedChanged() {
  //     console.log("food/fluid list opened property changed", this.$.foodSelectionMenu.opened);
  //     if (this.$.foodSelectionMenu.opened) {
  //         this.$.foodFluidIronList.notifyResize();
  //     }
  // }

  _getFoodData() {
      if (this.foodFluidSearchString && this.foodFluidSearchString !== '') {
          this.textSearch = this.foodFluidSearchString;
      }
  }

  _reduxStoreStateChanged(e) {
      console.log("redux store state changed...in nc-consumption-form", this.foods);
      if (this.queryBroughtBackNoFoodList) {
          this.$.noResultsFoundToastId.opened = true;
          console.info("opened toast");
          this.$.foodSelectionMenu.disabled = true;
      }
      else {
          this.$.foodSelectionMenu.disabled = false;
      }
      //this.$.foodListId.render(); // this only applies to dom-repeat sometimes...not iron-list
      //this.$.foodSelectionMenu.opened = true; // TODO not sure about this??
      if (this.alteredNutrients.length > 0) {
          this.set('foodNutrients', this.alteredNutrients);
          // start here ==> TODO? anything else need to be done to notify polymer binding about foodNutrient change or the iron-list?
          this.dispatch('saveAlteredFoodNutrients', []); // clear it out
      }
  }

  _foodsChanged(changeRecord) {
      if (changeRecord) {
          return changeRecord.base;
      }
  }

  _computedClass(isSelected) {
      var classes = 'item';
      if (isSelected) {
          classes += ' selected';
      }
      return classes;
  }

  _selectedFoodChanged(selectedIndex, oldObject) {
      console.log("my-consumption:  selectedFood has changed: " + selectedIndex);
      if (typeof selectedIndex === "undefined" || selectedIndex === null) {
          return;
      }
      this.set('foodId', selectedIndex.ndbno);
      this.set('foodName', selectedIndex.name);
  }

  _isFirebaseOnline() {
      return firebase.database().ref(".info/connected").once("value");
  }

  // TODO I don't like passing in this here, but it got
  // lost in all the promise change with what "this" meant.  
  // I could have used bind, too, I imagine.
  storeInFirebaseAndDequeueEatenItemFromIndexDBQueue(me, eatData) {
      // TODO idb: take lessons learned from SW class:  use npm idb?
      // generate your own mixin library that you 
      // can reuse across your app?
      // TODO Should this work be done in this web-component
      // or in its parent component -- nc-consumption.html?
      this._openIDB()
          .then((db) => {
              if (!db.objectStoreNames.contains('eatenItemsQueue')) {
                  reject("eatenItemsQueue object store has not been created yet to save to.");
                  console.warn("eatenItemsQueue object store has not been created yet to save to.", db.objectStoreNames);
                  db.close();
                  return;
              }
              var objectStore = db.transaction(["eatenItemsQueue"], "readonly").objectStore("eatenItemsQueue");
              me._getAllIDB(objectStore)
                  .then(({ values, keys }) => {
                      me._isFirebaseOnline()
                          .then((isFirebaseConnected) => {
                              if (isFirebaseConnected.val()) {
                                  return Promise.all(values.map(value => me.$.consumptionQuery.ref.push(value)));
                              }
                              else {
                                  return Promise.reject("Firebase was not connected, so we will not attempt to push data yet.");
                              }
                          })
                          .then(() => {
                              return me._deleteRecsIDB(db, keys);
                          })
                          .then(() => {
                              console.info("wow!  it seems like we have actually stored everything to firebase and removed it all from idb!"/*, eatData.addedId*/);
                              db.close();
                          })
                          .catch((err) => {
                              console.warn("storeInFirebaseAndDequeueEatenItemFromIndexDBQueue produced an error:", err);
                              db.close();
                          });
                  });
          });
  }

  enqueueEatenItemToIndexedDB() {
      let newObject = {
          "name": "example food3",
          "ndbno": "00002",
          "nutrientsOfInterest": [{
              "value": 0,
              "name": "example nutrient",
              "nutrientId": 0,
              "uofm": "oz"
          }],
          "measure": "1 serving size",
          "weight": 15,
          "multiplier": 1,
          "consumedGrams": 15,
          "consumedDate": null
      };
      newObject.name = this.foods[this.selectedFood.offset].name;
      newObject.ndbno = this.foods[this.selectedFood.offset].ndbno;
      newObject.measure = this.measure;
      newObject.weight = this.weight;
      newObject.multiplier = this.multiplier;
      newObject.consumedGrams = this.consumedGrams;
      newObject.consumedDate = (this._isHistoric(this.todayString)) ? this.todayStringEnd : this._formatLocalDate(new Date());
      newObject.nutrientsOfInterest = this.foodNutrients[0].nutrients;

      return this.writeEatenItemToIndexedDB(newObject);
  }

  _deleteRecIDB(objectStore, keyString) {
      return new Promise((resolve, reject) => {
          var request = objectStore.delete(keyString);
          request.onsuccess = function (event) {
              resolve();
          };
      });
  }

  _deleteRecsIDB(db, keys) {
      let thisWebComponent = this;
      return Promise.all(keys.map(key => {
          var objectStore = db.transaction(["eatenItemsQueue"], "readwrite").objectStore("eatenItemsQueue");
          return thisWebComponent._deleteRecIDB(objectStore, key);
      }));
  }

  _getAllIDB(objectStore) {
      return new Promise((resolve, reject) => {
          let allValues = [];
          let allKeys = [];
          let request = objectStore.openCursor();
          request.onsuccess = function (event) {
              var cursor = event.target.result;
              if (cursor) {
                  allValues.push(cursor.value);
                  allKeys.push(cursor.key);
                  cursor.continue();
              }
              else {
                  resolve({ values: allValues, keys: allKeys });
              }
          };
          request.onerror = (event) => {
              reject(event);
          }
      });
  }

  _openIDB() {
      return new Promise((resolve, reject) => {
          var db;
          var request = window.indexedDB.open("NephcounterOffLineDB");
          request.onerror = function (event) {
              // Do something with request.errorCode!
              console.log("NephcounterOffLineDB creation failed!", event)
              reject("open of database failed with error!");
          }; // end of onerror
          request.onsuccess = function (event) {
              console.log("NephcounterOffLineDB open succeeded!");
              resolve(event.target.result);
          }; // end of onsuccess

          // This is done only if there is no database and one needs to be created before we read from it.
          request.onupgradeneeded = function (event) {
              console.log("an upgrade is needed...");
              var db = event.target.result;
          }; // end of onupgradeneeded
      });
  }

  // TODO: Move this function and other offline-related items
  // to a mixin?
  writeEatenItemToIndexedDB(item) {
      return new Promise((resolve, reject) => {
          var db;
          var request = window.indexedDB.open("NephcounterOffLineDB");
          request.onerror = function (event) {
              // Do something with request.errorCode!
              console.log("NephcounterOffLineDB creation failed!", event)
              reject("open of database failed with error!");
          }; // end of onerror
          request.onsuccess = function (event) {
              console.log("NephcounterOffLineDB open succeeded!");
              db = event.target.result;
              if (!db.objectStoreNames.contains('eatenItemsQueue')) {
                  reject("eatenItemsQueue object store has not been created yet to save to.");
                  console.warn("eatenItemsQueue object store has not been created yet to save to.", db.objectStoreNames);
                  db.close();
                  return;
              }
              var objectStore = db.transaction(["eatenItemsQueue"], "readwrite").objectStore("eatenItemsQueue");
              var request = objectStore.add(item);
              request.onerror = function (event) {
                  // assuming that 1 was not found so it needs to be added
                  console.warn("Caught querying record 1 from nutrientsOfInterest from error in event: ", event);
                  db.close();
                  reject("Caught querying record 1 from nutrientsOfInterest; check for console warning for specifics");
              };
              request.onsuccess = function (event) {
                  // Get the old value that we want to update
                  var data = event.target.result;
                  console.log("added nutrients of interest to indexeddb");
                  db.close()
                  resolve({ addedId: event.target.result, item: item });
                  return;
              };

          }; // end of onsuccess

          // This is done only if there is no database and one needs to be created before we read from it.
          request.onupgradeneeded = function (event) {
              console.log("an upgrade is needed...");
              var db = event.target.result;
          }; // end of onupgradeneeded
      });
  }

  // send message to serviceWorker
  _sendMessageToSWToRegisterSync(eatData) {
      // navigator.serviceWorker.controller.postMessage({ type: 'somethingWasEaten', addedId, options });
      // TODO?? if needed I do not think we need this if we somehow used the tag
      // to pass data...like ('somethingWasEaten:' + addedId) but maybe this is 
      // better...?  Or maybe just agree that if there was anything in the queue
      // that it would be written all at once...not sure.  Fewer moving parts is 
      // better by far.  Could just register a sync here and be done with it. -- 1/29/18
      let thisWebComponent = this;
      return new Promise((resolve, reject) => {
          // Create a Message Channel
          const msg_chan = new MessageChannel();
          const msg = { type: 'somethingWasEaten', addedId: eatData.addedId };
          // Handler for recieving message reply from service worker
          msg_chan.port1.onmessage = event => {
              if (event.data.startsWith('Please')) {
                  // This means it failed last time and it is trying again.
                  thisWebComponent.storeInFirebaseAndDequeueEatenItemFromIndexDBQueue(thisWebComponent, eatData);
              }
              // if (event.data.error) {
              //     reject(event.data.error);
              // } else {
              //     resolve(event.data);
              // }
          }
          // TODO?  if the user does shift-refresh, navigator.serviceWorker.controller
          // will be null!  And then the following will fail.
          navigator.serviceWorker.controller.postMessage(msg, [msg_chan.port2]);
          // NOTE:  the following alternate code
          // works the same as the sync that is in the service worker
          // 'message' event handler;  unfortunately neither option
          // works on my phone in airplane mode...the sync reg occurs but
          // the 'sync event is never dispatched.
          // setTimeout(async () => {
          //     const reg = await thisWebComponent.registerServiceWorker();
          //     if (reg.sync && reg.sync.getTags) {
          //         await reg.sync.register(eatData.addedId);
          //     }
          // }, 1000);
          resolve(eatData);
      });
  }

  registerServiceWorker() {
      if (!navigator.serviceWorker) {
          return Promise.reject(Error("Service worker not supported"));
      }
      return navigator.serviceWorker.register('/service-worker.js');
  }

  _submit() {
      const thisWebComponent = this;
      const enqueuePromise = this.enqueueEatenItemToIndexedDB();
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
          enqueuePromise.then((eatData) => {
              thisWebComponent._sendMessageToSWToRegisterSync(eatData)
                  .then((eatData) => { /*thisWebComponent.storeInFirebaseAndDequeueEatenItemFromIndexDBQueue(thisWebComponent, eatData);*/ })
                  .catch((error) => { console.warn("received error from sw sync processing: ", error); });
          });
      } else {
          // serviceworker/sync not supported
          enqueuePromise.then((eatData) => { thisWebComponent.storeInFirebaseAndDequeueEatenItemFromIndexDBQueue(thisWebComponent, eatData); });
      }
  }

  _reset(event) {
      //var form = Polymer.dom(event).localTarget.parentElement
      this.$.presubmit.reset();
  }

  _getConsumptionQueryPath(newValue, oldValue) {
      return "/users/" + newValue + "/consumption";
  }
}

window.customElements.define(NcConsumptionForm.is, NcConsumptionForm);
