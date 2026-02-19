import vue from 'vue';
import Router from 'vue-router';
import Store from '@/components/Toma_store.vue';
import About from '@/components/AboutPage.vue';
import Cart from '@/components/ShoppingCart.vue';
import Member from '@/components/Toma_member.vue';
import PersonalInfo from '@/components/PersonalInfo.vue';
import PurchaseHistory from '@/components/PurchaseHistory.vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

vue.use(Router);
vue.use(VueAxios, axios);

export default new Router({
  routes: [{
    path: '/store',
    name: 'store',
    component: Store,
  }, {
    path: '/about',
    name: 'about',
    component: About,
  }, {
    path: '/cart',
    name: 'cart',
    component: Cart,
  }, {
    path: '/member',
    name: 'member',
    component: Member,
    children: [
      {
        path: '',
        name: 'member-welcome',
        component: () => import('@/components/MemberWelcome.vue')
      },
      {
        path: 'personalinfo',
        name: 'personal-info',
        component: PersonalInfo,
      },
      {
        path: 'purchasehistory',
        name: 'purchase-history',
        component: PurchaseHistory,
      },
    ]
  }]
});