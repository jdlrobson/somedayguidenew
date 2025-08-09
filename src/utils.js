
import countryData from  '../public/data/countries.json';
import regions from '../public/data/regions.json';

export const getCountriesInRegion = ( regionName ) => {
	const regionInfo = regions[regionName] || {};
	return Object.keys( countryData ).map( ( title ) => {
		return Object.assign( {
			href: `/country/${ title }`
		}, countryData[ title ] );
	}).filter((c) => regionInfo.countries.includes(c.title))
};
