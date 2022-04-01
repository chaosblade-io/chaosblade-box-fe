import _ from 'lodash';
import createApi from '../../../../services/createApi';

const api = createApi();

const search = async (url, value, args, code, scopes) => {
  const runParams = _.fromPairs(_.map(args, arg => {
    return [ arg.alias, arg.value ];
  }));

  const response = await api.post(url, { value, hosts: scopes, runParams, appCode: code });
  if (response && response.ok) {
    const { data: responseData } = response;
    if (!_.isEmpty(responseData)) {
      const { success, data } = responseData;
      if (success) {
        return data;
      }
    }
  }
  return [];
};

export { search };
