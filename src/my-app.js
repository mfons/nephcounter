import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './nephcounter-main.js';
import './nephcounter-login.js';
import './shared-styles.js';
import 'polymerfire/firebase-auth.js';
import 'polymerfire/firebase-app.js';
import './redux-store.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class MyApp extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
    <style include="shared-styles">
      :host {
        --app-primary-color: blue;
        /* orange */
        --app-secondary-color: lightblue;
        /* teal */
        --app-primary-text-color: black;
        --app-secondary-text-color: gray;
        --app-error-color: red;
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      paper-button[raised] {
        background-color: var(--app-primary-color);
        color: black;
        font-size: 14px;
      }

      .offline {
        font-weight: 300;
        font-size: 18px;
      }

      .signin-view {
        color: black;
        padding-top: 10%;
        max-width: 400px;
        margin: auto;
        text-align: center;
      }

      .header {
        height: 300px;
        overflow: hidden;
      }

      h1 {
        letter-spacing: 2px;
        font-weight: 500;
      }

      p {
        font-weight: 300;
        font-size: 18px;
      }

      .giant {
        font-size: 2.8em;
      }

      .footer {
        font-size: 13px;
      }

      a:link,
      a:visited {
        color: var(--app-primary-color);
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      button {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
        background: var(--app-primary-color);
        color: white;
        border: none;
        border-radius: 3px;
        text-transform: uppercase;
        padding: 0.7em 0.57em;
        font-size: 14px;
        cursor: pointer;
      }

      .yellow-button {
        text-transform: none;
        color: #eeff41;
      }
    </style>


    <firebase-app auth-domain="nephcounter.firebaseapp.com" database-url="https://nephcounter.firebaseio.com" api-key="AIzaSyDbXgNCFBMglr8WWEkZuhMHQohMduiJsUM">
      <!-- storage-bucket="nephcounter.appspot.com"
      messaging-sender-id="808384625893"
      project-id="nephcounter" -->
    </firebase-app>
    <firebase-auth id="auth" user="{{user}}" provider="google">
    </firebase-auth>
    <!-- on-error="handleError" -->

    <paper-toast id="swtoast" duration="0" text="There is a new service-worker available.  Would you like to install it?">
      <paper-button on-tap="_refreshSW" class="yellow-button">Yes!</paper-button>
      <paper-button on-tap="_closeToast" class="yellow-button">No.</paper-button>
    </paper-toast>

    <div class="signin-view" id="signin" hidden="">
      <div class="header">
        <div class="giant">Nephcounter</div>
        <p>A Nutrient Monitoring and Reporting App Specialized for the needs of Dialysis Patients</p>
        <br>
        <nephcounter-login user="{{user}}" hidden\$="[[offline]]"></nephcounter-login>
        <div hidden\$="[[!offline]]" class="offline">We can't log on right now because we are offline.</div>
      </div>

      <p class="footer">Made with Google Polymer/2, Firebase, Redux, and the USDA nutrition database.&nbsp; Created by
        <a href="https://www.facebook.com/sandra.fons.94?fref=ts">Sandra M. Fons</a>, User Experience Consultant, and
        <a href="https://www.linkedin.com/in/michaelafons">Michael A. Fons</a>, Applications Developer. Consulting Nutritionist: Lesley Cloke, R.D. Find this on
        <a href="https://github.com/mfons/nephcounter">GitHub</a>.</p>
    </div>

    <nephcounter-main id="nephcountid"></nephcounter-main>
`;
  }

  static get is() { return 'my-app'; }
  static get properties() {
    return {
      offline: {
        type: Boolean,
        statePath: 'offline',
      },
      myServiceWorker: Object
    };
  }
  static get actions() {
    return {
      goOnline: () => { return { type: 'GO_ONLINE' } },
      goOffline: () => { return { type: 'GO_OFFLINE' } },
    };
  }

  static get observers() {
    return [
      '_myServiceWorkerChanged(myServiceWorker.*)'
    ];
  }


  ready() {
    super.ready();
    this.setUpOfflineListeners();

    this.$.auth.auth.onAuthStateChanged(function (user) {
      if (!!user) {
        //            this.importHref(this.resolveUrl('nephcount-main.html'), function() {
        //this.$.nephcountid.user = user;
        this.$.signin.hidden = true;
        this.$.nephcountid.hidden = false;
        // We went from hidden to visible, so app-layout needs to recompute its size.
        this.$.nephcountid.resizeHeader();
        //          });
      } else {
        this.$.signin.hidden = false;
        this.$.nephcountid.hidden = true;
      }
    }.bind(this));
  }

  _refreshSW() {
    this._closeToast();
    // could I just say navigator.serviceWorker ??
    this.myServiceWorker.postMessage({ action: 'skipWaiting' });
  }

  _closeToast() {
    this.$.swtoast.opened = false;
  }

  setUpOfflineListeners() {
    window.addEventListener('online', function () {
      this.dispatch('goOnline');
    }.bind(this));
    window.addEventListener('offline', function () {
      this.dispatch('goOffline');
    }.bind(this));
  }

  _myServiceWorkerChanged(myServiceWorkerObserved) {
    this.$.swtoast.opened = true;
  }
}

window.customElements.define(MyApp.is, MyApp);
