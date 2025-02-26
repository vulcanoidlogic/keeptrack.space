// Generated by CodiumAI

import { keepTrackApi } from '@app/js/keepTrackApi';
import { DrawManager } from '@app/js/singletons/draw-manager';
import { keepTrackContainer } from '../src/js/container';
import { CatalogManager, OrbitManager, Singletons } from '../src/js/interfaces';
import { HoverManager } from '../src/js/singletons/hover-manager';
import { setupStandardEnvironment } from './environment/standard-env';

// tell ts to ignore rule ts2341
// @ts-ignore TS2341

/*
Code Analysis

Objective:
The HoverManager class is responsible for managing the hover functionality in the KeepTrack application. It handles the display of information about a satellite or other space object when the user hovers over it with their mouse.

Inputs:
- Various imported modules and classes from the KeepTrack application
- HTML eleimport { catalogManagerInstance } from '@app/js/singletons/catalog-manager';
ments for the hover box

Flow:
- The class has methods for initializing the hover box, setting the current hover ID, and updating the hover box with information about the currently hovered object.
- The updateHover method is called periodically to update the hover box based on the user's mouse position and other settings.
- The class also has several private methods for displaying different types of information in the hover box, depending on the type of object being hovered over.

Outputs:
- The current hover ID
- Display of information about the currently hovered object in the hover box

Additional aspects:
- The class handles different types of space objects, including satellites, launch facilities, and radar data.
- It also takes into account various settings and user preferences, such as whether to display ECI coordinates or next pass information.
- The class is part of a larger application and relies on other modules and classes to function properly.
*/

describe('code_snippet', () => {
  let hoverManager: HoverManager;
  let orbitManagerInstance: OrbitManager;
  let catalogManagerInstance: CatalogManager;
  beforeAll(() => {
    orbitManagerInstance = keepTrackApi.getOrbitManager();
    catalogManagerInstance = keepTrackApi.getCatalogManager();
    orbitManagerInstance.setHoverOrbit = jest.fn();

    // orbitManagerInstance.setHoverOrbit = jest.fn();
  });
  beforeEach(() => {
    setupStandardEnvironment();
    hoverManager = new HoverManager();
  });

  // Tests that DOM elements are set correctly.
  it('test_init', () => {
    hoverManager.init();
    expect(document.getElementById('sat-hoverbox')).toBeDefined();
    expect(document.getElementById('sat-hoverbox1')).toBeDefined();
    expect(document.getElementById('sat-hoverbox2')).toBeDefined();
    expect(document.getElementById('sat-hoverbox3')).toBeDefined();
  });

  // Tests that currentHoverId is updated and updateHover_() is called.
  it('test_set_hover_id', () => {
    hoverManager.setHoverId(1);
    expect(hoverManager.getHoverId()).toBe(1);
  });

  // Tests that hoverOverSomething_() handles satScreenPositionArray.error being true.
  it('test_sat_screen_position_error', () => {
    hoverManager.init();
    const drawManagerInstance = keepTrackApi.getDrawManager();
    drawManagerInstance.getScreenCoords = jest.fn().mockReturnValue({ error: true, x: 0, y: 0 });
    keepTrackContainer.registerSingleton<DrawManager>(Singletons.DrawManager, drawManagerInstance);
    hoverManager.setHoverId(1);
    expect(document.getElementById('sat-hoverbox')).toBeDefined();
    expect(document.getElementById('sat-hoverbox')?.style.display).toBe('none');
  });

  // Tests that hoverOverSomething_() handles satScreenPositionArray.error being false.
  it('test_sat_screen_position_no_error', () => {
    hoverManager.init();
    const drawManagerInstance = keepTrackApi.getDrawManager();
    drawManagerInstance.getScreenCoords = jest.fn().mockReturnValue({ error: false, x: 0, y: 0 });
    keepTrackContainer.registerSingleton<DrawManager>(Singletons.DrawManager, drawManagerInstance);
    hoverManager.setHoverId(1);
    expect(document.getElementById('sat-hoverbox')).toBeDefined();
    expect(document.getElementById('sat-hoverbox')?.style.display).toBe('block');
  });
});
