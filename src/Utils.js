import Axios from 'axios';
import Path from 'path';
import ObjectHelper from './components/lib/ObjectHelper';
import { ValueErrorException, TypeErrorException } from './components/lib/BaseExceptions';
// import 'whatwg-fetch'

class Utils {
	static async _evaluateRequest( Response, ResponseError, Hook ) {

		while ( true === Utils.isEmpty( Response ) ) {
			await Utils.sleep( 10 );
		}

		Hook( Response, ResponseError );
	}

	static async _getExternComplex( Request, Hook ) {
		let ResponseError = '';
		let Response = '';
		let Url, Configuration;

		if (
        	false === ( 'url' in Request )		||
			'string' !== typeof Request.url		||
			null === Request.url		||
			0 === Request.url.length ) {
			throw new TypeErrorException( `Expected non empty string and got ${ typeof Request.url }.` );
		}

		Url = Request.url;
		Configuration = ObjectHelper.copyObj( Request );
		delete Configuration.url;

		Axios.get( Url, Configuration )
			.then( response => ( Response = response ) )
			.catch( error => ( ResponseError = error ) );

		Utils._evaluateRequest( Response, ResponseError, Hook );
	}

	static async _getExternSimple( File, Hook ) {
		let ResponseError = '';
		let Response = '';
		Axios.get( File )
			.then( response => ( Response = response ) )
			.catch( error => ( ResponseError = error ) );
		Utils._evaluateRequest( Response, ResponseError, Hook );
	}

	static async _getIntern( File, Hook ) {
		let ResponseError;
		File = `.${ Path.resolve( File )}`;
		const Response = await import( `${ File }` ).catch( error => ( ResponseError = error ) );
		Utils._evaluateRequest( Response, ResponseError, Hook );
	}

	static get( File, Hook ) {
		if ( 'object' !== typeof File && 'string' !== typeof File && false === Array.isArray( File ) ) {
			throw new TypeErrorException( `Unexpected type at File argument - expected string or object got ${typeof File}.` );
		}

		if ( 'function' !== typeof Hook ) {
			throw new TypeErrorException( `Unexpected type at Hook argument - expected function got ${typeof File}.` );
		}

		if ( 'object' === typeof File ) {
			Utils._getExternComplex( File, Hook );
		} else if ( true === File.startsWith( 'http://' ) || true === File.startsWith( 'https://' ) ) {
			Utils._getExternSimple( File, Hook );
		} else {
			if ( 0 === File.length ) {
				throw new ValueErrorException( 'Got empty string as File argument.' );
			}
			Utils._getIntern( File, Hook );
		}
	}

	static isEmpty( Anything ) {
		if ( 'undefined' === typeof Anything || null === Anything ) {
			return true;
		} else {
			if ( 'string' === typeof Anything ) {
				return 0 === Anything.length;
			} else if ( true === Array.isArray( Anything ) ) {
				return 0 === Anything.length;
			} else if ( 'object' === typeof Anything ) {
				return ObjectHelper.isEmpty( Anything );
			} else {
				return false;
			}
		}
	}

	static sleep( Milliseconds ) {
		return new Promise( Resolve => setTimeout( Resolve, Milliseconds ) );
	}

	static async waitUntil( Callback ) {

		while ( Callback() ) {
			await Utils.sleep( 10 );
		}
	}

	static debugObjectPrint( Object ) {
		const Body = document.getElementsByTagName( 'body' )[ 0 ];
		const Element = document.createElement( 'div' );
		Element.innerHTML = `<pre>${ JSON.stringify( Object, undefined, 4 ) }</pre>`;
		Body.appendChild( Element );
	}

	static binaryInsertSearch( Where, What ) {
		let Start, Mid, End;

		if ( true === Utils.isEmpty( Where ) ) {
			return -1;
		}

		Start = 0;
		End = Where.length - 1;

		while ( Start <= End ) {
			Mid = ( ( Start + End ) >> 1 );
			if ( What > Where[ Mid ] ) {
				Start = Mid + 1;
			} else if ( What < Where[ Mid ] ) {
				End = Mid - 1;
			} else {
				return Mid;
			}
		}

		return -( Start + 1 );
	}

	static unique( array ) {
		return array.filter( function ( Element, Position, InnerArray ) {
			return InnerArray.indexOf( Element ) === Position;
		} );
	}
}

export default Utils;
