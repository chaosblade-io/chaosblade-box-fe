
import './i18n';
import './index.css';
import '@alicloud/console-components/dist/wind.css';
import 'config/styles/index.css';
import createLoading from 'dva-loading';
import dva from 'dva';
import models from './models';
import router from './router';
import { createBrowserHistory } from 'history';


const app = dva({
  history: createBrowserHistory({
    basename: '/chaos-blade', // 设置为你的部署路径
  }),
  namespacePrefixWarning: false,
  onError(e: Error) {
    console.error(e.stack);
  },
} as any);

app.use(createLoading());

models.forEach(model => {
  app.model(model);
});

app.router(router);
app.start('#app');
