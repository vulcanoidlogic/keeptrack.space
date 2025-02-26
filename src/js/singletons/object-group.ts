import { countryMapList } from '../catalogs/countries';
import { GetSatType, MissileObject, SatObject } from '../interfaces';
import { CatalogSearch } from '../static/catalog-search';
import { keepTrackApi } from './../keepTrackApi';

export enum GroupType {
  ALL = 0,
  YEAR = 1,
  YEAR_OR_LESS = 2,
  INTLDES = 3,
  NAME_REGEX = 4,
  COUNTRY = 5,
  COUNTRY_REGEX = 6,
  SHAPE_REGEX = 7,
  BUS_REGEX = 8,
  SCC_NUM = 9,
  ID_LIST = 10,
}

export class ObjectGroup {
  objects: number[] = [];

  constructor(type: GroupType, data: any) {
    const satData = <SatObject[]>keepTrackApi.getCatalogManager().satData;
    switch (type) {
      case GroupType.ALL:
        satData.every((sat) => {
          if (typeof sat.sccNum !== 'undefined') {
            this.objects.push(sat.id);
          }
          // Stop when we hit the max number of orbits to display
          return this.objects.length <= Math.min(settingsManager.maxOribtsDisplayed, settingsManager.maxOribtsDisplayedDesktopAll);
        });
        break;
      case GroupType.YEAR:
        this.objects = CatalogSearch.year(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .filter((sat: SatObject) => typeof sat.id !== 'undefined' && !sat.static)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.YEAR_OR_LESS:
        this.objects = CatalogSearch.yearOrLess(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .filter((sat: SatObject) => typeof sat.id !== 'undefined' && !sat.static)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.INTLDES:
        this.objects = data
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((intlDes: string) => keepTrackApi.getCatalogManager().getIdFromIntlDes(intlDes))
          .filter((id: number | null) => id !== null);
        break;
      case GroupType.NAME_REGEX:
        this.objects = CatalogSearch.objectName(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.COUNTRY:
        this.createGroupByCountry_(data, satData);
        break;
      case GroupType.COUNTRY_REGEX:
        this.objects = CatalogSearch.country(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.SHAPE_REGEX:
        this.objects = CatalogSearch.shape(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.BUS_REGEX:
        this.objects = CatalogSearch.bus(satData, data)
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((sat: SatObject) => sat.id);
        break;
      case GroupType.SCC_NUM:
        this.objects = data
          // .slice(0, settingsManager.maxOribtsDisplayed)
          .map((sccNum: number) => keepTrackApi.getCatalogManager().getIdFromObjNum(sccNum))
          .filter((id: number | null) => id !== null);
        break;
      case GroupType.ID_LIST:
        this.objects = data.slice(0, settingsManager.maxOribtsDisplayed).map((id: number) => id);
        break;
      default:
        throw new Error('Unknown group type');
    }
  }

  hasObject = (id: number) => this.objects.findIndex((id_) => id_ === id) !== -1;

  // What calls the orbit buffer when selected a group from the menu.
  updateOrbits = (): this => {
    const orbitManagerInstance = keepTrackApi.getOrbitManager();
    this.objects.forEach((id) => {
      if ((<SatObject | MissileObject>keepTrackApi.getCatalogManager().satData[id]).missile) {
        const missile = <MissileObject>(<unknown>id);
        orbitManagerInstance.updateOrbitBuffer(missile.id, {
          missile: true,
          latList: missile.latList,
          lonList: missile.lonList,
          altList: missile.altList,
        });
      } else {
        orbitManagerInstance.updateOrbitBuffer(id);
      }
    });

    return this;
  };

  private createGroupByCountry_(data: any, satData: SatObject[]) {
    // Map country name to country code
    const expandedData = data.split('|').map((countryName: string) => countryMapList[countryName]);
    // Concat data with expandedData using | as a delimiter
    data = `${data}|${expandedData.join('|')}`;
    this.objects = satData
      .filter((sat: SatObject) => data.split('|').includes(sat.country))
      // .slice(0, settingsManager.maxOribtsDisplayed)
      // eslint-disable-next-line arrow-body-style
      .map((sat: SatObject) => {
        return sat.id;
      });
  }

  updateIsInGroup(): this {
    const catalogManagerInstance = keepTrackApi.getCatalogManager();

    this.objects.forEach((id: number) => {
      catalogManagerInstance.getSat(id, GetSatType.EXTRA_ONLY).isInGroup = true;
    });

    return this;
  }

  clear(): this {
    if (this.objects.length === 0) return this;
    const catalogManagerInstance = keepTrackApi.getCatalogManager();

    this.objects.forEach((id: number) => {
      catalogManagerInstance.getSat(id, GetSatType.EXTRA_ONLY).isInGroup = false;
    });

    return this;
  }
}
