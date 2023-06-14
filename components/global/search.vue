<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.css';
@import '~assets/scss/mixins';
#search {
  max-width: 600px;
  margin-right: auto;
  margin-left: auto;
  .aa-Form {
    border: 1px solid var(--grey);
    border-radius: 6px
  }
  .aa-Input {
    font-size: 1.2rem;
    &::placeholder {
      color: var(--light-grey)
    }
  }
}
#search .aa-Autocomplete, .aa-Panel, .aa-DetachedContainer {
  --height: 3rem;
  --height-icon: 1.5rem;
  --color-input-icon: var(--grey);
  --color-mark: var(--green);
  --color-background: white;
  --color-selected: #ECECEC;
  --color-text: var(--grey);
  --color-source-icon: var(--grey)
}
.aa-Panel .aa-PanelLayout {
  padding-top: var(--aa-spacing-half);
  padding-bottom: var(--aa-spacing-half)
}
.aa-Panel {
  background-color: transparent
}
.aa-Item .aa-ItemDescription {
  color: var(--light-grey)
}
.aa-Item {
  margin: var(--aa-spacing-half) 0;
  padding: 4px 0;
  &:first-of-type {
    margin-top: 0
  }
  &:last-of-type {
    margin-bottom: 0
  }
}
@include dark-theme {
  #search .aa-Autocomplete, .aa-Panel, .aa-DetachedContainer {
    --color-input-icon: #EEEEEE;
    --color-mark: var(--light-green);
    --color-background: #333333;
    --color-selected: #555555;
    --color-text: #EEEEEE;
    --color-source-icon: #EEEEEE
  }
  .aa-Item .aa-ItemDescription {
    color: #BBBBBB
  }
  #search {
    .aa-Form {
      border-color: #EEEEEE
    }
    .aa-Input {
      &::placeholder {
        color: #CCCCCC
      }
    }
  }
}
</style>

<template>
  <div id="search" />
</template>

<script>

export default {
  mounted () {
    this.loadScript('https://cdn.jsdelivr.net/npm/@algolia/algoliasearch-netlify-frontend@1/dist/algoliasearchNetlify.js', () => {
      // eslint-disable-next-line no-undef
      algoliasearchNetlify({
        appId: 'UFETFF29BD',
        apiKey: 'fbc7e9ba54d66ee5d9808ddd17416c78',
        siteId: '0f6be2d7-6002-4d40-870b-9f3ad6ba7c49',
        branch: 'master',
        selector: 'div#search'
      })
    })
  },
  methods: {
    loadScript (url, callback) {
      const script = document.createElement('script')
      script.src = url
      script.onload = callback
      document.head.appendChild(script)
    }
  }
}
</script>
