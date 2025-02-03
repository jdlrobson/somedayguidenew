import json from './src/pages/countries.json' assert { type: "json" };
import update from './update.json' assert { type: "json" };

import fs from 'fs';
import { parse } from 'marked';

const allSrcs  = [];
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

function saveSnippet( country, text, filename = null ) {
    const snippetDirPath = `notes/country/${country}/snippets/`;
    if ( !fs.existsSync( snippetDirPath )) {
        fs.mkdirSync(snippetDirPath);
    }
    if ( !filename ) {
        return;
    }
    const snippetPath = `notes/country/${country}/snippets/${filename}`;
    fs.writeFileSync( snippetPath, text );
    
}

/**
 * Update countries.json with notes in the notes folder.
 */
const countryNotes = {};
const countrySnippets = {};
function updateNotes() {
    const zoomMissing = [];
    Object.keys(json).forEach((c) => {
        const folder = `notes/country/${ c }`;
        const notePath = `notes/country/${ c }/note.txt`;
        const snippetDir = `${folder}/snippets`;
        if (!json[c].zoom ) {
            zoomMissing.push(c);
        }
        if ( !fs.existsSync( folder ) ) {
            fs.mkdirSync( folder );
        }
        if ( !fs.existsSync( snippetDir ) ) {
            fs.mkdirSync( snippetDir );
        }
        const files = fs.readdirSync( snippetDir );
        const snippets = [];
        for (const file of files) {
            const filePath = `${snippetDir}/${file}`;
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                const snip = fs.readFileSync(filePath).toString();
                snippets.push( transformSnippet( snip ) )
            }
        }
        countrySnippets[c] = snippets;
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
                        saveSnippet( country, `${blog.featured_image || ''}
${cleanup(blog.title)}
${blog.URL}
${cleanup(blog.excerpt)}
`, `${id}.txt`)
                    }
                });
            });
        })
}

function remoteUpdates() {
    importBlogs();
}

function localUpdates() {
    updateNotes();
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
