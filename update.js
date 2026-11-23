import json from './public/data/countries.json' with { type: "json" };
import regionjson from './public/data/regions.json' with { type: "json" };
import update from './update.json' with { type: "json" };
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { parse } from 'marked';
import sharp from 'sharp';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { calculateRegionClimate } from './build-src/climate.js';

let allSrcs  = [];
const MAX_FILENAME_LENGTH = 140;
const SNIPPETS_DIR = 'snippets';
const DESTINATIONS_FILENAME = 'destinations.txt';

// Make a tmp folder if absent
if ( !fs.existsSync( 'tmp_public' ) ) {
    fs.mkdirSync( 'tmp_public' );
    fs.mkdirSync( 'tmp_public/images' );
}

let pendingRequests = [];
/**
 * Expands a Wikipedia snippet URL.
 * @param {string} filePath of snippet
 * @param {string} wikiTitle of wikipedia page
 * @param {string} host e.g. en.wikipedia.org
 */
function expandWikimediaSnippet( filePath, wikiTitle, host ) {
    return fetch( `https://${host}/api/rest_v1/page/summary/${wikiTitle}` ).then((r) => r.json())
        .then((json) => {
            const src = json.thumbnail ? json.thumbnail.source : null;
            saveSnippet(filePath, json.titles.normalized,
                `https://${host}/wiki/${wikiTitle}`, src, `<small>[from ${host}]:</small> ${json.extract}`, json.coordinates );
        });
}

function fixYoutubeUrl( filePath ) {
    let file = fs.readFileSync(filePath).toString();
    file = file.replace(/youtube\.com\/watch\?v=(.*)/g, 'youtube.com/embed/$1');
    fs.writeFileSync(filePath, file);
}
/**
 * Expands a Wikipedia snippet URL.
 * @param {string} filePath of snippet
 * @param {string} wikiTitle of wikipedia page
 */
function expandWikipediaSnippet( filePath, wikiTitle ) {
    return expandWikimediaSnippet( filePath, wikiTitle, 'en.wikipedia.org' );
}

/**
 * Expands a Wikipedia snippet URL.
 * @param {string} filePath of snippet
 * @param {string} wikiTitle of wikipedia page
 */
function expandWikivoyageSnippet( filePath, wikiTitle ) {
    return expandWikimediaSnippet( filePath, wikiTitle, 'en.wikivoyage.org' );
}
/**
 * Expands a generic snippet URL.
 * @param {string} filePath of snippet
 * @param {string} wikiTitle of wikipedia page
 */
function expandURLSnippet( filePath, url ) {
    return fetch(url).then((r) => r.text()).then((html) => {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const titleEl = document.querySelector('head title');
        let title = titleEl ? titleEl.textContent : 'n/a',
            author = url.split('//')[1].split( '/' )[0],
            description = '', imageSrc;
        Array.from( document.querySelectorAll( 'head meta[property^="og"]' ) ).forEach( ( item ) => {
            const property = item.getAttribute( 'property' );
            const value = item.getAttribute( 'content' );
            switch ( property ) {
                case 'og:site_name':
                    author = value;
                    break;
                case 'og:title':
                    title = value;
                    break;
                case 'og:description':
                    description = value;
                    break;
                case 'og:image':
                    imageSrc = value;
                    break;
            }
        } );
        if ( imageSrc ) {
            description += ` <small>[image from ${author}]</small>`
        } else {
            imageSrc = '-';
        }
        saveSnippet( filePath, title, url, imageSrc, description );
    })
}

/**
 * @param {string} srcOrUrl
 * @return {bool} whether the url can be embeded
 */
function isEmbedSite( srcOrUrl ) {
    return srcOrUrl.indexOf( 'instagram.com' ) > -1 || srcOrUrl.indexOf( 'youtube.com' ) > -1
}
/**
 * Converts a snippet text file into an object.
 * Will expand it if possible.
 *
 * @param {string} filePath
 * @return {false|Object} converted snippet or false if in
 *  unexpected form.
 */
