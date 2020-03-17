import { LitElement, html, css } from 'lit-element'
import gql from 'graphql-tag'
import { client } from '@things-factory/shell'
import { i18next, localize } from '@things-factory/i18n-base'
import { FileDropHelper } from '@things-factory/utils'

// check if attachment module is imported
var isAttachmentImported = false
try {
  require.resolve('@things-factory/attachment-ui')
  isAttachmentImported = true
} catch (e) {}
//-------------------------------

export class FontCreationCard extends localize(i18next)(LitElement) {
  static get properties() {
    return {
      provider: {
        type: String
      },
      googleFonts: {
        type: Array
      },
      _files: {
        type: Array
      }
    }
  }

  constructor() {
    super()
    this.provider = 'google'
    this.providers = [
      { value: 'google', display: 'Google' },
      // TODO 구글 외 폰트 서비스 구현
      // { value: 'typekit', display: 'Typekit' },
      { value: 'custom', display: 'Custom' }
    ]
    this.googleFonts = []
  }

  static get styles() {
    return [
      css`
        :host {
          position: relative;

          padding: 0;
          margin: 0;
          height: 100%;

          -webkit-transform-style: preserve-3d;
          transform-style: preserve-3d;
          -webkit-transition: all 0.5s ease-in-out;
          transition: all 0.5s ease-in-out;
        }

        :host(.candrop) [front],
        :host(.candrop) [back] {
          border-width: 2px;
          background-color: #fffde9;
        }

        :host(.flipped) {
          -webkit-transform: var(--card-list-flip-transform);
          transform: var(--card-list-flip-transform);
        }

        [front],
        [back] {
          position: absolute;

          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;

          border: var(--card-list-create-border);
          border-radius: var(--card-list-create-border-radius);

          background-color: #fff;

          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        [front] {
          text-align: center;
          font-size: 0.8em;
          color: var(--card-list-create-color);
          text-transform: capitalize;
        }

        [front] mwc-icon {
          margin-top: 15%;
          display: block;
          font-size: 3.5em;
          color: var(--card-list-create-icon-color);
        }

        [back] {
          -webkit-transform: var(--card-list-flip-transform);
          transform: var(--card-list-flip-transform);
          box-sizing: border-box;
          display: grid;
        }

        [back] form {
          padding: var(--card-list-create-form-padding);
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          justify-content: center;
          align-items: center;
        }

        [back] form .props {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-row-gap: 7px;
          justify-content: center;
          align-items: center;
        }

        [back] form .props label {
          grid-column: span 4;
          font: var(--card-list-create-label-font);
          color: var(--card-list-create-label-color);
        }

        [back] form .props input,
        [back] form .props select {
          grid-column: span 6;
          background-color: #fff;
          border: var(--card-list-create-input-border);
          border-radius: var(--card-list-create-input-border-radius);
          font: var(--card-list-create-input-font);
          color: var(--card-list-create-input-color);
          width: -moz-available;
        }

        file-selector {
          grid-column: span 6;
          font: var(--card-list-create-input-font);
          border: none;
          box-sizing: border-box;
          padding: 0;
        }

        [back] input[type='submit'] {
          background-color: var(--button-background-color) !important;
          font: var(--button-font);
          color: var(--button-color) !important;
          border-radius: var(--button-radius);
          border: var(--button-border);
          grid-column: span 10;
          grid-row: auto / -1;
        }

        .hidden {
          display: none !important;
        }
      `
    ]
  }

  async firstUpdated() {
    if (isAttachmentImported) FileDropHelper.set(this)
  }

