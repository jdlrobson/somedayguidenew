import json from './src/pages/countries.json' assert { type: "json" };
import update from './update.json' assert { type: "json" };
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { parse } from 'marked';

const allSrcs  = [];

let pendingRequests = [];
/**
 * Expands a Wikipedia snippet URL.
 * @param {string} filePath of snippet
 * @param {string} wikiTitle of wikipedia page
 */
function expandWikipediaSnippet( filePath, wikiTitle ) {
    return fetch( `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}` ).then((r) => r.json())
        .then((json) => {
            const src = json.thumbnail ? json.thumbnail.source : null;
            saveSnippet(filePath, json.titles.normalized,
                `https://en.wikipedia.org/wiki/${wikiTitle}`, src, `<small>[Wikipedia]:</from> ${json.extract}` );
        });
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
        description += ` <small>[image from ${author}]</small>`
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
    const queries = [];
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
            } else if ( srcOrUrl.indexOf( 'wikipedia.org' ) > -1 ) {
                const wikiTitle = srcOrUrl.split('/').slice(-1)[0];
                pendingRequests.push( expandWikipediaSnippet( filePath, wikiTitle ) );
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

    return {
        text,
        src,
        type,
        embed: isEmbedSite( src ),
        title,
        url
    }
}

/**
 * Saves a snippet for a given country
 *
 * @param {string} snippetPath to a file in notes/country/snippets/1.txt
 * @param {string} title of the snippet
 * @param {string} url of the snippet
 * @param {string} [imageSrc] of the snippet
 * @param {string} [description] of the snippet
 * @return {void}
 */
function saveSnippet( snippetPath, title, url, imageSrc = '', description = '' ) {
    const text = `${imageSrc}
${title}
${url}
${description}
`
    fs.writeFileSync( snippetPath, text );
}

/**
 * Update countries.json with notes in the notes folder.
 */
const countryNotes = {};
const countrySnippets = {};

/**
 * Prepares the site using snippets for a given country
 *
 * @param {string} snippetDir path to folder for country snippets
 * @return {array}
 */
function prepareFromSnippets( snippetDir ) {
    const files = fs.readdirSync( snippetDir );
    const snippets = [];
    let total = 0;
    for (const file of files) {
        total++;
        const filePath = `${snippetDir}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            const snippetObj = transformSnippet( filePath );
            if (snippetObj) {
                snippets.push( snippetObj )
            }
        }
    }
    if ( total !== snippets.length ) {
        console.warn( 'Not all snippets were built for the site. Please run update command again.' )
    }
    return snippets;
}

/**
 * Checks the "notes" folder and updates countries.json
 */
function prepareFromNotes() {
    Object.keys(json).forEach( (c, i) => {
        const countryData = json[c];
        const thumb = countryData.thumbnail;
        if ( thumb.indexOf( 'https://' ) === 0 && i === 0  ) {
            console.log( thumb);
        }
        const folder = `notes/country/${ c }`;
        if ( !fs.existsSync( folder ) ) {
            fs.mkdirSync( folder );
        }

        const snippetDir = `${folder}/snippets`;
        if ( !fs.existsSync( snippetDir ) ) {
            fs.mkdirSync( snippetDir );
        }
        countrySnippets[c] = prepareFromSnippets( snippetDir );
        const notePath = `notes/country/${ c }/note.txt`;
        if ( fs.existsSync( notePath ) ) {
            const note = fs.readFileSync( notePath ).toString();
            countryNotes[c] = parse( note );
        } else {
            countryNotes[c] = 'n/a';
        }
        const destinationsPath = `notes/country/${ c }/destinations.txt`;
        if ( fs.existsSync( destinationsPath ) ) {
            const destinations = fs.readFileSync( destinationsPath ).toString().trim().split("\n")
            json[c].destinations = destinations;
        }
    } );
}

/**
 * Updates the public country JSON with information collected in prepareFromNotes
 */
function updateCountries() {
    Object.keys(json).forEach((c) => {
        const countryDataPath = `public/data/country/${c}.json`;
        const country = JSON.parse( fs.readFileSync( countryDataPath ).toString() );
        country.note = countryNotes[c];
        const hasNote = !countryNotes[c].includes('n/a');   
        let snippetTotal = country.snippets.length;
        if ( hasNote ) {
            snippetTotal++;
        }
        country.snippets = countrySnippets[c];
        json[c].snippets = snippetTotal;
        fs.writeFileSync( countryDataPath, JSON.stringify( country, null, "\t"))
    } );
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
                           `notes/country/${country}/snippets/${id}.txt`,
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

/**
 * Performs remote updates, pulling new information
 * from known sources like blogs etc...
 */
function remoteUpdates() {
    return Promise.all( [
        importBlogs()
    ] );
}

/**
 * Updates countries.json file.
 */
function updateContriesAndSave() {
    updateCountries();
    fs.writeFileSync(
        'update.json',
        JSON.stringify( {
            lastUpdated: now
        }, null, "\t" )
    );
}

/**
 * Performs local updates to the file system
 */
function localUpdates() {
    prepareFromNotes();
    Promise.all( pendingRequests ).then( () => {
        updateContriesAndSave();
    }, () => {
        updateContriesAndSave();
    } );
}

const now = new Date();
const hrsSinceLastUpdate = update.lastUpdated ?
    ( now - new Date( update.lastUpdated ) ) / ( 1000 * 60 * 60 ) : 2;
if ( hrsSinceLastUpdate > 1 ) {
    pendingRequests.push( remoteUpdates() );
} else {
    console.log( 'Skipping remote update' );
}

localUpdates();
fs.writeFileSync('src/pages/countries.json', JSON.stringify(json, null, "\t"));