function transformSnippet( filePath ) {
    const snip = fs.readFileSync(filePath).toString().trim().split('\n');
    let text = snip[3];
    let src = snip[0];
    let title = snip[1];
    let url = snip[2];
    let type = 'url';
    const id = filePath.match(/\/([0-9]*)\.txt/)[1];
    if ( snip.length === 1 ) {
        if ( snip[ 0 ].charAt( 0 ) === '"') {
            text = snip[0];
            type = 'quote';
            title = 'Quote'
        } else {
            const srcOrUrl = snip[0];
            if ( srcOrUrl.charAt( 0 ) !== 'h' ) {
                console.log( `Snippet was not a URL, please check ${filePath}!` );
                return false;
            } else if ( srcOrUrl.indexOf( 'youtube.com' ) > -1 ) {
                pendingRequests.push( fixYoutubeUrl( filePath ) );
            } else if ( srcOrUrl.indexOf( 'wikipedia.org' ) > -1 ) {
                const wikiTitle = srcOrUrl.split('/').slice(-1)[0];
                pendingRequests.push( expandWikipediaSnippet( filePath, wikiTitle ) );
                return false;
            } else if ( srcOrUrl.indexOf( 'wikivoyage.org' ) > -1 ) {
                const wikiTitle = srcOrUrl.split('/').slice(-1)[0];
                pendingRequests.push( expandWikivoyageSnippet( filePath, wikiTitle ) );
                return false;
            } else if ( isEmbedSite( srcOrUrl ) ) {
                // permit.
                src = srcOrUrl;
            } else {
                pendingRequests.push( expandURLSnippet( filePath, srcOrUrl ) );
                return false;
            }
        }
    }
    if ( src.includes('instagram')) {
        type = 'instagram';
    }
    if ( src === '-' ) {
        src = '';
    }
    if ( allSrcs.includes(src) ) {
        console.log('Duplicate src found: ', src);
    }
    if ( src ) {
        allSrcs.push(src);
    }

    let source = '';
    if ( src.indexOf( '/images/personal/' ) === 0 ) {
        source = '/';
    }
    return {
        id,
        text,
        src,
        source,
        type,
        embed: isEmbedSite( src ),
        title,
        url
    }
}

/**
 * Saves a snippet for a given country
 *
 * @param {string} snippetPath to a file in notes/country/${SNIPPETS_DIR}/1.txt
 * @param {string} title of the snippet
 * @param {string} url of the snippet
 * @param {string} [imageSrc] of the snippet
 * @param {string} [description] of the snippet
 * @param {null|object} [coords] of the snippet
 * @return {void}
 */
function saveSnippet( snippetPath, title, url, imageSrc = '', description = '', coords = null ) {
    const coordString = coords ? `<location lat="${coords.lat}" lon="${coords.lon}"></location>` : '';
    const text = `${imageSrc}
${title}
${url}
${description}
${coordString}`
    fs.writeFileSync( snippetPath, text );
}

/**
 * Update countries.json with notes in the notes folder.
 */
const countryNotes = {};
const countrySnippets = {};
const countryRegions = {};

/**
 * Prepares the site using snippets for a given country
 *
 * @param {string} snippetDir path to folder for country snippets
 * @return {array}
 */
