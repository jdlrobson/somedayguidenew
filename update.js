import json from './src/pages/countries.json' assert { type: "json" };
import update from './update.json' assert { type: "json" };

import fs from 'fs';
import { parse } from 'marked';

const allSrcs  = [];
/**
 * Converts a snippet text file into an object
 *
 * @param {string} snipText
 * @return {false|Object} converted snippet or false if in
 *  unexpected form.
 */
function transformSnippet( snipText ) {
    const snip = snipText.trim().split('\n');
    let text = snip[3];
    let src = snip[0];
    let title = snip[1];
    let url = snip[2];
    let type = 'url';
    if ( snip.length === 1 ) {
        if ( snip[ 0 ].charAt( 0 ) === '"') {
            text = snip[0];
            type = 'quote';
            title = 'Quote'
        } else {
            src = snip[0];
            if ( src.charAt( 0 ) !== 'h' ) {
                console.log('Check snippet:', snipText);
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
        embed: [ 'instagram' ].includes( type ),
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
    for (const file of files) {
        const filePath = `${snippetDir}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            const snip = fs.readFileSync(filePath).toString();
            const snippetObj = transformSnippet( snip );
            if (snippetObj) {
                snippets.push( snippetObj )
            }
        }
    }
    return snippets;
}

/**
 * Checks the "notes" folder and updates countries.json
 */
function prepareFromNotes() {
    const zoomMissing = [];
    Object.keys(json).forEach( (c, i) => {
        const countryData = json[c];
        const thumb = countryData.thumbnail;
        if ( thumb.indexOf( 'https://' ) === 0 && i === 0  ) {
            console.log( thumb);
        }
        const folder = `notes/country/${ c }`;
        if (!countryData.zoom ) {
            zoomMissing.push(c);
        }
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
    console.log(`Add zoom for ${zoomMissing.length}: ${ zoomMissing}`)
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
    fetch('https://public-api.wordpress.com/rest/v1.1/sites/somedaywewillseetheworld.wordpress.com/posts/?order_by=modified')
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
    importBlogs();
}

/**
 * Performs local updates to the file system
 */
function localUpdates() {
    prepareFromNotes();
    updateCountries();
    fs.writeFileSync(
        'update.json',
        JSON.stringify( {
            lastUpdated: now
        }, null, "\t" )
    );
}

const now = new Date();
const hrsSinceLastUpdate = update.lastUpdated ?
    ( now - new Date( update.lastUpdated ) ) / ( 1000 * 60 * 60 ) : 2;
if ( hrsSinceLastUpdate > 1 ) {
    remoteUpdates();
} else {
    console.log( 'Skipping remote update' );
}

localUpdates();
fs.writeFileSync('src/pages/countries.json', JSON.stringify(json, null, "\t"));
