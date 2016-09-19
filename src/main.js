import Vue from 'vue';
import Router from 'vue-router';
import Resource from 'vue-resource';
import Auth from '@websanova/vue-auth';
import App from './App';

// Import components
import Hello from './components/Hello.vue';

// Vue Use Imports
Vue.use(Router);
Vue.use(Resource);

// Router
Vue.router = new Router({
  hashbang: false,
  history: true,
  linkActiveClass: 'active',
  mode: 'html5',
});

Vue.router.map({
  '/': {
    auth: false,
    component: Hello,
  },
});

Vue.router.redirect({
  '*': '/',
});

// Http
Vue.http.options.root = 'https://api-demo.websanova.com/api/v1';

Vue.use(Auth, {
  rolesVar: 'type',
});

Vue.router.start(App, '#app');