function prepareFromSnippets( snippetDir ) {
    if ( !fs.existsSync( snippetDir ) ) {
        return [];
    }
    const files = fs.readdirSync( snippetDir );
    const snippets = [];
    // reset
    allSrcs = [];
    let skipped = 0;
    for (const file of files) {
        const filePath = `${snippetDir}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            const snippetObj = transformSnippet( filePath );
            if (snippetObj) {
                snippets.push( snippetObj );
            } else {
                skipped++;
                console.warn( `Ignoring snippet ${ filePath }` );
            }
        }
    }
    if ( skipped > 0 ) {
        console.warn( 'Not all snippets were built for the site. Please run update command again.' )
    }
    return snippets;
}

function downloadFile( url, to ) {
    const tmpFile = `tmp_${to}`;
    let fileStream;
    if ( url.indexOf('//' ) === 0 ) {
        url = `https:${url}`;
    }
    return fetch(url).then( ( res ) => {
        console.log('write to', tmpFile)
        fileStream = fs.createWriteStream( tmpFile, { flags: 'wx' } );
        return finished( Readable.fromWeb( res.body ).pipe( fileStream ) );
    } ).then( () => {
        fileStream.close();
        // resize the downloaded image.
        sharp( tmpFile, {} )
            .resize( {
                height: 400
            } ).toFile( to ).then( () => {
                fs.unlinkSync( tmpFile );
            } );
    } );
}

const urlToRelativeThumbPath = ( url ) => {
    const ext = url.split( '.' ).slice( -1 )[ 0 ];
    const path = url.split( '.' ).slice(0, -1).join('.').split('//')[1].replace(/[\/\.]/g, '_') + `.${ext}`;
    return `images/${decodeURIComponent(path)}`;
}

function touchCountryUpdatedTime( countryName ) {
    console.log(`Bump updated on ${countryName}`);
    json[countryName ].updated = new Date();
}

/**
 * @param {string} url
 * @return {boolean}
 */
function isAbsoluteUrl( url ) {
    return url.indexOf( 'https://' ) === 0 || url.indexOf( '//' ) === 0
}

function fixLongFilename(path) {
    const parts = path.split('/images/');
    const newPath = `/images/${parts[1].slice( -MAX_FILENAME_LENGTH )}`;
    fs.renameSync(`public${path}`, `public${newPath}`);
    return newPath;
}

/**
 * @param {string} path of file
 * @return {string|null}
 */
function filePathToString( path ) {
    if ( fs.existsSync( path ) ) {
        return fs.readFileSync( path ).toString();
    } else {
        return null;
    }
}

/**
 * @param {string} path of file
 * @return {Object}
 */
function filePathToJSON( path ) {
    const string = filePathToString( path );
    return string === null ? {} : JSON.parse( string );
}

/**
 * @param {string} notePath a file (usually note.txt)
 * @return {string} n/a if path doesn't exist.
 */
function filePathToMarkDown( notePath ) {
    const note = filePathToString( notePath );
    if ( note ) {
        return parse( note );
    } else {
        return 'n/a';
    }
}

/**
 * @param {string} region name of region to prepare for
 * @param {string} country name of country it belongs to
 * @return {Object}
 */
function prepareCountryRegionFromNotes( region, country ) {
    const regionPath = `notes/country/${country}/${region}`;
    const publicCountryRegionPath = `public/data/country/${country}/${region}.json`;
    const countryRegionJson = filePathToJSON( publicCountryRegionPath );
    if ( !countryRegionJson.seenL ) {
        countryRegionJson.seenL = 0;
    }
    if ( !countryRegionJson.seen ) {
        countryRegionJson.seen = 0;
    }
    if ( !countryRegionJson.places ) {
        countryRegionJson.places = {};
    }
    // load destinations
    (
        filePathToString( `${regionPath}/destinations.txt` ) || ''
    ).split( "\n" ).forEach( ( place ) => {
        if ( place && !countryRegionJson.places[place] ) {
            countryRegionJson.places[place] = {};
        }
    } );

    countryRegionJson.snippets = prepareFromSnippets( `${regionPath}/${SNIPPETS_DIR}` );
    countryRegionJson.note = filePathToMarkDown( `${regionPath}/note.txt` );
    fs.writeFileSync( publicCountryRegionPath, JSON.stringify( countryRegionJson, null, "\t" ) );
    return countryRegionJson;
}

/**
 * Checks the "notes" folder and updates countries.json
 */
function prepareFromNotes() {
    Object.keys(json).forEach( (c, i) => {
        const countryData = json[c];
        let thumb = countryData.thumbnail;
        if ( isAbsoluteUrl( thumb ) ) {
            const relativeThumbPath = urlToRelativeThumbPath( thumb );
            const localThumbPath = `public/${relativeThumbPath}`;
            if ( !fs.existsSync( localThumbPath ) ) {
                downloadFile( thumb, localThumbPath ).then( () => {
                    console.log('Local thumbnail made. Please re-run update');
                }, () => {
                    console.error( `Error downloading: ${thumb}`);
                } );
            } else {
                countryData.thumbnail = relativeThumbPath;
                const filePageMaybePx = thumb.split('/').slice(-1)[0];
                const filePage = filePageMaybePx.includes('px-') ? filePageMaybePx.split('px-')[1] :
                    filePageMaybePx;
                countryData.thumbnailSource = `https://commons.wikimedia.org/wiki/File:${filePage}`;
            }
            thumb = relativeThumbPath;
        } else if ( thumb.length > MAX_FILENAME_LENGTH && thumb.indexOf('/images/') === 0 ) {
            countryData.thumbnail = fixLongFilename( thumb );
        }
        const folder = `notes/country/${ c }`;
        if ( !fs.existsSync( folder ) ) {
            fs.mkdirSync( folder );
        }

        const snippetDir = `${folder}/${SNIPPETS_DIR}`;
        if ( !fs.existsSync( snippetDir ) ) {
            fs.mkdirSync( snippetDir );
        }
        const paths = fs.readdirSync( folder );
        countryRegions[ c ] = [];
        for (const path of paths) {
            const filePath = `${folder}/${path}`;
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                if ( path === SNIPPETS_DIR ) {
                    countrySnippets[c] = prepareFromSnippets( filePath );
                } else {
                    const regionJson = prepareCountryRegionFromNotes( path, c );
                    const noteCount = regionJson.note.includes('n/a') ? 0 : 1;
                    countryRegions[ c ].push( {
                        name: path,
                        climate: calculateRegionClimate( Object.values( regionJson.places ) ),
                        snippets: regionJson.snippets.length + noteCount
                    } );
                }
            }
        }
        countryNotes[c] = filePathToMarkDown( `notes/country/${ c }/note.txt` );
        const destinationsPath = `notes/country/${ c }/${DESTINATIONS_FILENAME}`;
        if ( fs.existsSync( destinationsPath ) ) {
            const destinations = fs.readFileSync( destinationsPath ).toString().trim().split("\n")
            if ( json[c].destinations.length !== destinations.length ) {
                touchCountryUpdatedTime( c );
            }
            json[c].destinations = destinations;
        }
    } );
}