  render() {
    let isProviderGoogle = this.provider == 'google' && this.googleFonts.length > 0
    let isFileAttached = this._files.length > 0 ? true : false
    return html`
      <div @click=${e => this.onClickFlip(e)} front><mwc-icon>add_circle_outline</mwc-icon>create font</div>

      <div @click=${e => this.onClickFlip(e)} back>
        <form @submit=${e => this.onClickSubmit(e)}>
          <div class="props">
            <label>${i18next.t('label.provider')}</label>
            <select
              name="provider"
              @change=${e => {
                this.provider = e.target.value
                if (e.target.value === 'google') {
                  fetch(`/all-google-fonts`).then(async response => {
                    if (response.ok) this.googleFonts = await response.json()
                    else {
                      console.warn(
                        `(${response.url}) ${response.status} ${response.statusText}. Could not load Google fonts.`
                      )
                    }
                  })
                }
              }}
            >
              ${this.providers.map(
                p =>
                  html`
                    <option value=${p.value} ?selected=${this.provider == p.value}>${p.display}</option>
                  `
              )}
            </select>

            <label>${i18next.t('label.name')}</label>
            <input type="text" name="${isProviderGoogle ? '' : 'name'}" ?hidden=${isProviderGoogle} />
            <select name="${isProviderGoogle ? 'name' : ''}" ?hidden=${!isProviderGoogle}>
              ${isProviderGoogle &&
                this.googleFonts.map(
                  f =>
                    html`
                      <option value=${f}>${f}</option>
                    `
                )}
            </select>

            <label ?hidden=${this.provider != 'custom'}>${i18next.t('label.uri')}</label>
            <input
              ?hidden=${this.provider != 'custom'}
              ?disabled=${isFileAttached}
              .value=${isFileAttached ? this._files[0].name : ''}
              type="text"
              name="uri"
            />
            <!-- display when attachment module is imported -->
            <label ?hidden=${this.provider != 'custom' || !isAttachmentImported}>${i18next.t('label.file')}</label>
            <file-selector
              class="${this.provider != 'custom' || !isAttachmentImported ? 'hidden' : ''}"
              name="file"
              label="${i18next.t('label.select file')}"
              accept=".ttf,.woff,.woff2,.eot,.svg"
              multiple
              @file-change=${e => {
                this._files = Array.from(e.detail.files)
              }}
            ></file-selector>
            <!------------------------------------------------>

            <label>${i18next.t('label.active')}</label>
            <input type="checkbox" name="active" checked />
          </div>
          <div></div>
          <input type="submit" value=${i18next.t('button.create')} />
        </form>
      </div>
    `
  }

  onClickFlip(e) {
    if (!['INPUT', 'SELECT', 'OPTION'].find(tagName => tagName === e.target.tagName)) {
      if (e.currentTarget.hasAttribute('front')) this.reset() // 입력 폼으로 뒤집기 전에 한 번 리셋
      this.classList.toggle('flipped')
    }
  }

  async onClickSubmit(e) {
    e.preventDefault()
    e.stopPropagation()

    var form = e.target

    var detail = {}
    detail.name = form.elements['name'].value
    detail.provider = form.elements['provider'].value
    detail.active = form.elements['active'].checked
    if (this.provider === 'custom') {
      detail.uri = form.elements['uri'].value
    }

    if (this._files?.length > 0) {
      let attachment = await this.attachFile(this._files[0], ['fullpath'])
      detail.uri = attachment.data.attachment?.fullpath
    }
    this.dispatchEvent(new CustomEvent('create-font', { detail }))
  }

  /**
   * call gql for attachment
   *
   * @param { File } file
   * @param { Array } selector
   */
  async attachFile(file, selector) {
    let attaching = await client.mutate({
      mutation: gql`
        mutation($attachment: NewAttachment!) {
          createAttachment(attachment: $attachment) {
            id
          }
        }
      `,
      variables: {
        attachment: { category: '', file }
      },
      context: {
        hasUpload: true
      }
    })
    // TODO mutation 이후 query 호출 안 해도 되도록 수정
    return await client.query({
      query: gql`
        query($id: String!) {
          attachment(id: $id) {
            id
            ${selector.join('\n')}
          }
        }
      `,
      variables: {
        id: attaching.data.createAttachment?.id
      }
    })
  }

  reset() {
    var form = this.shadowRoot.querySelector('form')
    if (form) {
      form.reset()
    }

    this._files = []
    this.classList.remove('flipped')
  }
}

customElements.define('font-creation-card', FontCreationCard)
