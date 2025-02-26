import { keepTrackApi } from '@app/js/keepTrackApi';
import { DateTimeManager } from '@app/js/plugins/date-time-manager/date-time-manager';
import { SatInfoBoxCore } from '@app/js/plugins/select-sat-manager/satInfoboxCore';
import { SelectSatManager } from '@app/js/plugins/select-sat-manager/select-sat-manager';
import { TopMenu } from '@app/js/plugins/top-menu/top-menu';
import { UpdateSatManager } from '@app/js/plugins/update-select-box/update-select-box';
import { defaultSat, defaultSensor } from './environment/apiMocks';
import { setupStandardEnvironment } from './environment/standard-env';
import { standardPluginSuite } from './generic-tests';

describe('UpdateSatManager_class', () => {
  beforeEach(() => {
    // Mock DateTimeManager uiManagerFinal to prevent errors
    DateTimeManager.prototype.uiManagerFinal = jest.fn();
    setupStandardEnvironment([TopMenu, SelectSatManager, SatInfoBoxCore, DateTimeManager]);
  });

  standardPluginSuite(UpdateSatManager, 'UpdateSatManager');
});

describe('SatInfoBoxCore_class2', () => {
  it('should be able to select a satellite', () => {
    keepTrackApi.getCatalogManager().satData = [defaultSat];
    keepTrackApi.getColorSchemeManager().colorData = Array(100).fill(0) as unknown as Float32Array;
    keepTrackApi.getDotsManager().sizeData = Array(100).fill(0) as unknown as Int8Array;
    keepTrackApi.getDotsManager().positionData = Array(100).fill(0) as unknown as Float32Array;
    keepTrackApi.isInitialized = true;
    const selectSatManager = new SelectSatManager();
    selectSatManager.init();
    const updateSatManager = new UpdateSatManager();
    updateSatManager.init();
    keepTrackApi.methods.uiManagerInit();
    keepTrackApi.methods.uiManagerFinal();
    keepTrackApi.methods.uiManagerOnReady();
    selectSatManager.selectSat(0);
    expect(() => keepTrackApi.methods.updateSelectBox(defaultSat)).not.toThrow();

    keepTrackApi.methods.setSensor(defaultSensor, 2);
    keepTrackApi.getCatalogManager().isSensorManagerLoaded = true;
    selectSatManager.selectSat(0);
    expect(() => keepTrackApi.methods.updateSelectBox(defaultSat)).not.toThrow();
  });
});
