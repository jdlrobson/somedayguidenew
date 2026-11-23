import SLC from './fixtures/SLC.json';
import ArizonaCities from './fixtures/ArizonaCities.json';
import CaliCities from './fixtures/CaliforniaCities.json';

import {
    importClimateWikivoyage,
    calculateRegionClimate
} from '../../build-src/climate';

describe( 'calculateRegionClimate', () => {
    test( 'return false if no cities passed', () => {
        expect(
            calculateRegionClimate( [] )
        ).toBe(
            false
        );
    } );

    test( 'returns the climate of the city if only one city passed', () => {
        expect(
            calculateRegionClimate( [
                ArizonaCities.Tucson
            ] )
        ).toBe(
            ArizonaCities.Tucson.climate
        );
    } );

    test( 'returns the climate of the city if only one climate passed', () => {
        expect(
            calculateRegionClimate( [
                {
                    name: 'No climate city'
                },
                ArizonaCities.Tucson
            ] )
        ).toBe(
            ArizonaCities.Tucson.climate
        );
    } );

    test( 'returns the extreme of climates of all cities when data missing', () => {
        const climate = calculateRegionClimate( [
            ArizonaCities.Tucson,
            ArizonaCities.Phoenix
        ] );
        expect(
            climate[ 0 ]
        ).toStrictEqual(
            {
                "heading": "Jan",
                "precipitation": 20.3,
                "high": 18.6,
                "low": 4.3
            }
        );
    } );

    test( 'returns the extreme of climates of all cities', () => {
        const climate = calculateRegionClimate( [
            CaliCities['San Diego'],
            CaliCities['San Francisco'],
            CaliCities['Los Angeles']
        ] );
        expect(
            climate[ 7 ]
        ).toStrictEqual(
            {
                "heading": "Aug",
                "precipitation": 5.1, // Los Angeles
                "high": 35.6, // San Francisco
                "low": 12.2 // San Francisco
            }
        );
    } );
    test( 'it extracts climates assuming metric system', () => {
        const expected = [
            { high: 39, low: 24, precipitation: 1.4 },
            { high: 45, low: 29, precipitation: 1.3 },
            { high: 55, low: 36, precipitation: 1.8 },
            { high: 62, low: 42, precipitation: 2.2 },
            { high: 73, low: 50, precipitation: 1.8 },
            { high: 84, low: 59, precipitation: 1 },
            { high: 94, low: 68, precipitation: 0.5 },
            { high: 92, low: 67, precipitation: 0.6 },
            { high: 81, low: 56, precipitation: 1.1 },
            { high: 66, low: 44, precipitation: 1.3 },
            { high: 51, low: 33, precipitation: 1.3 },
            { high: 39, low: 25, precipitation: 1.4 }
        ];
        expect(
            importClimateWikivoyage(SLC),
        ).toStrictEqual(
            expected
        );
    } );
    test( 'it extracts climates and can convert to metric system', () => {
        const expected = [
            { precipitation: 35.6, low: -4.4, high: 3.9 },
            { precipitation: 33, low: -1.7, high: 7.2 },
            { precipitation: 45.7, low: 2.2, high: 12.8 },
            { precipitation: 55.9, low: 5.6, high: 16.7 },
            { precipitation: 45.7, low: 10, high: 22.8 },
            { precipitation: 25.4, low: 15, high: 28.9 },
            { precipitation: 12.7, low: 20, high: 34.4 },
            { precipitation: 15.2, low: 19.4, high: 33.3 },
            { precipitation: 27.9, low: 13.3, high: 27.2 },
            { precipitation: 33, low: 6.7, high: 18.9 },
            { precipitation: 33, low: 0.6, high: 10.6 },
            { precipitation: 35.6, low: -3.9, high: 3.9 }
        ];
        expect(
            importClimateWikivoyage(SLC, true),
        ).toStrictEqual(
            expected
        );
    } );
} );

