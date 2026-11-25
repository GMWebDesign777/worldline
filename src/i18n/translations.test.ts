import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, getTypographyScale } from './translations';

test('Georgian typography scale tightens glyph footprint between 0.82 and 0.90', () => {
  const en = getTypographyScale('en');
  const ka = getTypographyScale('ka');
  assert.equal(en.fontRatio, 1);
  assert.ok(ka.fontRatio >= 0.82 && ka.fontRatio <= 0.9, `expected ka fontRatio in [0.82, 0.90], got ${ka.fontRatio}`);
  assert.ok(ka.bodyFontClass.includes('Noto_Sans_Georgian'));
  assert.ok(ka.headingFontClass.includes('Noto_Sans_Georgian'));
});

test('All South Asian placeholders and old Dhaka/USD navbar items are completely replaced', () => {
  const serialized = JSON.stringify(TRANSLATIONS).toLowerCase();
  const forbidden = ['dhaka', 'pokhara', "cox's bazar", 'sajek', 'bangla', 'sylhet', 'hunza', 'phewa', 'secure payments in usd'];
  for (const term of forbidden) {
    assert.ok(!serialized.includes(term), `Forbidden legacy term "${term}" still present in translations`);
  }
});

test('Hero and scroll outro rebranding requirements are present in EN and KA', () => {
  assert.equal(TRANSLATIONS.ka.hero.badge, 'შენი სანატრელი მოგზაურობა');
  assert.equal(TRANSLATIONS.en.hero.outroTitle, 'This is Brienci Lake at sunset.');
  assert.equal(TRANSLATIONS.ka.hero.outroTitle, 'ეს ბრიენცის ტბაა მზის ჩასვლისას.');
  assert.equal(TRANSLATIONS.en.hero.tours.length, 4);
  assert.equal(TRANSLATIONS.ka.hero.tours.length, 4);
});

test('Destinations section contains Georgia origin and all 4 European & Scandinavian stops', () => {
  assert.equal(TRANSLATIONS.en.destinations.leavingFrom, 'Leaving from Georgia');
  assert.equal(TRANSLATIONS.ka.destinations.leavingFrom, 'გამგზავრება საქართველოდან');
  assert.ok(TRANSLATIONS.ka.destinations.description.startsWith('შენი საოცნებო მოგზაურობა საქართველოდან'));
  assert.deepEqual(
    TRANSLATIONS.en.destinations.places.map((p) => p.country),
    ['Switzerland', 'Norway', 'Iceland', 'Italy'],
  );
  assert.deepEqual(
    TRANSLATIONS.ka.destinations.places.map((p) => p.country),
    ['შვეიცარია', 'ნორვეგია', 'ისლანდია', 'იტალია'],
  );
});

test('Why Us marquee includes required European, Scandinavian, and retained global cities', () => {
  const expectedEn = ['Paris', 'Milan', 'Berlin', 'Zurich', 'Oslo', 'Stockholm', 'Reykjavik', 'Vienna', 'Rome', 'Amsterdam', 'Bali', 'Maldives', 'Cappadocia', 'Kyoto', 'Santorini'];
  for (const city of expectedEn) {
    assert.ok(TRANSLATIONS.en.whyUs.stages.includes(city), `Missing marquee city: ${city}`);
  }
  assert.equal(TRANSLATIONS.en.whyUs.stages.length, TRANSLATIONS.ka.whyUs.stages.length);
  assert.ok(TRANSLATIONS.en.whyUs.stats.some((s) => s.text.includes('Georgian or English')));
  assert.ok(TRANSLATIONS.ka.whyUs.stats.some((s) => s.text.includes('ქართულ და ინგლისურ ენებზე')));
});

test('Footer reflects Tbilisi coordinates and updated trust tagline', () => {
  assert.equal(TRANSLATIONS.en.footer.coords, 'TBILISI · 41.71° N · 44.82° E');
  assert.ok(TRANSLATIONS.en.footer.description.includes('Tbilisi'));
  assert.ok(TRANSLATIONS.ka.footer.description.includes('თბილისში'));
  assert.equal(TRANSLATIONS.en.footer.tagline, 'Curated journeys · 24/7 traveler support');
  assert.equal(TRANSLATIONS.ka.footer.tagline, 'შერჩეული მარშრუტები · 24/7 მხარდაჭერა');
});
