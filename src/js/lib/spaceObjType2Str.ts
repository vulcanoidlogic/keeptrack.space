import { SpaceObjectType } from '../lib/space-object-type';

const spaceObjTypeToStr = {
  [SpaceObjectType.UNKNOWN]: 'Unknown',
  [SpaceObjectType.PAYLOAD]: 'Payload',
  [SpaceObjectType.ROCKET_BODY]: 'Rocket Body',
  [SpaceObjectType.DEBRIS]: 'Debris',
  [SpaceObjectType.SPECIAL]: 'Special',
  [SpaceObjectType.RADAR_MEASUREMENT]: 'Radar Measurement',
  [SpaceObjectType.RADAR_TRACK]: 'Radar Track',
  [SpaceObjectType.RADAR_OBJECT]: 'Radar Object',
  [SpaceObjectType.BALLISTIC_MISSILE]: 'Ballistic Missile',
  [SpaceObjectType.STAR]: 'Star',
  [SpaceObjectType.INTERGOVERNMENTAL_ORGANIZATION]: 'Intergovernmental Organization',
  [SpaceObjectType.SUBORBITAL_PAYLOAD_OPERATOR]: 'Suborbital Payload Operator',
  [SpaceObjectType.PAYLOAD_OWNER]: 'Payload Owner',
  [SpaceObjectType.METEOROLOGICAL_ROCKET_LAUNCH_AGENCY_OR_MANUFACTURER]: 'Meteorological Rocket Launch Agency or Manufacturer',
  [SpaceObjectType.PAYLOAD_MANUFACTURER]: 'Payload Manufacturer',
  [SpaceObjectType.LAUNCH_AGENCY]: 'Launch Agency',
  [SpaceObjectType.LAUNCH_SITE]: 'Launch Site',
  [SpaceObjectType.LAUNCH_POSITION]: 'Launch Position',
  [SpaceObjectType.LAUNCH_FACILITY]: 'Launch Facility',
  [SpaceObjectType.CONTROL_FACILITY]: 'Control Facility',
  [SpaceObjectType.GROUND_SENSOR_STATION]: 'Ground Sensor Station',
  [SpaceObjectType.OPTICAL]: 'Optical',
  [SpaceObjectType.MECHANICAL]: 'Mechanical',
  [SpaceObjectType.PHASED_ARRAY_RADAR]: 'Phased Array Radar',
  [SpaceObjectType.OBSERVER]: 'Observer',
  [SpaceObjectType.BISTATIC_RADIO_TELESCOPE]: 'Bi-static Radio Telescope',
  [SpaceObjectType.COUNTRY]: 'Country',
  [SpaceObjectType.LAUNCH_VEHICLE_MANUFACTURER]: 'Launch Vehicle Manufacturer',
  [SpaceObjectType.ENGINE_MANUFACTURER]: 'Engine Manufacturer',
  [SpaceObjectType.NOTIONAL]: 'Notional',
};
export const spaceObjType2Str = (spaceObjType: SpaceObjectType): string => spaceObjTypeToStr[spaceObjType] || 'Unknown';