/**
 * @param {string} region
 * @return {string} of note for region
 */
function readRegionNote( region ) {
    try {
        return fs.readFileSync(`notes/regions/${region}/note.txt`).toString();
    } catch ( e ) {
        return '';
    }
}

function prepareRegionsFromNotes() {
    Object.keys(regionjson).forEach((region) => {
        const countries = regionjson[region].countries;
        regionjson[region] = {
            countries,
            description: readRegionNote( region )
        };
    } );
    fs.writeFileSync(`public/data/regions.json`, JSON.stringify( regionjson, null, "\t") );
}
const destinationCoordinates = {};

function writeJsonToFile( path, json ) {
    fs.writeFileSync(path, JSON.stringify( json, null, "\t") );
}

/**
 * Scans regions for an orphaned city and updates it if found.
 *
 * @param {string} countryName 
 * @param {string} region 
 * @param {string} city 
 * @param {Object} place 
 * @return {boolean} was it successful?
 */
function updateRegionWithPlace( countryName, region, city, place ) {
    let success = false;
    const path = `public/data/country/${countryName}/${region}.json`;
    const regionData = filePathToJSON( path );
    const regionCities = Object.keys( regionData.places || {} );
    if ( regionCities.includes( city ) ) {
        console.log( `Moving ${ city } from ${countryName} to ${ region }`);
        regionData.places[ city ] = place;
        writeJsonToFile( path, regionData );
        success = true;
    }
    return success;
}
/**
 * Updates the public country JSON with information collected in prepareFromNotes
 */
function updateCountries() {
    let allAirports = [];
    Object.keys(json).forEach((c) => {
        const countryDataPath = `public/data/country/${c}.json`;
        const country = filePathToJSON( countryDataPath );
        country.note = countryNotes[c];
        if ( !country.places ) {
            country.places = {};
        }
        const airports = json[c].airports;
        // check if airports are featured in another countries airports
        allAirports = allAirports.concat(airports);

        const destinations = json[c].destinations || [];
        if ( countryRegions[ c ] ) {
            country.regions = countryRegions[ c ];
        }
        if ( !country.regions.length ) {
            delete country.regions;
        }
        Object.keys(country.places).forEach((key) => {
            if ( !destinations.includes(key) ) {
                const place = country.places[key];
                let success = false;
                ( country.regions || [] ).forEach( ( region ) => {
                    success = success || updateRegionWithPlace( c, region, key, place );
                } );
                if ( !success ) {
                    console.log(`${key} is an unknown destination (deleting)`);
                }
                delete country.places[key];
            }
            const coord = destinationCoordinates[key];
            if ( coord && !country.places[key].latitude ) {
                country.places[key] = Object.assign( country.places[key], coord );
                touchCountryUpdatedTime( c );
            }
        });
        // Check for newly added destinations
        destinations.forEach( ( p ) => {
            if ( !country.places[p] ) {
                // let's create it!
                console.log(`Adding ${p} to destinations. Please re-run to pull location information.`);
                country.places[p] = {};
            }
        } );
        const hasNote = !countryNotes[c].includes('n/a');   
        const countryRegionSnippetsCount = ( country.regions || [] ).reduce( ( acc, region ) => acc + region.snippets, 0 );
        let snippetTotal = country.snippets.length + countryRegionSnippetsCount;
        if ( hasNote ) {
            snippetTotal++;
        }
        // If number of snippets changed or no updated date, add updated.
        if ( !json[c].updated || country.snippets.length !== countrySnippets[c].length ) {
            touchCountryUpdatedTime(c);
        }
        country.snippets = countrySnippets[c];
        json[c].snippets = snippetTotal;
        fs.writeFileSync( countryDataPath, JSON.stringify( country, null, "\t"))
    } );
    console.log(
        'Duplicate airports',
        allAirports.filter((a, i) => allAirports.indexOf(a) !== i)
    );
}

