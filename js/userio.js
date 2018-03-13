// To uglify: cat userio.js ui.js rules_ql.js rules_pl.js rules_siti_pl.js validate.js parsing.js | uglifyjs -mt  --comments > ug.js

// ARRAYS TO HOLD VARIOUS ELEMENTS OF A PROOF LINE
// ===============================================

var dep = []; // holds dependencies as int arrays
var cnt = []; // holds line counts as ints
var frm = []; // holds formulas as strings
var tr = []; // holds a parse tree of the formula
var rul = []; // holds rules as strings
var lin = []; // holds rule lines as int arrays
var gls = []; // holds the goal formula(s) of the problem


// FUNCTIONS FOR THE USER MENU OPTIONS
//====================================

// Sets up the proof with user entered premises and conclusion
function get_userproblem() {
	var prem = document.getElementById('premises').value.replace(/ /g,'');
	var premises = prem=='' ? [] : prem.split(',');
	var conclusion = document.getElementById('conclusion').value.replace(/ /g,'');
	try{put_problem(premises,conclusion);} catch(err) {return errmess([1],err);}
}

function put_problem(premises,conclusion) {
	var p_lines = [];
	try{var goal = check_goal(conclusion);} catch(err) {
		clearall();
		throw 'ERROR: conclusion is not well formed.';
	}
	for(var i=0;i<premises.length;i++) {
		try{
			var line = check_line((i+1).toString(),premises[i],parse(premises[i]),'Premise','',i);
			p_lines.push(line);
		} catch(err) {
			throw 'ERROR: one of the premises is not well formed.';
		}
	}
	for(var i=0;i<p_lines.length;i++) {
		append_line(p_lines[i].d,p_lines[i].f,p_lines[i].t,p_lines[i].r,p_lines[i].l,p_lines[i].n);
	}
	insert_goal(goal);
	errmess([0],'');
	disp('app');
}

// Gets the information of the line the user is attempting to append
function get_line() {
	var d = document.getElementById('dep').value.replace(/ /g,'');
	var f = document.getElementById('frm').value.replace(/ /g,'');
	var t = parse(f);
	var r = document.getElementById('rul').value;
	var l = document.getElementById('lin').value.replace(/ /g,'');
	var n = cnt.length;
	if(r=='SI/TI') {
		r = document.getElementById('SI1').value;
	}
	try {var line = check_line(d,f,t,r,l,n);} catch(err) {return errmess([1],err);}
	append_line(line.d,line.f,line.t,line.r,line.l,line.n);
	errmess([0],'');
}

// Checks the syntax and rule application of the line, and returns the line information
// as an object; note the n value should be the user value, not the zero offset value
function check_line(d,f,t,r,l,n) {
	if(t.length==0) {
		f = '('+f+')';
		t = parse(f);
	}
	ckSyn(d,f,t,l);
	d = sorted(rmDup(mkIntArr(d)));
	l = mkIntArr(l);
	ckRest(d,f,t,r,l,n);
	return {'d':d,'f':f,'t':t,'r':r,'l':l,'n':n}
}

// Appends a new line to the proof
function append_line(d,f,t,r,l,n) {
	dep.push(d);
	frm.push(f);
	tr.push(t);
	rul.push(r);
	lin.push(l);
	cnt.push(n+1);

	var table = document.getElementById('drvt');
	var row = mkRow(cnt.length-1);
	table.appendChild(row);
	clear_appt();
}

// Clears the previous (i.e. last) line of a proof
function delete_previous() {
	if(cnt.length==0) {
		return errmess([1],'ERROR: no lines to delete.');
	}
	else if(rul[rul.length-1]=='Premise') {
		return errmess([1],"ERROR: no lines to delete. Premise lines cannot be deleted.  Reload the page to start a new proof if you entered the premises incorrectly.");
	} else {
		var e = document.getElementById('drvt');
		e.deleteRow(e.rows.length-1);
		dep.pop();
		cnt.pop();
		frm.pop();
		tr.pop();
		rul.pop();
		lin.pop();
	}
	if(cnt.length==0 && gls.length==0) {
		clear_appt();
		clear_prbt();
		disp('app');
	}
	errmess([0],'');
}

// gets a goal formula from the input field
function get_goal() {
	var f = document.getElementById('gfrm').value.replace(/ /g,'');
	try{var goal = check_goal(f);} catch(err) {return errmess([1],err);}
	insert_goal(goal);
}

