// VARIOUS FUNCTIONS TO CHECK THE USER INPUT
//===========================================

// Checks the syntax of the dependencies, tree, and rule lines
function ckSyn(d,f,t,l) {
	if(d!='' && !ckc(d)) {
		throw 'ERROR: dependencies are malformed.';
	}
	if(t.length==0) {
		throw 'ERROR: Formula is malformed.';
	}
	var x = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz()~&<>=#';
	for(var i=0;i<f.length;i++) {
		if(x.indexOf(f[i])<0) {
			throw 'ERROR: the formula you entered contains the unrecognized character \''+f[i]+'\'.  See the syntax guide under the Reference tab.';
		}
	}
	if(!(l=='') && !ckc(l)) {
		throw 'ERROR: Rule lines are malformed';
	}
}

// Takes the user input and dispatches it to the appropriate rule checking function.
// n is the number of the proof line (starting with 0, not 1)
function ckRest(d,f,t,r,l,n) {
	var x = 0;
	if((x = oob(l,n))>0) {
		throw 'ERROR: Rule line '+x+ ' is out of bounds. Rules must be applied to preceding lines.';
	}
	s = get_seq(r);
	if(r=='Premise' || r=='Assumption') {ckPA(d,f,t,r,s,l,n);}
	else if(r=='&I') {ckCJI(d,f,t,r,s,l,n);}
	else if(r=='&E') {ckCJE(d,f,t,r,s,l,n);}
	else if(r=='vI') {ckDJI(d,f,t,r,s,l,n);}
	else if(r=='vE') {ckDJE(d,f,t,r,s,l,n);}
	else if(r=='>I') {ckCNI(d,f,t,r,s,l,n);}
	else if(r=='>E') {ckCNE(d,f,t,r,s,l,n);}
	else if(r=='~I') {ckNI(d,f,t,r,s,l,n);}
	else if(r=='~E') {ckNE(d,f,t,r,s,l,n);}
	else if(r=='DN') {ckDN(d,f,t,r,s,l,n);}
	else if(r=='<>I') {ckBCI(d,f,t,r,s,l,n);}
	else if(r=='<>E') {ckBCE(d,f,t,r,s,l,n);}
	else if(r=='Df') {ckDf(d,f,t,r,s,l,n);}
	else if(r=='EFQ') {ckEFQ(d,f,t,r,s,l,n);}
	else if(r=='EI') {ckEI(d,f,t,r,s,l,n);}
	else if(r=='EE') {ckEE(d,f,t,r,s,l,n);}
	else if(r=='AI') {ckAI(d,f,t,r,s,l,n);}
	else if(r=='AE') {ckAE(d,f,t,r,s,l,n);}
	else if(r=='=I') {ckIDI(d,f,t,r,s,l,n);}
	else if(r=='=E') {ckIDE(d,f,t,r,s,l,n);}
	else if(r=='SI(Com)') {ckCom(d,f,t,r,s,l,n);}
	else if(r=='SI(QS)') {ckQS(d,f,t,r,s,l,n);}
	else if(r=='SI(AV)') {ckAV(d,f,t,r,s,l,n);}
	else if(r=='SI(SDN1)') {ckSDN1(d,f,t,r,s,l,n);}
	else if(r=='SI(SDN2)') {ckSDN2(d,f,t,r,s,l,n);}
	else if(r.indexOf('DeM')>0||r.indexOf('Imp')>0||r.indexOf('Dist')>0) {ckSIbi(d,f,t,r,s,l,n);}
	else if(r.indexOf('SI')==0) {ckSI(d,f,t,r,s,l,n);}
	else {throw "ERROR: The rule "+r+" you entered is not recognized.";}
}

// [Int] -> (Int -> Boolean)
// Out-Of-Bounds function. Takes an array of ints and an int n and returns 0 if none
// of the array elements are > n, else returns the value of the array element >n.
function oob(ar,n) {
	for(var i=0;i<ar.length;i++) {
		if(ar[i] > n) {
			return ar[i];
		}
	}
	return 0;
}

// String -> Boolean
// Takes a string and checks if it has the form: numeral comma numeral comma ... etc.
function ckc(s) {
	var n = ['0','1','2','3','4','5','6','7','8','9'];
	var st = false;
	var c = '';
	for(var i=0;i<s.length;i++) {
		c = s[i];
		if(n.indexOf(c)>=0) {
			st=true;
		} else if(c==',' && st) {
			st = false;
		} else {return false;}
	}
	return st;
}

// [Int] -> [Int]
// Takes an array of ints and returns the array sorted from smallest to largest
function sorted(a) {
	return a.sort(function(a,b) {return a-b;});
}

// String -> [Int]
// Takes an array in the CSV format checked by ckc, and returns
// the corresponding array of ints
function mkIntArr(s) {
	if(s=='') {
		return [];
	} else {
		var a = s.split(',');
		return a.map(function(x){return parseInt(x,10);});
	}
}

// [String] -> Int
// Takes an array of strings and returns the length of its longest element.
function max(ar) {
	var n = 0;
	for(var i=0;i<ar.length;i++) {
		if(ar[i].length > n) {
			n = ar[i].length;
		}
	}
	return n;
}

// ([String],Int) -> [String]
// Takes an array of strings and an int n, and appends blanks to the end of 
// each string in the array until the string has length n, then adds some padding
function pad(ar,n) {
	for(var i=0;i<ar.length;i++) {
		while(ar[i].length<n) {
			ar[i] += ' ';
		}
		ar[i] += '  ';
	}
}

// String -> Boolean
// Takes a string and checks that every char is a numeral
function isInt(s) {
	var n = ['0','1','2','3','4','5','6','7','8','9'];
	for(var i=0;i<s.length;i++) {
		if(n.indexOf(s[i])<0) {
			return false;
		}
	}
	return !(s.length==0);
}

// Array -> Array
// Takes an array and removes duplicate elements
function rmDup(a) {
	return a.filter(function(el,pos) {return a.indexOf(el)==pos;});
}