/**
 * Imports blog posts from our Wordpress site
 */
function importBlogs() {
    function cleanup(str) {
        return str.replace(/&#8211;/g, '–').replace('<p>', '').replace('</p>', '')
            .replace(/&nbsp;/g, '')
            .replace(/&#8217;/g, '\'')
            .replace(/&#8211/g, '–')
            .replace(/&#8220;/g, '“')
            .replace(/&#8221;/g, '”')
            .replace(/&#8217;/,'\'')
            .replace(/&#8230;/g, '…').replace('[&hellip;]', '');
    }
    return fetch('https://public-api.wordpress.com/rest/v1.1/sites/somedaywewillseetheworld.wordpress.com/posts/?order_by=modified')
        .then((resp)=>resp.json())
        .then((blogjson) => {
            blogjson.posts.forEach((blog) => {
                const id = blog.ID;
                const countries = Object.keys(blog.terms.category);
                countries.forEach((country) => {
                    if ( json[country] ) {
                        console.log(`Found blog ${id} for ${country}`);
                        saveSnippet(
                           `notes/country/${country}/${SNIPPETS_DIR}/${id}.txt`,
                            cleanup(blog.title),
                            blog.URL,
                            blog.featured_image,
                            cleanup(blog.excerpt)
                        );
                    }
                });
            });
        })
}

function pullLocationFromProjects( lackingLonLat ) {
    return Promise.all( [
        fetch( `https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=coordinates&titles=${lackingLonLat.join('|')}&formatversion=2&colimit=max` )
            .then((r) => r.json()),
        fetch( `https://en.wikivoyage.org/w/api.php?origin=*&action=query&format=json&prop=coordinates&titles=${lackingLonLat.join('|')}&formatversion=2&colimit=max` )
            .then((r) => r.json())
    ] ).then( ( [ json, json2 ] ) => {
        return json.query.pages.concat( json2.query.pages );
    });
}

function pullLocations() {
    const promises = [];
    Object.keys(json).sort(()=>Math.random() < -0.5 ? -1 : 1 ).forEach((countryName) => {
        // Limit requests at a time.
        if ( promises.length > 30 ) {
            return;
        }
        const countryDataPath = `public/data/country/${countryName}.json`;
        const country = filePathToJSON( countryDataPath );
        const places = Object.keys( country.places );
        const lackingLonLat = places.filter((p) => !country.places[p].lat);
        // no need to pull for this country if already known.
        if ( lackingLonLat.length === 0 ) {
            return;
        }
        console.log(`Pulling remote information for country: ${countryName}, lacking coords for: ${lackingLonLat.join(',')}`);
        promises.push(
            pullLocationFromProjects( lackingLonLat )
            .then((pages) => {
                pages.forEach((page) => {
                    const c = page.coordinates ? page.coordinates[0] : null;
                    if ( c ) {
                        destinationCoordinates[page.title] = {
                            lat: c.lat,
                            lon: c.lon
                        };
                    }
                });
            })
        );
    } );
    return Promise.all(promises);
}

/**
 * Performs remote updates, pulling new information
 * from known sources like blogs etc...
 */
function remoteUpdates() {
    const promises = [ Promise.resolve() ];
    if ( hrsSinceLastUpdate > 24 ) {
        promises.push( importBlogs() );
    }
    if ( hrsSinceLastUpdate > 1 ) {
        promises.push( pullLocations() );
    }

    return Promise.all( promises );
}

/**
 * Updates countries.json file.
 */
function updateCountriesAndSave() {
    console.log('update countries and save');
    updateCountries();
    fs.writeFileSync(
        'update.json',
        JSON.stringify( {
            lastUpdated: now
        }, null, "\t" )
    );
    fs.writeFileSync('public/data/countries.json', JSON.stringify(json, null, "\t"));
}

/**
 * Performs local updates to the file system
 */
function localUpdates() {
    prepareFromNotes();
    prepareRegionsFromNotes();
    Promise.all( pendingRequests ).then( () => {
        updateCountriesAndSave();
    }, () => {
        updateCountriesAndSave();
    } );
}

const now = new Date();
const hrsSinceLastUpdate = update.lastUpdated ?
    ( now - new Date( update.lastUpdated ) ) / ( 1000 * 60 * 60 ) : 2;

const arg = process.argv[2];
if ( arg !== '--local-only' ) {
   pendingRequests.push( remoteUpdates( hrsSinceLastUpdate ) );
}

localUpdates();
