export default {
  ssr: false,

  target: 'static',

  head: {
    title: 'playcanvas-playground',
    htmlAttrs: { lang: 'ja' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
  ],

  plugins: [
  ],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module',
  ],

  modules: [
  ],

  build: {
    terser: {
      terserOptions: {
        compress: { drop_console: true },
      },
    },
  },

  server: {
    host: '0.0.0.0',
  },
}
