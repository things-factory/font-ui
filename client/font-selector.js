import { i18next, localize } from '@things-factory/i18n-base'
import '@things-factory/setting-base'
import { css, html, LitElement } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'

import { store, ScrollbarStyles, pulltorefresh } from '@things-factory/shell'
import { fetchFontList, createFont, updateFont, deleteFont } from '@things-factory/font-base'
import './font-creation-card'

export class FontSelector extends localize(i18next)(connect(store)(LitElement)) {
  static get styles() {
    return [
      ScrollbarStyles,
      css`
        :host {
          display: grid;
          grid-template-rows: auto auto 1fr;
          overflow: hidden;
          background-color: var(--popup-content-background-color);

          position: relative;
        }

        #main {
          overflow: auto;
          padding: var(--popup-content-padding);
          display: grid;
          grid-template-columns: var(--card-list-template);
          grid-auto-rows: var(--card-list-rows-height);
          grid-gap: 20px;
        }

        #main .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          border-radius: var(--card-list-border-radius);
          border: var(--font-selector-border);
          background-color: var(--card-list-background-color);

          position: relative;
        }

        .card .button-container {
          position: absolute;
          right: 0;
          height: 100%;
          display: flex;
          direction: rtl;
          flex-direction: column;
        }

        .card .button-container > mwc-icon {
          background-color: var(--font-selector-icon-background-color);
          text-align: center;
          width: var(--font-selector-icon-size);
          height: var(--font-selector-icon-size);
          font: var(--font-selector-icon-font);
          color: var(--font-selector-icon-color);
        }

        .card .button-container > mwc-icon:last-child {
          border-bottom-left-radius: 12px;
        }

        .card .button-container > mwc-icon:hover,
        .card .button-container > mwc-icon:active {
          background-color: var(--primary-color);
          color: #fff;
        }

        #main .card.create {
          overflow: visible;
          background-color: initial;
        }

        #main .card:hover {
          cursor: pointer;
        }

        [face] {
          flex: 1;
        }

        [name] {
          background-color: rgba(1, 126, 127, 0.8);
          margin-top: -35px;
          width: 100%;
          color: #fff;
          font-weight: bolder;
          font-size: 13px;
          text-indent: 7px;
        }

        [provider] {
          background-color: rgba(0, 0, 0, 0.7);
          width: 100%;
          min-height: 15px;
          font-size: 0.6rem;
          color: #fff;
          text-indent: 7px;
        }

        #filter {
          padding: var(--popup-content-padding);
          background-color: var(--font-tools-background-color);
          box-shadow: var(--box-shadow);
        }

        #filter * {
          font-size: 15px;
        }

        select {
          text-transform: capitalize;
          float: right;
        }
      `
    ]
  }

  static get properties() {
    return {
      fonts: Array,
      _page: Number,
      _total: Number,
      creatable: Boolean
    }
  }

  render() {
    var fonts = this.fonts || []

    return html`
      <div id="filter">
        <select
          @change=${e => {
            this.provider = e.currentTarget.value
            this.requestUpdate()
          }}
        >
          <option value="">--${i18next.t('text.please choose a provider')}--</option>
          ${['google', 'custom'].map(
            provider => html`
              <option value=${provider}>${provider}</option>
            `
          )}
        </select>
      </div>

      <div id="main">
        ${this.creatable
          ? html`
              <font-creation-card class="card create" @create-font=${e => this.onCreateFont(e)}></font-creation-card>
            `
          : html``}
        ${fonts.map(
          font => html`
            <div class="card" @click=${e => this.onClickSelect(font)}>
              <div face>
                <font .face=${font.name}>ABCDEFGHIJKLMN</font>
                <font .face=${font.name}>abcdefghijklmn</font>
              </div>
              <div name>${font.name}</div>
              <div provider>${font.provider}</div>
              <div class="button-container">
                <mwc-icon @click=${e => this.toggleActive(font)}
                  >${font.active ? 'check_box' : 'check_box_outline_blank'}</mwc-icon
                >
                <mwc-icon @click=${e => this.deleteOne(font)}>delete</mwc-icon>
              </div>
            </div>
          `
        )}
      </div>
    `
  }

  firstUpdated() {
    var list = this.shadowRoot.querySelector('#main')

    pulltorefresh({
      container: this.shadowRoot,
      scrollable: list,
      refresh: () => {
        return this.refresh()
      }
    })
  }

  get creationCard() {
    return this.shadowRoot.querySelector('font-creation-card')
  }

  updated(changes) {
    if (changes.has('fonts')) {
      var creationCard = this.creationCard
      if (creationCard) {
        creationCard.reset()
      }
    }
  }

  stateChanged(state) {
    this.fonts = state.font
  }

  refresh() {
    return store.dispatch(fetchFontList())
  }

  onCreateFont(e) {
    var font = e.detail

    store.dispatch(createFont(font))
  }

  toggleActive(font) {
    store.dispatch(updateFont({ id: font.id, active: !font.active }))
  }

  deleteOne(font) {
    store.dispatch(deleteFont(font))
  }

  onClickSelect(font) {
    this.dispatchEvent(
      new CustomEvent('font-selected', {
        composed: true,
        bubbles: true,
        detail: {
          font
        }
      })
    )
  }
}

customElements.define('font-selector', FontSelector)