// Checks goal formula and returns formula and tree
function check_goal(f) {
	var t = parse(f);
	if(t.length==0) {
		f = '('+f+')';
		t = parse(f);
		if(t.length==0) {
			throw "ERROR: goal/conclusion formula is not well formed: "+f;
		}
	}
	return f;
}

// inserts a goal formula into the goalt table
function insert_goal(f) {
	var clar = ['depc','cntc','frmc','rulc'];
	var table = document.getElementById('goalt');
	var row = table.insertRow(0);
	var tdar = new Array(4);
	for(var i=0;i<4;i++) {
		tdar[i] = document.createElement('td');
		tdar[i].className = clar[i];
	}
	var t1 = document.createTextNode("Goal:");
	var t2 = document.createTextNode(padBC(f));
	tdar[0].appendChild(t1);
	tdar[2].appendChild(t2);
	for(var i=0;i<4;i++) {
		row.appendChild(tdar[i]);
	}
	errmess([0],'');
	document.getElementById('gfrm').value = '';
	gls.push(f);
}

// Removes removes most recent goal formula; cannot delete last goal formula
function delete_goal() {
	var table = document.getElementById('goalt');
	if(gls.length==1) {
		return errmess([1],"ERROR: No subgoals to delete.  Cannot delete the main goal (conclusion) of the argument.");
	} else {
		table.deleteRow(0);
		gls.pop();	
	}
	if(gls.length==0 && cnt.length==0) {
		clear_appt();
		clear_prbt();
		disp('app');
	}
	errmess([0],'');
}

// Loads a line for editing
function load_line() {
	var n = parseInt(document.getElementById('rl').value.replace(/ /g,''),10);
	if(isNaN(n) || n>cnt.length || n<1) {
		return errmess([1],'ERROR: There is no line number '+n+' in the proof.');
	}
	n = n-1;
	if(rul[n]=='Premise') {
		return errmess([1],'ERROR: premise lines cannot be edited.  Reload the page to start a new proof if you entered the premises incorrectly.  Alternatively, export the proof as its stands, edit the premise, and then import the edited proof.');
	}
	document.getElementById('depr').value = dep[n].join(',');
	document.getElementById('frmr').value = frm[n];
	if(rul[n].indexOf('SI')==0) {
		document.getElementById('rulr').value = 'SI/TI';
		document.getElementById('SI2').style.display = 'block';
		document.getElementById('SI2').value = rul[n];
	} else {
		document.getElementById('rulr').value = rul[n];
		document.getElementById('SI2').style.display = 'none';
	}
	document.getElementById('linr').value = lin[n].join(',');
	errmess([0],'')
}

// Replaces a line with an edited line
function rep_line() {
	var n = parseInt(document.getElementById('rl').value.replace(/ /g,''),10);
	var d = document.getElementById('depr').value.replace(/ /g,'');
	var f = document.getElementById('frmr').value.replace(/ /g,'');
	var t = parse(f);
	var r = document.getElementById('rulr').value;
	var l = document.getElementById('linr').value.replace(/ /g,'');
	
	if(n>cnt.length || n<1) {
		errmess([1],'ERROR: No line number ' + n.toString() + ' to replace');
	}
	if(r=='SI/TI') {
		r = document.getElementById('SI2').value;
	}
	n -= 1;
	try{var line = check_line(d,f,t,r,l,n);} catch(err) {
		return errmess([1,n+1],'There is a problem with the replacement for line '+(n+1)+' you entered.  The error message concerning it is:<br /><br />'+err);
	}
	dep[n]=line.d;
	frm[n]=line.f;
	tr[n]=line.t;
	rul[n]=line.r;
	lin[n]=line.l;
	
	var table = document.getElementById('drvt');
	var row = mkRow(n);
	table.removeChild(table.childNodes[n]);
	table.insertBefore(row,table.childNodes[n]);
	for(var i=(n+1);i<cnt.length;i++) {
		try {ckRest(dep[i],frm[i],tr[i],rul[i],lin[i],i);} catch(err) {
			return errmess([1,(i+1)],'There is a problem with proof line '+(i+1)+'.  The error message concerning it is:<br /><br />'+err);
		}
	}
	errmess([0],'');
	clear_rept();
}

