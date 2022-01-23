import { StepEnum } from '../step.js';
/*
import type { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';


 */
/**
 * Represents an option that will be reflected on the final hero.
 * @interface
 */
export default class HeroOption {
    constructor() {
        this.settings = {
            min: 0,
            max: 999,
        }
    }
}

export const apply = (
  existingData,
  key,
  value,
  addValues,
  enforceNumber,
) => {
  try {
    [key, value] = getActorDataForProficiency(key, value);
    if (
      !key ||
      !value ||
      key.indexOf('null') > -1 ||
      (!Array.isArray(value) && isNaN(value) && typeof value == 'string' && value.indexOf('null') > -1)
    )
      return existingData;

    const dataSnapshot = {};
    if (addValues) {
      // find any previous value on existing data
      dataSnapshot[key] = getProperty(existingData, key); //getValueFromInnerProperty(existingData, key);
      if (dataSnapshot[key]) {
        if (Array.isArray(dataSnapshot[key])) {
          value = dataSnapshot[key].concat(...value);
        } else {
          if (!isNaN(value)) {
            value = Number.parseInt(dataSnapshot[key]) + Number.parseInt(value);
          } else {
            console.error('Expected to add value to previous, but value is not a number nor array');
          }
        }
      }
    }
    dataSnapshot[key] = enforceNumber ? Number.parseInt(value) : value;
    mergeObject(existingData, dataSnapshot);
  } catch (error) {
    console.warn('Error on HeroOption.apply(..) - printing error and logging variables');
    console.error(error);
    console.warn('existingData: ');
    console.warn(existingData);
    console.warn(`key: [${key}]`);
    console.warn('value: ');
    console.warn(value);
    console.warn(`addValues: [${addValues}]`);
  }
};

function getActorDataForProficiency(key, value) {
  if (!isProficiencyKey(key)) return [key, value];

  if (Array.isArray(value) && value.length == 1) {
    value = value[0];
  }
  const baseKey = 'data.traits';
  let pair;
  if (key === 'skills') {
    pair = [`data.skills.${value}.value`, 1];
  } else {
    if (isCustomKey(key, value)) pair = [`${baseKey}.${key}.custom`, value];
    else pair = [`${baseKey}.${key}.value`, [value]];
  }
  return pair;
}

function isProficiencyKey(key) {
  if (key.indexOf('skill') > -1) return true;
  if (key.indexOf('language') > -1) return true;
  if (key.indexOf('weapon') > -1) return true;
  if (key.indexOf('armor') > -1) return true;
  if (key.indexOf('tool') > -1) return true;
  return false;
}

function isCustomKey(key, value) {
  const dnd5e = (game).dnd5e;
  let keyList;
  switch (key) {
    case 'weaponProf':
      keyList = [...Object.keys(dnd5e.config.weaponProficiencies), ...Object.keys(dnd5e.config.weaponIds)];
      break;
    case 'armorProf':
      keyList = [...Object.keys(dnd5e.config.armorProficiencies), ...Object.keys(dnd5e.config.armorIds)];
      break;
    case 'toolProf':
      keyList = [...Object.keys(dnd5e.config.toolProficiencies), ...Object.keys(dnd5e.config.toolIds)];
      break;
    case 'languages':
      keyList = Object.keys(dnd5e.config.languages);
      break;
  }
  for (const key in keyList) {
    if (keyList[key] === value) return false;
  }
  return true;
}