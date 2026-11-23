import domino from 'domino';

/**
 * @param {number} val
 * @rturn {string}
 */
function fix( num ) {
	return parseFloat( num.toFixed( 1 ), 10 );
}

/**
 * @param {number} val
 * @rturn {string}
 */
function fromFahrenheitToCelcius( val ) {
    return fix( ( val - 32 ) * 5 / 9 );
}

/**
 * @param {number} val
 * @rturn {string}
 */
function fromInchesToMm( val ) {
    return val ? fix( val / 0.0393700787402 ) : undefined;
}

/**
 * 
 * @param {Object} data Data returned https://en.wikivoyage.org/wiki/Special:ApiSandbox#action=parse&format=json&page=Salt_Lake_City&formatversion=2
 *  or https://en.wikivoyage.org/w/api.php?action=parse&format=json&page=Homer&formatversion=2
 * @param {boolean} usesImperial whether to convert
 * @return {Object} climate data
 */
const importClimateWikivoyage = ( data, usesImperial = false ) => {
    const domimpl = domino.createDOMImplementation();
    const doc = domimpl.createHTMLDocument();
    doc.body.innerHTML = data.parse.text;
    const climateTable = Array.from(doc.querySelectorAll('.infobox')).filter((t) => t.querySelectorAll('.climate-red').length)
        .map((table)=>table.querySelector('.infobox'))[ 0 ];
    //console.log(climateTable.outerHTML);
    if ( climateTable ) {
        const tableRow = Array.from(
            climateTable.querySelectorAll('tr')
        ).filter((row) => row && !row.querySelector( 'th' ) && row.querySelectorAll('td div [style]').length );
        return Array.from( tableRow[0].querySelectorAll( 'td' ) )
            .filter((col) => !!col.querySelector( 'div[style]' ))
            .map( ( col ) => {
                const data = Array.from(col.querySelectorAll( 'div > div' )).map((d) => d.textContent).filter((d) => d.trim()).map(
                    (s) => s.replace(/[−]/, '-')
                );
                const low = parseFloat( data[3], 10 );
                const high = parseFloat( data[2], 10 );
                const precipitation = parseFloat( data[1], 10 );
                return {
                    precipitation: usesImperial ? fromInchesToMm( precipitation ) : precipitation,
                    low: usesImperial ? fromFahrenheitToCelcius( low ) : low,
                    high: usesImperial ? fromFahrenheitToCelcius( high ) : high
                };
            });
    }
    return false;
};


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
    importClimateWikivoyage,
    calculateRegionClimate
};