// Exports a proof
function export_proof() {
	if(cnt.length==0) {return errmess([1],'ERROR: no proof to export.');}
	var plain = document.getElementById('plain').checked;
	var pretty = document.getElementById('pretty').checked;
	var latex = document.getElementById('latex').checked;
	var odep = dep.map(function(a) {return a.join(',');}); 
	var ocnt = cnt.map(function(a) {return '('+a.toString()+')';});
	var ofrm = plain ? frm.map(padBC) : '';
	ofrm = pretty ? frm.map(function(a) {return padBC2(richardify(a));}) : ofrm;
	ofrm = latex ? frm.map(function(a) {return latexify(richardify(a));}) : ofrm;
	var orul = (pretty || latex) ? rul.map(gRul) : rul.slice(0);
	var olin = lin.map(function(a) {return a.join(',');});
	var ogl = plain ? padBC(gls[0]) : '';
	ogl = pretty ? (function(a) {return padBC2(richardify(a));})(gls[0]) : ogl;
	ogl = latex ? (function(a) {return latexify(richardify(a));})(gls[0]) : ogl;
	var pre = '';
	var proof = '';
	var premises = get_premises();
		
	if(plain || pretty) {
		pre += 'Problem: ';
		for(var i=0;i<premises.length;i++) {
			pre += i==premises.length-1 ? ofrm[i] : ofrm[i]+', ';
		}
		pre = pre+' \u22A2 '+ogl+'\r\n\r\n';
		pad(odep,max(odep));
		pad(ocnt,max(ocnt));
		pad(ofrm,max(ofrm)+2);
		for(var i=0;i<cnt.length;i++) {
			if(olin[i].length==0) {
				proof += odep[i] + ocnt[i] + ofrm[i] + orul[i] + '\r\n';
			} else {
				proof += odep[i] + ocnt[i] + ofrm[i] + olin[i] + '  '+ orul[i] + '\r\n';
			}
		}
	}
	if(latex) {
		pre +='\\noindent Problem: $';
		for(var i=0;i<premises.length;i++) {
			pre += i==premises.length-1 ? ofrm[i] : ofrm[i]+', ';
		}
		pre += ' \\vdash '+ogl+'$\r\n\r\n';
		proof = '\\noindent\\begin{tabular}{ l l l l }\r\n';
		orul = orul.map(lxrul);
		for(var i=0;i<cnt.length;i++) {
			if(olin[i].length==0) {
				proof += odep[i]+' & '+ocnt[i]+' & $'+ofrm[i]+'$ & '+orul[i]+'\\\\\r\n';
			} else {
				proof += odep[i]+' & '+ocnt[i]+' & $'+ofrm[i]+'$ & '+olin[i]+' '+orul[i]+'\\\\\r\n';
			}
		}
		proof = proof+'\\end{tabular}';
	}
	
	document.getElementById('importarea').value = pre+proof;
	
	function lxrul(s) {
		var out = '';
		var test = '';
		for(var i=0;i<s.length;i++) {
			test = utox(s[i]);
			if(test!=s[i]) {test='$'+test+'$';}
			out += test;
		}
		return out;
	}
}

