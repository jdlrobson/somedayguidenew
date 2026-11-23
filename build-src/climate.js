function calculateRegionClimate( cities ) {
    const climates = cities.map( c => c.climate ).filter( ( c ) => c );
    if ( !climates.length ) {
        return false;
    } else {
        let newC = [];
        climates.forEach( ( climate, i ) => {
            if ( !newC[i] ) {
                newC = climate;
            } else {
                // run through all the climates.
                newC.forEach( ( month, i ) => {
                    const newMonth = climate[i];
                    if ( !month.heading ) {
                        month.heading = newMonth.heading;
                    }
                    if ( !month.high || month.high < newMonth.high ) {
                        month.high = newMonth.high;
                    }
                    if ( !month.low || month.low > newMonth.low ) {
                        month.low = newMonth.low;
                    }
                    if ( !month.precipitation || month.precipitation < newMonth.precipitation ) {
                        month.precipitation = newMonth.precipitation;
                    }
                    newC[i] = month;
                } );
                
            }
        } );
        return newC;
    }
}

export {
    calculateRegionClimate
};
