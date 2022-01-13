import {
  customElement,
  property,
  LitElement,
  html,
  css,
  state,
  queryAssignedNodes,
  query,
} from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map.js';
import Cookies from 'js-cookie';
import styles from './styles.scss';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

@customElement('cookie-message')
export class CookieMessage extends LitElement {
  @state() protected _active = false;
  @state() protected _theme = {};
  @property({ attribute: 'background-color' }) backgroundColor = 'black';
  @property({ attribute: 'button-allow-selection-text' })
  buttonAllowSelectionText = 'A';
  @property({ attribute: 'button-allow-all-text' }) buttonAllowAllText = 'B';
  @property({ attribute: 'color' }) color = 'white';
  @property({ attribute: 'google-tag-id' }) googleTagId = null;

  @query('input#tracking')
  private trackingInput!: HTMLInputElement;

  static styles = [styles];

  firstUpdated() {
    // create theme
    this._theme = {
      backgroundColor: this.backgroundColor,
      color: this.color,
    };

    if (Cookies.get('cookie_consent') === undefined) {
      setTimeout(() => {
        this._active = true;
      }, 100);
    } else {
      this._initGoogleTag();
    }
  }

  private _initGoogleTag() {
    if (Cookies.get('cookie_consent_tracking')) {
      window.dataLayer = window.dataLayer || [];
      function gtag(id: any, value: any) {
        window.dataLayer.push([id, value]);
      }
      gtag('js', new Date());
      gtag('config', this.googleTagId);
    }
  }

  private _onAllowAll() {
    Cookies.set('cookie_consent', 'all', { expires: 365 });
    Cookies.set('cookie_consent_tracking', 'true', {
      expires: 365,
    });
    this._active = false;
    this._initGoogleTag();
  }

  private _onAllowSelection() {
    Cookies.set('cookie_consent', 'selection', { expires: 365 });
    Cookies.set('cookie_consent_tracking', `${this.trackingInput.checked}`, {
      expires: 365,
    });
    this._active = false;
    this._initGoogleTag();
  }

  render() {
    return html`
      <div class="container ${this._active ? 'active' : ''}">
        <div class="backdrop"></div>
        <div class="wrapper" style=${styleMap(this._theme)}>
          <div class="inner">
            <slot></slot>
            <div class="checkbox-container">
              <div class="checkbox-row">
                <input type="checkbox" class="apple-switch" checked disabled />
                <slot name="functional"></slot>
              </div>
              <div class="checkbox-row">
                <input type="checkbox" class="apple-switch" id="tracking" />
                <slot name="tracking"></slot>
              </div>
            </div>
            <div class="button-row">
              <button @click=${this._onAllowSelection} class="secondary">
                ${this.buttonAllowSelectionText}
              </button>
              <button @click=${this._onAllowAll}>
                ${this.buttonAllowAllText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}