// imports a proof
function import_proof() {
	var proof = document.getElementById('importarea').value; // first check the user has pasted something into the textarea
	if(proof.indexOf("Paste a previously")>=0) {return errmess([1],"ERROR: paste a proof into the textarea first.");}
	clearall(); // clear the globals
	document.getElementById('drvt').innerHTML = '';
	document.getElementById('goalt').innerHTML = '';
	var cols = [dep,cnt,frm,tr,rul,lin];
	var tmp = next_line(proof);
	var line = [];
	var d = '';
	var f = '';
	var t = [];
	var r = '';
	var l = '';
	var n ='';
	while(tmp[0].indexOf('Problem: ')!=0 && proof.length!=0) { // consumes until problem line
		proof = tmp[1];
		tmp = next_line(proof);
	} // report error if no problem line found 
	if(proof.length==0) {return errmess([1],'ERROR: proofs must begin with a problem line.  Something like "Problem: (P>Q), P \u22A2 Q"');}
	try{var problem = get_problem(tmp[0]);} catch(err) {return errmess([1],err);} // extracts problem
	insert_goal(problem[1]);
	while(proof.length!=0 && (tmp[0].length==0 || (tmp[0][0]!=' ' && !isInt(tmp[0][0])))) { // consumes until proof starts
		proof = tmp[1];
		tmp = next_line(proof);
	}
	if(proof.length==0) {return nope();} // error if no proof found
	tmp = next_line(proof);
	while(tmp[0].length!=0) { // begins processing proof
		line = tmp[0].split('  ').filter(fltr);
		line = line.map(function(x) {return x.replace(/ /g,'');});
		proof = tmp[1];
		tmp = next_line(proof);
		if(line.length==5) { // line has all five rule columns: 0dep 1cnt 2frm 3lin 4rul
			d = line[0];
			n = parseInt(line[1].substring(1,line[1].length-1),10);
			f = line[2];
			r = line[4];
			t = parse(f);
			l = line[3];
		} else if(line.length==4) {
			var f = 0;
			for(var i=0;i<line.length;i++) {
				if(parse(line[i]).length!=0) {
					f = i;
					break;
				}
			}
			if(f==1) { // line has no dependencies: 0cnt 1frm 2lin 3rul
				d = '';
				n = parseInt(line[0].substring(1,line[0].length-1),10);
				f = line[1];
				r = line[3];
				t = parse(f);
				l = line[2];
			} else if(f==2) { // line has no rule lines (Premise or Assumption): 0dep 1cnt 2frm 3rul
				d = line[0];
				n = parseInt(line[1].substring(1,line[1].length-1),10);
				f = line[2];
				r = line[3];
				t = parse(f);
				l = '';
			} else {return nope();}
		} else if(line.length==3) { // TI line: 0cnt 1frm 2rul
			d = '';
			n = parseInt(line[0].substring(1,line[1].length-1),10);
			f = line[1];
			t = parse(f);
			r = line[2];
			l = '';
		} else {return nope();}
		try {var pline = check_line(d,f,t,r,l,n-1);} catch(err) {return errmess([1],"ERROR: There is a problem with line "+n+" in the proof you are attempting to import.  The error message concerning it is:<br/><br/>"+err);}
		if(pline.r=='Premise' && problem[0].indexOf(pline.f)<0) {return errmess([1],"ERROR: Your proof contains the following formula as a premise on line "+(pline.n+1)+": "+f+". This is not among the premises in the problem you entered.  Problem is:<br/>"+problem[0].join(',')+ " \u22A2 "+problem[1]);}
		append_line(pline.d,pline.f,pline.t,pline.r,pline.l,pline.n);
		errmess([0],'');
	}
	check_proof();
	document.getElementById('importarea').value = 'Paste a previously exported proof (in plain notation) here and import it by clicking the button. NOTE: you can edit a proof here, but you need to be careful about formatting.  E.g. make sure the proof begins with a "Problem: " line, that formulas contain outermost parentheses, and that there are at least two spaces separating each "column" of the proof, with no double spaces elsewhere.';
	
	// BELOW are some helper functions used by import_proof()
	function testr(str) {
		var t = ['\u2200','\u2203','\u2192','\u2194','\u22A5'];
		for(var i=0;i<t.length;i++) {
			if(str.indexOf(t[i])>=0) {return true;}
		}
		return false;
	}
	function fltr(x) {
		if(x.length==0) {return false;}
		hascontent = false;
		for(var i=0;i<x.length;i++) {
			if(x[i]!=' ') {hascontent = true;}
		}
		return hascontent;
	}
	function writeProof() {
		var table = document.getElementById('drvt');
		for(var i=0;i<cnt.length;i++) {
			table.appendChild(mkRow(i));
		}
	}
	function nope() {
		clearall();
		document.getElementById('drvt').innerHTML = '';
		document.getElementById('goalt').innerHTML = '';
		errmess([1],"ERROR: Something is wrong with the formatting of the proof you entered.  Remember to include outermost parentheses in formulas.");
	}
	function next_line(str) {
		var x = str.indexOf('\n');
		if(x!=(-1)) {
			return [str.substring(0,x),str.substring(x+1)];
		} else {
			return[str,'']
		}
	}
}


// Checks the whole proof
function check_proof() {
	if(cnt.length==0) {return errmess([1],'ERROR: No proof to check');}
	for(var i=0;i<cnt.length;i++) {
		try {
			ckRest(dep[i],frm[i],tr[i],rul[i],lin[i],i);
		} catch(err) {
			return errmess([1,(i+1)],'There is a problem with proof line '+(i+1)+'.  The error message concerning it is:<br /><br />'+err);
		}
	}
	var prems = dep[dep.length-1];
	for(var i=0;i<prems.length;i++) {
		if(rul[prems[i]-1]!='Premise') {
			return errmess([1],'WARNING: the final line of your proof depends on line '+prems[i]+', which is not a Premise!');
		}
	}
	if(frm[frm.length-1]!=gls[0]) {
		return errmess([1],'WARNING: the last line of you proof does not match the conclusion you are aiming for.  Last line should be: '+gls[0]);
	}
	return errmess([0],'Proof checks out!');
}


