import ArizonaCities from './fixtures/ArizonaCities.json';
import CaliCities from './fixtures/CaliforniaCities.json';

import {
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
} );

