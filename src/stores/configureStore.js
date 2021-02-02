/*
 * Copyright 1999-2021 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';

import { getPersistConfig } from './getPersistConfig';

import reducers from '../reducers';
import sagas from '../sagas';

export default () => {
	const persistConfig = getPersistConfig();

	const sagaMiddleware = createSagaMiddleware();

	let enhancer   = applyMiddleware(sagaMiddleware);
	// if (process.env.NODE_ENV === 'development') {
	const devtools = require('redux-devtools-extension');
	enhancer       = devtools.composeWithDevTools({ trace: true })(enhancer);
	// }

	const store = createStore(persistReducer(persistConfig, reducers), enhancer);

	sagaMiddleware.run(sagas);

	const persistor = persistStore(store);
	return { store, persistor };
};