// Makes an html table row containing the line j of the proof 
function mkRow(j) {
	var tr = document.createElement('tr');
	var tdar = new Array(4);
	var txar = new Array(4);
	var clar = ['depc','cntc','frmc','rulc']
	
	for(var i=0;i<4;i++) {
		tdar[i] = document.createElement('td');
		tdar[i].className = clar[i];
	}
	
	txar[0] = document.createTextNode(dep[j].join(','));
	txar[1] = document.createTextNode('('+cnt[j]+')');
	txar[2] = document.createTextNode(padBC(frm[j]));
	txar[3] = document.createTextNode(lin[j].join(',')+'  '+rul[j]);
	
	
	for(var i=0;i<4;i++) {
		tdar[i].appendChild(txar[i]);
		tr.appendChild(tdar[i]);
	}
	return tr;
}

// Displays error an error message.  The second parameter is the message, and the first 
// is an array, or either one or two elements.  The first element is 0 if there's no
// error, and 1 if there is an error.  The second (optional) element gives the line number
// on which the error occurred.
function errmess(n,mess) {
	var erel = document.getElementById('errord');
	var proof = document.getElementById('drvt');
	if(n[0]) {
		erel.style.border = 'solid 1px #FF0000';
		erel.style.backgroundColor = '#FF9999';
		erel.innerHTML = mess;
		for(var i=0;i<proof.childNodes.length;i++) {
			proof.childNodes[i].style.color = 'black';
		}
		if(n.length>1) {
			proof.childNodes[n[1]-1].style.color = 'red';
		}
	} else {
		erel.style.border = 'solid 1px #B4BAEA';
		erel.style.backgroundColor = '#F0F4FF';
		erel.innerHTML = mess;	
		for(var i=0;i<proof.childNodes.length;i++) {
			proof.childNodes[i].style.color = 'black';
		}
	}
}

// clear the input fields in the appt table
function clear_appt() {
	document.getElementById('dep').value = '';
	document.getElementById('frm').value = '';
	document.getElementById('rul').value = 'Assumption';
	document.getElementById('SI1').value = 'SI(DS1)';
	document.getElementById('SI1').style.display = 'none';
	document.getElementById('lin').value = '';
}

// clear the input fields in the prbt table
function clear_prbt() {
	document.getElementById('premises').value = '';
	document.getElementById('conclusion').value = '';	
}

// clear the input fields in the rept table
function clear_rept() {
	document.getElementById('rl').value = '';
	document.getElementById('depr').value = '';
	document.getElementById('frmr').value = '';
	document.getElementById('linr').value = '';
	document.getElementById('rulr').value = 'Assumption';
	document.getElementById('SI2').value = 'SI(DS1)';	
	document.getElementById('SI2').style.display = 'none';
}

// clears all proof information stored in the globals
function clearall() {
	dep = [];
	cnt = [];
	frm = [];
	tr = [];
	rul = [];
	lin = [];
	gls = [];
}

// returns an array with the line numbers of premises
function get_premises() {
	prems = [];
	for(var i=0;i<cnt.length;i++) {
		if(rul[i]=='Premise') {prems.push(i);}
	}
	return prems;
}

// takes a string (from import_proof) and extracts the premises and conclusion
// returns a two element array: first element an array of premises, second the 
// conclusion string
function get_problem(str) {
	str = str.replace('Problem: ',''); // remove the 'Problem: ' part
	str = str.replace('\u22A2',','); // remove the vdash
	str = str.replace(/ /g,''); // remove whitespace
	str = str.split(','); // split on commas
	str = str.filter(function(x) {return x.length!=0;}); // remove empty elements (you get these if problem is a theorem)
	var tmp = '';
	for(var i=0;i<str.length;i++) { // check if any of the formulas are ill formed
		if(parse(str[i]).length==0) {
			throw "ERROR: the following formula in the Problem line is ill-formed: "+str[i]+". Make sure outermost parentheses are included.";
		}
	}
	return [str.slice(0,str.length-1),str[str.length-1]];
}