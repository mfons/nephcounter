import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-badge/paper-badge.js';
import './nephcounter-login.js';
import './my-icons.js';
import './redux-store.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/neon-animation/web-animations.js';
import './offlineStuffMixinForNutrientsOfInterest.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { importHref } from '@polymer/polymer/lib/utils/import-href.js';
class NephcounterMain extends
  OfflineStuffMixinForNutientsOfInterest(
    ReduxMixin(
      PolymerElement
    )
  ) {
  static get template() {
    return html`
    <style>
      :host {
        --app-primary-color: #4285f4;
        --app-secondary-color: black;

        display: block;
      }

      app-drawer-layout:not([narrow]) [drawer-toggle] {
        display: none;
      }

      app-header {
        color: #fff;
        background-color: var(--app-primary-color);
      }

      app-header paper-icon-button {
        --paper-icon-button-ink-color: white;
      }

      .drawer-list {
        margin: 0 20px;
      }

      .drawer-list a {
        display: block;
        padding: 0 16px;
        text-decoration: none;
        color: var(--app-secondary-color);
        line-height: 40px;
      }

      .drawer-list a.iron-selected {
        color: black;
        font-weight: bold;
      }

    </style>

    <app-location route="{{route}}"></app-location>
    <app-route route="{{route}}" pattern="/:page" data="{{routeData}}" tail="{{subroute}}"></app-route>

    <app-drawer-layout fullbleed="">
      <!-- Drawer content -->
      <app-drawer id="drawer" slot="drawer">
        <app-toolbar>Menu</app-toolbar>
        <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
          <a name="nutrientsofinterest" href="/nutrientsofinterest">Nutrients you care about</a>
          <a name="consumption" href="/consumption">Eat!</a>
          <a name="offline-capabilities" href="/offline-capabilities">Offline Capable...</a>
        </iron-selector>
        <nephcounter-login hidden\$="[[offline]]"></nephcounter-login>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout has-scrolling-region="" id="header">

        <app-header slot="header" condenses="" reveals="" effects="waterfall">
          <app-toolbar>
            <paper-icon-button icon="my-icons:menu" drawer-toggle=""></paper-icon-button>
            <div main-title="">Nephcounter</div>
            <template is="dom-if" if="[[offline]]">
              <paper-icon-button icon="my-icons:signal-cellular-connected-no-internet-0-bar"></paper-icon-button>
            </template>
            <paper-icon-button id="nutrientsOfInterestHeaderId" icon="my-icons:local-pharmacy"></paper-icon-button>
            <paper-tooltip for="nutrientsOfInterestHeaderId" position="left">
              <template id="nutrientsOfInterestHeaderListId" is="dom-repeat" items="[[nutrientsOfInterest]]">
                <div>[[item.name]]</div>
              </template>
            </paper-tooltip>

            <template is="dom-if" if="[[nutrientsOfInterestIsEmpty]]">
              <paper-badge for="nutrientsOfInterestHeaderId" label="[[nutrientsOfInterestCount]]!"></paper-badge>
            </template>
            <template is="dom-if" if="[[!nutrientsOfInterestIsEmpty]]">
              <paper-badge for="nutrientsOfInterestHeaderId" label="[[nutrientsOfInterestCount]]" class="green"></paper-badge>
            </template>

            <custom-style>
              <style is="custom-style">
                .green {
                  --paper-badge-background: var(--paper-green-300);
                }
              </style>
            </custom-style>
          </app-toolbar>
        </app-header>

        <iron-pages selected="[[page]]" attr-for-selected="name" fallback-selection="view404" role="main">
          <nc-nutrientsofinterest name="nutrientsofinterest"></nc-nutrientsofinterest>
          <nc-consumption name="consumption"></nc-consumption>
          <nc-offline-capabilities name="offline-capabilities"></nc-offline-capabilities>
          <my-view404 name="view404"></my-view404>
        </iron-pages>
      </app-header-layout>
    </app-drawer-layout>
`;
  }

  static get is() { return 'nephcounter-main'; }

  static get properties() {
    return {
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged',
      },
      offline: {
        type: Boolean,
        statePath: 'offline',
      },
      nutrientsOfInterest: {
        type: Array,
        statePath: 'nutrientsOfInterest',
      },
      nutrientsOfInterestIsEmpty: {
        type: Boolean,
        statePath: 'nutrientsOfInterestIsEmpty'
      },
      nutrientsOfInterestCount: {
        type: Number,
        statePath: 'nutrientsOfInterestCount'
      }
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  static get actions() {
    return {
      loadAllNutrientsOfInterest: (allNutrientsOfInterest) => {
        return {
          type: 'LOAD_ALL_NUTRIENTS_OF_INTEREST',
          allNutrientsOfInterest: allNutrientsOfInterest
        }
      },
    };
  }

  ready() {
    super.ready();
    this.addEventListener('state-changed', e => this._reduxStoreStateChanged(e));
  }

  _decideWhichPageToGoTo(page) {
    var thisWebComponent = this;
    this._getNutrientsOfInterestFromIndexedDbIfAvailable()
      .then((nutrientsOfInterestList) => {
        if (nutrientsOfInterestList.length === 0) {
          thisWebComponent.page = 'nutrientsofinterest';
        }
        else {
          thisWebComponent.page = 'consumption';
          thisWebComponent.dispatch('loadAllNutrientsOfInterest', nutrientsOfInterestList);
        }
      })
      .catch(() => {
        thisWebComponent.page = 'nutrientsofinterest';
      });
  }

  _reduxStoreStateChanged(e) {
    this.$.nutrientsOfInterestHeaderListId.render();
  }

  _routePageChanged(page) {
    // Polymer 2.0 will call with `undefined` on initialization.
    // Ignore until we are properly called with a string.
    if (page === undefined) {
      return;
    }

    this._directToCorrectPage(page);

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  _directToCorrectPage(page) {
    if (page) {
      this.page = page;
      if (this.page !== 'nutrientsofinterest') { // ...because badge is set up already in nutrientsofinterest page...so no need to do it again.
        this._resetBadge();
      }
    }
    else {
      this._decideWhichPageToGoTo(page);
    }
  }

  _resetBadge() {
    var thisWebComponent = this;
    this._getNutrientsOfInterestFromIndexedDbIfAvailable()
      .then((nutrientsOfInterestList) => {
        if (nutrientsOfInterestList && nutrientsOfInterestList.length > 0) {
          thisWebComponent.dispatch('loadAllNutrientsOfInterest', nutrientsOfInterestList);
        }
      })
      .catch((err) => { console.warn("error or promise rejection occurred getting nutrients of interest:", err) });
  }

  _pageChanged(page) {
    // Load page import on demand. Show 404 page if fails
    var resolvedPageUrl = this.resolveUrl('nc-' + page + '.html');
    importHref(
      resolvedPageUrl,
      null,
      this._showPage404.bind(this),
      true);
  }

  _showPage404() {
    this.page = 'view404';
  }

  resizeHeader() {
    this.$.header.fire('iron-resize');
  }
}

window.customElements.define(NephcounterMain.is, NephcounterMain);
