import '@alicloud/console-components/dist/wind.css';
import 'config/styles/index.css';
import createLoading from 'dva-loading';
import dva from 'dva';
import intl from '@alicloud/console-components-intl-core';
import models from './models';
import router from './router';
import { createBrowserHistory } from 'history';
import { getLocal } from 'utils/util';

const messages = window[`ahas-new_${getLocal()}`];
const locale = getLocal() === 'zh-cn' ? 'zh-Hans-CN' : 'en-US';

intl.set(
  {
    messages,
    locale,
  },
);

const app = dva({
  history: createBrowserHistory(),
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
