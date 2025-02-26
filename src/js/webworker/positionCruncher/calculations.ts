import * as Ootk from 'ootk';
import { Degrees, EcfVec3, Kilometers, Radians } from 'ootk';
import { SensorObjectCruncher } from '../../interfaces';
import { DEG2RAD, MILLISECONDS2DAYS, PI, RAD2DEG } from '../../lib/constants';
import { A } from '../../lib/external/meuusjs';
import { SpaceObjectType } from '../../lib/space-object-type';
import { jday } from '../../lib/transforms';
import { RangeAzEl, defaultGd, oneOrZero } from '../constants';

export const lookAnglesToEcf = (azDeg: Degrees, elDeg: Degrees, rng: Kilometers, obsLat: Radians, obsLong: Radians, obsAlt: Kilometers): EcfVec3 => {
  // site ecef in meters
  const geodeticCoords = {
    lat: obsLat,
    lon: obsLong,
    alt: obsAlt,
  };

  const ecf = Ootk.Transforms.lla2ecf(geodeticCoords);

  // some needed calculations
  const slat = Math.sin(obsLat);
  const slon = Math.sin(obsLong);
  const clat = Math.cos(obsLat);
  const clon = Math.cos(obsLong);

  const azRad = DEG2RAD * azDeg;
  const elRad = DEG2RAD * elDeg;

  // az,el,range to sez convertion
  const south = -rng * Math.cos(elRad) * Math.cos(azRad);
  const east = rng * Math.cos(elRad) * Math.sin(azRad);
  const zenith = rng * Math.sin(elRad);

  const x = slat * clon * south + -slon * east + clat * clon * zenith + ecf.x;
  const y = slat * slon * south + clon * east + clat * slon * zenith + ecf.y;
  const z = -clat * south + slat * zenith + ecf.z;

  return { x: <Kilometers>x, y: <Kilometers>y, z: <Kilometers>z };
};

/* Returns Current Propagation Time */
export const propTime = (dynamicOffsetEpoch: number, staticOffset: number, propRate: number) => {
  const now = new Date();
  const dynamicPropOffset = now.getTime() - dynamicOffsetEpoch;
  now.setTime(dynamicOffsetEpoch + staticOffset + dynamicPropOffset * propRate);
  return now;
};

export const checkSunExclusion = (
  sensor: SensorObjectCruncher,
  j: number,
  gmst: Ootk.GreenwichMeanSiderealTime,
  now: Date
): [isSunExclusion: boolean, sunECI: { x: number; y: number; z: number }] => {
  const jdo = new A.JulianDay(j); // now
  const coord = A.EclCoordfromWgs84(0, 0, 0);
  const coord2 = A.EclCoordfromWgs84(sensor.observerGd.lat * RAD2DEG, sensor.observerGd.lon * RAD2DEG, sensor.observerGd.alt);

  // AZ / EL Calculation
  const tp = <{ hz: { az: number; alt: number } }>(<unknown>A.Solar.topocentricPosition(jdo, coord, false));
  const tpRel = A.Solar.topocentricPosition(jdo, coord2, false);
  const sunAz = <Degrees>(tp.hz.az * RAD2DEG + (180 % 360));
  const sunEl = <Degrees>((tp.hz.alt * RAD2DEG) % 360);
  const sunElRel = (tpRel.hz.alt * RAD2DEG) % 360;

  // Range Calculation
  const T = new A.JulianDay(A.JulianDay.dateToJD(now)).jdJ2000Century();
  let sunG = (A.Solar.meanAnomaly(T) * 180) / PI;
  sunG = sunG % 360.0;
  const sunR = 1.00014 - 0.01671 * Math.cos(sunG) - 0.00014 * Math.cos(2 * sunG);
  const sunRange = <Kilometers>((sunR * 149597870700) / 1000); // au to km conversion

  // RAE to ECI
  const sunECI = Ootk.Transforms.ecf2eci(lookAnglesToEcf(sunAz, sunEl, sunRange, <Radians>0, <Radians>0, <Kilometers>0), gmst);
  return sensor.observerGd !== defaultGd && (sensor.type === SpaceObjectType.OPTICAL || sensor.type === SpaceObjectType.OBSERVER) && sunElRel > -6
    ? [true, sunECI]
    : [false, sunECI];
};

export const isInFov = (lookangles: RangeAzEl, sensor: SensorObjectCruncher): oneOrZero => {
  const az = lookangles.az * RAD2DEG;
  const el = lookangles.el * RAD2DEG;
  const rng = lookangles.rng;
  if (sensor.obsminaz > sensor.obsmaxaz) {
    if (
      ((az >= sensor.obsminaz || az <= sensor.obsmaxaz) && el >= sensor.obsminel && el <= sensor.obsmaxel && rng <= sensor.obsmaxrange && rng >= sensor.obsminrange) ||
      ((az >= sensor.obsminaz2 || az <= sensor.obsmaxaz2) && el >= sensor.obsminel2 && el <= sensor.obsmaxel2 && rng <= sensor.obsmaxrange2 && rng >= sensor.obsminrange2)
    ) {
      return 1;
    }
  } else {
    if (
      (az >= sensor.obsminaz && az <= sensor.obsmaxaz && el >= sensor.obsminel && el <= sensor.obsmaxel && rng <= sensor.obsmaxrange && rng >= sensor.obsminrange) ||
      (az >= sensor.obsminaz2 && az <= sensor.obsmaxaz2 && el >= sensor.obsminel2 && el <= sensor.obsmaxel2 && rng <= sensor.obsmaxrange2 && rng >= sensor.obsminrange2)
    ) {
      return 1;
    }
  }
  return 0;
};

export const setupTimeVariables = (dynamicOffsetEpoch, staticOffset, propRate, isSunlightView, isMultiSensor, sensor: SensorObjectCruncher) => {
  const now = propTime(dynamicOffsetEpoch, staticOffset, propRate);

  const j =
    jday(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ) +
    now.getUTCMilliseconds() * MILLISECONDS2DAYS;

  const gmst = Ootk.Sgp4.gstime(j);

  let isSunExclusion = false;
  let sunEci = { x: 0, y: 0, z: 0 };
  if (sensor?.observerGd?.lat && isSunlightView && !isMultiSensor) {
    [isSunExclusion, sunEci] = checkSunExclusion(sensor, j, gmst, now);
  }

  const j2 =
    jday(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds() + 1
    ) +
    now.getUTCMilliseconds() * MILLISECONDS2DAYS;

  const gmstNext = Ootk.Sgp4.gstime(j2);

  return {
    now,
    j,
    gmst,
    gmstNext,
    isSunExclusion,
    sunEci,
  };
};

export const createLatLonAlt = (lat: Radians, lon: Radians, alt: Kilometers) => ({
  lon,
  lat,
  alt,
});

export const isInValidElevation = (lookangles: RangeAzEl, selectedSatFOV: number) => lookangles.el * RAD2DEG > 0 && 90 - lookangles.el * RAD2DEG < selectedSatFOV;

export const isSensorDeepSpace = (mSensor: SensorObjectCruncher[], sensor: SensorObjectCruncher): boolean => {
  // TODO: This should use the sensors max range instead of sensor type
  if (mSensor.length > 1 && sensor.type === SpaceObjectType.OPTICAL) return true;
  if (mSensor.length > 1 && sensor.type === SpaceObjectType.OBSERVER) return true;
  if (mSensor.length > 1 && sensor.type === SpaceObjectType.MECHANICAL) return true;
  return false;
};
