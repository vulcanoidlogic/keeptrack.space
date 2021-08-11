/* globals test */

import { keepTrackApi } from "../api/externalApi";
import { loadCorePlugins } from "./core"

test('Load core plugins', () => {
    keepTrackApi.programs.settingsManager.plugins = {};
    loadCorePlugins(keepTrackApi);

    keepTrackApi.methods.uiManagerFinal();
});