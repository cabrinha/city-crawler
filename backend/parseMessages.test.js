import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCoordinateFromStreetName,
  parseCredits,
  parseGuildLocations,
  parseShopLocations,
} from './parseMessages.js';

// Silent logger: parsers only warn on parse failures.
const quiet = { warn: () => {} };

// README "Supported Message Formats" example.
const README_SHOPS = `***Discount Magic - Beech & 80
Discount Scrolls - Hessite & 80***

Potable Potions - Unicorn & 37
Potion Distillery, right by Wulfenite & 90
Potionworks, right by Flint & 96
The Potion Shoppe - Gloom & 50

Credit: Harleigh, Lannair, Malice, MANTRA`;

describe('parseShopLocations', () => {
  it('parses the README example message', () => {
    const shops = parseShopLocations(README_SHOPS, quiet);
    assert.equal(shops.length, 6);
    assert.deepEqual(shops[0], { name: 'Discount Magic', streetName: 'Beech', streetNumber: '80', coordinate: { x: 9, y: 161 } });
    assert.deepEqual(shops[1], { name: 'Discount Scrolls', streetName: 'Hessite', streetNumber: '80', coordinate: { x: 131, y: 161 } });
    assert.deepEqual(shops[2], { name: 'Potable Potions', streetName: 'Unicorn', streetNumber: '37', coordinate: { x: 83, y: 75 } });
    assert.deepEqual(shops[3], { name: 'Potion Distillery', streetName: 'Wulfenite', streetNumber: '90', coordinate: { x: 191, y: 181 } });
    assert.deepEqual(shops[4], { name: 'Potionworks', streetName: 'Flint', streetNumber: '96', coordinate: { x: 123, y: 193 } });
    assert.deepEqual(shops[5], { name: 'The Potion Shoppe', streetName: 'Gloom', streetNumber: '50', coordinate: { x: 129, y: 101 } });
  });

  it('returns [] for a line that fails to parse', () => {
    assert.deepEqual(parseShopLocations('Hello world', quiet), []);
  });

  it('skips lines with unknown streets and warns', () => {
    let warnings = 0;
    const shops = parseShopLocations('Foo Shop - Notastreet & 80', { warn: () => { warnings++; } });
    assert.deepEqual(shops, []);
    assert.equal(warnings, 1);
  });
});

describe('parseCredits', () => {
  it('parses multiple credited names', () => {
    assert.deepEqual(parseCredits(README_SHOPS), ['Harleigh', 'Lannair', 'Malice', 'MANTRA']);
  });

  it('supports the Credits: plural form', () => {
    assert.deepEqual(parseCredits('Shops - Beech & 80\nCredits: Aydan, Joy, Seyda'), ['Aydan', 'Joy', 'Seyda']);
  });

  it('returns [] when no credit line exists', () => {
    assert.deepEqual(parseCredits('Discount Magic - Beech & 80'), []);
  });
});

describe('parseGuildLocations', () => {
  it('parses a guild message with a level', () => {
    const guilds = parseGuildLocations('Thieves Guild 2 - Beech & 80', quiet);
    assert.deepEqual(guilds, [{ name: 'Thieves Guild', level: 2, streetName: 'Beech', streetNumber: '80', coordinate: { x: 9, y: 161 } }]);
  });

  it('defaults to level 1 when no level is given', () => {
    const guilds = parseGuildLocations('Mages Guild - Flint & 96', quiet);
    assert.equal(guilds.length, 1);
    assert.equal(guilds[0].level, 1);
  });

  it('returns [] for a line that fails to parse', () => {
    assert.deepEqual(parseGuildLocations('Hello world', quiet), []);
  });
});

describe('getCoordinateFromStreetName', () => {
  it('maps known streets case-insensitively', () => {
    assert.equal(getCoordinateFromStreetName('Beech'), 8);
    assert.equal(getCoordinateFromStreetName('beech '), 8);
  });

  it('returns null for unknown streets', () => {
    assert.equal(getCoordinateFromStreetName('Notastreet'), null);
  });
});
